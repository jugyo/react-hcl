import { describe, expect, it } from "bun:test";
import {
  attribute,
  block,
  raw,
  serializeHCLAttributes,
} from "../src/hcl-serializer";
import type { TerraformBlockSchema } from "../src/cli/init/types";

describe("serializeHCLAttributes", () => {
  it("string attribute", () => {
    const result = serializeHCLAttributes({ cidr_block: "10.0.0.0/16" });
    expect(result).toContain('cidr_block = "10.0.0.0/16"');
  });

  it("number attribute", () => {
    const result = serializeHCLAttributes({ count: 3 });
    expect(result).toContain("count = 3");
  });

  it("boolean attribute", () => {
    const result = serializeHCLAttributes({ enable_dns_hostnames: true });
    expect(result).toContain("enable_dns_hostnames = true");
  });

  it("RawHCL (unquoted output)", () => {
    const result = serializeHCLAttributes({ vpc_id: raw("aws_vpc.main.id") });
    expect(result).toContain("vpc_id = aws_vpc.main.id");
    expect(result).not.toContain('"aws_vpc.main.id"');
  });

  it("string array", () => {
    const result = serializeHCLAttributes({
      cidr_blocks: ["10.0.0.0/16", "10.0.1.0/24"],
    });
    expect(result).toContain('cidr_blocks = ["10.0.0.0/16", "10.0.1.0/24"]');
  });

  it("RawHCL array", () => {
    const result = serializeHCLAttributes({
      depends_on: [raw("aws_vpc.main")],
    });
    expect(result).toContain("depends_on = [aws_vpc.main]");
  });

  it("default object uses attribute syntax (with =)", () => {
    const result = serializeHCLAttributes({ tags: { Name: "main" } });
    expect(result).toContain("tags = {");
    expect(result).toContain('Name = "main"');
  });

  it("explicit block() uses block syntax", () => {
    const result = serializeHCLAttributes({
      lifecycle: block({ prevent_destroy: true }),
    });
    expect(result).toContain("lifecycle {");
    expect(result).not.toContain("lifecycle = {");
    expect(result).toContain("prevent_destroy = true");
  });

  it("explicit attribute() forces attribute syntax", () => {
    const result = serializeHCLAttributes({
      lifecycle: attribute({ prevent_destroy: true }),
    });
    expect(result).toContain("lifecycle = {");
    expect(result).toContain("prevent_destroy = true");
  });

  it("explicit attribute() on non-whitelisted key", () => {
    const result = serializeHCLAttributes({
      tags: attribute({ Name: "main" }),
    });
    expect(result).toContain("tags = {");
    expect(result).toContain('Name = "main"');
  });

  it("nested indentation increases by 2 spaces per level", () => {
    const result = serializeHCLAttributes({
      lifecycle: block({ nested: block({ deep_key: "value" }) }),
    });
    expect(result).toContain("  lifecycle {");
    expect(result).toContain("    nested {");
    expect(result).toContain('      deep_key = "value"');
  });

  it("key alignment pads shorter keys to match longest", () => {
    const result = serializeHCLAttributes({
      id: "abc",
      long_key_name: "xyz",
    });
    expect(result).toContain('  id            = "abc"');
    expect(result).toContain('  long_key_name = "xyz"');
  });

  it("empty attributes returns empty string", () => {
    const result = serializeHCLAttributes({});
    expect(result).toBe("");
  });

  it("blank line between simple attributes and block entries", () => {
    const result = serializeHCLAttributes({
      name: "example",
      lifecycle: block({ prevent_destroy: true }),
    });
    expect(result).toContain('  name = "example"\n\n  lifecycle {');
  });

  it("combined case: order, alignment, and blank line separation", () => {
    const result = serializeHCLAttributes({
      cidr_block: "10.0.0.0/16",
      enable_dns_hostnames: true,
      tags: { Name: "main" },
      lifecycle: block({ prevent_destroy: true }),
    });
    const cidrPos = result.indexOf("cidr_block");
    const tagsPos = result.indexOf("tags = {");
    const lifecyclePos = result.indexOf("lifecycle {");
    expect(cidrPos).toBeLessThan(tagsPos);
    expect(cidrPos).toBeLessThan(lifecyclePos);

    expect(result).toContain('cidr_block           = "10.0.0.0/16"');
    expect(result).toContain("enable_dns_hostnames = true");

    expect(result).toContain("enable_dns_hostnames = true\n\n  tags = {");
  });

  it("array<object> remains an attribute value", () => {
    const result = serializeHCLAttributes({
      root_block_device: [{ volume_size: 20 }],
    });
    expect(result).toContain("root_block_device = [{ volume_size = 20 }]");
    expect(result).not.toContain("root_block_device {");
  });

  it("array<BlockHCL> emits repeated blocks", () => {
    const result = serializeHCLAttributes({
      metric_query: [
        block({
          id: "q1",
          expression: "SELECT MAX(CPUUtilization)",
        }),
        block({
          id: "q2",
          expression: "SELECT AVG(CPUUtilization)",
        }),
      ],
    });
    expect(result).toContain("metric_query {");
    expect(result).toContain('id         = "q1"');
    expect(result).toContain('id         = "q2"');
    expect(result).not.toContain("metric_query = [");
  });

  it("array with mixed BlockHCL and non-block values throws", () => {
    expect(() =>
      serializeHCLAttributes({
        metric_query: [block({ id: "q1" }), raw("local.other")],
      }),
    ).toThrow(/mixed BlockHCL array/i);
  });
});

describe("serializeHCLAttributes with schema context", () => {
  it("rejects unknown keys defined outside schema", () => {
    const schemaBlock: TerraformBlockSchema = {
      attributes: {
        ami: { type: "string", required: true },
      },
    };
    expect(() =>
      serializeHCLAttributes(
        { ami: "ami-123", unknown_key: true },
        2,
        {
          blockType: "resource",
          type: "aws_instance",
          schemaBlock,
        },
      ),
    ).toThrow(/Unknown key "unknown_key"/);
  });

  it("auto-renders schema block_types as nested blocks", () => {
    const schemaBlock: TerraformBlockSchema = {
      attributes: {
        ami: { type: "string", required: true },
      },
      block_types: {
        root_block_device: {
          nesting_mode: "list",
          block: {
            attributes: {
              volume_size: { type: "number", optional: true },
            },
          },
        },
      },
    };
    const result = serializeHCLAttributes(
      {
        ami: "ami-123",
        root_block_device: [{ volume_size: 20 }],
      },
      2,
      { blockType: "resource", type: "aws_instance", schemaBlock },
    );
    expect(result).toContain('ami = "ami-123"');
    expect(result).toContain("root_block_device {");
    expect(result).toContain("volume_size = 20");
    expect(result).not.toContain("root_block_device = [");
  });
});
