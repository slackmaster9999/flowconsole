#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
export TIMESTAMP
export SHORT_SHA

node <<'NODE'
const fs = require("fs");
const path = require("path");

const packages = [
  "src/core/package.json",
  "src/cli/package.json",
  "src/sdk/package.json",
  "src/web/package.json",
];

for (const relPath of packages) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`set-preview-version: skip missing ${relPath}`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const base = pkg.version.split("-")[0];
  const next = `${base}-beta.${process.env.TIMESTAMP}`;
  const name = pkg.name || relPath;

  pkg.version = next;
  fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`set-preview-version: ${name} -> ${next}`);
}
NODE
