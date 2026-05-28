# Verification Scripts Setup

**Purpose**: Automated testing and validation of tool installations and configurations

## Overview

Verification scripts ensure all analysis tools are correctly installed and configured before starting legacy analysis.

## Script Locations

All verification scripts are in:
```
{ANALYSIS_ROOT}/scripts/
â”œâ”€â”€ verify-environment.ps1      # Windows environment verification
â”œâ”€â”€ verify-environment.sh       # Linux/macOS environment verification
â”œâ”€â”€ scan-secrets.ps1           # Secret scanning (with built-in verification)
â”œâ”€â”€ extract-metrics.ps1        # Code metrics extraction
â””â”€â”€ classify-content.ps1       # Content classification
```

## Creating verification-scripts.ps1

Create `{ANALYSIS_ROOT}/scripts/verification-scripts.ps1`:

```powershell
<#
.SYNOPSIS
    Verify all legacy analysis tools are installed and configured correctly
.DESCRIPTION
    Checks for required tools, optional tools, and generates environment report
.EXAMPLE
    .\verification-scripts.ps1
.EXAMPLE
    .\verification-scripts.ps1 -Verbose
#>

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$report = @{
    Required = @{}
    Optional = @{}
    Warnings = @()
    Errors = @()
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Legacy Analysis Environment Verification" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Helper function to check command
function Test-Command {
    param(
        [string]$Name,
        [string]$Command,
        [string]$VersionArg = "--version",
        [string]$Category = "Required"
    )

    Write-Host "Checking $Name..." -NoNewline

    try {
        $tool = Get-Command $Command -ErrorAction SilentlyContinue

        if ($tool) {
            # Get version
            $version = & $Command $VersionArg 2>&1 | Select-Object -First 1
            Write-Host " OK" -ForegroundColor Green

            if ($Verbose) {
                Write-Host "  Location: $($tool.Source)" -ForegroundColor Gray
                Write-Host "  Version: $version" -ForegroundColor Gray
            }

            $report[$Category][$Name] = @{
                Status = "Installed"
                Path = $tool.Source
                Version = $version
            }

            return $true
        } else {
            Write-Host " NOT FOUND" -ForegroundColor Yellow
            $report[$Category][$Name] = @{
                Status = "Not Installed"
            }

            if ($Category -eq "Required") {
                $report.Errors += "$Name is required but not found"
            } else {
                $report.Warnings += "$Name is optional but not found (enhanced features disabled)"
            }

            return $false
        }
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
        $report[$Category][$Name] = @{
            Status = "Error"
            Error = $_.Exception.Message
        }

        if ($Category -eq "Required") {
            $report.Errors += "$Name check failed: $($_.Exception.Message)"
        }

        return $false
    }
}

# Check PowerShell version
Write-Host "Checking PowerShell version..." -NoNewline
if ($PSVersionTable.PSVersion.Major -ge 5) {
    Write-Host " OK (v$($PSVersionTable.PSVersion))" -ForegroundColor Green
} else {
    Write-Host " WARNING (v$($PSVersionTable.PSVersion), recommended 5.1+)" -ForegroundColor Yellow
    $report.Warnings += "PowerShell version $($PSVersionTable.PSVersion) is below recommended 5.1+"
}

Write-Host ""
Write-Host "Required Tools:" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan

# .NET SDK
Test-Command -Name "dotnet SDK" -Command "dotnet" -VersionArg "--version"

# Git
Test-Command -Name "Git" -Command "git" -VersionArg "--version"

# Java (for PlantUML)
Test-Command -Name "Java" -Command "java" -VersionArg "-version"

# Node.js (for Mermaid CLI and MCP servers)
Test-Command -Name "Node.js" -Command "node" -VersionArg "--version"

# npm
Test-Command -Name "npm" -Command "npm" -VersionArg "--version"

Write-Host ""
Write-Host "Optional Enhancement Tools:" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

# cloc
Test-Command -Name "cloc" -Command "cloc" -VersionArg "--version" -Category "Optional"

# Pandoc
Test-Command -Name "Pandoc" -Command "pandoc" -VersionArg "--version" -Category "Optional"

# Gitleaks
Test-Command -Name "Gitleaks" -Command "gitleaks" -VersionArg "version" -Category "Optional"

# TruffleHog
Test-Command -Name "TruffleHog" -Command "trufflehog" -VersionArg "--version" -Category "Optional"

# Graphviz
Test-Command -Name "Graphviz" -Command "dot" -VersionArg "-V" -Category "Optional"

Write-Host ""
Write-Host "Language-Specific Tools:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan

# Roslyn Analyzers (.NET)
Write-Host "Checking Roslyn Analyzers..." -NoNewline
try {
    $roslynPackages = dotnet list package --include-transitive 2>&1 | Select-String "Microsoft.CodeAnalysis"
    if ($roslynPackages) {
        Write-Host " OK" -ForegroundColor Green
        $report.Optional["Roslyn Analyzers"] = @{ Status = "Installed" }
    } else {
        Write-Host " NOT FOUND (install via NuGet)" -ForegroundColor Yellow
        $report.Optional["Roslyn Analyzers"] = @{ Status = "Not Installed" }
    }
} catch {
    Write-Host " SKIP" -ForegroundColor Gray
}

# Python (optional)
Test-Command -Name "Python" -Command "python" -VersionArg "--version" -Category "Optional"

# Java build tools (optional)
Test-Command -Name "Maven" -Command "mvn" -VersionArg "--version" -Category "Optional"
Test-Command -Name "Gradle" -Command "gradle" -VersionArg "--version" -Category "Optional"

Write-Host ""
Write-Host "MCP Servers:" -ForegroundColor Cyan
Write-Host "-------------" -ForegroundColor Cyan

# Knowledge Graph MCP
Write-Host "Checking Knowledge Graph MCP..." -NoNewline
try {
    $kgMcp = npm list -g @modelcontextprotocol/server-knowledge-graph 2>&1
    if ($kgMcp -match "@modelcontextprotocol/server-knowledge-graph") {
        Write-Host " OK" -ForegroundColor Green
        $report.Optional["Knowledge Graph MCP"] = @{ Status = "Installed" }
    } else {
        Write-Host " NOT FOUND" -ForegroundColor Yellow
        $report.Optional["Knowledge Graph MCP"] = @{ Status = "Not Installed" }
    }
} catch {
    Write-Host " ERROR" -ForegroundColor Red
}

# Context7 MCP
Write-Host "Checking Context7 MCP..." -NoNewline
try {
    $c7Mcp = npm list -g @context7/mcp-server 2>&1
    if ($c7Mcp -match "@context7/mcp-server") {
        Write-Host " OK" -ForegroundColor Green
        $report.Optional["Context7 MCP"] = @{ Status = "Installed" }
    } else {
        Write-Host " NOT FOUND" -ForegroundColor Yellow
        $report.Optional["Context7 MCP"] = @{ Status = "Not Installed" }
    }
} catch {
    Write-Host " ERROR" -ForegroundColor Red
}

# Playwright MCP
Write-Host "Checking Playwright MCP..." -NoNewline
try {
    $pwMcp = npm list -g @playwright/mcp-server 2>&1
    if ($pwMcp -match "@playwright/mcp-server") {
        Write-Host " OK" -ForegroundColor Green
        $report.Optional["Playwright MCP"] = @{ Status = "Installed" }
    } else {
        Write-Host " NOT FOUND" -ForegroundColor Yellow
        $report.Optional["Playwright MCP"] = @{ Status = "Not Installed" }
    }
} catch {
    Write-Host " ERROR" -ForegroundColor Red
}

Write-Host ""
Write-Host "Diagram Tools:" -ForegroundColor Cyan
Write-Host "--------------" -ForegroundColor Cyan

# PlantUML
Write-Host "Checking PlantUML..." -NoNewline
if (Test-Path "C:\tools\plantuml\plantuml.jar") {
    Write-Host " OK" -ForegroundColor Green
    $report.Optional["PlantUML"] = @{ Status = "Installed", Path = "C:\tools\plantuml\plantuml.jar" }
} else {
    Write-Host " NOT FOUND" -ForegroundColor Yellow
    $report.Optional["PlantUML"] = @{ Status = "Not Installed" }
}

# Mermaid CLI
Test-Command -Name "Mermaid CLI" -Command "mmdc" -VersionArg "--version" -Category "Optional"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Verification Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Count installed tools
$requiredInstalled = ($report.Required.Values | Where-Object { $_.Status -eq "Installed" }).Count
$requiredTotal = $report.Required.Count
$optionalInstalled = ($report.Optional.Values | Where-Object { $_.Status -eq "Installed" }).Count
$optionalTotal = $report.Optional.Count

Write-Host "Required Tools: $requiredInstalled/$requiredTotal installed" -ForegroundColor $(if($requiredInstalled -eq $requiredTotal){"Green"}else{"Yellow"})
Write-Host "Optional Tools: $optionalInstalled/$optionalTotal installed" -ForegroundColor Cyan

if ($report.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "ERRORS ($($report.Errors.Count)):" -ForegroundColor Red
    $report.Errors | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Red
    }
}

if ($report.Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings ($($report.Warnings.Count)):" -ForegroundColor Yellow
    $report.Warnings | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Yellow
    }
}

# Save report
$reportPath = "artifacts\02-metrics\environment-verification.json"
New-Item -ItemType Directory -Force -Path (Split-Path $reportPath) | Out-Null
$report | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8

Write-Host ""
Write-Host "Full report saved to: $reportPath" -ForegroundColor Cyan
Write-Host ""

# Exit code
if ($report.Errors.Count -gt 0) {
    Write-Host "Verification FAILED - required tools missing" -ForegroundColor Red
    exit 1
} else {
    Write-Host "Verification PASSED - all required tools installed" -ForegroundColor Green
    exit 0
}
```

## Running Verification

### Basic Verification

```powershell
# From scripts directory
cd docs\ai\legacy_analysis\scripts

# Run verification
.\verification-scripts.ps1

# With verbose output
.\verification-scripts.ps1 -Verbose
```

### Expected Output

```
==================================================
   Legacy Analysis Environment Verification
==================================================

Checking PowerShell version... OK (v7.4.0)

Required Tools:
----------------
Checking dotnet SDK... OK
Checking Git... OK
Checking Java... OK
Checking Node.js... OK
Checking npm... OK

Optional Enhancement Tools:
---------------------------
Checking cloc... OK
Checking Pandoc... OK
Checking Gitleaks... OK
Checking TruffleHog... NOT FOUND
Checking Graphviz... OK

... (more output) ...

==================================================
   Verification Summary
==================================================

Required Tools: 5/5 installed
Optional Tools: 12/15 installed

Warnings (3):
  - TruffleHog is optional but not found (enhanced features disabled)
  - Maven is optional but not found (enhanced features disabled)
  - Gradle is optional but not found (enhanced features disabled)

Full report saved to: artifacts\02-metrics\environment-verification.json

Verification PASSED - all required tools installed
```

## Output Report Format

The verification script generates `artifacts/02-metrics/environment-verification.json`:

```json
{
  "Required": {
    "dotnet SDK": {
      "Status": "Installed",
      "Path": "C:\\Program Files\\dotnet\\dotnet.exe",
      "Version": "8.0.100"
    },
    "Git": {
      "Status": "Installed",
      "Path": "C:\\Program Files\\Git\\cmd\\git.exe",
      "Version": "git version 2.42.0"
    }
  },
  "Optional": {
    "cloc": {
      "Status": "Installed",
      "Path": "C:\\tools\\cloc\\cloc.exe",
      "Version": "cloc 2.02"
    },
    "TruffleHog": {
      "Status": "Not Installed"
    }
  },
  "Warnings": [
    "TruffleHog is optional but not found (enhanced features disabled)"
  ],
  "Errors": []
}
```

## Integration with Analysis Process

### Step 02: Environment Setup

After installing tools, run verification:

```powershell
# Install all tools
# ... (installation steps) ...

# Verify installation
.\docs\ai\legacy_analysis\scripts\verification-scripts.ps1

# If verification passes, proceed to Step 03
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Verify Environment
  run: |
    pwsh {ANALYSIS_ROOT}/scripts/verification-scripts.ps1

- name: Upload Verification Report
  uses: actions/upload-artifact@v3
  with:
    name: environment-verification
    path: artifacts/02-metrics/environment-verification.json
```

## Troubleshooting

### All Checks Fail

**Issue**: All tool checks fail with "Command not found"

**Solution**:
1. Restart PowerShell/terminal after installation
2. Verify PATH environment variable: `$env:Path`
3. Re-run installers with "Add to PATH" option

### Java Check Fails

**Issue**: Java installed but check fails

**Solution**:
- Ensure `JAVA_HOME` is set
- Verify: `java -version` in new terminal

### MCP Servers Not Found

**Issue**: npm global packages not detected

**Solution**:
- Check global npm path: `npm config get prefix`
- Reinstall: `npm install -g <package>`

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Backend .NET Setup](backend-dotnet.md)
- [Diagram Tools Setup](diagram-tools.md)
- [MCP Servers Setup](mcp-servers.md)
- [Utility cloc Setup](utility-cloc.md)
- [Utility Pandoc Setup](utility-pandoc.md)
- [Utility Gitleaks Setup](utility-gitleaks.md)
- [Utility TruffleHog Setup](utility-trufflehog.md)

## Best Practices

1. **Run verification after every tool installation**
2. **Save verification reports** with timestamps for audit trail
3. **Re-run verification** after system updates or reboots
4. **Include in CI/CD** to ensure consistent environments
5. **Review warnings** - optional tools provide valuable features
