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

export function Terraform(props: {
  children?: string | string[];
  [key: string]: any;
}): TerraformBlock {
  const { children, ...attributes } = props;
  const rawChildren = Array.isArray(children) ? children[0] : children;
  const hasInnerText = typeof rawChildren === "string";
  return {
    blockType: "terraform",
    attributes: hasInnerText ? {} : attributes,
    ...(hasInnerText ? { innerText: rawChildren } : {}),
  };
}
