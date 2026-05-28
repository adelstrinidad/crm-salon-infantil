#!/usr/bin/env bash
#
# legacy-analysis-setup.sh - Create folder structure for legacy analysis workflows
#
# Part of n-ai1st-kit - AI-assisted development toolkit
# Version: 1.0.0
# Created: 2026-02-03
#
# Usage:
#   ./legacy-analysis-setup.sh -r "/path/to/analysis" [-t full|lite|quality]
#   ./legacy-analysis-setup.sh --root "." --type lite
#
# Options:
#   -r, --root    Analysis output directory (required)
#   -t, --type    Process type: full (ai1st-arch-legacy-sys-analysis), lite (ai1st-arch-legacy-analysis-lite), quality (ai1st-arch-code-quality-analysis)
#                 Default: full
#   -h, --help    Show this help message
#
# Examples:
#   ./legacy-analysis-setup.sh -r "/home/user/project/analysis" -t full
#   ./legacy-analysis-setup.sh --root "./lite-analysis" --type lite

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Defaults
ANALYSIS_ROOT=""
PROCESS_TYPE="full"

# Show help
show_help() {
    echo "Usage: $0 -r <analysis-root> [-t full|lite|quality]"
    echo ""
    echo "Create folder structure for legacy analysis workflows."
    echo ""
    echo "Options:"
    echo "  -r, --root    Analysis output directory (required)"
    echo "  -t, --type    Process type: full (ai1st-arch-legacy-sys-analysis), lite (ai1st-arch-legacy-analysis-lite), quality (ai1st-arch-code-quality-analysis)"
    echo "                Default: full"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -r /path/to/analysis -t full"
    echo "  $0 --root ./lite-analysis --type lite"
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--root)
            ANALYSIS_ROOT="$2"
            shift 2
            ;;
        -t|--type)
            PROCESS_TYPE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Validate arguments
if [[ -z "$ANALYSIS_ROOT" ]]; then
    echo "Error: Analysis root path required"
    echo "Usage: $0 -r /path/to/analysis [-t full|lite|quality]"
    exit 1
fi

if [[ ! "$PROCESS_TYPE" =~ ^(full|lite|quality)$ ]]; then
    echo "Error: Invalid process type '$PROCESS_TYPE'"
    echo "Valid types: full, lite, quality"
    exit 1
fi

# Create root directory if needed
if [[ ! -d "$ANALYSIS_ROOT" ]]; then
    mkdir -p "$ANALYSIS_ROOT"
fi

# Get absolute path
ANALYSIS_ROOT=$(cd "$ANALYSIS_ROOT" && pwd)

# Helper function to create folder
create_folder() {
    local path="$1"
    if [[ ! -d "$path" ]]; then
        mkdir -p "$path"
        echo -e "  ${GREEN}Created:${NC} $path"
    else
        echo -e "  ${YELLOW}Exists:${NC}  $path"
    fi
}

echo ""
echo -e "${CYAN}=== Legacy Analysis Folder Setup ===${NC}"
echo -e "${WHITE}Analysis Root:${NC} $ANALYSIS_ROOT"
echo -e "${WHITE}Process Type:${NC}  $PROCESS_TYPE"
echo ""

# Common folders (all process types)
echo -e "${CYAN}Creating common folders...${NC}"
create_folder "$ANALYSIS_ROOT/work"
create_folder "$ANALYSIS_ROOT/work/01-reconnaissance"
create_folder "$ANALYSIS_ROOT/docs/business-context"

# Process-specific folders
case $PROCESS_TYPE in
    full)
        echo ""
        echo -e "${CYAN}Creating full analysis folders (ai1st-arch-legacy-sys-analysis)...${NC}"
        create_folder "$ANALYSIS_ROOT/arch-as-is"
        create_folder "$ANALYSIS_ROOT/arch-as-is/diagrams"
        create_folder "$ANALYSIS_ROOT/arch-as-is/diagrams/exports"
        create_folder "$ANALYSIS_ROOT/arch-as-is/appendices"
        create_folder "$ANALYSIS_ROOT/arch-to-be"
        create_folder "$ANALYSIS_ROOT/arch-to-be/diagrams"
        create_folder "$ANALYSIS_ROOT/arch-to-be/diagrams/exports"
        create_folder "$ANALYSIS_ROOT/templates/arc42"
        create_folder "$ANALYSIS_ROOT/templates/analysis-templates"
        create_folder "$ANALYSIS_ROOT/work/02-environment"
        create_folder "$ANALYSIS_ROOT/work/03-metrics"
        create_folder "$ANALYSIS_ROOT/work/04-findings"
        create_folder "$ANALYSIS_ROOT/work/05-analysis"
        create_folder "$ANALYSIS_ROOT/work/05-analysis/csharp"
        create_folder "$ANALYSIS_ROOT/work/05-analysis/database"
        create_folder "$ANALYSIS_ROOT/work/05-analysis/integration"
        create_folder "$ANALYSIS_ROOT/work/06-review"
        create_folder "$ANALYSIS_ROOT/work/07-synthesis"
        create_folder "$ANALYSIS_ROOT/work/07-synthesis/requirements"
        create_folder "$ANALYSIS_ROOT/work/08-validation"
        create_folder "$ANALYSIS_ROOT/work/09-summaries"

        # Create gate-tracking.md
        GATE_FILE="$ANALYSIS_ROOT/work/gate-tracking.md"
        if [[ ! -f "$GATE_FILE" ]]; then
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
            cat > "$GATE_FILE" << EOF
# Gate Tracking Log

## Session Variables (COPY ON RESUME)

\`\`\`
{PROJECT_ROOT}: [TO BE SET]
{ANALYSIS_ROOT}: $ANALYSIS_ROOT
Process: ai1st-arch-legacy-sys-analysis (Full)
Started: $TIMESTAMP
\`\`\`

## Context Reload Files (READ AFTER /clear)

1. \`{PROJECT_ROOT}/.ai_project_memory/constitution-legacy-analysis.md\`
2. \`{PROJECT_ROOT}/.ai/legacy-analysis-process/process-steps/as-is-brownfield/how-to-perform-legacy-analysis.md\`
3. \`{ANALYSIS_ROOT}/work/gate-tracking.md\` (this file)

## Gate Status

| Gate | Status | Timestamp | Decision | Clear Context? |
|------|--------|-----------|----------|----------------|
| Gate 0 | Pending | | | YES - before Step 02 |
| Gate 1 | Pending | | | Optional |
| Gate 2 | Pending | | | YES - before Step 05 |
| Gate 3 | Pending | | | YES - before Step 06 |
| Gate 4 | Pending | | | YES - before Step 07 |
| Gate 5 | Pending | | | YES - before Step 09 |
| Gate 6 | Pending | | | End |

---

## Gate Log

_(Entries appended as gates are passed)_

EOF
            echo ""
            echo -e "  ${GREEN}Created:${NC} work/gate-tracking.md"
        fi
        ;;

    lite)
        echo ""
        echo -e "${CYAN}Creating LITE analysis folders (ai1st-arch-legacy-analysis-lite)...${NC}"
        create_folder "$ANALYSIS_ROOT/arch-as-is-lite"
        create_folder "$ANALYSIS_ROOT/arch-as-is-lite/dto"
        ;;

    quality)
        echo ""
        echo -e "${CYAN}Creating quality analysis folders (ai1st-arch-code-quality-analysis)...${NC}"
        create_folder "$ANALYSIS_ROOT/work/quality-metrics"
        ;;
esac

# Summary
echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${WHITE}Folder structure created at:${NC} $ANALYSIS_ROOT"
echo ""
echo -e "${CYAN}Next steps - run your analysis command:${NC}"

case $PROCESS_TYPE in
    full)
        echo -e "  ${YELLOW}/ai1st-arch-legacy-sys-analysis${NC}"
        ;;
    lite)
        echo -e "  ${YELLOW}/ai1st-arch-legacy-analysis-lite${NC}"
        ;;
    quality)
        echo -e "  ${YELLOW}/ai1st-arch-code-quality-analysis${NC}"
        ;;
esac

echo ""
