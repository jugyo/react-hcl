import { createHash } from "node:crypto";
import { resolve } from "node:path";

export function stableStringify(value: unknown): string {
  // Deterministic JSON-like serialization used for stable hashing/fingerprints.
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );

  const parts = entries.map(
    ([key, nestedValue]) =>
      `${JSON.stringify(key)}:${stableStringify(nestedValue)}`,
  );

  return `{${parts.join(",")}}`;
}

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function relativeToCwd(path: string): string {
  const cwd = resolve(process.cwd());
  return path.startsWith(cwd) ? path.slice(cwd.length + 1) : path;
}
