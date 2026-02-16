import { attr, block } from "../../dsl";

export const COMMON_RESOURCE_ATTRIBUTES = {
  count: attr.number().optional(),
  depends_on: attr.list().optional(),
  for_each: attr.any().optional(),
  provider: attr.string().optional(),
} as const;

const LIFECYCLE_BLOCK = block.single({
  attributes: {
    create_before_destroy: attr.bool().optional(),
    prevent_destroy: attr.bool().optional(),
    replace_triggered_by: attr.list().optional(),
  },
  blocks: {
    precondition: block.list({
      attributes: {
        condition: attr.any().required(),
        error_message: attr.string().required(),
      },
    }),
    postcondition: block.list({
      attributes: {
        condition: attr.any().required(),
        error_message: attr.string().required(),
      },
    }),
  },
});

const PROVISIONER_BLOCK = block.list({
  attributes: {
    when: attr.string().optional(),
    on_failure: attr.string().optional(),
  },
  blocks: {
    connection: block.single({
      attributes: {
        host: attr.string().optional(),
        type: attr.string().optional(),
        user: attr.string().optional(),
        password: attr.string().optional(),
        private_key: attr.string().optional(),
        timeout: attr.string().optional(),
      },
    }),
  },
});

const CONNECTION_BLOCK = block.single({
  attributes: {
    host: attr.string().optional(),
    type: attr.string().optional(),
    user: attr.string().optional(),
    password: attr.string().optional(),
    private_key: attr.string().optional(),
    timeout: attr.string().optional(),
    agent: attr.bool().optional(),
  },
});

export const COMMON_RESOURCE_BLOCKS = {
  lifecycle: LIFECYCLE_BLOCK,
  provisioner: PROVISIONER_BLOCK,
  connection: CONNECTION_BLOCK,
} as const;
