/**
 * CLI entry point for react-hcl.
 *
 * Usage: bun src/cli.ts <input.(j|t)sx|-> [-o <file>]
 *        cat input.jsx | bun src/cli.ts [-o <file>]
 *
 * Pipeline:
 *   1. Takes a user-authored JSX/TSX file as input
 *   2. Transpiles and bundles it with esbuild (JSX → custom runtime calls)
 *   3. Writes the bundled ESM code to a temp file and dynamically imports it
 *   4. render() evaluates the JSXElement tree into Block[] IR
 *   5. generate() converts Block[] into HCL string
 *   6. Outputs to stdout, or writes to a file if -o / --output is given
 *
 * esbuild configuration:
 *   - jsx: "automatic" — uses the new JSX transform (no manual import needed)
 *   - jsxImportSource: "react-hcl" — resolves jsx/jsxs from our custom runtime
 *   - alias: maps "react-hcl" and "react-hcl/jsx-runtime" to local source
 *   - format: "esm" — output as ES modules for dynamic import() compatibility
 *   - bundle: true — inline all imports so the temp file is self-contained
 *   - write: false — keep output in memory (outputFiles) instead of writing to disk
 */

import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import parseArgv from "arg";
import * as esbuild from "esbuild";
import { detectConflicts } from "./conflict";
import { generate } from "./generator";
import { render } from "./renderer";

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
} {
  const args = parseArgv(
    {
      "--help": Boolean,
      "--output": String,
      "-h": "--help",
      "-o": "--output",
    },
    { argv: argv.slice(2), permissive: true },
  );

  return {
    inputFile: args._[0] ?? "",
    output: args["--output"],
    help: Boolean(args["--help"]),
  };
}

function printUsage() {
  console.error("Usage: react-hcl <input.(j|t)sx|-> [-o <file>]");
}

function printHelp() {
  process.stdout.write(
    [
      "react-hcl - Convert JSX/TSX to Terraform HCL",
      "",
      "Usage:",
      "  react-hcl <input.(j|t)sx|-> [-o <file>]",
      "  cat input.jsx | react-hcl [-o <file>]",
      "",
      "Options:",
      "  -o, --output <file>  Write output to file instead of stdout",
      "  -h, --help           Show help",
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

  const { inputFile, output, help } = parsedArgs;
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
        resolve(__dirname, "../src/jsx-runtime.ts"),
      ]),
      "react-hcl": resolvePackageEntrypoint([
        resolve(__dirname, "index.js"),
        resolve(__dirname, "../src/index.ts"),
      ]),
    },
  };

  let result: esbuild.BuildResult;
  if (wantsStdin) {
    if (!hasStdin) {
      printUsage();
      process.exit(1);
    }
    result = await esbuild.build({
      ...buildBaseOptions,
      stdin: {
        contents: stdinContents,
        loader: "tsx",
        resolveDir: process.cwd(),
        sourcefile: "stdin.tsx",
      },
    });
  } else if (inputFile) {
    const absoluteInput = resolve(inputFile);
    result = await esbuild.build({
      ...buildBaseOptions,
      entryPoints: [absoluteInput],
    });
  } else {
    printUsage();
    process.exit(1);
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

      if (output) {
        const resolvedOutput = resolve(output);
        await mkdir(dirname(resolvedOutput), { recursive: true });
        await writeFile(resolvedOutput, hcl);
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
