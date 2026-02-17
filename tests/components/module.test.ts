import { beforeEach, describe, expect, it } from "bun:test";
import { Module } from "../../src/components/module";
import { isAttributeHCL, isRawHCL } from "../../src/hcl-serializer";
import { resetHookState, useRef } from "../../src/hooks/use-ref";

describe("Module component", () => {
  beforeEach(() => {
    resetHookState(true);
  });

  it("returns a ModuleBlock with source and input variables", () => {
    const block = Module({
      label: "vpc",
      source: "terraform-aws-modules/vpc/aws",
      cidr: "10.0.0.0/16",
    });
    expect(block.blockType).toBe("module");
    expect(block.name).toBe("vpc");
    expect(block.attributes).toEqual({
      source: "terraform-aws-modules/vpc/aws",
      cidr: "10.0.0.0/16",
    });
  });

  it("includes version in attributes", () => {
    const block = Module({
      label: "vpc",
      source: "terraform-aws-modules/vpc/aws",
      version: "~> 5.0",
    });
    expect(block.attributes.source).toBe("terraform-aws-modules/vpc/aws");
    expect(block.attributes.version).toBe("~> 5.0");
  });

  it("excludes ref and children from attributes", () => {
    const block = Module({
      label: "vpc",
      ref: {},
      children: 'source = "./modules/vpc"',
    });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toBe('  source = "./modules/vpc"');
  });

  it("unwraps children array and stores first element as innerText", () => {
    const block = Module({
      label: "vpc",
      children: ['source = "./modules/vpc"'] as any,
    });
    expect(block.innerText).toBe('  source = "./modules/vpc"');
  });

  it("discards props and __hcl when innerText is used", () => {
    const block = Module({
      label: "vpc",
      source: "./modules/vpc",
      __hcl: { name: "my-network" },
      children: 'source = "./local"\nname = "override"',
    });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toContain('name = "override"');
  });

  it("does not set innerText when children is undefined", () => {
    const block = Module({
      label: "vpc",
      source: "./modules/vpc",
    });
    expect(block.innerText).toBeUndefined();
  });

  it("registers __refMeta with blockType module on useRef proxy", () => {
    const ref = useRef();
    Module({
      label: "vpc",
      source: "terraform-aws-modules/vpc/aws",
      ref,
    });
    expect(ref.__refMeta).toEqual({
      blockType: "module",
      type: "module",
      label: "vpc",
    });
  });

  it("resolves module ref to module.<name>.<attr> path", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "module", type: "module", label: "vpc" };
    const vpcId = ref.vpc_id;
    expect(isRawHCL(vpcId)).toBe(true);
    expect(vpcId.value).toBe("module.vpc.vpc_id");
  });

  it("resolves depends_on refs to raw HCL array", () => {
    const vpcRef = useRef();
    vpcRef.__refMeta = {
      blockType: "resource",
      type: "aws_vpc",
      label: "main",
    };
    const moduleRef = useRef();
    moduleRef.__refMeta = {
      blockType: "module",
      type: "module",
      label: "networking",
    };
    const block = Module({
      label: "app",
      source: "./modules/app",
      depends_on: [vpcRef, moduleRef],
    });
    expect(block.attributes.depends_on).toHaveLength(2);
    expect(isRawHCL(block.attributes.depends_on[0])).toBe(true);
    expect(block.attributes.depends_on[0].value).toBe("aws_vpc.main");
    expect(block.attributes.depends_on[1].value).toBe("module.networking");
  });

  it("resolves depends_on with data source ref", () => {
    const dataRef = useRef();
    dataRef.__refMeta = {
      blockType: "data",
      type: "aws_ami",
      label: "latest",
    };
    const block = Module({
      label: "app",
      source: "./modules/app",
      depends_on: [dataRef],
    });
    expect(block.attributes.depends_on[0].value).toBe("data.aws_ami.latest");
  });

  it("resolves providers refs to raw HCL with attribute wrapper", () => {
    const westRef = useRef();
    westRef.__refMeta = {
      blockType: "provider",
      type: "aws",
      label: "west",
      alias: "west",
    };
    const block = Module({
      label: "vpc_west",
      source: "./modules/vpc",
      providers: { aws: westRef },
    });
    expect(isAttributeHCL(block.attributes.providers)).toBe(true);
    const inner = block.attributes.providers.value;
    expect(isRawHCL(inner.aws)).toBe(true);
    expect(inner.aws.value).toBe("aws.west");
  });

  it("resolves providers ref without alias using name", () => {
    const defaultRef = useRef();
    defaultRef.__refMeta = {
      blockType: "provider",
      type: "aws",
      label: "default",
    };
    const block = Module({
      label: "vpc",
      source: "./modules/vpc",
      providers: { aws: defaultRef },
    });
    const inner = block.attributes.providers.value;
    expect(inner.aws.value).toBe("aws.default");
  });

  it("passes count and for_each as regular attributes", () => {
    const block = Module({
      label: "instances",
      source: "./modules/instance",
      count: 3,
    });
    expect(block.attributes.count).toBe(3);
  });

  it("merges __hcl prop into HCL attributes to resolve reserved prop conflicts", () => {
    const block = Module({
      label: "vpc",
      source: "./modules/vpc",
      __hcl: { name: "my-network", type: "internal" },
    });
    expect(block.name).toBe("vpc");
    expect(block.attributes).toEqual({
      source: "./modules/vpc",
      name: "my-network",
      type: "internal",
    });
  });

  it("__hcl prop overrides same-named regular props", () => {
    const block = Module({
      label: "vpc",
      source: "./modules/vpc",
      cidr: "10.0.0.0/16",
      __hcl: { cidr: "10.1.0.0/16" },
    });
    expect(block.attributes.cidr).toBe("10.1.0.0/16");
  });

  it("passes multiple input variables of various types", () => {
    const block = Module({
      label: "vpc",
      source: "terraform-aws-modules/vpc/aws",
      cidr: "10.0.0.0/16",
      azs: ["us-east-1a", "us-east-1b"],
      enable_nat_gateway: true,
      tags: { Environment: "dev" },
    });
    expect(block.attributes).toEqual({
      source: "terraform-aws-modules/vpc/aws",
      cidr: "10.0.0.0/16",
      azs: ["us-east-1a", "us-east-1b"],
      enable_nat_gateway: true,
      tags: { Environment: "dev" },
    });
  });
});
