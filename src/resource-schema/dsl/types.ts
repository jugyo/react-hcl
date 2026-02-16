import type {
  AttributeSchema,
  NestedBlockNestingMode,
  SchemaKind,
  ValueType,
} from "../types";

/** DSL flags that can be attached to an attribute definition. */
export type AttrFlags = {
  required?: true;
  optional?: true;
  computed?: true;
  sensitive?: true;
};

/** Empty object helper used when a conditional branch adds no fields. */
export type EmptyObject = Record<never, never>;

/** Adds `{ prop: true }` only when the target property is literally `true`. */
export type FlagIfTrue<
  T extends { [K in P]?: unknown },
  P extends keyof T,
> = T[P] extends true ? { [K in P]: true } : EmptyObject;

/** Normalized attribute definition shape used by the DSL. */
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

/** Attribute input accepted by the DSL (raw schema or AttrDef). */
export type AttributeInput =
  | AttributeSchema
  | Readonly<AttributeSchema>
  | AttrDef<ValueType, AttrFlags>;

/** Normalized single-attribute type with all flag information preserved. */
export type NormalizeAttribute<A extends AttributeInput> = Readonly<
  {
    valueType: A["valueType"];
  } & FlagIfTrue<A, "required"> &
    FlagIfTrue<A, "optional"> &
    FlagIfTrue<A, "computed"> &
    FlagIfTrue<A, "sensitive">
>;

/** Maps an attribute record to its normalized attribute types. */
export type NormalizeAttributes<
  A extends Readonly<Record<string, AttributeInput>>,
> = {
  [K in keyof A]: NormalizeAttribute<A[K]>;
};

/** Nested block input accepted by the DSL. */
export type BlockInput = {
  nestingMode: NestedBlockNestingMode;
  minItems?: number;
  maxItems?: number;
  attributes: Readonly<Record<string, AttributeInput>>;
  blocks?: Readonly<Record<string, BlockInput>>;
};

/** Block definition shape passed to `block.single/list/set`. */
export type BlockDef<
  A extends Readonly<Record<string, AttributeInput>>,
  B extends Readonly<Record<string, BlockInput>> = EmptyObject,
> = {
  attributes: A;
  blocks?: B;
};

/** Includes `minItems` only when it is explicitly present. */
type MaybeMin<B extends { minItems?: number }> = B extends {
  minItems: infer M extends number;
}
  ? { minItems: M }
  : EmptyObject;

/** Includes `maxItems` only when it is explicitly present. */
type MaybeMax<B extends { maxItems?: number }> = B extends {
  maxItems: infer M extends number;
}
  ? { maxItems: M }
  : EmptyObject;

/** Extracts concrete nested block entries from an optional `blocks` field. */
type BlockEntries<T> =
  NonNullable<T> extends Readonly<Record<string, BlockInput>>
    ? NonNullable<T>
    : never;

/** Adds a `blocks` property only when nested blocks are actually defined. */
type MaybeBlocks<B extends { blocks?: Readonly<Record<string, BlockInput>> }> =
  [keyof BlockEntries<B["blocks"]>] extends [never]
    ? EmptyObject
    : { blocks: NormalizeBlocks<BlockEntries<B["blocks"]>> };

/** Normalized block type including normalized attributes and child blocks. */
export type NormalizeBlock<B extends BlockInput> = Readonly<
  {
    nestingMode: B["nestingMode"];
    attributes: NormalizeAttributes<B["attributes"]>;
  } & MaybeMin<B> &
    MaybeMax<B> &
    MaybeBlocks<B>
>;

/** Maps a block record to normalized block types. */
export type NormalizeBlocks<B extends Readonly<Record<string, BlockInput>>> = {
  [K in keyof B]: NormalizeBlock<B[K]>;
};

/** Final schema type returned by `resource()` / `data()`. */
export type TypeSchema<
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
