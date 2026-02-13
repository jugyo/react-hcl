import { describe, it, expect } from "bun:test";
import { generate } from "../src/generator";
import type { Block } from "../src/blocks";

describe("generate", () => {
  it("resource block", () => {
    const blocks: Block[] = [
      {
        blockType: "resource",
        type: "aws_vpc",
        name: "main",
        attributes: { cidr_block: "10.0.0.0/16" },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain('resource "aws_vpc" "main"');
    expect(result).toContain('cidr_block = "10.0.0.0/16"');
  });

  it("data block", () => {
    const blocks: Block[] = [
      {
        blockType: "data",
        type: "aws_ami",
        name: "latest",
        attributes: { most_recent: true },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain('data "aws_ami" "latest"');
    expect(result).toContain("most_recent = true");
  });

  it("variable block", () => {
    const blocks: Block[] = [
      {
        blockType: "variable",
        name: "environment",
        attributes: { type: "string", default: "dev" },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain('variable "environment"');
  });

  it("output block", () => {
    const blocks: Block[] = [
      {
        blockType: "output",
        name: "vpc_id",
        attributes: { value: "aws_vpc.main.id" },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain('output "vpc_id"');
  });

  it("locals block", () => {
    const blocks: Block[] = [
      {
        blockType: "locals",
        attributes: { environment: "prod" },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain("locals {");
  });

  it("provider block", () => {
    const blocks: Block[] = [
      {
        blockType: "provider",
        type: "aws",
        attributes: { region: "ap-northeast-1" },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain('provider "aws"');
  });

  it("terraform block", () => {
    const blocks: Block[] = [
      {
        blockType: "terraform",
        attributes: { required_version: ">= 1.0" },
      },
    ];
    const result = generate(blocks);
    expect(result).toContain("terraform {");
  });

  it("empty line between multiple blocks", () => {
    const blocks: Block[] = [
      { blockType: "resource", type: "aws_vpc", name: "a", attributes: {} },
      { blockType: "resource", type: "aws_vpc", name: "b", attributes: {} },
    ];
    const result = generate(blocks);
    expect(result).toContain("}\n\n");
  });

  it("innerText block", () => {
    const blocks: Block[] = [
      {
        blockType: "resource",
        type: "aws_security_group",
        name: "example",
        attributes: {},
        innerText: '  name = "example"\n  vpc_id = aws_vpc.main.id',
      },
    ];
    const result = generate(blocks);
    expect(result).toContain('resource "aws_security_group" "example"');
    expect(result).toContain('name = "example"');
  });
});
