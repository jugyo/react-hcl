#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

/** @typedef {{[k: string]: string|boolean}} ArgMap */

/** @typedef {{type: unknown, required?: boolean, optional?: boolean, computed?: boolean, sensitive?: boolean}} TerraformAttributeSchema */
/** @typedef {{nesting_mode: string, min_items?: number, max_items?: number, block: TerraformBlockSchema}} TerraformBlockTypeSchema */
/** @typedef {{attributes?: Record<string, TerraformAttributeSchema>, block_types?: Record<string, TerraformBlockTypeSchema>}} TerraformBlockSchema */
/** @typedef {{block: TerraformBlockSchema}} TerraformTypeEntry */
/** @typedef {{resource_schemas?: Record<string, TerraformTypeEntry>, data_source_schemas?: Record<string, TerraformTypeEntry>}} TerraformProviderSchema */
/** @typedef {{provider_schemas: Record<string, TerraformProviderSchema>}} TerraformProvidersSchema */

function parseArgs(argv) {
  /** @type {ArgMap} */
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      args[name] = true;
      continue;
    }
    args[name] = value;
    i += 1;
  }
  return args;
}

function requireStringArg(args, key) {
  const value = args[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`--${key} is required`);
  }
  return value;
}

function toPascalCase(input) {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function toExportName(kind, typeName) {
  const pascal = toPascalCase(typeName);
  const lower = pascal[0].toLowerCase() + pascal.slice(1);
  return kind === "resource" ? `${lower}ResourceSchema` : `${lower}DataSchema`;
}

function mapValueType(attrType) {
  if (typeof attrType === "string") {
    if (
      ["string", "number", "bool", "list", "set", "map", "object"].includes(
        attrType,
      )
    ) {
      return attrType;
    }
    return "any";
  }

  if (Array.isArray(attrType) && attrType.length > 0) {
    const head = attrType[0];
    if (head === "list" || head === "set" || head === "map") return head;
    if (head === "object") return "object";
    if (head === "tuple") return "list";
  }

  return "any";
}

function mapNestingMode(mode) {
  if (mode === "single" || mode === "list" || mode === "set") return mode;
  if (mode === "group") return "single";
  return "list";
}

function mapNestingModeWithConstraints(mode, maxItems) {
  const normalized = mapNestingMode(mode);
  if ((normalized === "list" || normalized === "set") && maxItems === 1) {
    return "single";
  }
  return normalized;
}

function synthesizeBlockTypeFromAttribute(attribute) {
  const attrType = attribute.type;
  if (!Array.isArray(attrType) || attrType.length < 2) return undefined;

  const collectionKind = attrType[0];
  const elementType = attrType[1];
  if (collectionKind !== "list" && collectionKind !== "set") return undefined;
  if (!Array.isArray(elementType) || elementType.length < 2) return undefined;
  if (elementType[0] !== "object") return undefined;
  if (
    typeof elementType[1] !== "object" ||
    elementType[1] === null ||
    Array.isArray(elementType[1])
  ) {
    return undefined;
  }

  const objectFields = elementType[1];
  const objectAttributes = {};
  for (const [fieldName, fieldType] of Object.entries(objectFields)) {
    objectAttributes[fieldName] = {
      type: fieldType,
      optional: true,
    };
  }

  return {
    nesting_mode: collectionKind,
    block: {
      attributes: objectAttributes,
    },
  };
}

function renderAttribute(schema) {
  const parts = [`valueType: "${mapValueType(schema.type)}"`];
  if (schema.required) parts.push("required: true");
  if (schema.optional) parts.push("optional: true");
  if (schema.computed) parts.push("computed: true");
  if (schema.sensitive) parts.push("sensitive: true");
  return `{ ${parts.join(", ")} }`;
}

function renderAttributeDsl(schema) {
  const valueType = mapValueType(schema.type);
  const hasRequired = schema.required === true;
  const hasOptional = schema.optional === true;
  const hasComputed = schema.computed === true;
  const hasSensitive = schema.sensitive === true;

  const optionParts = [];
  if (hasRequired) optionParts.push("required: true");
  if (hasOptional) optionParts.push("optional: true");
  if (hasComputed) optionParts.push("computed: true");
  if (hasSensitive) optionParts.push("sensitive: true");

  if (optionParts.length === 0) {
    return `attr.${valueType}()`;
  }
  return `attr.${valueType}({ ${optionParts.join(", ")} })`;
}

function renderAttributes(attributes, indent, options = { useDsl: true }) {
  const lines = [];
  const entries = Object.entries(attributes ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [name, schema] of entries) {
    lines.push(
      `${indent}${name}: ${options.useDsl ? renderAttributeDsl(schema) : renderAttribute(schema)},`,
    );
  }
  return lines;
}

function renderBlockField(name, blockType, indent) {
  const mode = mapNestingModeWithConstraints(
    blockType.nesting_mode,
    blockType.max_items,
  );
  const lines = [];
  lines.push(`${indent}${name}: block.${mode}(`);
  lines.push(`${indent}  {`);
  lines.push(`${indent}    attributes: {`);
  lines.push(
    ...renderAttributes(blockType.block.attributes, `${indent}      `, {
      useDsl: true,
    }),
  );
  lines.push(`${indent}    },`);

  const nestedEntries = Object.entries(blockType.block.block_types ?? {}).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  if (nestedEntries.length > 0) {
    lines.push(`${indent}    blocks: {`);
    for (const [nestedName, nestedType] of nestedEntries) {
      lines.push(
        ...renderBlockField(nestedName, nestedType, `${indent}      `),
      );
    }
    lines.push(`${indent}    },`);
  }

  lines.push(`${indent}  },`);

  const optionParts = [];
  if (typeof blockType.min_items === "number") {
    optionParts.push(`minItems: ${blockType.min_items}`);
  }
  if (typeof blockType.max_items === "number") {
    optionParts.push(`maxItems: ${blockType.max_items}`);
  }
  if (optionParts.length > 0) {
    lines.push(`${indent}  { ${optionParts.join(", ")} },`);
  }

  lines.push(`${indent}),`);
  return lines;
}

function hasAttributesInBlockTypes(blockTypes) {
  for (const blockType of Object.values(blockTypes ?? {})) {
    if (Object.keys(blockType.block.attributes ?? {}).length > 0) {
      return true;
    }
    if (hasAttributesInBlockTypes(blockType.block.block_types)) {
      return true;
    }
  }
  return false;
}

function renderTypeSchema({
  kind,
  typeName,
  exportName,
  entry,
  includeCommon,
}) {
  const lines = [];
  const normalizedBlockTypes = {
    ...(entry.block.block_types ?? {}),
  };
  const normalizedAttributes = {};

  for (const [attrName, attrSchema] of Object.entries(
    entry.block.attributes ?? {},
  )) {
    if (normalizedBlockTypes[attrName]) {
      continue;
    }

    const synthesized = synthesizeBlockTypeFromAttribute(attrSchema);
    if (synthesized) {
      normalizedBlockTypes[attrName] = synthesized;
      continue;
    }

    normalizedAttributes[attrName] = attrSchema;
  }

  if (kind === "resource" && includeCommon) {
    lines.push(
      'import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";',
    );
  }
  const hasGeneratedAttributes = Object.keys(normalizedAttributes).length > 0;
  const hasGeneratedBlocks = Object.keys(normalizedBlockTypes).length > 0;
  const hasAnyDslAttributes =
    hasGeneratedAttributes || hasAttributesInBlockTypes(normalizedBlockTypes);
  const dslImports = [
    ...(hasAnyDslAttributes ? ["attr"] : []),
    ...(hasGeneratedBlocks ? ["block"] : []),
    kind === "resource" ? "resource" : "data",
  ];
  lines.push(`import { ${dslImports.join(", ")} } from "../../dsl";`);
  lines.push("");
  lines.push(
    `export const ${exportName} = ${kind === "resource" ? "resource" : "data"}(`,
  );
  lines.push(`  "${typeName}",`);
  lines.push("  {");
  lines.push("    attributes: {");
  if (kind === "resource" && includeCommon) {
    lines.push("      ...COMMON_RESOURCE_ATTRIBUTES,");
  }
  lines.push(
    ...renderAttributes(normalizedAttributes, "      ", { useDsl: true }),
  );
  lines.push("    },");
  lines.push("    blocks: {");
  if (kind === "resource" && includeCommon) {
    lines.push("      ...COMMON_RESOURCE_BLOCKS,");
  }

  const blocks = Object.entries(normalizedBlockTypes).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [blockName, blockType] of blocks) {
    lines.push(...renderBlockField(blockName, blockType, "      "));
  }

  lines.push("    },");
  lines.push("  },");
  lines.push(");");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const schemaJsonPath = requireStringArg(args, "schema-json");
  const kind = requireStringArg(args, "kind");
  const typeName = requireStringArg(args, "type");
  const outPath = requireStringArg(args, "out");

  if (kind !== "resource" && kind !== "data") {
    throw new Error("--kind must be resource or data");
  }

  const providerAddress =
    typeof args["provider-address"] === "string"
      ? args["provider-address"]
      : "registry.terraform.io/hashicorp/aws";
  const includeCommon = kind === "resource" ? !args["no-common"] : false;
  const exportName =
    typeof args.export === "string" && args.export.length > 0
      ? args.export
      : toExportName(kind, typeName);

  const source = readFileSync(schemaJsonPath, "utf8");
  /** @type {TerraformProvidersSchema} */
  const parsed = JSON.parse(source);
  const providerSchema = parsed.provider_schemas[providerAddress];
  if (!providerSchema) {
    throw new Error(`provider schema not found: ${providerAddress}`);
  }

  const bucket =
    kind === "resource"
      ? providerSchema.resource_schemas
      : providerSchema.data_source_schemas;
  if (!bucket) {
    throw new Error(`no ${kind} schemas for provider: ${providerAddress}`);
  }

  const entry = bucket[typeName];
  if (!entry) {
    throw new Error(`${kind} type not found: ${typeName}`);
  }

  const output = renderTypeSchema({
    kind,
    typeName,
    exportName,
    entry,
    includeCommon,
  });
  writeFileSync(outPath, output, "utf8");
  console.log(`wrote ${outPath}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`error: ${message}`);
  console.error(
    [
      "usage:",
      "  generate-react-hcl-schema.mjs --schema-json /tmp/schema.json --kind resource --type aws_autoscaling_group --out src/resource-schema/aws/resource/aws_autoscaling_group.ts",
    ].join("\n"),
  );
  process.exit(1);
}
