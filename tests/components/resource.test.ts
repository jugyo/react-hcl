import { describe, it, expect } from "bun:test";
import { Resource } from "../../src/components/resource";
import { useRef } from "../../src/hooks/use-ref";
import { isRawHCL } from "../../src/hcl-serializer";

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

  it("registers __refMeta on useRef proxy", () => {
    const ref = useRef();
    Resource({ type: "aws_vpc", name: "main", ref, cidr_block: "10.0.0.0/16" });
    expect(ref.__refMeta).toEqual({ blockType: "resource", type: "aws_vpc", name: "main" });
  });

  it("resolves provider ref to raw HCL", () => {
    const providerRef = useRef();
    providerRef.__refMeta = { blockType: "provider", type: "aws", name: "virginia", alias: "virginia" };
    const block = Resource({ type: "aws_instance", name: "web", provider: providerRef });
    expect(isRawHCL(block.attributes.provider)).toBe(true);
    expect(block.attributes.provider.value).toBe("aws.virginia");
  });

  it("resolves depends_on refs to raw HCL array", () => {
    const vpcRef = useRef();
    vpcRef.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    const dataRef = useRef();
    dataRef.__refMeta = { blockType: "data", type: "aws_ami", name: "latest" };
    const block = Resource({ type: "aws_instance", name: "web", depends_on: [vpcRef, dataRef] });
    expect(block.attributes.depends_on).toHaveLength(2);
    expect(isRawHCL(block.attributes.depends_on[0])).toBe(true);
    expect(block.attributes.depends_on[0].value).toBe("aws_vpc.main");
    expect(block.attributes.depends_on[1].value).toBe("data.aws_ami.latest");
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
