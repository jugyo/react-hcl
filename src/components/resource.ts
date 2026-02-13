// Stub implementation that just returns a string for Step 2
export function Resource(props: { type: string; name: string; [key: string]: any }): string {
  return `resource "${props.type}" "${props.name}" {}`;
}
