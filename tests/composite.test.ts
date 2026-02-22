import { describe, expect, it } from "vitest";
import { Output } from "../src/components/output";
import { Resource } from "../src/components/resource";
import { Variable } from "../src/components/variable";
import { generate } from "../src/generator";
import { isRawHCL } from "../src/hcl-serializer";
import { useRef } from "../src/hooks/use-ref";
import { Fragment, jsx, jsxs } from "../src/jsx-runtime";
import { render } from "../src/renderer";

describe("Composite components", () => {
  it("expands a function component", () => {
    function VpcModule({ cidr }: { cidr: string }) {
      return jsx(Resource, {
        type: "aws_vpc",
        label: "main",
        cidr_block: cidr,
      });
    }
    const element = jsx(VpcModule, { cidr: "10.0.0.0/16" });
    const blocks = render(element);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      blockType: "resource",
      type: "aws_vpc",
      name: "main",
    });
  });

  it("returns multiple primitives from a component", () => {
    function NetworkModule() {
      return jsxs(Fragment, {
        children: [
          jsx(Resource, {
            type: "aws_vpc",
            label: "main",
            cidr_block: "10.0.0.0/16",
          }),
          jsx(Resource, {
            type: "aws_subnet",
            label: "public",
            cidr_block: "10.0.1.0/24",
          }),
        ],
      });
    }
    const element = jsx(NetworkModule, {});
    const blocks = render(element);
    expect(blocks).toHaveLength(2);
  });

  it("expands nested custom components", () => {
    function InnerComponent() {
      return jsx(Resource, {
        type: "aws_instance",
        label: "web",
        ami: "ami-xxx",
      });
    }
    function OuterComponent() {
      return jsxs(Fragment, {
        children: [
          jsx(Resource, {
            type: "aws_vpc",
            label: "main",
            cidr_block: "10.0.0.0/16",
          }),
          jsx(InnerComponent, {}),
        ],
      });
    }
    const element = jsx(OuterComponent, {});
    const blocks = render(element);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("aws_vpc");
    expect(blocks[1].type).toBe("aws_instance");
  });

  it("passes props correctly", () => {
    function ConfigurableVpc({
      label,
      cidr,
      dns,
    }: {
      label: string;
      cidr: string;
      dns: boolean;
    }) {
      return jsx(Resource, {
        type: "aws_vpc",
        label,
        cidr_block: cidr,
        enable_dns_hostnames: dns,
      });
    }
    const element = jsx(ConfigurableVpc, {
      label: "custom",
      cidr: "192.168.0.0/16",
      dns: true,
    });
    const blocks = render(element);
    expect(blocks[0].attributes.cidr_block).toBe("192.168.0.0/16");
    expect(blocks[0].attributes.enable_dns_hostnames).toBe(true);
  });

  it("passes ref as props", () => {
    function SubnetModule({ vpcRef }: { vpcRef: any }) {
      return jsx(Resource, {
        type: "aws_subnet",
        label: "public",
        vpc_id: vpcRef.id,
        cidr_block: "10.0.1.0/24",
      });
    }

    const vpcRef = useRef();

    const element = jsxs(Fragment, {
      children: [
        jsx(Resource, {
          type: "aws_vpc",
          label: "main",
          ref: vpcRef,
          cidr_block: "10.0.0.0/16",
        }),
        jsx(SubnetModule, { vpcRef }),
      ],
    });
    const blocks = render(element);
    expect(blocks).toHaveLength(2);
    // vpcRef.id is resolved as RawHCL
    const subnetBlock = blocks[1];
    expect(subnetBlock.attributes.vpc_id).toBeDefined();
  });

  it("resolves ref passed as props to RawHCL in generated output", () => {
    function SubnetModule({ vpcRef }: { vpcRef: any }) {
      return jsx(Resource, {
        type: "aws_subnet",
        label: "public",
        vpc_id: vpcRef.id,
        cidr_block: "10.0.1.0/24",
      });
    }

    const vpcRef = useRef();

    const element = jsxs(Fragment, {
      children: [
        jsx(Resource, {
          type: "aws_vpc",
          label: "main",
          ref: vpcRef,
          cidr_block: "10.0.0.0/16",
        }),
        jsx(SubnetModule, { vpcRef }),
      ],
    });
    const blocks = render(element);
    const subnetBlock = blocks[1];
    expect(isRawHCL(subnetBlock.attributes.vpc_id)).toBe(true);

    const hcl = generate(blocks);
    expect(hcl).toContain("vpc_id     = aws_vpc.main.id");
  });

  it("returns mixed primitive types from a component", () => {
    function AppModule() {
      const ref = useRef();
      return jsxs(Fragment, {
        children: [
          jsx(Variable, { label: "env", type: "string", default: "dev" }),
          jsx(Resource, {
            type: "aws_instance",
            label: "web",
            ref,
            ami: "ami-xxx",
          }),
          jsx(Output, { label: "instance_id", value: ref.id }),
        ],
      });
    }
    const element = jsx(AppModule, {});
    const blocks = render(element);
    expect(blocks).toHaveLength(3);
    expect(blocks[0].blockType).toBe("variable");
    expect(blocks[1].blockType).toBe("resource");
    expect(blocks[2].blockType).toBe("output");

    const hcl = generate(blocks);
    expect(hcl).toContain('variable "env"');
    expect(hcl).toContain('resource "aws_instance" "web"');
    expect(hcl).toContain('output "instance_id"');
    expect(hcl).toContain("value = aws_instance.web.id");
  });

  it("accepts children as composition slots", () => {
    function Wrapper({ children }: { children: any }) {
      return jsxs(Fragment, {
        children: [
          jsx(Resource, {
            type: "aws_vpc",
            label: "main",
            cidr_block: "10.0.0.0/16",
          }),
          ...[].concat(children),
        ],
      });
    }
    const element = jsx(Wrapper, {
      children: jsx(Resource, {
        type: "aws_subnet",
        label: "sub",
        cidr_block: "10.0.1.0/24",
      }),
    });
    const blocks = render(element);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("aws_vpc");
    expect(blocks[1].type).toBe("aws_subnet");
  });

  it("preserves declaration order across composites", () => {
    function Module() {
      return jsxs(Fragment, {
        children: [
          jsx(Resource, { type: "a", label: "first" }),
          jsx(Resource, { type: "b", label: "second" }),
        ],
      });
    }
    const element = jsxs(Fragment, {
      children: [
        jsx(Resource, { type: "z", label: "before" }),
        jsx(Module, {}),
        jsx(Resource, { type: "z", label: "after" }),
      ],
    });
    const blocks = render(element);
    const names = blocks.map((b) => (b as any).name);
    expect(names).toEqual(["before", "first", "second", "after"]);
  });
});
