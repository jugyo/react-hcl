/**
 * HCL attribute serializer — converts JavaScript objects into HCL attribute syntax.
 *
 * The serializer chooses between:
 *   - Attribute syntax: key = value
 *   - Block syntax:     key { ... }
 *
 * Auto-classification order:
 *   1. Explicit marker wrappers: attribute()/block()
 *   2. Fallback: plain objects -> attribute syntax
 */
import type {
  TerraformAttributeSchema,
  TerraformBlockSchema,
  TerraformNestedBlockSchema,
} from "./cli/init/types";

export type SerializationContext = {
  blockType: "resource" | "data" | "provider";
  type: string;
  schemaBlock?: TerraformBlockSchema | null;
};

function toValueType(
  terraformType: unknown,
): "string" | "number" | "bool" | "list" | "set" | "map" | "object" | "any" {
  if (terraformType === "string") return "string";
  if (terraformType === "number") return "number";
  if (terraformType === "bool") return "bool";

  if (Array.isArray(terraformType) && terraformType.length > 0) {
    const head = terraformType[0];
    if (head === "list" || head === "tuple") return "list";
    if (head === "set") return "set";
    if (head === "map") return "map";
    if (head === "object") return "object";
  }

  return "any";
}

function isComputedOnlyAttribute(schema: TerraformAttributeSchema): boolean {
  return (
    schema.computed === true &&
    schema.required !== true &&
    schema.optional !== true
  );
}

function isValueCompatibleWithAttributeType(
  value: unknown,
  terraformType: unknown,
): boolean {
  if (isRawHCL(value)) {
    return true;
  }

  const valueType = toValueType(terraformType);
  switch (valueType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "bool":
      return typeof value === "boolean";
    case "list":
    case "set":
      return Array.isArray(value);
    case "map":
    case "object":
      return isPlainObject(value);
    case "any":
      return true;
  }
}

function isBlockObject(value: unknown): value is Record<string, unknown> {
  if (isBlockHCL(value) || isAttributeHCL(value) || isRawHCL(value)) {
    return false;
  }
  return isPlainObject(value);
}

function isBlockObjectArray(
  value: unknown,
): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every((item) => isBlockObject(item));
}

function validateNestedBlockValueForMode(
  value: unknown,
  schema: TerraformNestedBlockSchema,
): void {
  if (isRawHCL(value) || isBlockHCL(value) || isAttributeHCL(value)) {
    return;
  }

  const nestingMode = schema.nesting_mode;
  const isObject = isBlockObject(value);
  const isArray = isBlockObjectArray(value);

  if (nestingMode === "single") {
    if (!isObject) {
      throw new Error("single");
    }
    return;
  }

  if (nestingMode === "list" || nestingMode === "set") {
    // Keep compatibility with generated types that allow single object shorthand.
    if (!isObject && !isArray) {
      throw new Error(nestingMode);
    }
    return;
  }

  if (!isObject && !isArray) {
    throw new Error(nestingMode);
  }
}

function validateSchemaAgainstAttrs(
  attrs: Record<string, any>,
  schemaBlock: TerraformBlockSchema,
  context: SerializationContext,
): void {
  const attributes = schemaBlock.attributes ?? {};
  const blockTypes = schemaBlock.block_types ?? {};

  for (const [name, attributeSchema] of Object.entries(attributes)) {
    if (attributeSchema.required !== true) {
      continue;
    }
    if (attributeSchema.computed === true) {
      continue;
    }
    if (!(name in attrs)) {
      throw new Error(
        `Missing required attribute "${name}" for ${context.blockType} "${context.type}".`,
      );
    }
  }

  for (const [name, nestedSchema] of Object.entries(blockTypes)) {
    if ((nestedSchema.min_items ?? 0) > 0 && !(name in attrs)) {
      throw new Error(
        `Missing required nested block "${name}" for ${context.blockType} "${context.type}".`,
      );
    }
  }
}

const RAW_HCL_SYMBOL = Symbol.for("react-hcl:RawHCL");

export type RawHCL = {
  [RAW_HCL_SYMBOL]: true;
  value: string;
  toString(): string;
};

export function raw(value: string): RawHCL {
  return {
    [RAW_HCL_SYMBOL]: true,
    value,
    toString() {
      return value;
    },
  };
}

export function isRawHCL(v: unknown): v is RawHCL {
  return typeof v === "object" && v !== null && RAW_HCL_SYMBOL in v;
}

const BLOCK_HCL_SYMBOL = Symbol.for("react-hcl:BlockHCL");

export type BlockHCL = {
  [BLOCK_HCL_SYMBOL]: true;
  value: Record<string, any>;
};

export function block(value: Record<string, any>): BlockHCL {
  return { [BLOCK_HCL_SYMBOL]: true, value };
}

export function isBlockHCL(v: unknown): v is BlockHCL {
  return typeof v === "object" && v !== null && BLOCK_HCL_SYMBOL in v;
}

const ATTRIBUTE_HCL_SYMBOL = Symbol.for("react-hcl:AttributeHCL");

export type AttributeHCL = {
  [ATTRIBUTE_HCL_SYMBOL]: true;
  value: Record<string, any>;
};

export function attribute(value: Record<string, any>): AttributeHCL {
  return { [ATTRIBUTE_HCL_SYMBOL]: true, value };
}

export function isAttributeHCL(v: unknown): v is AttributeHCL {
  return typeof v === "object" && v !== null && ATTRIBUTE_HCL_SYMBOL in v;
}

function isPlainObject(v: unknown): v is Record<string, any> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !isRawHCL(v) &&
    !isBlockHCL(v) &&
    !isAttributeHCL(v)
  );
}

function serializeObjectLiteral(value: Record<string, any>): string {
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  const inner = entries
    .map(([k, v]) => `${k} = ${serializeValue(v)}`)
    .join(", ");
  return `{ ${inner} }`;
}

function serializeValue(value: unknown): string {
  if (isRawHCL(value)) {
    return value.value;
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const items = value.map((item) => serializeValue(item));
    return `[${items.join(", ")}]`;
  }
  if (isBlockHCL(value) || isAttributeHCL(value)) {
    return serializeObjectLiteral(value.value);
  }
  if (isPlainObject(value)) {
    return serializeObjectLiteral(value);
  }
  return String(value);
}

function isArrayOfBlockHCL(value: unknown[]): value is BlockHCL[] {
  return value.every((item) => isBlockHCL(item));
}

export function serializeHCLAttributes(
  attrs: Record<string, any>,
  indent: number = 2,
  context?: SerializationContext,
): string {
  const pad = " ".repeat(indent);
  const lines: string[] = [];

  type SimpleEntry = { kind: "simple"; key: string; value: unknown };
  type BlockEntry =
    | { kind: "block"; key: string; value: BlockHCL }
    | { kind: "attribute"; key: string; value: AttributeHCL }
    | { kind: "repeated_block"; key: string; value: Record<string, any>[] };

  const simpleEntries: SimpleEntry[] = [];
  const blockEntries: BlockEntry[] = [];
  const schemaBlock = context?.schemaBlock ?? null;
  if (schemaBlock && context) {
    validateSchemaAgainstAttrs(attrs, schemaBlock, context);
  }

  for (const [key, value] of Object.entries(attrs)) {
    const attributeSchema = schemaBlock?.attributes?.[key];
    const nestedBlockSchema = schemaBlock?.block_types?.[key];
    if (schemaBlock && !attributeSchema && !nestedBlockSchema) {
      throw new Error(
        `Unknown key "${key}" for ${context?.blockType ?? "block"} "${context?.type ?? "unknown"}".`,
      );
    }

    if (isAttributeHCL(value)) {
      if (attributeSchema && isComputedOnlyAttribute(attributeSchema)) {
        throw new Error(
          `Attribute "${key}" for ${context?.blockType ?? "block"} "${context?.type ?? "unknown"}" is computed-only and cannot be set.`,
        );
      }
      blockEntries.push({ kind: "attribute", key, value });
      continue;
    }

    if (isBlockHCL(value)) {
      blockEntries.push({ kind: "block", key, value });
      continue;
    }

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.some((item) => isBlockHCL(item))
    ) {
      if (!isArrayOfBlockHCL(value)) {
        throw new Error(
          `Invalid mixed BlockHCL array for key "${key}": arrays must contain only block() values when using block arrays.`,
        );
      }
      blockEntries.push({
        kind: "repeated_block",
        key,
        value: value.map((item) => item.value),
      });
      continue;
    }

    if (attributeSchema) {
      if (isComputedOnlyAttribute(attributeSchema)) {
        throw new Error(
          `Attribute "${key}" for ${context?.blockType ?? "block"} "${context?.type ?? "unknown"}" is computed-only and cannot be set.`,
        );
      }
      if (!isValueCompatibleWithAttributeType(value, attributeSchema.type)) {
        throw new Error(
          `Attribute "${key}" for ${context?.blockType ?? "block"} "${context?.type ?? "unknown"}" has an invalid value type.`,
        );
      }
    }

    if (nestedBlockSchema) {
      try {
        validateNestedBlockValueForMode(value, nestedBlockSchema);
      } catch {
        throw new Error(
          `Nested block "${key}" for ${context?.blockType ?? "block"} "${context?.type ?? "unknown"}" does not match nesting_mode "${nestedBlockSchema.nesting_mode}".`,
        );
      }

      if (isRawHCL(value)) {
        simpleEntries.push({ kind: "simple", key, value });
        continue;
      }

      if (isBlockObject(value)) {
        blockEntries.push({
          kind: "block",
          key,
          value: block(value as Record<string, any>),
        });
        continue;
      }

      if (isBlockObjectArray(value)) {
        blockEntries.push({
          kind: "repeated_block",
          key,
          value: value as Record<string, any>[],
        });
        continue;
      }

      throw new Error(
        `Nested block "${key}" for ${context?.blockType ?? "block"} "${context?.type ?? "unknown"}" has an invalid value shape.`,
      );
    }

    if (isPlainObject(value)) {
      blockEntries.push({ kind: "attribute", key, value: attribute(value) });
      continue;
    }

    simpleEntries.push({ kind: "simple", key, value });
  }

  const maxKeyLen = simpleEntries.reduce(
    (max, e) => Math.max(max, e.key.length),
    0,
  );

  for (const { key, value } of simpleEntries) {
    const padding = " ".repeat(maxKeyLen - key.length);
    lines.push(`${pad}${key}${padding} = ${serializeValue(value)}`);
  }

  for (const entry of blockEntries) {
    if (lines.length > 0) {
      lines.push("");
    }

    switch (entry.kind) {
      case "repeated_block":
        for (let i = 0; i < entry.value.length; i++) {
          if (i > 0) lines.push("");
          lines.push(`${pad}${entry.key} {`);
          lines.push(serializeHCLAttributes(entry.value[i], indent + 2));
          lines.push(`${pad}}`);
        }
        break;
      case "block":
        lines.push(`${pad}${entry.key} {`);
        lines.push(serializeHCLAttributes(entry.value.value, indent + 2));
        lines.push(`${pad}}`);
        break;
      case "attribute":
        lines.push(`${pad}${entry.key} = {`);
        lines.push(serializeHCLAttributes(entry.value.value, indent + 2));
        lines.push(`${pad}}`);
        break;
    }
  }

  return lines.join("\n");
}

export function adjustIndent(text: string, targetIndent: number = 2): string {
  const rawLines = text.split("\n");
  let start = 0;
  while (start < rawLines.length && rawLines[start].trim() === "") start++;
  let end = rawLines.length - 1;
  while (end > start && rawLines[end].trim() === "") end--;
  const lines = rawLines.slice(start, end + 1);

  if (lines.length === 0) return "";

  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const leadingSpaces = line.search(/\S|$/);
    if (leadingSpaces < minIndent) minIndent = leadingSpaces;
  }
  if (minIndent === Infinity) minIndent = 0;

  const pad = " ".repeat(targetIndent);
  return lines
    .map((line) => {
      if (line.trim() === "") return "";
      return pad + line.slice(minIndent);
    })
    .join("\n");
}
