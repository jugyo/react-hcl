export type SchemaKind = "resource" | "data";

export type ValueType =
  | "string"
  | "number"
  | "bool"
  | "list"
  | "set"
  | "map"
  | "object"
  | "any";

export type AttributeSchema = {
  valueType: ValueType;
  required?: boolean;
  optional?: boolean;
  computed?: boolean;
  sensitive?: boolean;
};

export type NestedBlockNestingMode = "single" | "list" | "set";

export type NestedBlockSchema = {
  nestingMode: NestedBlockNestingMode;
  minItems?: number;
  maxItems?: number;
  attributes: Record<string, AttributeSchema>;
  blocks?: Record<string, NestedBlockSchema>;
};

export type TerraformTypeSchema = {
  kind: SchemaKind;
  type: string;
  attributes: Record<string, AttributeSchema>;
  blocks: Record<string, NestedBlockSchema>;
};

export type SerializationContext = {
  blockType: SchemaKind;
  type: string;
};
