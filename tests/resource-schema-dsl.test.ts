import { describe, expect, it } from "bun:test";
import { attr, block, data, resource } from "../src/resource-schema/dsl";

describe("resource schema DSL", () => {
  it("builds a data schema with attribute modifiers", () => {
    const schema = data("aws_ami", {
      attributes: {
        owners: attr.list({ required: true }),
        most_recent: attr.bool({ optional: true }),
        name: attr.string({ computed: true }),
      },
      blocks: {
        filter: block.set({
          attributes: {
            name: attr.string({ required: true }),
            values: attr.set({ required: true }),
          },
        }),
      },
    });

    expect(schema.kind).toBe("data");
    expect(schema.type).toBe("aws_ami");
    expect(schema.attributes.owners).toEqual({
      valueType: "list",
      required: true,
    });
    expect(schema.attributes.most_recent).toEqual({
      valueType: "bool",
      optional: true,
    });
    expect(schema.attributes.name).toEqual({
      valueType: "string",
      computed: true,
    });
    expect(schema.blocks.filter.nestingMode).toBe("set");
  });

  it("builds nested blocks with min/max options", () => {
    const schema = resource("aws_autoscaling_group", {
      attributes: {
        max_size: attr.number({ required: true }),
        min_size: attr.number({ required: true }),
      },
      blocks: {
        launch_template: block.list(
          {
            attributes: {},
            blocks: {
              launch_template_specification: block.single({
                attributes: {
                  id: attr.string({ optional: true }),
                },
              }),
            },
          },
          { minItems: 1, maxItems: 1 },
        ),
      },
    });

    expect(schema.blocks.launch_template.nestingMode).toBe("list");
    expect(schema.blocks.launch_template.minItems).toBe(1);
    expect(schema.blocks.launch_template.maxItems).toBe(1);
    expect(
      schema.blocks.launch_template.blocks.launch_template_specification
        .attributes.id,
    ).toEqual({
      valueType: "string",
      optional: true,
    });
  });
});
