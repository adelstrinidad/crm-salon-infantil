#!/bin/bash
#
# SYNOPSIS
#     Scans codebase for secrets and credentials. Runs entirely locally.
#
# DESCRIPTION
#     Pattern-based detection of connection strings, API keys, passwords, and other
#     sensitive content. Results help classify content before AI analysis.
#
# USAGE
#     ./scan-secrets.sh --source <path> [--output <path>]
#
# EXAMPLE
#     ./scan-secrets.sh --source ../../../../trunk/{PROJECT}/src

set -e

# Default values
SOURCE_PATH=""
OUTPUT_PATH="../artifacts/02-metrics/secrets-scan.json"

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
            echo "  --source, -s    Path to source code directory to scan (required)"
            echo "  --output, -o    Path for output JSON file (default: ../artifacts/02-metrics/secrets-scan.json)"
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

# Ensure output directory exists
OUTPUT_DIR=$(dirname "$OUTPUT_PATH")
mkdir -p "$OUTPUT_DIR"

echo "=== Secret Scanner ==="
echo "Source: $SOURCE_PATH"
echo "Output: $OUTPUT_PATH"
echo ""

# Initialize counters
FILE_COUNT=0
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

# Temporary file for findings
FINDINGS_FILE=$(mktemp)
echo "[" > "$FINDINGS_FILE"
FIRST_FINDING=true

# Function to add finding
add_finding() {
    local file="$1"
    local line="$2"
    local type="$3"
    local severity="$4"
    local description="$5"
    local preview="$6"

    # Redact sensitive values in preview
    preview=$(echo "$preview" | sed -E 's/(password|pwd|secret|key)\s*[=:]\s*['"'"'"][^'"'"'"]*['"'"'"]/\1=***REDACTED***/gi')

    # Truncate preview if too long
    if [ ${#preview} -gt 50 ]; then
        preview="${preview:0:50}..."
    fi

    # Escape for JSON
    file=$(echo "$file" | sed 's/\\/\\\\/g; s/"/\\"/g')
    preview=$(echo "$preview" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g; s/\r//g; s/\n/\\n/g')

    if [ "$FIRST_FINDING" = true ]; then
        FIRST_FINDING=false
    else
        echo "," >> "$FINDINGS_FILE"
    fi

    cat >> "$FINDINGS_FILE" << EOF
  {
    "File": "$file",
    "Line": $line,
    "Type": "$type",
    "Severity": "$severity",
    "Description": "$description",
    "Preview": "$preview"
  }
EOF

    case $severity in
        CRITICAL) ((CRITICAL_COUNT++)) ;;
        HIGH) ((HIGH_COUNT++)) ;;
        MEDIUM) ((MEDIUM_COUNT++)) ;;
        LOW) ((LOW_COUNT++)) ;;
    esac
}

echo "Scanning for patterns..."

# Define patterns and scan
scan_pattern() {
    local pattern="$1"
    local type="$2"
    local severity="$3"
    local description="$4"

    while IFS=: read -r file line_num match; do
        if [ -n "$file" ] && [ -n "$line_num" ]; then
            rel_path="${file#$SOURCE_PATH/}"
            add_finding "$rel_path" "$line_num" "$type" "$severity" "$description" "$match"
        fi
    done < <(grep -rniE "$pattern" "$SOURCE_PATH" --include="*.cs" --include="*.config" --include="*.json" --include="*.xml" --include="*.yml" --include="*.yaml" --include="*.sql" --include="*.ps1" --include="*.sh" 2>/dev/null || true)
}

# Count files
FILE_COUNT=$(find "$SOURCE_PATH" -type f \( -name "*.cs" -o -name "*.config" -o -name "*.json" -o -name "*.xml" -o -name "*.yml" -o -name "*.yaml" -o -name "*.sql" -o -name "*.ps1" -o -name "*.sh" \) 2>/dev/null | wc -l)

# Run pattern scans
scan_pattern "(connectionstring|connection\s*string)[^;]*=\s*['\"][^'\"]+['\"]" "ConnectionString" "CRITICAL" "Database connection string"
scan_pattern "(data source|server)\s*=\s*[^;]+" "DataSource" "CRITICAL" "Database server reference"
scan_pattern "(password|passwd|pwd)\s*[=:]\s*['\"][^'\"]+['\"]" "Password" "CRITICAL" "Hardcoded password"
scan_pattern "(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['\"][\w\-]+" "APIKey" "CRITICAL" "API key or secret"
scan_pattern "(aws[_-]?(access|secret)|AKIA[A-Z0-9]{16})" "AWSCredential" "CRITICAL" "AWS credential"
scan_pattern "arn:aws:[a-z0-9\-]+:[a-z0-9\-]*:[0-9]*:[^\s'\"<>]+" "AWSArn" "HIGH" "AWS ARN (resource identifier)"
scan_pattern "-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----" "PrivateKey" "CRITICAL" "Private key"
scan_pattern "https?://[a-z0-9.\-]+\.(internal|local|corp|company|intra)[^\s'\"<>]*" "InternalURL" "HIGH" "Internal URL"
scan_pattern "\b(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3})\b" "InternalIP" "HIGH" "Internal IP address"
scan_pattern "(server[_-]?name|hostname)\s*[=:]\s*['\"][^'\"]+['\"]" "ServerName" "MEDIUM" "Server name reference"
scan_pattern "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|fi|eu)" "Email" "LOW" "Email address"

echo "]" >> "$FINDINGS_FILE"

TOTAL_FINDINGS=$((CRITICAL_COUNT + HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT))

# Generate final JSON
cat > "$OUTPUT_PATH" << EOF
{
  "ScanDate": "$(date '+%Y-%m-%d %H:%M:%S')",
  "SourcePath": "$SOURCE_PATH",
  "FilesScanned": $FILE_COUNT,
  "TotalFindings": $TOTAL_FINDINGS,
  "BySeverity": {
    "CRITICAL": $CRITICAL_COUNT,
    "HIGH": $HIGH_COUNT,
    "MEDIUM": $MEDIUM_COUNT,
    "LOW": $LOW_COUNT
  },
  "Findings": $(cat "$FINDINGS_FILE")
}
EOF

rm "$FINDINGS_FILE"

echo ""
echo "=== Scan Complete ==="
echo "Files scanned: $FILE_COUNT"
echo "Total findings: $TOTAL_FINDINGS"
echo ""
echo "By Severity:"
echo "  CRITICAL: $CRITICAL_COUNT"
echo "  HIGH:     $HIGH_COUNT"
echo "  MEDIUM:   $MEDIUM_COUNT"
echo "  LOW:      $LOW_COUNT"
echo ""
echo "Results saved to: $OUTPUT_PATH"

if [ $CRITICAL_COUNT -gt 0 ]; then
    echo ""
    echo "WARNING: CRITICAL findings detected!"
    echo "Review secrets-scan.json before any AI analysis."
fi
