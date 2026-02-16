import type { Block } from "./blocks";
import { getHookStore, resetHookState } from "./hooks/use-ref";
import type { JSXElement } from "./jsx-runtime";

function isBlock(value: unknown): value is Block {
  return value != null && typeof value === "object" && "blockType" in value;
}

function renderTree(
  element: JSXElement | JSXElement[] | string | null,
): Block[] {
  if (element == null) return [];
  if (typeof element === "string" || typeof element === "function") return [];
  if (Array.isArray(element)) return element.flatMap((e) => renderTree(e));
  if (isBlock(element)) return [element];
  // Function component — call it and render the result
  if (typeof element.type === "function") {
    const result = element.type({
      ...element.props,
      children: element.children,
    });
    return renderTree(result);
  }
  // Fragment or unknown string type — render children
  return element.children.flatMap((child: any) => renderTree(child));
}

type Renderable = JSXElement | JSXElement[] | string | null;
type RootRenderable = Renderable | (() => Renderable);

/**
 * 2-pass rendering:
 *   Pass 1: Clear hook store, render tree to collect ref metadata (result discarded).
 *   Pass 2: Reset hook index only (reuse proxies with metadata), render tree (result kept).
 *   Validation: Check that all refs in hookStore have __refMeta set.
 */
export function render(element: RootRenderable): Block[] {
  const resolveRoot = (): Renderable =>
    typeof element === "function" ? element() : element;
  // Pass 1: collect ref metadata
  resetHookState(true);
  renderTree(resolveRoot());

  // Pass 2: resolve references (same proxies, now with metadata)
  resetHookState();
  const blocks = renderTree(resolveRoot());

  // Validate: all refs must have metadata after 2 passes
  const store = getHookStore();
  for (const proxy of store) {
    if (!proxy.__refMeta) {
      throw new Error(
        "Ref is used but was never registered with a component.\n" +
          "Make sure every useRef() ref is passed to a Resource/Data/Provider/Module component.",
      );
    }
  }

  return blocks;
}
