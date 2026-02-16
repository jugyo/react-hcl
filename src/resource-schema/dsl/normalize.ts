import type {
  AttributeSchema,
  NestedBlockNestingMode,
  NestedBlockSchema,
  ValueType,
} from "../types";
import type {
  AttrDef,
  AttrFlags,
  AttributeInput,
  BlockDef,
  BlockInput,
  NormalizeAttributes,
  NormalizeBlock,
  NormalizeBlocks,
} from "./types";

export function normalizeAttribute(attribute: AttributeInput): AttributeSchema {
  const flags = attribute as Partial<
    Pick<AttributeSchema, "required" | "optional" | "computed" | "sensitive">
  >;
  return {
    valueType: attribute.valueType,
    ...(flags.required === true ? { required: true } : {}),
    ...(flags.optional === true ? { optional: true } : {}),
    ...(flags.computed === true ? { computed: true } : {}),
    ...(flags.sensitive === true ? { sensitive: true } : {}),
  };
}

export function normalizeAttributes(
  attributes: Readonly<Record<string, AttributeInput>>,
): Record<string, AttributeSchema> {
  const normalized: Record<string, AttributeSchema> = {};
  for (const [name, attribute] of Object.entries(attributes)) {
    normalized[name] = normalizeAttribute(attribute);
  }
  return normalized;
}

export function normalizeBlocks(
  blocks?: Readonly<Record<string, BlockInput>>,
): Record<string, NestedBlockSchema> {
  if (!blocks) return {};

  const normalized: Record<string, NestedBlockSchema> = {};
  for (const [name, block] of Object.entries(blocks)) {
    normalized[name] = {
      nestingMode: block.nestingMode,
      ...(typeof block.minItems === "number"
        ? { minItems: block.minItems }
        : {}),
      ...(typeof block.maxItems === "number"
        ? { maxItems: block.maxItems }
        : {}),
      attributes: normalizeAttributes(block.attributes),
      ...(block.blocks ? { blocks: normalizeBlocks(block.blocks) } : {}),
    };
  }
  return normalized;
}

export function createBlock<
  const M extends NestedBlockNestingMode,
  const A extends Readonly<Record<string, AttributeInput>>,
  const B extends Readonly<Record<string, BlockInput>>,
>(
  nestingMode: M,
  definition: BlockDef<A, B>,
  options?: { minItems?: number; maxItems?: number },
): NormalizeBlock<{
  nestingMode: M;
  attributes: A;
  blocks?: B;
  minItems?: number;
  maxItems?: number;
}> {
  return {
    nestingMode,
    ...(typeof options?.minItems === "number"
      ? { minItems: options.minItems }
      : {}),
    ...(typeof options?.maxItems === "number"
      ? { maxItems: options.maxItems }
      : {}),
    attributes: normalizeAttributes(
      definition.attributes,
    ) as NormalizeAttributes<A>,
    ...(definition.blocks
      ? {
          blocks: normalizeBlocks(
            definition.blocks,
          ) as unknown as NormalizeBlocks<B>,
        }
      : {}),
  } as NormalizeBlock<{
    nestingMode: M;
    attributes: A;
    blocks?: B;
    minItems?: number;
    maxItems?: number;
  }>;
}

export function createAttribute<
  const V extends ValueType,
  const F extends AttrFlags,
>(valueType: V, flags?: F): AttrDef<V, F> {
  const normalizedFlags = flags ?? ({} as F);
  return {
    valueType,
    ...(normalizedFlags.required === true ? { required: true } : {}),
    ...(normalizedFlags.optional === true ? { optional: true } : {}),
    ...(normalizedFlags.computed === true ? { computed: true } : {}),
    ...(normalizedFlags.sensitive === true ? { sensitive: true } : {}),
  } as AttrDef<V, F>;
}
