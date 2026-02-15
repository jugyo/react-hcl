import { describe, expect, it } from "bun:test";
import { Terraform } from "../../src/components/terraform";
import { isBlockHCL } from "../../src/hcl-serializer";

describe("Terraform component", () => {
  it("returns a TerraformBlock with attributes", () => {
    const block = Terraform({ required_version: ">= 1.0" });
    expect(block.blockType).toBe("terraform");
    expect(block.attributes).toEqual({ required_version: ">= 1.0" });
  });

  it("stores children string as innerText", () => {
    const block = Terraform({
      children: 'backend "s3" {\n  bucket = "my-bucket"\n}',
    });
    expect(block.innerText).toBe('backend "s3" {\n  bucket = "my-bucket"\n}');
    expect(block.attributes).toEqual({});
  });

  it("unwraps children array and stores first element as innerText", () => {
    const block = Terraform({ children: ["dynamic backend config"] as any });
    expect(block.innerText).toBe("dynamic backend config");
  });

  it("does not set innerText when children is undefined", () => {
    const block = Terraform({ required_version: ">= 1.0" });
    expect(block.innerText).toBeUndefined();
  });

  it("serializes required_providers as a block", () => {
    const tf = Terraform({
      required_providers: {
        aws: { source: "hashicorp/aws", version: "~> 5.0" },
      },
    });
    expect(isBlockHCL(tf.attributes.required_providers)).toBe(true);
  });
});
