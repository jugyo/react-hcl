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
 * IMPORTANT: Property access is lazy. When JSX is evaluated, ref.id is accessed
 * BEFORE the component sets __refMeta. The returned RawHCL uses getters so that
 * the actual value string is computed at serialization time, when metadata is available.
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
 *
 * The returned proxy intercepts property access:
 *   - __refMeta: get/set metadata (used internally by components)
 *   - __dependsOnValue: lazy raw("type.name") for depends_on arrays
 *   - __providerValue: lazy raw("type.alias") for provider attribute
 *   - any other prop: lazy chainable RawHCL (supports ref.id and ref.outputs.vpc_id)
 */
export function useRef(): RefProxy {
  let meta: RefMeta | undefined;

  const getMeta = (): RefMeta => {
    if (!meta) {
      throw new Error(
        "Ref is used before it was registered with a component.\n" +
          "Make sure the ref is passed to a Resource/DataSource/Provider component.",
      );
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

  return proxy;
}
