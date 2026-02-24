import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  loadNormalizedActiveProviderSchema,
  loadRuntimeSchemaRegistry,
  writeActiveProviderSchemaMetadata,
} from "../src/provider-schema";

async function withTempDir(
  run: (cwd: string) => Promise<void>,
): Promise<void> {
  const cwd = await mkdtemp(join(tmpdir(), "react-hcl-provider-schema-"));
  try {
    await run(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

describe("provider-schema", () => {
  it("returns a registry that resolves null when metadata is absent and required=false", async () => {
    await withTempDir(async (cwd) => {
      const registry = loadRuntimeSchemaRegistry({ cwd, required: false });
      expect(
        registry.resolveBlockSchema({
          blockType: "resource",
          type: "aws_instance",
        }),
      ).toBeNull();
    });
  });

  it("throws when metadata is absent but provider schema artifacts exist and required=true", async () => {
    await withTempDir(async (cwd) => {
      await mkdir(resolve(cwd, ".react-hcl/provider-schema"), {
        recursive: true,
      });
      await writeFile(
        resolve(cwd, ".react-hcl/provider-schema/dummy.json"),
        "{}\n",
      );

      expect(() =>
        loadRuntimeSchemaRegistry({
          cwd,
          required: true,
        }),
      ).toThrow(/Missing \.react-hcl\/metadata\.json/);
    });
  });

  it("throws a clear error when metadata.json is malformed", async () => {
    await withTempDir(async (cwd) => {
      await mkdir(resolve(cwd, ".react-hcl"), { recursive: true });
      await writeFile(resolve(cwd, ".react-hcl/metadata.json"), "{broken");

      expect(() =>
        loadRuntimeSchemaRegistry({
          cwd,
          required: true,
        }),
      ).toThrow(/Failed to parse \.react-hcl\/metadata\.json/);
    });
  });

  it("writes active metadata and resolves normalized schema", async () => {
    await withTempDir(async (cwd) => {
      await mkdir(resolve(cwd, ".react-hcl/provider-schema"), {
        recursive: true,
      });

      const schemaPath = resolve(cwd, ".react-hcl/provider-schema/aws.json");
      await writeFile(
        schemaPath,
        JSON.stringify(
          {
            providerSource: "registry.terraform.io/hashicorp/aws",
            providerVersion: "latest",
            terraformVersion: "1.9.0",
            fetchedAt: "2026-02-24T00:00:00.000Z",
            schema: {
              provider: {
                block: {
                  attributes: {
                    region: { type: "string", optional: true },
                  },
                },
              },
              resource_schemas: {
                aws_instance: {
                  block: {
                    attributes: {
                      ami: { type: "string", required: true },
                    },
                  },
                },
              },
              data_source_schemas: {
                aws_ami: {
                  block: {
                    attributes: {
                      most_recent: { type: "bool", optional: true },
                    },
                  },
                },
              },
            },
          },
          null,
          2,
        ),
      );

      await writeActiveProviderSchemaMetadata({
        cwd,
        providerSource: "registry.terraform.io/hashicorp/aws",
        providerVersion: "latest",
        terraformVersion: "1.9.0",
        schemaFilePath: schemaPath,
        updatedAt: "2026-02-24T00:00:00.000Z",
      });

      const metadataRaw = await readFile(
        resolve(cwd, ".react-hcl/metadata.json"),
        "utf8",
      );
      expect(metadataRaw).toContain('"formatVersion": 1');
      expect(metadataRaw).toContain('"registry.terraform.io/hashicorp/aws"');
      expect(metadataRaw).toContain(".react-hcl/provider-schema/aws.json");

      const registry = loadRuntimeSchemaRegistry({ cwd, required: true });
      expect(
        registry.resolveBlockSchema({
          blockType: "resource",
          type: "aws_instance",
        })?.attributes?.ami?.required,
      ).toBe(true);

      const normalized = loadNormalizedActiveProviderSchema({ cwd });
      expect(normalized.resourceSchemas.aws_instance.attributes.ami.required).toBe(
        true,
      );
      expect(normalized.dataSchemas.aws_ami.attributes.most_recent.optional).toBe(
        true,
      );
      expect(normalized.providerSchema.attributes.region.optional).toBe(true);
    });
  });

  it("does not overwrite malformed metadata during active metadata write", async () => {
    await withTempDir(async (cwd) => {
      await mkdir(resolve(cwd, ".react-hcl"), { recursive: true });
      await writeFile(resolve(cwd, ".react-hcl/metadata.json"), "{broken");

      await expect(
        writeActiveProviderSchemaMetadata({
          cwd,
          providerSource: "registry.terraform.io/hashicorp/aws",
          providerVersion: "latest",
          terraformVersion: "1.9.0",
          schemaFilePath: resolve(cwd, ".react-hcl/provider-schema/aws.json"),
          updatedAt: "2026-02-24T00:00:00.000Z",
        }),
      ).rejects.toThrow(/Failed to parse \.react-hcl\/metadata\.json/);
    });
  });
});
