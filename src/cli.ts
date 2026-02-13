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

  // esbuild で TSX をトランスパイル（バンドル）
  const result = await esbuild.build({
    entryPoints: [absoluteInput],
    bundle: true,
    format: "esm",
    platform: "node",
    // カスタム JSX ランタイムを使用
    jsx: "automatic",
    jsxImportSource: "react-terraform",
    write: false,
    // react-terraform パッケージを外部化せず、ソースからバンドルする
    alias: {
      "react-terraform/jsx-runtime": resolve(__dirname, "../src/jsx-runtime.ts"),
      "react-terraform": resolve(__dirname, "../src/index.ts"),
    },
  });

  const code = result.outputFiles[0].text;

  // 一時ファイルに書き出して動的インポート
  const tmpDir = await mkdtemp(join(tmpdir(), "react-terraform-"));
  const tmpFile = join(tmpDir, "bundle.mjs");
  try {
    await writeFile(tmpFile, code);
    const mod = await import(tmpFile);
    // default export を評価結果として出力
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
