import { describe, it, expect } from "bun:test";
import { DataSource } from "../../src/components/data-source";

describe("DataSource component", () => {
  it("returns a DataSourceBlock with attributes", () => {
    const block = DataSource({ type: "aws_ami", name: "latest", most_recent: true });
    expect(block.blockType).toBe("data");
    expect(block.type).toBe("aws_ami");
    expect(block.name).toBe("latest");
    expect(block.attributes).toEqual({ most_recent: true });
  });

  it("excludes ref and children from attributes", () => {
    const block = DataSource({ type: "aws_ami", name: "latest", ref: {}, children: "hcl text" });
    expect(block.attributes).toEqual({});
    expect(block.innerText).toBe("hcl text");
  });

  it("calls children function and stores result as innerText", () => {
    const block = DataSource({ type: "aws_ami", name: "latest", children: () => "dynamic hcl" });
    expect(block.innerText).toBe("dynamic hcl");
  });

  it("does not set innerText when children is undefined", () => {
    const block = DataSource({ type: "aws_ami", name: "latest" });
    expect(block.innerText).toBeUndefined();
  });
});
