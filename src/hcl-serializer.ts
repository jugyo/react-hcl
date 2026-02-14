/**
 * HCL attribute serializer — converts JavaScript objects into HCL attribute syntax.
 *
 * This module handles the serialization of key-value attribute pairs inside HCL blocks.
 * It distinguishes between two HCL syntactic forms:
 *
 *   1. Attribute syntax:  key = value     (uses `=` sign)
 *   2. Block syntax:      key { ... }     (no `=` sign, used for nested blocks)
 *
 * The serializer automatically determines which syntax to use based on:
 *   - Explicit BlockHCL marker → always block syntax
 *   - Key name in BLOCK_WHITELIST + plain object value → block syntax
 *   - Plain object value (not in whitelist) → attribute syntax with `=` (e.g. tags = { ... })
 *   - Array of plain objects → repeated block syntax (e.g. multiple ingress { } blocks)
 *   - Primitive values (string, number, boolean) and arrays of primitives → attribute syntax
 *
 * Two special marker types are provided for explicit control:
 *   - RawHCL: outputs a string value without quotes (for Terraform references like var.foo)
 *   - BlockHCL: forces block syntax for a nested object (overrides default heuristics)
 *
 * Formatting:
 *   - Simple attributes are aligned by padding key names to the same width
 *   - Block entries are separated from simple attributes by a blank line
 *   - Indentation increases by 2 spaces per nesting level (default starts at 2)
 */

/**
 * RawHCL — marker type for unquoted HCL expressions.
 *
 * In HCL, some values must not be quoted (e.g. variable references, function calls):
 *   vpc_id = aws_vpc.main.id       ← raw (no quotes)
 *   name   = "my-vpc"              ← string (quoted)
 *
 * Usage: raw("aws_vpc.main.id") produces a RawHCL value that serializes without quotes.
 * Also implements toString() so it can be used in template literals.
 *
 * Identified at runtime via a private Symbol key (not enumerable, collision-free).
 */
const RAW_HCL_SYMBOL = Symbol("RawHCL");

export type RawHCL = {
  [RAW_HCL_SYMBOL]: true;
  value: string;
};

/** Creates a RawHCL marker. The value string is emitted as-is (no quoting). */
export function raw(value: string): RawHCL {
  return {
    [RAW_HCL_SYMBOL]: true,
    value,
    toString() {
      return value;
    },
  };
}

/** Type guard for RawHCL values. Checks for the private Symbol key. */
export function isRawHCL(v: unknown): v is RawHCL {
  return typeof v === "object" && v !== null && RAW_HCL_SYMBOL in v;
}

/**
 * BlockHCL — marker type to force block syntax for a nested object.
 *
 * By default, a plain object value is rendered as attribute syntax: key = { ... }
 * Wrapping it with block() forces block syntax: key { ... } (no `=`)
 *
 * This is needed when the key name is not in BLOCK_WHITELIST but should still
 * use block syntax (e.g. custom nested blocks in provider-specific resources).
 *
 * Identified at runtime via a private Symbol key.
 */
const BLOCK_HCL_SYMBOL = Symbol("BlockHCL");

export type BlockHCL = {
  [BLOCK_HCL_SYMBOL]: true;
  value: Record<string, any>;
};

/** Creates a BlockHCL marker wrapping a plain object to force block syntax. */
export function block(value: Record<string, any>): BlockHCL {
  return { [BLOCK_HCL_SYMBOL]: true, value };
}

/** Type guard for BlockHCL values. Checks for the private Symbol key. */
export function isBlockHCL(v: unknown): v is BlockHCL {
  return typeof v === "object" && v !== null && BLOCK_HCL_SYMBOL in v;
}

/**
 * Well-known Terraform nested block names that should use block syntax automatically.
 * When a key matches one of these names and its value is a plain object,
 * it renders as: key { ... } instead of key = { ... }
 *
 * This avoids requiring users to wrap every lifecycle, ingress, etc. with block().
 */
const BLOCK_WHITELIST = new Set([
  "lifecycle",
  "ingress",
  "egress",
  "default_action",
  "health_check",
  "launch_template",
  "root_block_device",
  "network_interface",
  "metadata",
  "spec",
  "provisioner",
  "connection",
  "backend",
]);

/**
 * Serializes a single value into its HCL string representation.
 *
 * Conversion rules:
 *   - RawHCL    → as-is string (no quotes):      aws_vpc.main.id
 *   - string    → double-quoted:                 "hello"
 *   - number    → bare number:                   42
 *   - boolean   → bare boolean:                  true / false
 *   - array     → HCL list:                      ["a", "b", "c"]
 *   - other     → String() fallback
 */
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
  return String(value);
}

/** Checks if a value is a plain JS object (not array, not RawHCL, not BlockHCL). */
function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && !isRawHCL(v) && !isBlockHCL(v);
}

/**
 * Determines if a key-value pair should use block syntax (no `=`).
 * Returns true if:
 *   - Value is explicitly marked as BlockHCL, OR
 *   - Key is in BLOCK_WHITELIST and value is a plain object
 */
function isBlockSyntax(key: string, value: unknown): boolean {
  if (isBlockHCL(value)) return true;
  if (BLOCK_WHITELIST.has(key) && isPlainObject(value)) return true;
  return false;
}

/** Unwraps a BlockHCL marker to get its inner object, or returns the value as-is. */
function getBlockValue(value: unknown): Record<string, any> {
  if (isBlockHCL(value)) return value.value;
  return value as Record<string, any>;
}

/**
 * Serializes a Record of attributes into indented HCL lines.
 *
 * @param attrs - Key-value pairs to serialize
 * @param indent - Current indentation level in spaces (default: 2)
 * @returns Multi-line string of HCL attributes (without enclosing braces)
 *
 * Processing order:
 *   1. Entries are partitioned into simple attributes and block entries
 *   2. Simple attributes are rendered first, with keys aligned (padded to max key length)
 *   3. Block entries follow, separated from simple attrs by a blank line
 *
 * Entry classification:
 *   - BlockHCL or whitelisted key + object → block entry (block syntax, no `=`)
 *   - Plain object (not whitelisted)       → block entry (attribute syntax, with `=`)
 *   - Array of objects                     → block entry (repeated blocks)
 *   - Everything else                      → simple attribute
 *
 * Example output (indent=2):
 *   cidr_block           = "10.0.0.0/16"
 *   enable_dns_hostnames = true
 *
 *   lifecycle {
 *     create_before_destroy = true
 *   }
 */
export function serializeHCLAttributes(
  attrs: Record<string, any>,
  indent: number = 2,
): string {
  const pad = " ".repeat(indent);
  const lines: string[] = [];

  // Partition entries into simple (primitive) attributes and block (nested) entries
  const simpleEntries: [string, unknown][] = [];
  const blockEntries: [string, unknown][] = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (isBlockSyntax(key, value)) {
      blockEntries.push([key, value]);
    } else if (isPlainObject(value)) {
      // Plain object not in whitelist → attribute syntax: tags = { ... }
      blockEntries.push([key, value]);
    } else if (Array.isArray(value) && value.length > 0 && isPlainObject(value[0])) {
      // Array of objects → repeated block syntax: ingress { } ingress { }
      blockEntries.push([key, value]);
    } else {
      simpleEntries.push([key, value]);
    }
  }

  // Align simple attribute keys by padding to the longest key length
  const maxKeyLen = simpleEntries.reduce((max, [key]) => Math.max(max, key.length), 0);

  for (const [key, value] of simpleEntries) {
    const padding = " ".repeat(maxKeyLen - key.length);
    lines.push(`${pad}${key}${padding} = ${serializeValue(value)}`);
  }

  for (const [key, value] of blockEntries) {
    // Blank line separator between simple attrs and first block, or between blocks
    if (lines.length > 0) {
      lines.push("");
    }

    if (Array.isArray(value)) {
      // Array of objects → emit multiple blocks with the same key name
      for (let i = 0; i < value.length; i++) {
        if (i > 0) lines.push("");
        lines.push(`${pad}${key} {`);
        lines.push(serializeHCLAttributes(value[i], indent + 2));
        lines.push(`${pad}}`);
      }
    } else if (isBlockSyntax(key, value)) {
      // Block syntax (no `=`): key { ... }
      const inner = getBlockValue(value);
      lines.push(`${pad}${key} {`);
      lines.push(serializeHCLAttributes(inner, indent + 2));
      lines.push(`${pad}}`);
    } else {
      // Attribute syntax (with `=`): key = { ... }
      const inner = value as Record<string, any>;
      lines.push(`${pad}${key} = {`);
      lines.push(serializeHCLAttributes(inner, indent + 2));
      lines.push(`${pad}}`);
    }
  }

  return lines.join("\n");
}
