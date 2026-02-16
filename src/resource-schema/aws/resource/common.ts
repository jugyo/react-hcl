import { attr, block } from "../../dsl";

export const COMMON_RESOURCE_ATTRIBUTES = {
  count: attr.number({ optional: true }),
  depends_on: attr.list({ optional: true }),
  for_each: attr.any({ optional: true }),
  provider: attr.string({ optional: true }),
} as const;

const LIFECYCLE_BLOCK = block.single({
  attributes: {
    create_before_destroy: attr.bool({ optional: true }),
    prevent_destroy: attr.bool({ optional: true }),
    replace_triggered_by: attr.list({ optional: true }),
  },
  blocks: {
    precondition: block.list({
      attributes: {
        condition: attr.any({ required: true }),
        error_message: attr.string({ required: true }),
      },
    }),
    postcondition: block.list({
      attributes: {
        condition: attr.any({ required: true }),
        error_message: attr.string({ required: true }),
      },
    }),
  },
});

const PROVISIONER_BLOCK = block.list({
  attributes: {
    when: attr.string({ optional: true }),
    on_failure: attr.string({ optional: true }),
  },
  blocks: {
    connection: block.single({
      attributes: {
        host: attr.string({ optional: true }),
        type: attr.string({ optional: true }),
        user: attr.string({ optional: true }),
        password: attr.string({ optional: true }),
        private_key: attr.string({ optional: true }),
        timeout: attr.string({ optional: true }),
      },
    }),
  },
});

const CONNECTION_BLOCK = block.single({
  attributes: {
    host: attr.string({ optional: true }),
    type: attr.string({ optional: true }),
    user: attr.string({ optional: true }),
    password: attr.string({ optional: true }),
    private_key: attr.string({ optional: true }),
    timeout: attr.string({ optional: true }),
    agent: attr.bool({ optional: true }),
  },
});

export const COMMON_RESOURCE_BLOCKS = {
  lifecycle: LIFECYCLE_BLOCK,
  provisioner: PROVISIONER_BLOCK,
  connection: CONNECTION_BLOCK,
} as const;
