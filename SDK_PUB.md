# SDK Multi-Language Publishing Plan

Plan for publishing `@flowconsole/sdk` to language-specific registries beyond npm.

## Prerequisites

The SDK uses **jsii** for multi-language code generation. The `jsii-pacmak` command generates packages for each target language in `src/sdk/dist/`.

## Target Registries

### Python (PyPI)

**Package**: `flowconsole-sdk` (import as `flowconsole`)

**Artifacts**: `src/sdk/dist/python/` — `.whl` and `.tar.gz`

**GitHub Action**:
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
- uses: pypa/gh-action-pypi-publish@release/v1
  with:
    packages-dir: src/sdk/dist/python/
    password: ${{ secrets.PYPI_API_TOKEN }}
```

**Required secrets**: `PYPI_API_TOKEN`

### Java (Maven Central)

**Package**: `flowconsole.sdk:sdk`

**Artifacts**: `src/sdk/dist/java/` — Maven project with JAR

**GitHub Action**:
```yaml
- uses: actions/setup-java@v4
  with:
    distribution: temurin
    java-version: 17
    server-id: ossrh
    server-username: MAVEN_USERNAME
    server-password: MAVEN_PASSWORD
    gpg-private-key: ${{ secrets.GPG_PRIVATE_KEY }}
    gpg-passphrase: GPG_PASSPHRASE
- run: cd src/sdk/dist/java && mvn deploy -P release
  env:
    MAVEN_USERNAME: ${{ secrets.OSSRH_USERNAME }}
    MAVEN_PASSWORD: ${{ secrets.OSSRH_TOKEN }}
    GPG_PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}
```

**Required secrets**: `OSSRH_USERNAME`, `OSSRH_TOKEN`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`

**Setup steps**:
1. Create Sonatype OSSRH account
2. Claim `flowconsole` group ID
3. Generate GPG key pair for signing

### .NET (NuGet)

**Package**: `FlowConsole.Sdk` (namespace `FlowConsole`)

**Artifacts**: `src/sdk/dist/dotnet/*.nupkg`

**GitHub Action**:
```yaml
- uses: actions/setup-dotnet@v4
  with:
    dotnet-version: '8.0.x'
- run: |
    dotnet nuget push src/sdk/dist/dotnet/**/*.nupkg \
      --api-key ${{ secrets.NUGET_API_KEY }} \
      --source https://api.nuget.org/v3/index.json
```

**Required secrets**: `NUGET_API_KEY`

### Go

**Module**: `github.com/slackmaster9999/flowconsole` (package `flowconsole`)

**Artifacts**: `src/sdk/dist/go/flowconsole/` — complete Go module with `go.mod`

**Publishing approach**: Go modules are published by pushing source code to the module path repository. Options:
1. Push `dist/go/` contents to a dedicated Go repository
2. Use a subtree push to the module path

**Required setup**:
- Dedicated GitHub repository at `github.com/slackmaster9999/flowconsole`
- GitHub Action to copy generated Go code and push with version tag

## Secrets Summary

| Secret | Registry | Description |
|--------|----------|-------------|
| `PYPI_API_TOKEN` | PyPI | API token for Python package publishing |
| `OSSRH_USERNAME` | Maven | Sonatype OSSRH username |
| `OSSRH_TOKEN` | Maven | Sonatype OSSRH token |
| `GPG_PRIVATE_KEY` | Maven | GPG key for JAR signing |
| `GPG_PASSPHRASE` | Maven | GPG passphrase |
| `NUGET_API_KEY` | NuGet | API key for .NET package publishing |

## Implementation Order

1. PyPI — simplest setup, one secret
2. NuGet — one secret, straightforward push
3. Maven Central — most complex (GPG signing, Sonatype account)
4. Go — requires separate repository setup
