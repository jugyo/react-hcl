import type { RawHCL } from "../hcl-serializer";
import type { Ref } from "../hooks/use-ref";
import type { ReactHclSchemaMode, ResourceTypeMap } from "../index";

type RefLike = Ref;

type StrictMode = ReactHclSchemaMode extends { __strictSchema: true }
  ? true
  : false;

export type AwsResourceType = keyof ResourceTypeMap & string;

export type AwsResourcePropsMap = ResourceTypeMap;

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

type LooseResourceProps = ResourceCoreProps & {
  type: string;
  __hcl?: Record<string, any>;
  [key: string]: any;
};

type StrictResourcePropsUnion = {
  [K in AwsResourceType]: StrictResourceProps<K>;
}[AwsResourceType];

export type ResourceProps = StrictMode extends true
  ? StrictResourcePropsUnion
  : StrictResourcePropsUnion | LooseResourceProps;
