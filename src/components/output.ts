/**
 * Output component — produces an OutputBlock for the Block[] IR pipeline.
 *
 * Extracts `name` as the block label, passes remaining props (value, description, sensitive, etc.)
 * as HCL attributes.
 *
 * Usage in TSX:
 *   <Output name="vpc_id" value={vpcRef.id} />
 *   → output "vpc_id" { value = aws_vpc.main.id }
 */
import type { OutputBlock } from "../blocks";
import type { OutputProps } from "../component-props/output-props";

export function Output(props: OutputProps): OutputBlock {
  const { name, children, ...attributes } = props;
  return { blockType: "output", name, attributes };
}
