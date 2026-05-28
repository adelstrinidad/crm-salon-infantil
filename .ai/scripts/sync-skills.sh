#!/bin/bash
# Sync Skills from Anthropic Repository
# Usage: ./sync-skills.sh [tier1|tier2|all|skill-name]

set -e

# Configuration
UPSTREAM="/c/GIT/skills/skills"
TARGET="$(dirname "$0")/../../.ai/skills"
SCRIPT_DIR="$(dirname "$0")"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Tier 1: Essential Skills
TIER1_SKILLS=(
  "skill-creator"
  "doc-coauthoring"
  "frontend-design"
  "webapp-testing"
  "internal-comms"
)

# Tier 2: High Value Skills
TIER2_SKILLS=(
  "mcp-builder"
  "docx"
  "pdf"
  "xlsx"
)

# Function to sync a single skill
sync_skill() {
  local skill=$1
  local upstream_path="$UPSTREAM/$skill"
  local target_path="$TARGET/$skill"

  echo -e "${YELLOW}Syncing: $skill${NC}"

  # Check if skill exists upstream
  if [ ! -d "$upstream_path" ]; then
    echo -e "${RED}  ❌ Not found: $upstream_path${NC}"
    return 1
  fi

  # Create target directory
  mkdir -p "$target_path"

  # Copy skill files (rsync if available, otherwise cp)
  if command -v rsync &> /dev/null; then
    rsync -av --delete \
      --exclude='.git*' \
      --exclude='node_modules' \
      --exclude='__pycache__' \
      --exclude='*.pyc' \
      "$upstream_path/" "$target_path/"
  else
    # Fallback to cp
    rm -rf "$target_path"
    cp -r "$upstream_path" "$target_path"
  fi

  echo -e "${GREEN}  ✅ Synced: $skill${NC}"
  return 0
}

# Function to list available skills
list_skills() {
  echo "=== Available Skills in Upstream ==="
  for skill_dir in "$UPSTREAM"/*; do
    if [ -d "$skill_dir" ]; then
      skill=$(basename "$skill_dir")
      if [ -f "$skill_dir/SKILL.md" ]; then
        # Extract description from SKILL.md
        desc=$(grep "^description:" "$skill_dir/SKILL.md" | sed 's/description: *//' | cut -c1-60)
        echo "  - $skill: $desc..."
      else
        echo "  - $skill (no SKILL.md)"
      fi
    fi
  done
  echo ""
}

# Function to sync tier
sync_tier() {
  local tier=$1
  local skills=()

  case $tier in
    tier1|1)
      skills=("${TIER1_SKILLS[@]}")
      echo "=== Syncing Tier 1: Essential Skills ==="
      ;;
    tier2|2)
      skills=("${TIER2_SKILLS[@]}")
      echo "=== Syncing Tier 2: High Value Skills ==="
      ;;
    all)
      skills=("${TIER1_SKILLS[@]}" "${TIER2_SKILLS[@]}")
      echo "=== Syncing All Recommended Skills ==="
      ;;
    *)
      echo -e "${RED}Unknown tier: $tier${NC}"
      return 1
      ;;
  esac

  local success_count=0
  local fail_count=0

  for skill in "${skills[@]}"; do
    if sync_skill "$skill"; then
      ((success_count++))
    else
      ((fail_count++))
    fi
  done

  echo ""
  echo "=== Sync Summary ==="
  echo -e "${GREEN}  ✅ Success: $success_count${NC}"
  if [ $fail_count -gt 0 ]; then
    echo -e "${RED}  ❌ Failed: $fail_count${NC}"
  fi
}

# Function to check upstream status
check_upstream() {
  echo "=== Checking Upstream Repository ==="
  cd "$UPSTREAM/.." || exit 1

  if [ -d ".git" ]; then
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --oneline)"
    echo "Status:"
    git status --short

    # Check for updates
    echo ""
    echo "Checking for remote updates..."
    git fetch origin --quiet
    local behind=$(git rev-list HEAD..origin/$(git branch --show-current) --count)
    if [ "$behind" -gt 0 ]; then
      echo -e "${YELLOW}⚠️  Upstream is $behind commits ahead${NC}"
      echo "Run: cd $UPSTREAM/.. && git pull"
    else
      echo -e "${GREEN}✅ Upstream is up to date${NC}"
    fi
  else
    echo -e "${RED}❌ Not a git repository${NC}"
  fi
  echo ""
}

# Function to show usage
show_usage() {
  cat << EOF
Usage: $0 [COMMAND]

Commands:
  tier1               Sync Tier 1 essential skills
  tier2               Sync Tier 2 high-value skills
  all                 Sync all recommended skills (Tier 1 + Tier 2)
  list                List all available upstream skills
  status              Check upstream repository status
  skill-name          Sync a specific skill by name
  help                Show this help message

Examples:
  $0 tier1                    # Sync essential skills
  $0 all                      # Sync all recommended skills
  $0 frontend-design          # Sync specific skill
  $0 list                     # List available skills
  $0 status                   # Check for upstream updates

Tier 1 Skills: ${TIER1_SKILLS[*]}
Tier 2 Skills: ${TIER2_SKILLS[*]}

EOF
}

# Main script logic
main() {
  # Check if upstream exists
  if [ ! -d "$UPSTREAM" ]; then
    echo -e "${RED}❌ Upstream repository not found: $UPSTREAM${NC}"
    echo "Please clone: git clone https://github.com/anthropics/skills.git /c/GIT/skills"
    exit 1
  fi

  # Create target directory
  mkdir -p "$TARGET"

  # Parse command
  local command=${1:-help}

  case $command in
    tier1|tier2|all)
      sync_tier "$command"
      ;;
    list)
      list_skills
      ;;
    status)
      check_upstream
      ;;
    help|--help|-h)
      show_usage
      ;;
    *)
      # Assume it's a skill name
      if [ -d "$UPSTREAM/$command" ]; then
        sync_skill "$command"
      else
        echo -e "${RED}❌ Unknown command or skill: $command${NC}"
        echo ""
        show_usage
        exit 1
      fi
      ;;
  esac
}

# Run main
main "$@"
