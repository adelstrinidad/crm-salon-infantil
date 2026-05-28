# Document Generation Quick Guide

This guide shows how to generate professional Word documents with cover pages from Arc42 markdown documentation.

## Prerequisites

1. **Install Pandoc:**
   ```powershell
   # Using Chocolatey (recommended for Windows)
   choco install pandoc

   # Or download from: https://pandoc.org/installing.html
   ```

2. **Verify Installation:**
   ```powershell
   pandoc --version
   ```

## Quick Start: Generate Documentation

### Generate AS-IS (Current System) Documentation

```powershell
cd {PROJECT_ROOT}\docs\ai\legacy_analysis\scripts
.\Generate-AsIsDoc.ps1
```

**Output:** `{PROJECT_ROOT}\{PROJECT}-AS-IS-Architecture.docx`

**Cover Page Includes:**
- Title: "{PROJECT} AS-IS Architecture Documentation"
- Description of legacy system (.NET 4.7.2, Oracle 12c, WCF)
- Creation methodology (codebase analysis, reverse-engineering)
- Generation date and source files

### Generate TO-BE (Target System) Documentation

```powershell
cd {PROJECT_ROOT}\docs\ai\legacy_analysis\scripts
.\Generate-ToBeDoc.ps1
```

**Output:** `{PROJECT_ROOT}\{PROJECT}-TO-BE-Architecture.docx`

**Cover Page Includes:**
- Title: "{PROJECT} TO-BE Architecture Documentation"
- Description of modern system (.NET 9, PostgreSQL, Azure)
- Modernization approach (ADRs, Strangler Fig pattern)
- Generation date and source files

### Generate Both Documents

```powershell
cd {PROJECT_ROOT}\docs\ai\legacy_analysis\scripts
.\Generate-AsIsDoc.ps1
.\Generate-ToBeDoc.ps1
```

## Custom Output Locations

Specify custom output paths:

```powershell
# Custom location for AS-IS document
.\Generate-AsIsDoc.ps1 -Output "C:\Reports\{PROJECT}-Current-System.docx"

# Custom location for TO-BE document
.\Generate-ToBeDoc.ps1 -Output "C:\Reports\{PROJECT}-Target-System.docx"
```

## Using Custom Styling Templates

Create a reference .docx template with your desired styles, then:

```powershell
# AS-IS with custom styling
.\Generate-AsIsDoc.ps1 -ReferenceDoc "C:\Templates\corporate-style.docx"

# TO-BE with custom styling
.\Generate-ToBeDoc.ps1 -ReferenceDoc "C:\Templates\corporate-style.docx"
```

## Advanced: Generate Custom Documents

Use the core script directly for custom combinations:

```powershell
# Generate specific sections only
$sections = Get-ChildItem ..\as-is\01-*.md,..\as-is\03-*.md,..\as-is\05-*.md
.\Generate-DocFromMarkdown.ps1 `
    -Source $sections `
    -Output "{PROJECT}-Overview.docx" `
    -Title "{PROJECT} System Overview" `
    -Description "High-level overview of {PROJECT} system architecture" `
    -CreationInfo "Extracted from Arc42 documentation sections 1, 3, and 5" `
    -IncludeCoverPage

# Generate work artifacts documentation
$specs = Get-ChildItem ..\work\05-analysis\specs\*.md
.\Generate-DocFromMarkdown.ps1 `
    -Source $specs `
    -Output "{PROJECT}-Component-Specs.docx" `
    -Title "{PROJECT} Component Specifications" `
    -Description "Detailed technical specifications for all {PROJECT} components" `
    -CreationInfo "Reverse-engineered from legacy codebase analysis" `
    -IncludeCoverPage

# Generate without cover page
.\Generate-DocFromMarkdown.ps1 `
    -Source ..\as-is\*.md `
    -Output "{PROJECT}-AS-IS-Simple.docx" `
    -Title "{PROJECT} AS-IS Architecture"
```

## Document Features

### Cover Page

When `-IncludeCoverPage` is used, documents include:

1. **Title Section**
   - Large, prominent title
   - Centered formatting

2. **About This Document**
   - Description of contents
   - Key topics covered
   - Document purpose

3. **How This Document Was Created**
   - Creation methodology
   - Source materials
   - Tools and processes used

4. **Metadata**
   - Generation date (e.g., "January 12, 2026")
   - List of source markdown files

5. **Page Break**
   - Automatic page break before main content

### Table of Contents

All documents include:
- Automatic TOC (depth: 3 levels)
- Section numbers
- Page numbers (in Word)

### Formatting

- Wide layout (120 columns)
- Support for tables (pipe tables, grid tables)
- Code blocks with syntax highlighting
- Bilingual content handling

## What Gets Included

### AS-IS Document Includes:

âœ… All numbered Arc42 sections (01-13)
âœ… Appendix sections (A1-*)
âŒ README.md (excluded)
âŒ 00-template-guide.md (excluded)
âŒ Subfolder contents (e.g., 09-architecture-decisions/)

**Sections Included:**
- 01-introduction-goals.md
- 02-constraints.md
- 03-context-scope.md
- 04-solution-strategy.md
- 05-building-block-view.md
- 06-runtime-view.md
- 07-deployment-view.md
- 08-domain-rules-and-guidelines.md
- 09-architecture-decisions.md (summary file)
- 10-quality-requirements.md
- 11-risks-technical-debt.md
- 12-glossary.md
- 13-documentation-reality-vs-code-reality.md
- A1-requirements-traceability.md
- A1-requirements-traceability-matrix.md

### TO-BE Document Includes:

âœ… All numbered Arc42 sections (01-12)
âŒ README.md (excluded)
âŒ 00-template-guide.md (excluded)
âŒ Subfolder contents

**Sections Included:**
- 01-introduction-goals.md
- 02-constraints.md
- 03-context-scope.md
- 04-solution-strategy.md
- 05-building-block-view.md
- 06-runtime-view.md
- 07-deployment-view.md
- 08-domain-rules-and-guidelines.md
- 10-quality-requirements.md
- 11-risks-technical-debt.md
- 12-glossary.md

## Troubleshooting

### "pandoc not found in PATH"

**Solution:**
```powershell
# Install pandoc
choco install pandoc

# Restart PowerShell
exit

# Verify installation
pandoc --version
```

### "No Arc42 section files found"

**Solution:**
- Verify you're in the scripts directory: `docs\ai\legacy_analysis\scripts`
- Check that markdown files exist: `Get-ChildItem ..\as-is\*.md`
- Ensure file paths in script are correct

### UTF-16 Encoding Warning

**Not an error** - scripts automatically handle UTF-16 encoded markdown files and convert to UTF-8.

### Page Breaks Not Working

**Solution:**
- Update pandoc to version 2.0 or higher: `choco upgrade pandoc`
- Verify: `pandoc --version`

## Examples of Cover Page Output

### AS-IS Cover Page Example:

```
                    {PROJECT} AS-IS Architecture Documentation


## About This Document

This document provides complete Arc42 architecture documentation of the current
{PROJECT} ({SYSTEM}) legacy system.

Contents:
- Business context and stakeholders
- Technical architecture (.NET 4.7.2, Oracle 12c, WCF)
- System constraints and integrations
- Component structure and runtime behavior
- Deployment infrastructure
- Quality requirements and metrics
- Technical debt analysis and risks
- Domain model and glossary

Purpose: This documentation serves as the baseline for understanding the
current system before modernization efforts.


## How This Document Was Created

This document was automatically generated from Arc42-format markdown files
using pandoc.

Creation Process:
1. Systematic legacy codebase analysis (662 C# files, 1,313+ PL/SQL files)
2. Architectural reverse-engineering and pattern identification
3. Component and dependency mapping
4. Integration point documentation
5. Quality metrics extraction and technical debt assessment
6. Documentation consolidation into Arc42 standard format

Source: Legacy analysis work artifacts in {ANALYSIS_ROOT}/work/
Format: Arc42 Architecture Documentation Template
Tool: Claude Code + pandoc document generation


Generated: January 12, 2026

Source Files: 01-introduction-goals.md, 02-constraints.md, ...

---

[Page Break]

[Main Content Begins...]
```

## Tips

1. **Review Before Sharing:** Always review generated documents before distribution
2. **Custom Styles:** Create a reference template once, reuse for consistent branding
3. **Incremental Updates:** Regenerate documents as markdown content is updated
4. **Version Control:** Keep generated .docx files out of git (add to .gitignore)
5. **Combine with Other Tools:** Export to PDF using Word if needed

## See Also

- [Generate-DocFromMarkdown.ps1](Generate-DocFromMarkdown.ps1) - Core script
- [Generate-AsIsDoc.ps1](Generate-AsIsDoc.ps1) - AS-IS convenience script
- [Generate-ToBeDoc.ps1](Generate-ToBeDoc.ps1) - TO-BE convenience script
- [README.md](README.md) - Complete scripts documentation
- [Pandoc Manual](https://pandoc.org/MANUAL.html)
- [Arc42 Template](https://arc42.org/)
