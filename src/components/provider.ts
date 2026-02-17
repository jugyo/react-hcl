/**
 * Provider component — produces a ProviderBlock for the Block[] IR pipeline.
 *
 * Extracts `type` as the block label, passes remaining props as HCL attributes.
 * Special props `ref` is excluded from attributes (reserved for useRef).
 * If both `ref` and `alias` are provided, the alias is stored on the ref metadata
 * so that references resolve to `<type>.<alias>`.
 *
 * Usage in TSX:
 *   <Provider type="aws" region="ap-northeast-1" />
 *   → provider "aws" { region = "ap-northeast-1" }
 */
import type { ProviderBlock } from "../blocks";

export function Provider(props: {
  type: string;
  ref?: any;
  alias?: string;
  [key: string]: any;
}): ProviderBlock {
  const { type, ref, alias, children, ...rest } = props;

  // Register ref metadata so provider can be referenced
  if (ref) {
    ref.__refMeta = {
      blockType: "provider",
      type,
      label: alias || type,
      ...(alias ? { alias } : {}),
    };
  }

  const attributes = alias ? { alias, ...rest } : rest;
  return { blockType: "provider", type, attributes };
}
