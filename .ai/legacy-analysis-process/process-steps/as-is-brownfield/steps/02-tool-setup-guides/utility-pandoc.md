# Pandoc Setup

**Purpose**: Convert markdown documentation to Word/PDF for stakeholder review

**Used By**: `Generate-DocFromMarkdown.ps1` script in `{ANALYSIS_ROOT}/scripts/`

## Prerequisites

- Windows 10+, macOS, or Linux
- LaTeX (optional, for PDF generation with better formatting)

## Installation Steps

### Windows

#### Option 1: MSI Installer (Recommended)

```powershell
# Download latest Pandoc installer
$PandocUrl = "https://github.com/jgm/pandoc/releases/download/3.1.11/pandoc-3.1.11-windows-x86_64.msi"
$InstallerPath = "$env:TEMP\pandoc-installer.msi"

Invoke-WebRequest -Uri $PandocUrl -OutFile $InstallerPath

# Install silently
Start-Process msiexec.exe -Wait -ArgumentList "/i $InstallerPath /quiet /norestart"

# Clean up
Remove-Item $InstallerPath

# Verify PATH (usually added automatically)
pandoc --version
```

#### Option 2: Using Chocolatey

```powershell
choco install pandoc
```

#### Option 3: Using Scoop

```powershell
scoop install pandoc
```

### Linux

```bash
# Debian/Ubuntu
sudo apt-get install pandoc

# Red Hat/CentOS
sudo yum install pandoc

# Arch Linux
sudo pacman -S pandoc
```

### macOS

```bash
# Using Homebrew
brew install pandoc
```

## Optional: LaTeX Installation (for PDF)

### Windows

```powershell
# Using Chocolatey (installs MiKTeX)
choco install miktex

# Or download from https://miktex.org/download
```

### Linux

```bash
# Debian/Ubuntu (install TeX Live)
sudo apt-get install texlive texlive-latex-extra

# Red Hat/CentOS
sudo yum install texlive texlive-latex
```

### macOS

```bash
# Using Homebrew (installs MacTeX)
brew install --cask mactex
```

## Configuration

### Pandoc Defaults File (optional)

Create `~/.pandoc/defaults.yaml`:

```yaml
# Input format
from: markdown+smart

# Output format
to: docx

# Metadata
metadata:
  author: Legacy Analysis Team
  date: auto

# Options
standalone: true
toc: true
toc-depth: 3
number-sections: true
```

## Running Pandoc

### Basic Usage

```bash
# Convert markdown to Word
pandoc input.md -o output.docx

# Convert markdown to PDF
pandoc input.md -o output.pdf

# Convert with table of contents
pandoc input.md -o output.docx --toc --toc-depth=3
```

### Legacy Analysis Script Usage

The `Generate-DocFromMarkdown.ps1` script uses Pandoc:

```powershell
# From {ANALYSIS_ROOT}/scripts/
.\Generate-DocFromMarkdown.ps1 -InputPath "..\arch-as-is\README.md" -OutputPath "artifacts\AS-IS-Architecture.docx"

# Generate entire AS-IS documentation
.\Generate-DocFromMarkdown.ps1 -InputPath "..\arch-as-is\" -OutputPath "artifacts\AS-IS-Complete.docx"
```

### Advanced Options

```bash
# Custom template (Word)
pandoc input.md -o output.docx --reference-doc=template.docx

# Custom CSS (HTML)
pandoc input.md -o output.html --css=styles.css

# PDF with custom margins
pandoc input.md -o output.pdf -V geometry:margin=1in

# Include metadata
pandoc input.md -o output.docx --metadata title="AS-IS Architecture" --metadata author="Analysis Team"

# Number sections
pandoc input.md -o output.docx --number-sections

# Syntax highlighting for code blocks
pandoc input.md -o output.html --highlight-style=tango
```

## Output Formats Supported

| Format | Extension | Use Case |
|--------|-----------|----------|
| Word | .docx | Stakeholder review, editing |
| PDF | .pdf | Final reports, archiving |
| HTML | .html | Web publishing, internal wikis |
| LaTeX | .tex | Academic papers, technical docs |
| EPUB | .epub | E-readers |
| RTF | .rtf | Legacy systems |

## Word Document Templates

### Create Custom Template

1. Generate sample document:
   ```bash
   pandoc input.md -o sample.docx
   ```

2. Open `sample.docx` in Word and customize:
   - Heading styles (Heading 1, Heading 2, etc.)
   - Body text style
   - Code block formatting
   - Table formatting
   - Page headers/footers
   - Company logo

3. Save as `template.docx`

4. Use template:
   ```bash
   pandoc input.md -o output.docx --reference-doc=template.docx
   ```

## Verification

```bash
# Check version
pandoc --version

# Test conversion
echo "# Test Document

This is a **test** document.

- Item 1
- Item 2

\`\`\`csharp
public class Test { }
\`\`\`
" > test.md

pandoc test.md -o test.docx
pandoc test.md -o test.pdf
pandoc test.md -o test.html

# Verify files created
ls -l test.*

# Clean up
rm test.*
```

## Common Conversion Examples

### Arc42 Documentation to Word

```bash
# Single section
pandoc {ANALYSIS_ROOT}/arch-as-is/01-introduction-goals.md \
  -o artifacts/01-Introduction-Goals.docx \
  --toc --number-sections

# Combine multiple sections
pandoc {ANALYSIS_ROOT}/arch-as-is/*.md \
  -o artifacts/AS-IS-Complete.docx \
  --toc --toc-depth=3 --number-sections \
  --metadata title="AS-IS Architecture Documentation"
```

### Markdown to PDF with Custom Styling

```bash
pandoc input.md -o output.pdf \
  --toc \
  --number-sections \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  -V mainfont="Arial" \
  -V colorlinks=true
```

### Batch Convert All Markdown Files

```powershell
# PowerShell script
Get-ChildItem -Path "docs\ai\legacy_analysis\arch-as-is" -Filter "*.md" | ForEach-Object {
    $outputName = $_.BaseName + ".docx"
    pandoc $_.FullName -o "artifacts\$outputName" --toc --number-sections
}
```

## Integration with Legacy Analysis

### Generate AS-IS Documentation

```powershell
# From scripts directory
cd docs\ai\legacy_analysis\scripts

# Generate complete AS-IS architecture document
.\Generate-DocFromMarkdown.ps1 `
    -InputPath "..\arch-as-is\" `
    -OutputPath "artifacts\AS-IS-Architecture-$(Get-Date -Format 'yyyy-MM-dd').docx" `
    -IncludeTOC `
    -NumberSections
```

### Generate TO-BE Documentation

```powershell
.\Generate-DocFromMarkdown.ps1 `
    -InputPath "..\arch-to-be\" `
    -OutputPath "artifacts\TO-BE-Architecture-$(Get-Date -Format 'yyyy-MM-dd').docx" `
    -IncludeTOC `
    -NumberSections
```

## Common Issues

**Issue**: Images not showing in Word document
**Solution**: Use relative paths or embed images with `--extract-media` option

**Issue**: Code blocks not formatted correctly
**Solution**: Ensure markdown code blocks use triple backticks with language identifier: \`\`\`csharp

**Issue**: PDF generation fails with "pdflatex not found"
**Solution**: Install LaTeX distribution (MiKTeX, TeX Live, or MacTeX)

**Issue**: Table of contents not showing
**Solution**: Add `--toc` flag and ensure headings use proper markdown syntax (#, ##, ###)

**Issue**: Formatting inconsistent between formats
**Solution**: Use reference templates for consistent styling

## Advanced Features

### Include External Files

```bash
# In markdown, use includes
!include other-file.md

# Then convert with pandoc-include filter
pandoc input.md -o output.docx --filter pandoc-include
```

### Math Equations (LaTeX)

```markdown
Inline math: $E = mc^2$

Display math:
$$
\int_{a}^{b} f(x) dx
$$
```

### Custom Filters (Lua/Python)

```bash
# Use custom filter for processing
pandoc input.md -o output.docx --lua-filter=custom-filter.lua
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Generate Doc Script](../../../scripts/Generate-DocFromMarkdown.ps1)
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- Pandoc Documentation: https://pandoc.org/MANUAL.html
- Pandoc Filters: https://pandoc.org/filters.html
- Reference Templates: https://pandoc.org/MANUAL.html#templates
- LaTeX Installation: https://www.latex-project.org/get/
