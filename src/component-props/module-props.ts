import type { Ref } from "../hooks/use-ref";

export type ModuleProps = {
  label: string;
  ref?: Ref;
  children?: string | string[];
  __hcl?: Record<string, any>;
  [key: string]: any;
};
