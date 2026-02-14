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
      name: "vpc",
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
      name: "vpc",
      source: "terraform-aws-modules/vpc/aws",
      version: "~> 5.0",
    });
    expect(block.attributes.source).toBe("terraform-aws-modules/vpc/aws");
    expect(block.attributes.version).toBe("~> 5.0");
  });

  it("excludes ref and children from attributes", () => {
    const block = Module({
      name: "vpc",
      ref: {},
      children: 'source = "./modules/vpc"',
    });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toBe('  source = "./modules/vpc"');
  });

  it("unwraps children array and stores first element as innerText", () => {
    const block = Module({
      name: "vpc",
      children: ['source = "./modules/vpc"'] as any,
    });
    expect(block.innerText).toBe('  source = "./modules/vpc"');
  });

  it("does not set innerText when children is undefined", () => {
    const block = Module({
      name: "vpc",
      source: "./modules/vpc",
    });
    expect(block.innerText).toBeUndefined();
  });

  it("registers __refMeta with blockType module on useRef proxy", () => {
    const ref = useRef();
    Module({
      name: "vpc",
      source: "terraform-aws-modules/vpc/aws",
      ref,
    });
    expect(ref.__refMeta).toEqual({
      blockType: "module",
      type: "module",
      name: "vpc",
    });
  });

  it("resolves module ref to module.<name>.<attr> path", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "module", type: "module", name: "vpc" };
    const vpcId = ref.vpc_id;
    expect(isRawHCL(vpcId)).toBe(true);
    expect(vpcId.value).toBe("module.vpc.vpc_id");
  });

  it("resolves depends_on refs to raw HCL array", () => {
    const vpcRef = useRef();
    vpcRef.__refMeta = {
      blockType: "resource",
      type: "aws_vpc",
      name: "main",
    };
    const moduleRef = useRef();
    moduleRef.__refMeta = {
      blockType: "module",
      type: "module",
      name: "networking",
    };
    const block = Module({
      name: "app",
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
      name: "latest",
    };
    const block = Module({
      name: "app",
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
      name: "west",
      alias: "west",
    };
    const block = Module({
      name: "vpc_west",
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
      name: "default",
    };
    const block = Module({
      name: "vpc",
      source: "./modules/vpc",
      providers: { aws: defaultRef },
    });
    const inner = block.attributes.providers.value;
    expect(inner.aws.value).toBe("aws.default");
  });

  it("passes count and for_each as regular attributes", () => {
    const block = Module({
      name: "instances",
      source: "./modules/instance",
      count: 3,
    });
    expect(block.attributes.count).toBe(3);
  });

  it("passes multiple input variables of various types", () => {
    const block = Module({
      name: "vpc",
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
