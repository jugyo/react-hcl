import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../helpers/cli";

describe("CLI E2E (generate)", () => {
  it("root --help prints help text", async () => {
    const result = await runCli(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("generate [options] <input>");
    expect(result.stdout).toContain("reverse [options] <input>");
  });

  it("root -h prints help text", async () => {
    const result = await runCli(["-h"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("Commands:");
  });

  it("no subcommand prints root help", async () => {
    const result = await runCli([]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("generate [options] <input>");
    expect(result.stdout).toContain("reverse [options] <input>");
  });

  it("generate --help prints subcommand help", async () => {
    const result = await runCli(["generate", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("react-hcl generate");
    expect(result.stdout).toContain("Examples:");
  });

  it("basic.tsx -> matches expected HCL snapshot", async () => {
    const result = await runCli(["generate", "tests/fixtures/basic.tsx"]);
    const expected = await readFile("tests/fixtures/basic.expected.tf", "utf8");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("multiple.tsx -> multiple resources via Fragment", async () => {
    const result = await runCli(["generate", "tests/fixtures/multiple.tsx"]);
    const expected = await readFile(
      "tests/fixtures/multiple.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("all-components.tsx -> all primitive components", async () => {
    const result = await runCli([
      "generate",
      "tests/fixtures/all-components.tsx",
    ]);
    const expected = await readFile(
      "tests/fixtures/all-components.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("refs.tsx -> resource references with useRef", async () => {
    const result = await runCli(["generate", "tests/fixtures/refs.tsx"]);
    const expected = await readFile("tests/fixtures/refs.expected.tf", "utf8");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("variables.tsx -> tf.var / tf.local helpers", async () => {
    const result = await runCli(["generate", "tests/fixtures/variables.tsx"]);
    const expected = await readFile(
      "tests/fixtures/variables.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("innertext.tsx -> innerText with adjustIndent", async () => {
    const result = await runCli(["generate", "tests/fixtures/innertext.tsx"]);
    const expected = await readFile(
      "tests/fixtures/innertext.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("innertext-ref.tsx -> template literal ref without function wrapper", async () => {
    const result = await runCli([
      "generate",
      "tests/fixtures/innertext-ref.tsx",
    ]);
    const expected = await readFile(
      "tests/fixtures/innertext-ref.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("export-default-function.tsx -> default exported function component", async () => {
    const result = await runCli([
      "generate",
      "tests/fixtures/export-default-function.tsx",
    ]);
    const expected = await readFile(
      "tests/fixtures/export-default-function.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("composite.tsx -> composite components with ref passing", async () => {
    const result = await runCli(["generate", "tests/fixtures/composite.tsx"]);
    const expected = await readFile(
      "tests/fixtures/composite.expected.tf",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("-o writes to specified file", async () => {
    const tmpDir = await mkdtemp(join(tmpdir(), "react-hcl-"));
    const outputPath = `${tmpDir}/main.tf`;
    try {
      const result = await runCli([
        "generate",
        "tests/fixtures/basic.tsx",
        "-o",
        outputPath,
      ]);
      const content = await readFile(outputPath, "utf8");
      const expected = await readFile(
        "tests/fixtures/basic.expected.tf",
        "utf8",
      );
      expect(result.exitCode).toBe(0);
      expect(content).toBe(expected);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("reads TSX from stdin when input is '-'", async () => {
    const input = await readFile("tests/fixtures/basic.tsx", "utf8");
    const result = await runCli(["generate", "-"], input);
    const expected = await readFile("tests/fixtures/basic.expected.tf", "utf8");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });
});

describe("CLI error handling (generate)", () => {
  it("exits with error for non-existent input file", async () => {
    const result = await runCli(["generate", "non-existent-file.tsx"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Could not resolve");
    expect(result.stderr).toContain("non-existent-file.tsx");
  });

  it("exits with error for invalid TSX syntax", async () => {
    const tmpDir = await mkdtemp(join(tmpdir(), "react-hcl-"));
    try {
      await writeFile(`${tmpDir}/bad.tsx`, "export default <NotClosed", "utf8");
      const result = await runCli(["generate", `${tmpDir}/bad.tsx`]);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain("Build failed with");
      expect(result.stderr).toContain("1.");
      expect(result.stderr).not.toContain("failureErrorWithLog");
      expect(result.stderr).not.toContain("node_modules/esbuild");
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("exits with formatted location for invalid TSX from stdin", async () => {
    const result = await runCli(["generate", "-"], "export default <NotClosed");
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Build failed with");
    expect(result.stderr).toContain("stdin.tsx");
    expect(result.stderr).not.toContain("failureErrorWithLog");
  });

  it("exits with error for unknown option", async () => {
    const result = await runCli([
      "generate",
      "--foo",
      "tests/fixtures/basic.tsx",
    ]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--foo");
    expect(result.stderr).toContain("Usage:");
  });

  it("exits with error when input file and stdin are both provided", async () => {
    const input = await readFile("tests/fixtures/basic.tsx", "utf8");
    const result = await runCli(
      ["generate", "tests/fixtures/basic.tsx"],
      input,
    );
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(
      "Cannot use stdin and input file together.",
    );
  });

  it("exits with error when '-' is passed without stdin content", async () => {
    const result = await runCli(["generate", "-"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(
      "Stdin input is required when input is '-'.",
    );
  });

  it("exits with error for duplicate resource conflict", async () => {
    const result = await runCli([
      "generate",
      "tests/fixtures/error-duplicate-resource.tsx",
    ]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Conflict");
  });

  it("does not validate innerText HCL syntax", async () => {
    const result = await runCli([
      "generate",
      "tests/fixtures/error-invalid-innertext.tsx",
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("this is not valid HCL {{{");
  });

  it("-o creates parent directories if they do not exist", async () => {
    const tmpDir = await mkdtemp(join(tmpdir(), "react-hcl-"));
    const outFile = `${tmpDir}/nested/output/infra.tf`;
    try {
      const result = await runCli([
        "generate",
        "tests/fixtures/basic.tsx",
        "-o",
        outFile,
      ]);
      const content = await readFile(outFile, "utf8");
      const expected = await readFile(
        "tests/fixtures/basic.expected.tf",
        "utf8",
      );
      expect(result.exitCode).toBe(0);
      expect(content).toBe(expected);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("rejects removed --hcl-react option", async () => {
    const result = await runCli([
      "generate",
      "--hcl-react",
      "tests/fixtures/basic.tsx",
    ]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--hcl-react");
  });

  it("rejects --module in generate command", async () => {
    const result = await runCli([
      "generate",
      "--module",
      "tests/fixtures/basic.tsx",
    ]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--module");
  });
});
