import { describe, expect, it } from "bun:test";
import { $, type ShellError } from "bun";

describe("CLI E2E (generate)", () => {
  it("root --help prints help text", async () => {
    const result = await $`bun run src/cli/index.ts --help`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("generate [options] <input>");
    expect(result).toContain("reverse [options] <input>");
  });

  it("root -h prints help text", async () => {
    const result = await $`bun run src/cli/index.ts -h`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("Commands:");
  });

  it("no subcommand prints root help", async () => {
    const result = await $`bun run src/cli/index.ts`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("generate [options] <input>");
    expect(result).toContain("reverse [options] <input>");
  });

  it("generate --help prints subcommand help", async () => {
    const result = await $`bun run src/cli/index.ts generate --help`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("react-hcl generate");
    expect(result).toContain("Examples:");
  });

  it("basic.tsx -> matches expected HCL snapshot", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/basic.tsx`.text();
    const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("multiple.tsx -> multiple resources via Fragment", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/multiple.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/multiple.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("all-components.tsx -> all primitive components", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/all-components.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/all-components.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("refs.tsx -> resource references with useRef", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/refs.tsx`.text();
    const expected = await Bun.file("tests/fixtures/refs.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("variables.tsx -> tf.var / tf.local helpers", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/variables.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/variables.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("innertext.tsx -> innerText with adjustIndent", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/innertext.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/innertext.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("innertext-ref.tsx -> template literal ref without function wrapper", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/innertext-ref.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/innertext-ref.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("export-default-function.tsx -> default exported function component", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/export-default-function.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/export-default-function.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("composite.tsx -> composite components with ref passing", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/composite.tsx`.text();
    const expected = await Bun.file(
      "tests/fixtures/composite.expected.tf",
    ).text();
    expect(result).toBe(expected);
  });

  it("-o writes to specified file", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    try {
      await $`bun run src/cli/index.ts generate tests/fixtures/basic.tsx -o ${tmpDir}/main.tf`;
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
      await $`cat tests/fixtures/basic.tsx | bun run src/cli/index.ts generate -`.text();
    const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
    expect(result).toBe(expected);
  });
});

describe("CLI error handling (generate)", () => {
  it("exits with error for non-existent input file", async () => {
    try {
      await $`bun run src/cli/index.ts generate non-existent-file.tsx`.quiet();
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
      await $`bun run src/cli/index.ts generate ${tmpDir}/bad.tsx`.quiet();
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
      await $`printf "export default <NotClosed" | bun run src/cli/index.ts generate -`.quiet();
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
      await $`bun run src/cli/index.ts generate --foo tests/fixtures/basic.tsx`.quiet();
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
      await $`cat tests/fixtures/basic.tsx | bun run src/cli/index.ts generate tests/fixtures/basic.tsx`.quiet();
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
      await $`bun run src/cli/index.ts generate -`.quiet();
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
      await $`bun run src/cli/index.ts generate tests/fixtures/error-duplicate-resource.tsx`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("Conflict");
    }
  });

  it("does not validate innerText HCL syntax", async () => {
    const result =
      await $`bun run src/cli/index.ts generate tests/fixtures/error-invalid-innertext.tsx`.text();
    expect(result).toContain("this is not valid HCL {{{");
  });

  it("-o creates parent directories if they do not exist", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    const outFile = `${tmpDir}/nested/output/infra.tf`;
    try {
      await $`bun run src/cli/index.ts generate tests/fixtures/basic.tsx -o ${outFile}`;
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
      await $`bun run src/cli/index.ts generate --hcl-react tests/fixtures/basic.tsx`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("--hcl-react");
    }
  });

  it("rejects --module in generate command", async () => {
    try {
      await $`bun run src/cli/index.ts generate --module tests/fixtures/basic.tsx`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("--module");
    }
  });
});
