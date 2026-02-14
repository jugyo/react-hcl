import { describe, expect, it } from "bun:test";
import { $ } from "bun";

const samples = [
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

describe("Integration: module samples", () => {
  for (const sample of samples) {
    it(sample.name, async () => {
      const result =
        await $`bun run src/cli.ts tests/fixtures/${sample.fixture}`.text();
      expect(result).toMatchSnapshot();
    });
  }
});
