/**
 * CLI entry point for react-terraform.
 *
 * Usage: bun src/cli.ts <input.tsx> [--out-dir <dir>]
 *
 * Pipeline:
 *   1. Takes a user-authored .tsx file as input
 *   2. Transpiles and bundles it with esbuild (JSX → custom runtime calls)
 *   3. Writes the bundled ESM code to a temp file and dynamically imports it
 *   4. render() evaluates the JSXElement tree into Block[] IR
 *   5. generate() converts Block[] into HCL string
 *   6. Outputs to stdout, or writes to <out-dir>/main.tf if --out-dir is given
 *
 * esbuild configuration:
 *   - jsx: "automatic" — uses the new JSX transform (no manual import needed)
 *   - jsxImportSource: "react-terraform" — resolves jsx/jsxs from our custom runtime
 *   - alias: maps "react-terraform" and "react-terraform/jsx-runtime" to local source
 *   - format: "esm" — output as ES modules for dynamic import() compatibility
 *   - bundle: true — inline all imports so the temp file is self-contained
 *   - write: false — keep output in memory (outputFiles) instead of writing to disk
 */

import * as esbuild from "esbuild";
import { resolve, dirname, join } from "path";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm, mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import { render } from "./renderer";
import { generate } from "./generator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseArgs(argv: string[]): { inputFile: string; outDir?: string } {
  const args = argv.slice(2);
  let inputFile: string | undefined;
  let outDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out-dir" && i + 1 < args.length) {
      outDir = args[++i];
    } else if (!inputFile) {
      inputFile = args[i];
    }
  }

  if (!inputFile) {
    console.error("Usage: react-terraform <input.tsx> [--out-dir <dir>]");
    process.exit(1);
  }

  return { inputFile: inputFile!, outDir };
}

async function main() {
  const { inputFile, outDir } = parseArgs(process.argv);
  const absoluteInput = resolve(inputFile);

  const result = await esbuild.build({
    entryPoints: [absoluteInput],
    bundle: true,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    jsxImportSource: "react-terraform",
    write: false,
    alias: {
      "react-terraform/jsx-runtime": resolve(__dirname, "../src/jsx-runtime.ts"),
      "react-terraform": resolve(__dirname, "../src/index.ts"),
    },
  });

  const code = result.outputFiles[0].text;

  const tmpDir = await mkdtemp(join(tmpdir(), "react-terraform-"));
  const tmpFile = join(tmpDir, "bundle.mjs");
  try {
    await writeFile(tmpFile, code);
    const mod = await import(tmpFile);

    if (mod.default != null) {
      const blocks = render(mod.default);
      const hcl = generate(blocks);

      if (outDir) {
        const resolvedOutDir = resolve(outDir);
        await mkdir(resolvedOutDir, { recursive: true });
        await writeFile(join(resolvedOutDir, "main.tf"), hcl);
      } else {
        process.stdout.write(hcl);
      }
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
