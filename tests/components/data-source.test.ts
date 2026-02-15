import { beforeEach, describe, expect, it } from "bun:test";
import { DataSource } from "../../src/components/data-source";
import { isRawHCL } from "../../src/hcl-serializer";
import { resetHookState, useRef } from "../../src/hooks/use-ref";

describe("DataSource component", () => {
  beforeEach(() => {
    resetHookState(true);
  });

  it("returns a DataSourceBlock with attributes", () => {
    const block = DataSource({
      type: "aws_ami",
      name: "latest",
      most_recent: true,
    });
    expect(block.blockType).toBe("data");
    expect(block.type).toBe("aws_ami");
    expect(block.name).toBe("latest");
    expect(block.attributes).toEqual({ most_recent: true });
  });

  it("excludes ref and children from attributes", () => {
    const block = DataSource({
      type: "aws_ami",
      name: "latest",
      ref: {},
      children: "hcl text",
    });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toBe("  hcl text");
  });

  it("unwraps children array and stores first element as innerText", () => {
    const block = DataSource({
      type: "aws_ami",
      name: "latest",
      children: ["hcl text"] as any,
    });
    expect(block.innerText).toBe("  hcl text");
  });

  it("discards props and attributes when innerText is used", () => {
    const block = DataSource({
      type: "external",
      name: "config",
      attributes: { name: "my-config" },
      children: 'name = "override"',
    });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toContain('name = "override"');
  });

  it("does not set innerText when children is undefined", () => {
    const block = DataSource({ type: "aws_ami", name: "latest" });
    expect(block.innerText).toBeUndefined();
  });

  it("registers __refMeta on useRef proxy", () => {
    const ref = useRef();
    DataSource({ type: "aws_ami", name: "latest", ref, most_recent: true });
    expect(ref.__refMeta).toEqual({
      blockType: "data",
      type: "aws_ami",
      name: "latest",
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
    const block = DataSource({
      type: "aws_ami",
      name: "latest",
      provider: providerRef,
    });
    expect(isRawHCL(block.attributes.provider)).toBe(true);
    expect(block.attributes.provider.value).toBe("aws.virginia");
  });

  it("merges attributes prop into HCL attributes to resolve reserved prop conflicts", () => {
    const block = DataSource({
      type: "external",
      name: "config",
      attributes: { name: "my-config", type: "json" },
    });
    expect(block.type).toBe("external");
    expect(block.name).toBe("config");
    expect(block.attributes).toEqual({
      name: "my-config",
      type: "json",
    });
  });

  it("resolves depends_on refs to raw HCL array", () => {
    const vpcRef = useRef();
    vpcRef.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    const block = DataSource({
      type: "aws_ami",
      name: "latest",
      depends_on: [vpcRef],
    });
    expect(block.attributes.depends_on).toHaveLength(1);
    expect(isRawHCL(block.attributes.depends_on[0])).toBe(true);
    expect(block.attributes.depends_on[0].value).toBe("aws_vpc.main");
  });
});
