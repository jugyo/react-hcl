// Barrel export for init-related types.
// Each domain-specific type group lives under `./types/*`.
export type {
  GeneratedAttributeSchema,
  GeneratedNestedBlockSchema,
  GeneratedTypeSchema,
  NormalizedProviderSchema,
  ValueType,
} from "../../provider-schema/types";
export type {
  TerraformAttributeSchema,
  TerraformBlockSchema,
  TerraformNestedBlockSchema,
  TerraformProviderSchemaEntry,
  TerraformSchemaResult,
  TerraformVersionResult,
} from "./types/terraform-schema";
export type {
  ActiveProviderSchemaMetadataEntry,
  CachePayload,
  ResolvedProviderSchema,
  RuntimeMetadata,
} from "../../provider-schema/types";
export type { GeneratedOutputFile } from "./types/output";
