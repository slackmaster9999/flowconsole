#!/usr/bin/env bash
set -euo pipefail

SHORT_SHA="${GITHUB_SHA:-$(git rev-parse --short=7 HEAD)}"
export SHORT_SHA

pnpm -r exec node -e "const fs=require('fs');const path='package.json';const pkg=JSON.parse(fs.readFileSync(path,'utf8'));const base=pkg.version.split('-')[0];pkg.version=\`${base}-beta.${SHORT_SHA}\`;fs.writeFileSync(path,JSON.stringify(pkg,null,2)+'\\n');"
