/**
 * Resource component — produces a ResourceBlock for the Block[] IR pipeline.
 *
 * Extracts `type` and `name` as block labels, passes remaining props as HCL attributes.
 * Special props `ref` and `children` are excluded from attributes:
 *   - `ref`: reserved for useRef (Step 8)
 *   - `children`: if string, stored as `innerText` for raw HCL body output (Step 10)
 *
 * Usage in TSX:
 *   <Resource type="aws_vpc" name="main" cidr_block="10.0.0.0/16" />
 *   → resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }
 */
import type { ResourceBlock } from "../blocks";
import { raw } from "../hcl-serializer";

export function Resource(props: {
  type: string;
  name: string;
  ref?: any;
  children?: string | string[];
  [key: string]: any;
}): ResourceBlock {
  const { type, name, ref, children, ...attributes } = props;

  // Register ref metadata so ref.id resolves to "aws_vpc.main.id"
  if (ref) {
    ref.__refMeta = { blockType: "resource", type, name };
  }

  // Resolve provider ref: convert ref proxy → raw("type.alias")
  if (attributes.provider && attributes.provider.__refMeta) {
    const meta = attributes.provider.__refMeta;
    attributes.provider = raw(`${meta.type}.${meta.alias || meta.name}`);
  }

  // Resolve depends_on refs: convert ref proxies → raw("type.name")
  if (attributes.depends_on && Array.isArray(attributes.depends_on)) {
    attributes.depends_on = attributes.depends_on.map((dep: any) => {
      if (dep.__refMeta) {
        const meta = dep.__refMeta;
        if (meta.blockType === "data") {
          return raw(`data.${meta.type}.${meta.name}`);
        }
        return raw(`${meta.type}.${meta.name}`);
      }
      return dep;
    });
  }

  const rawChildren = Array.isArray(children) ? children[0] : children;
  return {
    blockType: "resource",
    type,
    name,
    attributes,
    ...(typeof rawChildren === "string" ? { innerText: rawChildren } : {}),
  };
}
