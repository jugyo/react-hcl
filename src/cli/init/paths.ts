import { resolve } from "node:path";

export function getGenBaseDir(cwd = process.cwd()): string {
  return resolve(cwd, ".react-hcl", "gen");
}

export function getRuntimeShimBaseDir(cwd = process.cwd()): string {
  return resolve(getGenBaseDir(cwd), "react-hcl");
}

export function getMetadataPath(cwd = process.cwd()): string {
  return resolve(getGenBaseDir(cwd), "metadata.json");
}

export function getTsconfigPath(cwd = process.cwd()): string {
  return resolve(cwd, "tsconfig.json");
}

export function getBundledDeclarationRootCandidates(
  moduleDir: string,
): string[] {
  return [
    resolve(moduleDir),
    resolve(moduleDir, "../../../dist"),
    resolve(moduleDir, "../../../../dist"),
    resolve(moduleDir, "../../../../../dist"),
  ];
}

export function getPackageJsonPathCandidates(moduleDir: string): string[] {
  return [
    resolve(moduleDir, "../../../package.json"),
    resolve(moduleDir, "../../../../package.json"),
    resolve(moduleDir, "../../../../../package.json"),
  ];
}
