<#
.SYNOPSIS
    Generates content classification report for AI analysis decisions.

.DESCRIPTION
    Analyzes codebase and generates a classification report categorizing files
    by sensitivity level (CRITICAL, HIGH, MEDIUM, LOW). Uses secrets scan
    results if available.

.PARAMETER SourcePath
    Path to source code directory to classify.

.PARAMETER SecretsFile
    Path to secrets-scan.json from scan-secrets script.

.PARAMETER OutputPath
    Path for output report. Defaults to artifacts/02-metrics/CLASSIFICATION-REPORT.md

.EXAMPLE
    .\classify-content.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,

    [string]$SecretsFile = "..\artifacts\02-metrics\secrets-scan.json",

    [string]$OutputPath = "..\artifacts\02-metrics\CLASSIFICATION-REPORT.md"
)

$ErrorActionPreference = "Stop"

# Ensure output directory exists
$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

Write-Host "=== Content Classifier ===" -ForegroundColor Cyan
Write-Host "Source: $SourcePath"
Write-Host "Output: $OutputPath"
Write-Host ""

# Load secrets scan if available
$secretsData = $null
if (Test-Path $SecretsFile) {
    Write-Host "Loading secrets scan from: $SecretsFile" -ForegroundColor Yellow
    $secretsData = Get-Content $SecretsFile | ConvertFrom-Json
}

# Classification rules by file pattern
$classificationRules = @{
    CRITICAL = @(
        @{ Pattern = "*.config"; Reason = "Configuration files may contain credentials" }
        @{ Pattern = "web.config"; Reason = "Web configuration with connection strings" }
        @{ Pattern = "app.config"; Reason = "Application configuration with settings" }
        @{ Pattern = "appsettings*.json"; Reason = "Application settings" }
        @{ Pattern = "*connectionstring*"; Reason = "Connection string references" }
        @{ Pattern = "*password*"; Reason = "Password-related file" }
        @{ Pattern = "*secret*"; Reason = "Secret-related file" }
        @{ Pattern = "*credential*"; Reason = "Credential-related file" }
        @{ Pattern = "*.pfx"; Reason = "Certificate file" }
        @{ Pattern = "*.pem"; Reason = "Certificate/key file" }
        @{ Pattern = "*.key"; Reason = "Key file" }
    )
    HIGH = @(
        @{ Pattern = "**/Sync/**"; Reason = "Synchronization logic with external systems" }
        @{ Pattern = "**/SNS*/**"; Reason = "AWS SNS integration" }
        @{ Pattern = "*Calculator*"; Reason = "Business calculation logic" }
        @{ Pattern = "*Coordinate*"; Reason = "Coordinate transformation algorithms" }
        @{ Pattern = "**/packages/**"; Reason = "Database packages with business logic" }
        @{ Pattern = "**/procedures/**"; Reason = "Stored procedures with business rules" }
        @{ Pattern = "*.sql"; Reason = "SQL files may contain sensitive logic" }
    )
    MEDIUM = @(
        @{ Pattern = "*Service*.cs"; Reason = "Service layer with business rules" }
        @{ Pattern = "*Repository*.cs"; Reason = "Data access with queries" }
        @{ Pattern = "*Validator*.cs"; Reason = "Validation rules" }
        @{ Pattern = "*Handler*.cs"; Reason = "Business logic handlers" }
    )
    LOW = @(
        @{ Pattern = "*.csproj"; Reason = "Project files - safe" }
        @{ Pattern = "*.sln"; Reason = "Solution files - safe" }
        @{ Pattern = "**/obj/**"; Reason = "Build artifacts" }
        @{ Pattern = "**/bin/**"; Reason = "Build output" }
        @{ Pattern = "*.Designer.cs"; Reason = "Generated code" }
        @{ Pattern = "AssemblyInfo.cs"; Reason = "Assembly metadata" }
        @{ Pattern = "*.md"; Reason = "Documentation" }
    )
}

# Collect all files
$allFiles = Get-ChildItem -Path $SourcePath -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match '\.(cs|config|json|xml|sql|csproj|sln)$' }

# Classify files
$classified = @{
    CRITICAL = @()
    HIGH = @()
    MEDIUM = @()
    LOW = @()
    UNCLASSIFIED = @()
}

foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Replace($SourcePath, "").TrimStart("\", "/")
    $fileClassified = $false

    # Check secrets scan findings first
    if ($secretsData -and $secretsData.Findings) {
        $fileFindings = $secretsData.Findings | Where-Object { $_.File -eq $relativePath }
        if ($fileFindings) {
            $maxSeverity = ($fileFindings | ForEach-Object { $_.Severity } | Sort-Object -Unique)[0]
            $reasons = ($fileFindings | Select-Object -ExpandProperty Description -Unique) -join "; "

            $classified[$maxSeverity] += [PSCustomObject]@{
                File = $relativePath
                Reason = "Secret scan: $reasons"
                Source = "secrets-scan"
            }
            $fileClassified = $true
            continue
        }
    }

    # Apply pattern rules
    foreach ($level in @("CRITICAL", "HIGH", "MEDIUM", "LOW")) {
        foreach ($rule in $classificationRules[$level]) {
            if ($file.FullName -like $rule.Pattern -or $file.Name -like $rule.Pattern) {
                $classified[$level] += [PSCustomObject]@{
                    File = $relativePath
                    Reason = $rule.Reason
                    Source = "pattern-match"
                }
                $fileClassified = $true
                break
            }
        }
        if ($fileClassified) { break }
    }

    if (-not $fileClassified) {
        $classified.UNCLASSIFIED += [PSCustomObject]@{
            File = $relativePath
            Reason = "No classification rule matched"
            Source = "default"
        }
    }
}

# Generate report
$report = @"
# Content Classification Report

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Source Path**: $SourcePath
**Secrets Scan**: $(if ($secretsData) { "Loaded ($($secretsData.TotalFindings) findings)" } else { "Not available" })

---

## Summary

| Classification | Files | AI Analysis? | Action Required |
|----------------|-------|--------------|-----------------|
| **CRITICAL** | $($classified.CRITICAL.Count) | **NO** | Use local tools only |
| **HIGH** | $($classified.HIGH.Count) | **SANITIZE** | Redact before AI analysis |
| **MEDIUM** | $($classified.MEDIUM.Count) | Review | Human review before AI |
| **LOW** | $($classified.LOW.Count) | YES | Safe for AI analysis |
| Unclassified | $($classified.UNCLASSIFIED.Count) | Review | Manual classification needed |

**Total Files**: $($allFiles.Count)

---

## Decision Required

Before proceeding with AI analysis, you must choose a strategy:

### Option 1: Full AI Analysis (Default)
- All files sent to AI vendor
- Fastest analysis
- **Risk**: Credentials, proprietary logic transmitted externally

### Option 2: Hybrid Analysis (Recommended)
- CRITICAL/HIGH files: Local tools only
- MEDIUM files: Review and sanitize
- LOW files: AI analysis
- **Risk**: Moderate, balanced approach

### Option 3: Local Only
- No files sent to AI
- Use NDepend, SonarQube, DocFX locally
- **Risk**: None, but limited AI-assisted insights

---

## CRITICAL Files ($($classified.CRITICAL.Count))

> **Action**: NEVER transmit to AI. Use local tools only.

| File | Reason |
|------|--------|
"@

foreach ($item in $classified.CRITICAL) {
    $report += "| ``$($item.File)`` | $($item.Reason) |`n"
}

$report += @"

---

## HIGH Risk Files ($($classified.HIGH.Count))

> **Action**: Sanitize heavily or use local tools.

| File | Reason |
|------|--------|
"@

foreach ($item in ($classified.HIGH | Select-Object -First 50)) {
    $report += "| ``$($item.File)`` | $($item.Reason) |`n"
}

if ($classified.HIGH.Count -gt 50) {
    $report += "| ... | ($($classified.HIGH.Count - 50) more files) |`n"
}

$report += @"

---

## MEDIUM Risk Files ($($classified.MEDIUM.Count))

> **Action**: Review before transmission, redact sensitive values.

| File | Reason |
|------|--------|
"@

foreach ($item in ($classified.MEDIUM | Select-Object -First 30)) {
    $report += "| ``$($item.File)`` | $($item.Reason) |`n"
}

if ($classified.MEDIUM.Count -gt 30) {
    $report += "| ... | ($($classified.MEDIUM.Count - 30) more files) |`n"
}

$report += @"

---

## LOW Risk Files ($($classified.LOW.Count))

> **Action**: Safe for AI analysis.

Files with low sensitivity (project files, generated code, documentation) are safe to transmit.

---

## Next Steps

1. **Review this report** with security/compliance team
2. **Choose analysis strategy** (Full AI / Hybrid / Local Only)
3. **Document decision** in ``artifacts/02-metrics/ANALYSIS-STRATEGY-DECISION.md``
4. **Run sanitization** if using Hybrid approach: ``.\sanitize-for-ai.ps1``
5. **Proceed** with Step 05: Component Analysis

---

*This report was generated locally. No data was transmitted to external services.*
"@

# Write report
$report | Out-File $OutputPath -Encoding UTF8

Write-Host ""
Write-Host "=== Classification Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  CRITICAL:     $($classified.CRITICAL.Count) files" -ForegroundColor Red
Write-Host "  HIGH:         $($classified.HIGH.Count) files" -ForegroundColor DarkYellow
Write-Host "  MEDIUM:       $($classified.MEDIUM.Count) files" -ForegroundColor Yellow
Write-Host "  LOW:          $($classified.LOW.Count) files" -ForegroundColor Green
Write-Host "  Unclassified: $($classified.UNCLASSIFIED.Count) files" -ForegroundColor Gray
Write-Host ""
Write-Host "Report saved to: $OutputPath"
Write-Host ""
Write-Host "NEXT: Review the classification report and choose an analysis strategy." -ForegroundColor Cyan
