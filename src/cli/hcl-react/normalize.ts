export type ReverseBlockType =
  | "resource"
  | "data"
  | "module"
  | "provider"
  | "variable"
  | "output"
  | "locals"
  | "terraform";

export interface ReverseBlock {
  blockType: ReverseBlockType;
  type?: string;
  label?: string;
  attributes: Record<string, any>;
}

function asObject(value: unknown, errorMessage: string): Record<string, any> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(errorMessage);
  }
  return value as Record<string, any>;
}

function asBlockList(
  value: unknown,
  errorMessage: string,
): Record<string, any>[] {
  if (!Array.isArray(value)) {
    throw new Error(errorMessage);
  }
  return value.map((item) => asObject(item, errorMessage));
}

export function normalizeHclDocument(
  document: Record<string, any>,
): ReverseBlock[] {
  const blocks: ReverseBlock[] = [];

  for (const [topLevelKey, topLevelValue] of Object.entries(document)) {
    if (topLevelKey === "resource" || topLevelKey === "data") {
      const byType = asObject(
        topLevelValue,
        `Invalid ${topLevelKey} structure.`,
      );
      for (const [resourceType, byLabelValue] of Object.entries(byType)) {
        const byLabel = asObject(
          byLabelValue,
          `Invalid ${topLevelKey}.${resourceType} structure.`,
        );
        for (const [label, instancesValue] of Object.entries(byLabel)) {
          const instances = asBlockList(
            instancesValue,
            `Invalid ${topLevelKey}.${resourceType}.${label} structure.`,
          );
          for (const attrs of instances) {
            blocks.push({
              blockType: topLevelKey,
              type: resourceType,
              label,
              attributes: attrs,
            });
          }
        }
      }
      continue;
    }

    if (
      topLevelKey === "module" ||
      topLevelKey === "variable" ||
      topLevelKey === "output" ||
      topLevelKey === "provider"
    ) {
      const byLabel = asObject(
        topLevelValue,
        `Invalid ${topLevelKey} structure.`,
      );
      for (const [labelOrType, instancesValue] of Object.entries(byLabel)) {
        const instances = asBlockList(
          instancesValue,
          `Invalid ${topLevelKey}.${labelOrType} structure.`,
        );
        for (const attrs of instances) {
          blocks.push({
            blockType: topLevelKey,
            type: topLevelKey === "provider" ? labelOrType : undefined,
            label: topLevelKey === "provider" ? undefined : labelOrType,
            attributes: attrs,
          });
        }
      }
      continue;
    }

    if (topLevelKey === "locals" || topLevelKey === "terraform") {
      const instances = asBlockList(
        topLevelValue,
        `Invalid ${topLevelKey} structure.`,
      );
      for (const attrs of instances) {
        blocks.push({
          blockType: topLevelKey,
          attributes: attrs,
        });
      }
      continue;
    }

    throw new Error(`Unsupported top-level HCL block: ${topLevelKey}`);
  }

  return blocks;
}
