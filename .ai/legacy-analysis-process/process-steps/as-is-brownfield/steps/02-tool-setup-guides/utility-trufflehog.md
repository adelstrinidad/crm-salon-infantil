# TruffleHog Setup (Optional Enhancement)

**Purpose**: Alternative advanced secret detection with credential verification

**Status**: Optional enhancement for `scan-secrets.ps1` script

## Overview

TruffleHog is a secret scanning tool that finds credentials in git repositories and verifies them against cloud providers.

**Why Optional**: The `scan-secrets.ps1` script uses regex-based pattern matching. TruffleHog provides verification of found secrets.

**Key Difference from Gitleaks**: TruffleHog can **verify** if found secrets are active/valid.

## Prerequisites

- Git installed
- Go 1.19+ (for building from source) OR use pre-built binary
- Access to repository

## Installation Steps

### Windows

#### Option 1: Using Scoop (Recommended)

```powershell
scoop install trufflehog
```

#### Option 2: Download Pre-built Binary

```powershell
# Download latest release
$TruffleHogUrl = "https://github.com/trufflesecurity/trufflehog/releases/download/v3.63.7/trufflehog_3.63.7_windows_amd64.tar.gz"
$DownloadPath = "$env:TEMP\trufflehog.tar.gz"
$ExtractPath = "C:\tools\trufflehog"

# Download
Invoke-WebRequest -Uri $TruffleHogUrl -OutFile $DownloadPath

# Extract (requires tar.exe, built into Windows 10+)
New-Item -ItemType Directory -Force -Path $ExtractPath | Out-Null
tar -xzf $DownloadPath -C $ExtractPath
Remove-Item $DownloadPath

# Add to PATH
$env:Path += ";$ExtractPath"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
```

#### Option 3: Using Chocolatey

```powershell
choco install trufflehog
```

### Linux

```bash
# Download and install
wget https://github.com/trufflesecurity/trufflehog/releases/download/v3.63.7/trufflehog_3.63.7_linux_amd64.tar.gz
tar -xzf trufflehog_3.63.7_linux_amd64.tar.gz
sudo mv trufflehog /usr/local/bin/
rm trufflehog_3.63.7_linux_amd64.tar.gz

# Verify
trufflehog --version
```

### macOS

```bash
# Using Homebrew
brew install trufflehog
```

## Configuration

### Default Detectors

TruffleHog includes 700+ detectors for various services:
- AWS (credentials verification via AWS API)
- GitHub tokens (verification via GitHub API)
- Slack tokens
- Database connection strings
- API keys for major services

### Custom Configuration (trufflehog.yaml)

Create `trufflehog.yaml` in project root:

```yaml
# Verification settings
verify: true  # Verify secrets against APIs
concurrency: 10  # Concurrent verifiers

# Detectors to enable/disable
detectors:
  - aws
  - github
  - slack
  - stripe
  - postgresql
  - mongodb

# Exclude patterns
exclude:
  paths:
    - ".*\\.md$"  # Markdown files
    - ".*test.*"  # Test files
    - ".*\\.example$"  # Example files

  contents:
    - "EXAMPLE_KEY"
    - "YOUR_KEY_HERE"
    - "REPLACE_WITH"
```

## Running TruffleHog

### Basic Usage

```bash
# Scan git repository
trufflehog git file://trunk/{PROJECT}/src

# Scan filesystem (no git)
trufflehog filesystem trunk/{PROJECT}/src

# Scan with verification (checks if secrets are valid)
trufflehog git file://trunk/{PROJECT}/src --verify

# JSON output
trufflehog git file://trunk/{PROJECT}/src --json > artifacts/02-metrics/trufflehog-report.json
```

### Advanced Options

```bash
# Scan specific branch
trufflehog git file://trunk/{PROJECT}/src --branch main

# Scan since specific commit
trufflehog git file://trunk/{PROJECT}/src --since-commit abc123

# Scan with concurrency
trufflehog git file://trunk/{PROJECT}/src --concurrency 20

# Only verified secrets
trufflehog git file://trunk/{PROJECT}/src --verify --only-verified

# Exclude paths
trufflehog git file://trunk/{PROJECT}/src --exclude-paths exclude.txt

# Enable specific detectors
trufflehog git file://trunk/{PROJECT}/src --include-detectors aws,github,slack

# Disable specific detectors
trufflehog git file://trunk/{PROJECT}/src --exclude-detectors generic
```

### Integration with scan-secrets.ps1

**Enhanced `scan-secrets.ps1`** (optional):

```powershell
# Check if trufflehog is available
$trufflehogAvailable = Get-Command trufflehog -ErrorAction SilentlyContinue

if ($trufflehogAvailable) {
    Write-Host "Running TruffleHog scan (with verification)..." -ForegroundColor Cyan

    # Run trufflehog with verification
    trufflehog filesystem $SourcePath `
        --verify `
        --json `
        --concurrency 10 `
        > "$OutputPath\trufflehog-report.json"

    Write-Host "TruffleHog report: $OutputPath\trufflehog-report.json" -ForegroundColor Green

    # Parse and warn about verified secrets
    $report = Get-Content "$OutputPath\trufflehog-report.json" | ConvertFrom-Json
    $verifiedSecrets = $report | Where-Object { $_.Verified }

    if ($verifiedSecrets) {
        Write-Host "WARNING: Found $($verifiedSecrets.Count) VERIFIED active secrets!" -ForegroundColor Red
    }
} else {
    Write-Host "TruffleHog not found. Using regex-based scan..." -ForegroundColor Yellow
}
```

## Output Formats

### JSON (Default)

```bash
trufflehog git file://trunk/{PROJECT}/src --json > trufflehog.json
```

**Sample Output**:
```json
{
  "SourceMetadata": {
    "Data": {
      "Git": {
        "commit": "a1b2c3d4",
        "file": "src/config/app.config",
        "email": "dev@example.com",
        "repository": "file://trunk/{PROJECT}/src",
        "timestamp": "2024-01-15 10:30:00",
        "line": 42
      }
    }
  },
  "SourceID": 1,
  "SourceType": 16,
  "SourceName": "trufflehog - git",
  "DetectorType": 2,
  "DetectorName": "AWS",
  "DecoderName": "PLAIN",
  "Verified": true,
  "Raw": "AKIAIOSFODNN7EXAMPLE",
  "Redacted": "AKIA****************",
  "ExtraData": {
    "account": "123456789012",
    "arn": "arn:aws:iam::123456789012:user/test"
  },
  "StructuredData": null
}
```

### Human-Readable Output

```bash
trufflehog git file://trunk/{PROJECT}/src --no-verification
# Outputs to console with color coding
```

## Verification Feature

**Key Feature**: TruffleHog can verify if secrets are active

### How Verification Works

1. **Detector finds potential secret** (e.g., AWS key pattern match)
2. **TruffleHog calls AWS API** with the found credentials
3. **Result**:
   - `Verified: true` - Credentials are ACTIVE and VALID âš ï¸
   - `Verified: false` - Credentials are invalid or inactive âœ…

### Supported Services for Verification

- **AWS** - IAM credentials
- **GitHub** - Personal access tokens
- **Slack** - Bot tokens, webhooks
- **Stripe** - API keys
- **SendGrid** - API keys
- **Twilio** - Auth tokens
- **PostgreSQL/MySQL** - Connection strings
- **MongoDB** - Connection strings
- 700+ other services

## Verification

```bash
# Check version
trufflehog --version

# Test on sample repository with fake secret
mkdir test-repo
cd test-repo
git init
echo "aws_access_key_id=AKIAIOSFODNN7EXAMPLE" > config.txt
git add config.txt
git commit -m "test commit"

trufflehog git file://.
# Should detect the AWS key pattern (but verification will fail since it's fake)

# Clean up
cd ..
rm -rf test-repo
```

## Pre-commit Hook (Prevent Commits with Secrets)

### Install Hook

```bash
cd {PROJECT_ROOT}

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Scan staged files only
git diff --cached --name-only | xargs trufflehog filesystem --verify --fail
if [ $? -ne 0 ]; then
    echo "TruffleHog found secrets in staged files!"
    exit 1
fi
EOF

# Make executable (Linux/macOS)
chmod +x .git/hooks/pre-commit
```

**PowerShell version**:
```powershell
@"
#!/bin/sh
git diff --cached --name-only | xargs trufflehog filesystem --verify --fail
if [ $? -ne 0 ]; then
    echo "TruffleHog found secrets in staged files!"
    exit 1
fi
"@ | Out-File .git\hooks\pre-commit -Encoding ASCII
```

## Common Issues

**Issue**: Many false positives from generic detectors
**Solution**: Disable generic detector: `--exclude-detectors generic`

**Issue**: Verification too slow
**Solution**: Disable verification: remove `--verify` flag, or use `--concurrency 20`

**Issue**: Network errors during verification
**Solution**: Run without verification or check network/proxy settings

## Comparison: TruffleHog vs Gitleaks

| Feature | TruffleHog | Gitleaks |
|---------|------------|----------|
| Speed | ðŸŒ Slower (verification overhead) | âš¡ Fast |
| Verification | âœ… **Verifies if secrets work** | âŒ No verification |
| Detectors | 700+ built-in | ~140 built-in |
| Configuration | YAML | TOML |
| Git history scan | âœ… Full support | âœ… Full support |
| Pre-commit hook | âœ… Supported | âœ… Easy setup |
| CI/CD integration | âœ… JSON output | âœ… SARIF support |

**Recommendation**:
- Use **Gitleaks** for fast initial scan
- Use **TruffleHog** for verification of found secrets

## Integration with CI/CD

### GitHub Actions

```yaml
name: TruffleHog Scan
on: [push, pull_request]

jobs:
  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

### Azure DevOps

```yaml
- task: Bash@3
  displayName: 'Run TruffleHog'
  inputs:
    targetType: 'inline'
    script: |
      trufflehog git file://$(Build.SourcesDirectory) --json > trufflehog.json
      # Fail build if verified secrets found
      if grep -q '"Verified":true' trufflehog.json; then
        echo "Found verified secrets!"
        exit 1
      fi
```

## Advanced Usage

### Scan Remote Repository

```bash
# Scan GitHub repository
trufflehog git https://github.com/user/repo.git

# With authentication
trufflehog git https://github.com/user/private-repo.git --token $GITHUB_TOKEN
```

### Custom Detectors (Regex)

Create `custom-detector.yaml`:

```yaml
detectors:
  - name: CustomAPIKey
    keywords:
      - customapi
    regex:
      adjective: 'custom_api_key'
      noun: '[a-zA-Z0-9]{32}'
```

Use custom detector:
```bash
trufflehog git file://trunk/{PROJECT}/src --custom-detector custom-detector.yaml
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Gitleaks Setup](utility-gitleaks.md) - Alternative faster scanner
- [Scan Secrets Script](../../../scripts/scan-secrets.ps1)
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- TruffleHog GitHub: https://github.com/trufflesecurity/trufflehog
- TruffleHog Documentation: https://github.com/trufflesecurity/trufflehog#readme
- Supported Detectors: https://github.com/trufflesecurity/trufflehog#detectors
