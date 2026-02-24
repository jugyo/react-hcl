/**
 * CLI entry point for react-hcl.
 *
 * Usage:
 *   - generate: JSX/TSX -> HCL
 *   - reverse: HCL -> JSX/TSX
 */

import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import * as esbuild from "esbuild";
import { detectConflicts } from "../conflict";
import { generate } from "../generator";
import { render } from "../renderer";
import {
  loadRuntimeSchemaRegistry,
  type RuntimeSchemaRegistry,
} from "../provider-schema";
import { formatCliError } from "./error-format";
import { normalizeHclDocument } from "./hcl-react/normalize";
import { parseHclDocument } from "./hcl-react/parser";
import { generateTsxFromBlocks } from "./hcl-react/tsx-generator";
import { runInitCommand } from "./init";

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
  schemaRegistry: RuntimeSchemaRegistry;
}) {
  const { inputFile, wantsStdin, stdinContents, output, schemaRegistry } =
    options;

  const buildBaseOptions: esbuild.BuildOptions = {
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "silent",
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
      const hcl = generate(blocks, { schemaRegistry });
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

async function resolveInputMode(inputFile: string): Promise<{
  wantsStdin: boolean;
  stdinContents: string;
}> {
  const stdinContents = process.stdin.isTTY ? "" : await readStdin();
  const hasStdin = stdinContents.trim().length > 0;
  const wantsStdin = inputFile === "-";
  const hasFileInput = inputFile !== "-";

  if (hasFileInput && hasStdin) {
    throw new Error("Cannot use stdin and input file together.");
  }

  if (wantsStdin && !hasStdin) {
    throw new Error("Stdin input is required when input is '-'.");
  }

  return { wantsStdin, stdinContents };
}

async function runGenerateCommand(options: {
  inputFile: string;
  output?: string;
}) {
  const { wantsStdin, stdinContents } = await resolveInputMode(
    options.inputFile,
  );
  const schemaRegistry = loadRuntimeSchemaRegistry({ required: true });

  await runForwardMode({
    inputFile: options.inputFile,
    wantsStdin,
    stdinContents,
    output: options.output,
    schemaRegistry,
  });
}

async function runReverseCommand(options: {
  inputFile: string;
  output?: string;
  moduleOutput: boolean;
}) {
  const { wantsStdin, stdinContents } = await resolveInputMode(
    options.inputFile,
  );
  const inputContents = wantsStdin
    ? stdinContents
    : await readFile(resolve(options.inputFile), "utf8");

  await runReverseMode({
    inputContents,
    moduleOutput: options.moduleOutput,
    output: options.output,
  });
}

async function main() {
  const program = new Command();
  program
    .name("react-hcl")
    .description("Convert between JSX/TSX and Terraform HCL")
    .showHelpAfterError();

  program
    .command("generate")
    .description("Convert JSX/TSX to Terraform HCL")
    .argument("<input>", "Input TSX/JSX file path or '-' for stdin")
    .option("-o, --output <file>", "Write output to file instead of stdout")
    .addHelpText(
      "after",
      [
        "",
        "Examples:",
        "  react-hcl generate infra.tsx",
        "  react-hcl generate infra.tsx -o ./tf/main.tf",
        "  cat infra.tsx | react-hcl generate -",
      ].join("\n"),
    )
    .action(async (inputFile: string, options: { output?: string }) => {
      await runGenerateCommand({ inputFile, output: options.output });
    });

  program
    .command("reverse")
    .description("Convert Terraform HCL to JSX/TSX")
    .argument("<input>", "Input .tf file path or '-' for stdin")
    .option("-o, --output <file>", "Write output to file instead of stdout")
    .option("--module", "Output import/export module format")
    .addHelpText(
      "after",
      [
        "",
        "Examples:",
        "  react-hcl reverse main.tf",
        "  react-hcl reverse --module main.tf",
        "  cat main.tf | react-hcl reverse - -o ./src/main.tsx",
      ].join("\n"),
    )
    .action(
      async (
        inputFile: string,
        options: { output?: string; module?: boolean },
      ) => {
        await runReverseCommand({
          inputFile,
          output: options.output,
          moduleOutput: Boolean(options.module),
        });
      },
    );

  program
    .command("init")
    .description(
      "Fetch Terraform provider schema and generate TypeScript declarations",
    )
    .option(
      "--refresh",
      "Ignore cache TTL and refresh provider schema from Terraform CLI",
    )
    .addHelpText(
      "after",
      ["", "Examples:", "  react-hcl init", "  react-hcl init --refresh"].join(
        "\n",
      ),
    )
    .action(async (options: { refresh?: boolean }) => {
      await runInitCommand({
        refresh: Boolean(options.refresh),
      });
    });

  if (process.argv.slice(2).length === 0) {
    program.outputHelp();
    return;
  }

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(formatCliError(err));
  process.exit(1);
});
