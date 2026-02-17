import type { RawHCL } from "../hcl-serializer";
import type { SchemaProps } from "./schema-props";

type RefLike = { __refMeta?: unknown };

type AwsDataSchemas = typeof import("../provider-schema/aws").AWS_DATA_SCHEMAS;

export type AwsDataType = keyof AwsDataSchemas;

export type AwsDataPropsMap = {
  [K in AwsDataType]: SchemaProps<AwsDataSchemas[K]>;
};

type DataCoreProps = {
  name: string;
  ref?: any;
  children?: string | string[];
};

type DataMetaAttributeOverrides = {
  provider?: string | RawHCL | RefLike;
  depends_on?: Array<string | RawHCL | RefLike>;
};

type ApplyMetaAttributeOverrides<T> = Omit<
  T,
  keyof DataMetaAttributeOverrides
> &
  DataMetaAttributeOverrides;

export type StrictDataAttributes<T extends AwsDataType> =
  ApplyMetaAttributeOverrides<AwsDataPropsMap[T]>;

type StrictDataPropsWithoutInnerText<T extends AwsDataType> = DataCoreProps & {
  type: T;
  __hcl?: Partial<StrictDataAttributes<T>>;
} & StrictDataAttributes<T>;

type StrictDataPropsWithInnerText<T extends AwsDataType> = DataCoreProps & {
  type: T;
  children: string | string[];
  __hcl?: Partial<StrictDataAttributes<T>>;
} & Partial<StrictDataAttributes<T>>;

export type StrictDataProps<T extends AwsDataType> =
  | StrictDataPropsWithoutInnerText<T>
  | StrictDataPropsWithInnerText<T>;

type NonAwsDataType<T extends string> = T extends AwsDataType ? never : T;

export type LooseDataProps<T extends string = string> = DataCoreProps & {
  type: NonAwsDataType<T>;
  __hcl?: Record<string, any>;
  [key: string]: any;
};

export type DataProps<T extends string> = T extends AwsDataType
  ? StrictDataProps<T>
  : LooseDataProps<T>;
