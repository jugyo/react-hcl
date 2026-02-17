import { extname } from "node:path";

export type InputFormat = "tsx" | "hcl" | "unknown";

interface DetectInputFormatOptions {
  inputFile?: string;
  inputContents: string;
  explicitHclReact: boolean;
}

const HCL_PATTERNS = [
  /^\s*(resource|data|module|provider|variable|output|locals|terraform)\b/m,
  /^\s*#/m,
  /\b(required_providers|backend|depends_on)\b/m,
];

const TSX_PATTERNS = [
  /import\s+.*\s+from\s+["']react-hcl["']/m,
  /export\s+default/m,
  /<(Resource|Data|Module|Provider|Variable|Output|Locals|Terraform)\b/m,
  /jsxImportSource\s*=\s*["']react-hcl["']/m,
];

function score(patterns: RegExp[], input: string): number {
  return patterns.reduce(
    (total, pattern) => total + (pattern.test(input) ? 1 : 0),
    0,
  );
}

export function detectInputFormat(
  options: DetectInputFormatOptions,
): InputFormat {
  const { inputFile, inputContents, explicitHclReact } = options;
  if (explicitHclReact) {
    return "hcl";
  }

  if (inputFile) {
    const ext = extname(inputFile).toLowerCase();
    if (ext === ".tf" || ext === ".hcl") {
      return "hcl";
    }
    if (ext === ".tsx" || ext === ".jsx" || ext === ".ts" || ext === ".js") {
      return "tsx";
    }
  }

  const hclScore = score(HCL_PATTERNS, inputContents);
  const tsxScore = score(TSX_PATTERNS, inputContents);

  if (hclScore === 0 && tsxScore === 0) {
    return "unknown";
  }
  if (hclScore === tsxScore) {
    return "unknown";
  }

  return hclScore > tsxScore ? "hcl" : "tsx";
}
