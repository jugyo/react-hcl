import { describe, expect, it } from "vitest";
import { runCli } from "../helpers/cli";

const examples = [
  {
    name: "Module: basic with registry source",
    fixture: "sample-module-basic.tsx",
  },
  {
    name: "Module: useRef output references",
    fixture: "sample-module-ref.tsx",
  },
  {
    name: "Module: depends_on between modules",
    fixture: "sample-module-depends-on.tsx",
  },
  {
    name: "Module: provider pass-through",
    fixture: "sample-module-providers.tsx",
  },
  { name: "Module: innerText", fixture: "sample-module-innertext.tsx" },
];

describe("Integration: module examples", () => {
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
