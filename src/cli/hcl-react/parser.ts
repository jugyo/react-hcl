import { parseToObject } from "hcl2-parser";

export function parseHclDocument(input: string): Record<string, any> {
  const [result, err] = parseToObject(input);
  if (result === null || err !== null) {
    throw new Error(`Failed to parse HCL: ${JSON.stringify(err)}`);
  }
  if (typeof result !== "object" || result === null || Array.isArray(result)) {
    throw new Error(
      "Failed to parse HCL: parser returned a non-object document.",
    );
  }
  return result as Record<string, any>;
}
