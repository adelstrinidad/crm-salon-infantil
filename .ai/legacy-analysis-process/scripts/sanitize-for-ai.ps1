<#
.SYNOPSIS
    Sanitizes source files for safe AI analysis by redacting sensitive content.

.DESCRIPTION
    Creates sanitized copies of source files with credentials, connection strings,
    internal URLs, and other sensitive content redacted. Sanitized files are safe
    to transmit to AI vendors for analysis.

.PARAMETER SourcePath
    Path to source code directory to sanitize.

.PARAMETER OutputPath
    Path for sanitized output files. Defaults to artifacts/sanitized

.PARAMETER ClassificationReport
    Path to CLASSIFICATION-REPORT.md to determine which files to sanitize.

.PARAMETER Strategy
    Sanitization strategy: "hybrid" (default) or "aggressive"
    - hybrid: Sanitize HIGH/MEDIUM files, skip CRITICAL
    - aggressive: Attempt to sanitize all files including CRITICAL

.EXAMPLE
    .\sanitize-for-ai.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src" -OutputPath "..\artifacts\sanitized"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,

    [string]$OutputPath = "..\artifacts\sanitized",

    [string]$ClassificationReport = "..\artifacts\02-metrics\CLASSIFICATION-REPORT.md",

    [ValidateSet("hybrid", "aggressive")]
    [string]$Strategy = "hybrid"
)

$ErrorActionPreference = "Stop"

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
}

Write-Host "=== Content Sanitizer ===" -ForegroundColor Cyan
Write-Host "Source: $SourcePath"
Write-Host "Output: $OutputPath"
Write-Host "Strategy: $Strategy"
Write-Host ""

# Sanitization patterns
$sanitizationRules = @(
    @{
        Name = "ConnectionString"
        Pattern = '(?i)(connectionstring|connection\s*string)\s*[=:]\s*[''"]([^''"]+)[''"]'
        Replacement = '$1="[REDACTED-CONNECTION-STRING]"'
    }
    @{
        Name = "Password"
        Pattern = '(?i)(password|passwd|pwd)\s*[=:]\s*[''"]([^''"]+)[''"]'
        Replacement = '$1="[REDACTED-PASSWORD]"'
    }
    @{
        Name = "APIKey"
        Pattern = '(?i)(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*[''"]([^''"]+)[''"]'
        Replacement = '$1="[REDACTED-API-KEY]"'
    }
    @{
        Name = "AWSCredential"
        Pattern = '(?i)(aws[_-]?(access|secret)[_-]?key)\s*[=:]\s*[''"]([^''"]+)[''"]'
        Replacement = '$1="[REDACTED-AWS-CREDENTIAL]"'
    }
    @{
        Name = "AWSAccessKeyId"
        Pattern = 'AKIA[A-Z0-9]{16}'
        Replacement = '[REDACTED-AWS-ACCESS-KEY-ID]'
    }
    @{
        Name = "DataSource"
        Pattern = '(?i)(data source|server)\s*=\s*([^;]+)'
        Replacement = '$1=[REDACTED-SERVER]'
    }
    @{
        Name = "UserID"
        Pattern = '(?i)(user id|uid)\s*=\s*([^;]+)'
        Replacement = '$1=[REDACTED-USER]'
    }
    @{
        Name = "AWSArn"
        Pattern = 'arn:aws:[a-z0-9\-]+:[a-z0-9\-]*:[0-9]*:[^\s''"<>]+'
        Replacement = 'arn:aws:[REDACTED-ARN]'
    }
    @{
        Name = "InternalURL"
        Pattern = '(?i)https?://[a-z0-9.\-]+\.(internal|local|corp|company|intra)\b[^\s''"<>]*'
        Replacement = 'https://[REDACTED-INTERNAL-URL]'
    }
    @{
        Name = "InternalIP"
        Pattern = '\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3})\b'
        Replacement = '[REDACTED-INTERNAL-IP]'
    }
    @{
        Name = "PrivateKey"
        Pattern = '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----'
        Replacement = '[REDACTED-PRIVATE-KEY]'
    }
)

# Track statistics
$stats = @{
    FilesProcessed = 0
    FilesSkipped = 0
    FilesSanitized = 0
    RedactionsApplied = 0
}

# Get files to process
$extensions = @("*.cs", "*.config", "*.json", "*.xml", "*.sql")
$allFiles = Get-ChildItem -Path $SourcePath -Recurse -Include $extensions -ErrorAction SilentlyContinue

Write-Host "Found $($allFiles.Count) files to process" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Replace($SourcePath, "").TrimStart("\", "/")
    $outputFile = Join-Path $OutputPath $relativePath

    # Skip CRITICAL files in hybrid mode
    if ($Strategy -eq "hybrid") {
        $isCritical = $false

        # Check for critical patterns
        if ($file.Extension -eq ".config" -or
            $file.Name -like "*password*" -or
            $file.Name -like "*secret*" -or
            $file.Name -like "*credential*" -or
            $file.Name -like "*.pfx" -or
            $file.Name -like "*.pem" -or
            $file.Name -like "*.key") {
            $isCritical = $true
        }

        if ($isCritical) {
            Write-Host "  SKIP (CRITICAL): $relativePath" -ForegroundColor Red
            $stats.FilesSkipped++
            continue
        }
    }

    # Ensure output directory exists
    $outputDir = Split-Path $outputFile -Parent
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
    }

    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $fileRedactions = 0

        # Apply sanitization rules
        foreach ($rule in $sanitizationRules) {
            $matches = [regex]::Matches($content, $rule.Pattern)
            if ($matches.Count -gt 0) {
                $content = [regex]::Replace($content, $rule.Pattern, $rule.Replacement)
                $fileRedactions += $matches.Count
            }
        }

        # Write sanitized content
        $content | Out-File $outputFile -Encoding UTF8 -NoNewline

        if ($fileRedactions -gt 0) {
            Write-Host "  SANITIZED ($fileRedactions redactions): $relativePath" -ForegroundColor Yellow
            $stats.FilesSanitized++
            $stats.RedactionsApplied += $fileRedactions
        } else {
            Write-Host "  COPIED (clean): $relativePath" -ForegroundColor Green
        }

        $stats.FilesProcessed++
    }
    catch {
        Write-Warning "Could not process file: $relativePath - $_"
        $stats.FilesSkipped++
    }
}

# Generate sanitization report
$reportPath = Join-Path $OutputPath "SANITIZATION-REPORT.md"
$report = @"
# Sanitization Report

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Source Path**: $SourcePath
**Output Path**: $OutputPath
**Strategy**: $Strategy

---

## Summary

| Metric | Count |
|--------|-------|
| Files Processed | $($stats.FilesProcessed) |
| Files Sanitized | $($stats.FilesSanitized) |
| Files Skipped (CRITICAL) | $($stats.FilesSkipped) |
| Total Redactions | $($stats.RedactionsApplied) |

---

## Redaction Rules Applied

| Rule | Description |
|------|-------------|
| ConnectionString | Database connection strings |
| Password | Password values |
| APIKey | API keys and secrets |
| AWSCredential | AWS access/secret keys |
| DataSource | Database server references |
| UserID | Database user IDs |
| AWSArn | AWS resource ARNs |
| InternalURL | Internal URLs (.internal, .local, .corp) |
| InternalIP | Private IP addresses (10.x, 192.168.x, 172.16-31.x) |
| PrivateKey | RSA/DSA/EC private keys |

---

## Next Steps

1. **Review sanitized files** in ``$OutputPath``
2. **Verify no sensitive content remains** - spot check critical files
3. **Document any manual redactions** needed
4. **Proceed with AI analysis** using sanitized files only

---

*Sanitized files are safe to transmit to AI vendors for analysis.*
"@

$report | Out-File $reportPath -Encoding UTF8

Write-Host ""
Write-Host "=== Sanitization Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Files Processed:  $($stats.FilesProcessed)"
Write-Host "  Files Sanitized:  $($stats.FilesSanitized)"
Write-Host "  Files Skipped:    $($stats.FilesSkipped)"
Write-Host "  Redactions:       $($stats.RedactionsApplied)"
Write-Host ""
Write-Host "Output saved to: $OutputPath"
Write-Host "Report saved to: $reportPath"
Write-Host ""
Write-Host "NEXT: Review sanitized files before AI analysis." -ForegroundColor Cyan
