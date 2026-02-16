import {
  createAttribute,
  createBlock,
  normalizeAttributes,
  normalizeBlocks,
} from "./normalize";
import type {
  AttrFlags,
  AttributeInput,
  BlockDef,
  BlockInput,
  EmptyObject,
  NormalizeAttributes,
  NormalizeBlocks,
  TypeSchema,
} from "./types";

export const attr = {
  string: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("string", flags),
  number: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("number", flags),
  bool: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("bool", flags),
  list: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("list", flags),
  set: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("set", flags),
  map: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("map", flags),
  object: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("object", flags),
  any: <const F extends AttrFlags = EmptyObject>(flags?: F) =>
    createAttribute("any", flags),
} as const;

export const block = {
  single: <
    const A extends Readonly<Record<string, AttributeInput>>,
    const B extends Readonly<Record<string, BlockInput>> = EmptyObject,
  >(
    definition: BlockDef<A, B>,
    options?: { minItems?: number; maxItems?: number },
  ) => createBlock("single", definition, options),
  list: <
    const A extends Readonly<Record<string, AttributeInput>>,
    const B extends Readonly<Record<string, BlockInput>> = EmptyObject,
  >(
    definition: BlockDef<A, B>,
    options?: { minItems?: number; maxItems?: number },
  ) => createBlock("list", definition, options),
  set: <
    const A extends Readonly<Record<string, AttributeInput>>,
    const B extends Readonly<Record<string, BlockInput>> = EmptyObject,
  >(
    definition: BlockDef<A, B>,
    options?: { minItems?: number; maxItems?: number },
  ) => createBlock("set", definition, options),
} as const;

export function resource<
  const T extends string,
  const A extends Readonly<Record<string, AttributeInput>>,
  const B extends Readonly<Record<string, BlockInput>> = EmptyObject,
>(
  type: T,
  schema: { attributes: A; blocks?: B },
): TypeSchema<"resource", T, A, B> {
  return {
    kind: "resource",
    type,
    attributes: normalizeAttributes(
      schema.attributes,
    ) as NormalizeAttributes<A>,
    blocks: normalizeBlocks(schema.blocks) as unknown as NormalizeBlocks<B>,
  } as TypeSchema<"resource", T, A, B>;
}

export function data<
  const T extends string,
  const A extends Readonly<Record<string, AttributeInput>>,
  const B extends Readonly<Record<string, BlockInput>> = EmptyObject,
>(type: T, schema: { attributes: A; blocks?: B }): TypeSchema<"data", T, A, B> {
  return {
    kind: "data",
    type,
    attributes: normalizeAttributes(
      schema.attributes,
    ) as NormalizeAttributes<A>,
    blocks: normalizeBlocks(schema.blocks) as unknown as NormalizeBlocks<B>,
  } as TypeSchema<"data", T, A, B>;
}
