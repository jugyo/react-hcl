// Store helpers for active provider schema metadata and normalized schema loading.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { normalizeProviderSchema } from "./normalize";
import type {
  CachePayload,
  NormalizedProviderSchema,
  RuntimeMetadata,
} from "./types";

export const DEFAULT_PROVIDER_SOURCE = "registry.terraform.io/hashicorp/aws";
const RUNTIME_METADATA_FORMAT_VERSION = 1;

export type ActiveProviderSchemaPayload = {
  activePath: string;
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  updatedAt: string;
  payload: CachePayload;
};

type RuntimeMetadataReadResult =
  | { kind: "missing" }
  | { kind: "ok"; metadata: RuntimeMetadata }
  | { kind: "invalid_json" };

async function atomicWrite(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempFile = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tempFile, content);
  await rename(tempFile, path);
}

function hasProviderSchemaArtifacts(cwd: string): boolean {
  const providerSchemaDir = resolve(cwd, ".react-hcl", "provider-schema");
  return (
    existsSync(providerSchemaDir) &&
    readdirSync(providerSchemaDir).some((entry) => entry.endsWith(".json"))
  );
}

function getRuntimeMetadataPath(cwd: string): string {
  return resolve(cwd, ".react-hcl", "metadata.json");
}

function readRuntimeMetadata(path: string): RuntimeMetadataReadResult {
  if (!existsSync(path)) {
    return { kind: "missing" };
  }

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as Partial<RuntimeMetadata>;
    if (
      parsed.formatVersion === 1 &&
      parsed.activeProviderSchemas &&
      typeof parsed.activeProviderSchemas === "object"
    ) {
      return {
        kind: "ok",
        metadata: {
          formatVersion: 1,
          activeProviderSchemas: parsed.activeProviderSchemas,
        },
      };
    }
    return { kind: "invalid_json" };
  } catch {
    return { kind: "invalid_json" };
  }
}

export function loadActiveProviderSchemaPayload(options: {
  cwd: string;
  providerSource: string;
  required: boolean;
}): ActiveProviderSchemaPayload | null {
  const metadataPath = getRuntimeMetadataPath(options.cwd);
  const metadataReadResult = readRuntimeMetadata(metadataPath);
  if (metadataReadResult.kind === "missing") {
    if (options.required && hasProviderSchemaArtifacts(options.cwd)) {
      throw new Error(
        "Missing .react-hcl/metadata.json. Run `react-hcl init` and try again.",
      );
    }
    return null;
  }
  if (metadataReadResult.kind === "invalid_json") {
    throw new Error(
      "Failed to parse .react-hcl/metadata.json. Run `react-hcl init` and try again.",
    );
  }

  const metadata = metadataReadResult.metadata;
  if (metadata.formatVersion !== RUNTIME_METADATA_FORMAT_VERSION) {
    throw new Error(
      "Unsupported .react-hcl/metadata.json format. Run `react-hcl init` and try again.",
    );
  }

  const active = metadata.activeProviderSchemas?.[options.providerSource];
  if (!active) {
    throw new Error(
      `Active provider schema not found for "${options.providerSource}". Run \`react-hcl init\` and try again.`,
    );
  }

  const schemaPath = isAbsolute(active.path)
    ? active.path
    : resolve(options.cwd, active.path);
  if (!existsSync(schemaPath)) {
    throw new Error(
      `Provider schema file not found: ${active.path}. Run \`react-hcl init\` and try again.`,
    );
  }

  let payload: CachePayload;
  try {
    payload = JSON.parse(readFileSync(schemaPath, "utf8")) as CachePayload;
  } catch {
    throw new Error(
      `Failed to parse provider schema: ${active.path}. Run \`react-hcl init\` and try again.`,
    );
  }

  if (!payload.schema) {
    throw new Error(
      `Invalid provider schema payload: ${active.path}. Run \`react-hcl init\` and try again.`,
    );
  }

  return {
    activePath: active.path,
    providerSource: options.providerSource,
    providerVersion: active.providerVersion,
    terraformVersion: active.terraformVersion,
    updatedAt: active.updatedAt,
    payload,
  };
}

export async function writeActiveProviderSchemaMetadata(options: {
  cwd?: string;
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  schemaFilePath: string;
  updatedAt: string;
}): Promise<string> {
  const cwd = options.cwd ?? process.cwd();
  const metadataPath = getRuntimeMetadataPath(cwd);
  const metadataReadResult = readRuntimeMetadata(metadataPath);
  if (metadataReadResult.kind === "invalid_json") {
    throw new Error(
      "Failed to parse .react-hcl/metadata.json. Run `react-hcl init` and try again.",
    );
  }
  const metadata =
    metadataReadResult.kind === "ok"
      ? metadataReadResult.metadata
      : {
          formatVersion: 1 as const,
          activeProviderSchemas: {},
        };
  metadata.activeProviderSchemas[options.providerSource] = {
    path: relative(cwd, options.schemaFilePath),
    terraformVersion: options.terraformVersion,
    providerVersion: options.providerVersion,
    updatedAt: options.updatedAt,
  };
  await atomicWrite(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  return metadataPath;
}

export function loadNormalizedActiveProviderSchema(options?: {
  cwd?: string;
  providerSource?: string;
}): NormalizedProviderSchema {
  const cwd = options?.cwd ?? process.cwd();
  const providerSource = options?.providerSource ?? DEFAULT_PROVIDER_SOURCE;
  const resolved = loadActiveProviderSchemaPayload({
    cwd,
    providerSource,
    required: true,
  });
  if (!resolved) {
    throw new Error(
      `Active provider schema not found for "${providerSource}". Run \`react-hcl init\` and try again.`,
    );
  }

  return normalizeProviderSchema({
    providerSource: resolved.providerSource,
    providerVersion: resolved.providerVersion,
    schemaEntry: resolved.payload.schema,
    terraformVersion: resolved.terraformVersion,
    generatedAt: resolved.updatedAt,
  });
}
