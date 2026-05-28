#!/bin/bash
#
# SYNOPSIS
#     Generates content classification report for AI analysis decisions.
#
# DESCRIPTION
#     Analyzes codebase and generates a classification report categorizing files
#     by sensitivity level (CRITICAL, HIGH, MEDIUM, LOW). Uses secrets scan
#     results if available.
#
# USAGE
#     ./classify-content.sh --source <path> [--secrets <path>] [--output <path>]
#
# EXAMPLE
#     ./classify-content.sh --source ../../../../trunk/{PROJECT}/src

set -e

# Default values
SOURCE_PATH=""
SECRETS_FILE="../artifacts/02-metrics/secrets-scan.json"
OUTPUT_PATH="../artifacts/02-metrics/CLASSIFICATION-REPORT.md"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --source|-s)
            SOURCE_PATH="$2"
            shift 2
            ;;
        --secrets)
            SECRETS_FILE="$2"
            shift 2
            ;;
        --output|-o)
            OUTPUT_PATH="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --source <path> [--secrets <path>] [--output <path>]"
            echo ""
            echo "Options:"
            echo "  --source, -s    Path to source code directory to classify (required)"
            echo "  --secrets       Path to secrets-scan.json (default: ../artifacts/02-metrics/secrets-scan.json)"
            echo "  --output, -o    Path for output report (default: ../artifacts/02-metrics/CLASSIFICATION-REPORT.md)"
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
    exit 1
fi

# Ensure output directory exists
OUTPUT_DIR=$(dirname "$OUTPUT_PATH")
mkdir -p "$OUTPUT_DIR"

echo "=== Content Classifier ==="
echo "Source: $SOURCE_PATH"
echo "Output: $OUTPUT_PATH"
echo ""

# Check for secrets file
SECRETS_LOADED=false
SECRETS_COUNT=0
if [ -f "$SECRETS_FILE" ]; then
    echo "Loading secrets scan from: $SECRETS_FILE"
    SECRETS_LOADED=true
    SECRETS_COUNT=$(jq -r '.TotalFindings // 0' "$SECRETS_FILE" 2>/dev/null || echo "0")
fi

# Initialize arrays for classification
declare -a CRITICAL_FILES
declare -a HIGH_FILES
declare -a MEDIUM_FILES
declare -a LOW_FILES
declare -a UNCLASSIFIED_FILES

# Classify a single file
classify_file() {
    local file="$1"
    local rel_path="${file#$SOURCE_PATH/}"
    local filename=$(basename "$file")
    local classified=false

    # CRITICAL patterns
    if [[ "$filename" == *.config ]] || \
       [[ "$filename" == "web.config" ]] || \
       [[ "$filename" == "app.config" ]] || \
       [[ "$filename" == appsettings*.json ]] || \
       [[ "$filename" == *connectionstring* ]] || \
       [[ "$filename" == *password* ]] || \
       [[ "$filename" == *secret* ]] || \
       [[ "$filename" == *credential* ]] || \
       [[ "$filename" == *.pfx ]] || \
       [[ "$filename" == *.pem ]] || \
       [[ "$filename" == *.key ]]; then
        CRITICAL_FILES+=("$rel_path|Configuration/credential file")
        return
    fi

    # HIGH patterns
    if [[ "$file" == */Sync/* ]] || \
       [[ "$file" == */SNS*/* ]] || \
       [[ "$filename" == *Calculator* ]] || \
       [[ "$filename" == *Coordinate* ]] || \
       [[ "$file" == */packages/* ]] || \
       [[ "$file" == */procedures/* ]] || \
       [[ "$filename" == *.sql ]]; then
        HIGH_FILES+=("$rel_path|Business/integration logic")
        return
    fi

    # MEDIUM patterns
    if [[ "$filename" == *Service*.cs ]] || \
       [[ "$filename" == *Repository*.cs ]] || \
       [[ "$filename" == *Validator*.cs ]] || \
       [[ "$filename" == *Handler*.cs ]]; then
        MEDIUM_FILES+=("$rel_path|Service/data layer")
        return
    fi

    # LOW patterns
    if [[ "$filename" == *.csproj ]] || \
       [[ "$filename" == *.sln ]] || \
       [[ "$file" == */obj/* ]] || \
       [[ "$file" == */bin/* ]] || \
       [[ "$filename" == *.Designer.cs ]] || \
       [[ "$filename" == "AssemblyInfo.cs" ]] || \
       [[ "$filename" == *.md ]]; then
        LOW_FILES+=("$rel_path|Project/generated file")
        return
    fi

    # Unclassified
    UNCLASSIFIED_FILES+=("$rel_path|No classification rule matched")
}

echo "Classifying files..."

# Find and classify all relevant files
while IFS= read -r -d '' file; do
    classify_file "$file"
done < <(find "$SOURCE_PATH" -type f \( -name "*.cs" -o -name "*.config" -o -name "*.json" -o -name "*.xml" -o -name "*.sql" -o -name "*.csproj" -o -name "*.sln" \) -print0 2>/dev/null)

TOTAL_FILES=$((${#CRITICAL_FILES[@]} + ${#HIGH_FILES[@]} + ${#MEDIUM_FILES[@]} + ${#LOW_FILES[@]} + ${#UNCLASSIFIED_FILES[@]}))

# Generate report
cat > "$OUTPUT_PATH" << EOF
# Content Classification Report

**Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Source Path**: $SOURCE_PATH
**Secrets Scan**: $(if [ "$SECRETS_LOADED" = true ]; then echo "Loaded ($SECRETS_COUNT findings)"; else echo "Not available"; fi)

---

## Summary

| Classification | Files | AI Analysis? | Action Required |
|----------------|-------|--------------|-----------------|
| **CRITICAL** | ${#CRITICAL_FILES[@]} | **NO** | Use local tools only |
| **HIGH** | ${#HIGH_FILES[@]} | **SANITIZE** | Redact before AI analysis |
| **MEDIUM** | ${#MEDIUM_FILES[@]} | Review | Human review before AI |
| **LOW** | ${#LOW_FILES[@]} | YES | Safe for AI analysis |
| Unclassified | ${#UNCLASSIFIED_FILES[@]} | Review | Manual classification needed |

**Total Files**: $TOTAL_FILES

---

## Decision Required

Before proceeding with AI analysis, you must choose a strategy:

### Option 1: Full AI Analysis (Default)
- All files sent to AI vendor
- Fastest analysis
- **Risk**: Credentials, proprietary logic transmitted externally

### Option 2: Hybrid Analysis (Recommended)
- CRITICAL/HIGH files: Local tools only
- MEDIUM files: Review and sanitize
- LOW files: AI analysis
- **Risk**: Moderate, balanced approach

### Option 3: Local Only
- No files sent to AI
- Use NDepend, SonarQube, DocFX locally
- **Risk**: None, but limited AI-assisted insights

---

## CRITICAL Files (${#CRITICAL_FILES[@]})

> **Action**: NEVER transmit to AI. Use local tools only.

| File | Reason |
|------|--------|
EOF

for item in "${CRITICAL_FILES[@]}"; do
    file="${item%|*}"
    reason="${item#*|}"
    echo "| \`$file\` | $reason |" >> "$OUTPUT_PATH"
done

cat >> "$OUTPUT_PATH" << EOF

---

## HIGH Risk Files (${#HIGH_FILES[@]})

> **Action**: Sanitize heavily or use local tools.

| File | Reason |
|------|--------|
EOF

count=0
for item in "${HIGH_FILES[@]}"; do
    if [ $count -ge 50 ]; then
        echo "| ... | ($((${#HIGH_FILES[@]} - 50)) more files) |" >> "$OUTPUT_PATH"
        break
    fi
    file="${item%|*}"
    reason="${item#*|}"
    echo "| \`$file\` | $reason |" >> "$OUTPUT_PATH"
    ((count++))
done

cat >> "$OUTPUT_PATH" << EOF

---

## MEDIUM Risk Files (${#MEDIUM_FILES[@]})

> **Action**: Review before transmission, redact sensitive values.

| File | Reason |
|------|--------|
EOF

count=0
for item in "${MEDIUM_FILES[@]}"; do
    if [ $count -ge 30 ]; then
        echo "| ... | ($((${#MEDIUM_FILES[@]} - 30)) more files) |" >> "$OUTPUT_PATH"
        break
    fi
    file="${item%|*}"
    reason="${item#*|}"
    echo "| \`$file\` | $reason |" >> "$OUTPUT_PATH"
    ((count++))
done

cat >> "$OUTPUT_PATH" << EOF

---

## LOW Risk Files (${#LOW_FILES[@]})

> **Action**: Safe for AI analysis.

Files with low sensitivity (project files, generated code, documentation) are safe to transmit.

---

## Next Steps

1. **Review this report** with security/compliance team
2. **Choose analysis strategy** (Full AI / Hybrid / Local Only)
3. **Document decision** in \`artifacts/02-metrics/ANALYSIS-STRATEGY-DECISION.md\`
4. **Run sanitization** if using Hybrid approach: \`./sanitize-for-ai.sh\`
5. **Proceed** with Step 05: Component Analysis

---

*This report was generated locally. No data was transmitted to external services.*
EOF

echo ""
echo "=== Classification Complete ==="
echo ""
echo "Summary:"
echo "  CRITICAL:     ${#CRITICAL_FILES[@]} files"
echo "  HIGH:         ${#HIGH_FILES[@]} files"
echo "  MEDIUM:       ${#MEDIUM_FILES[@]} files"
echo "  LOW:          ${#LOW_FILES[@]} files"
echo "  Unclassified: ${#UNCLASSIFIED_FILES[@]} files"
echo ""
echo "Report saved to: $OUTPUT_PATH"
echo ""
echo "NEXT: Review the classification report and choose an analysis strategy."
