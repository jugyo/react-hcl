import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { $, type ShellError } from "bun";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const BUN_PATH = process.execPath;
const CLI_ENTRYPOINT = resolve(REPO_ROOT, "src/cli/index.ts");
const FIXTURE_DIR = resolve(REPO_ROOT, "tests/fixtures");
const fixturePath = (name: string) => resolve(FIXTURE_DIR, name);
let testWorkdir = "";
let runtimeMetadataPath = "";
let runtimeSchemaPath = "";

beforeAll(async () => {
  testWorkdir = await mkdtemp(join(resolve(REPO_ROOT, "tmp"), "cli-e2e-"));
  runtimeMetadataPath = resolve(testWorkdir, ".react-hcl/metadata.json");
  runtimeSchemaPath = resolve(
    testWorkdir,
    ".react-hcl/provider-schema/test-cli-schema.json",
  );

  await mkdir(resolve(testWorkdir, ".react-hcl/provider-schema"), {
    recursive: true,
  });
  await writeFile(
    runtimeSchemaPath,
    JSON.stringify(
      {
        providerSource: "registry.terraform.io/hashicorp/aws",
        providerVersion: "latest",
        terraformVersion: "1.9.0",
        fetchedAt: "2026-02-24T00:00:00.000Z",
        schema: {
          resource_schemas: {},
          data_source_schemas: {},
          provider: {
            block: {
              attributes: {
                region: { type: "string", optional: true },
                alias: { type: "string", optional: true },
              },
            },
          },
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    runtimeMetadataPath,
    JSON.stringify(
      {
        formatVersion: 1,
        activeProviderSchemas: {
          "registry.terraform.io/hashicorp/aws": {
            path: ".react-hcl/provider-schema/test-cli-schema.json",
            terraformVersion: "1.9.0",
            providerVersion: "latest",
            updatedAt: "2026-02-24T00:00:00.000Z",
          },
        },
      },
      null,
      2,
    ),
  );
});

afterAll(async () => {
  if (testWorkdir.length > 0) {
    await rm(testWorkdir, { recursive: true, force: true });
  }
});

describe("CLI E2E (generate)", () => {
  it("root --help prints help text", async () => {
    const result = await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} --help`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("generate [options] <input>");
    expect(result).toContain("reverse [options] <input>");
  });

  it("root -h prints help text", async () => {
    const result = await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} -h`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("Commands:");
  });

  it("no subcommand prints root help", async () => {
    const result = await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT}`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("generate [options] <input>");
    expect(result).toContain("reverse [options] <input>");
  });

  it("generate --help prints subcommand help", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate --help`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("react-hcl generate");
    expect(result).toContain("Examples:");
  });

  it("basic.tsx -> matches expected HCL snapshot", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("basic.tsx")}`.text();
    const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("multiple.tsx -> multiple resources via Fragment", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("multiple.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/multiple.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("all-components.tsx -> all primitive components", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("all-components.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/all-components.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("refs.tsx -> resource references with useRef", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("refs.tsx")}`.text();
    const expected = await Bun.file("tests/fixtures/refs.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("variables.tsx -> tf.var / tf.local helpers", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("variables.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/variables.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("innertext.tsx -> innerText with adjustIndent", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("innertext.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/innertext.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("innertext-ref.tsx -> template literal ref without function wrapper", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("innertext-ref.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/innertext-ref.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("export-default-function.tsx -> default exported function component", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("export-default-function.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/export-default-function.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("composite.tsx -> composite components with ref passing", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("composite.tsx")}`.text();
    const expected = await Bun.file(
      "tests/fixtures/composite.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("-o writes to specified file", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("basic.tsx")} -o ${tmpDir}/main.tf`;
      const content = await Bun.file(`${tmpDir}/main.tf`).text();
      const expected = await Bun.file(
        "tests/fixtures/basic.expected.tf",
      ).text();
      expect(content).toBe(expected);
    } finally {
      await $`rm -rf ${tmpDir}`;
    }
  });

  it("reads TSX from stdin when input is '-'", async () => {
    const result =
      await $`cd ${testWorkdir} && cat ${fixturePath("basic.tsx")} | ${BUN_PATH} run ${CLI_ENTRYPOINT} generate -`.text();
    const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
    expect(result).toBe(expected);
  });
});

describe("CLI error handling (generate)", () => {
  it("exits with error for non-existent input file", async () => {
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate non-existent-file.tsx`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("Could not resolve");
      expect(err.stderr.toString()).toContain("non-existent-file.tsx");
    }
  });

  it("exits with error for invalid TSX syntax", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    try {
      await Bun.write(`${tmpDir}/bad.tsx`, `export default <NotClosed`);
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${tmpDir}/bad.tsx`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("Build failed with");
      expect(err.stderr.toString()).toContain("1.");
      expect(err.stderr.toString()).not.toContain("failureErrorWithLog");
      expect(err.stderr.toString()).not.toContain("node_modules/esbuild");
    } finally {
      await $`rm -rf ${tmpDir}`;
    }
  });

  it("exits with formatted location for invalid TSX from stdin", async () => {
    try {
      await $`cd ${testWorkdir} && printf "export default <NotClosed" | ${BUN_PATH} run ${CLI_ENTRYPOINT} generate -`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("Build failed with");
      expect(err.stderr.toString()).toContain("stdin.tsx");
      expect(err.stderr.toString()).not.toContain("failureErrorWithLog");
    }
  });

  it("exits with error for unknown option", async () => {
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate --foo ${fixturePath("basic.tsx")}`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("--foo");
      expect(err.stderr.toString()).toContain("Usage:");
    }
  });

  it("exits with error when input file and stdin are both provided", async () => {
    try {
      await $`cd ${testWorkdir} && cat ${fixturePath("basic.tsx")} | ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("basic.tsx")}`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain(
        "Cannot use stdin and input file together.",
      );
    }
  });

  it("exits with error when '-' is passed without stdin content", async () => {
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate -`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain(
        "Stdin input is required when input is '-'.",
      );
    }
  });

  it("exits with error for duplicate resource conflict", async () => {
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("error-duplicate-resource.tsx")}`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("Conflict");
    }
  });

  it("does not validate innerText HCL syntax", async () => {
    const result =
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("error-invalid-innertext.tsx")}`.text();
    expect(result).toContain("this is not valid HCL {{{");
  });

  it("-o creates parent directories if they do not exist", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    const outFile = `${tmpDir}/nested/output/infra.tf`;
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate ${fixturePath("basic.tsx")} -o ${outFile}`;
      const content = await Bun.file(outFile).text();
      const expected = await Bun.file(
        "tests/fixtures/basic.expected.tf",
      ).text();
      expect(content).toBe(expected);
    } finally {
      await $`rm -rf ${tmpDir}`;
    }
  });

  it("rejects removed --hcl-react option", async () => {
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate --hcl-react ${fixturePath("basic.tsx")}`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("--hcl-react");
    }
  });

  it("rejects --module in generate command", async () => {
    try {
      await $`cd ${testWorkdir} && ${BUN_PATH} run ${CLI_ENTRYPOINT} generate --module ${fixturePath("basic.tsx")}`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("--module");
    }
  });
});
