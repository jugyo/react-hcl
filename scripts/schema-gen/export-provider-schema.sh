#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

usage() {
  cat <<USAGE
Usage:
  export-provider-schema.sh --output <path> [options]

Options:
  --output <path>               Output JSON file path (required)
  --provider-source <source>    Provider source (default: hashicorp/aws)
  --provider-version <version>  Provider version constraint (optional)
  --provider-name <name>        Provider local name (default: basename of source)
  --workdir <path>              Work directory (default: mktemp in <repo>/tmp)
  --keep-workdir                Keep work directory
USAGE
}

output=""
provider_source="hashicorp/aws"
provider_version=""
provider_name=""
workdir=""
keep_workdir="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      output="${2:-}"
      shift 2
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
    --workdir)
      workdir="${2:-}"
      shift 2
      ;;
    --keep-workdir)
      keep_workdir="true"
      shift
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

if [[ -z "$output" ]]; then
  echo "error: --output is required" >&2
  usage >&2
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "error: terraform command not found" >&2
  exit 1
fi

if [[ -z "$provider_name" ]]; then
  provider_name="${provider_source##*/}"
fi

if [[ -z "$workdir" ]]; then
  mkdir -p "$REPO_ROOT/tmp"
  workdir="$(mktemp -d "$REPO_ROOT/tmp/tf-provider-schema-XXXXXX")"
  created_temp_workdir="true"
else
  mkdir -p "$workdir"
  created_temp_workdir="false"
fi

cleanup() {
  if [[ "$keep_workdir" == "true" ]]; then
    return
  fi
  if [[ "$created_temp_workdir" == "true" && -d "$workdir" ]]; then
    rm -rf "$workdir"
  fi
}
trap cleanup EXIT

mkdir -p "$(dirname "$output")"

if [[ -n "$provider_version" ]]; then
  version_line="      version = \"$provider_version\""
else
  version_line=""
fi

cat > "$workdir/main.tf" <<TF
terraform {
  required_providers {
    $provider_name = {
      source  = "$provider_source"
$version_line
    }
  }
}

provider "$provider_name" {}
TF

terraform -chdir="$workdir" init -backend=false -input=false -no-color >/dev/null
terraform -chdir="$workdir" providers schema -json > "$output"

echo "wrote schema JSON: $output"
if [[ "$keep_workdir" == "true" ]]; then
  echo "kept workdir: $workdir"
fi
