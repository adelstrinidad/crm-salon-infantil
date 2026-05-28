<#
.SYNOPSIS
    Extracts code metrics from source codebase using cloc. Runs entirely locally.

.DESCRIPTION
    Generates code metrics including lines of code, file counts, and language
    breakdown. Results support legacy analysis without AI vendor transmission.

.PARAMETER SourcePath
    Path to the source code directory to analyze.

.PARAMETER OutputPath
    Path for output directory (default: ../artifacts/02-metrics).

.EXAMPLE
    .\extract-metrics.ps1 -SourcePath "..\..\..\..\{source_path}"

.NOTES
    Prerequisites: cloc (install via npm: npm install -g cloc, or choco: choco install cloc)
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,

    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "../artifacts/02-metrics"
)

$ErrorActionPreference = "Stop"

# Check for cloc
$clocPath = Get-Command cloc -ErrorAction SilentlyContinue
if (-not $clocPath) {
    Write-Error "ERROR: cloc is not installed. Install with: npm install -g cloc OR choco install cloc"
    exit 1
}

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "=== Code Metrics Extractor ===" -ForegroundColor Cyan
Write-Host "Source: $SourcePath"
Write-Host "Output: $OutputPath"
Write-Host ""

# Generate cloc summary in multiple formats
Write-Host "Generating code metrics..."

# CSV format for data processing
Write-Host "  - cloc-summary.csv"
& cloc $SourcePath --csv --quiet --out="$OutputPath/cloc-summary.csv" 2>$null

# JSON format for structured analysis
Write-Host "  - cloc-summary.json"
& cloc $SourcePath --json --quiet --out="$OutputPath/cloc-summary.json" 2>$null

# Markdown format for documentation
Write-Host "  - cloc-summary.md"
& cloc $SourcePath --md --quiet --out="$OutputPath/cloc-summary.md" 2>$null

# Per-file breakdown
Write-Host "  - cloc-by-file.csv"
& cloc $SourcePath --by-file --csv --quiet --out="$OutputPath/cloc-by-file.csv" 2>$null

# Generate file inventory
Write-Host "  - file-inventory.csv"
$files = Get-ChildItem -Path $SourcePath -Recurse -File -ErrorAction SilentlyContinue
$inventory = $files | ForEach-Object {
    [PSCustomObject]@{
        RelativePath = $_.FullName.Replace($SourcePath, "").TrimStart("\", "/")
        Extension    = $_.Extension
        SizeBytes    = $_.Length
        LastModified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
}
$inventory | Export-Csv -Path "$OutputPath/file-inventory.csv" -NoTypeInformation

# Count totals
$TotalFiles = ($files | Measure-Object).Count
$TotalDirs = (Get-ChildItem -Path $SourcePath -Recurse -Directory -ErrorAction SilentlyContinue | Measure-Object).Count

# Generate summary report
Write-Host "  - METRICS-SUMMARY.md"
$summaryContent = @"
# Code Metrics Summary

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Source Path**: $SourcePath

## Overview

| Metric | Value |
|--------|-------|
| Total Files | $TotalFiles |
| Total Directories | $TotalDirs |

## Language Breakdown

See [cloc-summary.md](cloc-summary.md) for detailed language statistics.

## Files Generated

| File | Description |
|------|-------------|
| cloc-summary.csv | Language summary in CSV format |
| cloc-summary.json | Language summary in JSON format |
| cloc-summary.md | Language summary in Markdown |
| cloc-by-file.csv | Per-file breakdown |
| file-inventory.csv | Complete file inventory |

## Next Steps

1. Review language distribution in cloc-summary.md
2. Identify largest files in cloc-by-file.csv
3. Check file-inventory.csv for unexpected file types
4. Use this data for component analysis planning
"@
$summaryContent | Out-File -FilePath "$OutputPath/METRICS-SUMMARY.md" -Encoding utf8

Write-Host ""
Write-Host "=== Extraction Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Files generated:"
Get-ChildItem -Path $OutputPath -File | ForEach-Object { Write-Host "  - $($_.Name)" }
Write-Host ""
Write-Host "Summary: $TotalFiles files in $TotalDirs directories"
Write-Host ""
Write-Host "Results saved to: $OutputPath/"
