/**
 * Terraform component — produces a TerraformBlock for the Block[] IR pipeline.
 *
 * All props become HCL attributes. Supports `children` as raw HCL text (innerText)
 * for nested blocks like `backend "s3" { ... }` that need verbatim HCL.
 *
 * Usage in TSX:
 *   <Terraform required_version=">= 1.0" />
 *   → terraform { required_version = ">= 1.0" }
 */
import type { TerraformBlock } from "../blocks";
import { block } from "../hcl-serializer";

export function Terraform(props: {
  children?: string | string[];
  [key: string]: any;
}): TerraformBlock {
  const { children, ...attributes } = props;
  const terraformAttributes = { ...attributes };
  const requiredProviders = terraformAttributes.required_providers;
  if (
    typeof requiredProviders === "object" &&
    requiredProviders !== null &&
    !Array.isArray(requiredProviders)
  ) {
    terraformAttributes.required_providers = block(requiredProviders);
  }
  const rawChildren = Array.isArray(children) ? children[0] : children;
  const hasInnerText = typeof rawChildren === "string";
  return {
    blockType: "terraform",
    attributes: hasInnerText ? {} : terraformAttributes,
    ...(hasInnerText ? { innerText: rawChildren } : {}),
  };
}
