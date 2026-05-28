---
name: ai1st-arch-code-quality-analysis
description: "Deep code quality analysis with metrics, CVE scanning, and architectural recommendations."
disable-model-invocation: true
---

# Code Quality Deep Analysis (ai1st-arch-code-quality-analysis)

Execute tool-based static code analysis for detailed quality metrics, security vulnerabilities, and technical debt assessment.

**Command**: `/ai1st-arch-code-quality-analysis`

## When to Use

Use this command when you need:
- Precise cyclomatic complexity metrics
- Security vulnerability scanning (CVEs)
- Test coverage analysis
- Dependency vulnerability checks
- SARIF/standardized reports for compliance

**Prerequisites**: Run after `/ai1st-arch-legacy-analysis-lite` or as standalone deep dive.

---

## Step 0: Create Output Folders (AUTOMATED)

Before running analysis, create the required folder structure:

**Windows (PowerShell)**:
```powershell
.ai/scripts/legacy-analysis-setup.ps1 -AnalysisRoot "{ANALYSIS_ROOT}" -ProcessType "quality"
```

**Linux/macOS (Bash)**:
```bash
.ai/scripts/bash/legacy-analysis-setup.sh -r "{ANALYSIS_ROOT}" -t quality
```

This creates:
```
{ANALYSIS_ROOT}/
├── work/
│   ├── 01-reconnaissance/
│   └── quality-metrics/
└── docs/business-context/
```

---

## What This Command Does

```
STEP 1: Tool Setup (15-30 min)
├── Detect project type (Java/C#/Node/Python)
├── Install appropriate analyzers
└── Verify tool availability

STEP 2: Run Analysis (30-60 min)
├── Complexity Analysis (Roslyn/SonarScanner/ESLint)
├── Security Scan (OWASP, Security Code Scan)
├── Dependency Check (OWASP Dependency-Check)
├── Test Coverage (JaCoCo/Istanbul)
└── Code Metrics (LOC, duplication, maintainability)

STEP 3: Generate Report
└── CODE-QUALITY-REPORT.md with all findings
```

## Tool Matrix by Language

| Language | Complexity | Security | Dependencies | Coverage |
|----------|------------|----------|--------------|----------|
| **Java** | SonarScanner | SpotBugs, OWASP | Dependency-Check | JaCoCo |
| **C#/.NET** | Roslyn Analyzers | Security Code Scan | NuGet Audit | Coverlet |
| **TypeScript** | ESLint + complexity | npm audit, Snyk | npm audit | Istanbul |
| **Python** | pylint, radon | bandit | pip-audit | coverage.py |

## Output: CODE-QUALITY-REPORT.md

```markdown
# Code Quality Analysis Report
**Module**: {module-name}
**Date**: {date}
**Tools Used**: {list}

## 1. Summary
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Cyclomatic Complexity (avg) | 12.3 | <10 | ⚠️ WARN |
| Security Vulnerabilities | 3 HIGH, 5 MEDIUM | 0 HIGH | ❌ FAIL |
| Test Coverage | 42% | >80% | ❌ FAIL |
| Dependency Vulnerabilities | 2 CVEs | 0 | ⚠️ WARN |
| Code Duplication | 8.2% | <5% | ⚠️ WARN |

## 2. Complexity Analysis
| File | Method | Complexity | Risk |
|------|--------|------------|------|
| ClaimsService.java | processPayment() | 28 | HIGH |
| PaymentValidator.java | validate() | 18 | MEDIUM |

## 3. Security Vulnerabilities
| ID | Severity | Type | File | Line | Description |
|----|----------|------|------|------|-------------|
| SEC-001 | HIGH | SQL Injection | ClaimDAO.java | 142 | Unparameterized query |
| SEC-002 | MEDIUM | XSS | claims.jsp | 87 | Unescaped output |

## 4. Dependency Vulnerabilities (CVEs)
| Dependency | Version | CVE | Severity | Fix Version |
|------------|---------|-----|----------|-------------|
| log4j-core | 2.14.0 | CVE-2021-44228 | CRITICAL | 2.17.1 |
| jackson-databind | 2.9.8 | CVE-2019-12086 | HIGH | 2.9.9 |

## 5. Test Coverage
| Package | Classes | Lines | Branches | Coverage |
|---------|---------|-------|----------|----------|
| com.tms.claims | 12 | 1,234 | 456 | 38% |
| com.tms.payments | 8 | 876 | 234 | 52% |

## 6. Code Metrics
| Metric | Value |
|--------|-------|
| Total LOC | 15,234 |
| Code Duplication | 8.2% |
| Avg Method Length | 32 lines |
| Maintainability Index | 62/100 |

## 7. Recommendations
| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Fix CVE-2021-44228 (log4j) | S | CRITICAL |
| P1 | Fix SQL injection in ClaimDAO | M | HIGH |
| P2 | Increase test coverage to 60% | L | MEDIUM |
```

## Installation Commands (Auto-detected)

### Java Projects
```bash
# SonarScanner
brew install sonar-scanner  # macOS
choco install sonarscanner  # Windows

# OWASP Dependency-Check
brew install dependency-check  # macOS
# Windows: Download from https://owasp.org/www-project-dependency-check/

# SpotBugs
mvn com.github.spotbugs:spotbugs-maven-plugin:check
```

### .NET Projects
```powershell
# Roslyn Analyzers (via NuGet)
dotnet add package Microsoft.CodeAnalysis.NetAnalyzers

# Security Code Scan
dotnet add package SecurityCodeScan.VS2019

# NuGet vulnerability audit
dotnet list package --vulnerable
```

### Node/TypeScript Projects
```bash
# ESLint with complexity
npm install eslint eslint-plugin-complexity --save-dev

# Security audit
npm audit

# Snyk (optional, more comprehensive)
npm install -g snyk && snyk test
```

## Execution Flow

1. **Detect** project type from build files (`pom.xml`, `*.csproj`, `package.json`)
2. **Check** which tools are already installed
3. **Prompt** to install missing tools (with commands)
4. **Run** all applicable analyzers
5. **Parse** outputs (SARIF, JSON, XML)
6. **Generate** unified `CODE-QUALITY-REPORT.md`

## Gate: Human Review

After report generation, present:
- Critical/High findings count
- Test coverage %
- CVE count

Human decides: **ACCEPT** / **FIX CRITICAL FIRST** / **DEFER**

## Relationship to Other Commands

| Command | Focus | Tools | Duration |
|---------|-------|-------|----------|
| `/ai1st-arch-legacy-sys-analysis` | Full Arc42 docs | All tools | 11-16 hours |
| `/ai1st-arch-legacy-analysis-lite` | Migration deps | AI only | 2-3 hours |
| `/ai1st-arch-code-quality-analysis` | Quality metrics | Static analysis | 1-2 hours |

**Typical workflow**:
1. Run LITE first → Get migration requirements
2. Run this command → Get quality baseline
3. Prioritize: Migration + fix critical issues

## Output Location

```
{ANALYSIS_ROOT}/
└── work/
    └── quality-metrics/              # Created by setup script
        ├── CODE-QUALITY-REPORT.md    # Main report
        ├── sarif/                     # Raw SARIF outputs
        │   ├── roslyn-results.sarif
        │   ├── security-scan.sarif
        │   └── sonar-results.json
        └── coverage/                  # Coverage reports
            └── coverage.xml
```

---

*Version: 1.0 | Created: 2026-02-03*
