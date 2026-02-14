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
  children?: string | (() => string);
  [key: string]: any;
}): TerraformBlock {
  const { children, ...attributes } = props;
  const text = typeof children === "function" ? children() : children;
  return {
    blockType: "terraform",
    attributes,
    ...(typeof text === "string" ? { innerText: text } : {}),
  };
}
