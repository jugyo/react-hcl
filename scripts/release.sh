#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage: bun run release [--skip-tests]

Release workflow:
1. Verify clean git worktree
2. Run tests (default)
3. Create annotated git tag for package.json version
4. Push commit and tags with --follow-tags
5. Publish to npm with bun publish
6. Verify published version on npm
EOF
}

skip_tests="false"
for arg in "$@"; do
  case "$arg" in
    --skip-tests)
      skip_tests="true"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg"
      usage
      exit 1
      ;;
  esac
done

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Release aborted: git worktree is not clean."
  echo "Commit or stash changes before running release."
  exit 1
fi

version="$(bun pm pkg get version | tr -d '"[:space:]')"
package_name="$(bun pm pkg get name | tr -d '"[:space:]')"
tag="v${version}"

if [[ -z "$version" || -z "$package_name" ]]; then
  echo "Release aborted: failed to read package name/version."
  exit 1
fi

if git rev-parse "$tag" >/dev/null 2>&1; then
  echo "Release aborted: local tag '$tag' already exists."
  exit 1
fi

if git ls-remote --exit-code --tags origin "refs/tags/$tag" >/dev/null 2>&1; then
  echo "Release aborted: remote tag '$tag' already exists."
  exit 1
fi

if [[ "$skip_tests" != "true" ]]; then
  echo "Running test suite..."
  bun test

  echo "Running packed-install smoke test..."
  bun run test:smoke:packed-install
fi

echo "Creating git tag $tag..."
git tag -a "$tag" -m "Release $tag"

echo "Pushing commit and tags..."
git push origin HEAD --follow-tags

echo "Publishing ${package_name}@${version}..."
bun publish

echo "Verifying published version..."
max_attempts=12
sleep_seconds=5
published_version=""

for attempt in $(seq 1 "$max_attempts"); do
  if published_version="$(npm view "${package_name}@${version}" version 2>/dev/null)"; then
    if [[ "$published_version" == "$version" ]]; then
      break
    fi
  fi

  if [[ "$attempt" -lt "$max_attempts" ]]; then
    echo "npm metadata not ready yet (attempt ${attempt}/${max_attempts}), retrying in ${sleep_seconds}s..."
    sleep "$sleep_seconds"
  fi
done

if [[ "$published_version" != "$version" ]]; then
  echo "Release warning: npm verification failed for ${package_name}@${version} after ${max_attempts} attempts."
  exit 1
fi

echo "Release complete: ${package_name}@${version} (tag: $tag)"
