/**
 * Public API entry point for the react-terraform package.
 *
 * This module re-exports all user-facing components and utilities.
 * Users import from "react-terraform" in their TSX files:
 *
 *   import { Resource, Fragment } from "react-terraform";
 *
 * As more components are added (Data, Variable, Output, Provider, etc.),
 * they should be exported from here.
 */
export { Resource } from "./components/resource";
export { DataSource } from "./components/data-source";
export { Output } from "./components/output";
export { Variable } from "./components/variable";
export { Locals } from "./components/locals";
export { Provider } from "./components/provider";
export { Terraform } from "./components/terraform";
export { Fragment } from "./jsx-runtime";
export { useRef } from "./hooks/use-ref";
