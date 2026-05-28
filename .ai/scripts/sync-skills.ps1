# Sync Skills from Anthropic Repository
# Usage: .\sync-skills.ps1 [tier1|tier2|all|skill-name]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter()]
    [string]$UpstreamPath = ""
)

# Configuration
# UPSTREAM: Local clone of https://github.com/anthropics/skills
# Set via -UpstreamPath parameter, SKILLS_UPSTREAM env var, or default location
if ($UpstreamPath) {
    $UPSTREAM = $UpstreamPath
} elseif ($env:SKILLS_UPSTREAM) {
    $UPSTREAM = $env:SKILLS_UPSTREAM
} else {
    # Default: sibling 'skills' directory relative to git root
    $gitRoot = (git rev-parse --show-toplevel 2>$null) -replace '/', '\'
    if ($gitRoot) {
        $UPSTREAM = Join-Path (Split-Path $gitRoot -Parent) "skills\skills"
    } else {
        $UPSTREAM = ""
    }
}
$TARGET = "$PSScriptRoot\..\.ai\skills"

# Tier 1: Essential Skills
$TIER1_SKILLS = @(
    "skill-creator",
    "doc-coauthoring",
    "frontend-design",
    "webapp-testing",
    "internal-comms"
)

# Tier 2: High Value Skills
$TIER2_SKILLS = @(
    "mcp-builder",
    "docx",
    "pdf",
    "xlsx"
)

# Function to sync a single skill
function Sync-Skill {
    param([string]$SkillName)

    $upstreamPath = Join-Path $UPSTREAM $SkillName
    $targetPath = Join-Path $TARGET $SkillName

    Write-Host "Syncing: $SkillName" -ForegroundColor Yellow

    # Check if skill exists upstream
    if (-not (Test-Path $upstreamPath)) {
        Write-Host "  ❌ Not found: $upstreamPath" -ForegroundColor Red
        return $false
    }

    # Create target directory
    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null

    # Copy skill files (using robocopy for efficiency)
    $robocopyArgs = @(
        $upstreamPath,
        $targetPath,
        "/MIR",           # Mirror directory
        "/NFL",           # No file list
        "/NDL",           # No directory list
        "/NJH",           # No job header
        "/NJS",           # No job summary
        "/XD", ".git",    # Exclude .git
        "/XD", "node_modules",  # Exclude node_modules
        "/XD", "__pycache__",   # Exclude __pycache__
        "/XF", "*.pyc"    # Exclude .pyc files
    )

    $result = robocopy @robocopyArgs 2>&1

    # Robocopy exit codes: 0-7 are success, 8+ are errors
    if ($LASTEXITCODE -lt 8) {
        Write-Host "  ✅ Synced: $SkillName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ Failed to sync: $SkillName" -ForegroundColor Red
        return $false
    }
}

# Function to list available skills
function List-Skills {
    Write-Host "=== Available Skills in Upstream ===" -ForegroundColor Cyan

    Get-ChildItem -Path $UPSTREAM -Directory | ForEach-Object {
        $skillName = $_.Name
        $skillMdPath = Join-Path $_.FullName "SKILL.md"

        if (Test-Path $skillMdPath) {
            # Extract description
            $description = Get-Content $skillMdPath |
                Select-String "^description:" |
                Select-Object -First 1 |
                ForEach-Object { $_.Line -replace "^description:\s*", "" } |
                ForEach-Object { $_.Substring(0, [Math]::Min(60, $_.Length)) }

            Write-Host "  - $skillName`: $description..." -ForegroundColor White
        } else {
            Write-Host "  - $skillName (no SKILL.md)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Function to sync tier
function Sync-Tier {
    param([string]$TierName)

    $skills = @()
    $tierLabel = ""

    switch ($TierName) {
        { $_ -in "tier1", "1" } {
            $skills = $TIER1_SKILLS
            $tierLabel = "Tier 1: Essential Skills"
        }
        { $_ -in "tier2", "2" } {
            $skills = $TIER2_SKILLS
            $tierLabel = "Tier 2: High Value Skills"
        }
        "all" {
            $skills = $TIER1_SKILLS + $TIER2_SKILLS
            $tierLabel = "All Recommended Skills"
        }
        default {
            Write-Host "Unknown tier: $TierName" -ForegroundColor Red
            return
        }
    }

    Write-Host "=== Syncing $tierLabel ===" -ForegroundColor Cyan

    $successCount = 0
    $failCount = 0

    foreach ($skill in $skills) {
        if (Sync-Skill $skill) {
            $successCount++
        } else {
            $failCount++
        }
    }

    Write-Host ""
    Write-Host "=== Sync Summary ===" -ForegroundColor Cyan
    Write-Host "  ✅ Success: $successCount" -ForegroundColor Green
    if ($failCount -gt 0) {
        Write-Host "  ❌ Failed: $failCount" -ForegroundColor Red
    }
}

# Function to check upstream status
function Check-Upstream {
    Write-Host "=== Checking Upstream Repository ===" -ForegroundColor Cyan

    $gitPath = Split-Path $UPSTREAM -Parent

    Push-Location $gitPath

    if (Test-Path ".git") {
        $branch = git branch --show-current
        $lastCommit = git log -1 --oneline

        Write-Host "Current branch: $branch"
        Write-Host "Last commit: $lastCommit"
        Write-Host "Status:"
        git status --short

        # Check for updates
        Write-Host ""
        Write-Host "Checking for remote updates..."
        git fetch origin --quiet

        $behind = (git rev-list HEAD..origin/$branch --count)
        if ($behind -gt 0) {
            Write-Host "⚠️  Upstream is $behind commits ahead" -ForegroundColor Yellow
            Write-Host "Run: cd $gitPath && git pull"
        } else {
            Write-Host "✅ Upstream is up to date" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Not a git repository" -ForegroundColor Red
    }

    Pop-Location
    Write-Host ""
}

# Function to show usage
function Show-Usage {
    @"
Usage: .\sync-skills.ps1 [COMMAND]

Commands:
  tier1               Sync Tier 1 essential skills
  tier2               Sync Tier 2 high-value skills
  all                 Sync all recommended skills (Tier 1 + Tier 2)
  list                List all available upstream skills
  status              Check upstream repository status
  skill-name          Sync a specific skill by name
  help                Show this help message

Examples:
  .\sync-skills.ps1 tier1                 # Sync essential skills
  .\sync-skills.ps1 all                   # Sync all recommended skills
  .\sync-skills.ps1 frontend-design       # Sync specific skill
  .\sync-skills.ps1 list                  # List available skills
  .\sync-skills.ps1 status                # Check for upstream updates

Tier 1 Skills: $($TIER1_SKILLS -join ', ')
Tier 2 Skills: $($TIER2_SKILLS -join ', ')

"@
}

# Main script logic
function Main {
    # Check if upstream exists
    if (-not (Test-Path $UPSTREAM)) {
        Write-Host "❌ Upstream repository not found: $UPSTREAM" -ForegroundColor Red
        Write-Host "Please clone: git clone https://github.com/anthropics/skills.git <path>"
        Write-Host "Then run: .\sync-skills.ps1 tier1 -UpstreamPath <path>\skills"
        exit 1
    }

    # Create target directory
    New-Item -ItemType Directory -Force -Path $TARGET | Out-Null

    # Parse command
    switch ($Command.ToLower()) {
        { $_ -in "tier1", "tier2", "all" } {
            Sync-Tier $Command
        }
        "list" {
            List-Skills
        }
        "status" {
            Check-Upstream
        }
        { $_ -in "help", "--help", "-h", "/?" } {
            Show-Usage
        }
        default {
            # Assume it's a skill name
            $skillPath = Join-Path $UPSTREAM $Command
            if (Test-Path $skillPath) {
                Sync-Skill $Command
            } else {
                Write-Host "❌ Unknown command or skill: $Command" -ForegroundColor Red
                Write-Host ""
                Show-Usage
                exit 1
            }
        }
    }
}

# Run main
Main
