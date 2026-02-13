import type { Block } from "./blocks";
import { serializeHCLAttributes } from "./hcl-serializer";

function blockHeader(block: Block): string {
  switch (block.blockType) {
    case "resource":
      return `resource "${block.type}" "${block.name}"`;
    case "data":
      return `data "${block.type}" "${block.name}"`;
    case "variable":
      return `variable "${block.name}"`;
    case "output":
      return `output "${block.name}"`;
    case "locals":
      return "locals";
    case "provider":
      return `provider "${block.type}"`;
    case "terraform":
      return "terraform";
  }
}

function hasInnerText(block: Block): block is Block & { innerText: string } {
  return "innerText" in block && typeof block.innerText === "string";
}

function renderBlock(block: Block): string {
  const header = blockHeader(block);
  if (hasInnerText(block)) {
    return `${header} {\n${block.innerText}\n}`;
  }
  const body = serializeHCLAttributes(block.attributes);
  if (body === "") {
    return `${header} {\n}`;
  }
  return `${header} {\n${body}\n}`;
}

export function generate(blocks: Block[]): string {
  return blocks.map(renderBlock).join("\n\n") + "\n";
}
