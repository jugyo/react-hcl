import { describe, it, expect } from "bun:test";
import { Terraform } from "../../src/components/terraform";

describe("Terraform component", () => {
  it("returns a TerraformBlock with attributes", () => {
    const block = Terraform({ required_version: ">= 1.0" });
    expect(block.blockType).toBe("terraform");
    expect(block.attributes).toEqual({ required_version: ">= 1.0" });
  });

  it("stores children string as innerText", () => {
    const block = Terraform({ children: 'backend "s3" {\n  bucket = "my-bucket"\n}' });
    expect(block.innerText).toBe('backend "s3" {\n  bucket = "my-bucket"\n}');
    expect(block.attributes).toEqual({});
  });

  it("calls children function and stores result as innerText", () => {
    const block = Terraform({ children: () => "dynamic backend config" });
    expect(block.innerText).toBe("dynamic backend config");
  });

  it("does not set innerText when children is undefined", () => {
    const block = Terraform({ required_version: ">= 1.0" });
    expect(block.innerText).toBeUndefined();
  });
});
