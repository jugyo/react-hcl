import type { RawHCL } from "../hcl-serializer";

type OutputPrimitive = string | number | boolean | null;

export type OutputValue =
  | OutputPrimitive
  | RawHCL
  | OutputValue[]
  | { [key: string]: OutputValue };

export type OutputProps = {
  name: string;
  value: OutputValue;
  description?: string;
  sensitive?: boolean;
  [key: string]: any;
};
