#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT="$ROOT/src/codeWorkbench/languages/csharp-runtime/CSharpDslRuntime.csproj"
OUT_DIR="$ROOT/public"
TMP_DIR="$ROOT/src/codeWorkbench/languages/csharp-runtime/bin/Release/net10.0/browser-wasm"

echo "Publishing C# WASM runtime (Release, browser-wasm)..."
rm -rf "$TMP_DIR"
dotnet publish "$PROJECT" \
  -c Release \
  -r browser-wasm \
  --self-contained true \
  -p:WasmBuildNative=true \
  -p:InvariantGlobalization=true \
  -p:DisableWasmRelinker=true \
  -p:PublishTrimmed=false \
  -p:WasmNativeStrip=false \
  -p:UseAppHost=false \
  -o "$TMP_DIR"

# Locate the generated _framework folder (layout differs across SDKs)
FRAMEWORK_DIR="$TMP_DIR/AppBundle/_framework" 

if [[ -z "$FRAMEWORK_DIR" ]]; then
  echo "_framework not found in $TMP_DIR" >&2
  exit 1
fi

echo "Copying WASM payload to $OUT_DIR"
mkdir -p "$OUT_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$FRAMEWORK_DIR"/ "$OUT_DIR"/
else
  rm -rf "$OUT_DIR"
  mkdir -p "$OUT_DIR"
  cp -R "$FRAMEWORK_DIR"/. "$OUT_DIR"/
fi

echo "Done. Assets ready at $OUT_DIR"
