export function logInit(message: string): void {
  process.stderr.write(`[react-hcl:init] ${message}\n`);
}
