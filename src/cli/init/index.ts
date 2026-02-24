import {
  loadNormalizedActiveProviderSchema,
  writeActiveProviderSchemaMetadata,
} from "../../provider-schema";
import { logInit } from "./log";
import {
  ensureTerraformVersion,
  resolveSchema,
} from "./provider-schema/resolver";
import {
  ensureTsconfigJson,
  writeGeneratedOutputs,
} from "./schema-type/output";

export async function runInitCommand(options: {
  refresh: boolean;
}): Promise<void> {
  logInit("Resolving Terraform version...");
  const terraformVersion = await ensureTerraformVersion();
  logInit(`Terraform version: ${terraformVersion}`);
  const resolved = await resolveSchema({
    refresh: options.refresh,
    terraformVersion,
  });
  await writeActiveProviderSchemaMetadata({
    providerSource: resolved.cachePayload.providerSource,
    providerVersion: resolved.cachePayload.providerVersion,
    terraformVersion: resolved.cachePayload.terraformVersion,
    schemaFilePath: resolved.schemaFilePath,
    updatedAt: resolved.cachePayload.fetchedAt,
  });
  const activeSchema = loadNormalizedActiveProviderSchema({
    providerSource: resolved.cachePayload.providerSource,
  });
  logInit("Generating declaration files...");
  await writeGeneratedOutputs(activeSchema);
  await ensureTsconfigJson();
  logInit("Completed. Generated files under .react-hcl/");
}
