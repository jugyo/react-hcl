// Type for outputting HCL references without quotes
const RAW_HCL_SYMBOL = Symbol("RawHCL");

export type RawHCL = {
  [RAW_HCL_SYMBOL]: true;
  value: string;
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

// Marker type to explicitly output as block syntax (key { ... })
const BLOCK_HCL_SYMBOL = Symbol("BlockHCL");

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

function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && !isRawHCL(v) && !isBlockHCL(v);
}

function isBlockSyntax(key: string, value: unknown): boolean {
  if (isBlockHCL(value)) return true;
  if (BLOCK_WHITELIST.has(key) && isPlainObject(value)) return true;
  return false;
}

function getBlockValue(value: unknown): Record<string, any> {
  if (isBlockHCL(value)) return value.value;
  return value as Record<string, any>;
}

export function serializeHCLAttributes(
  attrs: Record<string, any>,
  indent: number = 2,
): string {
  const pad = " ".repeat(indent);
  const lines: string[] = [];

  // Separate simple attributes and block entries
  const simpleEntries: [string, unknown][] = [];
  const blockEntries: [string, unknown][] = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (isBlockSyntax(key, value)) {
      blockEntries.push([key, value]);
    } else if (isPlainObject(value)) {
      // attribute syntax object (tags = { ... })
      blockEntries.push([key, value]);
    } else if (Array.isArray(value) && value.length > 0 && isPlainObject(value[0])) {
      // object array → multiple blocks
      blockEntries.push([key, value]);
    } else {
      simpleEntries.push([key, value]);
    }
  }

  // Calculate max key length for alignment among simple attributes
  const maxKeyLen = simpleEntries.reduce((max, [key]) => Math.max(max, key.length), 0);

  for (const [key, value] of simpleEntries) {
    const padding = " ".repeat(maxKeyLen - key.length);
    lines.push(`${pad}${key}${padding} = ${serializeValue(value)}`);
  }

  for (const [key, value] of blockEntries) {
    if (lines.length > 0) {
      lines.push("");
    }

    if (Array.isArray(value)) {
      // object[] → multiple blocks
      for (let i = 0; i < value.length; i++) {
        if (i > 0) lines.push("");
        lines.push(`${pad}${key} {`);
        lines.push(serializeHCLAttributes(value[i], indent + 2));
        lines.push(`${pad}}`);
      }
    } else if (isBlockSyntax(key, value)) {
      // block syntax (no =)
      const inner = getBlockValue(value);
      lines.push(`${pad}${key} {`);
      lines.push(serializeHCLAttributes(inner, indent + 2));
      lines.push(`${pad}}`);
    } else {
      // attribute syntax (with =)
      const inner = value as Record<string, any>;
      lines.push(`${pad}${key} = {`);
      lines.push(serializeHCLAttributes(inner, indent + 2));
      lines.push(`${pad}}`);
    }
  }

  return lines.join("\n");
}
