import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../helpers/cli";

describe("CLI reverse command", () => {
  it("reverse converts HCL file to JSX", async () => {
    const result = await runCli([
      "reverse",
      "tests/fixtures/hcl-react/basic.tf",
    ]);
    const expected = await readFile(
      "tests/fixtures/hcl-react/basic.expected.tsx",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("reverse --module outputs import/export module format", async () => {
    const result = await runCli([
      "reverse",
      "--module",
      "tests/fixtures/hcl-react/basic.tf",
    ]);
    const expected = await readFile(
      "tests/fixtures/hcl-react/basic.module.expected.tsx",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("reverse --help prints subcommand help", async () => {
    const result = await runCli(["reverse", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("react-hcl reverse");
    expect(result.stdout).toContain("Examples:");
  });

  it("stdin HCL + -o writes reverse output", async () => {
    const tmpDir = await mkdtemp(join(tmpdir(), "react-hcl-"));
    const outFile = `${tmpDir}/reverse.tsx`;
    try {
      const input = await readFile("tests/fixtures/hcl-react/basic.tf", "utf8");
      const result = await runCli(["reverse", "-", "-o", outFile], input);
      const actual = await readFile(outFile, "utf8");
      const expected = await readFile(
        "tests/fixtures/hcl-react/basic.expected.tsx",
        "utf8",
      );
      expect(result.exitCode).toBe(0);
      expect(actual).toBe(expected);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("complex HCL fixtures -> expected reverse TSX", async () => {
    const result = await runCli([
      "reverse",
      "tests/fixtures/hcl-react/complex.tf",
    ]);
    const expected = await readFile(
      "tests/fixtures/hcl-react/complex.expected.tsx",
      "utf8",
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(expected);
  });

  it("exits with error when input file and stdin are both provided", async () => {
    const input = await readFile("tests/fixtures/hcl-react/basic.tf", "utf8");
    const result = await runCli(
      ["reverse", "tests/fixtures/hcl-react/basic.tf"],
      input,
    );
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(
      "Cannot use stdin and input file together.",
    );
  });

  it("exits with error when '-' is passed without stdin content", async () => {
    const result = await runCli(["reverse", "-"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(
      "Stdin input is required when input is '-'.",
    );
  });
});
