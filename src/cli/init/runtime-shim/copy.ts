import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getRuntimeShimBaseDir } from "../paths";
import type { GeneratedOutputFile } from "../types";
import { listRuntimeDeclarationSources } from "./source";

export async function buildRuntimeDeclarationFiles(): Promise<
  GeneratedOutputFile[]
> {
  const runtimeShimBaseDir = getRuntimeShimBaseDir();
  const sources = await listRuntimeDeclarationSources();

  const files: GeneratedOutputFile[] = [];
  for (const source of sources) {
    files.push({
      path: join(runtimeShimBaseDir, source.relativePath),
      content: await readFile(source.sourcePath, "utf8"),
    });
  }

  return files;
}
