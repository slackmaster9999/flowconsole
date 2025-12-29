#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT/public/runtime/csharp"
TMP_DIR="$ROOT/tmp/dotnet-wasm"

WASM_RUNTIME_VERSION="8.0.16"
ROSLYN_VERSION="4.11.0"

mkdir -p "$RUNTIME_DIR" "$TMP_DIR"

download() {
  local url="$1"
  local dest="$2"
  if [[ -f "$dest" ]]; then
    echo "Using cached $dest"
    return
  fi
  echo "Downloading $url"
  curl -fL "$url" -o "$dest"
}

extract_package() {
  local pkg="$1"
  echo "Unpacking $(basename "$pkg")"
  unzip -q -o "$pkg" -d "$RUNTIME_DIR"
}

clean_assets() {
  # Trim dev-only payload
  find "$RUNTIME_DIR" -type f \( -name '*.pdb' -o -name '*.xml' -o -name '*.psmdcp' -o -name '*.p7s' \) -delete
  find "$RUNTIME_DIR" -type f \( -name '*.a' -o -name '*.map' -o -name '*.dat' -o -name '*.lib.js' -o -name '*.rsp' \) -delete
  rm -rf "$RUNTIME_DIR"/_rels "$RUNTIME_DIR"/package "$RUNTIME_DIR"/Icon.png \
    "$RUNTIME_DIR"/LICENSE.TXT "$RUNTIME_DIR"/THIRD-PARTY-NOTICES.TXT \
    "$RUNTIME_DIR"/useSharedDesignerContext.txt "$RUNTIME_DIR"/Microsoft.NETCore.App.versions.txt \
    "$RUNTIME_DIR"/data
  rm -rf "$RUNTIME_DIR"/runtimes/browser-wasm/native/include "$RUNTIME_DIR"/runtimes/browser-wasm/native/src \
    "$RUNTIME_DIR"/runtimes/browser-wasm/build

  # Only keep net8.0 culture-neutral libs
  find "$RUNTIME_DIR"/runtimes/browser-wasm/lib -mindepth 2 -type d ! -name net8.0 -exec rm -rf {} +
  find "$RUNTIME_DIR"/lib -mindepth 2 -type d ! -name net8.0 -exec rm -rf {} +
}

# Download required packages
download "https://www.nuget.org/api/v2/package/Microsoft.NETCore.App.Runtime.Mono.browser-wasm/${WASM_RUNTIME_VERSION}" \
  "$TMP_DIR/Microsoft.NETCore.App.Runtime.Mono.browser-wasm.${WASM_RUNTIME_VERSION}.nupkg"
download "https://www.nuget.org/api/v2/package/Microsoft.CodeAnalysis.Common/${ROSLYN_VERSION}" \
  "$TMP_DIR/Microsoft.CodeAnalysis.Common.${ROSLYN_VERSION}.nupkg"
download "https://www.nuget.org/api/v2/package/Microsoft.CodeAnalysis.CSharp/${ROSLYN_VERSION}" \
  "$TMP_DIR/Microsoft.CodeAnalysis.CSharp.${ROSLYN_VERSION}.nupkg"
download "https://www.nuget.org/api/v2/package/Microsoft.CodeAnalysis.Scripting.Common/${ROSLYN_VERSION}" \
  "$TMP_DIR/Microsoft.CodeAnalysis.Scripting.Common.${ROSLYN_VERSION}.nupkg"
download "https://www.nuget.org/api/v2/package/Microsoft.CodeAnalysis.CSharp.Scripting/${ROSLYN_VERSION}" \
  "$TMP_DIR/Microsoft.CodeAnalysis.CSharp.Scripting.${ROSLYN_VERSION}.nupkg"

# Unpack into runtime dir
extract_package "$TMP_DIR/Microsoft.NETCore.App.Runtime.Mono.browser-wasm.${WASM_RUNTIME_VERSION}.nupkg"
extract_package "$TMP_DIR/Microsoft.CodeAnalysis.Common.${ROSLYN_VERSION}.nupkg"
extract_package "$TMP_DIR/Microsoft.CodeAnalysis.CSharp.${ROSLYN_VERSION}.nupkg"
extract_package "$TMP_DIR/Microsoft.CodeAnalysis.Scripting.Common.${ROSLYN_VERSION}.nupkg"
extract_package "$TMP_DIR/Microsoft.CodeAnalysis.CSharp.Scripting.${ROSLYN_VERSION}.nupkg"

clean_assets
mkdir -p "$RUNTIME_DIR/lib"
cp "$RUNTIME_DIR/runtimes/browser-wasm/native/dotnet.js" "$RUNTIME_DIR/dotnet.js"
cp "$RUNTIME_DIR/runtimes/browser-wasm/native/dotnet.runtime.js" "$RUNTIME_DIR/dotnet.runtime.js"
cp "$RUNTIME_DIR/runtimes/browser-wasm/native/dotnet.native.js" "$RUNTIME_DIR/dotnet.native.js"
cp "$RUNTIME_DIR/runtimes/browser-wasm/native/dotnet.native.wasm" "$RUNTIME_DIR/dotnet.native.wasm"
cp "$RUNTIME_DIR/runtimes/browser-wasm/native/System.Private.CoreLib.dll" "$RUNTIME_DIR/System.Private.CoreLib.dll"
rm -rf "$RUNTIME_DIR/lib/net8.0"
cp -R "$RUNTIME_DIR/runtimes/browser-wasm/lib/net8.0" "$RUNTIME_DIR/lib/"

echo "Done. Assets available in $RUNTIME_DIR"
