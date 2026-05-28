#!/bin/bash
set -e

# SYNOPSIS
#     Generates a styled DOCX (Word) document from one or more Markdown source files.
#     Bash equivalent of Generate-DocFromMarkdown.ps1
#
# USAGE
#     ./Generate-DocFromMarkdown.sh [options] <source_file(s)>...

# Default values
SOURCES=()
OUTPUT=""
TITLE=""
REFERENCE_DOC=""
KEEP_INTERMEDIATE=false
COMPACT_HEADERS=false

# Help function
usage() {
    echo "Usage: $0 [options] <source_file(s)>..."
    echo "Options:"
    echo "  -o, --output <file>    Target DOCX file path"
    echo "  -t, --title <title>    Document title metadata override"
    echo "  -r, --ref <file>       Reference DOCX template"
    echo "  -k, --keep             Keep intermediate markdown file"
    echo "  -c, --compact          Compact specific headers (Finnish/English)"
    echo "  -h, --help             Show this help"
    exit 1
}

# Argument parsing
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -o|--output) OUTPUT="$2"; shift ;;
        -t|--title) TITLE="$2"; shift ;;
        -r|--ref) REFERENCE_DOC="$2"; shift ;;
        -k|--keep) KEEP_INTERMEDIATE=true ;;
        -c|--compact) COMPACT_HEADERS=true ;;
        -h|--help) usage ;;
        -*) echo "Unknown parameter passed: $1"; usage ;;
        *) SOURCES+=("$1") ;;
    esac
    shift
done

# Check requirements
if ! command -v pandoc &> /dev/null; then
    echo "Error: pandoc not found in PATH"
    exit 1
fi

if [ ${#SOURCES[@]} -eq 0 ]; then
    echo "Error: No source markdown files provided."
    echo "See --help for usage."
    exit 1
fi

# Determine output logic
if [ -z "$OUTPUT" ]; then
    FIRST_SOURCE="${SOURCES[0]}"
    BASENAME=$(basename "$FIRST_SOURCE" .md)
    DIRNAME=$(dirname "$FIRST_SOURCE")
    OUTPUT="${DIRNAME}/${BASENAME}.docx"
fi

# Create temp dir
# mktemp -d behaves differently on macOS vs Linux sometimes, but -t template usually works or just standard
if [ -n "$TMPDIR" ]; then
    TEMP_DIR=$(mktemp -d "$TMPDIR/md-docx-XXXXXXXX")
else
    TEMP_DIR=$(mktemp -d "/tmp/md-docx-XXXXXXXX")
fi
COMBINED="${TEMP_DIR}/combined.md"

# Generate header
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SOURCE_NAMES=""
for s in "${SOURCES[@]}"; do SOURCE_NAMES+="$(basename "$s"), "; done
echo "<!-- auto-generated $TIMESTAMP; sources: ${SOURCE_NAMES%, } -->" > "$COMBINED"
echo "" >> "$COMBINED"

# Process sources
echo "[info] Processing sources..."
for FILE in "${SOURCES[@]}"; do
    if [ ! -f "$FILE" ]; then
        echo "Error: File $FILE not found"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    # "Sanitize": 
    # 1. Normalize line endings (CRLF -> LF)
    # 2. Replace lines of exactly '---' with '***' to avoid accidental frontmatter parsing in the middle of doc
    # We use tr for CRLF removal and sed for the dashed line replacement
    
    cat "$FILE" | tr -d '\r' | sed 's/^---$/***/' >> "$COMBINED"
    
    # Add spacing between files
    echo -e "\n" >> "$COMBINED"
done

# Compact headers logic
if [ "$COMPACT_HEADERS" = true ]; then
    echo "[info] Compacting headers..."
    # Portable in-place editing: write to tmp file and move back
    TMP_SED="${COMBINED}.tmp"
    
    # Note: Regex adapted to handle regular UTF-8 characters instead of Mojibake found in PS script
    # Matches: "Ensimmäinen käyttäjäarvo / Earliest User Value" or broad wildcards
    sed 's/Ensimm.*inen k.*ytt.*j.*arvo \/ Earliest User Value/Earliest Value/g' "$COMBINED" > "$TMP_SED" && mv "$TMP_SED" "$COMBINED"
    sed 's/Alku.*monimutkaisuus \/ Initial Complexity/Init Complexity/g' "$COMBINED" > "$TMP_SED" && mv "$TMP_SED" "$COMBINED"
    sed 's/Oracle-riippuvuuden kesto \/ Oracle Dependence/Oracle Dependence/g' "$COMBINED" > "$TMP_SED" && mv "$TMP_SED" "$COMBINED"
    sed 's/P.*hy.*y \/ Primary Benefit/Primary Benefit/g' "$COMBINED" > "$TMP_SED" && mv "$TMP_SED" "$COMBINED"
    sed 's/Tapahtumapohjainen ja indeksoitu hakurakenne/Tapahtumapohjainen + indeksoitu haku/g' "$COMBINED" > "$TMP_SED" && mv "$TMP_SED" "$COMBINED"
fi

# Build pandoc command arguments
PANDOC_ARGS=( \
    --from "markdown+pipe_tables+grid_tables+table_captions+yaml_metadata_block" \
    --toc \
    --toc-depth=3 \
    --columns=120 \
    --resource-path="." \
    --output "$OUTPUT" \
)

if [ -n "$TITLE" ]; then
    PANDOC_ARGS+=(--metadata=title:"$TITLE")
fi

if [ -n "$REFERENCE_DOC" ]; then
    # Resolve reference doc path if needed, usually relative is fine if run from correct dir
    PANDOC_ARGS+=(--reference-doc="$REFERENCE_DOC")
fi

echo "[info] Generating DOCX -> $OUTPUT"
echo "[debug] pandoc ${PANDOC_ARGS[*]} \"$COMBINED\""

pandoc "${PANDOC_ARGS[@]}" "$COMBINED"

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "Error: pandoc failed with exit code $EXIT_CODE"
    if [ "$KEEP_INTERMEDIATE" = true ]; then
        echo "Intermediate file kept at: $COMBINED"
    else
        rm -rf "$TEMP_DIR"
    fi
    exit $EXIT_CODE
fi

if [ "$KEEP_INTERMEDIATE" = true ]; then
    echo "[info] Intermediate file kept at: $COMBINED"
else
    rm -rf "$TEMP_DIR"
fi

echo "[done] Generated: $OUTPUT"
