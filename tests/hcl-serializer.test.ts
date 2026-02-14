import { describe, it, expect } from "bun:test";
import { serializeHCLAttributes, raw, block, attribute } from "../src/hcl-serializer";

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
    const result = serializeHCLAttributes({ cidr_blocks: ["10.0.0.0/16", "10.0.1.0/24"] });
    expect(result).toContain('cidr_blocks = ["10.0.0.0/16", "10.0.1.0/24"]');
  });

  it("RawHCL array", () => {
    const result = serializeHCLAttributes({ depends_on: [raw("aws_vpc.main")] });
    expect(result).toContain("depends_on = [aws_vpc.main]");
  });

  it("default object uses attribute syntax (with =)", () => {
    const result = serializeHCLAttributes({ tags: { Name: "main" } });
    expect(result).toContain("tags = {");
    expect(result).toContain('Name = "main"');
  });

  it("whitelisted key uses block syntax", () => {
    const result = serializeHCLAttributes({
      lifecycle: { prevent_destroy: true },
    });
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

  it("explicit attribute() forces attribute syntax on whitelisted key", () => {
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

  it("combined case", () => {
    const result = serializeHCLAttributes({
      cidr_block: "10.0.0.0/16",
      enable_dns_hostnames: true,
      tags: { Name: "main" },
      lifecycle: { prevent_destroy: true },
    });
    expect(result).toContain('cidr_block');
    expect(result).toContain('enable_dns_hostnames');
    expect(result).toContain('tags = {');
    expect(result).toContain('lifecycle {');
  });
});
