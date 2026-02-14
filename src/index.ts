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

export { DataSource } from "./components/data-source";
export { Locals } from "./components/locals";
export { Module } from "./components/module";
export { Output } from "./components/output";
export { Provider } from "./components/provider";
export { Resource } from "./components/resource";
export { Terraform } from "./components/terraform";
export { Variable } from "./components/variable";
export { tf } from "./helpers/tf";
export { useRef } from "./hooks/use-ref";
export { Fragment } from "./jsx-runtime";
