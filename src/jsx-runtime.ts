// JSX のカスタムランタイム
// esbuild の jsxImportSource 設定でこのモジュールが使われる

export type JSXElement = {
  type: string | Function;
  props: Record<string, any>;
  children: any[];
};

export function jsx(type: string | Function, props: Record<string, any>): JSXElement {
  const { children, ...restProps } = props;
  return {
    type,
    props: restProps,
    children: children != null ? [children] : [],
  };
}

export function jsxs(type: string | Function, props: Record<string, any>): JSXElement {
  const { children, ...restProps } = props;
  return {
    type,
    props: restProps,
    children: Array.isArray(children) ? children : children != null ? [children] : [],
  };
}

export const Fragment = "Fragment";
