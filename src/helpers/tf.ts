/**
 * Terraform expression helpers — provides shorthand functions for referencing
 * Terraform variables and locals inside JSX attributes.
 *
 * These helpers return RawHCL values, which the HCL serializer outputs without
 * quotes. This allows JSX attributes to contain Terraform expressions like
 * `var.environment` or `local.common_tags` directly.
 *
 * Usage in TSX:
 *   <Resource type="aws_instance" name="web"
 *     instance_type={tf.var("instance_type")}
 *     tags={tf.local("common_tags")}
 *   />
 *
 * Output:
 *   resource "aws_instance" "web" {
 *     instance_type = var.instance_type
 *     tags          = local.common_tags
 *   }
 */
import { type RawHCL, raw } from "../hcl-serializer";

export const tf = {
  /** tf.var("name") → var.name */
  var(name: string): RawHCL {
    return raw(`var.${name}`);
  },

  /** tf.local("name") → local.name */
  local(name: string): RawHCL {
    return raw(`local.${name}`);
  },
};
