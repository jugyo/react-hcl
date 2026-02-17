import { beforeEach, describe, expect, it } from "bun:test";
import { resetHookState, useRef } from "../src/hooks/use-ref";
import { Fragment, jsx, jsxs } from "../src/jsx-runtime";
import { render } from "../src/renderer";

// Dummy component for testing
function DummyResource(props: {
  type: string;
  name: string;
  [key: string]: any;
}) {
  const { type, name, children, ...attrs } = props;
  return {
    blockType: "resource" as const,
    type,
    name,
    attributes: attrs,
  };
}

describe("render", () => {
  beforeEach(() => {
    resetHookState(true);
  });

  it("returns a single Block", () => {
    const element = jsx(DummyResource, {
      type: "aws_vpc",
      name: "main",
      cidr_block: "10.0.0.0/16",
    });
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
      return jsx(DummyResource, {
        type: "aws_vpc",
        name: "custom",
        cidr_block: props.cidr,
      });
    }
    const element = jsx(MyVpc, { cidr: "10.0.0.0/16" });
    const blocks = render(element);
    expect(blocks).toHaveLength(1);
    expect((blocks[0] as any).attributes.cidr_block).toBe("10.0.0.0/16");
  });

  it("handles null-returning component", () => {
    function Empty() {
      return null;
    }
    const element = jsx(Empty, {});
    const blocks = render(element);
    expect(blocks).toHaveLength(0);
  });

  it("renders nested components", () => {
    function Inner(props: { cidr: string }) {
      return jsx(DummyResource, {
        type: "aws_vpc",
        name: "inner",
        cidr_block: props.cidr,
      });
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
    expect(blocks.map((b) => (b as any).name)).toEqual([
      "first",
      "second",
      "third",
    ]);
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
    expect(blocks.map((b) => (b as any).name)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  describe("2-pass rendering", () => {
    it("resolves ref in innerText template literal", () => {
      function ResourceWithRef(props: {
        type: string;
        name: string;
        ref?: any;
        [key: string]: any;
      }) {
        const { type, name, ref, children, ...attrs } = props;
        if (ref) ref.__refMeta = { blockType: "resource", type, label: name };
        const rawChildren = Array.isArray(children) ? children[0] : children;
        return {
          blockType: "resource" as const,
          type,
          name,
          attributes: attrs,
          ...(typeof rawChildren === "string"
            ? { innerText: rawChildren }
            : {}),
        };
      }

      function App() {
        const vpcRef = useRef();
        return jsxs(Fragment, {
          children: [
            jsx(ResourceWithRef, {
              type: "aws_vpc",
              name: "main",
              ref: vpcRef,
              cidr_block: "10.0.0.0/16",
            }),
            jsx(ResourceWithRef, {
              type: "aws_subnet",
              name: "sub",
              children: `vpc_id = ${vpcRef.id}`,
            }),
          ],
        });
      }

      const element = jsx(App, {});
      const blocks = render(element);
      expect(blocks).toHaveLength(2);
      expect((blocks[1] as any).innerText).toBe("vpc_id = aws_vpc.main.id");
    });

    it("throws error for unresolved ref", () => {
      function App() {
        const ref = useRef();
        // ref is never passed to a component with ref= prop
        return jsx(DummyResource, {
          type: "aws_vpc",
          name: "main",
          vpc_id: ref.id,
        });
      }

      const element = jsx(App, {});
      expect(() => render(element)).toThrow(
        "Ref is used but was never registered",
      );
    });

    it("resolves multiple refs in template literals", () => {
      function ResourceWithRef(props: {
        type: string;
        name: string;
        ref?: any;
        [key: string]: any;
      }) {
        const { type, name, ref, children, ...attrs } = props;
        if (ref) ref.__refMeta = { blockType: "resource", type, label: name };
        const rawChildren = Array.isArray(children) ? children[0] : children;
        return {
          blockType: "resource" as const,
          type,
          name,
          attributes: attrs,
          ...(typeof rawChildren === "string"
            ? { innerText: rawChildren }
            : {}),
        };
      }

      function App() {
        const vpcRef = useRef();
        const sgRef = useRef();
        return jsxs(Fragment, {
          children: [
            jsx(ResourceWithRef, {
              type: "aws_vpc",
              name: "main",
              ref: vpcRef,
              cidr_block: "10.0.0.0/16",
            }),
            jsx(ResourceWithRef, {
              type: "aws_security_group",
              name: "web",
              ref: sgRef,
              vpc_id: vpcRef.id,
            }),
            jsx(ResourceWithRef, {
              type: "aws_instance",
              name: "app",
              children: `vpc_security_group_ids = [${sgRef.id}]\nsubnet_id = ${vpcRef.id}`,
            }),
          ],
        });
      }

      const element = jsx(App, {});
      const blocks = render(element);
      expect(blocks).toHaveLength(3);
      expect((blocks[2] as any).innerText).toBe(
        "vpc_security_group_ids = [aws_security_group.web.id]\nsubnet_id = aws_vpc.main.id",
      );
    });

    it("resolves refs from useRef in different child components", () => {
      function ResourceWithRef(props: {
        type: string;
        name: string;
        ref?: any;
        [key: string]: any;
      }) {
        const { type, name, ref, children, ...attrs } = props;
        if (ref) ref.__refMeta = { blockType: "resource", type, label: name };
        const rawChildren = Array.isArray(children) ? children[0] : children;
        return {
          blockType: "resource" as const,
          type,
          name,
          attributes: attrs,
          ...(typeof rawChildren === "string"
            ? { innerText: rawChildren }
            : {}),
        };
      }

      function VpcModule() {
        const vpcRef = useRef();
        return jsxs(Fragment, {
          children: [
            jsx(ResourceWithRef, {
              type: "aws_vpc",
              name: "main",
              ref: vpcRef,
              cidr_block: "10.0.0.0/16",
            }),
            jsx(ResourceWithRef, {
              type: "aws_subnet",
              name: "sub",
              children: `vpc_id = ${vpcRef.id}`,
            }),
          ],
        });
      }

      function SgModule() {
        const sgRef = useRef();
        return jsxs(Fragment, {
          children: [
            jsx(ResourceWithRef, {
              type: "aws_security_group",
              name: "web",
              ref: sgRef,
            }),
            jsx(ResourceWithRef, {
              type: "aws_instance",
              name: "app",
              children: `sg = ${sgRef.id}`,
            }),
          ],
        });
      }

      function App() {
        return jsxs(Fragment, {
          children: [jsx(VpcModule, {}), jsx(SgModule, {})],
        });
      }

      const element = jsx(App, {});
      const blocks = render(element);
      expect(blocks).toHaveLength(4);
      expect((blocks[1] as any).innerText).toBe("vpc_id = aws_vpc.main.id");
      expect((blocks[3] as any).innerText).toBe(
        "sg = aws_security_group.web.id",
      );
    });
  });
});
