/**
 * Data component — produces a DataBlock for the Block[] IR pipeline.
 *
 * Extracts `type` and `name` as block labels, passes remaining props as HCL attributes.
 * Special props `ref` and `children` are excluded from attributes:
 *   - `ref`: reserved for useRef (Step 8)
 *   - `children`: if string, stored as `innerText`
 *
 * Usage in TSX:
 *   <Data type="aws_ami" name="latest" most_recent={true} />
 *   → data "aws_ami" "latest" { most_recent = true }
 */
import type { DataBlock } from "../blocks";
import type {
  AwsDataType,
  DataProps,
  LooseDataProps,
  StrictDataProps,
} from "../component-props/data-props";
import { adjustIndent, raw } from "../hcl-serializer";

export function Data<T extends AwsDataType>(
  props: StrictDataProps<T>,
): DataBlock;
export function Data<T extends string>(props: LooseDataProps<T>): DataBlock;
export function Data<T extends string>(props: DataProps<T>): DataBlock {
  const { type, name, ref, children, __hcl, ...rest } = props;
  const attributes = { ...rest, ...__hcl };

  // Register ref metadata so ref.id resolves to "data.aws_ami.latest.id"
  if (ref) {
    ref.__refMeta = { blockType: "data", type, name };
  }

  // Resolve provider ref: convert ref proxy → raw("type.alias")
  const providerRef = attributes.provider as { __refMeta?: any } | undefined;
  if (providerRef?.__refMeta) {
    const meta = providerRef.__refMeta;
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
  const hasInnerText = typeof rawChildren === "string";
  return {
    blockType: "data",
    type,
    name,
    attributes: hasInnerText ? {} : attributes,
    ...(hasInnerText ? { innerText: adjustIndent(rawChildren, 2) } : {}),
  };
}
