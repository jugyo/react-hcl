import { describe, expect, it } from "bun:test";
import { $, type ShellError } from "bun";

describe("CLI reverse command", () => {
  it("reverse converts HCL file to JSX", async () => {
    const result =
      await $`bun run src/cli/index.ts reverse tests/fixtures/hcl-react/basic.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/basic.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("reverse --module outputs import/export module format", async () => {
    const result =
      await $`bun run src/cli/index.ts reverse --module tests/fixtures/hcl-react/basic.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/basic.module.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("reverse --help prints subcommand help", async () => {
    const result = await $`bun run src/cli/index.ts reverse --help`.text();
    expect(result).toContain("Usage:");
    expect(result).toContain("react-hcl reverse");
    expect(result).toContain("Examples:");
  });

  it("stdin HCL + -o writes reverse output", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    const outFile = `${tmpDir}/reverse.tsx`;
    try {
      await $`cat tests/fixtures/hcl-react/basic.tf | bun run src/cli/index.ts reverse - -o ${outFile}`;
      const actual = await Bun.file(outFile).text();
      const expected = await Bun.file(
        "tests/fixtures/hcl-react/basic.expected.tsx",
      ).text();
      expect(actual).toBe(expected);
    } finally {
      await $`rm -rf ${tmpDir}`;
    }
  });

  it("complex HCL fixtures -> expected reverse TSX", async () => {
    const result =
      await $`bun run src/cli/index.ts reverse tests/fixtures/hcl-react/complex.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/complex.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("exits with error when input file and stdin are both provided", async () => {
    try {
      await $`cat tests/fixtures/hcl-react/basic.tf | bun run src/cli/index.ts reverse tests/fixtures/hcl-react/basic.tf`.quiet();
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
      await $`bun run src/cli/index.ts reverse -`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain(
        "Stdin input is required when input is '-'.",
      );
    }
  });
});
