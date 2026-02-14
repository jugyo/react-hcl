/**
 * Locals component — produces a LocalsBlock for the Block[] IR pipeline.
 *
 * All props become HCL attributes (there is no name label for locals blocks).
 * The `children` prop is excluded as it's a JSX-internal prop.
 *
 * Usage in TSX:
 *   <Locals environment="prod" project_name="my-app" />
 *   → locals { environment = "prod"\n  project_name = "my-app" }
 */
import type { LocalsBlock } from "../blocks";

export function Locals(props: Record<string, any>): LocalsBlock {
  const { children, ...attributes } = props;
  return { blockType: "locals", attributes };
}
