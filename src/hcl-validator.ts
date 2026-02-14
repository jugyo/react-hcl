/**
 * HCL validator for innerText content.
 *
 * Wraps the raw HCL body in a dummy resource block and parses it with hcl2-parser
 * to detect syntax errors before emitting invalid Terraform.
 */

import { parseToObject } from "hcl2-parser";

/**
 * Validates an innerText HCL string by wrapping it in a dummy resource block
 * and parsing with hcl2-parser.
 *
 * @param hclText - The raw HCL body text (already indented)
 * @throws Error if the HCL is syntactically invalid
 */
export function validateInnerTextHCL(hclText: string): void {
  const wrapped = `resource "__validate__" "__check__" {\n${hclText}\n}`;
  const [result, err] = parseToObject(wrapped);
  if (result === null || err !== null) {
    throw new Error(
      `Invalid HCL in innerText:\n${hclText}\n\nParse error: ${JSON.stringify(err)}`,
    );
  }
}
