import type { AttributeHCL, BlockHCL, RawHCL } from "../hcl-serializer";
import type {
  AttributeSchema,
  NestedBlockSchema,
  TerraformTypeSchema,
  ValueType,
} from "../resource-schema";

type RefLike = { __refMeta?: unknown };

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
  [K in keyof A]: A[K]["required"] extends true
    ? A[K]["computed"] extends true
      ? never
      : K
    : never;
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

type SchemaProps<S extends TerraformTypeSchema> = AttributeProps<
  S["attributes"]
> & {
  [K in keyof S["blocks"]]?: NestedBlockProp<S["blocks"][K]>;
};

type AwsResourceSchemas =
  typeof import("../resource-schema/aws").AWS_RESOURCE_SCHEMAS;

export type AwsResourceType = keyof AwsResourceSchemas;

export type AwsResourcePropsMap = {
  [K in AwsResourceType]: SchemaProps<AwsResourceSchemas[K]>;
};

type ResourceCoreProps = {
  name: string;
  ref?: any;
  children?: string | string[];
};

type ResourceMetaAttributeOverrides = {
  provider?: string | RawHCL | RefLike;
  depends_on?: Array<string | RawHCL | RefLike>;
};

type ApplyMetaAttributeOverrides<T> = Omit<
  T,
  keyof ResourceMetaAttributeOverrides
> &
  ResourceMetaAttributeOverrides;

export type StrictResourceAttributes<T extends AwsResourceType> =
  ApplyMetaAttributeOverrides<AwsResourcePropsMap[T]>;

type StrictResourcePropsWithoutInnerText<T extends AwsResourceType> =
  ResourceCoreProps & {
    type: T;
    attributes?: Partial<StrictResourceAttributes<T>>;
  } & StrictResourceAttributes<T>;

type StrictResourcePropsWithInnerText<T extends AwsResourceType> =
  ResourceCoreProps & {
    type: T;
    children: string | string[];
    attributes?: Partial<StrictResourceAttributes<T>>;
  } & Partial<StrictResourceAttributes<T>>;

export type StrictResourceProps<T extends AwsResourceType> =
  | StrictResourcePropsWithoutInnerText<T>
  | StrictResourcePropsWithInnerText<T>;

type NonAwsResourceType<T extends string> = T extends AwsResourceType
  ? never
  : T;

export type LooseResourceProps<T extends string = string> =
  ResourceCoreProps & {
    type: NonAwsResourceType<T>;
    attributes?: Record<string, any>;
    [key: string]: any;
  };

export type ResourceProps<T extends string> = T extends AwsResourceType
  ? StrictResourceProps<T>
  : LooseResourceProps<T>;
