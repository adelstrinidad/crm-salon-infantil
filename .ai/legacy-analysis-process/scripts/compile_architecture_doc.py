#!/usr/bin/env python3
"""
Compile Arc42 architecture documentation from individual section files.

This script merges individual Arc42 section files (which contain mermaid/plantuml diagrams)
into a single combined markdown document. The combined document is then processed by
render_diagrams_for_doc.py to generate DOCX/PDF with rendered diagrams.

Usage:
    python compile_architecture_doc.py

Output:
    docs/ai/legacy_analysis/arch-as-is/AS-IS-ARCHITECTURE-COMPLETE.md

After running this script, run render_diagrams_for_doc.py to generate Word/PDF.
"""
import re
import sys
from pathlib import Path
from datetime import datetime

# --- Configuration ---
SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT = SCRIPT_DIR.parents[3]

ARCH_AS_IS_DIR = REPO_ROOT / "docs" / "ai" / "legacy_analysis" / "arch-as-is"
SUMMARIES_DIR = REPO_ROOT / "docs" / "ai" / "legacy_analysis" / "work" / "09-summaries"
OUTPUT_FILE = ARCH_AS_IS_DIR / "AS-IS-ARCHITECTURE-COMPLETE.md"

# --- Document Structure ---
# YAML frontmatter for Pandoc
YAML_FRONTMATTER = '''---
title: "AS-IS Architecture Documentation"
subtitle: "Complete Arc42 Architecture Documentation of the Current System"
author: "AI-Assisted Legacy System Analysis"
date: "{date}"
abstract: |
  This document provides complete Arc42 architecture documentation of the current
  legacy system, including business context, technical architecture, system constraints,
  component structure, deployment infrastructure, quality requirements, technical debt
  analysis, and glossary.

  **Purpose**: This documentation serves as the baseline for understanding the current
  system and was generated during AI-assisted legacy system analysis process.
toc: true
toc-depth: 3
numbersections: true
---

'''

# Executive summaries to include (in order)
EXECUTIVE_SUMMARIES = [
    "EXECUTIVE-SUMMARY.md",
    "TECHNICAL-SUMMARY.md",
    "SYSTEM-CAPABILITIES-SUMMARY.md",
    "TRIBAL-KNOWLEDGE-CATALOG.md",
    "DOCUMENTATION-GAP-REPORT.md",
    "ACTION-PLAN.md",
]

# Required executive summary files (MANDATORY - fail if missing)
REQUIRED_SUMMARIES = [
    "EXECUTIVE-SUMMARY.md",
    "TECHNICAL-SUMMARY.md",
    "SYSTEM-CAPABILITIES-SUMMARY.md",
    "TRIBAL-KNOWLEDGE-CATALOG.md",
    "DOCUMENTATION-GAP-REPORT.md",
    "ACTION-PLAN.md",
]

# Arc42 section files to include (in order)
ARC42_SECTIONS = [
    "01-introduction-goals.md",
    "02-constraints.md",
    "03-context-scope.md",
    "04-solution-strategy.md",
    "05-building-block-view.md",
    "06-runtime-view.md",
    "07-deployment-view.md",
    "08-domain-rules-and-guidelines.md",
    "09-architecture-decisions.md",
    "10-quality-requirements.md",
    "11-risks-technical-debt.md",
    "12-glossary.md",
    "13-documentation-reality-vs-code-reality.md",
]

# Appendices
APPENDICES = [
    "A1-requirements-traceability-matrix.md",
]

# Final reports
FINAL_REPORTS = [
    "COMPLETION-REPORT.md",
]


def strip_yaml_frontmatter(content: str) -> str:
    """Remove YAML frontmatter from markdown content."""
    if content.startswith('---'):
        # Find the closing ---
        end_match = re.search(r'\n---\s*\n', content[3:])
        if end_match:
            return content[3 + end_match.end():]
    return content


def strip_html_comments(content: str) -> str:
    """Remove HTML comments (<!-- ... -->) from content."""
    return re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)


def normalize_heading_levels(content: str, file_type: str) -> str:
    """Normalize heading levels based on file type.

    - Executive summaries: H1 (#) stays H1
    - Arc42 sections: H1 (#) becomes H1 (for proper TOC numbering)
    - Ensure no heading level jumps (e.g., H1 to H3)
    """
    # For now, keep headings as-is since individual files should have proper levels
    return content


def read_section_summary_table() -> str:
    """Read the Section Summary Table artifact."""
    table_file = SUMMARIES_DIR / "SECTION-SUMMARY-TABLE.md"
    if table_file.exists():
        content = table_file.read_text(encoding='utf-8')
        # Strip the title and purpose, keep just the table content
        lines = content.split('\n')
        # Find the "## Key Findings" section
        start_idx = 0
        for i, line in enumerate(lines):
            if line.strip() == '## Key Findings':
                start_idx = i
                break
        # Find the "## Status Criteria" section (end of table)
        end_idx = len(lines)
        for i, line in enumerate(lines):
            if line.strip() == '## Status Criteria':
                end_idx = i
                break
        return '\n'.join(lines[start_idx:end_idx]).strip()
    return ""


def process_file(filepath: Path, file_type: str) -> str:
    """Process a markdown file for inclusion in the combined document."""
    # Check if file is required (executive summaries)
    is_required = filepath.name in REQUIRED_SUMMARIES

    if not filepath.exists():
        if is_required:
            print(f"  ERROR: Required file missing: {filepath}")
            print(f"  This file is MANDATORY for complete documentation.")
            print(f"  Create it using the template in process-steps/as-is-brownfield/steps/09-summary-documentation.md")
            raise FileNotFoundError(f"Required summary file missing: {filepath.name}")
        else:
            print(f"  WARNING: Optional file not found: {filepath}")
            return ""

    # File exists - process normally
    content = filepath.read_text(encoding='utf-8')
    content = strip_yaml_frontmatter(content)
    content = strip_html_comments(content)
    content = normalize_heading_levels(content, file_type)

    return content.strip()


def main():
    print("=" * 60)
    print("Compiling Arc42 Architecture Documentation")
    print("=" * 60)
    print(f"Output: {OUTPUT_FILE}")
    print()

    parts = []

    # 1. YAML frontmatter
    date_str = datetime.now().strftime("%B %Y")
    parts.append(YAML_FRONTMATTER.format(date=date_str))

    # 2. Part I: Executive Summaries
    parts.append("\\newpage\n")
    parts.append("---\n\n**PART I: EXECUTIVE SUMMARIES**\n\n---\n")

    print("Processing Executive Summaries:")
    for filename in EXECUTIVE_SUMMARIES:
        filepath = SUMMARIES_DIR / filename
        print(f"  - {filename}")
        content = process_file(filepath, 'executive')
        if content:
            parts.append(f"\n\\newpage\n\n{content}\n")

    # 3. Part II: Arc42 Documentation
    parts.append("\n\\newpage\n")
    parts.append("---\n\n**PART II: ARC42 ARCHITECTURE DOCUMENTATION**\n\n---\n")

    # Get section summary table for injection
    section_summary_table = read_section_summary_table()

    print("\nProcessing Arc42 Sections:")
    for filename in ARC42_SECTIONS:
        filepath = ARCH_AS_IS_DIR / filename
        print(f"  - {filename}")
        content = process_file(filepath, 'arc42')
        if content:
            # Inject section summary table into Section 01 (after Requirements Overview)
            if filename == "01-introduction-goals.md" and section_summary_table:
                # Find the first ## header after the main # header
                lines = content.split('\n')
                insert_idx = 0
                found_main_header = False
                for i, line in enumerate(lines):
                    if line.startswith('# ') and not found_main_header:
                        found_main_header = True
                        continue
                    if found_main_header and line.startswith('## '):
                        insert_idx = i
                        break

                if insert_idx > 0:
                    lines.insert(insert_idx, f"\n{section_summary_table}\n")
                    content = '\n'.join(lines)

            parts.append(f"\n\\newpage\n\n{content}\n")

    # 4. Part III: Appendices
    parts.append("\n\\newpage\n")
    parts.append("---\n\n**PART III: APPENDICES**\n\n---\n")

    print("\nProcessing Appendices:")
    for filename in APPENDICES:
        filepath = ARCH_AS_IS_DIR / filename
        print(f"  - {filename}")
        content = process_file(filepath, 'appendix')
        if content:
            parts.append(f"\n\\newpage\n\n{content}\n")

    # 5. Part IV: Completion Report
    parts.append("\n\\newpage\n")
    parts.append("---\n\n**PART IV: COMPLETION REPORT**\n\n---\n")

    print("\nProcessing Final Reports:")
    for filename in FINAL_REPORTS:
        filepath = SUMMARIES_DIR / filename
        print(f"  - {filename}")
        content = process_file(filepath, 'report')
        if content:
            parts.append(f"\n\\newpage\n\n{content}\n")

    # Write combined document
    combined = '\n'.join(parts)
    OUTPUT_FILE.write_text(combined, encoding='utf-8')

    # Count diagrams in output
    mermaid_count = len(re.findall(r'```mermaid', combined))
    plantuml_count = len(re.findall(r'```plantuml', combined))

    print()
    print("=" * 60)
    print("Compilation Complete!")
    print("=" * 60)
    print(f"Output: {OUTPUT_FILE}")
    print(f"Size: {OUTPUT_FILE.stat().st_size / 1024:.2f} KB")
    print(f"Mermaid diagrams: {mermaid_count}")
    print(f"PlantUML diagrams: {plantuml_count}")
    print()
    print("Next step: Run render_diagrams_for_doc.py to generate DOCX/PDF")
    print()


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"\n❌ COMPILATION FAILED: {e}")
        print(f"\nCannot proceed to Word document generation.")
        print(f"Create missing files before running this script.")
        sys.exit(1)
