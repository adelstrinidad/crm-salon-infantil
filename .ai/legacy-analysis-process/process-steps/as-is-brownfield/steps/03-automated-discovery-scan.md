# Step 02: Automated Discovery (Static Analysis Scan)

**Duration**: 30-45 minutes
**Prerequisites**: Step 01 completed (all tools installed)
**Output**: JSON/SARIF scan results in `02-artifacts/03-metrics/` directory

---

## Overview

This step runs all static analysis tools to generate a structured "Inventory of Defects" without AI hallucination. The outputs are machine-readable JSON/SARIF files that will be processed by LLMs in Step 03.

**Critical Principle**: This step relies 100% on deterministic tools. Do NOT use AI for discovery.

### Record Step Start Time

**PowerShell**:
```powershell
# Record this step's start time for timing tracker
$Step03StartTime = Get-Date
```

**Bash/sh**:
```bash
# Record this step's start time for timing tracker
STEP_03_START=$(date -Iseconds)
```

---

## REMINDER: Legacy Code is READ-ONLY

If scans fail due to code issues (e.g., missing references, deprecated libraries, build errors):

| DO | DO NOT |
|----|--------|
| âœ… Document as "Known Limitation" | âŒ Modify .csproj files |
| âœ… Skip affected projects | âŒ Remove unused references |
| âœ… Proceed with AI-only analysis | âŒ "Fix" the code to make tools work |
| âœ… Note which components couldn't be scanned | âŒ Clean up dead code |

**Example**: If WSE 3.0 references block `dotnet build`, document this and proceed with direct code reading instead. DO NOT remove the WSE 3.0 references.

---

## 2.1 Pre-Scan Setup

### Create output directory

```powershell
# Create output directory (folder number = step number)
$OutputDir = "{ANALYSIS_ROOT}/02-scan-results"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Scan output directory: $OutputDir" -ForegroundColor Cyan
```

### Verify paths exist

```powershell
# Verify source directories
$SourcePaths = @(
    "trunk/{PROJECT}/src",      # C# source code
    "prod/DARDb",         # Production database objects
    "{SOURCE_ROOT}Db"         # Development database objects
)

foreach ($path in $SourcePaths) {
    if (Test-Path $path) {
        Write-Host "[OK] $path" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $path" -ForegroundColor Red
    }
}
```

---

## 2.2 Scanning ASP.NET (C#)

### Basic Build with SARIF Output

```powershell
Write-Host "=== Scanning ASP.NET ===" -ForegroundColor Cyan

# Run build with SARIF output
dotnet build trunk/{PROJECT}/src/All.sln `
    /p:ErrorLog="$OutputDir/dotnet-build-results.sarif" `
    /p:ErrorLogVersion=2.1 `
    --no-incremental

Write-Host "Build scan complete: $OutputDir/dotnet-build-results.sarif" -ForegroundColor Green
```

### Enhanced Security Scan (if Security Code Scan installed)

```powershell
# Run dedicated security scan
security-scan trunk/{PROJECT}/src/All.sln `
    --export="$OutputDir/security-scan-results.sarif"

Write-Host "Security scan complete: $OutputDir/security-scan-results.sarif" -ForegroundColor Green
```

#### Troubleshooting: MSBuild Path Not Found

If you encounter this error:

```
Failed to find MSBuild path. Try specifying `sdk-path=` as a command line parameter.
```

**Solution 1: Specify SDK Path Explicitly**

```powershell
# Find your .NET SDK path
$sdkPath = (Get-ChildItem "C:\Program Files\dotnet\sdk" | Sort-Object Name -Descending | Select-Object -First 1).FullName

# Run with explicit sdk-path
security-scan trunk/{PROJECT}/src/All.sln `
    --export="$OutputDir/security-scan-results.sarif" `
    --sdk-path="$sdkPath"

# Example with specific SDK version:
# security-scan trunk/{PROJECT}/src/All.sln --export="results.sarif" --sdk-path="C:\Program Files\dotnet\sdk\8.0.100"
```

**Solution 2: Use Visual Studio MSBuild**

```powershell
# For Visual Studio 2022
$msbuildPath = "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin"

# Add to PATH for current session
$env:PATH = "$msbuildPath;$env:PATH"

# Run security-scan
security-scan trunk/{PROJECT}/src/All.sln --export="$OutputDir/security-scan-results.sarif"
```

**Solution 3: Run from Developer Command Prompt**

1. Open "Developer Command Prompt for VS 2022" (or your VS version)
2. Navigate to the repository root
3. Run the security-scan command

**Solution 4: Skip Security Scan (Alternative)**

If security-scan cannot be configured, use the built-in Roslyn analyzers instead:

```powershell
# The dotnet build with SecurityCodeScan.VS2019 NuGet package provides similar results
dotnet build trunk/{PROJECT}/src/All.sln `
    /p:ErrorLog="$OutputDir/security-results.sarif" `
    /p:ErrorLogVersion=2.1
```

> **LLM AGENT NOTE**: If security-scan fails, document the error and proceed with dotnet build + Roslyn analyzers. The security analysis can be completed later when the environment is properly configured.

### Expected SARIF Output Structure

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [{
    "tool": {
      "driver": {
        "name": "Microsoft.CodeAnalysis",
        "version": "4.0.0"
      }
    },
    "results": [{
      "ruleId": "CS0168",
      "level": "warning",
      "message": { "text": "The variable 'ex' is declared but never used" },
      "locations": [{
        "physicalLocation": {
          "artifactLocation": { "uri": "src/Services/AddressService.cs" },
          "region": { "startLine": 42, "startColumn": 13 }
        }
      }]
    }]
  }]
}
```

---

## 2.3 Scanning PL/SQL

### Run ZPA Scanner

```powershell
Write-Host "=== Scanning PL/SQL ===" -ForegroundColor Cyan

# Scan production database objects
zpa-cli `
    --sources "prod/DARDb" `
    --output-file "$OutputDir/plsql-prod-results.json" `
    --output-format sq-generic-issue-import

Write-Host "PL/SQL prod scan complete" -ForegroundColor Green

# Scan development/trunk database objects
zpa-cli `
    --sources "{SOURCE_ROOT}Db" `
    --output-file "$OutputDir/plsql-trunk-results.json" `
    --output-format sq-generic-issue-import

Write-Host "PL/SQL trunk scan complete" -ForegroundColor Green
```

### Advanced Options (Optional)

```powershell
# Scan with specific rule sets for deeper analysis
zpa-cli `
    --sources "prod/DARDb" `
    --output-file "$OutputDir/plsql-detailed-results.json" `
    --output-format sq-generic-issue-import `
    --rules "AvoidSelectStar,NamingConvention,CyclomaticComplexity,UnusedVariable,EmptyBlock"

# Generate HTML report for human review
zpa-cli `
    --sources "prod/DARDb" `
    --output-file "$OutputDir/plsql-report.html" `
    --output-format html
```

### Expected ZPA Output Structure

```json
{
  "issues": [{
    "engineId": "zpa",
    "ruleId": "AvoidSelectStar",
    "severity": "MAJOR",
    "type": "CODE_SMELL",
    "primaryLocation": {
      "message": "Avoid SELECT * in production code",
      "filePath": "prod/DARDb/procedures/GET_ADDRESS.sql",
      "textRange": { "startLine": 45, "endLine": 45 }
    }
  }, {
    "engineId": "zpa",
    "ruleId": "CyclomaticComplexity",
    "severity": "CRITICAL",
    "type": "CODE_SMELL",
    "primaryLocation": {
      "message": "Cyclomatic complexity is 25 (maximum allowed is 10)",
      "filePath": "prod/DARDb/packages/PKG_{EXT1}_EXAMPLE.sql",
      "textRange": { "startLine": 100, "endLine": 350 }
    }
  }]
}
```

---

## 2.3.1 Live Oracle Database Analysis (Optional)

If you have access to a live Oracle database, run these scripts for deeper dependency and migration analysis. These complement the static ZPA scan with runtime metadata.

**Prerequisites**: Oracle database connection with DBA_* view access (or ALL_* for restricted scope).

### Dependency Matrix Analysis

Generates cross-schema dependency matrix to identify tightly coupled components:

```sql
-- Run from SQL*Plus or SQL Developer
-- Scripts location: {ANALYSIS_ROOT}/scripts/oracle/

@{ANALYSIS_ROOT}/scripts/oracle/dependency_matrix.sql

-- Output includes:
-- 1. Raw dependency edges between packages/procedures/views
-- 2. Cross-schema dependency counts (matrix)
-- 3. High fan-out objects (refactoring candidates)
-- 4. High fan-in objects (shared utilities)
```

### Oracle Feature Usage Scan

Identifies Oracle-specific features that complicate PostgreSQL migration:

```sql
@{ANALYSIS_ROOT}/scripts/oracle/feature_usage_scan.sql

-- Detects:
-- - Autonomous Transactions
-- - DBMS_SCHEDULER, DBMS_AQ, DBMS_PIPE
-- - CONNECT BY hierarchical queries
-- - Bulk Operations (FORALL/BULK COLLECT)
-- - Global Temporary Tables
-- - Result Cache hints
```

### Save Results

```powershell
# Spool output to files for later analysis
$OutputDir = "{ANALYSIS_ROOT}/02-scan-results"

# From SQL*Plus:
# SPOOL $OutputDir/oracle-dependency-matrix.txt
# @scripts/oracle/dependency_matrix.sql
# SPOOL OFF
#
# SPOOL $OutputDir/oracle-feature-usage.txt
# @scripts/oracle/feature_usage_scan.sql
# SPOOL OFF
```

> **Note**: If no live database access is available, skip this section. The static ZPA scan (2.3) provides sufficient code quality analysis.

---

## 2.4 Scanning ColdFusion (If Applicable)

### Run Fixinator Scanner

```powershell
Write-Host "=== Scanning ColdFusion ===" -ForegroundColor Cyan

# Check if ColdFusion source exists
if (Test-Path "src/cfml") {
    box fixinator `
        path=./src/cfml `
        resultFormat=json `
        resultFile="$OutputDir/cfml-results.json" `
        minSeverity=low `
        minConfidence=medium `
        failOnIssues=false

    Write-Host "ColdFusion scan complete" -ForegroundColor Green
} else {
    Write-Host "No ColdFusion source found, skipping" -ForegroundColor Yellow
}
```

### Expected Fixinator Output Structure

```json
{
  "scanDate": "2025-12-22T10:30:00Z",
  "totalFiles": 150,
  "issues": [{
    "id": "sqlinjection",
    "severity": "3",
    "confidence": "high",
    "title": "SQL Injection",
    "message": "Unparameterized query with user input",
    "path": "src/cfml/login.cfm",
    "line": 12,
    "column": 5,
    "context": "<cfquery name=\"q\" datasource=\"#ds#\">SELECT * FROM users WHERE username='#form.username#'</cfquery>"
  }]
}
```

---

## 2.5 Metrics Collection Scripts

Use the consolidated scripts from `scripts/legacy-analysis-scripts.ps1`.

### Load and Run All Metrics

```powershell
# Load the scripts
. ./scripts/legacy-analysis-scripts.ps1

# Run all metrics at once
Invoke-LegacyAnalysisPipeline
```

### Run Individual Metrics

```powershell
# Load the scripts first
. ./scripts/legacy-analysis-scripts.ps1

# C# Metrics
Write-Host "=== Collecting C# Metrics ===" -ForegroundColor Cyan
Invoke-CSharpMetricsAnalysis -RootPath "trunk/{PROJECT}/src"

# Database Metrics
Write-Host "=== Collecting Database Metrics ===" -ForegroundColor Cyan
Invoke-DatabaseMetricsAnalysis -Paths @("prod/DARDb", "{SOURCE_ROOT}Db")

# Configuration Analysis
Write-Host "=== Analyzing Configuration Files ===" -ForegroundColor Cyan
Invoke-ConfigurationAnalysis -RootPath "trunk/{PROJECT}"
```

---

## 2.6 Complete Scan Pipeline Script

Save and run this complete pipeline:

```powershell
# Save as: scripts/run-legacy-scan.ps1

param(
    [string]$SolutionPath = "trunk/{PROJECT}/src/All.sln",
    [string]$DbProdPath = "prod/DARDb",
    [string]$DbTrunkPath = "{SOURCE_ROOT}Db"
)

$ErrorActionPreference = "Continue"
$OutputDir = "{ANALYSIS_ROOT}/02-scan-results"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Legacy Code Scan Pipeline" -ForegroundColor Cyan
Write-Host "  Output: $OutputDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create directories (folder numbers = step numbers)
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path "{ANALYSIS_ROOT}/02-metrics" | Out-Null

# 1. ASP.NET Scan
Write-Host "`n[1/5] Scanning ASP.NET..." -ForegroundColor Yellow
if (Test-Path $SolutionPath) {
    dotnet build $SolutionPath /p:ErrorLog="$OutputDir/dotnet-results.sarif" /p:ErrorLogVersion=2.1 --no-incremental 2>&1 | Out-Null
    Write-Host "      -> dotnet-results.sarif" -ForegroundColor Green
} else {
    Write-Host "      -> Solution not found: $SolutionPath" -ForegroundColor Red
}

# 2. PL/SQL Scan (Prod)
Write-Host "[2/5] Scanning PL/SQL (prod)..." -ForegroundColor Yellow
if (Test-Path $DbProdPath) {
    zpa-cli --sources $DbProdPath --output-file "$OutputDir/plsql-prod-results.json" --output-format sq-generic-issue-import 2>&1 | Out-Null
    Write-Host "      -> plsql-prod-results.json" -ForegroundColor Green
} else {
    Write-Host "      -> Path not found: $DbProdPath" -ForegroundColor Red
}

# 3. PL/SQL Scan (Trunk)
Write-Host "[3/5] Scanning PL/SQL (trunk)..." -ForegroundColor Yellow
if (Test-Path $DbTrunkPath) {
    zpa-cli --sources $DbTrunkPath --output-file "$OutputDir/plsql-trunk-results.json" --output-format sq-generic-issue-import 2>&1 | Out-Null
    Write-Host "      -> plsql-trunk-results.json" -ForegroundColor Green
} else {
    Write-Host "      -> Path not found: $DbTrunkPath" -ForegroundColor Red
}

# 4. C# Metrics
Write-Host "[4/5] Collecting C# metrics..." -ForegroundColor Yellow
if (Test-Path "scripts/analyze-csharp-metrics.ps1") {
    powershell -File scripts/analyze-csharp-metrics.ps1 2>&1 | Out-Null
    Write-Host "      -> csharp-inventory.json" -ForegroundColor Green
}

# 5. Database Metrics
Write-Host "[5/5] Collecting database metrics..." -ForegroundColor Yellow
if (Test-Path "scripts/analyze-database-metrics.ps1") {
    powershell -File scripts/analyze-database-metrics.ps1 2>&1 | Out-Null
    Write-Host "      -> database-inventory.json" -ForegroundColor Green
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Scan Complete!" -ForegroundColor Green
Write-Host "  Results: $OutputDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# List generated files
Write-Host "`nGenerated files:"
Get-ChildItem -Path $OutputDir -File | ForEach-Object { Write-Host "  - $($_.Name)" }
Get-ChildItem -Path "{ANALYSIS_ROOT}/02-metrics" -File | ForEach-Object { Write-Host "  - 02-metrics/$($_.Name)" }
```

### Execute the pipeline

```powershell
powershell -File scripts/run-legacy-scan.ps1
```

---

## 2.7 Validation Checklist

Before proceeding to Step 03, verify scan outputs:

- [ ] `02-artifacts/03-metrics/dotnet-results.sarif` exists and is valid JSON
- [ ] `02-artifacts/03-metrics/plsql-prod-results.json` exists and is valid JSON
- [ ] `02-artifacts/03-metrics/plsql-trunk-results.json` exists and is valid JSON
- [ ] `02-metrics/csharp-inventory.json` exists and is valid JSON
- [ ] `02-metrics/database-inventory.json` exists and is valid JSON
- [ ] `02-metrics/configuration-inventory.json` exists and is valid JSON
- [ ] All JSON files have file size > 0 bytes
- [ ] Scan results contain actual issues (not empty arrays)

### Quick validation script

```powershell
# Validate JSON files
$jsonFiles = Get-ChildItem -Path "{ANALYSIS_ROOT}" -Recurse -Filter "*.json"

foreach ($file in $jsonFiles) {
    try {
        $content = Get-Content $file.FullName -Raw | ConvertFrom-Json
        Write-Host "[VALID] $($file.Name)" -ForegroundColor Green
    } catch {
        Write-Host "[INVALID] $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

---

## 2.8 Issue Summary Report

Generate a quick summary of discovered issues:

```powershell
# Count issues from scan results
$OutputDir = "{ANALYSIS_ROOT}/02-scan-results"

Write-Host "`n=== Issue Summary ===" -ForegroundColor Cyan

# SARIF issues
if (Test-Path "$OutputDir/dotnet-results.sarif") {
    $sarif = Get-Content "$OutputDir/dotnet-results.sarif" -Raw | ConvertFrom-Json
    $dotnetIssues = $sarif.runs[0].results.Count
    Write-Host "ASP.NET Issues: $dotnetIssues" -ForegroundColor Yellow
}

# ZPA issues (prod)
if (Test-Path "$OutputDir/plsql-prod-results.json") {
    $zpa = Get-Content "$OutputDir/plsql-prod-results.json" -Raw | ConvertFrom-Json
    $plsqlProdIssues = $zpa.issues.Count
    Write-Host "PL/SQL (prod) Issues: $plsqlProdIssues" -ForegroundColor Yellow
}

# ZPA issues (trunk)
if (Test-Path "$OutputDir/plsql-trunk-results.json") {
    $zpa = Get-Content "$OutputDir/plsql-trunk-results.json" -Raw | ConvertFrom-Json
    $plsqlTrunkIssues = $zpa.issues.Count
    Write-Host "PL/SQL (trunk) Issues: $plsqlTrunkIssues" -ForegroundColor Yellow
}

Write-Host "`nTotal Issues to Process: $($dotnetIssues + $plsqlProdIssues + $plsqlTrunkIssues)" -ForegroundColor Cyan
```

---

## Step Output: Findings Summary

**IMPORTANT**: After completing this step, document your findings in the following format. Focus on CODE QUALITY and SECURITY findings from the scans.

### Required Output Template

```markdown
# Step 02 Findings: Automated Scan Results

## Status: [COMPLETE | PARTIAL | BLOCKED]

## Scan Execution Summary

| Scan Type | Tool | Files Scanned | Issues Found | Status |
|-----------|------|---------------|--------------|--------|
| C# Code Quality | Roslyn/dotnet build | {n} | {n} | {Pass/Fail} |
| C# Security | Security Code Scan | {n} | {n} | {Pass/Fail/Skipped} |
| PL/SQL Quality | ZPA | {n} | {n} | {Pass/Fail/Skipped} |

## Issue Distribution by Severity

| Severity | C# Issues | PL/SQL Issues | Total | Priority |
|----------|-----------|---------------|-------|----------|
| Critical | {n} | {n} | {n} | Immediate |
| High | {n} | {n} | {n} | Sprint 1 |
| Medium | {n} | {n} | {n} | Backlog |
| Low | {n} | {n} | {n} | Optional |

## Top Code Quality Issues (C#)

| Rule ID | Count | Description | Top Files Affected |
|---------|-------|-------------|-------------------|
| {e.g., CS0168} | {n} | {unused variable} | {file1, file2} |
| {e.g., CA1062} | {n} | {null check missing} | {file1, file2} |

## Top Code Quality Issues (PL/SQL)

| Rule ID | Count | Description | Top Files Affected |
|---------|-------|-------------|-------------------|
| {e.g., AvoidSelectStar} | {n} | {description} | {file1, file2} |
| {e.g., CyclomaticComplexity} | {n} | {description} | {file1, file2} |

## Security Vulnerabilities

| Vulnerability | Severity | Count | Files | Remediation Priority |
|---------------|----------|-------|-------|---------------------|
| {e.g., SQL Injection risk} | Critical | {n} | {files} | Immediate |
| {e.g., SSL bypass} | High | {n} | {files} | Sprint 1 |
| {e.g., Hardcoded secrets} | Medium | {n} | {files} | Sprint 2 |

## Complexity Hotspots

| File/Object | LOC | Cyclomatic Complexity | Maintainability Risk |
|-------------|-----|----------------------|---------------------|
| {e.g., CHECK_BUILDING_ADDRESS.sql} | 1,473 | 25+ | Critical |
| {e.g., AdminAddress.aspx.cs} | 5,250 | 50+ | Critical |

## Technical Debt Summary

| Category | Issue Count | Estimated Effort | Priority |
|----------|-------------|------------------|----------|
| Code Smells | {n} | {hours/days} | {High/Med/Low} |
| Security Issues | {n} | {hours/days} | {High/Med/Low} |
| Deprecated APIs | {n} | {hours/days} | {High/Med/Low} |
| Missing Tests | {n} | {hours/days} | {High/Med/Low} |

## Recommendations

### Immediate (This Sprint)
1. {e.g., Fix SSL validation bypass in Global.asax}
2. {e.g., Address SQL injection in X procedure}

### Short-term (Next 2 Sprints)
1. {e.g., Refactor CHECK_BUILDING_ADDRESS - too complex}
2. {e.g., Add null checks to public APIs}

### Long-term (Backlog)
1. {e.g., Reduce cyclomatic complexity across codebase}
2. {e.g., Standardize error handling}
```

### Example Output ({PROJECT} Project)

```markdown
# Step 02 Findings: Automated Scan Results

## Status: COMPLETE

## Scan Execution Summary

| Scan Type | Tool | Files Scanned | Issues Found | Status |
|-----------|------|---------------|--------------|--------|
| C# Code Quality | Roslyn/dotnet build | 554 | 342 | Pass |
| C# Security | Security Code Scan | 554 | 12 | Pass (with sdk-path) |
| PL/SQL Quality | ZPA | 843 | 1,247 | Pass |

## Issue Distribution by Severity

| Severity | C# Issues | PL/SQL Issues | Total | Priority |
|----------|-----------|---------------|-------|----------|
| Critical | 3 | 15 | 18 | Immediate |
| High | 28 | 89 | 117 | Sprint 1 |
| Medium | 156 | 543 | 699 | Backlog |
| Low | 155 | 600 | 755 | Optional |

## Top Code Quality Issues (C#)

| Rule ID | Count | Description | Top Files Affected |
|---------|-------|-------------|-------------------|
| CS0168 | 45 | Unused variable declared | AdminAddress.aspx.cs, Default.aspx.cs |
| CA1062 | 32 | Validate parameter before use | {PROJECT}Database/*.cs |
| CS0618 | 28 | Obsolete member usage | {PROJECT}Sync1VTJ (WSE 3.0) |

## Top Code Quality Issues (PL/SQL)

| Rule ID | Count | Description | Top Files Affected |
|---------|-------|-------------|-------------------|
| AvoidSelectStar | 156 | SELECT * in queries | GET_ADDRESS_DATA, FETCH_* procedures |
| CyclomaticComplexity | 26 | Complexity > 10 | CHECK_BUILDING_ADDRESS, {EXT1}_* |
| NamingConventions | 312 | Inconsistent naming | Multiple packages |

## Security Vulnerabilities

| Vulnerability | Severity | Count | Files | Remediation Priority |
|---------------|----------|-------|-------|---------------------|
| SSL Certificate Bypass | Critical | 1 | Global.asax | Immediate |
| WSE 3.0 Obsolete Security | High | 5 | {PROJECT}Sync1VTJ | Sprint 1 |
| Hardcoded Configuration | Medium | 8 | Web.config, SNSTopicLibrary | Sprint 2 |

## Complexity Hotspots

| File/Object | LOC | Cyclomatic Complexity | Maintainability Risk |
|-------------|-----|----------------------|---------------------|
| CHECK_BUILDING_ADDRESS.sql | 1,473 | 25+ | Critical |
| AdminAddress.aspx.cs | 5,250 | 50+ | Critical |
| Default.aspx.cs | 1,800 | 35+ | High |
| {EXT1}_EXAMPLE.sql | 648 | 18 | High |

## Technical Debt Summary

| Category | Issue Count | Estimated Effort | Priority |
|----------|-------------|------------------|----------|
| Code Smells | 1,247 | 40 days | Medium |
| Security Issues | 12 | 5 days | High |
| Deprecated APIs | 28 | 10 days | High |
| Missing Tests | ~400 files | 60 days | Medium |

## Recommendations

### Immediate (This Sprint)
1. Fix SSL validation bypass in Global.asax:ValidateServerCertificate
2. Review WSE 3.0 usage in {PROJECT}Sync1VTJ for security implications

### Short-term (Next 2 Sprints)
1. Refactor CHECK_BUILDING_ADDRESS.sql (1,473 LOC â†’ multiple smaller functions)
2. Add null parameter validation to {PROJECT}Database public methods

### Long-term (Backlog)
1. Replace SELECT * with explicit column lists (156 instances)
2. Standardize PL/SQL naming conventions (312 violations)
3. Increase test coverage from 18% to 50%
```

---

## Record Step Completion Time

**IMPORTANT**: Record this step's completion time for the timing tracker.

**PowerShell**:
```powershell
# Record step completion time and append to timing tracker
$Step03EndTime = Get-Date
$timingEntry = @{
    step = "03"
    description = "Automated Discovery Scan"
    start = $Step03StartTime.ToString('yyyy-MM-ddTHH:mm:ss')
    end = $Step03EndTime.ToString('yyyy-MM-ddTHH:mm:ss')
    duration_min = [math]::Round(($Step03EndTime - $Step03StartTime).TotalMinutes, 1)
}
$timingEntry | ConvertTo-Json -Compress | Add-Content "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
Write-Host "Step 03 timing recorded: $($timingEntry.duration_min) minutes" -ForegroundColor Cyan
```

**Bash/sh**:
```bash
# Record step completion time and append to timing tracker
STEP_03_END=$(date -Iseconds)
STEP_03_DURATION=$(( ($(date -d "$STEP_03_END" +%s) - $(date -d "$STEP_03_START" +%s)) / 60 ))

echo "{\"step\":\"03\",\"description\":\"Automated Discovery Scan\",\"start\":\"$STEP_03_START\",\"end\":\"$STEP_03_END\",\"duration_min\":$STEP_03_DURATION}" >> "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
echo "Step 03 timing recorded: $STEP_03_DURATION minutes"
```

---

## Next Step

Proceed to: [04-ai-findings-analysis.md](04-ai-findings-analysis.md)

---

*Document Version: 1.1*
*Last Updated: 2025-12-22*
