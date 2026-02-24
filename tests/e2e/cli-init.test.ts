import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { $, type ShellError } from "bun";

const BUN_PATH = process.execPath;
const REPO_ROOT = resolve(import.meta.dir, "../..");
const CLI_ENTRYPOINT = resolve(REPO_ROOT, "src/cli/index.ts");
const TSC_ENTRYPOINT = resolve(REPO_ROOT, "node_modules/typescript/bin/tsc");

const TERRAFORM_SCHEMA_JSON = JSON.stringify(
  {
    provider_schemas: {
      "registry.terraform.io/hashicorp/aws": {
        provider: {
          block: {
            attributes: {
              region: {
                type: "string",
                optional: true,
              },
            },
          },
        },
        resource_schemas: {
          aws_instance: {
            block: {
              attributes: {
                ami: {
                  type: "string",
                  required: true,
                },
                instance_type: {
                  type: "string",
                  optional: true,
                },
                arn: {
                  type: "string",
                  computed: true,
                },
              },
              block_types: {
                root_block_device: {
                  nesting_mode: "list",
                  block: {
                    attributes: {
                      volume_size: {
                        type: "number",
                        optional: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        data_source_schemas: {
          aws_ami: {
            block: {
              attributes: {
                most_recent: {
                  type: "bool",
                  optional: true,
                },
                owners: {
                  type: ["set", "string"],
                  required: true,
                },
              },
            },
          },
        },
      },
    },
  },
  null,
  2,
);

async function createFakeTerraformEnvironment(): Promise<{
  tempDir: string;
  logFilePath: string;
  pathPrefix: string;
}> {
  const tempDir = (await $`mktemp -d`.text()).trim();
  const fakeBinDir = `${tempDir}/bin`;
  const logFilePath = `${tempDir}/terraform.log`;

  await $`mkdir -p ${fakeBinDir}`;
  await Bun.write(
    `${fakeBinDir}/terraform`,
    `#!/usr/bin/env bash
set -euo pipefail

echo "$*" >> "${logFilePath}"

if [[ "$1" == "version" && "$2" == "-json" ]]; then
  echo '{"terraform_version":"1.9.0"}'
  exit 0
fi

if [[ "$1" == "init" ]]; then
  echo "Terraform has been successfully initialized!"
  exit 0
fi

if [[ "$1" == "providers" && "$2" == "schema" && "$3" == "-json" ]]; then
  cat <<'JSON'
${TERRAFORM_SCHEMA_JSON}
JSON
  exit 0
fi

echo "unsupported args: $*" >&2
exit 1
`,
  );
  await $`chmod +x ${fakeBinDir}/terraform`;

  return {
    tempDir,
    logFilePath,
    pathPrefix: fakeBinDir,
  };
}

async function runInit(options: {
  cwd: string;
  pathPrefix?: string;
  refresh?: boolean;
}) {
  const pathSuffix = process.env.PATH ?? "";

  if (options.pathPrefix) {
    if (options.refresh) {
      await $`cd ${options.cwd} && PATH=${options.pathPrefix}:${pathSuffix} ${BUN_PATH} run ${CLI_ENTRYPOINT} init --refresh`;
      return;
    }
    await $`cd ${options.cwd} && PATH=${options.pathPrefix}:${pathSuffix} ${BUN_PATH} run ${CLI_ENTRYPOINT} init`;
    return;
  }

  if (options.refresh) {
    await $`cd ${options.cwd} && ${BUN_PATH} run ${CLI_ENTRYPOINT} init --refresh`;
    return;
  }
  await $`cd ${options.cwd} && ${BUN_PATH} run ${CLI_ENTRYPOINT} init`;
}

async function snapshotGeneratedFiles(
  cwd: string,
): Promise<Map<string, string>> {
  const fileList = (await $`cd ${cwd} && find .react-hcl -type f | sort`.text())
    .trim()
    .split("\n")
    .filter((line) => line.length > 0);

  const snapshot = new Map<string, string>();
  for (const relativePath of fileList) {
    const absolutePath = resolve(cwd, relativePath);
    snapshot.set(relativePath, await Bun.file(absolutePath).text());
  }

  return snapshot;
}

function getLoggedCommands(logContent: string, prefix: string): number {
  return logContent
    .split("\n")
    .filter((line) => line.startsWith(prefix) && line.trim().length > 0).length;
}

describe("CLI E2E (init)", () => {
  it("generates deterministic output on repeated runs", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });
      const firstSnapshot = await snapshotGeneratedFiles(env.tempDir);

      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });
      const secondSnapshot = await snapshotGeneratedFiles(env.tempDir);

      expect(secondSnapshot).toEqual(firstSnapshot);
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("writes active provider schema metadata under .react-hcl/metadata.json", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      const metadataPath = resolve(env.tempDir, ".react-hcl/metadata.json");
      const metadata = JSON.parse(await Bun.file(metadataPath).text()) as {
        formatVersion?: number;
        activeProviderSchemas?: Record<
          string,
          {
            path?: string;
            terraformVersion?: string;
            providerVersion?: string;
            updatedAt?: string;
          }
        >;
      };

      const active =
        metadata.activeProviderSchemas?.["registry.terraform.io/hashicorp/aws"];
      expect(metadata.formatVersion).toBe(1);
      expect(active?.terraformVersion).toBe("1.9.0");
      expect(active?.providerVersion).toBe("latest");
      expect(active?.path).toContain(".react-hcl/provider-schema/");
      expect(active?.path?.endsWith(".json")).toBe(true);
      expect(typeof active?.updatedAt).toBe("string");
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("does not modify unrelated user files", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      const keepFilePath = resolve(env.tempDir, "keep.txt");
      await Bun.write(keepFilePath, "do not touch\n");

      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      expect(await Bun.file(keepFilePath).text()).toBe("do not touch\n");
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("reuses cache unless --refresh is passed", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      const logAfterCacheHit = await Bun.file(env.logFilePath).text();
      expect(getLoggedCommands(logAfterCacheHit, "init")).toBe(1);
      expect(
        getLoggedCommands(logAfterCacheHit, "providers schema -json"),
      ).toBe(1);

      await runInit({
        cwd: env.tempDir,
        pathPrefix: env.pathPrefix,
        refresh: true,
      });

      const logAfterRefresh = await Bun.file(env.logFilePath).text();
      expect(getLoggedCommands(logAfterRefresh, "init")).toBe(2);
      expect(getLoggedCommands(logAfterRefresh, "providers schema -json")).toBe(
        2,
      );
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("creates tsconfig.json when missing", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });
      const tsconfigPath = resolve(env.tempDir, "tsconfig.json");
      const tsconfig = JSON.parse(await Bun.file(tsconfigPath).text()) as {
        compilerOptions?: {
          jsxImportSource?: string;
          paths?: Record<string, string[]>;
        };
        include?: string[];
      };

      expect(tsconfig.compilerOptions?.jsxImportSource).toBe("react-hcl");
      expect(tsconfig.compilerOptions?.paths?.["react-hcl"]?.[0]).toBe(
        "./.react-hcl/gen/react-hcl/index.d.ts",
      );
      expect(tsconfig.compilerOptions?.paths?.["react-hcl/*"]?.[0]).toBe(
        "./.react-hcl/gen/react-hcl/*",
      );
      expect(tsconfig.include).toContain("./.react-hcl/gen/**/*.d.ts");
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("does not overwrite existing tsconfig.json", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      const tsconfigPath = resolve(env.tempDir, "tsconfig.json");
      const existing = '{"compilerOptions":{"target":"ES2020"}}\n';
      await Bun.write(tsconfigPath, existing);

      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      expect(await Bun.file(tsconfigPath).text()).toBe(existing);
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("rejects attributes not defined in schema after init", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      await Bun.write(
        resolve(env.tempDir, "main.tsx"),
        `import { Resource } from "react-hcl";

export default (
  <Resource
    type="aws_instance"
    label="web"
    ami="ami-123"
    foo="not-allowed"
  />
);
`,
      );

      let didFail = false;
      let diagnostics = "";
      try {
        await $`cd ${env.tempDir} && ${BUN_PATH} ${TSC_ENTRYPOINT} -p tsconfig.json --noEmit`.quiet();
      } catch (error) {
        didFail = true;
        const err = error as ShellError;
        diagnostics = `${err.stdout?.toString() ?? ""}\n${err.stderr?.toString() ?? ""}`;
      }

      expect(didFail).toBe(true);
      expect(diagnostics).toContain("foo");
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("accepts ref expressions and single object nested blocks after init", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      await Bun.write(
        resolve(env.tempDir, "ok.tsx"),
        `import { Data, Resource, useRef } from "react-hcl";

function Main() {
  const amiRef = useRef();
  return (
    <>
      <Data type="aws_ami" label="ubuntu" ref={amiRef} owners={["099720109477"]} />
      <Resource
        type="aws_instance"
        label="web"
        ami={amiRef.id}
        root_block_device={{ volume_size: 20 }}
      />
    </>
  );
}

export default <Main />;
`,
      );

      await $`cd ${env.tempDir} && ${BUN_PATH} ${TSC_ENTRYPOINT} -p tsconfig.json --noEmit`;
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("generates local react-hcl runtime type shims for TS resolution", async () => {
    const env = await createFakeTerraformEnvironment();

    try {
      await runInit({ cwd: env.tempDir, pathPrefix: env.pathPrefix });

      const indexShimPath = resolve(
        env.tempDir,
        ".react-hcl/gen/react-hcl/index.d.ts",
      );
      const jsxRuntimeShimPath = resolve(
        env.tempDir,
        ".react-hcl/gen/react-hcl/jsx-runtime.d.ts",
      );

      expect(await Bun.file(indexShimPath).exists()).toBe(true);
      expect(await Bun.file(jsxRuntimeShimPath).exists()).toBe(true);
      expect(
        await Bun.file(
          resolve(env.tempDir, ".react-hcl/gen/react-hcl/cli/index.d.ts"),
        ).exists(),
      ).toBe(false);
    } finally {
      await $`rm -rf ${env.tempDir}`;
    }
  });

  it("shows a clear error when terraform is not available", async () => {
    const tempDir = (await $`mktemp -d`.text()).trim();
    const emptyPathDir = `${tempDir}/empty-path`;
    await $`mkdir -p ${emptyPathDir}`;

    try {
      await $`cd ${tempDir} && PATH=${emptyPathDir} ${BUN_PATH} run ${CLI_ENTRYPOINT} init`.quiet();
      throw new Error("should have failed");
    } catch (error) {
      const err = error as { stderr?: string; exitCode?: number };
      expect(err.exitCode).not.toBe(0);
      expect(String(err.stderr)).toContain("Terraform CLI was not found");
    } finally {
      await $`rm -rf ${tempDir}`;
    }
  });
});
