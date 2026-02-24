// Normalization from raw Terraform provider schema JSON into canonical internal schema.
import type {
  TerraformAttributeSchema,
  TerraformBlockSchema,
  TerraformProviderSchemaEntry,
} from "../cli/init/types/terraform-schema";
import type {
  GeneratedAttributeSchema,
  GeneratedNestedBlockSchema,
  GeneratedTypeSchema,
  NormalizedProviderSchema,
  ValueType,
} from "./types";

function sortKeys<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function inferValueType(terraformType: unknown): ValueType {
  if (terraformType === "string") return "string";
  if (terraformType === "number") return "number";
  if (terraformType === "bool") return "bool";

  if (Array.isArray(terraformType) && terraformType.length > 0) {
    const head = terraformType[0];
    if (head === "list" || head === "tuple") return "list";
    if (head === "set") return "set";
    if (head === "map") return "map";
    if (head === "object") return "object";
    if (head === "dynamic") return "any";
  }

  return "any";
}

function normalizeAttributeSchema(
  terraformAttribute: TerraformAttributeSchema,
): GeneratedAttributeSchema {
  const normalized: GeneratedAttributeSchema = {
    valueType: inferValueType(terraformAttribute.type),
  };

  if (terraformAttribute.required === true) normalized.required = true;
  if (terraformAttribute.optional === true) normalized.optional = true;
  if (terraformAttribute.computed === true) normalized.computed = true;
  if (terraformAttribute.sensitive === true) normalized.sensitive = true;

  return normalized;
}

function normalizeBlockSchema(
  terraformBlock: TerraformBlockSchema | undefined,
): {
  attributes: Record<string, GeneratedAttributeSchema>;
  blocks: Record<string, GeneratedNestedBlockSchema>;
} {
  const rawAttributes = terraformBlock?.attributes ?? {};
  const normalizedAttributes = sortKeys(
    Object.fromEntries(
      Object.entries(rawAttributes).map(([name, schema]) => [
        name,
        normalizeAttributeSchema(schema),
      ]),
    ),
  );

  const rawBlocks = terraformBlock?.block_types ?? {};
  const normalizedBlocks = sortKeys(
    Object.fromEntries(
      Object.entries(rawBlocks)
        // Keep only nested block modes currently supported by react-hcl output typing.
        .filter(
          ([, nested]) =>
            nested.nesting_mode === "single" ||
            nested.nesting_mode === "list" ||
            nested.nesting_mode === "set",
        )
        .map(([name, nested]) => {
          const nestedNormalized = normalizeBlockSchema(nested.block);
          const normalized: GeneratedNestedBlockSchema = {
            nestingMode: nested.nesting_mode as "single" | "list" | "set",
            attributes: nestedNormalized.attributes,
          };

          if (nested.min_items !== undefined)
            normalized.minItems = nested.min_items;
          if (nested.max_items !== undefined)
            normalized.maxItems = nested.max_items;
          if (Object.keys(nestedNormalized.blocks).length > 0) {
            normalized.blocks = nestedNormalized.blocks;
          }

          return [name, normalized];
        }),
    ),
  );

  return {
    attributes: normalizedAttributes,
    blocks: normalizedBlocks,
  };
}

function normalizeTypeSchema(
  kind: "resource" | "data",
  type: string,
  terraformBlock: TerraformBlockSchema | undefined,
): GeneratedTypeSchema {
  const normalized = normalizeBlockSchema(terraformBlock);
  return {
    kind,
    type,
    attributes: normalized.attributes,
    blocks: normalized.blocks,
  };
}

export function normalizeProviderSchema(options: {
  providerSource: string;
  providerVersion: string;
  schemaEntry: TerraformProviderSchemaEntry;
  terraformVersion: string;
  generatedAt: string;
}): NormalizedProviderSchema {
  const {
    providerSource,
    providerVersion,
    schemaEntry,
    terraformVersion,
    generatedAt,
  } = options;

  const resourceSchemas = sortKeys(
    Object.fromEntries(
      Object.entries(schemaEntry.resource_schemas ?? {}).map(
        ([type, entry]) => [
          type,
          normalizeTypeSchema("resource", type, entry.block),
        ],
      ),
    ),
  );

  const dataSchemas = sortKeys(
    Object.fromEntries(
      Object.entries(schemaEntry.data_source_schemas ?? {}).map(
        ([type, entry]) => [type, normalizeTypeSchema("data", type, entry.block)],
      ),
    ),
  );

  const providerSchema = normalizeTypeSchema(
    "data",
    "aws",
    schemaEntry.provider?.block,
  );

  return {
    providerSource,
    providerVersion,
    terraformVersion,
    generatedAt,
    resourceSchemas,
    dataSchemas,
    providerSchema,
  };
}
