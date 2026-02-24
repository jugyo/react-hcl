// Barrel export for init-related types.
// Each domain-specific type group lives under `./types/*`.
export type {
  ActiveProviderSchemaMetadataEntry,
  CachePayload,
  GeneratedAttributeSchema,
  GeneratedNestedBlockSchema,
  GeneratedTypeSchema,
  NormalizedProviderSchema,
  ResolvedProviderSchema,
  RuntimeMetadata,
  ValueType,
} from "../../provider-schema/types";
export type { GeneratedOutputFile } from "./types/output";
export type {
  TerraformAttributeSchema,
  TerraformBlockSchema,
  TerraformNestedBlockSchema,
  TerraformProviderSchemaEntry,
  TerraformSchemaResult,
  TerraformVersionResult,
} from "./types/terraform-schema";
