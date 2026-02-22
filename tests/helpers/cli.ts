import { execa } from "execa";

export function runCli(args: string[], input?: string) {
  return execa(
    process.execPath,
    ["--import", "tsx", "src/cli/index.ts", ...args],
    {
      input,
      reject: false,
      stdin: input === undefined ? "ignore" : "pipe",
      stripFinalNewline: false,
    },
  );
}
