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
 * Goal:
 * - Reduce handwritten schema noise in `src/resource-schema/aws/**`.
 * - Keep provider schema information (`required`/`optional`/`computed`) explicit.
 * - Preserve literal types so `StrictResourceProps` can infer input constraints.
 *
 * Core API:
 * - Attribute builder: `attr.string().required()`, `attr.bool().computed()`
 * - Block builder: `block.single(...)`, `block.list(..., { minItems, maxItems })`
 * - Type builder: `resource("aws_xxx", { ... })`, `data("aws_xxx", { ... })`
 *
 * Modifier rules:
 * - `required` cannot be combined with `optional` or `computed`.
 * - `optional` can be combined with `computed`.
 * - `sensitive` can be added once.
 *
 * Notes:
 * - Builders are normalized into plain `AttributeSchema` / `NestedBlockSchema`
 *   objects before export.
 * - Raw schema objects are still accepted where needed for gradual migration.
 */
type AttrFlags = {
  required?: true;
  optional?: true;
  computed?: true;
  sensitive?: true;
};
type EmptyObject = Record<never, never>;

export type AttrBuilder<
  V extends ValueType = ValueType,
  F extends AttrFlags = EmptyObject,
> = Readonly<{
  valueType: V;
  readonly __dslAttr: true;
  readonly __flags: F;
  required: F extends
    | { required: true }
    | { optional: true }
    | { computed: true }
    ? never
    : () => AttrBuilder<V, F & { required: true }>;
  optional: F extends { required: true } | { optional: true }
    ? never
    : () => AttrBuilder<V, F & { optional: true }>;
  computed: F extends { required: true } | { computed: true }
    ? never
    : () => AttrBuilder<V, F & { computed: true }>;
  sensitive: F extends { sensitive: true }
    ? never
    : () => AttrBuilder<V, F & { sensitive: true }>;
}>;

type AttributeInput = AttributeSchema | Readonly<AttributeSchema> | AttrBuilder;

type NormalizeAttribute<A extends AttributeInput> =
  A extends AttrBuilder<infer V, infer F extends AttrFlags>
    ? Readonly<{ valueType: V } & F>
    : A;

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

function createAttrBuilder<V extends ValueType, F extends AttrFlags>(
  valueType: V,
  flags: F,
): AttrBuilder<V, F> {
  const hasRequired = flags.required === true;
  const hasOptional = flags.optional === true;
  const hasComputed = flags.computed === true;
  const hasSensitive = flags.sensitive === true;

  const base = {
    valueType,
    __dslAttr: true as const,
    __flags: flags,
  } as AttrBuilder<V, F>;

  const next = <NF extends AttrFlags>(nextFlags: NF) =>
    createAttrBuilder(valueType, nextFlags);

  return Object.assign(base, {
    required: () => {
      if (hasRequired || hasOptional || hasComputed) {
        throw new Error(
          "attr.required() cannot be combined with optional/computed",
        );
      }
      return next({ ...flags, required: true } as F & { required: true });
    },
    optional: () => {
      if (hasRequired || hasOptional) {
        throw new Error("attr.optional() cannot be combined with required");
      }
      return next({ ...flags, optional: true } as F & { optional: true });
    },
    computed: () => {
      if (hasRequired || hasComputed) {
        throw new Error("attr.computed() cannot be combined with required");
      }
      return next({ ...flags, computed: true } as F & { computed: true });
    },
    sensitive: () => {
      if (hasSensitive) {
        throw new Error("attr.sensitive() cannot be set twice");
      }
      return next({ ...flags, sensitive: true } as F & { sensitive: true });
    },
  }) as AttrBuilder<V, F>;
}

function normalizeAttribute(attribute: AttributeInput): AttributeSchema {
  if ("__dslAttr" in attribute && attribute.__dslAttr === true) {
    const flags = attribute.__flags as AttrFlags;
    return {
      valueType: attribute.valueType,
      ...(flags.required === true ? { required: true } : {}),
      ...(flags.optional === true ? { optional: true } : {}),
      ...(flags.computed === true ? { computed: true } : {}),
      ...(flags.sensitive === true ? { sensitive: true } : {}),
    };
  }

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

export const attr = {
  string: () => createAttrBuilder("string", {}),
  number: () => createAttrBuilder("number", {}),
  bool: () => createAttrBuilder("bool", {}),
  list: () => createAttrBuilder("list", {}),
  set: () => createAttrBuilder("set", {}),
  map: () => createAttrBuilder("map", {}),
  object: () => createAttrBuilder("object", {}),
  any: () => createAttrBuilder("any", {}),
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
