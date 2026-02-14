import type { JSXElement } from "./jsx-runtime";
import type { Block } from "./blocks";

function isBlock(value: unknown): value is Block {
  return value != null && typeof value === "object" && "blockType" in value;
}

export function render(element: JSXElement | JSXElement[] | string | null): Block[] {
  if (element == null) return [];
  if (typeof element === "string" || typeof element === "function") return [];
  if (Array.isArray(element)) return element.flatMap(e => render(e));
  if (isBlock(element)) return [element];
  // Function component — call it and render the result
  if (typeof element.type === "function") {
    const result = element.type({ ...element.props, children: element.children });
    return render(result);
  }
  // Fragment or unknown string type — render children
  return element.children.flatMap((child: any) => render(child));
}
