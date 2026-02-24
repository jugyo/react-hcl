import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { atomicWrite } from "../io";
import { logInit } from "../log";
import { getProviderSchemaBaseDir } from "../paths";
import type {
  CachePayload,
  ResolvedProviderSchema,
  TerraformSchemaResult,
  TerraformVersionResult,
} from "../types";
import { relativeToCwd } from "../utils";

export const PROVIDER_SOURCE = "registry.terraform.io/hashicorp/aws";
export const PROVIDER_VERSION = "latest";
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type RunCommandResult = {
  stdout: string;
  stderr: string;
};

type RunCommandOptions = {
  cwd?: string;
  streamOutput?: boolean;
};

function sanitizeForFileName(value: string): string {
  return encodeURIComponent(value);
}

function getCacheFilePath(terraformVersion: string): string {
  const fileName = `${sanitizeForFileName(PROVIDER_SOURCE)}@${PROVIDER_VERSION}@${sanitizeForFileName(terraformVersion)}.json`;
  return resolve(getProviderSchemaBaseDir(), fileName);
}

async function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
): Promise<RunCommandResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options?.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (options?.streamOutput) {
        process.stderr.write(text);
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (options?.streamOutput) {
        process.stderr.write(text);
      }
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          [`Command failed: ${command} ${args.join(" ")}`, stderr.trim()]
            .filter((line) => line.length > 0)
            .join("\n"),
        ),
      );
    });
  });
}

export async function ensureTerraformVersion(): Promise<string> {
  let versionOutput: RunCommandResult;
  try {
    versionOutput = await runCommand("terraform", ["version", "-json"]);
  } catch (error) {
    const maybeErr = error as NodeJS.ErrnoException;
    if (maybeErr.code === "ENOENT") {
      throw new Error(
        "Terraform CLI was not found. Install Terraform and ensure the 'terraform' command is available in PATH.",
      );
    }
    throw error;
  }

  let parsed: TerraformVersionResult;
  try {
    parsed = JSON.parse(versionOutput.stdout) as TerraformVersionResult;
  } catch {
    throw new Error("Failed to parse 'terraform version -json' output.");
  }

  if (!parsed.terraform_version) {
    throw new Error("Failed to determine Terraform version from CLI output.");
  }

  return parsed.terraform_version;
}

async function readCache(cacheFilePath: string): Promise<CachePayload | null> {
  try {
    const statResult = await stat(cacheFilePath);
    const isExpired = Date.now() - statResult.mtimeMs > DEFAULT_CACHE_TTL_MS;
    if (isExpired) {
      return null;
    }

    const raw = await readFile(cacheFilePath, "utf8");
    return JSON.parse(raw) as CachePayload;
  } catch {
    return null;
  }
}

async function fetchProviderSchema(
  terraformVersion: string,
): Promise<CachePayload> {
  // Use an isolated temporary Terraform project to avoid mutating user files.
  const tempDir = await mkdtemp(join(tmpdir(), "react-hcl-init-"));
  try {
    const terraformConfig = [
      "terraform {",
      "  required_providers {",
      "    aws = {",
      '      source = "hashicorp/aws"',
      "    }",
      "  }",
      "}",
      "",
    ].join("\n");

    await writeFile(join(tempDir, "main.tf"), terraformConfig);

    await runCommand("terraform", ["init", "-input=false", "-no-color"], {
      cwd: tempDir,
      streamOutput: true,
    });

    const schemaResult = await runCommand(
      "terraform",
      ["providers", "schema", "-json", "-no-color"],
      { cwd: tempDir },
    );

    let parsedSchema: TerraformSchemaResult;
    try {
      parsedSchema = JSON.parse(schemaResult.stdout) as TerraformSchemaResult;
    } catch {
      throw new Error(
        "Failed to parse 'terraform providers schema -json' output.",
      );
    }

    const schema = parsedSchema.provider_schemas?.[PROVIDER_SOURCE];
    if (!schema) {
      throw new Error(`Provider schema not found: ${PROVIDER_SOURCE}`);
    }

    return {
      providerSource: PROVIDER_SOURCE,
      providerVersion: PROVIDER_VERSION,
      terraformVersion,
      fetchedAt: new Date().toISOString(),
      schema,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Command failed: terraform init")
    ) {
      throw new Error(
        [
          "Terraform init failed while preparing provider schema.",
          error.message,
        ].join("\n"),
      );
    }
    throw error;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function resolveSchema(options: {
  refresh: boolean;
  terraformVersion: string;
}): Promise<ResolvedProviderSchema> {
  const cacheFilePath = getCacheFilePath(options.terraformVersion);

  let payload: CachePayload | null = null;
  if (!options.refresh) {
    payload = await readCache(cacheFilePath);
    if (payload) {
      logInit(`Using cached schema: ${relativeToCwd(cacheFilePath)}`);
    }
  }

  if (!payload) {
    logInit("Fetching provider schema via Terraform CLI...");
    payload = await fetchProviderSchema(options.terraformVersion);
    await atomicWrite(cacheFilePath, `${JSON.stringify(payload, null, 2)}\n`);
    logInit(`Cached schema: ${relativeToCwd(cacheFilePath)}`);
  }

  return {
    cachePayload: payload,
    schemaFilePath: cacheFilePath,
  };
}
