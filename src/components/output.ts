/**
 * Output component — produces an OutputBlock for the Block[] IR pipeline.
 *
 * Extracts `name` as the block label, passes remaining props (value, description, sensitive, etc.)
 * as HCL attributes.
 *
 * Usage in TSX:
 *   <Output name="vpc_id" value="aws_vpc.main.id" />
 *   → output "vpc_id" { value = "aws_vpc.main.id" }
 */
import type { OutputBlock } from "../blocks";

export function Output(props: {
  name: string;
  value: any;
  description?: string;
  sensitive?: boolean;
  [key: string]: any;
}): OutputBlock {
  const { name, children, ...attributes } = props;
  return { blockType: "output", name, attributes };
}
