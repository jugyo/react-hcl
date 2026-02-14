import { describe, it, expect } from "bun:test";
import { detectConflicts, ConflictError } from "../src/conflict";
import type { Block } from "../src/blocks";

describe("detectConflicts", () => {
  it("throws on duplicate resource with same type + name", () => {
    const blocks: Block[] = [
      { blockType: "resource", type: "aws_vpc", name: "main", attributes: {} },
      { blockType: "resource", type: "aws_vpc", name: "main", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("allows resources with different names", () => {
    const blocks: Block[] = [
      { blockType: "resource", type: "aws_vpc", name: "main", attributes: {} },
      {
        blockType: "resource",
        type: "aws_vpc",
        name: "secondary",
        attributes: {},
      },
    ];
    expect(() => detectConflicts(blocks)).not.toThrow();
  });

  it("throws on duplicate data source with same type + name", () => {
    const blocks: Block[] = [
      { blockType: "data", type: "aws_ami", name: "latest", attributes: {} },
      { blockType: "data", type: "aws_ami", name: "latest", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("allows resource and data source with same type + name", () => {
    const blocks: Block[] = [
      { blockType: "resource", type: "aws_vpc", name: "main", attributes: {} },
      { blockType: "data", type: "aws_vpc", name: "main", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).not.toThrow();
  });

  it("throws on duplicate variable name", () => {
    const blocks: Block[] = [
      { blockType: "variable", name: "env", attributes: {} },
      { blockType: "variable", name: "env", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("throws on duplicate output name", () => {
    const blocks: Block[] = [
      { blockType: "output", name: "id", attributes: {} },
      { blockType: "output", name: "id", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("allows multiple locals blocks", () => {
    const blocks: Block[] = [
      { blockType: "locals", attributes: { a: 1 } },
      { blockType: "locals", attributes: { b: 2 } },
    ];
    expect(() => detectConflicts(blocks)).not.toThrow();
  });

  it("allows providers with same type but different alias", () => {
    const blocks: Block[] = [
      {
        blockType: "provider",
        type: "aws",
        attributes: { region: "ap-northeast-1" },
      },
      {
        blockType: "provider",
        type: "aws",
        attributes: { alias: "virginia", region: "us-east-1" },
      },
    ];
    expect(() => detectConflicts(blocks)).not.toThrow();
  });

  it("throws on providers with same type + same alias", () => {
    const blocks: Block[] = [
      {
        blockType: "provider",
        type: "aws",
        attributes: { alias: "virginia" },
      },
      {
        blockType: "provider",
        type: "aws",
        attributes: { alias: "virginia" },
      },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("throws on duplicate providers with no alias", () => {
    const blocks: Block[] = [
      {
        blockType: "provider",
        type: "aws",
        attributes: { region: "us-east-1" },
      },
      {
        blockType: "provider",
        type: "aws",
        attributes: { region: "us-west-2" },
      },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("throws on multiple terraform blocks", () => {
    const blocks: Block[] = [
      { blockType: "terraform", attributes: {} },
      { blockType: "terraform", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).toThrow(ConflictError);
  });

  it("does not throw for empty block list", () => {
    expect(() => detectConflicts([])).not.toThrow();
  });

  it("does not throw when all blocks are unique", () => {
    const blocks: Block[] = [
      { blockType: "resource", type: "aws_vpc", name: "main", attributes: {} },
      { blockType: "data", type: "aws_ami", name: "latest", attributes: {} },
      { blockType: "variable", name: "env", attributes: {} },
      { blockType: "output", name: "vpc_id", attributes: {} },
      { blockType: "locals", attributes: { a: 1 } },
      {
        blockType: "provider",
        type: "aws",
        attributes: { region: "us-east-1" },
      },
      { blockType: "terraform", attributes: {} },
    ];
    expect(() => detectConflicts(blocks)).not.toThrow();
  });
});
