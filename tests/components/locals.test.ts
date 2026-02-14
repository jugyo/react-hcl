import { describe, it, expect } from "bun:test";
import { Locals } from "../../src/components/locals";

describe("Locals component", () => {
  it("returns a LocalsBlock with all props as attributes", () => {
    const block = Locals({ environment: "prod", project_name: "my-app" });
    expect(block.blockType).toBe("locals");
    expect(block.attributes).toEqual({ environment: "prod", project_name: "my-app" });
  });

  it("excludes children from attributes", () => {
    const block = Locals({ environment: "prod", children: "ignored" });
    expect(block.attributes).toEqual({ environment: "prod" });
  });
});
