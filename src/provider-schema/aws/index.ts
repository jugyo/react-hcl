import type { TerraformTypeSchema } from "../types";

// Placeholder maps: generated provider schema modules are intentionally removed.
export const AWS_RESOURCE_SCHEMAS = {} as const satisfies Record<
  string,
  TerraformTypeSchema
>;

export const AWS_DATA_SCHEMAS = {} as const satisfies Record<
  string,
  TerraformTypeSchema
>;
