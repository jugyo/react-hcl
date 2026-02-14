/**
 * Custom JSX runtime for react-terraform.
 *
 * This is NOT React — it is a minimal JSX runtime that produces plain JSXElement objects
 * (a simple { type, props, children } structure) instead of React elements.
 *
 * How it integrates:
 *   - esbuild's `jsx: "automatic"` + `jsxImportSource: "react-terraform"` causes
 *     TSX files to import jsx/jsxs from "react-terraform/jsx-runtime" automatically.
 *   - When users write <Resource type="aws_vpc" name="main" />, esbuild transforms it to
 *     jsx(Resource, { type: "aws_vpc", name: "main" }) which returns a JSXElement.
 *   - The CLI (cli.ts) then renders the JSXElement tree by calling component functions
 *     and collecting their output.
 *
 * JSX automatic runtime contract:
 *   - `jsx(type, props)` is called for elements with 0 or 1 child
 *   - `jsxs(type, props)` is called for elements with 2+ children
 *   - `children` is passed inside `props` (not as a separate argument)
 *   - `Fragment` is used for <> ... </> syntax
 */

/** The runtime representation of a JSX element, produced by jsx() and jsxs(). */
export type JSXElement = {
  type: string | Function; // Component function or intrinsic element name
  props: Record<string, any>; // Props without children
  children: any[]; // Always normalized to an array
};

/**
 * Called by the JSX automatic transform for elements with 0 or 1 child.
 * Separates `children` from props and wraps a single child in an array.
 */
export function jsx(type: string | Function, props: Record<string, any>): JSXElement {
  const { children, ...restProps } = props;
  return {
    type,
    props: restProps,
    children: children != null ? [children] : [],
  };
}

/**
 * Called by the JSX automatic transform for elements with 2+ children.
 * Children are already an array from the transform; normalizes edge cases.
 */
export function jsxs(type: string | Function, props: Record<string, any>): JSXElement {
  const { children, ...restProps } = props;
  return {
    type,
    props: restProps,
    children: Array.isArray(children) ? children : children != null ? [children] : [],
  };
}

/** Fragment component — used for <> ... </> grouping without a wrapper element. */
export const Fragment = "Fragment";
