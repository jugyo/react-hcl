/**
 * DataSource component — produces a DataSourceBlock for the Block[] IR pipeline.
 *
 * Extracts `type` and `name` as block labels, passes remaining props as HCL attributes.
 * Special props `ref` and `children` are excluded from attributes:
 *   - `ref`: reserved for useRef (Step 8)
 *   - `children`: if string or function returning string, stored as `innerText`
 *
 * Usage in TSX:
 *   <DataSource type="aws_ami" name="latest" most_recent={true} />
 *   → data "aws_ami" "latest" { most_recent = true }
 */
import type { DataSourceBlock } from "../blocks";

export function DataSource(props: {
  type: string;
  name: string;
  ref?: any;
  children?: string | (() => string);
  [key: string]: any;
}): DataSourceBlock {
  const { type, name, ref, children, ...attributes } = props;
  const text = typeof children === "function" ? children() : children;
  return {
    blockType: "data",
    type,
    name,
    attributes,
    ...(typeof text === "string" ? { innerText: text } : {}),
  };
}
