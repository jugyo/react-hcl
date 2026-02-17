import { describe, expect, it } from "bun:test";
import { Variable } from "../../src/components/variable";
import { generate } from "../../src/generator";
import { isRawHCL } from "../../src/hcl-serializer";

describe("Variable component", () => {
  it("returns a VariableBlock with name and attributes", () => {
    const block = Variable({
      label: "environment",
      type: "string",
      default: "dev",
    });
    expect(block.blockType).toBe("variable");
    expect(block.name).toBe("environment");
  });

  it("wraps type with raw() so HCL outputs unquoted type", () => {
    const block = Variable({ label: "env", type: "string" });
    expect(isRawHCL(block.attributes.type)).toBe(true);
    expect(block.attributes.type.value).toBe("string");
  });

  it("generates unquoted type in HCL output", () => {
    const block = Variable({ label: "env", type: "string", default: "dev" });
    const hcl = generate([block]);
    expect(hcl).toContain("type    = string");
    expect(hcl).toContain('default = "dev"');
  });

  it("does not include type in attributes when type is not provided", () => {
    const block = Variable({ label: "env", default: "dev" });
    expect(block.attributes.type).toBeUndefined();
    expect(block.attributes).toEqual({ default: "dev" });
  });

  it("includes description and sensitive attributes", () => {
    const block = Variable({
      label: "db_password",
      type: "string",
      description: "Database password",
      sensitive: true,
    });
    expect(block.attributes.description).toBe("Database password");
    expect(block.attributes.sensitive).toBe(true);
  });
});
