/**
 * Resource component — stub implementation for Step 2 PoC.
 *
 * Currently returns a simple string representation of a Terraform resource block.
 * In later steps, this will be replaced with a proper implementation that:
 *   - Extracts `type`, `name`, and remaining props as attributes
 *   - Handles children (for innerText / nested block content)
 *   - Returns a ResourceBlock object for the Block[] IR pipeline
 *
 * Usage in TSX:
 *   <Resource type="aws_vpc" name="main" cidr_block="10.0.0.0/16" />
 *   → resource "aws_vpc" "main" {}  (stub — attributes not yet rendered)
 */
export function Resource(props: { type: string; name: string; [key: string]: any }): string {
  return `resource "${props.type}" "${props.name}" {}`;
}
