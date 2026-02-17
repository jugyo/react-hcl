/**
 * CLI entry point for react-hcl.
 *
 * Usage:
 *   - Forward mode: JSX/TSX -> HCL
 *   - Reverse mode: HCL -> JSX/TSX (`--hcl-react`)
 */

import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import parseArgv from "arg";
import * as esbuild from "esbuild";
import { detectConflicts } from "../conflict";
import { generate } from "../generator";
import { render } from "../renderer";
import { normalizeHclDocument } from "./hcl-react/normalize";
import { parseHclDocument } from "./hcl-react/parser";
import { generateTsxFromBlocks } from "./hcl-react/tsx-generator";
import { detectInputFormat } from "./input-format";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolvePackageEntrypoint(candidates: string[]): string {
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function parseArgs(argv: string[]): {
  inputFile: string;
  output?: string;
  help: boolean;
  hclReact: boolean;
  moduleOutput: boolean;
} {
  const args = parseArgv(
    {
      "--help": Boolean,
      "--output": String,
      "--hcl-react": Boolean,
      "--module": Boolean,
      "-h": "--help",
      "-o": "--output",
    },
    { argv: argv.slice(2), permissive: true },
  );

  return {
    inputFile: args._[0] ?? "",
    output: args["--output"],
    help: Boolean(args["--help"]),
    hclReact: Boolean(args["--hcl-react"]),
    moduleOutput: Boolean(args["--module"]),
  };
}

function printUsage() {
  console.error("Usage: react-hcl <input.(j|t)sx|-> [-o <file>]");
  console.error(
    "       react-hcl --hcl-react <input.tf|-> [-o <file>] [--module]",
  );
}

function printHelp() {
  process.stdout.write(
    [
      "react-hcl - Convert between JSX/TSX and Terraform HCL",
      "",
      "Usage:",
      "  react-hcl <input.(j|t)sx|-> [-o <file>]",
      "  react-hcl --hcl-react <input.tf|-> [-o <file>] [--module]",
      "  cat input.tsx | react-hcl [-o <file>]",
      "  cat input.tf | react-hcl --hcl-react [-o <file>] [--module]",
      "",
      "Options:",
      "  --hcl-react         Reverse mode: convert HCL to JSX/TSX",
      "  --module            Reverse mode: output import/export module format",
      "  -o, --output <file> Write output to file instead of stdout",
      "  -h, --help          Show help",
      "",
    ].join("\n"),
  );
}

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function writeOutput(text: string, output?: string) {
  if (output) {
    const resolvedOutput = resolve(output);
    await mkdir(dirname(resolvedOutput), { recursive: true });
    await writeFile(resolvedOutput, text);
    return;
  }

  process.stdout.write(text);
}

async function runForwardMode(options: {
  inputFile: string;
  wantsStdin: boolean;
  stdinContents: string;
  output?: string;
}) {
  const { inputFile, wantsStdin, stdinContents, output } = options;

  const buildBaseOptions: esbuild.BuildOptions = {
    bundle: true,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    jsxImportSource: "react-hcl",
    write: false,
    alias: {
      "react-hcl/jsx-runtime": resolvePackageEntrypoint([
        resolve(__dirname, "jsx-runtime.js"),
        resolve(__dirname, "../jsx-runtime.ts"),
      ]),
      "react-hcl": resolvePackageEntrypoint([
        resolve(__dirname, "index.js"),
        resolve(__dirname, "../index.ts"),
      ]),
    },
  };

  let result: esbuild.BuildResult;
  if (wantsStdin) {
    result = await esbuild.build({
      ...buildBaseOptions,
      stdin: {
        contents: stdinContents,
        loader: "tsx",
        resolveDir: process.cwd(),
        sourcefile: "stdin.tsx",
      },
    });
  } else {
    const absoluteInput = resolve(inputFile);
    result = await esbuild.build({
      ...buildBaseOptions,
      entryPoints: [absoluteInput],
    });
  }

  const outputFile = result.outputFiles?.[0];
  if (!outputFile) {
    throw new Error("esbuild did not produce any output file.");
  }
  const code = outputFile.text;

  const tmpDir = await mkdtemp(join(tmpdir(), "react-hcl-"));
  const tmpFile = join(tmpDir, "bundle.mjs");
  try {
    await writeFile(tmpFile, code);
    const mod = await import(tmpFile);

    if (mod.default != null) {
      const blocks = render(mod.default);
      detectConflicts(blocks);
      const hcl = generate(blocks);
      await writeOutput(hcl, output);
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

async function runReverseMode(options: {
  inputContents: string;
  moduleOutput: boolean;
  output?: string;
}) {
  const document = parseHclDocument(options.inputContents);
  const blocks = normalizeHclDocument(document);
  const tsx = generateTsxFromBlocks(blocks, {
    moduleOutput: options.moduleOutput,
  });
  await writeOutput(tsx, options.output);
}

async function main() {
  let parsedArgs: ReturnType<typeof parseArgs>;
  try {
    parsedArgs = parseArgs(process.argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    printUsage();
    process.exit(1);
  }

  const { inputFile, output, help, hclReact, moduleOutput } = parsedArgs;
  if (help) {
    printHelp();
    return;
  }

  const stdinContents = process.stdin.isTTY ? "" : await readStdin();
  const hasStdin = stdinContents.trim().length > 0;
  const wantsStdin = inputFile === "-" || (!inputFile && hasStdin);
  const hasFileInput = Boolean(inputFile && inputFile !== "-");

  if (hasFileInput && hasStdin) {
    console.error("Cannot use stdin and input file together.");
    printUsage();
    process.exit(1);
  }

  if (!hasFileInput && !wantsStdin) {
    printUsage();
    process.exit(1);
  }

  const inputContents = wantsStdin
    ? stdinContents
    : await readFile(resolve(inputFile), "utf8");

  const inputFormat = detectInputFormat({
    inputFile: hasFileInput ? inputFile : undefined,
    inputContents,
    explicitHclReact: hclReact,
  });

  if (inputFormat === "unknown") {
    console.error(
      "Could not detect input format. Use --hcl-react for HCL input or provide TSX/JSX explicitly.",
    );
    process.exit(1);
  }

  if (inputFormat === "tsx") {
    if (moduleOutput) {
      console.error("--module is only available in HCL reverse mode.");
      process.exit(1);
    }

    await runForwardMode({
      inputFile,
      wantsStdin,
      stdinContents,
      output,
    });
    return;
  }

  await runReverseMode({
    inputContents,
    moduleOutput,
    output,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
