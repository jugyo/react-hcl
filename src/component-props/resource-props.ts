import type { RawHCL } from "../hcl-serializer";
import type { Ref } from "../hooks/use-ref";
import type { SchemaProps } from "./schema-props";

type RefLike = Ref;

type AwsResourceSchemas =
  typeof import("../provider-schema/aws").AWS_RESOURCE_SCHEMAS;

export type AwsResourceType = keyof AwsResourceSchemas;

export type AwsResourcePropsMap = {
  [K in AwsResourceType]: SchemaProps<AwsResourceSchemas[K]>;
};

type ResourceCoreProps = {
  label: string;
  ref?: Ref;
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
    __hcl?: Partial<StrictResourceAttributes<T>>;
  } & StrictResourceAttributes<T>;

type StrictResourcePropsWithInnerText<T extends AwsResourceType> =
  ResourceCoreProps & {
    type: T;
    children: string | string[];
    __hcl?: Partial<StrictResourceAttributes<T>>;
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
    __hcl?: Record<string, any>;
    [key: string]: any;
  };

export type ResourceProps<T extends string> = T extends AwsResourceType
  ? StrictResourceProps<T>
  : LooseResourceProps<T>;
