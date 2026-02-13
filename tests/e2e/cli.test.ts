import { describe, it, expect } from "bun:test";
import { $ } from "bun";

describe("CLI PoC", () => {
  it("TSX ファイルをトランスパイル・評価して出力する", async () => {
    const result = await $`bun run src/cli.ts tests/fixtures/basic.tsx`.text();
    expect(result.trim()).toContain("resource");
    expect(result.trim()).toContain("aws_vpc");
    expect(result.trim()).toContain("main");
  });
});
