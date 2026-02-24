// Runtime lookup registry that resolves Terraform block schema by block context.
import type { TerraformProviderSchemaEntry } from "./types";
import {
  DEFAULT_PROVIDER_SOURCE,
  loadActiveProviderSchemaPayload,
} from "./store";
import type { RuntimeSchemaRegistry } from "./types";

export function loadRuntimeSchemaRegistry(options?: {
  cwd?: string;
  providerSource?: string;
  required?: boolean;
}): RuntimeSchemaRegistry {
  const cwd = options?.cwd ?? process.cwd();
  const providerSource = options?.providerSource ?? DEFAULT_PROVIDER_SOURCE;
  const required = options?.required ?? false;
  const resolved = loadActiveProviderSchemaPayload({
    cwd,
    providerSource,
    required,
  });
  const providerSchemaEntry: TerraformProviderSchemaEntry | null =
    resolved?.payload.schema ?? null;

  return {
    resolveBlockSchema(context) {
      if (!providerSchemaEntry) {
        return null;
      }
      if (context.blockType === "resource") {
        return providerSchemaEntry.resource_schemas?.[context.type]?.block ?? null;
      }
      if (context.blockType === "data") {
        return providerSchemaEntry.data_source_schemas?.[context.type]?.block ?? null;
      }
      return providerSchemaEntry.provider?.block ?? null;
    },
  };
}
