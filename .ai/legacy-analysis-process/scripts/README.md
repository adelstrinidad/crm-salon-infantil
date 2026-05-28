# Legacy Analysis Scripts (CONSOLIDATED)

> **Updated 2026-01-14**: All scripts consolidated to this single location.

Cross-platform scripts for local code analysis and documentation generation.

## Scripts Overview

| Script | Purpose | Output |
|--------|---------|--------|
| `render_diagrams_for_doc.py` | Generate Word doc with rendered diagrams | `arch-as-is/{PROJECT}-AS-IS-ARCHITECTURE-COMPLETE.docx` |
| `verify_docx.py` | Validate generated DOCX files | Console output |
| `scan-secrets` | Detect credentials and secrets in codebase | `artifacts/02-metrics/secrets-scan.json` |
| `sanitize-for-ai` | Redact sensitive content before AI analysis | Sanitized files in output directory |
| `extract-metrics` | Extract code metrics locally | `artifacts/02-metrics/*.csv` |
| `classify-content` | Generate content classification report | `artifacts/02-metrics/CLASSIFICATION-REPORT.md` |

## Platform-Specific Versions

| Script | Windows | Linux/macOS |
|--------|---------|-------------|
| Secret scanning | `scan-secrets.ps1` | `scan-secrets.sh` |
| Sanitization | `sanitize-for-ai.ps1` | `sanitize-for-ai.sh` |
| Metrics extraction | `extract-metrics.ps1` | `extract-metrics.sh` |
| Content classification | `classify-content.ps1` | `classify-content.sh` |

## Usage

### Windows (PowerShell)

```powershell
# From repository root
cd {ANALYSIS_ROOT}/scripts

# 1. Scan for secrets first
.\scan-secrets.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src"

# 2. Generate classification report
.\classify-content.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src"

# 3. Extract local metrics
.\extract-metrics.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src"

# 4. Sanitize before AI analysis (optional)
.\sanitize-for-ai.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src" -OutputPath "..\artifacts\sanitized"
```

### Linux/macOS (Bash)

```bash
# From repository root
cd {ANALYSIS_ROOT}/scripts

# Make scripts executable
chmod +x *.sh

# 1. Scan for secrets first
./scan-secrets.sh --source ../../../../trunk/{PROJECT}/src

# 2. Generate classification report
./classify-content.sh --source ../../../../trunk/{PROJECT}/src

# 3. Extract local metrics
./extract-metrics.sh --source ../../../../trunk/{PROJECT}/src

# 4. Sanitize before AI analysis (optional)
./sanitize-for-ai.sh --source ../../../../trunk/{PROJECT}/src --output ../artifacts/sanitized
```

## Prerequisites

### Windows
- PowerShell 5.1 or later
- .NET SDK (for `dotnet` commands)

### Linux/macOS
- Bash 4.0 or later
- `cloc` (install via package manager)
- .NET SDK (for `dotnet` commands)

### Optional (for enhanced scanning)
- [Gitleaks](https://github.com/gitleaks/gitleaks) - Advanced secret detection
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Secret scanning

## Output Locations

All outputs are written to `{ANALYSIS_ROOT}/artifacts/`:

```
artifacts/
â”œâ”€â”€ 02-metrics/
â”‚   â”œâ”€â”€ secrets-scan.json          # Secret scan results
â”‚   â”œâ”€â”€ CLASSIFICATION-REPORT.md   # Content classification
â”‚   â”œâ”€â”€ file-inventory.csv         # All files
â”‚   â”œâ”€â”€ project-inventory.csv      # Project structure
â”‚   â””â”€â”€ nuget-dependencies.json    # Package dependencies
â””â”€â”€ sanitized/                     # Sanitized files (if generated)
```

## Security Notes

1. **Never commit** `secrets-scan.json` - it may contain paths to sensitive files
2. **Review classification** before proceeding with AI analysis
3. **Sanitized files** should be reviewed before transmission
4. Scripts run **entirely locally** - no network calls

---

## Document Generation Scripts

### Primary Solution: Python Scripts (Cross-Platform)

**Location:** `legacy-analysis/scripts/` (this folder)

The Python scripts are the **recommended** solution for generating complete Arc42 documentation with **embedded diagrams**.

#### Usage (from repository root)
```bash
python legacy-analysis/scripts/render_diagrams_for_doc.py
```

**Output:** `arch-as-is/{PROJECT}-AS-IS-ARCHITECTURE-COMPLETE.docx`

**Features:**
- Mermaid diagrams rendered to PNG (33+ diagrams)
- PlantUML diagrams rendered to PNG (via public server)
- Cover page with title, description, generation date
- Automatic TOC with 3-level depth
- Section numbering (1, 1.1, 1.2, etc.)
- Cross-platform (Windows, Linux, macOS)

**Requirements:**
- Python 3.7+
- Pandoc
- Node.js + npx (for Mermaid)
- Internet connection (for PlantUML server)

