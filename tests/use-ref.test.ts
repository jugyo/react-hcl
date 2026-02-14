import { describe, it, expect } from "bun:test";
import { useRef } from "../src/hooks/use-ref";
import { isRawHCL } from "../src/hcl-serializer";

describe("useRef", () => {
  it("ref.attr returns RawHCL", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    const result = ref.id;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("aws_vpc.main.id");
  });

  it("data source ref", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "data", type: "aws_ami", name: "latest" };
    const result = ref.id;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("data.aws_ami.latest.id");
  });

  it("ref (type.name format for depends_on)", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    const result = ref.__dependsOnValue;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("aws_vpc.main");
  });

  it("data source ref (depends_on format)", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "data", type: "aws_ami", name: "latest" };
    const result = ref.__dependsOnValue;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("data.aws_ami.latest");
  });

  it("nested access (outputs.xxx)", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "data", type: "terraform_remote_state", name: "network" };
    const result = ref.outputs.vpc_id;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("data.terraform_remote_state.network.outputs.vpc_id");
  });

  it("provider ref (type.alias format)", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "provider", type: "aws", name: "virginia", alias: "virginia" };
    const result = ref.__providerValue;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("aws.virginia");
  });

  it("toString() works for template literal usage", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    const result = `${ref.id}`;
    expect(result).toBe("aws_vpc.main.id");
  });

  it("throws error when ref is used before registration in template literal", () => {
    const ref = useRef();
    expect(() => `${ref.id}`).toThrow("Ref is used before it was registered");
  });

  it("lazy evaluation: ref.id accessed before metadata set resolves after registration", () => {
    const ref = useRef();
    // Access ref.id BEFORE metadata is set (simulates JSX eager evaluation)
    const lazyValue = ref.id;
    // Now register metadata (simulates component execution during render)
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    // Value resolves correctly at read time
    expect(isRawHCL(lazyValue)).toBe(true);
    expect(lazyValue.value).toBe("aws_vpc.main.id");
  });

  it("lazy evaluation: nested access resolves after registration", () => {
    const ref = useRef();
    const lazyValue = ref.outputs.vpc_id;
    ref.__refMeta = { blockType: "data", type: "terraform_remote_state", name: "network" };
    expect(lazyValue.value).toBe("data.terraform_remote_state.network.outputs.vpc_id");
  });

  it("lazy evaluation: __dependsOnValue resolves after registration", () => {
    const ref = useRef();
    const lazyValue = ref.__dependsOnValue;
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", name: "main" };
    expect(lazyValue.value).toBe("aws_vpc.main");
  });
});
