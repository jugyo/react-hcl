import type { AttributeHCL, BlockHCL, RawHCL } from "../hcl-serializer";
import type { TerraformTypeSchema, ValueType } from "../provider-schema";

type ValueFromSchema<V extends ValueType> = V extends "string"
  ? string | RawHCL
  : V extends "number"
    ? number | RawHCL
    : V extends "bool"
      ? boolean | RawHCL
      : V extends "list"
        ? unknown[] | RawHCL
        : V extends "set"
          ? unknown[] | RawHCL
          : V extends "map"
            ? Record<string, unknown> | RawHCL
            : V extends "object"
              ? Record<string, unknown> | RawHCL
              : unknown;

type AttributeLike = Readonly<{
  valueType: ValueType;
  required?: boolean;
  computed?: boolean;
}>;

type BlockLike = Readonly<{
  nestingMode: "single" | "list" | "set";
  attributes: Readonly<Record<string, AttributeLike>>;
  blocks?: Readonly<Record<string, BlockLike>>;
}>;

type IsExplicitTrue<T, K extends PropertyKey> = K extends keyof T
  ? T[K] extends true
    ? true
    : false
  : false;

type RequiredAttributeKeys<A extends Readonly<Record<string, AttributeLike>>> =
  {
    [K in keyof A]: IsExplicitTrue<A[K], "required"> extends true
      ? IsExplicitTrue<A[K], "computed"> extends true
        ? never
        : K
      : never;
  }[keyof A];

type OptionalAttributeKeys<A extends Readonly<Record<string, AttributeLike>>> =
  {
    [K in keyof A]: IsExplicitTrue<A[K], "required"> extends true ? never : K;
  }[keyof A];

type AttributeProps<A extends Readonly<Record<string, AttributeLike>>> = {
  [K in RequiredAttributeKeys<A>]: ValueFromSchema<A[K]["valueType"]>;
} & {
  [K in OptionalAttributeKeys<A>]?: ValueFromSchema<A[K]["valueType"]>;
};

type NestedBlockProp<B extends BlockLike> =
  | (B["nestingMode"] extends "single" ? BlockProps<B> : BlockProps<B>[])
  | BlockHCL
  | AttributeHCL;

type BlockProps<B extends BlockLike> = AttributeProps<B["attributes"]> &
  (B["blocks"] extends Readonly<Record<string, BlockLike>>
    ? { [K in keyof B["blocks"]]?: NestedBlockProp<B["blocks"][K]> }
    : Record<never, never>);

type SchemaAttributes<S extends TerraformTypeSchema> =
  S["attributes"] extends Readonly<Record<string, AttributeLike>>
    ? S["attributes"]
    : never;

type SchemaBlocks<S extends TerraformTypeSchema> =
  S["blocks"] extends Readonly<Record<string, BlockLike>> ? S["blocks"] : never;

export type SchemaProps<S extends TerraformTypeSchema> = AttributeProps<
  SchemaAttributes<S>
> & {
  [K in keyof SchemaBlocks<S>]?: NestedBlockProp<SchemaBlocks<S>[K]>;
};
