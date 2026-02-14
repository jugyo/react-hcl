import { describe, it, expect } from "bun:test";
import { render } from "../src/renderer";
import { jsx, jsxs, Fragment } from "../src/jsx-runtime";

// Dummy component for testing
function DummyResource(props: { type: string; name: string; [key: string]: any }) {
  const { type, name, children, ...attrs } = props;
  return {
    blockType: "resource" as const,
    type,
    name,
    attributes: attrs,
  };
}

describe("render", () => {
  it("returns a single Block", () => {
    const element = jsx(DummyResource, { type: "aws_vpc", name: "main", cidr_block: "10.0.0.0/16" });
    const blocks = render(element);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      blockType: "resource",
      type: "aws_vpc",
      name: "main",
      attributes: { cidr_block: "10.0.0.0/16" },
    });
  });

  it("renders multiple elements in a Fragment", () => {
    const element = jsxs(Fragment, {
      children: [
        jsx(DummyResource, { type: "aws_vpc", name: "a" }),
        jsx(DummyResource, { type: "aws_vpc", name: "b" }),
      ],
    });
    const blocks = render(element);
    expect(blocks).toHaveLength(2);
    expect((blocks[0] as any).name).toBe("a");
    expect((blocks[1] as any).name).toBe("b");
  });

  it("expands custom components (functions)", () => {
    function MyVpc(props: { cidr: string }) {
      return jsx(DummyResource, { type: "aws_vpc", name: "custom", cidr_block: props.cidr });
    }
    const element = jsx(MyVpc, { cidr: "10.0.0.0/16" });
    const blocks = render(element);
    expect(blocks).toHaveLength(1);
    expect((blocks[0] as any).attributes.cidr_block).toBe("10.0.0.0/16");
  });

  it("handles null-returning component", () => {
    function Empty() { return null; }
    const element = jsx(Empty, {});
    const blocks = render(element);
    expect(blocks).toHaveLength(0);
  });

  it("renders nested components", () => {
    function Inner(props: { cidr: string }) {
      return jsx(DummyResource, { type: "aws_vpc", name: "inner", cidr_block: props.cidr });
    }
    function Outer(props: { cidr: string }) {
      return jsx(Inner, { cidr: props.cidr });
    }
    const element = jsx(Outer, { cidr: "10.0.0.0/16" });
    const blocks = render(element);
    expect(blocks).toHaveLength(1);
    expect((blocks[0] as any).attributes.cidr_block).toBe("10.0.0.0/16");
  });

  it("renders component returning a Fragment", () => {
    function MultiBlock() {
      return jsxs(Fragment, {
        children: [
          jsx(DummyResource, { type: "aws_vpc", name: "vpc" }),
          jsx(DummyResource, { type: "aws_subnet", name: "subnet" }),
        ],
      });
    }
    const element = jsx(MultiBlock, {});
    const blocks = render(element);
    expect(blocks).toHaveLength(2);
    expect((blocks[0] as any).name).toBe("vpc");
    expect((blocks[1] as any).name).toBe("subnet");
  });

  it("renders an array passed directly", () => {
    const elements = [
      jsx(DummyResource, { type: "aws_vpc", name: "a" }),
      jsx(DummyResource, { type: "aws_vpc", name: "b" }),
    ];
    const blocks = render(elements);
    expect(blocks).toHaveLength(2);
    expect((blocks[0] as any).name).toBe("a");
    expect((blocks[1] as any).name).toBe("b");
  });

  it("returns empty array for string input", () => {
    const blocks = render("hello");
    expect(blocks).toHaveLength(0);
  });

  it("flattens nested Fragments", () => {
    const element = jsxs(Fragment, {
      children: [
        jsx(DummyResource, { type: "aws_vpc", name: "first" }),
        jsxs(Fragment, {
          children: [
            jsx(DummyResource, { type: "aws_vpc", name: "second" }),
            jsx(DummyResource, { type: "aws_vpc", name: "third" }),
          ],
        }),
      ],
    });
    const blocks = render(element);
    expect(blocks).toHaveLength(3);
    expect(blocks.map(b => (b as any).name)).toEqual(["first", "second", "third"]);
  });

  it("preserves declaration order", () => {
    const element = jsxs(Fragment, {
      children: [
        jsx(DummyResource, { type: "aws_vpc", name: "first" }),
        jsx(DummyResource, { type: "aws_subnet", name: "second" }),
        jsx(DummyResource, { type: "aws_instance", name: "third" }),
      ],
    });
    const blocks = render(element);
    expect(blocks.map(b => (b as any).name)).toEqual(["first", "second", "third"]);
  });
});
