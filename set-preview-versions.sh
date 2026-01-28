#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
export TIMESTAMP
export SHORT_SHA

pnpm -r exec node <<'NODE'
const fs = require("fs");

const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
const base = pkg.version.split("-")[0];

const next = `${base}-beta.${process.env.TIMESTAMP}`;
const name = pkg.name || path;

pkg.version = next;
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log(`set-preview-version: ${name} -> ${next}`);
NODE
