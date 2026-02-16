import { describe, expect, it } from "bun:test";
import { getTypeSchema } from "../src/resource-schema";

describe("resource schema lookup", () => {
  it("returns schema for known aws resource type", () => {
    const schema = getTypeSchema({
      blockType: "resource",
      type: "aws_instance",
    });
    expect(schema).toBeDefined();
    expect(schema?.type).toBe("aws_instance");
    expect(schema?.blocks.root_block_device).toBeDefined();
    expect(schema?.attributes.instance_type).toBeDefined();
  });

  it("returns schema for known aws data source type", () => {
    const schema = getTypeSchema({ blockType: "data", type: "aws_ami" });
    expect(schema).toBeDefined();
    expect(schema?.blocks.filter).toBeDefined();
    expect(schema?.attributes.owners).toBeDefined();
  });

  it("returns undefined for unknown provider", () => {
    const schema = getTypeSchema({
      blockType: "resource",
      type: "google_compute_instance",
    });
    expect(schema).toBeUndefined();
  });

  it("returns undefined for unsupported aws type", () => {
    const schema = getTypeSchema({
      blockType: "resource",
      type: "aws_route53_record",
    });
    expect(schema).toBeUndefined();
  });
});
