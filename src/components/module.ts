/**
 * Module component — produces a ModuleBlock for the Block[] IR pipeline.
 *
 * Extracts `label` as the block label, passes remaining props as HCL attributes.
 * Reserved props `ref` and `children` are excluded from attributes:
 *   - `ref`: reserved for useRef — resolves to module.<label>.<output>
 *   - `children`: if string, stored as `innerText` for raw HCL body output
 *
 * Special handling for `depends_on` and `providers`:
 *   - `depends_on`: ref proxies are resolved to raw("module.name") / raw("type.name")
 *   - `providers`: ref proxies are resolved to raw("type.alias") with attribute() wrapper
 *
 * Usage in TSX:
 *   <Module label="vpc" source="terraform-aws-modules/vpc/aws" version="~> 5.0" cidr="10.0.0.0/16" />
 *   → module "vpc" { source = "terraform-aws-modules/vpc/aws" version = "~> 5.0" cidr = "10.0.0.0/16" }
 */
import type { ModuleBlock } from "../blocks";
import type { ModuleProps } from "../component-props/module-props";
import { adjustIndent, attribute, raw } from "../hcl-serializer";

export function Module(props: ModuleProps): ModuleBlock {
  const { label, ref, children, __hcl, ...rest } = props;
  const attributes = { ...rest, ...__hcl };

  // Register ref metadata so ref.vpc_id resolves to "module.vpc.vpc_id"
  if (ref) {
    ref.__refMeta = { blockType: "module", type: "module", label };
  }

  // Resolve depends_on refs: convert ref proxies → raw("module.name") / raw("type.name")
  if (attributes.depends_on && Array.isArray(attributes.depends_on)) {
    attributes.depends_on = attributes.depends_on.map((dep: any) => {
      if (dep.__refMeta) {
        const meta = dep.__refMeta;
        if (meta.blockType === "module") {
          return raw(`module.${meta.label}`);
        }
        if (meta.blockType === "data") {
          return raw(`data.${meta.type}.${meta.label}`);
        }
        return raw(`${meta.type}.${meta.label}`);
      }
      return dep;
    });
  }

  // Resolve providers refs: convert ref proxies → raw("type.alias")
  if (
    attributes.providers &&
    typeof attributes.providers === "object" &&
    !Array.isArray(attributes.providers)
  ) {
    const resolved: Record<string, any> = {};
    for (const [key, val] of Object.entries(attributes.providers)) {
      if ((val as any)?.__refMeta) {
        const meta = (val as any).__refMeta;
        resolved[key] = raw(`${meta.type}.${meta.alias || meta.label}`);
      } else {
        resolved[key] = val;
      }
    }
    attributes.providers = attribute(resolved);
  }

  const rawChildren = Array.isArray(children) ? children[0] : children;
  const hasInnerText = typeof rawChildren === "string";
  return {
    blockType: "module",
    name: label,
    attributes: hasInnerText ? {} : attributes,
    ...(hasInnerText ? { innerText: adjustIndent(rawChildren, 2) } : {}),
  };
}
