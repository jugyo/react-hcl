import { describe, expect, it } from "bun:test";
import {
  attribute,
  block,
  raw,
  serializeHCLAttributes,
} from "../src/hcl-serializer";
import type { SerializationContext } from "../src/resource-schema";

const AWS_INSTANCE_CONTEXT: SerializationContext = {
  blockType: "resource",
  type: "aws_instance",
};

const AWS_SECURITY_GROUP_CONTEXT: SerializationContext = {
  blockType: "resource",
  type: "aws_security_group",
};

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

  it("schema-defined key uses block syntax", () => {
    const result = serializeHCLAttributes(
      {
        lifecycle: { prevent_destroy: true },
      },
      2,
      AWS_INSTANCE_CONTEXT,
    );
    expect(result).toContain("lifecycle {");
    expect(result).not.toContain("lifecycle = {");
    expect(result).toContain("prevent_destroy = true");
  });

  it("explicit block() uses block syntax", () => {
    const result = serializeHCLAttributes({
      custom_block: block({ nested_key: "value" }),
    });
    expect(result).toContain("custom_block {");
    expect(result).not.toContain("custom_block = {");
    expect(result).toContain('nested_key = "value"');
  });

  it("explicit attribute() forces attribute syntax on schema block key", () => {
    const result = serializeHCLAttributes(
      {
        lifecycle: attribute({ prevent_destroy: true }),
      },
      2,
      AWS_INSTANCE_CONTEXT,
    );
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

  it("array of objects becomes repeated blocks only when repeatable in schema", () => {
    const result = serializeHCLAttributes(
      {
        ingress: [
          { from_port: 80, to_port: 80, protocol: "tcp" },
          { from_port: 443, to_port: 443, protocol: "tcp" },
        ],
      },
      2,
      AWS_SECURITY_GROUP_CONTEXT,
    );
    // Two separate ingress blocks (block syntax, no =)
    const blocks = result.split("ingress {");
    expect(blocks.length).toBe(3); // 1 before + 2 blocks
    expect(result).toContain("from_port = 80");
    expect(result).toContain("from_port = 443");
    expect(result).not.toContain("ingress = {");
  });

  it("nested indentation increases by 2 spaces per level", () => {
    const result = serializeHCLAttributes(
      {
        lifecycle: { nested: block({ deep_key: "value" }) },
      },
      2,
      AWS_INSTANCE_CONTEXT,
    );
    // level 0 (indent=2): "  lifecycle {"
    // level 1 (indent=4): "    nested {"
    // level 2 (indent=6): "      deep_key = \"value\""
    expect(result).toContain("  lifecycle {");
    expect(result).toContain("    nested {");
    expect(result).toContain('      deep_key = "value"');
  });

  it("key alignment pads shorter keys to match longest", () => {
    const result = serializeHCLAttributes({
      id: "abc",
      long_key_name: "xyz",
    });
    // "id" (2 chars) should be padded to align with "long_key_name" (13 chars)
    expect(result).toContain('  id            = "abc"');
    expect(result).toContain('  long_key_name = "xyz"');
  });

  it("empty attributes returns empty string", () => {
    const result = serializeHCLAttributes({});
    expect(result).toBe("");
  });

  it("blank line between simple attributes and block entries", () => {
    const result = serializeHCLAttributes(
      {
        name: "example",
        lifecycle: { prevent_destroy: true },
      },
      2,
      AWS_INSTANCE_CONTEXT,
    );
    // Simple attr followed by blank line then block
    expect(result).toContain('  name = "example"\n\n  lifecycle {');
  });

  it("combined case: order, alignment, and blank line separation", () => {
    const result = serializeHCLAttributes(
      {
        cidr_block: "10.0.0.0/16",
        enable_dns_hostnames: true,
        tags: { Name: "main" },
        lifecycle: { prevent_destroy: true },
      },
      2,
      AWS_INSTANCE_CONTEXT,
    );
    // Simple attributes come before block entries
    const cidrPos = result.indexOf("cidr_block");
    const tagsPos = result.indexOf("tags = {");
    const lifecyclePos = result.indexOf("lifecycle {");
    expect(cidrPos).toBeLessThan(tagsPos);
    expect(cidrPos).toBeLessThan(lifecyclePos);

    // Simple attributes are aligned
    expect(result).toContain('cidr_block           = "10.0.0.0/16"');
    expect(result).toContain("enable_dns_hostnames = true");

    // Blank line between simple attrs and first block entry
    expect(result).toContain("enable_dns_hostnames = true\n\n  tags = {");
  });

  it("unknown type silently falls back to attribute syntax", () => {
    const result = serializeHCLAttributes({ ingress: { from_port: 80 } }, 2, {
      blockType: "resource",
      type: "aws_unknown",
    });
    expect(result).toContain("ingress = {");
    expect(result).not.toContain("ingress {");
  });

  it("array<object> is attribute when schema block is non-repeatable", () => {
    const result = serializeHCLAttributes(
      {
        root_block_device: [{ volume_size: 20 }],
      },
      2,
      AWS_INSTANCE_CONTEXT,
    );
    expect(result).toContain("root_block_device = [{ volume_size = 20 }]");
    expect(result).not.toContain("root_block_device {");
  });
});
