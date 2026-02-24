// Raw Terraform CLI attribute schema node.
export type TerraformAttributeSchema = {
  type?: unknown;
  required?: boolean;
  optional?: boolean;
  computed?: boolean;
  sensitive?: boolean;
};

// Raw Terraform CLI block schema node.
export type TerraformBlockSchema = {
  attributes?: Record<string, TerraformAttributeSchema>;
  block_types?: Record<string, TerraformNestedBlockSchema>;
};

// Raw Terraform CLI nested block schema node.
export type TerraformNestedBlockSchema = {
  nesting_mode: "single" | "list" | "set" | string;
  min_items?: number;
  max_items?: number;
  block: TerraformBlockSchema;
};

// Raw provider schema entry keyed by provider source.
export type TerraformProviderSchemaEntry = {
  provider?: {
    block?: TerraformBlockSchema;
  };
  resource_schemas?: Record<string, { block?: TerraformBlockSchema }>;
  data_source_schemas?: Record<string, { block?: TerraformBlockSchema }>;
};

// Raw output shape from `terraform providers schema -json`.
export type TerraformSchemaResult = {
  provider_schemas?: Record<string, TerraformProviderSchemaEntry>;
};

// Raw output shape from `terraform version -json`.
export type TerraformVersionResult = {
  terraform_version?: string;
};
