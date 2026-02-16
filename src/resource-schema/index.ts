import { AWS_DATA_SCHEMAS, AWS_RESOURCE_SCHEMAS } from "./aws";
import type {
  NestedBlockSchema,
  SerializationContext,
  TerraformTypeSchema,
} from "./types";

function getProviderPrefix(type: string): string {
  const idx = type.indexOf("_");
  return idx === -1 ? type : type.slice(0, idx);
}

export function getTypeSchema(
  context: SerializationContext | undefined,
): TerraformTypeSchema | undefined {
  if (!context) return undefined;
  const provider = getProviderPrefix(context.type);
  if (provider !== "aws") return undefined;

  if (context.blockType === "resource") {
    return (AWS_RESOURCE_SCHEMAS as Record<string, TerraformTypeSchema>)[
      context.type
    ];
  }
  return (AWS_DATA_SCHEMAS as Record<string, TerraformTypeSchema>)[
    context.type
  ];
}

export function getNestedBlockSchema(
  context: SerializationContext | undefined,
  blockName: string,
  currentScope?: TerraformTypeSchema | NestedBlockSchema,
): NestedBlockSchema | undefined {
  if (currentScope) {
    return currentScope.blocks?.[blockName];
  }
  return getTypeSchema(context)?.blocks[blockName];
}

export function isRepeatableBlock(blockSchema: NestedBlockSchema): boolean {
  return (
    blockSchema.nestingMode === "list" || blockSchema.nestingMode === "set"
  );
}

export type {
  AttributeSchema,
  NestedBlockSchema,
  SchemaKind,
  SerializationContext,
  TerraformTypeSchema,
  ValueType,
} from "./types";
