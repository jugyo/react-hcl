/**
 * Variable component — produces a VariableBlock for the Block[] IR pipeline.
 *
 * Extracts `name` as the block label.
 * The `type` prop is automatically wrapped with raw() so that HCL outputs `type = string`
 * (unquoted) rather than `type = "string"` (quoted). This lets users write naturally:
 *   <Variable name="env" type="string" />
 *
 * Usage in TSX:
 *   <Variable name="environment" type="string" default="dev" />
 *   → variable "environment" { type = string\n  default = "dev" }
 */
import type { VariableBlock } from "../blocks";
import { raw } from "../hcl-serializer";

export function Variable(props: {
  name: string;
  type?: string;
  default?: any;
  description?: string;
  sensitive?: boolean;
  [key: string]: any;
}): VariableBlock {
  const { name, type, children, ...rest } = props;
  const attributes = type ? { type: raw(type), ...rest } : rest;
  return { blockType: "variable", name, attributes };
}
