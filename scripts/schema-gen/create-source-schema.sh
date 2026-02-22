#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

usage() {
  cat <<USAGE
Usage:
  create-source-schema.sh --type <terraform-type> [options]

Options:
  --type <name>                 Terraform type (required), e.g. aws_autoscaling_group
  --kind <resource|data>        Schema kind (default: resource)
  --out <path>                  Output path (default based on kind/type)
  --schema-json <path>          Schema JSON path (default: <repo>/tmp/schema.json)
  --refresh-schema              Always refresh schema JSON before generation
  --provider-source <source>    Provider source (default: hashicorp/aws)
  --provider-version <version>  Provider version constraint (optional)
  --provider-name <name>        Provider local name override (optional)
USAGE
}

type_name=""
kind="resource"
out=""
schema_json="$REPO_ROOT/tmp/schema.json"
refresh_schema="false"
provider_source="hashicorp/aws"
provider_version=""
provider_name=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)
      type_name="${2:-}"
      shift 2
      ;;
    --kind)
      kind="${2:-}"
      shift 2
      ;;
    --out)
      out="${2:-}"
      shift 2
      ;;
    --schema-json)
      schema_json="${2:-}"
      shift 2
      ;;
    --refresh-schema)
      refresh_schema="true"
      shift
      ;;
    --provider-source)
      provider_source="${2:-}"
      shift 2
      ;;
    --provider-version)
      provider_version="${2:-}"
      shift 2
      ;;
    --provider-name)
      provider_name="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$type_name" ]]; then
  echo "error: --type is required" >&2
  usage >&2
  exit 1
fi

if [[ "$kind" != "resource" && "$kind" != "data" ]]; then
  echo "error: --kind must be resource or data" >&2
  exit 1
fi

if [[ -z "$out" ]]; then
  if [[ "$kind" == "resource" ]]; then
    out="src/provider-schema/aws/resource/${type_name}.ts"
  else
    out="src/provider-schema/aws/data/${type_name}.ts"
  fi
fi

if [[ "$refresh_schema" == "true" || ! -f "$schema_json" ]]; then
  cmd=("$SCRIPT_DIR/export-provider-schema.sh" --output "$schema_json" --provider-source "$provider_source")
  if [[ -n "$provider_version" ]]; then
    cmd+=(--provider-version "$provider_version")
  fi
  if [[ -n "$provider_name" ]]; then
    cmd+=(--provider-name "$provider_name")
  fi
  "${cmd[@]}"
fi

mkdir -p "$(dirname "$out")"
node "$SCRIPT_DIR/generate-react-hcl-schema.mjs" \
  --schema-json "$schema_json" \
  --kind "$kind" \
  --type "$type_name" \
  --out "$out"

if command -v npx >/dev/null 2>&1; then
  npx biome check --write "$out" >/dev/null || true
fi

echo "generated source schema: $out"
