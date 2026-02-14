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
 * Three marker types represent the HCL value categories:
 *   - RawHCL: outputs a string value without quotes (for Terraform references like var.foo)
 *   - BlockHCL: block syntax for a nested object (key { ... }, no `=`)
 *   - AttributeHCL: attribute syntax for a nested object (key = { ... }, with `=`)
 *
 * All three are user-facing — users can explicitly wrap values with raw(), block(), or attribute().
 * When no marker is specified, the serializer auto-classifies plain objects:
 *   - Key in BLOCK_WHITELIST → auto block()
 *   - Otherwise              → auto attribute()
 * Explicit markers always take precedence over auto-classification.
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
 * Identified at runtime via a global Symbol key (Symbol.for).
 * Global symbols are used because esbuild bundles inline this module, creating separate
 * copies in the bundle and the CLI process. Symbol.for() ensures both copies share the
 * same Symbol identity, so isRawHCL() works across the bundle boundary.
 */
const RAW_HCL_SYMBOL = Symbol.for("react-terraform:RawHCL");

export type RawHCL = {
  [RAW_HCL_SYMBOL]: true;
  value: string;
  toString(): string;
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
 * Identified at runtime via a global Symbol key (Symbol.for).
 * See RAW_HCL_SYMBOL for why global symbols are necessary.
 */
const BLOCK_HCL_SYMBOL = Symbol.for("react-terraform:BlockHCL");

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
 * AttributeHCL — marker type for attribute syntax with nested objects.
 *
 * Represents `key = { ... }` syntax (with `=`), as opposed to BlockHCL's `key { ... }`.
 *
 * Can be used explicitly to force attribute syntax even for BLOCK_WHITELIST keys:
 *   { lifecycle: attribute({ prevent_destroy: true }) }
 *   → lifecycle = { prevent_destroy = true }   (attribute syntax forced)
 *
 * When no marker is specified, plain objects not in the whitelist are auto-wrapped
 * as AttributeHCL during the classification phase.
 *
 * Identified at runtime via a global Symbol key (Symbol.for).
 * See RAW_HCL_SYMBOL for why global symbols are necessary.
 */
const ATTRIBUTE_HCL_SYMBOL = Symbol.for("react-terraform:AttributeHCL");

export type AttributeHCL = {
  [ATTRIBUTE_HCL_SYMBOL]: true;
  value: Record<string, any>;
};

/** Creates an AttributeHCL marker wrapping a plain object to force attribute syntax (key = { ... }). */
export function attribute(value: Record<string, any>): AttributeHCL {
  return { [ATTRIBUTE_HCL_SYMBOL]: true, value };
}

/** Type guard for AttributeHCL values. Checks for the private Symbol key. */
export function isAttributeHCL(v: unknown): v is AttributeHCL {
  return typeof v === "object" && v !== null && ATTRIBUTE_HCL_SYMBOL in v;
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

/** Checks if a value is a plain JS object (not array, not RawHCL, not BlockHCL, not AttributeHCL). */
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
 * Entry classification (explicit markers take precedence over auto-classification):
 *   - AttributeHCL (explicit)              → attribute syntax (key = { ... }), overrides whitelist
 *   - BlockHCL (explicit)                  → block syntax (key { ... })
 *   - Whitelisted key + plain object       → auto block() (key { ... })
 *   - Plain object (not whitelisted)       → auto attribute() (key = { ... })
 *   - Array of objects                     → repeated blocks (key { } key { })
 *   - Everything else                      → simple attribute (key = value)
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

  // Classify each entry into one of the explicit internal representations:
  //   - simple: primitive values rendered as `key = value`
  //   - BlockHCL: nested object rendered as `key { ... }` (no `=`)
  //   - AttributeHCL: nested object rendered as `key = { ... }` (with `=`)
  //   - array of objects: repeated blocks rendered as `key { } key { }`
  type SimpleEntry = { kind: "simple"; key: string; value: unknown };
  type BlockEntry =
    | { kind: "block"; key: string; value: BlockHCL }
    | { kind: "attribute"; key: string; value: AttributeHCL }
    | { kind: "repeated_block"; key: string; value: Record<string, any>[] };

  const simpleEntries: SimpleEntry[] = [];
  const blockEntries: BlockEntry[] = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (isAttributeHCL(value)) {
      // Explicit AttributeHCL marker → attribute syntax (overrides whitelist)
      blockEntries.push({ kind: "attribute", key, value });
    } else if (isBlockHCL(value)) {
      // Explicit BlockHCL marker → block syntax
      blockEntries.push({ kind: "block", key, value });
    } else if (BLOCK_WHITELIST.has(key) && isPlainObject(value)) {
      // Whitelisted key + plain object → auto block()
      blockEntries.push({ kind: "block", key, value: block(value) });
    } else if (isPlainObject(value)) {
      // Plain object not in whitelist → auto attribute()
      blockEntries.push({ kind: "attribute", key, value: attribute(value) });
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      isPlainObject(value[0])
    ) {
      // Array of objects → repeated block syntax
      blockEntries.push({
        kind: "repeated_block",
        key,
        value: value as Record<string, any>[],
      });
    } else {
      simpleEntries.push({ kind: "simple", key, value });
    }
  }

  // Align simple attribute keys by padding to the longest key length
  const maxKeyLen = simpleEntries.reduce(
    (max, e) => Math.max(max, e.key.length),
    0,
  );

  for (const { key, value } of simpleEntries) {
    const padding = " ".repeat(maxKeyLen - key.length);
    lines.push(`${pad}${key}${padding} = ${serializeValue(value)}`);
  }

  for (const entry of blockEntries) {
    // Blank line separator between simple attrs and first block, or between blocks
    if (lines.length > 0) {
      lines.push("");
    }

    switch (entry.kind) {
      case "repeated_block":
        // Array of objects → emit multiple blocks with the same key name
        for (let i = 0; i < entry.value.length; i++) {
          if (i > 0) lines.push("");
          lines.push(`${pad}${entry.key} {`);
          lines.push(serializeHCLAttributes(entry.value[i], indent + 2));
          lines.push(`${pad}}`);
        }
        break;
      case "block":
        // BlockHCL → block syntax (no `=`): key { ... }
        lines.push(`${pad}${entry.key} {`);
        lines.push(serializeHCLAttributes(entry.value.value, indent + 2));
        lines.push(`${pad}}`);
        break;
      case "attribute":
        // AttributeHCL → attribute syntax (with `=`): key = { ... }
        lines.push(`${pad}${entry.key} = {`);
        lines.push(serializeHCLAttributes(entry.value.value, indent + 2));
        lines.push(`${pad}}`);
        break;
    }
  }

  return lines.join("\n");
}

/**
 * Adjusts indentation of a multi-line HCL string.
 *
 * 1. Strips leading and trailing blank lines
 * 2. Computes the minimum indentation across non-empty lines
 * 3. Re-indents all lines to the target indentation level
 *
 * @param text - Raw multi-line string (e.g. from JSX children)
 * @param targetIndent - Desired indentation in number of spaces (default: 2)
 * @returns Re-indented string
 */
export function adjustIndent(text: string, targetIndent: number = 2): string {
  // Split and strip leading/trailing blank lines
  const rawLines = text.split("\n");
  let start = 0;
  while (start < rawLines.length && rawLines[start].trim() === "") start++;
  let end = rawLines.length - 1;
  while (end > start && rawLines[end].trim() === "") end--;
  const lines = rawLines.slice(start, end + 1);

  if (lines.length === 0) return "";

  // Compute minimum indentation (ignoring empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const leadingSpaces = line.match(/^( *)/)?.[1].length;
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
