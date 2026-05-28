#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Create folder structure for legacy analysis workflows.

.DESCRIPTION
    Sets up the required folder structure for ai1st-arch-legacy-sys-analysis (Full), ai1st-arch-legacy-analysis-lite (LITE),
    or ai1st-arch-code-quality-analysis (Quality) legacy analysis processes.

.PARAMETER AnalysisRoot
    Path to the analysis output directory (e.g., C:\GIT\project\analysis)

.PARAMETER ProcessType
    Type of analysis process: "full" (ai1st-arch-legacy-sys-analysis), "lite" (ai1st-arch-legacy-analysis-lite), or "quality" (ai1st-arch-code-quality-analysis)
    Default: "full"

.EXAMPLE
    ./legacy-analysis-setup.ps1 -AnalysisRoot "C:\GIT\project\analysis" -ProcessType "full"

.EXAMPLE
    ./legacy-analysis-setup.ps1 -AnalysisRoot "." -ProcessType "lite"

.NOTES
    Part of n-ai1st-kit - AI-assisted development toolkit
    Version: 1.0.0
    Created: 2026-02-03
#>

param(
    [Parameter(Mandatory = $true, HelpMessage = "Path to analysis output directory")]
    [string]$AnalysisRoot,

    [Parameter(Mandatory = $false, HelpMessage = "Process type: full, lite, quality, or to-be")]
    [ValidateSet("full", "lite", "quality", "to-be")]
    [string]$ProcessType = "full"
)

# Resolve to absolute path
$AnalysisRoot = Resolve-Path -Path $AnalysisRoot -ErrorAction SilentlyContinue
if (-not $AnalysisRoot) {
    $AnalysisRoot = $PSBoundParameters['AnalysisRoot']
    # Create root if it doesn't exist
    if (-not (Test-Path $AnalysisRoot)) {
        New-Item -ItemType Directory -Force -Path $AnalysisRoot | Out-Null
    }
    $AnalysisRoot = Resolve-Path -Path $AnalysisRoot
}

function New-FolderIfNotExists {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
        Write-Host "  Created: $Path" -ForegroundColor Green
    }
    else {
        Write-Host "  Exists:  $Path" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Legacy Analysis Folder Setup ===" -ForegroundColor Cyan
Write-Host "Analysis Root: $AnalysisRoot" -ForegroundColor White
Write-Host "Process Type:  $ProcessType" -ForegroundColor White
Write-Host ""

# Common folders (all process types)
$commonFolders = @(
    "work",
    "work/01-reconnaissance",
    "docs/business-context"
)

# Full process (ai1st-arch-legacy-sys-analysis) folders
$fullFolders = @(
    "arch-as-is",
    "arch-as-is/diagrams",
    "arch-as-is/diagrams/exports",
    "arch-as-is/appendices",
    "arch-to-be",
    "arch-to-be/diagrams",
    "arch-to-be/diagrams/exports",
    "templates/arc42",
    "templates/analysis-templates",
    "work/02-environment",
    "work/03-metrics",
    "work/04-findings",
    "work/05-analysis",
    "work/05-analysis/csharp",
    "work/05-analysis/database",
    "work/05-analysis/integration",
    "work/06-review",
    "work/07-synthesis",
    "work/07-synthesis/requirements",
    "work/08-validation",
    "work/09-summaries"
)

# LITE process (ai1st-arch-legacy-analysis-lite) folders
$liteFolders = @(
    "arch-as-is-lite",
    "arch-as-is-lite/dto"
)

# TO-BE process (ai1st-arch-legacy-to-modern-design) folders
$toBeFolders = @(
    "arch-to-be",
    "arch-to-be/specs"
)

# Quality process (ai1st-arch-code-quality-analysis) folders
$qualityFolders = @(
    "work/quality-metrics"
)

# Create common folders
Write-Host "Creating common folders..." -ForegroundColor Cyan
foreach ($folder in $commonFolders) {
    New-FolderIfNotExists -Path (Join-Path $AnalysisRoot $folder)
}

# Create process-specific folders
switch ($ProcessType) {
    "full" {
        Write-Host ""
        Write-Host "Creating full analysis folders (ai1st-arch-legacy-sys-analysis)..." -ForegroundColor Cyan
        foreach ($folder in $fullFolders) {
            New-FolderIfNotExists -Path (Join-Path $AnalysisRoot $folder)
        }
    }
    "lite" {
        Write-Host ""
        Write-Host "Creating LITE analysis folders (ai1st-arch-legacy-analysis-lite)..." -ForegroundColor Cyan
        foreach ($folder in $liteFolders) {
            New-FolderIfNotExists -Path (Join-Path $AnalysisRoot $folder)
        }
    }
    "quality" {
        Write-Host ""
        Write-Host "Creating quality analysis folders (ai1st-arch-code-quality-analysis)..." -ForegroundColor Cyan
        foreach ($folder in $qualityFolders) {
            New-FolderIfNotExists -Path (Join-Path $AnalysisRoot $folder)
        }
    }
    "to-be" {
        Write-Host ""
        Write-Host "Creating TO-BE design folders (ai1st-arch-legacy-to-modern-design)..." -ForegroundColor Cyan
        foreach ($folder in $toBeFolders) {
            New-FolderIfNotExists -Path (Join-Path $AnalysisRoot $folder)
        }
    }
}

# Create gate-tracking.md for full process
if ($ProcessType -eq "full") {
    $gateTrackingPath = Join-Path $AnalysisRoot "work/gate-tracking.md"
    if (-not (Test-Path $gateTrackingPath)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $content = @"
# Gate Tracking Log

## Session Variables (COPY ON RESUME)

``````
{PROJECT_ROOT}: [TO BE SET]
{ANALYSIS_ROOT}: $AnalysisRoot
Process: ai1st-arch-legacy-sys-analysis (Full)
Started: $timestamp
``````

## Context Reload Files (READ AFTER /clear)

1. ``{PROJECT_ROOT}/.ai_project_memory/constitution-legacy-analysis.md``
2. ``{PROJECT_ROOT}/.ai/legacy-analysis-process/process-steps/as-is-brownfield/how-to-perform-legacy-analysis.md``
3. ``{ANALYSIS_ROOT}/work/gate-tracking.md`` (this file)

## Gate Status

| Gate | Status | Timestamp | Decision | Clear Context? |
|------|--------|-----------|----------|----------------|
| Gate 0 | Pending | | | YES - before Step 02 |
| Gate 1 | Pending | | | Optional |
| Gate 2 | Pending | | | YES - before Step 05 |
| Gate 3 | Pending | | | YES - before Step 06 |
| Gate 4 | Pending | | | YES - before Step 07 |
| Gate 5 | Pending | | | YES - before Step 09 |
| Gate 6 | Pending | | | End |

---

## Gate Log

_(Entries appended as gates are passed)_

"@
        Set-Content -Path $gateTrackingPath -Value $content -Encoding UTF8
        Write-Host ""
        Write-Host "  Created: work/gate-tracking.md" -ForegroundColor Green
    }
}

# Check for shared business context
$sharedRoot = Join-Path (Split-Path $AnalysisRoot -Parent) "shared"
$sharedBusinessContext = Join-Path $sharedRoot "docs/business-context"
Write-Host ""
if (Test-Path $sharedBusinessContext) {
    $sharedFiles = (Get-ChildItem $sharedBusinessContext -File).Count
    Write-Host "  Shared business context found: $sharedBusinessContext ($sharedFiles files)" -ForegroundColor Green
    Write-Host "  Tip: Add Section 3.6 to PROJECT-SCOPE.md to reference shared docs" -ForegroundColor Cyan
}
else {
    Write-Host "  No shared business context at: $sharedBusinessContext" -ForegroundColor Yellow
    Write-Host "  All business context expected in module-local docs/business-context/" -ForegroundColor Yellow
    Write-Host "  Tip: Create shared/ folder to reuse Glossary/BRDs across modules" -ForegroundColor Cyan
}

# Summary
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Folder structure created at: $AnalysisRoot" -ForegroundColor White
Write-Host ""
Write-Host "Next steps - run your analysis command:" -ForegroundColor Cyan

switch ($ProcessType) {
    "full" {
        Write-Host "  /ai1st-arch-legacy-sys-analysis" -ForegroundColor Yellow
    }
    "lite" {
        Write-Host "  /ai1st-arch-legacy-analysis-lite" -ForegroundColor Yellow
    }
    "quality" {
        Write-Host "  /ai1st-arch-code-quality-analysis" -ForegroundColor Yellow
    }
    "to-be" {
        Write-Host "  /ai1st-arch-legacy-to-modern-design" -ForegroundColor Yellow
    }
}

Write-Host ""
