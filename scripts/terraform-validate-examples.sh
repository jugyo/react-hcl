#!/usr/bin/env bash

set -euo pipefail

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform command not found. Please install Terraform first." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLES_DIR="$ROOT_DIR/examples"
PLUGIN_CACHE_DIR="${TF_PLUGIN_CACHE_DIR:-$ROOT_DIR/.terraform-plugin-cache}"
PLUGIN_TIMEOUT="${TF_PLUGIN_TIMEOUT:-5m}"
VALIDATE_LOG_LEVEL="${TF_VALIDATE_LOG:-}"
DISABLE_IMDS="${AWS_EC2_METADATA_DISABLED:-true}"
INIT_UPGRADE="${TF_INIT_UPGRADE:-true}"
VALIDATE_RETRIES="${TF_VALIDATE_RETRIES:-2}"

RUN_TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/tf-validate-examples.XXXXXX")"
cleanup() {
  rm -rf "$RUN_TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$PLUGIN_CACHE_DIR"

output_dirs=()
while IFS= read -r dir; do
  output_dirs+=("$dir")
done < <(find "$EXAMPLES_DIR" -type f -path "*/output/*.tf" -exec dirname {} \; | sort -u)

if [[ ${#output_dirs[@]} -eq 0 ]]; then
  echo "No Terraform files found under examples/**/output/*.tf"
  exit 0
fi

targets=("$@")
if [[ ${#targets[@]} -gt 0 ]]; then
  filtered_dirs=()
  for dir in "${output_dirs[@]}"; do
    rel_dir="${dir#"$ROOT_DIR"/}"
    for target in "${targets[@]}"; do
      normalized_target="${target#./}"
      normalized_target="${normalized_target#examples/}"
      normalized_target="${normalized_target%/}"
      normalized_target="${normalized_target%/output}"
      if [[ "$rel_dir" == "examples/$normalized_target/output" || "$rel_dir" == "examples/$normalized_target/output/"* ]]; then
        filtered_dirs+=("$dir")
        break
      fi
    done
  done
  output_dirs=("${filtered_dirs[@]}")
fi

if [[ ${#output_dirs[@]} -eq 0 ]]; then
  if [[ ${#targets[@]} -gt 0 ]]; then
    echo "No matching Terraform outputs found for targets: ${targets[*]}" >&2
  else
    echo "No Terraform files found under examples/**/output/*.tf"
  fi
  exit 1
fi

failed_dirs=()
init_args=(-backend=false -input=false -no-color)
if [[ "$INIT_UPGRADE" == "true" ]]; then
  init_args+=(-upgrade)
fi

for dir in "${output_dirs[@]}"; do
  rel_dir="${dir#"$ROOT_DIR"/}"
  echo "==> Validating ${rel_dir}"
  tf_data_dir="$RUN_TMP_DIR/${rel_dir//\//__}"
  lockfile_path="$dir/.terraform.lock.hcl"
  lockfile_existed="false"
  if [[ -f "$lockfile_path" ]]; then
    lockfile_existed="true"
  fi

  if (
    cd "$dir"
    TF_PLUGIN_CACHE_DIR="$PLUGIN_CACHE_DIR" TF_PLUGIN_TIMEOUT="$PLUGIN_TIMEOUT" TF_DATA_DIR="$tf_data_dir" AWS_EC2_METADATA_DISABLED="$DISABLE_IMDS" terraform init "${init_args[@]}"
  ); then
    :
  else
    rc=$?
    if [[ $rc -eq 130 ]]; then
      echo "Interrupted. Stopping validation." >&2
      exit 130
    fi
    if [[ "$lockfile_existed" == "false" && -f "$lockfile_path" ]]; then
      rm -f "$lockfile_path"
    fi
    echo "init failed: ${rel_dir}" >&2
    failed_dirs+=("$rel_dir")
    continue
  fi

  echo "   Running terraform validate..."
  validate_cmd=(terraform validate -no-color)
  validate_env=(TF_PLUGIN_CACHE_DIR="$PLUGIN_CACHE_DIR" TF_PLUGIN_TIMEOUT="$PLUGIN_TIMEOUT" TF_DATA_DIR="$tf_data_dir" AWS_EC2_METADATA_DISABLED="$DISABLE_IMDS")
  if [[ -n "$VALIDATE_LOG_LEVEL" ]]; then
    validate_env+=(TF_LOG="$VALIDATE_LOG_LEVEL")
  fi

  validate_ok="false"
  max_attempts=$((VALIDATE_RETRIES + 1))
  for ((attempt = 1; attempt <= max_attempts; attempt++)); do
    if (
      cd "$dir"
      env "${validate_env[@]}" "${validate_cmd[@]}"
    ); then
      validate_ok="true"
      break
    fi

    rc=$?
    if [[ $rc -eq 130 ]]; then
      echo "Interrupted. Stopping validation." >&2
      exit 130
    fi
    if (( attempt < max_attempts )); then
      echo "validate attempt ${attempt}/${max_attempts} failed: ${rel_dir}. retrying..." >&2
      sleep 2
    fi
  done

  if [[ "$validate_ok" != "true" ]]; then
    echo "validate failed: ${rel_dir}" >&2
    failed_dirs+=("$rel_dir")
  fi

  if [[ "$lockfile_existed" == "false" && -f "$lockfile_path" ]]; then
    rm -f "$lockfile_path"
  fi
done

if [[ ${#failed_dirs[@]} -gt 0 ]]; then
  echo
  echo "Validation failed in:"
  for failed in "${failed_dirs[@]}"; do
    echo "  - $failed"
  done
  exit 1
fi

echo "All example Terraform outputs are valid."
