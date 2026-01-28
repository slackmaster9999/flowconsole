#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_SHA:?GITHUB_SHA is required in CI}"
SHORT_SHA="${GITHUB_SHA:0:7}"
export SHORT_SHA

pnpm -r exec node <<'NODE'
const fs = require("fs");

const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
const base = pkg.version.split("-")[0];

pkg.version = `${base}-beta.${process.env.SHORT_SHA}`;
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
NODE
