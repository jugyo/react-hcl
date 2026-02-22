import { describe, expect, it } from "vitest";
import { generate } from "../src/generator";
import { adjustIndent } from "../src/hcl-serializer";

describe("adjustIndent", () => {
  it("strips leading and trailing blank lines", () => {
    const input = "\n\n  hello\n  world\n\n";
    expect(adjustIndent(input, 0)).toBe("hello\nworld");
  });

  it("adjusts indentation to target level", () => {
    const input = "    foo\n    bar";
    expect(adjustIndent(input, 2)).toBe("  foo\n  bar");
  });

  it("preserves relative indentation", () => {
    const input = "  parent {\n    child = 1\n  }";
    expect(adjustIndent(input, 2)).toBe("  parent {\n    child = 1\n  }");
  });

  it("increases indentation from zero", () => {
    const input = "foo\n  bar\nbaz";
    expect(adjustIndent(input, 4)).toBe("    foo\n      bar\n    baz");
  });

  it("handles empty lines in the middle", () => {
    const input = "a = 1\n\nb = 2";
    expect(adjustIndent(input, 2)).toBe("  a = 1\n\n  b = 2");
  });

  it("returns empty string for blank input", () => {
    expect(adjustIndent("", 2)).toBe("");
    expect(adjustIndent("\n\n", 2)).toBe("");
  });

  it("handles template literal with leading blank line", () => {
    // Simulates what happens with `{`\n  content\n`}`
    const input = '\nami = "test"\ninstance_type = "t2.micro"\n';
    expect(adjustIndent(input, 2)).toBe(
      '  ami = "test"\n  instance_type = "t2.micro"',
    );
  });
});

describe("generate with innerText", () => {
  it("passes through invalid HCL innerText without validation", () => {
    const hcl = generate([
      {
        blockType: "resource",
        type: "aws_instance",
        name: "web",
        attributes: {},
        innerText: "  a = {",
      },
    ]);
    expect(hcl).toContain("  a = {");
  });

  it("innerText takes precedence over attributes", () => {
    const hcl = generate([
      {
        blockType: "resource",
        type: "aws_instance",
        name: "web",
        attributes: { ami: "should-be-ignored" },
        innerText: '  ami = "from-innertext"',
      },
    ]);
    expect(hcl).toContain('ami = "from-innertext"');
    expect(hcl).not.toContain("should-be-ignored");
  });
});
