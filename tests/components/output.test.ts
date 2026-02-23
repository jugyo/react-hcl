import { describe, expect, it } from "bun:test";
import { Output } from "../../src/components/output";

describe("Output component", () => {
  it("returns an OutputBlock with name and attributes", () => {
    const block = Output({ label: "vpc_id", value: "aws_vpc.main.id" });
    expect(block.blockType).toBe("output");
    expect(block.name).toBe("vpc_id");
    expect(block.attributes).toEqual({ value: "aws_vpc.main.id" });
  });

  it("includes description and sensitive attributes", () => {
    const block = Output({
      label: "db_password",
      value: "random_password.db.result",
      description: "The database password",
      sensitive: true,
    });
    expect(block.attributes).toEqual({
      value: "random_password.db.result",
      description: "The database password",
      sensitive: true,
    });
  });
});
