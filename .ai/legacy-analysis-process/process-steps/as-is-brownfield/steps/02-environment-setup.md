# Step 02: Environment Setup & Tool Installation

**Duration**: 30-60 minutes (varies by tech stack)
**Prerequisites**: Admin access, internet connection
**Output**: All static analysis tools installed and verified

---

## Overview

This step installs all deterministic static analysis tools required for legacy code scanning. These tools provide machine-readable JSON/SARIF output that can be processed by LLMs.

**Key Principle**: LLMs struggle with "discovery" in massive codebases. Static analysis tools perform discovery reliably without hallucination.

### Record Step Start Time

**PowerShell**:
```powershell
# Record this step's start time for timing tracker
$Step02StartTime = Get-Date
```

**Bash/sh**:
```bash
# Record this step's start time for timing tracker
STEP_02_START=$(date -Iseconds)
```

### Documentation Structure

This is a **hybrid documentation approach**:
- **This file**: Quick reference, decision tree, and verification
- **Detailed guides**: Complete installation instructions in [02-tool-setup-guides/](02-tool-setup-guides/) folder

---

## â›” PREREQUISITE CHECK: Analysis Scope Selection

**MANDATORY**: Before installing any tools, verify the user's analysis scope selection from Step 01.

### AI Agent: Check Analysis Scope First

```powershell
# PowerShell - Check for analysis scope file
if (Test-Path "work/01-reconnaissance/ANALYSIS-SCOPE.md") {
    $content = Get-Content "work/01-reconnaissance/ANALYSIS-SCOPE.md" -Raw
    if ($content -match "Selected Mode:\s*CODE-ONLY") {
        Write-Host "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”" -ForegroundColor Cyan
        Write-Host "ðŸ” CODE-ONLY MODE SELECTED" -ForegroundColor Cyan
        Write-Host "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Skipping full environment setup." -ForegroundColor Yellow
        Write-Host "Only minimal tools (cloc, pandoc) will be installed." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "â†’ Proceed to: Step 02 Minimal Setup (below)" -ForegroundColor Green
    } else {
        Write-Host "ðŸ”¬ FULL ANALYSIS MODE SELECTED" -ForegroundColor Green
        Write-Host "Proceeding with full environment setup." -ForegroundColor White
    }
} else {
    Write-Host "âš ï¸ WARNING: Analysis scope not selected!" -ForegroundColor Red
    Write-Host "Go back to Step 01 and complete the Analysis Scope Selection." -ForegroundColor Red
}
```

```bash
# Bash - Check for analysis scope file
if [ -f "work/01-reconnaissance/ANALYSIS-SCOPE.md" ]; then
    if grep -q "Selected Mode:.*CODE-ONLY" "work/01-reconnaissance/ANALYSIS-SCOPE.md"; then
        echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
        echo "ðŸ” CODE-ONLY MODE SELECTED"
        echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
        echo "Skipping full environment setup."
        echo "Only minimal tools (cloc, pandoc) will be installed."
        echo "â†’ Proceed to: Step 02 Minimal Setup (below)"
    else
        echo "ðŸ”¬ FULL ANALYSIS MODE SELECTED"
        echo "Proceeding with full environment setup."
    fi
else
    echo "âš ï¸ WARNING: Analysis scope not selected!"
    echo "Go back to Step 01 and complete the Analysis Scope Selection."
fi
```

### If CODE-ONLY Mode: Skip to Minimal Setup

**If user selected CODE-ONLY in Step 01**, skip the full tool installation and use the minimal setup below:

#### Minimal Setup for CODE-ONLY Mode (15 minutes)

Only these tools are required for code-only analysis:

```powershell
# 1. cloc (code metrics) - REQUIRED
# Download from: https://github.com/AlDanial/cloc/releases
# Or via Chocolatey:
choco install cloc

# 2. Pandoc (documentation export) - REQUIRED
winget install JohnMacFarlane.Pandoc

# Verify installation
cloc --version
pandoc --version
```

**After minimal setup**, skip the rest of Step 02 and proceed directly to:
- **Skip**: Step 03 (Automated Discovery Scan) - not needed for CODE-ONLY
- **Skip**: Step 04 (AI Findings Analysis of scan results) - no scan results
- **Go to**: [05-component-analysis.md](05-component-analysis.md) - AI-powered code reading

**Update gate-tracking.md**:
- Mark Gate 1 as "âœ… Approved (CODE-ONLY mode - minimal setup)"
- Note that Steps 03-04 were skipped per user selection

---

### If FULL Mode: Continue with Full Setup

**If user selected FULL ANALYSIS in Step 01**, proceed with the complete environment setup below.

---

## â›” PREREQUISITE CHECK: Business Context Complete

**MANDATORY**: Before installing any tools, verify Step 01 business context is complete.

### AI Agent: Verify Documentation Inventory Exists

**Check 1**: File existence
```powershell
# PowerShell
if (-not (Test-Path "work/01-reconnaissance/DOCUMENTATION-INVENTORY.md")) {
    Write-Host "âŒ ERROR: Documentation Inventory missing!" -ForegroundColor Red
    Write-Host "You MUST complete Step 01 'Business Context First' section before Step 02." -ForegroundColor Red
    exit 1
}
```

```bash
# Bash
if [ ! -f "work/01-reconnaissance/DOCUMENTATION-INVENTORY.md" ]; then
    echo "âŒ ERROR: Documentation Inventory missing!"
    echo "You MUST complete Step 01 'Business Context First' section before Step 02."
    exit 1
fi
```

**Check 2**: File status
```powershell
# Read the file and check for "âœ… COMPLETE" status
$content = Get-Content "work/01-reconnaissance/DOCUMENTATION-INVENTORY.md" -Raw
if ($content -notmatch "Status.*:.*âœ… COMPLETE") {
    Write-Host "âš ï¸ WARNING: Documentation Inventory status is not 'âœ… COMPLETE'" -ForegroundColor Yellow
    Write-Host "Have you finished the business context dialogue with the user?" -ForegroundColor Yellow
    Write-Host "Go back to Step 01 and complete the 'Business Context First' section." -ForegroundColor Yellow
    exit 1
}
```

### If Check Fails: STOP

**If either check fails, you MUST**:

1. **Stop** - Do NOT proceed to tool installation
2. **Message user**:
   ```
   â›” PREREQUISITE NOT MET

   I cannot proceed to Step 02 (Tool Installation) because Step 01 (Business Context) is incomplete.

   Required:
   - File: work/01-reconnaissance/DOCUMENTATION-INVENTORY.md
   - Status: Must show "âœ… COMPLETE"

   Please:
   1. Go back to Step 01
   2. Complete the "ðŸ›‘ STOP: BUSINESS CONTEXT FIRST" section
   3. Answer the business documentation questions
   4. Create the Documentation Inventory file
   5. Then return here to Step 02

   Current status: {what you found or didn't find}
   ```
3. **Wait for user** to confirm Step 01 is complete

### If Check Passes: Continue

If both checks pass, proceed to the next prerequisite check below.

---

## â›” PREREQUISITE CHECK: CODE-INVENTORY.md from Step 01

**MANDATORY**: This file MUST exist before proceeding. It contains the technology stack information needed for tool selection.

### AI Agent: Verify CODE-INVENTORY.md Exists

```powershell
# PowerShell - Check for CODE-INVENTORY.md
$codeInventory = "work/01-reconnaissance/CODE-INVENTORY.md"
if (-not (Test-Path $codeInventory)) {
    Write-Host "âŒ CRITICAL: CODE-INVENTORY.md not found!" -ForegroundColor Red
    Write-Host "   Expected: $codeInventory" -ForegroundColor Red
    Write-Host "   Action: Complete Step 01 first - CODE-INVENTORY.md is created during codebase reconnaissance." -ForegroundColor Yellow
    exit 1
}
Write-Host "âœ… CODE-INVENTORY.md found" -ForegroundColor Green
```

```bash
# Bash - Check for CODE-INVENTORY.md
CODE_INVENTORY="work/01-reconnaissance/CODE-INVENTORY.md"
if [ ! -f "$CODE_INVENTORY" ]; then
    echo "âŒ CRITICAL: CODE-INVENTORY.md not found"
    echo "   Expected: $CODE_INVENTORY"
    echo "   Action: Complete Step 01 first - CODE-INVENTORY.md is created during codebase reconnaissance."
    exit 1
fi
echo "âœ… CODE-INVENTORY.md found"
```

### If Check Fails: STOP

**If CODE-INVENTORY.md is missing, you MUST**:

1. **Stop** - Do NOT proceed to tool installation
2. **Message user**:
   ```
   â›” PREREQUISITE NOT MET

   I cannot proceed to Step 02 (Tool Installation) because CODE-INVENTORY.md from Step 01 is missing.

   This file contains critical information:
   - Technology Stack Summary (which technologies are in the codebase)
   - File Type Distribution (counts by file extension)
   - Critical Dependencies (versions, risk levels)

   Please:
   1. Go back to Step 01
   2. Complete the codebase reconnaissance
   3. Ensure CODE-INVENTORY.md is created at: work/01-reconnaissance/CODE-INVENTORY.md
   4. Then return here to Step 02
   ```
3. **Wait for user** to confirm Step 01 is complete

### If All Prerequisite Checks Pass: Continue

If all three prerequisite checks pass (ANALYSIS-SCOPE.md, DOCUMENTATION-INVENTORY.md, CODE-INVENTORY.md), proceed to tool installation below.

---

## CRITICAL: When to STOP and Ask for Human Help

**LLM agents MUST stop and request human intervention** when encountering these errors. Do NOT attempt automated workarounds.

### Errors Requiring Human Intervention

| Error | Meaning | Human Action Required |
|-------|---------|----------------------|
| `MSB3644: reference assemblies for .NETFramework,Version=v4.7.2 were not found` | .NET Framework Developer Pack not installed | Human must install from https://aka.ms/msbuild/developerpacks |
| `Failed to find MSBuild path` | Visual Studio or Build Tools not installed | Human must install Visual Studio 2022 or Build Tools |
| `The ASP.NET compiler is only available on .NET Framework version of MSBuild` | Cannot use `dotnet build` for legacy Web Site projects | Human must use Visual Studio Developer Command Prompt |
| `Invoke-WebRequest: Not Found` (404) | Download URL is invalid/outdated | Human must find correct download URL |
| `Java/JDK not found` | Java not installed | Human must install Java JDK 11+ |
| `Access denied` / `Administrator required` | Insufficient permissions | Human must run as Administrator |

### What LLM Agent Should Do

```markdown
## âš ï¸ HUMAN INTERVENTION REQUIRED

I encountered an error that requires manual installation:

**Error**: {exact error message}

**What you need to do**:
1. {specific action, e.g., "Install .NET Framework 4.7.2 Developer Pack"}
2. {download link if applicable}
3. {verification command to run after}

**After completing the above**, reply "continue" and I will resume the analysis.

**Alternative**: Skip this tool and proceed with AI-only analysis (Quick Path).
```

### Do NOT:
- âŒ Keep retrying the same failing command
- âŒ Try to "fix" missing SDK/runtime installations via PowerShell
- âŒ Download random versions hoping one works
- âŒ Proceed without the required tools as if they worked

### DO:
- âœ… Stop immediately when hitting infrastructure errors
- âœ… Clearly explain what failed and why
- âœ… Provide exact steps for human to fix
- âœ… Offer to skip to AI-only path if tools cannot be installed

---

## Technology Detection from CODE-INVENTORY.md

**âš ï¸ CRITICAL**: Use **KEYWORD SEARCH** in CODE-INVENTORY.md to determine required tools.

**Why Keyword Search?** CODE-INVENTORY.md from Step 01 contains explicit technology names (e.g., "Oracle (PL/SQL)", "Java 8, Spring MVC") that eliminate ambiguity. File extensions like `.sql` and `.js` are ambiguous - they're used by multiple technologies.

### Phase 1: Keyword Search in CODE-INVENTORY.md (PRIMARY)

Search the **Technology Stack Summary**, **Critical Dependencies**, and **Architecture Pattern** sections:

```bash
# Bash - Keyword search in CODE-INVENTORY.md
CODE_INVENTORY="work/01-reconnaissance/CODE-INVENTORY.md"

echo "=== Searching CODE-INVENTORY.md for technology keywords ==="

# Backend
grep -i "java\|spring\|maven" "$CODE_INVENTORY" && echo "â†’ Java detected: Install backend-java.md"
grep -i "\.net\|c#\|asp\.net" "$CODE_INVENTORY" && echo "â†’ .NET detected: Install backend-dotnet.md"
grep -i "python\|django\|flask" "$CODE_INVENTORY" && echo "â†’ Python detected: Install backend-python.md"
grep -i "kotlin" "$CODE_INVENTORY" && echo "â†’ Kotlin detected: Install backend-kotlin.md"
grep -i "node\.js\|express\|fastify" "$CODE_INVENTORY" && echo "â†’ Node.js detected: Install backend-nodejs.md"

# Database
grep -i "oracle\|pl/sql\|plsql" "$CODE_INVENTORY" && echo "â†’ Oracle detected: Install legacy-plsql.md"
grep -i "sql server\|t-sql\|mssql" "$CODE_INVENTORY" && echo "â†’ SQL Server detected: No guide (use TSQLLint)"
grep -i "postgresql\|postgres" "$CODE_INVENTORY" && echo "â†’ PostgreSQL detected: No guide (use pgFormatter)"

# Frontend
grep -i "react\|jsx\|redux" "$CODE_INVENTORY" && echo "â†’ React detected: Install frontend-react.md"
grep -i "vue\|vuex" "$CODE_INVENTORY" && echo "â†’ Vue detected: Install frontend-vue.md"
grep -i "angular" "$CODE_INVENTORY" && echo "â†’ Angular detected: No guide (use Angular CLI)"
grep -i "nestjs" "$CODE_INVENTORY" && echo "â†’ NestJS detected: Install frontend-nestjs.md"

# Legacy
grep -i "coldfusion\|cfml" "$CODE_INVENTORY" && echo "â†’ ColdFusion detected: Install legacy-coldfusion.md"

echo "=== Keyword search complete ==="
```

```powershell
# PowerShell - Keyword search in CODE-INVENTORY.md
$codeInventory = "work/01-reconnaissance/CODE-INVENTORY.md"
$content = Get-Content $codeInventory -Raw

Write-Host "=== Searching CODE-INVENTORY.md for technology keywords ===" -ForegroundColor Cyan

# Backend
if ($content -match "(?i)java|spring|maven") { Write-Host "â†’ Java detected: Install backend-java.md" -ForegroundColor Green }
if ($content -match "(?i)\.net|c#|asp\.net") { Write-Host "â†’ .NET detected: Install backend-dotnet.md" -ForegroundColor Green }
if ($content -match "(?i)python|django|flask") { Write-Host "â†’ Python detected: Install backend-python.md" -ForegroundColor Green }
if ($content -match "(?i)kotlin") { Write-Host "â†’ Kotlin detected: Install backend-kotlin.md" -ForegroundColor Green }
if ($content -match "(?i)node\.js|express|fastify") { Write-Host "â†’ Node.js detected: Install backend-nodejs.md" -ForegroundColor Green }

# Database
if ($content -match "(?i)oracle|pl/sql|plsql") { Write-Host "â†’ Oracle detected: Install legacy-plsql.md" -ForegroundColor Green }
if ($content -match "(?i)sql server|t-sql|mssql") { Write-Host "â†’ SQL Server detected: No guide (use TSQLLint)" -ForegroundColor Yellow }
if ($content -match "(?i)postgresql|postgres") { Write-Host "â†’ PostgreSQL detected: No guide (use pgFormatter)" -ForegroundColor Yellow }

# Frontend
if ($content -match "(?i)react|jsx|redux") { Write-Host "â†’ React detected: Install frontend-react.md" -ForegroundColor Green }
if ($content -match "(?i)vue|vuex") { Write-Host "â†’ Vue detected: Install frontend-vue.md" -ForegroundColor Green }
if ($content -match "(?i)angular") { Write-Host "â†’ Angular detected: No guide (use Angular CLI)" -ForegroundColor Yellow }
if ($content -match "(?i)nestjs") { Write-Host "â†’ NestJS detected: Install frontend-nestjs.md" -ForegroundColor Green }

# Legacy
if ($content -match "(?i)coldfusion|cfml") { Write-Host "â†’ ColdFusion detected: Install legacy-coldfusion.md" -ForegroundColor Green }

Write-Host "=== Keyword search complete ===" -ForegroundColor Cyan
```

### Phase 2: File Extension Disambiguation (FALLBACK)

**Only use if keyword search finds NO matches** (rare - Step 01 usually captures explicit technology names).

For ambiguous extensions like `.sql` (Oracle vs SQL Server vs PostgreSQL) and `.js`/`.ts` (React vs Vue vs Node.js), run disambiguation:

**Database Disambiguation** (if `.sql` files exist but no keyword match):
```bash
# Check SQL file contents for database-specific syntax
SQL_FILES=$(find . -name "*.sql" | head -20)
grep -l "CREATE OR REPLACE PACKAGE\|DBMS_" $SQL_FILES && echo "â†’ Oracle PL/SQL"
grep -l "^GO$\|@@IDENTITY\|EXEC sp_" $SQL_FILES && echo "â†’ SQL Server T-SQL"
grep -l '\$\$\|CREATE EXTENSION' $SQL_FILES && echo "â†’ PostgreSQL"
```

**JavaScript Disambiguation** (if `.js`/`.ts` files exist but no keyword match):
```bash
# Check for framework-specific files
find . -name "*.jsx" -o -name "*.tsx" | head -1 && echo "â†’ React"
find . -name "*.vue" | head -1 && echo "â†’ Vue"
[ -f "package.json" ] && grep -q "@nestjs/core" package.json && echo "â†’ NestJS"
[ -f "package.json" ] && grep -q "express\|fastify" package.json && echo "â†’ Node.js backend"
```

**Output**: Use the detected technologies to select setup guides from the Tool Selection Matrix below.

---

## Tool Selection Matrix

Use this table to determine which tools to install based on detected technologies.

### Backend Languages

| Language/Framework | Files | Tool | Guide | Priority |
|--------------------|-------|------|-------|----------|
| .NET/C# | `*.cs` | Roslyn Analyzers + Security Code Scan | [backend-dotnet.md](02-tool-setup-guides/backend-dotnet.md) | Required |
| Python | `*.py` | pylint, bandit, mypy, ruff | [backend-python.md](02-tool-setup-guides/backend-python.md) | Required |
| Java | `*.java` | SpotBugs, PMD, Checkstyle | [backend-java.md](02-tool-setup-guides/backend-java.md) | Required |
| Kotlin | `*.kt` | detekt, ktlint | [backend-kotlin.md](02-tool-setup-guides/backend-kotlin.md) | Required |
| Node.js/TypeScript | `*.ts`, `*.js` | ESLint + TypeScript | [backend-nodejs.md](02-tool-setup-guides/backend-nodejs.md) | Required |

### Frontend Frameworks

| Framework | Files | Tool | Guide | Priority |
|-----------|-------|------|-------|----------|
| React | `*.jsx`, `*.tsx` | ESLint + React plugins | [frontend-react.md](02-tool-setup-guides/frontend-react.md) | Required |
| Vue | `*.vue` | ESLint + Vue plugin | [frontend-vue.md](02-tool-setup-guides/frontend-vue.md) | Required |
| NestJS | NestJS project structure | ESLint + NestJS config | [frontend-nestjs.md](02-tool-setup-guides/frontend-nestjs.md) | Required |

### Legacy Technologies

| Technology | Files | Tool | Guide | Priority |
|------------|-------|------|-------|----------|
| PL/SQL | `*.sql`, `*.pks`, `*.pkb` | PLSQLCop or SQL Developer | [legacy-plsql.md](02-tool-setup-guides/legacy-plsql.md) | Required |
| ColdFusion | `*.cfm`, `*.cfc` | CFLint | [legacy-coldfusion.md](02-tool-setup-guides/legacy-coldfusion.md) | Required |
| COBOL | `*.cbl`, `*.cob` | SonarQube COBOL (commercial) or GnuCOBOL | [backend-cobol.md](02-tool-setup-guides/backend-cobol.md) | Optional |

### Utility Tools (All Projects)

| Tool | Purpose | Guide | Priority | Consequence |
|------|---------|-------|----------|-------------|
| cloc | Code metrics extraction | [utility-cloc.md](02-tool-setup-guides/utility-cloc.md) | **MANDATORY** | Analysis cannot generate metrics without cloc |
| Pandoc | Markdown â†’ Word/PDF conversion | [utility-pandoc.md](02-tool-setup-guides/utility-pandoc.md) | **MANDATORY** | Word/PDF deliverables cannot be generated without Pandoc |
| Gitleaks | Advanced secret detection | [utility-gitleaks.md](02-tool-setup-guides/utility-gitleaks.md) | Recommended | Improves security analysis quality |
| TruffleHog | Secret verification | [utility-trufflehog.md](02-tool-setup-guides/utility-trufflehog.md) | Optional | Enhancement for secret scanning |

### Infrastructure Tools (All Projects)

| Tool | Purpose | Guide | Priority | Consequence |
|------|---------|-------|----------|-------------|
| MCP Servers | Knowledge Graph, Context7, Playwright | [mcp-servers.md](02-tool-setup-guides/mcp-servers.md) | **MANDATORY** | Required for contextual documentation and testing |
| Diagram Tools | PlantUML + Mermaid for architecture diagrams | [diagram-tools.md](02-tool-setup-guides/diagram-tools.md) | **MANDATORY** | Word document build cannot succeed without diagram rendering tools |
| Verification Scripts | Automated tool verification | [verification-scripts.md](02-tool-setup-guides/verification-scripts.md) | **MANDATORY** | Ensures all required tools are correctly installed |

---

## â›” MANDATORY: Follow Setup Guides for Each Detected Technology

**â›” CRITICAL**: For EACH technology detected in CODE-INVENTORY.md, you MUST:

1. **READ** the full setup guide: `02-tool-setup-guides/{guide}.md`
2. **EXECUTE** ALL installation commands in the guide
3. **VERIFY** each tool using verification commands from the guide
4. **LOG** results to `work/02-environment/TOOL-INSTALLATION-LOG.md`

### Why This Is Non-Negotiable

The "Quick Start" section below provides ABBREVIATED commands only. These are:
- âŒ **Incomplete** - missing prerequisite checks
- âŒ **Unverified** - no verification commands
- âŒ **Context-free** - no explanation of what each tool does

The detailed setup guides (`02-tool-setup-guides/*.md`) provide:
- âœ… **Complete** installation instructions
- âœ… **Prerequisites** - what must be installed first
- âœ… **Verification commands** - how to confirm tool works
- âœ… **Troubleshooting** - common errors and fixes
- âœ… **Configuration** - how to configure for legacy analysis

### Tool Installation Log Format

Create `work/02-environment/TOOL-INSTALLATION-LOG.md`:

```markdown
# Tool Installation Log

**Date**: {date}
**Step**: 02 - Environment Setup

## Technologies Detected (from CODE-INVENTORY.md)

- Java (12,067 files) â†’ backend-java.md
- Oracle PL/SQL (1,931 files) â†’ legacy-plsql.md

## Installation Results

### Backend: Java Tools

| Tool | Version | Status | Verification Command | Output |
|------|---------|--------|---------------------|--------|
| SpotBugs | 4.7.3 | âœ… Installed | `spotbugs -version` | "4.7.3" |
| PMD | 6.55.0 | âœ… Installed | `pmd --version` | "PMD 6.55.0" |
| Checkstyle | 10.12 | âœ… Installed | `java -jar checkstyle.jar --version` | "10.12" |

### Database: Oracle PL/SQL Tools

| Tool | Version | Status | Verification Command | Output |
|------|---------|--------|---------------------|--------|
| ZPA | 3.4.0 | âœ… Installed | `zpa-cli --version` | "3.4.0" |

### Utility Tools (Required for All)

| Tool | Version | Status | Verification Command | Output |
|------|---------|--------|---------------------|--------|
| cloc | 1.96 | âœ… Installed | `cloc --version` | "1.96" |
| Pandoc | 3.1.9 | âœ… Installed | `pandoc --version` | "3.1.9" |

## Summary

- **Total Technologies**: 2
- **Tools Installed**: 6
- **Tools Failed**: 0
- **Ready for Step 03**: âœ… YES
```

### Do NOT Proceed to Step 03 Until

- [ ] ALL detected technologies have their tools installed
- [ ] ALL tool installations are VERIFIED using verification commands
- [ ] `work/02-environment/TOOL-INSTALLATION-LOG.md` is created with complete results
- [ ] NO "âš ï¸ Failed" entries in the installation log (or documented as intentional skip)

---

## Quick Start Installation (ABBREVIATED - Use Setup Guides Instead)

### Step 1: Install Core Prerequisites

**All projects need these**:

```powershell
# 1. Git (if not installed)
winget install Git.Git

# 2. Node.js 16+ (for MCP servers and Mermaid CLI)
winget install OpenJS.NodeJS

# 3. Java 11+ (for PlantUML)
winget install EclipseAdoptium.Temurin.11

# 4. Python 3.7+ (for Documentation Generation scripts)
winget install Python.Python.3

# Restart terminal after installation
```

### Step 2: Install Technology-Specific Tools

Based on tech stack detection, follow the relevant guides:

**For .NET projects**:
```powershell
# See detailed guide: 02-tool-setup-guides/backend-dotnet.md
dotnet tool install --global security-scan
```

**For Python projects**:
```bash
# See detailed guide: 02-tool-setup-guides/backend-python.md
pip install pylint bandit mypy ruff
```

**For Java projects**:
```bash
# See detailed guide: 02-tool-setup-guides/backend-java.md
# Add Maven/Gradle plugins to pom.xml or build.gradle
```

**For React projects**:
```bash
# See detailed guide: 02-tool-setup-guides/frontend-react.md
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
```

**For PL/SQL projects**:
```bash
# See detailed guide: 02-tool-setup-guides/legacy-plsql.md
# Download PLSQLCop or use SQL Developer
```

### Step 3: Install Utility Tools

```powershell
# cloc (code metrics) - REQUIRED
# See: 02-tool-setup-guides/utility-cloc.md
# Windows: Download from https://github.com/AlDanial/cloc/releases
# Linux/macOS: sudo apt-get install cloc / brew install cloc

# Pandoc (documentation) - REQUIRED
# See: 02-tool-setup-guides/utility-pandoc.md
winget install JohnMacFarlane.Pandoc

# Gitleaks (secrets) - OPTIONAL
# See: 02-tool-setup-guides/utility-gitleaks.md
choco install gitleaks

# TruffleHog (secrets with verification) - OPTIONAL
# See: 02-tool-setup-guides/utility-trufflehog.md
scoop install trufflehog
```

### Step 4: Install Infrastructure Tools

```powershell
# MCP Servers - REQUIRED
# See: 02-tool-setup-guides/mcp-servers.md
npm install -g @modelcontextprotocol/server-knowledge-graph
npm install -g @context7/mcp-server

# Diagram Tools & Documentation Generation - REQUIRED
# See: 02-tool-setup-guides/diagram-tools.md for details

# Prerequisites for automated documentation workflow:
# 1. Node.js (for Mermaid rendering via npx)
winget install OpenJS.NodeJS

# 2. Python 3.7+ (for diagram rendering script)
winget install Python.Python.3

# 3. Pandoc (for DOCX generation)
winget install JohnMacFarlane.Pandoc

# 4. Verify Chromium for Mermaid (installed automatically on first run)
npx -y @mermaid-js/mermaid-cli --version

# Note: PlantUML uses public server - no local JAR needed
# Automated script location: docs/ai/legacy_analysis/scripts/render_diagrams_for_doc.py
# Usage: python docs/ai/legacy_analysis/scripts/render_diagrams_for_doc.py
# Output: docs/ai/legacy_analysis/arch-as-is/AS-IS-ARCHITECTURE-COMPLETE.docx
```

### Step 5: Verify Installation

```powershell
# Run verification script
# See: 02-tool-setup-guides/verification-scripts.md
.\docs\ai\legacy_analysis\scripts\verification-scripts.ps1
```

---

## Installation Guides

All detailed installation instructions, configuration, troubleshooting, and verification steps are in separate guides:

### Backend Languages
- [.NET/C# Static Analysis Setup](02-tool-setup-guides/backend-dotnet.md)
- [Python Static Analysis Setup](02-tool-setup-guides/backend-python.md)
- [Java Static Analysis Setup](02-tool-setup-guides/backend-java.md)
- [Kotlin Static Analysis Setup](02-tool-setup-guides/backend-kotlin.md)
- [Node.js/TypeScript Static Analysis Setup](02-tool-setup-guides/backend-nodejs.md)
- [COBOL Static Analysis Setup](02-tool-setup-guides/backend-cobol.md)

### Frontend Frameworks
- [React Static Analysis Setup](02-tool-setup-guides/frontend-react.md)
- [Vue.js Static Analysis Setup](02-tool-setup-guides/frontend-vue.md)
- [NestJS Static Analysis Setup](02-tool-setup-guides/frontend-nestjs.md)

### Legacy Technologies
- [PL/SQL Static Analysis Setup](02-tool-setup-guides/legacy-plsql.md)
- [ColdFusion Static Analysis Setup](02-tool-setup-guides/legacy-coldfusion.md)

### Utility Tools
- [cloc (Code Metrics) Setup](02-tool-setup-guides/utility-cloc.md)
- [Pandoc (Documentation) Setup](02-tool-setup-guides/utility-pandoc.md)
- [Gitleaks (Secret Scanning) Setup](02-tool-setup-guides/utility-gitleaks.md)
- [TruffleHog (Secret Verification) Setup](02-tool-setup-guides/utility-trufflehog.md)

### Infrastructure Tools
- [MCP Servers Setup](02-tool-setup-guides/mcp-servers.md)
- [Diagram Tools (PlantUML + Mermaid) Setup](02-tool-setup-guides/diagram-tools.md)
- [Verification Scripts](02-tool-setup-guides/verification-scripts.md)

---

## Verification Checklist

Before proceeding to Step 03, verify all required tools are working:

### Core Prerequisites
- [ ] Git: `git --version` returns version
- [ ] Node.js: `node --version` returns v16+
- [ ] npm: `npm --version` returns version
- [ ] Java: `java -version` returns JDK 11+

### Technology-Specific Tools

**Backend** (based on detected stack):
- [ ] .NET: `dotnet --version` returns version
- [ ] .NET: `security-scan --version` returns version (if using)
- [ ] Python: `python --version` returns version
- [ ] Python: `pylint --version` returns version (if using)
- [ ] Java: `mvn --version` OR `gradle --version` returns version (if using)
- [ ] Node.js: `npx eslint --version` returns version (if using)

**Frontend** (based on detected stack):
- [ ] React: `npx eslint --version` + React plugins installed
- [ ] Vue: `npx eslint --version` + Vue plugin installed
- [ ] NestJS: `npx eslint --version` + TypeScript config

**Legacy** (based on detected stack):
- [ ] PL/SQL: `plsqlcop --version` OR SQL Developer installed
- [ ] ColdFusion: `box version` returns version
- [ ] COBOL: `cobc --version` OR SonarQube configured

### Utility Tools (Required for All)
- [ ] cloc: `cloc --version` returns version
- [ ] Pandoc: `pandoc --version` returns version

### Infrastructure Tools (Required for All)
- [ ] Python: `python --version` returns 3.7+ (for diagram rendering script)
- [ ] Node.js: `node --version` returns 16+ (for Mermaid via npx)
- [ ] Mermaid: `npx -y @mermaid-js/mermaid-cli --version` returns version
- [ ] PlantUML: Internet connection (uses cloud server, no local JAR needed)
- [ ] Documentation script: `python docs/ai/legacy_analysis/scripts/render_diagrams_for_doc.py` runs successfully
- [ ] MCP: npm list confirms `@modelcontextprotocol/server-knowledge-graph` installed
- [ ] MCP: npm list confirms `@context7/mcp-server` installed

### Automated Verification

**Run the verification script** (see [verification-scripts.md](02-tool-setup-guides/verification-scripts.md)):

```powershell
.\docs\ai\legacy_analysis\scripts\verification-scripts.ps1

# Expected output:
# ==================================================
#    Legacy Analysis Environment Verification
# ==================================================
#
# Required Tools: 5/5 installed âœ“
# Optional Tools: 12/15 installed âœ“
#
# Verification PASSED - all required tools installed
```

**If verification fails**:
1. Review error messages in console output
2. Check [environment-verification.json](../../../work/02-metrics/environment-verification.json) for details
3. Consult relevant setup guide for troubleshooting
4. Re-run verification after fixes

---

## Common Issues and Solutions

### General Issues

**Issue**: Commands not found after installation
**Solution**: Restart terminal/PowerShell session to reload PATH

**Issue**: Permission denied errors
**Solution**: Run PowerShell/terminal as Administrator

**Issue**: Network/proxy errors during downloads
**Solution**: Configure proxy settings or download manually

### Language-Specific Issues

**See detailed troubleshooting in each setup guide**:
- [.NET troubleshooting](02-tool-setup-guides/backend-dotnet.md#common-issues)
- [Python troubleshooting](02-tool-setup-guides/backend-python.md#common-issues)
- [Java troubleshooting](02-tool-setup-guides/backend-java.md#common-issues)
- [React troubleshooting](02-tool-setup-guides/frontend-react.md#common-issues)
- [PL/SQL troubleshooting](02-tool-setup-guides/legacy-plsql.md#common-issues)
- [ColdFusion troubleshooting](02-tool-setup-guides/legacy-coldfusion.md#common-issues)

### Tool-Specific Issues

**Diagram tools not rendering**:
- PlantUML: See [diagram-tools.md#troubleshooting](02-tool-setup-guides/diagram-tools.md#troubleshooting)
- Mermaid: See [diagram-tools.md#troubleshooting](02-tool-setup-guides/diagram-tools.md#troubleshooting)

**MCP servers not connecting**:
- See [mcp-servers.md#troubleshooting](02-tool-setup-guides/mcp-servers.md#troubleshooting)

**Secret scanners too slow**:
- Gitleaks: See [utility-gitleaks.md#common-issues](02-tool-setup-guides/utility-gitleaks.md#common-issues)
- TruffleHog: See [utility-trufflehog.md#common-issues](02-tool-setup-guides/utility-trufflehog.md#common-issues)

---

## Scripts Overview

All analysis scripts are in `{ANALYSIS_ROOT}/scripts/`:

| Script | Purpose | Dependencies |
|--------|---------|--------------|
| `scan-secrets.ps1` | Detect secrets in code | PowerShell (built-in), Gitleaks (optional), TruffleHog (optional) |
| `extract-metrics.ps1` | Extract code metrics | cloc, .NET SDK |
| `classify-content.ps1` | Generate classification report | PowerShell (built-in) |
| `Generate-DocFromMarkdown.ps1` | Convert markdown to Word/PDF | Pandoc |
| `verification-scripts.ps1` | Verify all tool installations | All tools |

**See**: [scripts/README.md](../../../scripts/README.md) for detailed usage

---

## Step Output: Environment Setup Summary

**IMPORTANT**: After completing this step, document your findings.

### Required Output Template

```markdown
# Step 02 Findings: Environment Setup

## Status: [COMPLETE | PARTIAL | BLOCKED]

## Installed Tools

### Backend Tools
| Tool | Status | Version | Notes |
|------|--------|---------|-------|
| {tool name} | Installed/Skipped | {version} | {any issues} |

### Frontend Tools
| Tool | Status | Version | Notes |
|------|--------|---------|-------|
| {tool name} | Installed/Skipped | {version} | {any issues} |

### Utility Tools
| Tool | Status | Version | Notes |
|------|--------|---------|-------|
| cloc | Installed | {version} | **MANDATORY** |
| Pandoc | Installed | {version} | **MANDATORY** |
| Gitleaks | Installed/Skipped | {version} | Recommended |

### Infrastructure Tools
| Tool | Status | Version | Notes |
|------|--------|---------|-------|
| PlantUML | Installed | {version} | **MANDATORY** |
| Mermaid CLI | Installed | {version} | **MANDATORY** |
| MCP Servers | Installed | {list} | **MANDATORY** |

## Verification Results

- [ ] All required tools verified successfully
- [ ] Test run of each tool produces valid output
- [ ] Diagram tools render test diagrams successfully
- [ ] MCP servers connect successfully

## Issues Encountered

| Issue | Resolution | Time Spent |
|-------|------------|------------|
| {description} | {how resolved} | {minutes} |

## Skipped Tools (with Justification)

| Tool | Reason Skipped | Alternative |
|------|---------------|-------------|
| {tool name} | {why not needed} | {alternative approach} |

## Environment Configuration

**Operating System**: {Windows 10/11, Linux distro, macOS version}
**Shell**: {PowerShell 7.x, Bash 5.x}
**Total Setup Time**: {minutes}

## Recommendations

1. {any setup improvements for next time}
2. {tools that should be added to the standard setup}
3. {documentation clarifications needed}
```

---

# â›” MANDATORY HUMAN REVIEW GATE #1

**STOP**: You MUST NOT proceed beyond this section without explicit human approval.

## Why This Gate Exists

This gate ensures:
1. **Analysis scope is confirmed** - User understands time commitment
2. **Tool installation is validated** - Configuration errors caught early
3. **Human approves before investing hours** - No wasted effort

## What Human Must Review

### 1. Analysis Scope Selection (CRITICAL)

**File**: [ANALYSIS-SCOPE.md](../../../work/01-reconnaissance/ANALYSIS-SCOPE.md)

Verify user selected one of:
- **CODE-ONLY** (1-2 hours): Minimal tools, skip Steps 03-04, proceed to Step 05
- **FULL ANALYSIS** (4-8 hours): Full tool suite, run all steps

**If CODE-ONLY was selected**:
- Skip the environment verification below
- Verify only cloc and pandoc are installed
- Mark Gate 1 as "Approved (CODE-ONLY mode)"
- Proceed directly to Step 05 (Component Analysis)

**If FULL ANALYSIS was selected**:
- Continue with full environment verification below

### 2. Environment Verification Report (FULL MODE ONLY)

**File**: [environment-verification.json](../../../work/02-metrics/environment-verification.json)
   - All required tools status (dotnet, git, java, node, npm)
   - Optional tools status (cloc, pandoc, gitleaks, etc.)
   - Any errors or warnings

### 3. MCP Servers Status (FULL MODE ONLY)

Verify MCP servers are running:
   - Knowledge Graph MCP
   - Context7 MCP
   - Playwright MCP (if needed)

### 4. Tech Stack Coverage (FULL MODE ONLY)

Confirm setup covers detected tech stack:
   - All detected languages have static analysis tools installed
   - All required diagram tools are available

### 5. Time Warning Acknowledgment

**User must acknowledge**:
- CODE-ONLY: "I understand this will take approximately 1-2 hours"
- FULL: "I understand this will take approximately 4-8 hours and may encounter setup blockers"

## Required AI Agent Action

**YOU MUST perform these steps IN ORDER**:

1. **Generate verification report** by running:
   ```powershell
   .\docs\ai\legacy_analysis\scripts\verification-scripts.ps1
   ```

2. **Count tool installation status**:
   - Required tools installed: X/Y
   - Optional tools installed: X/Y
   - Tools with errors: list them

3. **Update gate-tracking.md**:
   - Set Gate 1 status to "â¸ï¸ Blocked"
   - Add log entry with timestamp and verification summary

4. **Use AskUserQuestion tool** with options based on analysis mode:

   **For CODE-ONLY mode** (user selected in Step 01):
   ```
   Question: "CODE-ONLY mode selected. Minimal setup complete (cloc, pandoc). Please review:

   - [ANALYSIS-SCOPE.md](work/01-reconnaissance/ANALYSIS-SCOPE.md) - Selected analysis mode
   - [DOCUMENTATION-INVENTORY.md](work/01-reconnaissance/DOCUMENTATION-INVENTORY.md) - Available documentation

   Ready to proceed with AI-powered code analysis. This will take approximately 1-2 hours. Proceed?"

   Header: "Gate 1: Code Analysis"

   Options:
   - Label: "âœ… PROCEED - Start code-only analysis"
     Description: "Skip Steps 03-04. Go directly to Step 05 (Component Analysis) using AI code reading."

   - Label: "ðŸ”„ SWITCH TO FULL - Want comprehensive analysis"
     Description: "I have time for 4-8 hours and want full tool-based analysis with build verification."

   - Label: "â¸ï¸ PAUSE - Not ready yet"
     Description: "Cancel analysis for now. I'll return when ready."
   ```

   **For FULL mode** (user selected in Step 01):
   ```
   Question: "FULL ANALYSIS mode selected. Environment setup verification complete. Please review:

   - [environment-verification.json](work/02-metrics/environment-verification.json) - Tool installation status
   - [ANALYSIS-SCOPE.md](work/01-reconnaissance/ANALYSIS-SCOPE.md) - Selected analysis mode

   This comprehensive analysis will take approximately 4-8 hours. Proceed?"

   Header: "Gate 1: Full Analysis"

   Options:
   - Label: "âœ… CONTINUE - All tools verified, proceed"
     Description: "All required tools installed. Ready to run static analysis scans and build verification."

   - Label: "ðŸ”„ SWITCH TO CODE-ONLY - Less time available"
     Description: "Switch to quick 1-2 hour code-only analysis. Skip build and static analysis tools."

   - Label: "â¸ï¸ PAUSE - Fix tool issues first"
     Description: "Tool installation has critical errors. Fix issues before proceeding."

   - Label: "ðŸ” INVESTIGATE - Show detailed errors"
     Description: "Want to see detailed error messages for failed tool installations."
   ```

5. **WAIT for human response** - do NOT continue until approved

6. **Update gate-tracking.md** with human decision:
   - Update status based on response
   - Add human approver and decision
   - Add timestamp

7. **Handle response**:

   **For CODE-ONLY mode responses**:
   - If "âœ… PROCEED": Skip Steps 03-04, go directly to Step 05 (Component Analysis)
   - If "ðŸ”„ SWITCH TO FULL": Update ANALYSIS-SCOPE.md to FULL, proceed with full tool installation
   - If "â›” STOP": End workflow, document reason

   **For FULL mode responses**:
   - If "âœ… CONTINUE": Proceed to Step 03 (Static Analysis)
   - If "ðŸ”„ SWITCH TO CODE-ONLY": Update ANALYSIS-SCOPE.md to CODE-ONLY, skip to Step 05
   - If "â›” STOP": End workflow, document blockers
   - If "ðŸ” INVESTIGATE": Provide detailed error logs, re-request approval

## Exit Condition

**ONLY proceed when human approves one of the following**:

### CODE-ONLY Mode Exit:
- User selects "âœ… PROCEED" â†’ Skip to Step 05 (Component Analysis)
- User selects "ðŸ”„ SWITCH TO FULL" â†’ Continue with full tool installation

### FULL Mode Exit:
- User selects "âœ… CONTINUE" â†’ Proceed to Step 03 (Static Analysis)
- User selects "ðŸ”„ SWITCH TO CODE-ONLY" â†’ Skip to Step 05 (Component Analysis)

### Stop Conditions:
- If user selects "â›” STOP": End analysis workflow here. Document what needs to be fixed.
- If user selects "ðŸ” INVESTIGATE": Provide requested details and re-request approval.

## Consequences of Skipping This Gate

âš ï¸ **If you skip this gate:**

- Static analysis tools may fail silently or produce incomplete results
- MCP servers may not provide documentation access
- Diagram generation may fail
- You will waste hours running analysis that produces invalid data
- **Analysis results will be INVALID**
- You will need to restart from Step 02

---

## Record Step Completion Time

**IMPORTANT**: Record this step's completion time for the timing tracker (after Gate 1 approval).

**PowerShell**:
```powershell
# Record step completion time and append to timing tracker
$Step02EndTime = Get-Date
$timingEntry = @{
    step = "02"
    description = "Environment Setup"
    start = $Step02StartTime.ToString('yyyy-MM-ddTHH:mm:ss')
    end = $Step02EndTime.ToString('yyyy-MM-ddTHH:mm:ss')
    duration_min = [math]::Round(($Step02EndTime - $Step02StartTime).TotalMinutes, 1)
}
$timingEntry | ConvertTo-Json -Compress | Add-Content "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
Write-Host "Step 02 timing recorded: $($timingEntry.duration_min) minutes" -ForegroundColor Cyan
```

**Bash/sh**:
```bash
# Record step completion time and append to timing tracker
STEP_02_END=$(date -Iseconds)
STEP_02_DURATION=$(( ($(date -d "$STEP_02_END" +%s) - $(date -d "$STEP_02_START" +%s)) / 60 ))

echo "{\"step\":\"02\",\"description\":\"Environment Setup\",\"start\":\"$STEP_02_START\",\"end\":\"$STEP_02_END\",\"duration_min\":$STEP_02_DURATION}" >> "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
echo "Step 02 timing recorded: $STEP_02_DURATION minutes"
```

---

## Next Step

After Gate 1 approval, proceed based on selected analysis mode:

### If CODE-ONLY Mode:
- **Skip** Step 03 (Automated Discovery Scan)
- **Skip** Step 04 (AI Findings Analysis)
- **Go to**: [05-component-analysis.md](05-component-analysis.md) - AI-powered code reading and analysis

### If FULL Mode:
- **Go to**: [03-automated-discovery-scan.md](03-automated-discovery-scan.md) - Run static analysis tools on the codebase

---

*Document Version: 2.1 (Analysis Scope Selection)*
*Last Updated: 2026-01-08*
*Changes: Added CODE-ONLY vs FULL analysis mode handling, updated Gate 1 for scope verification*
*See: 02-tool-setup-guides/ for detailed installation instructions*
