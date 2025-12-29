#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_ROOT="$ROOT/public/runtime/csharp"
TMP_ROOT="$ROOT/tmp/dotnet-wasm"

rm -rf "$RUNTIME_ROOT" "$TMP_ROOT"

echo "Cleaned dotnet/wasm runtime artifacts."
