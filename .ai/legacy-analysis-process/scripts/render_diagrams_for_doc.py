#!/usr/bin/env python3
"""
Cross-platform script to render Mermaid and PlantUML diagrams in markdown files,
then generate a DOCX document using Pandoc.

Usage:
    python render_diagrams_for_doc.py

Requirements:
    - Python 3.7+
    - Pandoc (in PATH)
    - Node.js + npx (for Mermaid rendering)
    - Internet connection (for PlantUML server rendering)
"""
import re
import subprocess
import zlib
import sys
import shutil
import urllib.request
from pathlib import Path

# --- Configuration ---
# Auto-detect repository root from script location
SCRIPT_DIR = Path(__file__).parent.resolve()
# REPO_ROOT should be the git root
# Script location: docs/ai/legacy_analysis/scripts
# Root location:   (up 4 levels)
REPO_ROOT = SCRIPT_DIR.parents[3]

SOURCE_DIR = REPO_ROOT / "docs" / "ai" / "legacy_analysis" / "arch-as-is"
ARTIFACTS_DIR = REPO_ROOT / "docs" / "ai" / "legacy_analysis" / "work" / "09-summaries"
OUTPUT_DIR = SOURCE_DIR  # Output to arch-as-is folder
TEMP_DIR = REPO_ROOT / ".tmp" / "render"
PLANTUML_SERVER = "http://www.plantuml.com/plantuml/png/"

# Combined markdown file - single source of truth for document generation
# This file contains all Arc42 sections with proper structure for Pandoc auto-numbering
COMBINED_SOURCE_FILE = "AS-IS-ARCHITECTURE-COMPLETE.md"

# Legacy individual files list (kept for reference, no longer used by default)
# The combined file supersedes this list as per user request:
# "there should be AS-IS-ARCHITECTURE-COMPLETE.md before converting to docx"
LEGACY_FILES = [
    "EXECUTIVE-SUMMARY.md",
    "TECHNICAL-SUMMARY.md",
    "SYSTEM-CAPABILITIES-SUMMARY.md",
    "TRIBAL-KNOWLEDGE-CATALOG.md",
    "DOCUMENTATION-GAP-REPORT.md",
    "ACTION-PLAN.md",
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
    "A1-requirements-traceability-matrix.md",
    "COMPLETION-REPORT.md"
]

# --- Emoji and Unicode Replacements for DOCX Compatibility ---
# NOTE: Modern Word (2016+) supports emoji rendering natively.
# We preserve visual indicator emojis (✅, ❌, ⛔, 🛑, etc.) for visual communication.
# Only box-drawing characters are replaced as they render inconsistently.
EMOJI_REPLACEMENTS = {
    # PRESERVED - Visual indicator emojis (Word 2016+ renders these correctly)
    # '✅': '[YES]',      # KEEP - renders in Word
    # '❌': '[NO]',       # KEEP - renders in Word
    # '⚠️': '[!]',       # KEEP - renders in Word
    # '🟥': '■ CRITICAL', # KEEP - renders in Word
    # '🟨': '■ WARNING',  # KEEP - renders in Word
    # '🟩': '■ OK',       # KEEP - renders in Word
    # '🟦': '■ INFO',     # KEEP - renders in Word

    # Box-drawing characters (replace - inconsistent rendering in Word)
    '├': '|--',
    '│': '|',
    '└': '`--',
    '─': '--',
    '┌': '.--',
    '┐': '--.',
    '┘': "--'",
    '━': '==',
    '┃': '||',
    '┏': '/==',
    '┓': '==\\',
    '┗': '\\==',
    '┛': '==/',
    '┠': '|==',
    '┨': '==|',
    '┣': '|==',
    '┫': '==|',
}

def replace_emojis(text):
    """Replace emojis and special Unicode characters with plain text equivalents."""
    for emoji, replacement in EMOJI_REPLACEMENTS.items():
        text = text.replace(emoji, replacement)
    return text

def escape_latex_in_tables(text):
    """Escape LaTeX special characters in markdown table cells for PDF generation.

    Only escapes special chars inside table rows (lines starting with |) to avoid
    breaking other markdown syntax.
    """
    import re
    lines = text.split('\n')
    result = []
    for line in lines:
        # Only process table rows (start with |)
        if line.strip().startswith('|'):
            # Escape backslashes in Windows paths (e.g., \inetpub -> \\inetpub)
            # Match backslash followed by word characters (not already escaped)
            line = re.sub(r'(?<!\\)\\(?![\\%&])', r'\\\\', line)
            # Escape % (LaTeX comment character)
            line = re.sub(r'(?<!\\)%', r'\\%', line)
            # Escape & (but not in markdown - this might break tables)
            # Actually don't escape & as Pandoc handles this in table conversion
        result.append(line)
    return '\n'.join(result)

# PDF-specific color transformations using LaTeX
# These convert the Unicode squares from EMOJI_REPLACEMENTS into colored LaTeX
PDF_COLOR_REPLACEMENTS = {
    # Status indicators with colored squares - use raw LaTeX
    # Format: DOCX text (from EMOJI_REPLACEMENTS) -> LaTeX colored symbol
    '| ■ CRITICAL |': r'| \textcolor{red}{■ CRITICAL} |',
    '| ■ WARNING |': r'| \textcolor{orange}{■ WARNING} |',
    '| ■ OK |': r'| \textcolor{green}{■ OK} |',
    '| ■ INFO |': r'| \textcolor{blue}{■ INFO} |',
    # Also handle without trailing pipe (end of line)
    '| ■ CRITICAL': r'| \textcolor{red}{■ CRITICAL}',
    '| ■ WARNING': r'| \textcolor{orange}{■ WARNING}',
    '| ■ OK': r'| \textcolor{green}{■ OK}',
    '| ■ INFO': r'| \textcolor{blue}{■ INFO}',
    # Legend replacements
    '■ CRITICAL = Critical issue': r'\textcolor{red}{■ CRITICAL} = Critical issue',
    '■ WARNING = Warning/Concern': r'\textcolor{orange}{■ WARNING} = Warning/Concern',
    '■ = Critical issue': r'\textcolor{red}{■} = Critical issue',
    '■ = Warning/Concern': r'\textcolor{orange}{■} = Warning/Concern',
}

def apply_pdf_colors(text):
    """Apply LaTeX color commands for PDF output.

    Converts plain text status indicators (RED, YELLOW, etc.) to
    LaTeX colored squares with labels for visual communication in PDF.
    """
    for plain, colored in PDF_COLOR_REPLACEMENTS.items():
        text = text.replace(plain, colored)
    return text

def add_page_breaks_before_h1(text):
    """Add page breaks before level 1 headers (# Header) for PDF.

    This ensures each major section starts on a new page.
    Skips the first H1 if it's at the start of the document.
    """
    import re
    lines = text.split('\n')
    result = []
    found_first_h1 = False

    for i, line in enumerate(lines):
        # Match level 1 headers (# Header) but not ## or ###
        if re.match(r'^# [^#]', line):
            if found_first_h1:
                # Add page break before subsequent H1 headers
                result.append('')
                result.append('\\newpage')
                result.append('')
            found_first_h1 = True
        result.append(line)

    return '\n'.join(result)

def create_latex_header(temp_dir):
    """Create a LaTeX header file with required packages for colors."""
    header_path = temp_dir / "header.tex"
    header_content = r"""
\usepackage{xcolor}
\usepackage{fontspec}
"""
    header_path.write_text(header_content, encoding="utf-8")
    return header_path

# --- PlantUML Encoding Helper (Custom Base64) ---
_valid_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"

def _encode6bit(b):
    if b < 10: return chr(48 + b)
    b -= 10
    if b < 26: return chr(65 + b)
    b -= 26
    if b < 26: return chr(97 + b)
    b -= 26
    if b == 0: return '-'
    if b == 1: return '_'
    return '?'

def _append3bytes(b1, b2, b3):
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return _encode6bit(c1) + _encode6bit(c2) + _encode6bit(c3) + _encode6bit(c4)

def plantuml_encode(text):
    """Encode PlantUML diagram text for HTTP server rendering."""
    # zlib compress
    zlibbed = zlib.compress(text.encode('utf-8'))[2:-4]  # Strip header/checksum
    res = ""
    for i in range(0, len(zlibbed), 3):
        b1 = zlibbed[i]
        b2 = zlibbed[i+1] if i+1 < len(zlibbed) else 0
        b3 = zlibbed[i+2] if i+2 < len(zlibbed) else 0
        res += _append3bytes(b1, b2, b3)
    return res

# --- Rendering Logic ---

def render_mermaid(code, output_path):
    """Render Mermaid diagram to PNG using local mermaid-cli (npx)."""
    # Create temp mermaid file
    mmd_file = output_path.with_suffix(".mmd")
    mmd_file.write_text(code, encoding="utf-8")

    try:
        # Use shell=True for Windows to handle 'npx' command properly if it's a cmd/ps1 script
        cmd = f"npx -y @mermaid-js/mermaid-cli -i \"{mmd_file}\" -o \"{output_path}\" -b transparent"
        
        result = subprocess.run(
            cmd, 
            shell=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        
        if result.returncode != 0:
            print(f"FAILED to render Mermaid ({output_path.name})")
            return False
            
        if output_path.exists():
            return True
        else:
            return False
            
    except Exception as e:
        print(f"FAILED execution: {e}")
        return False
    finally:
        if mmd_file.exists():
            mmd_file.unlink()

def render_plantuml(code, output_path):
    """Render PlantUML diagram to PNG using public PlantUML server."""
    try:
        encoded = plantuml_encode(code)
        url = PLANTUML_SERVER + encoded
        urllib.request.urlretrieve(url, output_path)
        return True
    except Exception as e:
        print(f"FAILED to render PlantUML: {e}")
        return False

def process_file(filename, source_dir=None):
    """Process a markdown file: extract diagrams, render them, replace code blocks with images.

    Args:
        filename: Name of the file to process
        source_dir: Optional override for source directory. If None, auto-detects based on filename.
    """
    # Determine source directory
    if source_dir is not None:
        src = source_dir / filename
    # Check if file is in artifacts
    elif filename in [
        "EXECUTIVE-SUMMARY.md", "TECHNICAL-SUMMARY.md", "SYSTEM-CAPABILITIES-SUMMARY.md",
        "TRIBAL-KNOWLEDGE-CATALOG.md", "DOCUMENTATION-GAP-REPORT.md", "ACTION-PLAN.md",
        "COMPLETION-REPORT.md"
    ]:
        src = ARTIFACTS_DIR / filename
    else:
        src = SOURCE_DIR / filename

    if not src.exists():
        print(f"Skipping missing file: {src}")
        return None

    content = src.read_text(encoding="utf-8")

    # Replace emojis and special Unicode characters for PDF compatibility
    content = replace_emojis(content)

    # Escape LaTeX special characters in tables for PDF generation
    content = escape_latex_in_tables(content)

    new_lines = []
    lines = content.split('\n')
    in_block = False
    block_type = None
    block_lines = []

    img_counter = 0
    base_name = src.stem

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            if in_block:
                # End of block
                in_block = False
                code = "\n".join(block_lines)

                if block_type in ["mermaid", "plantuml"]:
                    img_filename = f"{base_name}_fig{img_counter}.png"
                    img_path = TEMP_DIR / img_filename

                    success = False
                    print(f"Rendering {block_type} diagram: {img_filename}...")

                    if block_type == "mermaid":
                        success = render_mermaid(code, img_path)
                    elif block_type == "plantuml":
                        success = render_plantuml(code, img_path)

                    if success:
                        # ✅ Fixed: Use as_posix() for cross-platform path handling
                        img_ref = img_path.as_posix()
                        new_lines.append(f"![Diagram: {base_name}]({img_ref})")
                    else:
                        # Keep original code block if rendering failed
                        new_lines.append(f"```{block_type}")
                        new_lines.extend(block_lines)
                        new_lines.append("```")

                    img_counter += 1
                else:
                    # Other code blocks - keep as-is
                    new_lines.append(f"```{block_type if block_type else ''}")
                    new_lines.extend(block_lines)
                    new_lines.append("```")

                block_lines = []
                block_type = None
            else:
                # Start of block
                match = re.search(r"^```(\w+)", stripped)
                if match:
                    block_type = match.group(1).lower()
                else:
                    block_type = ""
                in_block = True
        else:
            if in_block:
                block_lines.append(line)
            else:
                new_lines.append(line)

    # Write processed file to temp directory
    dest = TEMP_DIR / filename
    dest.write_text("\n".join(new_lines), encoding="utf-8")

    return dest


def verify_required_summaries():
    """Pre-flight check: Verify all 6 required summary files exist."""
    required = [
        "EXECUTIVE-SUMMARY.md",
        "TECHNICAL-SUMMARY.md",
        "SYSTEM-CAPABILITIES-SUMMARY.md",
        "TRIBAL-KNOWLEDGE-CATALOG.md",
        "DOCUMENTATION-GAP-REPORT.md",
        "ACTION-PLAN.md",
    ]

    summaries_dir = REPO_ROOT / "docs" / "ai" / "legacy_analysis" / "work" / "09-summaries"
    missing = []

    for fname in required:
        fpath = summaries_dir / fname
        if not fpath.exists():
            missing.append(fname)

    if missing:
        print(f"\n❌ ERROR: Missing required summary files:")
        for fname in missing:
            print(f"  - {fname}")
        print(f"\nRun compile_architecture_doc.py first to identify missing files.")
        sys.exit(1)


# --- Main ---
def main():
    """Main execution: process combined markdown file and generate DOCX/PDF.

    Uses AS-IS-ARCHITECTURE-COMPLETE.md as the single source of truth.
    This file already contains:
    - YAML frontmatter with title, TOC, and numbersections settings
    - All Arc42 sections in proper order with clean headings (no embedded numbers)
    - Single authoritative Functional Requirements section
    - Requirements Traceability Matrix in appendix
    """
    print(f"Repository root: {REPO_ROOT}")
    print(f"Source directory: {SOURCE_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Temp directory: {TEMP_DIR}")
    print(f"Combined source: {COMBINED_SOURCE_FILE}")
    print()

    # Pre-flight check: Verify required summary files
    print("Pre-flight check: Verifying required summary files...")
    verify_required_summaries()
    print("✅ All required files present.\n")

    # Check dependencies
    try:
        subprocess.run(["pandoc", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("ERROR: Pandoc not found in PATH. Please install Pandoc.")
        sys.exit(1)

    # Verify combined source file exists
    combined_source_path = SOURCE_DIR / COMBINED_SOURCE_FILE
    if not combined_source_path.exists():
        print(f"ERROR: Combined source file not found: {combined_source_path}")
        print("Please ensure AS-IS-ARCHITECTURE-COMPLETE.md exists in arch-as-is/")
        sys.exit(1)

    # Create/clean temp directory
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
    TEMP_DIR.mkdir(parents=True)

    # Process the combined source file (renders diagrams, replaces emoji, etc.)
    # The combined file already has YAML frontmatter - no need for separate cover page
    print(f"Processing combined source file: {COMBINED_SOURCE_FILE}")
    processed_file = process_file(COMBINED_SOURCE_FILE, source_dir=SOURCE_DIR)

    if not processed_file:
        print("ERROR: Failed to process combined source file.")
        sys.exit(1)

    processed_files = [str(processed_file)]
    print(f"Successfully processed: {COMBINED_SOURCE_FILE}")

    # ✅ Fixed: Output to docs/ai/legacy_analysis/arch-as-is/ instead of artifacts/09-summaries/
    output_docx = OUTPUT_DIR / "AS-IS-ARCHITECTURE-COMPLETE.docx"

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Run Pandoc with enhanced options for DOCX
    # Note: YAML frontmatter has toc/numbersections but we also pass flags for reliability
    cmd = [
        "pandoc"
    ] + processed_files + [
        "-o", str(output_docx),
        "--toc",                           # Generate table of contents
        "--toc-depth=3",                   # TOC depth matches YAML
        "--number-sections",               # Number all sections
        "--standalone",                    # Produce standalone document
        "--wrap=none",                     # Don't wrap lines in tables
        "--columns=200",                   # Wide columns to prevent table wrapping
        "-f", "markdown+pipe_tables+grid_tables+multiline_tables+simple_tables",  # Enhanced table support
    ]

    print()
    print(f"Running Pandoc for DOCX...")
    print(f"Command: {' '.join(cmd)}")

    try:
        subprocess.run(cmd, check=True)
        print()
        print(f"SUCCESS! Created: {output_docx}")
        print(f"Size: {output_docx.stat().st_size / 1024:.2f} KB")
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Pandoc failed with exit code {e.returncode}")
        sys.exit(1)

    # --- PDF Generation with LaTeX Colors ---
    print()
    print("=" * 60)
    print("Generating PDF with colored status indicators...")
    print("=" * 60)

    # Create PDF-specific temp directory
    pdf_temp_dir = REPO_ROOT / ".tmp" / "render_pdf"
    if pdf_temp_dir.exists():
        shutil.rmtree(pdf_temp_dir)
    pdf_temp_dir.mkdir(parents=True)

    # Copy and transform files for PDF (add LaTeX colors)
    pdf_files = []
    is_first_file = True
    for src_file in processed_files:
        src_path = Path(src_file)
        dest_path = pdf_temp_dir / src_path.name

        content = src_path.read_text(encoding="utf-8")

        # Apply PDF-specific transformations
        content = apply_pdf_colors(content)
        content = add_page_breaks_before_h1(content)

        # Add page break at start of each file except cover page
        if not is_first_file:
            content = '\\newpage\n\n' + content
        is_first_file = False

        dest_path.write_text(content, encoding="utf-8")
        pdf_files.append(str(dest_path))

    # Generate PDF with xelatex (supports Unicode and colors)
    output_pdf = OUTPUT_DIR / "AS-IS-ARCHITECTURE-COMPLETE.pdf"

    # Pandoc command for PDF with xelatex engine
    # Include xcolor package for \textcolor support
    pdf_cmd = [
        "pandoc"
    ] + pdf_files + [
        "-o", str(output_pdf),
        "--pdf-engine=xelatex",
        "--toc",
        "--toc-depth=3",
        "-V", "colorlinks=true",
        "-V", "linkcolor=blue",
        "-V", "toccolor=blue",
        "--include-in-header=" + str(create_latex_header(pdf_temp_dir)),
    ]

    print(f"Running Pandoc for PDF...")

    try:
        result = subprocess.run(pdf_cmd, check=True, capture_output=True, text=True)
        print()
        print(f"SUCCESS! Created: {output_pdf}")
        print(f"Size: {output_pdf.stat().st_size / 1024:.2f} KB")
    except subprocess.CalledProcessError as e:
        print(f"WARNING: PDF generation failed with exit code {e.returncode}")
        print(f"STDERR: {e.stderr[:500] if e.stderr else 'No error output'}")
        print("You can manually export the DOCX to PDF from Word.")

if __name__ == "__main__":
    main()
