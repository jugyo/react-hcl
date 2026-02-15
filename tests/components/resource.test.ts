import { beforeEach, describe, expect, it } from "bun:test";
import { Resource } from "../../src/components/resource";
import { isRawHCL } from "../../src/hcl-serializer";
import { resetHookState, useRef } from "../../src/hooks/use-ref";

describe("Resource component", () => {
  beforeEach(() => {
    resetHookState(true);
  });

  it("returns a ResourceBlock with attributes", () => {
    const block = Resource({
      type: "aws_vpc",
      name: "main",
      cidr_block: "10.0.0.0/16",
    });
    expect(block.blockType).toBe("resource");
    expect(block.type).toBe("aws_vpc");
    expect(block.name).toBe("main");
    expect(block.attributes).toEqual({ cidr_block: "10.0.0.0/16" });
  });

  it("excludes ref and children from attributes", () => {
    const block = Resource({
      type: "aws_vpc",
      name: "main",
      ref: {},
      children: "hcl text",
    });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toBe("  hcl text");
  });

  it("unwraps children array and stores first element as innerText", () => {
    const block = Resource({
      type: "aws_vpc",
      name: "main",
      children: ["hcl text"] as any,
    });
    expect(block.innerText).toBe("  hcl text");
  });

  it("does not set innerText when children is undefined", () => {
    const block = Resource({ type: "aws_vpc", name: "main" });
    expect(block.innerText).toBeUndefined();
  });

  it("registers __refMeta on useRef proxy", () => {
    const ref = useRef();
    Resource({ type: "aws_vpc", name: "main", ref, cidr_block: "10.0.0.0/16" });
    expect(ref.__refMeta).toEqual({
      blockType: "resource",
      type: "aws_vpc",
      name: "main",
    });
  });

  it("resolves provider ref to raw HCL", () => {
    const providerRef = useRef();
    providerRef.__refMeta = {
      blockType: "provider",
      type: "aws",
      name: "virginia",
      alias: "virginia",
    };
    const block = Resource({
      type: "aws_instance",
      name: "web",
      provider: providerRef,
    });
    expect(isRawHCL(block.attributes.provider)).toBe(true);
    expect(block.attributes.provider.value).toBe("aws.virginia");
  });

  it("resolves depends_on refs to raw HCL array", () => {
    const vpcRef = useRef();
    vpcRef.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    const dataRef = useRef();
    dataRef.__refMeta = { blockType: "data", type: "aws_ami", name: "latest" };
    const block = Resource({
      type: "aws_instance",
      name: "web",
      depends_on: [vpcRef, dataRef],
    });
    expect(block.attributes.depends_on).toHaveLength(2);
    expect(isRawHCL(block.attributes.depends_on[0])).toBe(true);
    expect(block.attributes.depends_on[0].value).toBe("aws_vpc.main");
    expect(block.attributes.depends_on[1].value).toBe("data.aws_ami.latest");
  });

  it("merges attributes prop into HCL attributes to resolve reserved prop conflicts", () => {
    const block = Resource({
      type: "aws_instance",
      name: "web",
      ami: "ami-123456",
      attributes: { name: "my-instance", type: "t2.micro" },
    });
    expect(block.type).toBe("aws_instance");
    expect(block.name).toBe("web");
    expect(block.attributes).toEqual({
      ami: "ami-123456",
      name: "my-instance",
      type: "t2.micro",
    });
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
