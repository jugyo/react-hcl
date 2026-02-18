import { isAbsolute, relative } from "node:path";

const MAX_DISPLAY_ERRORS = 5;

function formatLocationFile(file: string): string {
  if (file === "<stdin>" || file === "stdin" || file === "stdin.tsx") {
    return "stdin.tsx";
  }

  if (!isAbsolute(file)) {
    return file;
  }

  const relativePath = relative(process.cwd(), file);
  if (relativePath.length === 0) {
    return ".";
  }

  return relativePath;
}

function formatEsbuildErrors(err: unknown): string | null {
  if (typeof err !== "object" || err === null || !("errors" in err)) {
    return null;
  }

  const maybeErrors = (err as { errors?: unknown }).errors;
  if (!Array.isArray(maybeErrors) || maybeErrors.length === 0) {
    return null;
  }

  const displayedErrors = maybeErrors.slice(0, MAX_DISPLAY_ERRORS);
  const lines = displayedErrors.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      return `${index + 1}. ${String(entry)}`;
    }

    const text =
      "text" in entry && typeof entry.text === "string"
        ? entry.text
        : "Unknown build error";

    if (
      "location" in entry &&
      typeof entry.location === "object" &&
      entry.location !== null
    ) {
      const location = entry.location as {
        file?: unknown;
        line?: unknown;
        column?: unknown;
      };
      const file = typeof location.file === "string" ? location.file : null;
      const line = typeof location.line === "number" ? location.line : null;
      const column =
        typeof location.column === "number" ? location.column : null;

      if (file !== null && line !== null && column !== null) {
        return `${index + 1}. ${formatLocationFile(file)}:${line}:${column}: ${text}`;
      }
    }

    return `${index + 1}. ${text}`;
  });

  const summary = `Build failed with ${maybeErrors.length} error${maybeErrors.length === 1 ? "" : "s"}:`;
  const remainingCount = maybeErrors.length - displayedErrors.length;

  if (remainingCount > 0) {
    return `${summary}\n${lines.join("\n")}\n...and ${remainingCount} more error${remainingCount === 1 ? "" : "s"}.`;
  }

  return `${summary}\n${lines.join("\n")}`;
}

function formatNodeFsError(err: unknown): string | null {
  if (typeof err !== "object" || err === null) {
    return null;
  }

  const maybeErr = err as {
    code?: unknown;
    path?: unknown;
    syscall?: unknown;
    message?: unknown;
  };

  const code = typeof maybeErr.code === "string" ? maybeErr.code : null;
  const path = typeof maybeErr.path === "string" ? maybeErr.path : null;
  const syscall =
    typeof maybeErr.syscall === "string" ? maybeErr.syscall : null;

  if (code === null || path === null) {
    return null;
  }

  const displayPath = formatLocationFile(path);
  if (code === "ENOENT" && syscall === "open") {
    return `Input file not found: ${displayPath}`;
  }

  return `${code}: ${syscall ?? "operation"} failed for ${displayPath}`;
}

export function formatCliError(err: unknown): string {
  const esbuildMessage = formatEsbuildErrors(err);
  if (esbuildMessage !== null) {
    return esbuildMessage;
  }

  const nodeFsMessage = formatNodeFsError(err);
  if (nodeFsMessage !== null) {
    return nodeFsMessage;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return String(err);
}
