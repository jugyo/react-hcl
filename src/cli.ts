import * as esbuild from "esbuild";
import { resolve, dirname, join } from "path";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { fileURLToPath } from "url";
import type { JSXElement } from "./jsx-runtime";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  // Transpile and bundle TSX with esbuild
  const result = await esbuild.build({
    entryPoints: [absoluteInput],
    bundle: true,
    format: "esm",
    platform: "node",
    // Use custom JSX runtime
    jsx: "automatic",
    jsxImportSource: "react-terraform",
    write: false,
    // Bundle react-terraform from source instead of treating it as external
    alias: {
      "react-terraform/jsx-runtime": resolve(__dirname, "../src/jsx-runtime.ts"),
      "react-terraform": resolve(__dirname, "../src/index.ts"),
    },
  });

  const code = result.outputFiles[0].text;

  // Write to a temp file and dynamically import it
  const tmpDir = await mkdtemp(join(tmpdir(), "react-terraform-"));
  const tmpFile = join(tmpDir, "bundle.mjs");
  try {
    await writeFile(tmpFile, code);
    const mod = await import(tmpFile);
    // Render the default export as output
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
