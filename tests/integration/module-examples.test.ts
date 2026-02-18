import { describe, expect, it } from "bun:test";
import { $ } from "bun";

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
      const result =
        await $`bun run src/cli/index.ts generate tests/fixtures/${example.fixture}`.text();
      expect(result).toMatchSnapshot();
    });
  }
});
