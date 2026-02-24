import type { RawHCL } from "../hcl-serializer";
import type { Ref } from "../hooks/use-ref";
import type { DataTypeMap, ReactHclSchemaMode } from "../index";

type RefLike = Ref;

type StrictMode = ReactHclSchemaMode extends { __strictSchema: true }
  ? true
  : false;

export type AwsDataType = keyof DataTypeMap & string;

export type AwsDataPropsMap = DataTypeMap;

type DataCoreProps = {
  label: string;
  ref?: Ref;
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

type LooseDataProps = DataCoreProps & {
  type: string;
  __hcl?: Record<string, any>;
  [key: string]: any;
};

type StrictDataPropsUnion = {
  [K in AwsDataType]: StrictDataProps<K>;
}[AwsDataType];

export type DataProps = StrictMode extends true
  ? StrictDataPropsUnion
  : StrictDataPropsUnion | LooseDataProps;
