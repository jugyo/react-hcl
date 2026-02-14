/**
 * Resource component — produces a ResourceBlock for the Block[] IR pipeline.
 *
 * Extracts `type` and `name` as block labels, passes remaining props as HCL attributes.
 * Special props `ref` and `children` are excluded from attributes:
 *   - `ref`: reserved for useRef (Step 8)
 *   - `children`: if string or function returning string, stored as `innerText`
 *     for raw HCL body output (Step 10)
 *
 * Usage in TSX:
 *   <Resource type="aws_vpc" name="main" cidr_block="10.0.0.0/16" />
 *   → resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }
 */
import type { ResourceBlock } from "../blocks";

export function Resource(props: {
  type: string;
  name: string;
  ref?: any;
  children?: string | (() => string);
  [key: string]: any;
}): ResourceBlock {
  const { type, name, ref, children, ...attributes } = props;
  const text = typeof children === "function" ? children() : children;
  return {
    blockType: "resource",
    type,
    name,
    attributes,
    ...(typeof text === "string" ? { innerText: text } : {}),
  };
}
