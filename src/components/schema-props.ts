import type { AttributeHCL, BlockHCL, RawHCL } from "../hcl-serializer";
import type {
  AttributeSchema,
  NestedBlockSchema,
  TerraformTypeSchema,
  ValueType,
} from "../resource-schema";

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

type RequiredAttributeKeys<A extends Record<string, AttributeSchema>> = {
  [K in keyof A]: A[K]["required"] extends true ? K : never;
}[keyof A];

type OptionalAttributeKeys<A extends Record<string, AttributeSchema>> = {
  [K in keyof A]: A[K]["required"] extends true ? never : K;
}[keyof A];

type AttributeProps<A extends Record<string, AttributeSchema>> = {
  [K in RequiredAttributeKeys<A>]: ValueFromSchema<A[K]["valueType"]>;
} & {
  [K in OptionalAttributeKeys<A>]?: ValueFromSchema<A[K]["valueType"]>;
};

type NestedBlockProp<B extends NestedBlockSchema> =
  | (B["nestingMode"] extends "single" ? BlockProps<B> : BlockProps<B>[])
  | BlockHCL
  | AttributeHCL;

type BlockProps<B extends NestedBlockSchema> = AttributeProps<B["attributes"]> &
  (B["blocks"] extends Record<string, NestedBlockSchema>
    ? { [K in keyof B["blocks"]]?: NestedBlockProp<B["blocks"][K]> }
    : Record<never, never>);

export type SchemaProps<S extends TerraformTypeSchema> = AttributeProps<
  S["attributes"]
> & {
  [K in keyof S["blocks"]]?: NestedBlockProp<S["blocks"][K]>;
};
