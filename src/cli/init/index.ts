import { logInit } from "./log";
import {
  ensureTerraformVersion,
  resolveSchema,
} from "./provider-schema/resolver";
import {
  ensureTsconfigJson,
  writeGeneratedOutputs,
} from "./schema-type/output";
import type { InitCommandOptions } from "./types";

export async function runInitCommand(
  options: InitCommandOptions,
): Promise<void> {
  logInit("Resolving Terraform version...");
  const terraformVersion = await ensureTerraformVersion();
  logInit(`Terraform version: ${terraformVersion}`);
  const schema = await resolveSchema({
    refresh: options.refresh,
    terraformVersion,
  });
  logInit("Generating declaration files...");
  await writeGeneratedOutputs(schema);
  await ensureTsconfigJson();
  logInit("Completed. Generated files under .react-hcl/");
}
