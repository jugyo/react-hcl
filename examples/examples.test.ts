import { describe, expect, it } from "bun:test";
import { globSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const examplesDir = import.meta.dir;

const examples = readdirSync(examplesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("Examples", () => {
  for (const example of examples) {
    const inputDir = join(examplesDir, example, "input");
    const outputDir = join(examplesDir, example, "output");
    // Each main.tsx is a compilation target (other .tsx files are helper components)
    const tsxFiles = globSync("**/main.tsx", { cwd: inputDir }).sort();

    for (const tsxFile of tsxFiles) {
      const tfFile = tsxFile.replace(/\.tsx$/, ".tf");
      const label = tsxFiles.length === 1 ? example : `${example}/${tsxFile}`;

      it(label, async () => {
        const inputPath = join(inputDir, tsxFile);
        const expectedPath = join(outputDir, tfFile);

        const result =
          await $`bun run src/cli/index.ts generate ${inputPath}`.text();
        const expected = await Bun.file(expectedPath).text();
        expect(result).toBe(expected);
      });
    }
  }
});
