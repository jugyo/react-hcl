import { describe, it, expect } from "bun:test";
import { Resource } from "../../src/components/resource";

describe("Resource component", () => {
  it("returns a ResourceBlock with attributes", () => {
    const block = Resource({ type: "aws_vpc", name: "main", cidr_block: "10.0.0.0/16" });
    expect(block.blockType).toBe("resource");
    expect(block.type).toBe("aws_vpc");
    expect(block.name).toBe("main");
    expect(block.attributes).toEqual({ cidr_block: "10.0.0.0/16" });
  });

  it("excludes ref and children from attributes", () => {
    const block = Resource({ type: "aws_vpc", name: "main", ref: {}, children: "hcl text" });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toBe("hcl text");
  });

  it("calls children function and stores result as innerText", () => {
    const block = Resource({ type: "aws_vpc", name: "main", children: () => "dynamic hcl" });
    expect(block.innerText).toBe("dynamic hcl");
  });

  it("does not set innerText when children is undefined", () => {
    const block = Resource({ type: "aws_vpc", name: "main" });
    expect(block.innerText).toBeUndefined();
  });

  it("passes multiple attributes of various types", () => {
    const block = Resource({
      type: "aws_instance",
      name: "web",
      ami: "ami-123456",
      instance_type: "t2.micro",
      count: 3,
      associate_public_ip_address: false,
      tags: { Name: "web-server", Env: "prod" },
    });
    expect(block.attributes).toEqual({
      ami: "ami-123456",
      instance_type: "t2.micro",
      count: 3,
      associate_public_ip_address: false,
      tags: { Name: "web-server", Env: "prod" },
    });
  });
});
