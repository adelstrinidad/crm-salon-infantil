#!/bin/bash
#
# SYNOPSIS
#     Extracts code metrics from source codebase using cloc. Runs entirely locally.
#
# DESCRIPTION
#     Generates code metrics including lines of code, file counts, and language
#     breakdown. Results support legacy analysis without AI vendor transmission.
#
# USAGE
#     ./extract-metrics.sh --source <path> [--output <path>]
#
# PREREQUISITES
#     - cloc (install via package manager: apt install cloc, brew install cloc)
#
# EXAMPLE
#     ./extract-metrics.sh --source ../../../../{source_path}/src

set -e

# Default values
SOURCE_PATH=""
OUTPUT_PATH="../artifacts/02-metrics"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --source|-s)
            SOURCE_PATH="$2"
            shift 2
            ;;
        --output|-o)
            OUTPUT_PATH="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --source <path> [--output <path>]"
            echo ""
            echo "Options:"
            echo "  --source, -s    Path to source code directory to analyze (required)"
            echo "  --output, -o    Path for output directory (default: ../artifacts/02-metrics)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [ -z "$SOURCE_PATH" ]; then
    echo "ERROR: --source is required"
    echo "Usage: $0 --source <path> [--output <path>]"
    exit 1
fi

# Check for cloc
if ! command -v cloc &> /dev/null; then
    echo "ERROR: cloc is not installed"
    echo "Install with: apt install cloc (Debian/Ubuntu) or brew install cloc (macOS)"
    exit 1
fi

# Ensure output directory exists
mkdir -p "$OUTPUT_PATH"

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

echo "=== Code Metrics Extractor ==="
echo "Source: $SOURCE_PATH"
echo "Output: $OUTPUT_PATH"
echo ""

# Generate cloc summary in multiple formats
echo "Generating code metrics..."

# CSV format for data processing
echo "  - cloc-summary.csv"
cloc "$SOURCE_PATH" --csv --quiet --out="$OUTPUT_PATH/cloc-summary.csv" 2>/dev/null || true

# JSON format for structured analysis
echo "  - cloc-summary.json"
cloc "$SOURCE_PATH" --json --quiet --out="$OUTPUT_PATH/cloc-summary.json" 2>/dev/null || true

# Markdown format for documentation
echo "  - cloc-summary.md"
cloc "$SOURCE_PATH" --md --quiet --out="$OUTPUT_PATH/cloc-summary.md" 2>/dev/null || true

# Per-file breakdown
echo "  - cloc-by-file.csv"
cloc "$SOURCE_PATH" --by-file --csv --quiet --out="$OUTPUT_PATH/cloc-by-file.csv" 2>/dev/null || true

# Generate file inventory
echo "  - file-inventory.csv"
echo "RelativePath,Extension,SizeBytes,LastModified" > "$OUTPUT_PATH/file-inventory.csv"
find "$SOURCE_PATH" -type f -print0 2>/dev/null | while IFS= read -r -d '' file; do
    rel_path="${file#$SOURCE_PATH/}"
    ext="${file##*.}"
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    modified=$(stat -f%Sm -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || stat -c%y "$file" 2>/dev/null | cut -d'.' -f1 || echo "unknown")
    echo "\"$rel_path\",\"$ext\",$size,\"$modified\"" >> "$OUTPUT_PATH/file-inventory.csv"
done

# Count totals
TOTAL_FILES=$(find "$SOURCE_PATH" -type f 2>/dev/null | wc -l)
TOTAL_DIRS=$(find "$SOURCE_PATH" -type d 2>/dev/null | wc -l)

# Generate summary report
echo "  - METRICS-SUMMARY.md"
cat > "$OUTPUT_PATH/METRICS-SUMMARY.md" << EOF
# Code Metrics Summary

**Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Source Path**: $SOURCE_PATH

## Overview

| Metric | Value |
|--------|-------|
| Total Files | $TOTAL_FILES |
| Total Directories | $TOTAL_DIRS |

## Language Breakdown

See [cloc-summary.md](cloc-summary.md) for detailed language statistics.

## Files Generated

| File | Description |
|------|-------------|
| cloc-summary.csv | Language summary in CSV format |
| cloc-summary.json | Language summary in JSON format |
| cloc-summary.md | Language summary in Markdown |
| cloc-by-file.csv | Per-file breakdown |
| file-inventory.csv | Complete file inventory |

## Next Steps

1. Review language distribution in cloc-summary.md
2. Identify largest files in cloc-by-file.csv
3. Check file-inventory.csv for unexpected file types
4. Use this data for component analysis planning
EOF

echo ""
echo "=== Extraction Complete ==="
echo ""
echo "Files generated:"
ls -la "$OUTPUT_PATH"/*.csv "$OUTPUT_PATH"/*.json "$OUTPUT_PATH"/*.md 2>/dev/null | awk '{print "  " $NF}'
echo ""
echo "Summary: $TOTAL_FILES files in $TOTAL_DIRS directories"
echo ""
echo "Results saved to: $OUTPUT_PATH/"
