# cloc (Count Lines of Code) Setup

**Purpose**: Extract code metrics (lines of code, languages, file counts) for legacy analysis

**Used By**: `extract-metrics.sh` script in `{ANALYSIS_ROOT}/scripts/`

## Prerequisites

- Windows: Perl (for cloc.pl) or standalone .exe
- Linux/macOS: Perl (usually pre-installed) or package manager

## Installation Steps

### Windows

#### Option 1: Standalone Executable (Recommended)

```powershell
# Create tools directory
New-Item -ItemType Directory -Force -Path "C:\tools\cloc" | Out-Null

# Download latest cloc.exe
$ClocUrl = "https://github.com/AlDanial/cloc/releases/download/v2.02/cloc-2.02.exe"
Invoke-WebRequest -Uri $ClocUrl -OutFile "C:\tools\cloc\cloc.exe"

# Add to PATH
$env:Path += ";C:\tools\cloc"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
```

#### Option 2: Using Chocolatey

```powershell
choco install cloc
```

#### Option 3: Using Scoop

```powershell
scoop install cloc
```

### Linux

```bash
# Debian/Ubuntu
sudo apt-get install cloc

# Red Hat/CentOS
sudo yum install cloc

# Arch Linux
sudo pacman -S cloc
```

### macOS

```bash
# Using Homebrew
brew install cloc
```

## Configuration

No configuration file needed. cloc works out of the box.

## Running cloc

### Basic Usage

```bash
# Count lines in a directory
cloc trunk/{PROJECT}/src

# Count with specific output format
cloc trunk/{PROJECT}/src --csv --out=artifacts/02-metrics/cloc-report.csv
cloc trunk/{PROJECT}/src --json --out=artifacts/02-metrics/cloc-report.json
cloc trunk/{PROJECT}/src --xml --out=artifacts/02-metrics/cloc-report.xml

# Count specific languages only
cloc trunk/{PROJECT}/src --include-lang=C#,SQL
```

### Advanced Options

```bash
# Exclude directories
cloc trunk/{PROJECT}/src --exclude-dir=bin,obj,node_modules,test

# Exclude file extensions
cloc trunk/{PROJECT}/src --exclude-ext=Designer.cs

# Count by file (detailed)
cloc trunk/{PROJECT}/src --by-file --csv --out=artifacts/02-metrics/cloc-by-file.csv

# Count differences between two directories
cloc --diff legacy_src modern_src
```

### Legacy Analysis Script Usage

The `extract-metrics.sh` script uses cloc:

```bash
# From {ANALYSIS_ROOT}/scripts/
./extract-metrics.sh --source ../../../../trunk/{PROJECT}/src

# Output: artifacts/02-metrics/file-inventory.csv
```

## Output Formats

### CSV Output (Default)

```csv
files,language,blank,comment,code,"http://cloc.sourceforge.net v 2.02"
145,C#,2340,1890,28540
42,SQL,456,234,5670
18,XML,23,12,890
3,JavaScript,45,12,340
```

### JSON Output

```json
{
  "header": {
    "cloc_version": "2.02",
    "cloc_url": "github.com/AlDanial/cloc",
    "report_file": "artifacts/02-metrics/cloc-report.json"
  },
  "C#": {
    "nFiles": 145,
    "blank": 2340,
    "comment": 1890,
    "code": 28540
  },
  "SQL": {
    "nFiles": 42,
    "blank": 456,
    "comment": 234,
    "code": 5670
  },
  "SUM": {
    "blank": 2819,
    "comment": 2136,
    "code": 35440,
    "nFiles": 208
  }
}
```

### XML Output

```xml
<results>
  <header>
    <cloc_version>2.02</cloc_version>
    <cloc_url>github.com/AlDanial/cloc</cloc_url>
  </header>
  <language name="C#" code="28540" comment="1890" blank="2340" files="145"/>
  <language name="SQL" code="5670" comment="234" blank="456" files="42"/>
  <total blank="2819" comment="2136" code="35440" files="208"/>
</results>
```

## Verification

```bash
# Check version
cloc --version

# Test on sample directory
echo 'using System; class Test { }' > Test.cs
mkdir test_dir
mv Test.cs test_dir/
cloc test_dir/

# Should output:
# -------------------------------------------------------------------------------
# Language                     files          blank        comment           code
# -------------------------------------------------------------------------------
# C#                               1              0              0              1
# -------------------------------------------------------------------------------

# Clean up
rm -rf test_dir
```

## Language Detection

cloc automatically detects languages by file extension:

| Extension | Language | Notes |
|-----------|----------|-------|
| .cs | C# | Including .Designer.cs |
| .sql, .pks, .pkb | SQL | PL/SQL included |
| .cfm, .cfc | ColdFusion | CFML scripts |
| .js | JavaScript | |
| .ts | TypeScript | |
| .py | Python | |
| .java | Java | |
| .kt | Kotlin | |
| .vue | Vue | |
| .jsx, .tsx | React | JavaScript/TypeScript |

## Common Options

```bash
# Show progress (useful for large codebases)
cloc trunk/{PROJECT}/src --progress-rate=5

# Skip large files (>1MB)
cloc trunk/{PROJECT}/src --max-file-size=1

# Include hidden files
cloc trunk/{PROJECT}/src --include-hidden

# Use multiple cores
cloc trunk/{PROJECT}/src --processes=4

# Force language for specific files
cloc trunk/{PROJECT}/src --force-lang=SQL,pks --force-lang=SQL,pkb
```

## Integration with Legacy Analysis

### Step 01: Initial Metrics Collection

```bash
# Run from legacy_analysis/scripts/
cd {ANALYSIS_ROOT}/scripts

# Extract metrics
./extract-metrics.sh --source ../../../../trunk/{PROJECT}/src

# Output files:
# - artifacts/02-metrics/file-inventory.csv
# - artifacts/02-metrics/cloc-summary.txt
```

### Step 04: AI Findings Analysis

Use cloc output to:
- Identify primary languages
- Estimate codebase size
- Find test coverage gaps (compare src/ vs test/)
- Detect generated code (e.g., .Designer.cs files)

## Common Issues

**Issue**: Incorrect language detection
**Solution**: Use `--force-lang` to override: `cloc --force-lang=SQL,pks src/`

**Issue**: Very slow on large codebases
**Solution**: Use `--processes=4` to enable multi-threading

**Issue**: Too many false positives (generated files)
**Solution**: Use `--exclude-dir` and `--exclude-ext` to filter

**Issue**: Binary files causing errors
**Solution**: cloc automatically skips binary files, but you can use `--skip-archive` to skip archives

## Advanced Usage

### Compare Legacy vs Modern Codebases

```bash
# Generate diff report
cloc --diff legacy_src/ modern_src/ --json --out=artifacts/02-metrics/code-diff.json
```

### Count Only Business Logic (Exclude Tests)

```bash
cloc trunk/{PROJECT}/src --exclude-dir=test,tests,__tests__ --exclude-ext=.test.cs
```

### Generate HTML Report (via JSON + Conversion)

```bash
# Generate JSON
cloc trunk/{PROJECT}/src --json --out=metrics.json

# Use jq or Python to convert to HTML table
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Extract Metrics Script](../../../scripts/extract-metrics.sh)
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- cloc GitHub: https://github.com/AlDanial/cloc
- cloc Documentation: http://cloc.sourceforge.net/
