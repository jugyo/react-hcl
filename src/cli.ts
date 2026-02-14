/**
 * CLI entry point for react-terraform.
 *
 * Usage: bun src/cli.ts <input.tsx>
 *
 * Pipeline overview:
 *   1. Takes a user-authored .tsx file as input
 *   2. Transpiles and bundles it with esbuild (JSX → custom runtime calls)
 *   3. Writes the bundled ESM code to a temp file and dynamically imports it
 *   4. Renders the default export (a JSXElement tree) into a string
 *   5. Prints the result to stdout
 *
 * esbuild configuration:
 *   - jsx: "automatic" — uses the new JSX transform (no manual import needed)
 *   - jsxImportSource: "react-terraform" — resolves jsx/jsxs from our custom runtime
 *   - alias: maps "react-terraform" and "react-terraform/jsx-runtime" to local source
 *     so that esbuild bundles our runtime code directly (no npm resolution needed)
 *   - format: "esm" — output as ES modules for dynamic import() compatibility
 *   - bundle: true — inline all imports so the temp file is self-contained
 *   - write: false — keep output in memory (outputFiles) instead of writing to disk
 *
 * Note: This is the Step 2 PoC implementation. In later steps, the render function
 * will be replaced with a more sophisticated renderer that produces Block[] IR
 * and passes it through generate() to emit proper HCL.
 */

import * as esbuild from "esbuild";
import { resolve, dirname, join } from "path";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { fileURLToPath } from "url";
import type { JSXElement } from "./jsx-runtime";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively renders a JSXElement tree into a string.
 *
 * Rendering rules:
 *   - null/undefined → empty string
 *   - string/number/boolean → converted to string directly
 *   - array → each element rendered and joined with newlines
 *   - JSXElement with function type → call the component function with { ...props, children }
 *     and recursively render the result (this is how component composition works)
 *   - anything else → String() fallback
 *
 * This is a simplified renderer for the Step 2 PoC. It does not yet produce Block[] IR.
 */
function render(element: unknown): string {
  if (element == null) return "";
  if (typeof element === "string") return element;
  if (typeof element === "number" || typeof element === "boolean") return String(element);
  if (Array.isArray(element)) return element.map(render).join("\n");

  const el = element as JSXElement;
  if (typeof el.type === "function") {
    return render(el.type({ ...el.props, children: el.children }));
  }
  return String(element);
}

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: react-terraform <input.tsx>");
    process.exit(1);
  }

  const absoluteInput = resolve(inputFile);

  // Step 1: Transpile and bundle the TSX input with esbuild
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

  // Step 2: Write bundled code to a temp file and import it
  // We use a temp file because dynamic import() requires a file path or URL.
  // The temp directory is cleaned up in the finally block.
  const tmpDir = await mkdtemp(join(tmpdir(), "react-terraform-"));
  const tmpFile = join(tmpDir, "bundle.mjs");
  try {
    await writeFile(tmpFile, code);
    const mod = await import(tmpFile);
    // Step 3: Render the default export (JSXElement tree) and print to stdout
    if (mod.default != null) {
      console.log(render(mod.default));
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
