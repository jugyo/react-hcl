import { existsSync } from "node:fs";
import { readFile, rm, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWrite } from "../io";
import { logInit } from "../log";
import {
  getGenBaseDir,
  getMetadataPath,
  getPackageJsonPathCandidates,
  getTsconfigPath,
} from "../paths";
import { buildRuntimeDeclarationFiles } from "../runtime-shim/copy";
import type { NormalizedProviderSchema } from "../types";
import { relativeToCwd, sha256, stableStringify } from "../utils";
import { buildGeneratedFiles } from "./render";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function removeStaleGeneratedFiles(
  expectedFiles: Set<string>,
  previousFiles: string[],
): Promise<void> {
  const baseDir = getGenBaseDir();
  for (const previousFile of previousFiles) {
    const resolved = resolve(process.cwd(), previousFile);
    const relativeFromBaseDir = relative(baseDir, resolved);
    const isManagedPath =
      relativeFromBaseDir.length > 0 &&
      !relativeFromBaseDir.startsWith("..") &&
      !isAbsolute(relativeFromBaseDir);
    if (!isManagedPath) {
      continue;
    }

    if (!expectedFiles.has(resolved)) {
      await rm(resolved, { force: true });
    }
  }
}

async function readPreviousMetadata(
  metadataPath: string,
): Promise<{ generatedFiles?: string[] } | null> {
  try {
    const raw = await readFile(metadataPath, "utf8");
    return JSON.parse(raw) as { generatedFiles?: string[] };
  } catch {
    return null;
  }
}

async function writeManagedFiles(
  filesByPath: Map<string, string>,
): Promise<void> {
  for (const [path, content] of filesByPath.entries()) {
    await atomicWrite(path, content);
  }
}

async function buildMetadata(options: {
  schema: NormalizedProviderSchema;
  filesByPath: Map<string, string>;
  metadataPath: string;
}): Promise<{
  providerSource: string;
  providerVersion: string;
  terraformVersion: string;
  generatorVersion: string;
  generatedAt: string;
  schemaHash: string;
  fingerprint: string;
  generatedFiles: string[];
}> {
  const { schema, filesByPath, metadataPath } = options;

  // Hash only normalized schema content so timestamps/file ordering do not affect identity.
  const stableSchemaForHash = {
    providerSource: schema.providerSource,
    providerVersion: schema.providerVersion,
    terraformVersion: schema.terraformVersion,
    resourceSchemas: schema.resourceSchemas,
    dataSchemas: schema.dataSchemas,
    providerSchema: schema.providerSchema,
  };
  const schemaHash = sha256(stableStringify(stableSchemaForHash));

  const packageJsonPath = getPackageJsonPathCandidates(__dirname).find((path) =>
    existsSync(path),
  );
  let generatorVersion = "unknown";
  if (packageJsonPath) {
    try {
      const packageJsonRaw = await readFile(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonRaw) as { version?: string };
      if (packageJson.version) {
        generatorVersion = packageJson.version;
      }
    } catch {
      generatorVersion = "unknown";
    }
  }

  const fingerprint = sha256(
    stableStringify({
      providerSource: schema.providerSource,
      providerVersion: schema.providerVersion,
      terraformVersion: schema.terraformVersion,
      generatorVersion,
      schemaHash,
      outputDirectory: ".react-hcl/gen",
    }),
  );

  const managedFiles = [
    ...Array.from(filesByPath.keys()).map((path) => relativeToCwd(path)),
    relativeToCwd(metadataPath),
  ].sort((a, b) => a.localeCompare(b));

  return {
    providerSource: schema.providerSource,
    providerVersion: schema.providerVersion,
    terraformVersion: schema.terraformVersion,
    generatorVersion,
    generatedAt: schema.generatedAt,
    schemaHash,
    fingerprint,
    generatedFiles: managedFiles,
  };
}

export async function ensureTsconfigJson(): Promise<void> {
  const tsconfigPath = getTsconfigPath();

  try {
    await stat(tsconfigPath);
    logInit("tsconfig.json already exists. Skipping creation.");
    return;
  } catch {
    // continue
  }

  const defaultTsconfig = {
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      jsxImportSource: "react-hcl",
      baseUrl: ".",
      paths: {
        "react-hcl": ["./.react-hcl/gen/react-hcl/index.d.ts"],
        "react-hcl/*": ["./.react-hcl/gen/react-hcl/*"],
      },
      strict: true,
      skipLibCheck: true,
    },
    include: ["./**/*.ts", "./**/*.tsx", "./.react-hcl/gen/**/*.d.ts"],
  };

  await atomicWrite(
    tsconfigPath,
    `${JSON.stringify(defaultTsconfig, null, 2)}\n`,
  );
  logInit("Created tsconfig.json for react-hcl TSX projects.");
}

export async function writeGeneratedOutputs(
  schema: NormalizedProviderSchema,
): Promise<void> {
  const schemaDeclarationFiles = buildGeneratedFiles(schema);
  const runtimeDeclarationFiles = await buildRuntimeDeclarationFiles();
  const files = [...schemaDeclarationFiles, ...runtimeDeclarationFiles];
  const filesByPath = new Map(
    files.map((file) => [resolve(file.path), file.content]),
  );
  const expectedPaths = new Set(filesByPath.keys());

  const metadataPath = getMetadataPath();
  const previousMetadata = await readPreviousMetadata(metadataPath);

  await writeManagedFiles(filesByPath);
  await removeStaleGeneratedFiles(
    expectedPaths,
    previousMetadata?.generatedFiles ?? [],
  );

  const metadata = await buildMetadata({ schema, filesByPath, metadataPath });
  await atomicWrite(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}
