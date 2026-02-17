import { describe, expect, it } from "bun:test";
import { $, type ShellError } from "bun";

describe("CLI HCL reverse mode", () => {
  it("--hcl-react converts HCL file to JSX", async () => {
    const result =
      await $`bun run src/cli/index.ts --hcl-react tests/fixtures/hcl-react/basic.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/basic.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("auto-detect converts HCL file to JSX without --hcl-react", async () => {
    const result =
      await $`bun run src/cli/index.ts tests/fixtures/hcl-react/basic.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/basic.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("auto-detect keeps TSX -> HCL in forward mode", async () => {
    const result =
      await $`bun run src/cli/index.ts tests/fixtures/basic.tsx`.text();
    const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("--module outputs import/export module format", async () => {
    const result =
      await $`bun run src/cli/index.ts --hcl-react --module tests/fixtures/hcl-react/basic.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/basic.module.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("stdin HCL + -o writes reverse output", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    const outFile = `${tmpDir}/reverse.tsx`;
    try {
      await $`cat tests/fixtures/hcl-react/basic.tf | bun run src/cli/index.ts --hcl-react - -o ${outFile}`;
      const actual = await Bun.file(outFile).text();
      const expected = await Bun.file(
        "tests/fixtures/hcl-react/basic.expected.tsx",
      ).text();
      expect(actual).toBe(expected);
    } finally {
      await $`rm -rf ${tmpDir}`;
    }
  });

  it("auto-detect converts HCL from stdin without --hcl-react", async () => {
    const result =
      await $`cat tests/fixtures/hcl-react/basic.tf | bun run src/cli/index.ts`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/basic.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("complex HCL fixtures -> expected reverse TSX", async () => {
    const result =
      await $`bun run src/cli/index.ts --hcl-react tests/fixtures/hcl-react/complex.tf`.text();
    const expected = await Bun.file(
      "tests/fixtures/hcl-react/complex.expected.tsx",
    ).text();
    expect(result).toBe(expected);
  });

  it("ambiguous input exits with detection error", async () => {
    try {
      await $`printf "hello world\n" | bun run src/cli/index.ts`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain("Could not detect input format");
    }
  });

  it("rejects --module in forward mode", async () => {
    try {
      await $`bun run src/cli/index.ts --module tests/fixtures/basic.tsx`.quiet();
      throw new Error("should have failed");
    } catch (e) {
      const err = e as ShellError;
      expect(err.exitCode).not.toBe(0);
      expect(err.stderr.toString()).toContain(
        "--module is only available in HCL reverse mode.",
      );
    }
  });
});
