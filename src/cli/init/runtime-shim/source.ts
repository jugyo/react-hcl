import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getBundledDeclarationRootCandidates } from "../paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolveBundledDeclarationRoot(): string {
  const candidates = getBundledDeclarationRootCandidates(__dirname);

  for (const candidate of candidates) {
    if (
      existsSync(join(candidate, "index.d.ts")) &&
      existsSync(join(candidate, "jsx-runtime.d.ts"))
    ) {
      return candidate;
    }
  }

  throw new Error(
    "Bundled declaration files were not found. Reinstall react-hcl or run `bun run build:types` in development.",
  );
}

async function collectDeclarationFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectDeclarationFiles(fullPath)));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".d.ts")) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

export async function listRuntimeDeclarationSources(): Promise<
  Array<{ sourcePath: string; relativePath: string }>
> {
  const declarationRoot = resolveBundledDeclarationRoot();
  const declarationFiles = await collectDeclarationFiles(declarationRoot);

  return declarationFiles
    .map((sourcePath) => ({
      sourcePath,
      relativePath: relative(declarationRoot, sourcePath),
    }))
    .filter(({ relativePath }) => {
      const [firstSegment] = relativePath.split(/[\\/]+/);
      // Only runtime/library declarations are needed for user TSX type resolution.
      // CLI declarations are intentionally excluded until module boundaries are
      // separated in a future multi-module package layout.
      return firstSegment !== "cli";
    });
}
