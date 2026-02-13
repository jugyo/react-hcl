// Step 2 では文字列を返すだけのダミー実装
export function Resource(props: { type: string; name: string; [key: string]: any }): string {
  return `resource "${props.type}" "${props.name}" {}`;
}
