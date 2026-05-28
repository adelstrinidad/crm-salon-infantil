#!/bin/bash
#
# SYNOPSIS
#     Sanitizes source files for safe AI analysis by redacting sensitive content.
#
# DESCRIPTION
#     Creates sanitized copies of source files with credentials, connection strings,
#     internal URLs, and other sensitive content redacted. Sanitized files are safe
#     to transmit to AI vendors for analysis.
#
# USAGE
#     ./sanitize-for-ai.sh --source <path> [--output <path>] [--strategy <hybrid|aggressive>]
#
# EXAMPLE
#     ./sanitize-for-ai.sh --source ../../../../trunk/{PROJECT}/src --strategy hybrid

set -e

# Default values
SOURCE_PATH=""
OUTPUT_PATH="../artifacts/03-sanitized"
STRATEGY="hybrid"

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
        --strategy)
            STRATEGY="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --source <path> [--output <path>] [--strategy <hybrid|aggressive>]"
            echo ""
            echo "Options:"
            echo "  --source, -s    Path to source code directory to sanitize (required)"
            echo "  --output, -o    Path for sanitized output (default: ../artifacts/03-sanitized)"
            echo "  --strategy      hybrid (default) or aggressive"
            echo "                  - hybrid: Skip CRITICAL files, sanitize HIGH/MEDIUM"
            echo "                  - aggressive: Attempt to sanitize all files"
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
mkdir -p "$OUTPUT_PATH"

echo "=== Content Sanitizer ==="
echo "Source: $SOURCE_PATH"
echo "Output: $OUTPUT_PATH"
echo "Strategy: $STRATEGY"
echo ""

# Track statistics
FILES_PROCESSED=0
FILES_SKIPPED=0
FILES_SANITIZED=0
REDACTIONS_APPLIED=0

# Check if file is CRITICAL (should be skipped in hybrid mode)
is_critical() {
    local file="$1"
    local filename=$(basename "$file")

    case "$filename" in
        *.config|web.config|app.config) return 0 ;;
        *password*|*secret*|*credential*) return 0 ;;
        *.pfx|*.pem|*.key) return 0 ;;
        appsettings*.json) return 0 ;;
    esac
    return 1
}

# Create a temporary file with sanitization patterns for sed
create_sed_patterns() {
    cat << 'SEDPATTERNS'
# Connection strings
s/(connectionstring|connection\s*string)\s*[=:]\s*["'][^"']*["']/\1="[REDACTED-CONNECTION-STRING]"/gi
s/(data source|server)\s*=\s*[^;]+/\1=[REDACTED-SERVER]/gi
s/(user id|uid)\s*=\s*[^;]+/\1=[REDACTED-USER]/gi

# Passwords
s/(password|passwd|pwd)\s*[=:]\s*["'][^"']*["']/\1="[REDACTED-PASSWORD]"/gi

# API keys
s/(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*["'][^"']*["']/\1="[REDACTED-API-KEY]"/gi

# AWS credentials
s/(aws[_-]?(access|secret)[_-]?key)\s*[=:]\s*["'][^"']*["']/\1="[REDACTED-AWS-CREDENTIAL]"/gi
s/AKIA[A-Z0-9]{16}/[REDACTED-AWS-ACCESS-KEY-ID]/g
s/arn:aws:[a-z0-9\-]+:[a-z0-9\-]*:[0-9]*:[^\s"'<>]+/arn:aws:[REDACTED-ARN]/g

# Internal URLs and IPs
s/https?:\/\/[a-z0-9.\-]+\.(internal|local|corp|company|intra)[^\s"'<>]*/https:\/\/[REDACTED-INTERNAL-URL]/gi
s/\b(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3})\b/[REDACTED-INTERNAL-IP]/g

# Private keys
s/-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----.*-----END (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/[REDACTED-PRIVATE-KEY]/g
SEDPATTERNS
}

# Sanitize a single file
sanitize_file() {
    local src_file="$1"
    local rel_path="${src_file#$SOURCE_PATH/}"
    local dest_file="$OUTPUT_PATH/$rel_path"
    local dest_dir=$(dirname "$dest_file")

    # Skip CRITICAL files in hybrid mode
    if [ "$STRATEGY" = "hybrid" ] && is_critical "$src_file"; then
        echo "  SKIP (CRITICAL): $rel_path"
        ((FILES_SKIPPED++))
        return
    fi

    # Create destination directory
    mkdir -p "$dest_dir"

    # Read original content
    local original_content
    original_content=$(cat "$src_file" 2>/dev/null) || {
        echo "  ERROR: Cannot read $rel_path"
        ((FILES_SKIPPED++))
        return
    }

    # Apply sanitization patterns
    local sanitized_content="$original_content"
    local redaction_count=0

    # Connection strings
    local pattern_count=$(echo "$sanitized_content" | grep -ciE '(connectionstring|connection\s*string)\s*[=:]' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/(connectionstring|connection[[:space:]]*string)[[:space:]]*[=:][[:space:]]*["'"'"'][^"'"'"']*["'"'"']/\1="[REDACTED-CONNECTION-STRING]"/gi')
    redaction_count=$((redaction_count + pattern_count))

    # Data source
    pattern_count=$(echo "$sanitized_content" | grep -ciE '(data source|server)\s*=' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/(data[[:space:]]source|server)[[:space:]]*=[[:space:]]*[^;]+/\1=[REDACTED-SERVER]/gi')
    redaction_count=$((redaction_count + pattern_count))

    # User ID
    pattern_count=$(echo "$sanitized_content" | grep -ciE '(user id|uid)\s*=' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/(user[[:space:]]id|uid)[[:space:]]*=[[:space:]]*[^;]+/\1=[REDACTED-USER]/gi')
    redaction_count=$((redaction_count + pattern_count))

    # Passwords
    pattern_count=$(echo "$sanitized_content" | grep -ciE '(password|passwd|pwd)\s*[=:]' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/(password|passwd|pwd)[[:space:]]*[=:][[:space:]]*["'"'"'][^"'"'"']*["'"'"']/\1="[REDACTED-PASSWORD]"/gi')
    redaction_count=$((redaction_count + pattern_count))

    # API keys
    pattern_count=$(echo "$sanitized_content" | grep -ciE 'api[_-]?(key|secret)\s*[=:]' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/(api[_-]?(key|secret))[[:space:]]*[=:][[:space:]]*["'"'"'][^"'"'"']*["'"'"']/\1="[REDACTED-API-KEY]"/gi')
    redaction_count=$((redaction_count + pattern_count))

    # AWS access key IDs
    pattern_count=$(echo "$sanitized_content" | grep -c 'AKIA[A-Z0-9]\{16\}' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/AKIA[A-Z0-9]{16}/[REDACTED-AWS-ACCESS-KEY-ID]/g')
    redaction_count=$((redaction_count + pattern_count))

    # AWS ARNs
    pattern_count=$(echo "$sanitized_content" | grep -c 'arn:aws:' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/arn:aws:[a-z0-9-]+:[a-z0-9-]*:[0-9]*:[^[:space:]"'"'"'<>]+/arn:aws:[REDACTED-ARN]/g')
    redaction_count=$((redaction_count + pattern_count))

    # Internal URLs
    pattern_count=$(echo "$sanitized_content" | grep -ciE 'https?://[a-z0-9.-]+\.(internal|local|corp|intra)' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's|https?://[a-z0-9.-]+\.(internal|local|corp|company|intra)[^[:space:]"'"'"'<>]*|https://[REDACTED-INTERNAL-URL]|gi')
    redaction_count=$((redaction_count + pattern_count))

    # Internal IPs
    pattern_count=$(echo "$sanitized_content" | grep -cE '(10\.[0-9]+\.[0-9]+\.[0-9]+|192\.168\.[0-9]+\.[0-9]+|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]+\.[0-9]+)' || echo "0")
    sanitized_content=$(echo "$sanitized_content" | sed -E 's/\b(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3})\b/[REDACTED-INTERNAL-IP]/g')
    redaction_count=$((redaction_count + pattern_count))

    # Write sanitized content
    echo "$sanitized_content" > "$dest_file"

    ((FILES_PROCESSED++))

    if [ "$redaction_count" -gt 0 ]; then
        echo "  SANITIZED ($redaction_count redactions): $rel_path"
        ((FILES_SANITIZED++))
        REDACTIONS_APPLIED=$((REDACTIONS_APPLIED + redaction_count))
    else
        echo "  COPIED (clean): $rel_path"
    fi
}

echo "Processing files..."

# Find and process all relevant files
while IFS= read -r -d '' file; do
    sanitize_file "$file"
done < <(find "$SOURCE_PATH" -type f \( -name "*.cs" -o -name "*.config" -o -name "*.json" -o -name "*.xml" -o -name "*.sql" -o -name "*.txt" -o -name "*.md" \) -print0 2>/dev/null)

# Generate sanitization report
REPORT_PATH="$OUTPUT_PATH/SANITIZATION-REPORT.md"
cat > "$REPORT_PATH" << EOF
# Sanitization Report

**Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Source Path**: $SOURCE_PATH
**Output Path**: $OUTPUT_PATH
**Strategy**: $STRATEGY

---

## Summary

| Metric | Count |
|--------|-------|
| Files Processed | $FILES_PROCESSED |
| Files Sanitized | $FILES_SANITIZED |
| Files Skipped (CRITICAL) | $FILES_SKIPPED |
| Total Redactions | $REDACTIONS_APPLIED |

---

## Redaction Rules Applied

| Rule | Description |
|------|-------------|
| ConnectionString | Database connection strings |
| Password | Password values |
| APIKey | API keys and secrets |
| AWSCredential | AWS access/secret keys |
| DataSource | Database server references |
| UserID | Database user IDs |
| AWSArn | AWS resource ARNs |
| InternalURL | Internal URLs (.internal, .local, .corp) |
| InternalIP | Private IP addresses (10.x, 192.168.x, 172.16-31.x) |
| PrivateKey | RSA/DSA/EC private keys |

---

## Next Steps

1. **Review sanitized files** in \`$OUTPUT_PATH\`
2. **Verify no sensitive content remains** - spot check critical files
3. **Document any manual redactions** needed
4. **Proceed with AI analysis** using sanitized files only

---

*Sanitized files are safe to transmit to AI vendors for analysis.*
EOF

echo ""
echo "=== Sanitization Complete ==="
echo ""
echo "Summary:"
echo "  Files Processed:  $FILES_PROCESSED"
echo "  Files Sanitized:  $FILES_SANITIZED"
echo "  Files Skipped:    $FILES_SKIPPED"
echo "  Redactions:       $REDACTIONS_APPLIED"
echo ""
echo "Output saved to: $OUTPUT_PATH"
echo "Report saved to: $REPORT_PATH"
echo ""
echo "NEXT: Review sanitized files before AI analysis."
