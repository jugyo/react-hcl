import { describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const samplesDir = import.meta.dir;

const samples = readdirSync(samplesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("Samples", () => {
  for (const sample of samples) {
    it(sample, async () => {
      const inputPath = join(samplesDir, sample, "input/main.tsx");
      const expectedPath = join(samplesDir, sample, "output/main.tf");

      const result = await $`bun run src/cli.ts ${inputPath}`.text();
      const expected = await Bun.file(expectedPath).text();
      expect(result).toBe(expected);
    });
  }
});
