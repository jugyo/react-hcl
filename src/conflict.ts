/**
 * Conflict detection for Terraform blocks.
 *
 * Validates that the collected Block[] does not contain duplicates that would
 * produce invalid Terraform configuration. This runs after render() and before
 * generate() in the CLI pipeline.
 *
 * Conflict rules (from design doc §5.2):
 *   - Resource: duplicate type + name → error
 *   - DataSource: duplicate type + name → error
 *   - Resource vs DataSource with same type + name → allowed
 *   - Variable: duplicate name → error
 *   - Output: duplicate name → error
 *   - Locals: multiple blocks → allowed
 *   - Provider: same type with different alias → allowed; same type + alias → error
 *   - Terraform: more than one block → error
 *   - Module: duplicate name → error
 */

import type { Block } from "./blocks";

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Detect conflicts in a list of blocks and throw ConflictError if any are found.
 *
 * Checks each block type independently. For provider blocks, alias is extracted
 * from attributes (absence of alias is treated as empty string for grouping).
 */
export function detectConflicts(blocks: Block[]): void {
  const resourceKeys = new Set<string>();
  const dataKeys = new Set<string>();
  const variableNames = new Set<string>();
  const outputNames = new Set<string>();
  const providerKeys = new Set<string>();
  const moduleNames = new Set<string>();
  let terraformCount = 0;

  for (const block of blocks) {
    switch (block.blockType) {
      case "resource": {
        const key = `${block.type}:${block.name}`;
        if (resourceKeys.has(key)) {
          throw new ConflictError(
            `Conflict: duplicate resource "${block.type}" "${block.name}"`,
          );
        }
        resourceKeys.add(key);
        break;
      }
      case "data": {
        const key = `${block.type}:${block.name}`;
        if (dataKeys.has(key)) {
          throw new ConflictError(
            `Conflict: duplicate data source "${block.type}" "${block.name}"`,
          );
        }
        dataKeys.add(key);
        break;
      }
      case "variable": {
        if (variableNames.has(block.name)) {
          throw new ConflictError(
            `Conflict: duplicate variable "${block.name}"`,
          );
        }
        variableNames.add(block.name);
        break;
      }
      case "output": {
        if (outputNames.has(block.name)) {
          throw new ConflictError(`Conflict: duplicate output "${block.name}"`);
        }
        outputNames.add(block.name);
        break;
      }
      case "provider": {
        const alias = (block.attributes.alias as string) ?? "";
        const key = `${block.type}:${alias}`;
        if (providerKeys.has(key)) {
          const msg = alias
            ? `Conflict: duplicate provider "${block.type}" with alias "${alias}"`
            : `Conflict: duplicate provider "${block.type}"`;
          throw new ConflictError(msg);
        }
        providerKeys.add(key);
        break;
      }
      case "terraform": {
        terraformCount++;
        if (terraformCount > 1) {
          throw new ConflictError(
            "Conflict: multiple terraform blocks defined",
          );
        }
        break;
      }
      case "module": {
        if (moduleNames.has(block.name)) {
          throw new ConflictError(`Conflict: duplicate module "${block.name}"`);
        }
        moduleNames.add(block.name);
        break;
      }
      case "locals":
        // Multiple locals blocks are allowed
        break;
    }
  }
}
