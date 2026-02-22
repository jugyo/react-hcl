import { beforeEach, describe, expect, it } from "vitest";
import { isRawHCL } from "../src/hcl-serializer";
import { getHookStore, resetHookState, useRef } from "../src/hooks/use-ref";

describe("useRef", () => {
  beforeEach(() => {
    resetHookState(true);
  });

  it("ref.attr returns RawHCL", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", label: "main" };
    const result = ref.id;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("aws_vpc.main.id");
  });

  it("data source ref", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "data", type: "aws_ami", label: "latest" };
    const result = ref.id;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("data.aws_ami.latest.id");
  });

  it("ref (type.name format for depends_on)", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", label: "main" };
    const result = ref.__dependsOnValue;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("aws_vpc.main");
  });

  it("data source ref (depends_on format)", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "data", type: "aws_ami", label: "latest" };
    const result = ref.__dependsOnValue;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("data.aws_ami.latest");
  });

  it("nested access (outputs.xxx)", () => {
    const ref = useRef();
    ref.__refMeta = {
      blockType: "data",
      type: "terraform_remote_state",
      label: "network",
    };
    const result = ref.outputs.vpc_id;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe(
      "data.terraform_remote_state.network.outputs.vpc_id",
    );
  });

  it("provider ref (type.alias format)", () => {
    const ref = useRef();
    ref.__refMeta = {
      blockType: "provider",
      type: "aws",
      label: "virginia",
      alias: "virginia",
    };
    const result = ref.__providerValue;
    expect(isRawHCL(result)).toBe(true);
    expect(result.value).toBe("aws.virginia");
  });

  it("toString() works for template literal usage", () => {
    const ref = useRef();
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", label: "main" };
    const result = `${ref.id}`;
    expect(result).toBe("aws_vpc.main.id");
  });

  it("returns placeholder when ref is used before registration in template literal", () => {
    const ref = useRef();
    // Before metadata is set, toString() returns placeholder instead of throwing
    const result = `${ref.id}`;
    expect(result).toContain("__UNRESOLVED_REF__");
  });

  it("lazy evaluation: ref.id accessed before metadata set resolves after registration", () => {
    const ref = useRef();
    // Access ref.id BEFORE metadata is set (simulates JSX eager evaluation)
    const lazyValue = ref.id;
    // Now register metadata (simulates component execution during render)
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", label: "main" };
    // Value resolves correctly at read time
    expect(isRawHCL(lazyValue)).toBe(true);
    expect(lazyValue.value).toBe("aws_vpc.main.id");
  });

  it("lazy evaluation: nested access resolves after registration", () => {
    const ref = useRef();
    const lazyValue = ref.outputs.vpc_id;
    ref.__refMeta = {
      blockType: "data",
      type: "terraform_remote_state",
      label: "network",
    };
    expect(lazyValue.value).toBe(
      "data.terraform_remote_state.network.outputs.vpc_id",
    );
  });

  it("lazy evaluation: __dependsOnValue resolves after registration", () => {
    const ref = useRef();
    const lazyValue = ref.__dependsOnValue;
    ref.__refMeta = { blockType: "resource", type: "aws_vpc", label: "main" };
    expect(lazyValue.value).toBe("aws_vpc.main");
  });

  describe("stateful hook store", () => {
    it("resetHookState(true) clears the store", () => {
      useRef();
      useRef();
      expect(getHookStore()).toHaveLength(2);
      resetHookState(true);
      expect(getHookStore()).toHaveLength(0);
    });

    it("resetHookState() without clear only resets index", () => {
      const ref1 = useRef();
      const ref2 = useRef();
      ref1.__refMeta = {
        blockType: "resource",
        type: "aws_vpc",
        label: "main",
      };
      ref2.__refMeta = {
        blockType: "resource",
        type: "aws_subnet",
        label: "sub",
      };

      // Reset index only (not clearing store)
      resetHookState();

      // Same proxies returned on second pass
      const ref1Again = useRef();
      const ref2Again = useRef();
      expect(ref1Again).toBe(ref1);
      expect(ref2Again).toBe(ref2);
      // Metadata preserved
      expect(ref1Again.__refMeta).toEqual({
        blockType: "resource",
        type: "aws_vpc",
        label: "main",
      });
    });

    it("stores proxies in hookStore", () => {
      const ref = useRef();
      const store = getHookStore();
      expect(store).toHaveLength(1);
      expect(store[0]).toBe(ref);
    });

    it("resetHookState(true) creates fresh proxies on next useRef call", () => {
      const ref1 = useRef();
      resetHookState(true);
      const ref2 = useRef();
      // After clear, a new proxy is created (not the same object)
      expect(ref2).not.toBe(ref1);
      expect(getHookStore()).toHaveLength(1);
    });

    it("metadata set in pass 1 is preserved in pass 2 via index reset", () => {
      // Simulate pass 1: create proxy and set metadata
      const ref = useRef();
      ref.__refMeta = { blockType: "resource", type: "aws_vpc", label: "main" };

      // Simulate pass 2: index reset only
      resetHookState();
      const refAgain = useRef();

      // toString() in pass 2 resolves correctly (the core 2-pass use case)
      expect(`${refAgain.id}`).toBe("aws_vpc.main.id");
    });

    it("multiple refs maintain correct order across passes", () => {
      // Pass 1
      const refA = useRef();
      const refB = useRef();
      const refC = useRef();
      refA.__refMeta = { blockType: "resource", type: "aws_vpc", label: "a" };
      refB.__refMeta = { blockType: "data", type: "aws_ami", label: "b" };
      refC.__refMeta = {
        blockType: "resource",
        type: "aws_subnet",
        label: "c",
      };

      // Pass 2: index reset
      resetHookState();
      const refA2 = useRef();
      const refB2 = useRef();
      const refC2 = useRef();

      // Same proxies in same order
      expect(refA2).toBe(refA);
      expect(refB2).toBe(refB);
      expect(refC2).toBe(refC);

      // Each resolves to correct value
      expect(refA2.id.value).toBe("aws_vpc.a.id");
      expect(refB2.id.value).toBe("data.aws_ami.b.id");
      expect(refC2.cidr_block.value).toBe("aws_subnet.c.cidr_block");
    });
  });
});
