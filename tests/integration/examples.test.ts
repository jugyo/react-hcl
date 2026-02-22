import { describe, expect, it } from "vitest";
import { runCli } from "../helpers/cli";

const examples = [
  { name: "15.1 Basic Resource", fixture: "sample-15-1.tsx" },
  { name: "15.2 References", fixture: "sample-15-2.tsx" },
  { name: "15.3 Variable/Locals", fixture: "sample-15-3.tsx" },
  { name: "15.4 innerText", fixture: "sample-15-4.tsx" },
  { name: "15.5 Provider Aliases", fixture: "sample-15-5.tsx" },
  { name: "15.6 depends_on", fixture: "sample-15-6.tsx" },
  { name: "15.7 Terraform Attribute", fixture: "sample-15-7.tsx" },
  { name: "15.8 Terraform innerText", fixture: "sample-15-8.tsx" },
  {
    name: "Escape: Terraform expressions in innerText",
    fixture: "sample-escape.tsx",
  },
];

describe("Integration: design doc examples", () => {
  for (const example of examples) {
    it(example.name, async () => {
      const result = await runCli([
        "generate",
        `tests/fixtures/${example.fixture}`,
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trimEnd()).toMatchSnapshot();
    });
  }
});

describe("Determinism", () => {
  it("produces identical output for identical input across multiple runs", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, async () => {
        const result = await runCli([
          "generate",
          "tests/fixtures/sample-15-2.tsx",
        ]);
        expect(result.exitCode).toBe(0);
        return result.stdout;
      }),
    );

    for (const result of results) {
      expect(result).toBe(results[0]);
    }
  });
});
