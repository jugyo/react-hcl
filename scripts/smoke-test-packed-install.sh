#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/react-hcl-pack-XXXXXX")"
SMOKE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/react-hcl-smoke-XXXXXX")"

cleanup() {
  rm -rf "$PACK_DIR" "$SMOKE_DIR"
}
trap cleanup EXIT

cd "$ROOT_DIR"

PACK_OUTPUT="$(bun pm pack --destination "$PACK_DIR" --quiet)"
TARBALL_PATH="$(printf '%s\n' "$PACK_OUTPUT" | tail -n 1)"

if [[ ! -f "$TARBALL_PATH" ]]; then
  echo "Smoke test failed: could not find packed tarball at '$TARBALL_PATH'."
  exit 1
fi

cd "$SMOKE_DIR"
npm init -y >/dev/null
npm install "$TARBALL_PATH" >/dev/null
npx react-hcl --help >/dev/null

echo "Smoke test passed: npm-installed CLI starts successfully."
