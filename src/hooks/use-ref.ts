/**
 * useRef hook — creates a Proxy-based reference object for cross-resource references.
 *
 * In Terraform, resources often reference each other:
 *   vpc_id = aws_vpc.main.id
 *
 * useRef() returns a Proxy that:
 *   1. Stores metadata (__refMeta) set by Resource/DataSource/Provider components
 *   2. Returns RawHCL values on property access (e.g. ref.id → raw("aws_vpc.main.id"))
 *   3. Supports nested access (ref.outputs.vpc_id → raw("data.terraform_remote_state.x.outputs.vpc_id"))
 *   4. Provides special __dependsOnValue (type.name format for depends_on)
 *   5. Provides special __providerValue (type.alias format for provider references)
 *
 * Stateful hook store:
 *   useRef() uses a global hookStore to return the same proxy across multiple render passes.
 *   resetHookState(clear?) resets the hook index (and optionally clears the store).
 *   This enables 2-pass rendering: pass 1 collects ref metadata, pass 2 resolves references.
 *
 * The ref lifecycle (inside a component):
 *   function App() {
 *     const vpcRef = useRef();
 *     return (
 *       <>
 *         <Resource ref={vpcRef} type="aws_vpc" name="main" />  // registers metadata
 *         <Resource vpc_id={vpcRef.id} />  // lazy RawHCL, resolved at serialization
 *       </>
 *     );
 *   }
 */
import type { RawHCL } from "../hcl-serializer";

const RAW_HCL_SYMBOL = Symbol.for("react-terraform:RawHCL");

/**
 * Metadata stored on a ref after a component registers it.
 * Set by Resource, DataSource, or Provider when they receive a `ref` prop.
 */
export type RefMeta = {
  blockType: "resource" | "data" | "provider";
  type: string;
  name: string;
  alias?: string;
};

/**
 * The Proxy-based ref object returned by useRef().
 * Property access returns RawHCL or nested RefProxy for chained access.
 */
export type RefProxy = {
  __refMeta?: RefMeta;
  __dependsOnValue: RawHCL;
  __providerValue: RawHCL;
  [key: string]: any;
};

// --- Hook store for stateful behavior across render passes ---
// Uses globalThis to share state across module instances (e.g., esbuild-bundled code
// inlines its own copy of useRef, but renderer.ts calls resetHookState from the source copy).

const HOOK_KEY = Symbol.for("react-terraform:hookState");

type HookState = {
  hookIndex: number;
  hookStore: RefProxy[];
};

function getState(): HookState {
  if (!(globalThis as any)[HOOK_KEY]) {
    (globalThis as any)[HOOK_KEY] = { hookIndex: 0, hookStore: [] };
  }
  return (globalThis as any)[HOOK_KEY];
}

/**
 * Resets the hook state between render passes.
 * @param clear If true, clears the store entirely (used before pass 1).
 *              If false/omitted, only resets the index (used before pass 2).
 */
export function resetHookState(clear?: boolean): void {
  const state = getState();
  state.hookIndex = 0;
  if (clear) {
    state.hookStore = [];
  }
}

/**
 * Returns the current hook store (for validation after rendering).
 */
export function getHookStore(): RefProxy[] {
  return getState().hookStore;
}

/**
 * Builds the Terraform reference prefix from ref metadata.
 *
 * - resource "aws_vpc" "main"  → "aws_vpc.main"
 * - data "aws_ami" "latest"    → "data.aws_ami.latest"
 */
function buildPrefix(meta: RefMeta): string {
  if (meta.blockType === "data") {
    return `data.${meta.type}.${meta.name}`;
  }
  return `${meta.type}.${meta.name}`;
}

const UNRESOLVED_PLACEHOLDER = "__UNRESOLVED_REF__";

/**
 * Creates a lazy RawHCL object that resolves its value at read time.
 *
 * The `value` property is a getter that calls `resolvePath()` when accessed.
 * This allows the RawHCL to be created before ref metadata is set, and
 * resolved later when the HCL serializer reads the value.
 *
 * Also supports further property access for chaining (ref.outputs.vpc_id).
 */
function createLazyRawHCL(resolvePath: () => string): any {
  const base = {
    [RAW_HCL_SYMBOL]: true,
    get value() {
      return resolvePath();
    },
    toString() {
      return resolvePath();
    },
  };

  return new Proxy(base, {
    get(target, prop: string | symbol) {
      if (typeof prop === "symbol") {
        return (target as any)[prop];
      }
      if (prop === "value" || prop === "toString") {
        return (target as any)[prop];
      }
      // Chain further: ref.outputs.vpc_id
      return createLazyRawHCL(() => `${resolvePath()}.${prop}`);
    },
  });
}

/**
 * Creates a ref Proxy object for tracking Terraform resource references.
 *
 * Stateful: returns the same proxy on repeated calls within a render cycle
 * (identified by hookIndex). This enables 2-pass rendering where pass 1
 * collects metadata and pass 2 resolves references using the same proxies.
 *
 * Usage (inside a component function):
 *   function App() {
 *     const vpcRef = useRef();
 *     return (
 *       <>
 *         <Resource type="aws_vpc" name="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
 *         <Resource type="aws_subnet" name="sub" vpc_id={vpcRef.id} />
 *       </>
 *     );
 *   }
 */
export function useRef(): RefProxy {
  const state = getState();
  const idx = state.hookIndex++;

  // Return existing proxy from store if available (pass 2 reuses pass 1 proxies)
  if (idx < state.hookStore.length) {
    return state.hookStore[idx];
  }

  let meta: RefMeta | undefined;

  const getMeta = (): RefMeta => {
    if (!meta) {
      // Return placeholder during pass 1 (metadata not yet set)
      return {
        blockType: "resource",
        type: UNRESOLVED_PLACEHOLDER,
        name: UNRESOLVED_PLACEHOLDER,
      };
    }
    return meta;
  };

  const proxy: RefProxy = new Proxy({} as any, {
    get(_target, prop: string | symbol) {
      if (typeof prop === "symbol") return undefined;

      // Internal metadata accessor
      if (prop === "__refMeta") {
        return meta;
      }

      // depends_on value: type.name (or data.type.name) without attribute suffix
      if (prop === "__dependsOnValue") {
        return createLazyRawHCL(() => buildPrefix(getMeta()));
      }

      // provider value: type.alias format
      if (prop === "__providerValue") {
        return createLazyRawHCL(() => {
          const m = getMeta();
          return `${m.type}.${m.alias || m.name}`;
        });
      }

      // Regular property access — return lazy chainable RawHCL
      return createLazyRawHCL(() => `${buildPrefix(getMeta())}.${prop}`);
    },

    set(_target, prop: string | symbol, value: any) {
      if (prop === "__refMeta") {
        meta = value;
        return true;
      }
      return true;
    },
  });

  state.hookStore.push(proxy);
  return proxy;
}
