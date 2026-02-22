import { globSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runCli } from "../tests/helpers/cli";

const examplesDir = fileURLToPath(new URL(".", import.meta.url));

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

        const result = await runCli(["generate", inputPath]);
        const expected = readFileSync(expectedPath, "utf8");
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(expected);
      });
    }
  }
});
