import type { AttributeSchema, NestedBlockSchema } from "../../types";

export const COMMON_RESOURCE_ATTRIBUTES = {
  count: { valueType: "number", optional: true },
  depends_on: { valueType: "list", optional: true },
  for_each: { valueType: "any", optional: true },
  provider: { valueType: "string", optional: true },
} as const satisfies Record<string, AttributeSchema>;

// Source: https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle
const LIFECYCLE_BLOCK = {
  nestingMode: "single",
  attributes: {
    create_before_destroy: { valueType: "bool", optional: true },
    prevent_destroy: { valueType: "bool", optional: true },
    replace_triggered_by: { valueType: "list", optional: true },
  },
  blocks: {
    precondition: {
      nestingMode: "list",
      attributes: {
        condition: { valueType: "any", required: true },
        error_message: { valueType: "string", required: true },
      },
    },
    postcondition: {
      nestingMode: "list",
      attributes: {
        condition: { valueType: "any", required: true },
        error_message: { valueType: "string", required: true },
      },
    },
  },
} as const satisfies NestedBlockSchema;

// Source: https://developer.hashicorp.com/terraform/language/resources/provisioners/syntax
const PROVISIONER_BLOCK = {
  nestingMode: "list",
  attributes: {
    when: { valueType: "string", optional: true },
    on_failure: { valueType: "string", optional: true },
  },
  blocks: {
    connection: {
      nestingMode: "single",
      attributes: {
        host: { valueType: "string", optional: true },
        type: { valueType: "string", optional: true },
        user: { valueType: "string", optional: true },
        password: { valueType: "string", optional: true },
        private_key: { valueType: "string", optional: true },
        timeout: { valueType: "string", optional: true },
      },
    },
  },
} as const satisfies NestedBlockSchema;

// Source: https://developer.hashicorp.com/terraform/language/resources/provisioners/connection
const CONNECTION_BLOCK = {
  nestingMode: "single",
  attributes: {
    host: { valueType: "string", optional: true },
    type: { valueType: "string", optional: true },
    user: { valueType: "string", optional: true },
    password: { valueType: "string", optional: true },
    private_key: { valueType: "string", optional: true },
    timeout: { valueType: "string", optional: true },
    agent: { valueType: "bool", optional: true },
  },
} as const satisfies NestedBlockSchema;

export const COMMON_RESOURCE_BLOCKS = {
  lifecycle: LIFECYCLE_BLOCK,
  provisioner: PROVISIONER_BLOCK,
  connection: CONNECTION_BLOCK,
} as const satisfies Record<string, NestedBlockSchema>;
