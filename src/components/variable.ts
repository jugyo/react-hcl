/**
 * Variable component — produces a VariableBlock for the Block[] IR pipeline.
 *
 * Extracts `label` as the block label.
 * The `type` prop is automatically wrapped with raw() so that HCL outputs `type = string`
 * (unquoted) rather than `type = "string"` (quoted). This lets users write naturally:
 *   <Variable label="env" type="string" />
 *
 * Usage in TSX:
 *   <Variable label="environment" type="string" default="dev" />
 *   → variable "environment" { type = string\n  default = "dev" }
 */
import type { VariableBlock } from "../blocks";
import { raw } from "../hcl-serializer";

export function Variable(props: {
  label: string;
  type?: string;
  default?: any;
  description?: string;
  sensitive?: boolean;
  [key: string]: any;
}): VariableBlock {
  const { label, type, children, ...rest } = props;
  const attributes = type ? { type: raw(type), ...rest } : rest;
  return { blockType: "variable", name: label, attributes };
}
