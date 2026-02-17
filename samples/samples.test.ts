import { describe, expect, it } from "bun:test";
import { globSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const samplesDir = import.meta.dir;

const samples = readdirSync(samplesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("Samples", () => {
  for (const sample of samples) {
    const inputDir = join(samplesDir, sample, "input");
    const outputDir = join(samplesDir, sample, "output");
    // Each main.tsx is a compilation target (other .tsx files are helper components)
    const tsxFiles = globSync("**/main.tsx", { cwd: inputDir }).sort();

    for (const tsxFile of tsxFiles) {
      const tfFile = tsxFile.replace(/\.tsx$/, ".tf");
      const label = tsxFiles.length === 1 ? sample : `${sample}/${tsxFile}`;

      it(label, async () => {
        const inputPath = join(inputDir, tsxFile);
        const expectedPath = join(outputDir, tfFile);

        const result = await $`bun run src/cli/index.ts ${inputPath}`.text();
        const expected = await Bun.file(expectedPath).text();
        expect(result).toBe(expected);
      });
    }
  }
});
