/**
 * Resource component — produces a ResourceBlock for the Block[] IR pipeline.
 *
 * Extracts `type` and `label` as block labels, passes remaining props as HCL attributes.
 * Special props `ref` and `children` are excluded from attributes:
 *   - `ref`: reserved for useRef metadata registration
 *   - `children`: if string, stored as `innerText` for raw HCL body output
 *
 * Usage in TSX:
 *   <Resource type="aws_vpc" label="main" cidr_block="10.0.0.0/16" />
 *   → resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }
 */
import type { ResourceBlock } from "../blocks";
import type { ResourceProps } from "../component-props/resource-props";
import { adjustIndent, raw } from "../hcl-serializer";

export function Resource(props: ResourceProps): ResourceBlock;
export function Resource(props: {
  type: string;
  label: string;
  ref?: unknown;
  children?: string | string[];
  __hcl?: Record<string, unknown>;
  [key: string]: unknown;
}): ResourceBlock {
  const { type, label, ref, children, __hcl, ...rest } = props;
  const attributes = { ...rest, ...__hcl } as Record<string, any>;

  // Register ref metadata so ref.id resolves to "aws_vpc.main.id"
  if (ref) {
    (ref as { __refMeta?: any }).__refMeta = {
      blockType: "resource",
      type,
      label,
    };
  }

  // Resolve provider ref: convert ref proxy → raw("type.alias")
  const providerRef = attributes.provider as { __refMeta?: any } | undefined;
  if (providerRef?.__refMeta) {
    const meta = providerRef.__refMeta;
    attributes.provider = raw(`${meta.type}.${meta.alias || meta.label}`);
  }

  // Resolve depends_on refs: convert ref proxies → raw("type.name")
  if (attributes.depends_on && Array.isArray(attributes.depends_on)) {
    attributes.depends_on = attributes.depends_on.map((dep: any) => {
      if (dep.__refMeta) {
        const meta = dep.__refMeta;
        if (meta.blockType === "data") {
          return raw(`data.${meta.type}.${meta.label}`);
        }
        return raw(`${meta.type}.${meta.label}`);
      }
      return dep;
    });
  }

  const rawChildren = Array.isArray(children) ? children[0] : children;
  const hasInnerText = typeof rawChildren === "string";
  return {
    blockType: "resource",
    type,
    name: label,
    attributes: hasInnerText ? {} : attributes,
    ...(hasInnerText ? { innerText: adjustIndent(rawChildren, 2) } : {}),
  };
}
