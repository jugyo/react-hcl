# schema-gen

A set of scripts to generate `react-hcl` source schema files from Terraform provider schema JSON.

## Files

- `create-source-schema.sh`: Wrapper for schema JSON export + source schema generation
- `export-provider-schema.sh`: Runs `terraform providers schema -json` in a temporary Terraform directory
- `generate-react-hcl-schema.mjs`: Generates one file under `src/resource-schema/aws/**` from JSON using the DSL builders (`attr.*`, `block.*`, `resource/data`)

## Quick Start

Generate `aws_autoscaling_group`:

```bash
scripts/schema-gen/create-source-schema.sh \
  --type aws_autoscaling_group \
  --kind resource \
  --out src/resource-schema/aws/resource/aws_autoscaling_group.ts
```

Generate `aws_ami`:

```bash
scripts/schema-gen/create-source-schema.sh \
  --type aws_ami \
  --kind data \
  --out src/resource-schema/aws/data/aws_ami.ts
```

## Defaults

- Schema JSON: `<repo>/tmp/schema.json`
- Terraform workdir: `<repo>/tmp/tf-provider-schema-*`
- Provider source: `hashicorp/aws`

Schema JSON is re-exported only when `--refresh-schema` is specified.
