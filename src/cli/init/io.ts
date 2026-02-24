import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function atomicWrite(
  path: string,
  content: string,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempFile = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tempFile, content);
  await rename(tempFile, path);
}
