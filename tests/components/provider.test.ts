import { describe, it, expect } from "bun:test";
import { Provider } from "../../src/components/provider";

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

  it("stores alias on ref metadata when both ref and alias are provided", () => {
    const ref = { __refMeta: {} } as any;
    Provider({ type: "aws", ref, alias: "west", region: "us-west-2" });
    expect(ref.__refMeta.alias).toBe("west");
  });
});
