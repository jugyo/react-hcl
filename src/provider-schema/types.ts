// Shared types for runtime provider schema lookup and metadata/cache persistence.
import type {
  TerraformAttributeSchema,
  TerraformBlockSchema,
  TerraformNestedBlockSchema,
  TerraformProviderSchemaEntry,
  TerraformSchemaResult,
  TerraformVersionResult,
} from "../cli/init/types/terraform-schema";

export type SchemaContext = {
  blockType: "resource" | "data" | "provider";
  type: string;
};

export type RuntimeSchemaRegistry = {
  resolveBlockSchema(context: SchemaContext): TerraformBlockSchema | null;
};

// Value kinds used by generated declaration schemas.
export type ValueType =
  | "string"
  | "number"
  | "bool"
  | "list"
  | "set"
  | "map"
  | "object"
  | "any";

// Attribute schema after normalization from Terraform provider schema JSON.
export type GeneratedAttributeSchema = {
  valueType: ValueType;
  required?: boolean;
  optional?: boolean;
  computed?: boolean;
  sensitive?: boolean;
};

// Nested block schema after normalization.
export type GeneratedNestedBlockSchema = {
  nestingMode: "single" | "list" | "set";
  minItems?: number;
  maxItems?: number;
  attributes: Record<string, GeneratedAttributeSchema>;
  blocks?: Record<string, GeneratedNestedBlockSchema>;
};

// Resource/data type schema after normalization.
export type GeneratedTypeSchema = {
  kind: "resource" | "data";
  type: string;
  attributes: Record<string, GeneratedAttributeSchema>;
  blocks: Record<string, GeneratedNestedBlockSchema>;
};

// Canonical provider schema used by runtime validation and type generation.
export type NormalizedProviderSchema = {
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  generatedAt: string;
  resourceSchemas: Record<string, GeneratedTypeSchema>;
  dataSchemas: Record<string, GeneratedTypeSchema>;
  providerSchema: GeneratedTypeSchema;
};

// Re-export raw Terraform CLI schema types used in provider-schema core.
export type {
  TerraformAttributeSchema,
  TerraformBlockSchema,
  TerraformNestedBlockSchema,
  TerraformProviderSchemaEntry,
  TerraformSchemaResult,
  TerraformVersionResult,
};

// Active schema metadata entry for a provider source.
export type ActiveProviderSchemaMetadataEntry = {
  path: string;
  terraformVersion: string;
  providerVersion: string;
  updatedAt: string;
};

// Persistent metadata file format under `.react-hcl/metadata.json`.
export type RuntimeMetadata = {
  formatVersion: 1;
  activeProviderSchemas: Record<string, ActiveProviderSchemaMetadataEntry>;
};

// Cache file payload for raw provider schema fetched by init.
export type CachePayload = {
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  fetchedAt: string;
  schema: TerraformProviderSchemaEntry;
};

// Resolver return payload consumed by init command flow.
export type ResolvedProviderSchema = {
  cachePayload: CachePayload;
  schemaFilePath: string;
};
