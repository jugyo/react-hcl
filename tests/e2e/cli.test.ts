import { describe, it, expect } from "bun:test";
import { $ } from "bun";

describe("CLI E2E", () => {
  it("basic.tsx → matches expected HCL snapshot", async () => {
    const result = await $`bun run src/cli.ts tests/fixtures/basic.tsx`.text();
    const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("multiple.tsx → multiple resources via Fragment", async () => {
    const result = await $`bun run src/cli.ts tests/fixtures/multiple.tsx`.text();
    const expected = await Bun.file("tests/fixtures/multiple.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("all-components.tsx → all primitive components", async () => {
    const result = await $`bun run src/cli.ts tests/fixtures/all-components.tsx`.text();
    const expected = await Bun.file("tests/fixtures/all-components.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("refs.tsx → resource references with useRef", async () => {
    const result = await $`bun run src/cli.ts tests/fixtures/refs.tsx`.text();
    const expected = await Bun.file("tests/fixtures/refs.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("variables.tsx → tf.var / tf.local helpers", async () => {
    const result = await $`bun run src/cli.ts tests/fixtures/variables.tsx`.text();
    const expected = await Bun.file("tests/fixtures/variables.expected.tf").text();
    expect(result).toBe(expected);
  });

  it("--out-dir writes main.tf to directory", async () => {
    const tmpDir = (await $`mktemp -d`.text()).trim();
    try {
      await $`bun run src/cli.ts tests/fixtures/basic.tsx --out-dir ${tmpDir}`;
      const content = await Bun.file(`${tmpDir}/main.tf`).text();
      const expected = await Bun.file("tests/fixtures/basic.expected.tf").text();
      expect(content).toBe(expected);
    } finally {
      await $`rm -rf ${tmpDir}`;
    }
  });
});
