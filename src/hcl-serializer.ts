/**
 * HCL attribute serializer — converts JavaScript objects into HCL attribute syntax.
 *
 * The serializer chooses between:
 *   - Attribute syntax: key = value
 *   - Block syntax:     key { ... }
 *
 * Auto-classification order:
 *   1. Explicit marker wrappers: attribute()/block()
 *   2. Schema lookup (`blockType + type + key`)
 *   3. Fallback: plain objects -> attribute syntax
 */

import {
  getNestedBlockSchema,
  getTypeSchema,
  isRepeatableBlock,
  type NestedBlockSchema,
  type SerializationContext,
  type TerraformTypeSchema,
} from "./resource-schema";

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

type SerializationScope = TerraformTypeSchema | NestedBlockSchema | undefined;

export function serializeHCLAttributes(
  attrs: Record<string, any>,
  indent: number = 2,
  context?: SerializationContext,
  scope?: SerializationScope,
): string {
  const pad = " ".repeat(indent);
  const lines: string[] = [];

  const activeScope = scope ?? getTypeSchema(context);

  type SimpleEntry = { kind: "simple"; key: string; value: unknown };
  type BlockEntry =
    | {
        kind: "block";
        key: string;
        value: BlockHCL;
        schema?: NestedBlockSchema;
      }
    | { kind: "attribute"; key: string; value: AttributeHCL }
    | {
        kind: "repeated_block";
        key: string;
        value: Record<string, any>[];
        schema: NestedBlockSchema;
      };

  const simpleEntries: SimpleEntry[] = [];
  const blockEntries: BlockEntry[] = [];

  for (const [key, value] of Object.entries(attrs)) {
    const nestedBlockSchema = getNestedBlockSchema(context, key, activeScope);

    if (isAttributeHCL(value)) {
      blockEntries.push({ kind: "attribute", key, value });
      continue;
    }

    if (isBlockHCL(value)) {
      blockEntries.push({
        kind: "block",
        key,
        value,
        schema: nestedBlockSchema,
      });
      continue;
    }

    if (isPlainObject(value)) {
      if (nestedBlockSchema) {
        blockEntries.push({
          kind: "block",
          key,
          value: block(value),
          schema: nestedBlockSchema,
        });
      } else {
        blockEntries.push({ kind: "attribute", key, value: attribute(value) });
      }
      continue;
    }

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => isPlainObject(item)) &&
      nestedBlockSchema &&
      isRepeatableBlock(nestedBlockSchema)
    ) {
      blockEntries.push({
        kind: "repeated_block",
        key,
        value: value as Record<string, any>[],
        schema: nestedBlockSchema,
      });
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
          lines.push(
            serializeHCLAttributes(
              entry.value[i],
              indent + 2,
              context,
              entry.schema,
            ),
          );
          lines.push(`${pad}}`);
        }
        break;
      case "block":
        lines.push(`${pad}${entry.key} {`);
        lines.push(
          serializeHCLAttributes(
            entry.value.value,
            indent + 2,
            context,
            entry.schema,
          ),
        );
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
