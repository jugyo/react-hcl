import type {
  AttributeSchema,
  NestedBlockNestingMode,
  NestedBlockSchema,
  SchemaKind,
  ValueType,
} from "./types";

/**
 * Internal DSL for Terraform schema definitions.
 *
 * Core API:
 * - Attribute builder: `attr.string({ required: true })`
 * - Block builder: `block.single(...)`, `block.list(..., { minItems, maxItems })`
 * - Type builder: `resource("aws_xxx", { ... })`, `data("aws_xxx", { ... })`
 */
type AttrFlags = {
  required?: true;
  optional?: true;
  computed?: true;
  sensitive?: true;
};
type EmptyObject = Record<never, never>;

type FlagIfTrue<
  T extends { [K in P]?: unknown },
  P extends keyof T,
> = T[P] extends true ? { [K in P]: true } : EmptyObject;

export type AttrDef<
  V extends ValueType = ValueType,
  F extends AttrFlags = EmptyObject,
> = Readonly<
  {
    valueType: V;
  } & FlagIfTrue<F, "required"> &
    FlagIfTrue<F, "optional"> &
    FlagIfTrue<F, "computed"> &
    FlagIfTrue<F, "sensitive">
>;

type AttributeInput =
  | AttributeSchema
  | Readonly<AttributeSchema>
  | AttrDef<ValueType, AttrFlags>;

type NormalizeAttribute<A extends AttributeInput> = Readonly<
  {
    valueType: A["valueType"];
  } & FlagIfTrue<A, "required"> &
    FlagIfTrue<A, "optional"> &
    FlagIfTrue<A, "computed"> &
    FlagIfTrue<A, "sensitive">
>;

type NormalizeAttributes<A extends Readonly<Record<string, AttributeInput>>> = {
  [K in keyof A]: NormalizeAttribute<A[K]>;
};

type BlockInput = {
  nestingMode: NestedBlockNestingMode;
  minItems?: number;
  maxItems?: number;
  attributes: Readonly<Record<string, AttributeInput>>;
  blocks?: Readonly<Record<string, BlockInput>>;
};

type BlockDef<
  A extends Readonly<Record<string, AttributeInput>>,
  B extends Readonly<Record<string, BlockInput>> = EmptyObject,
> = {
  attributes: A;
  blocks?: B;
};

type MaybeMin<B extends { minItems?: number }> = B extends {
  minItems: infer M extends number;
}
  ? { minItems: M }
  : EmptyObject;

type MaybeMax<B extends { maxItems?: number }> = B extends {
  maxItems: infer M extends number;
}
  ? { maxItems: M }
  : EmptyObject;

type BlockEntries<T> =
  NonNullable<T> extends Readonly<Record<string, BlockInput>>
    ? NonNullable<T>
    : never;

type MaybeBlocks<B extends { blocks?: Readonly<Record<string, BlockInput>> }> =
  [keyof BlockEntries<B["blocks"]>] extends [never]
    ? EmptyObject
    : { blocks: NormalizeBlocks<BlockEntries<B["blocks"]>> };

type NormalizeBlock<B extends BlockInput> = Readonly<
  {
    nestingMode: B["nestingMode"];
    attributes: NormalizeAttributes<B["attributes"]>;
  } & MaybeMin<B> &
    MaybeMax<B> &
    MaybeBlocks<B>
>;

type NormalizeBlocks<B extends Readonly<Record<string, BlockInput>>> = {
  [K in keyof B]: NormalizeBlock<B[K]>;
};

type TypeSchema<
  K extends SchemaKind,
  T extends string,
  A extends Readonly<Record<string, AttributeInput>>,
  B extends Readonly<Record<string, BlockInput>>,
> = Readonly<{
  kind: K;
  type: T;
  attributes: NormalizeAttributes<A>;
  blocks: NormalizeBlocks<B>;
}>;

function normalizeAttribute(attribute: AttributeInput): AttributeSchema {
  return {
    valueType: attribute.valueType,
    ...(attribute.required === true ? { required: true } : {}),
    ...(attribute.optional === true ? { optional: true } : {}),
    ...(attribute.computed === true ? { computed: true } : {}),
    ...(attribute.sensitive === true ? { sensitive: true } : {}),
  };
}

function normalizeAttributes(
  attributes: Readonly<Record<string, AttributeInput>>,
): Record<string, AttributeSchema> {
  const normalized: Record<string, AttributeSchema> = {};
  for (const [name, attribute] of Object.entries(attributes)) {
    normalized[name] = normalizeAttribute(attribute);
  }
  return normalized;
}

function normalizeBlocks(
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

function createBlock<
  const M extends NestedBlockNestingMode,
  const A extends Readonly<Record<string, AttributeInput>>,
  const B extends Readonly<Record<string, BlockInput>> = EmptyObject,
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

function createAttribute<const V extends ValueType, const F extends AttrFlags>(
  valueType: V,
  flags?: F,
): AttrDef<V, F> {
  const normalizedFlags = flags ?? ({} as F);
  return {
    valueType,
    ...(normalizedFlags.required === true ? { required: true } : {}),
    ...(normalizedFlags.optional === true ? { optional: true } : {}),
    ...(normalizedFlags.computed === true ? { computed: true } : {}),
    ...(normalizedFlags.sensitive === true ? { sensitive: true } : {}),
  } as AttrDef<V, F>;
}

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
