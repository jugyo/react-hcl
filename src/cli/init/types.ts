export type ValueType =
  | "string"
  | "number"
  | "bool"
  | "list"
  | "set"
  | "map"
  | "object"
  | "any";

export type GeneratedAttributeSchema = {
  valueType: ValueType;
  required?: boolean;
  optional?: boolean;
  computed?: boolean;
  sensitive?: boolean;
};

export type GeneratedNestedBlockSchema = {
  nestingMode: "single" | "list" | "set";
  minItems?: number;
  maxItems?: number;
  attributes: Record<string, GeneratedAttributeSchema>;
  blocks?: Record<string, GeneratedNestedBlockSchema>;
};

export type GeneratedTypeSchema = {
  kind: "resource" | "data";
  type: string;
  attributes: Record<string, GeneratedAttributeSchema>;
  blocks: Record<string, GeneratedNestedBlockSchema>;
};

export type NormalizedProviderSchema = {
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  generatedAt: string;
  resourceSchemas: Record<string, GeneratedTypeSchema>;
  dataSchemas: Record<string, GeneratedTypeSchema>;
  providerSchema: GeneratedTypeSchema;
};

export type TerraformAttributeSchema = {
  type?: unknown;
  required?: boolean;
  optional?: boolean;
  computed?: boolean;
  sensitive?: boolean;
};

export type TerraformBlockSchema = {
  attributes?: Record<string, TerraformAttributeSchema>;
  block_types?: Record<string, TerraformNestedBlockSchema>;
};

export type TerraformNestedBlockSchema = {
  nesting_mode: "single" | "list" | "set" | string;
  min_items?: number;
  max_items?: number;
  block: TerraformBlockSchema;
};

export type TerraformProviderSchemaEntry = {
  provider?: {
    block?: TerraformBlockSchema;
  };
  resource_schemas?: Record<string, { block?: TerraformBlockSchema }>;
  data_source_schemas?: Record<string, { block?: TerraformBlockSchema }>;
};

export type TerraformSchemaResult = {
  provider_schemas?: Record<string, TerraformProviderSchemaEntry>;
};

export type TerraformVersionResult = {
  terraform_version?: string;
};

export type InitCommandOptions = {
  refresh: boolean;
};

export type CachePayload = {
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  fetchedAt: string;
  schema: TerraformProviderSchemaEntry;
};

export type CommandResult = {
  stdout: string;
  stderr: string;
};

export type CommandRunOptions = {
  cwd?: string;
  streamOutput?: boolean;
};

export type GeneratedOutputFile = {
  path: string;
  content: string;
};
