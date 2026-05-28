#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sync AI-kit folders from n-ai1st-kit to target project(s).

.DESCRIPTION
    Removes old .ai, .ai_project_memory, .claude folders from target projects,
    then copies fresh versions from n-ai1st-kit. Preserves CLAUDE.local.md and settings.local.json
    (user-specific files not in the kit).

.PARAMETER Targets
    Array of target project root paths. Defaults to C:\GIT\OmanTAX and C:\TEST\OmanTAX.

.PARAMETER Source
    Path to n-ai1st-kit root. Defaults to script's grandparent directory.

.PARAMETER DryRun
    Show what would be copied/removed without making changes.

.PARAMETER SkipConfirm
    Skip the confirmation prompt.

.EXAMPLE
    ./sync-ai-kit.ps1
    # Syncs to default targets (C:\GIT\OmanTAX, C:\TEST\OmanTAX)

.EXAMPLE
    ./sync-ai-kit.ps1 -DryRun
    # Preview changes without applying

.EXAMPLE
    ./sync-ai-kit.ps1 -Targets "C:\GIT\OtherProject"
    # Sync to a specific project

.NOTES
    Part of n-ai1st-kit - AI-assisted development toolkit
    Version: 1.0.0
    Created: 2026-02-11
#>

param(
    [Parameter(Mandatory = $false)]
    [string[]]$Targets = @("C:\GIT\OmanTAX", "C:\TEST\OmanTAX"),

    [Parameter(Mandatory = $false)]
    [string]$Source = "",

    [switch]$DryRun,

    [switch]$SkipConfirm
)

# Resolve source to n-ai1st-kit root (script is at .ai/scripts/)
if (-not $Source) {
    $Source = Resolve-Path (Join-Path $PSScriptRoot "..\..")
}

if (-not (Test-Path $Source)) {
    Write-Host "ERROR: Source not found: $Source" -ForegroundColor Red
    exit 1
}

# Folders and files to sync
$syncFolders = @(".ai", ".claude")
$syncFiles = @()

# User-specific files to preserve (backed up before delete, restored after copy)
$preserveFiles = @(
    ".claude\CLAUDE.local.md",
    ".claude\settings.local.json"
)

Write-Host ""
Write-Host "=== AI-Kit Sync ===" -ForegroundColor Cyan
Write-Host "Source: $Source" -ForegroundColor White
Write-Host "Targets: $($Targets -join ', ')" -ForegroundColor White
if ($DryRun) {
    Write-Host "Mode: DRY RUN (no changes)" -ForegroundColor Yellow
}
Write-Host ""

# Validate source has expected content
foreach ($folder in $syncFolders) {
    $sourcePath = Join-Path $Source $folder
    if (-not (Test-Path $sourcePath)) {
        Write-Host "ERROR: Expected folder missing from source: $sourcePath" -ForegroundColor Red
        exit 1
    }
}

# Confirm
if (-not $DryRun -and -not $SkipConfirm) {
    Write-Host "This will DELETE and REPLACE these in each target:" -ForegroundColor Yellow
    foreach ($folder in $syncFolders) { Write-Host "  $folder/" -ForegroundColor Yellow }
    foreach ($file in $syncFiles) { Write-Host "  $file" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "User-specific files will be PRESERVED:" -ForegroundColor Green
    foreach ($file in $preserveFiles) { Write-Host "  $file" -ForegroundColor Green }
    Write-Host ""
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
}

foreach ($target in $Targets) {
    Write-Host "--- Target: $target ---" -ForegroundColor Cyan

    if (-not (Test-Path $target)) {
        Write-Host "  SKIP: Target not found" -ForegroundColor Yellow
        Write-Host ""
        continue
    }

    # 1. Backup user-specific files
    $backups = @{}
    foreach ($file in $preserveFiles) {
        $filePath = Join-Path $target $file
        if (Test-Path $filePath) {
            $backups[$file] = Get-Content -Path $filePath -Raw -Encoding UTF8
            if ($DryRun) {
                Write-Host "  [backup] $file" -ForegroundColor DarkGray
            }
        }
    }

    # 2. Remove old folders
    foreach ($folder in $syncFolders) {
        $targetPath = Join-Path $target $folder
        if (Test-Path $targetPath) {
            if ($DryRun) {
                $count = (Get-ChildItem $targetPath -Recurse -File).Count
                Write-Host "  [remove] $folder/ ($count files)" -ForegroundColor Red
            }
            else {
                Remove-Item $targetPath -Recurse -Force
                Write-Host "  Removed: $folder/" -ForegroundColor Red
            }
        }
    }

    # 3. Remove old root files
    foreach ($file in $syncFiles) {
        $targetPath = Join-Path $target $file
        if (Test-Path $targetPath) {
            if ($DryRun) {
                Write-Host "  [remove] $file" -ForegroundColor Red
            }
            else {
                Remove-Item $targetPath -Force
                Write-Host "  Removed: $file" -ForegroundColor Red
            }
        }
    }

    # 4. Copy fresh folders
    foreach ($folder in $syncFolders) {
        $sourcePath = Join-Path $Source $folder
        $targetPath = Join-Path $target $folder
        if ($DryRun) {
            $count = (Get-ChildItem $sourcePath -Recurse -File).Count
            Write-Host "  [copy]   $folder/ ($count files)" -ForegroundColor Green
        }
        else {
            Copy-Item $sourcePath $targetPath -Recurse -Force
            $count = (Get-ChildItem $targetPath -Recurse -File).Count
            Write-Host "  Copied:  $folder/ ($count files)" -ForegroundColor Green
        }
    }

    # 5. Copy root files
    foreach ($file in $syncFiles) {
        $sourcePath = Join-Path $Source $file
        $targetPath = Join-Path $target $file
        if (Test-Path $sourcePath) {
            if ($DryRun) {
                Write-Host "  [copy]   $file" -ForegroundColor Green
            }
            else {
                Copy-Item $sourcePath $targetPath -Force
                Write-Host "  Copied:  $file" -ForegroundColor Green
            }
        }
    }

    # 6. Restore user-specific files
    foreach ($file in $backups.Keys) {
        $filePath = Join-Path $target $file
        $parentDir = Split-Path $filePath -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
        }
        if ($DryRun) {
            Write-Host "  [restore] $file" -ForegroundColor Magenta
        }
        else {
            Set-Content -Path $filePath -Value $backups[$file] -NoNewline -Encoding UTF8
            Write-Host "  Restored: $file" -ForegroundColor Magenta
        }
    }

    Write-Host ""
}

# Summary
Write-Host "=== Done ===" -ForegroundColor Green
if ($DryRun) {
    Write-Host "Dry run complete. Run without -DryRun to apply changes." -ForegroundColor Yellow
}
else {
    Write-Host "AI-kit synced to $($Targets.Count) target(s)." -ForegroundColor White
    Write-Host ""
    Write-Host "Next: Open target project in VS Code and verify with /context" -ForegroundColor Cyan
}
Write-Host ""
