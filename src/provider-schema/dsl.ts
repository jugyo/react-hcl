/**
 * Public entrypoint for Terraform schema DSL.
 *
 * Internal responsibilities are split into:
 * - `dsl/types.ts`: authoring/normalized type utilities
 * - `dsl/normalize.ts`: runtime normalization functions
 * - `dsl/api.ts`: public DSL API (`attr`, `block`, `resource`, `data`)
 */
export { attr, block, data, resource } from "./dsl/api";
export type { AttrDef } from "./dsl/types";
