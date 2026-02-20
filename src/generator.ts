/**
 * HCL code generator — converts Block[] intermediate representation into a Terraform .tf file string.
 *
 * This module is the final stage of the pipeline:
 *   JSX components → Block[] (IR) → generate() → HCL string
 *
 * Output formatting rules:
 *   - Each block is rendered as: <header> {\n<body>\n}
 *   - Blocks are separated by a single blank line (\n\n)
 *   - The output always ends with a trailing newline
 *   - If a block has `innerText`, it is used as-is as the body (no attribute serialization)
 *   - Otherwise, attributes are serialized via serializeHCLAttributes() from hcl-serializer.ts
 *   - Empty attribute blocks produce: <header> {\n}
 */

import type { Block } from "./blocks";
import { serializeHCLAttributes } from "./hcl-serializer";
import type { SerializationContext } from "./provider-schema";

/**
 * Produces the HCL block header string based on block type.
 *
 * Header formats per block type:
 *   resource  → resource "<type>" "<name>"    (two labels)
 *   data      → data "<type>" "<name>"        (two labels)
 *   variable  → variable "<name>"             (one label)
 *   output    → output "<name>"               (one label)
 *   locals    → locals                        (no labels)
 *   provider  → provider "<type>"             (one label)
 *   terraform → terraform                     (no labels)
 *   module    → module "<name>"               (one label)
 */
function blockHeader(block: Block): string {
  switch (block.blockType) {
    case "resource":
      return `resource "${block.type}" "${block.name}"`;
    case "data":
      return `data "${block.type}" "${block.name}"`;
    case "variable":
      return `variable "${block.name}"`;
    case "output":
      return `output "${block.name}"`;
    case "locals":
      return "locals";
    case "provider":
      return `provider "${block.type}"`;
    case "terraform":
      return "terraform";
    case "module":
      return `module "${block.name}"`;
  }
}

/**
 * Type guard to check if a block carries an innerText field.
 * ResourceBlock, DataBlock, TerraformBlock, and ModuleBlock can have innerText.
 */
function hasInnerText(block: Block): block is Block & { innerText: string } {
  return "innerText" in block && typeof block.innerText === "string";
}

/**
 * Renders a single Block into its HCL string representation.
 *
 * Rendering strategy:
 *   1. If innerText is present → output it as-is as the block body
 *   2. Otherwise → serialize attributes via serializeHCLAttributes()
 *   3. If attributes are empty (body === "") → output empty braces
 */
function renderBlock(block: Block): string {
  const header = blockHeader(block);
  if (hasInnerText(block)) {
    return `${header} {\n${block.innerText}\n}`;
  }
  let context: SerializationContext | undefined;
  if (block.blockType === "resource") {
    context = { blockType: "resource", type: block.type };
  } else if (block.blockType === "data") {
    context = { blockType: "data", type: block.type };
  }
  const body = serializeHCLAttributes(block.attributes, 2, context);
  if (body === "") {
    return `${header} {\n}`;
  }
  return `${header} {\n${body}\n}`;
}

/**
 * Generates a complete Terraform .tf file string from an array of Block objects.
 *
 * @param blocks - Array of Block IR objects to render
 * @returns A string of valid HCL with blocks separated by blank lines, ending with a newline
 *
 * Example:
 *   generate([
 *     { blockType: "resource", type: "aws_vpc", name: "main", attributes: { cidr_block: "10.0.0.0/16" } },
 *     { blockType: "resource", type: "aws_subnet", name: "public", attributes: { cidr_block: "10.0.1.0/24" } },
 *   ])
 *   →
 *   resource "aws_vpc" "main" {
 *     cidr_block = "10.0.0.0/16"
 *   }
 *
 *   resource "aws_subnet" "public" {
 *     cidr_block = "10.0.1.0/24"
 *   }
 */
export function generate(blocks: Block[]): string {
  return `${blocks.map(renderBlock).join("\n\n")}\n`;
}
