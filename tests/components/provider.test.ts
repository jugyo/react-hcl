import { describe, expect, it } from "bun:test";
import { Provider } from "../../src/components/provider";
import { useRef } from "../../src/hooks/use-ref";

describe("Provider component", () => {
  it("returns a ProviderBlock with type and attributes", () => {
    const block = Provider({ type: "aws", region: "ap-northeast-1" });
    expect(block.blockType).toBe("provider");
    expect(block.type).toBe("aws");
    expect(block.attributes).toEqual({ region: "ap-northeast-1" });
  });

  it("includes alias in attributes", () => {
    const block = Provider({ type: "aws", alias: "west", region: "us-west-2" });
    expect(block.attributes).toEqual({ alias: "west", region: "us-west-2" });
  });

  it("excludes ref from attributes", () => {
    const block = Provider({ type: "aws", ref: {}, region: "ap-northeast-1" });
    expect(block.attributes).toEqual({ region: "ap-northeast-1" });
  });

  it("registers __refMeta on useRef proxy with alias", () => {
    const ref = useRef();
    Provider({ type: "aws", ref, alias: "west", region: "us-west-2" });
    expect(ref.__refMeta).toEqual({
      blockType: "provider",
      type: "aws",
      name: "west",
      alias: "west",
    });
  });

  it("registers __refMeta on useRef proxy without alias", () => {
    const ref = useRef();
    Provider({ type: "aws", ref, region: "us-west-2" });
    expect(ref.__refMeta).toEqual({
      blockType: "provider",
      type: "aws",
      name: "aws",
    });
  });
});
