import { resolve } from "node:path";

export function getReactHclBaseDir(cwd = process.cwd()): string {
  return resolve(cwd, ".react-hcl");
}

export function getGenBaseDir(cwd = process.cwd()): string {
  return resolve(getReactHclBaseDir(cwd), "gen");
}

export function getRuntimeShimBaseDir(cwd = process.cwd()): string {
  return resolve(getGenBaseDir(cwd), "react-hcl");
}

export function getGeneratedMetadataPath(cwd = process.cwd()): string {
  return resolve(getGenBaseDir(cwd), "metadata.json");
}

export function getProviderSchemaBaseDir(cwd = process.cwd()): string {
  return resolve(getReactHclBaseDir(cwd), "provider-schema");
}

export function getRuntimeMetadataPath(cwd = process.cwd()): string {
  return resolve(getReactHclBaseDir(cwd), "metadata.json");
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
