# Gitleaks Setup (Optional Enhancement)

**Purpose**: Advanced secret detection in code and git history

**Status**: Optional enhancement for `scan-secrets.ps1` script

## Overview

Gitleaks is a SAST tool for detecting and preventing hardcoded secrets like passwords, API keys, and tokens in git repositories.

**Why Optional**: The `scan-secrets.ps1` script uses regex-based pattern matching. Gitleaks provides more sophisticated secret detection.

## Prerequisites

- Git installed
- Access to repository

## Installation Steps

### Windows

#### Option 1: Using Chocolatey (Recommended)

```powershell
choco install gitleaks
```

#### Option 2: Using Scoop

```powershell
scoop install gitleaks
```

#### Option 3: Manual Installation

```powershell
# Download latest release
$GitleaksUrl = "https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_windows_x64.zip"
$DownloadPath = "$env:TEMP\gitleaks.zip"
$ExtractPath = "C:\tools\gitleaks"

# Download and extract
Invoke-WebRequest -Uri $GitleaksUrl -OutFile $DownloadPath
Expand-Archive -Path $DownloadPath -DestinationPath $ExtractPath -Force
Remove-Item $DownloadPath

# Add to PATH
$env:Path += ";$ExtractPath"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
```

### Linux

```bash
# Debian/Ubuntu (via package)
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
rm gitleaks_8.18.1_linux_x64.tar.gz

# Or using package manager (if available)
sudo apt-get install gitleaks
```

### macOS

```bash
# Using Homebrew
brew install gitleaks
```

## Configuration

### Default Configuration

Gitleaks ships with built-in rules. No configuration required for basic usage.

### Custom Configuration (.gitleaks.toml)

Create `.gitleaks.toml` in repository root:

```toml
title = "Gitleaks configuration for {PROJECT} Project"

# Extend default config
[extend]
useDefault = true

# Custom rules
[[rules]]
id = "oracle-connection-string"
description = "Oracle database connection string"
regex = '''Data Source=.*User Id=.*Password='''
tags = ["database", "oracle"]

[[rules]]
id = "api-key-custom"
description = "Custom API key pattern"
regex = '''api[_-]?key[_-]?=\s*['"][0-9a-zA-Z]{32,}['"]'''
tags = ["api", "key"]

# Allowlist (false positives)
[allowlist]
description = "Allowlisted files and patterns"
paths = [
    '''\.md$''',  # Markdown files (documentation)
    '''test/''',  # Test fixtures
    '''\.example''',  # Example files
]

regexes = [
    '''EXAMPLE_KEY_DO_NOT_USE''',  # Example placeholders
    '''YOUR_API_KEY_HERE''',  # Placeholder text
]
```

## Running Gitleaks

### Basic Usage

```bash
# Scan repository (all history)
gitleaks detect --source trunk/{PROJECT}/src --verbose

# Scan working directory only (uncommitted changes)
gitleaks protect --source trunk/{PROJECT}/src

# Generate report
gitleaks detect --source trunk/{PROJECT}/src --report-format json --report-path artifacts/02-metrics/gitleaks-report.json
```

### Advanced Options

```bash
# Scan specific branch
gitleaks detect --source trunk/{PROJECT}/src --log-opts="main"

# Scan since specific commit
gitleaks detect --source trunk/{PROJECT}/src --log-opts="HEAD~10..HEAD"

# Use custom config
gitleaks detect --source trunk/{PROJECT}/src --config .gitleaks.toml

# No-git mode (scan files without git history)
gitleaks detect --source trunk/{PROJECT}/src --no-git

# Verbose output
gitleaks detect --source trunk/{PROJECT}/src --verbose

# Exit code 0 even if leaks found (for reporting only)
gitleaks detect --source trunk/{PROJECT}/src --exit-code 0
```

### Integration with scan-secrets.ps1

**Enhanced `scan-secrets.ps1`** (optional):

```powershell
# Check if gitleaks is available
$gitleaksAvailable = Get-Command gitleaks -ErrorAction SilentlyContinue

if ($gitleaksAvailable) {
    Write-Host "Running Gitleaks scan (enhanced)..." -ForegroundColor Cyan

    # Run gitleaks
    gitleaks detect `
        --source $SourcePath `
        --report-format json `
        --report-path "$OutputPath\gitleaks-report.json" `
        --exit-code 0

    Write-Host "Gitleaks report: $OutputPath\gitleaks-report.json" -ForegroundColor Green
} else {
    Write-Host "Gitleaks not found. Using regex-based scan..." -ForegroundColor Yellow
    # Fall back to regex patterns
}
```

## Output Formats

### JSON (Recommended)

```bash
gitleaks detect --source trunk/{PROJECT}/src --report-format json --report-path gitleaks.json
```

**Sample Output**:
```json
[
  {
    "Description": "Generic API Key",
    "StartLine": 42,
    "EndLine": 42,
    "StartColumn": 15,
    "EndColumn": 47,
    "Match": "api_key = \"sk_test_abc123xyz\"",
    "Secret": "sk_test_abc123xyz",
    "File": "src/config/settings.cs",
    "SymlinkFile": "",
    "Commit": "a1b2c3d4e5f6",
    "Entropy": 4.8,
    "Author": "developer@example.com",
    "Email": "developer@example.com",
    "Date": "2024-01-15T10:30:00Z",
    "Message": "Add API configuration",
    "Tags": ["key", "API", "generic"],
    "RuleID": "generic-api-key"
  }
]
```

### CSV

```bash
gitleaks detect --source trunk/{PROJECT}/src --report-format csv --report-path gitleaks.csv
```

### SARIF (for CI/CD integration)

```bash
gitleaks detect --source trunk/{PROJECT}/src --report-format sarif --report-path gitleaks.sarif
```

## Verification

```bash
# Check version
gitleaks version

# Test on sample repository
mkdir test-repo
cd test-repo
git init
echo "api_key=sk_test_abc123" > config.txt
git add config.txt
git commit -m "test commit"

gitleaks detect --source .
# Should detect the API key

# Clean up
cd ..
rm -rf test-repo
```

## Detection Rules

Gitleaks detects secrets using:
- **Entropy**: Randomness of strings
- **Regex patterns**: Predefined patterns for known secret formats
- **Keywords**: "password", "secret", "token", etc.

### Common Detected Secrets

- AWS Access Keys
- Azure Storage Keys
- GitHub Tokens
- Slack Tokens
- JWT Tokens
- Database Connection Strings
- API Keys
- Private Keys (RSA, SSH)
- OAuth Tokens

## Pre-commit Hook (Prevent Commits with Secrets)

### Install Hook

```bash
# Install gitleaks pre-commit hook
cd {PROJECT_ROOT}

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
gitleaks protect --staged --verbose
EOF

# Make executable (Linux/macOS)
chmod +x .git/hooks/pre-commit
```

**PowerShell version**:
```powershell
@"
#!/bin/sh
gitleaks protect --staged --verbose
"@ | Out-File .git\hooks\pre-commit -Encoding ASCII
```

### Test Hook

```bash
# Try to commit a file with secrets
echo "api_key=sk_test_abc123" > test.txt
git add test.txt
git commit -m "test"
# Should be blocked by pre-commit hook
```

## Common Issues

**Issue**: Too many false positives
**Solution**: Add patterns to `.gitleaks.toml` allowlist

**Issue**: Gitleaks too slow on large repositories
**Solution**: Use `--no-git` mode or scan specific branches only

**Issue**: Pre-commit hook not running
**Solution**: Ensure `.git/hooks/pre-commit` is executable

## Comparison: Gitleaks vs TruffleHog

| Feature | Gitleaks | TruffleHog |
|---------|----------|------------|
| Speed | âš¡ Fast | ðŸŒ Slower |
| Configuration | TOML file | JSON file |
| Entropy detection | âœ… Built-in | âœ… Built-in |
| Git history scan | âœ… Full support | âœ… Full support |
| Pre-commit hook | âœ… Easy setup | âš ï¸ Requires wrapper |
| CI/CD integration | âœ… SARIF support | âœ… JSON support |

**Recommendation**: Use Gitleaks for faster scans, TruffleHog for verification.

## Integration with CI/CD

### GitHub Actions

```yaml
name: Gitleaks Scan
on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history

      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Azure DevOps

```yaml
- task: Bash@3
  displayName: 'Run Gitleaks'
  inputs:
    targetType: 'inline'
    script: |
      gitleaks detect --source $(Build.SourcesDirectory) --report-format sarif --report-path gitleaks.sarif
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [TruffleHog Setup](utility-trufflehog.md) - Alternative secret scanner
- [Scan Secrets Script](../../../scripts/scan-secrets.ps1)
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- Gitleaks GitHub: https://github.com/gitleaks/gitleaks
- Gitleaks Documentation: https://github.com/gitleaks/gitleaks/wiki
- Configuration Guide: https://github.com/gitleaks/gitleaks#configuration
