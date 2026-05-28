import re
import os
import subprocess
import zlib
import sys
import shutil
import base64
import urllib.request

# --- Configuration ---
# Usage: python render_diagrams_for_doc_windows.py <ANALYSIS_ROOT>
# Example: python render_diagrams_for_doc_windows.py C:\GIT\project\analysis-output
if len(sys.argv) < 2:
    print("Usage: python render_diagrams_for_doc_windows.py <ANALYSIS_ROOT>")
    print("  ANALYSIS_ROOT: Path to the analysis output directory (e.g., arch-as-is/ parent)")
    sys.exit(1)

ANALYSIS_ROOT = sys.argv[1]
SOURCE_DIR = os.path.join(ANALYSIS_ROOT, "arch-as-is")
ARTIFACTS_DIR = os.path.join(ANALYSIS_ROOT, "work", "09-summaries")
OUTPUT_DIR = SOURCE_DIR  # Output to arch-as-is folder (same as source)
TEMP_DIR = os.path.join(ANALYSIS_ROOT, ".tmp", "render")
PLANTUML_SERVER = "http://www.plantuml.com/plantuml/png/"

# Files to process (ORDER MATTERS for Pandoc)
FILES = [
    "EXECUTIVE-SUMMARY.md", # This one is in 09-summaries, special case
    "01-introduction-goals.md",
    "02-constraints.md",
    "03-context-scope.md",
    "04-solution-strategy.md",
    "05-building-block-view.md",
    "06-runtime-view.md",
    "07-deployment-view.md",
    "08-domain-rules-and-guidelines.md",
    "10-quality-requirements.md",
    "11-risks-technical-debt.md",
    "12-glossary.md"
]

# --- PlantUML Encoding Helper (Custom Base64) ---
# Transformation table for PlantUML
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
    # zlib compress
    zlibbed = zlib.compress(text.encode('utf-8'))[2:-4] # Strip header/checksum
    res = ""
    for i in range(0, len(zlibbed), 3):
        b1 = zlibbed[i]
        b2 = zlibbed[i+1] if i+1 < len(zlibbed) else 0
        b3 = zlibbed[i+2] if i+2 < len(zlibbed) else 0
        res += _append3bytes(b1, b2, b3)
    return res

# --- Rendering Logic ---

def render_mermaid(code, output_path):
    mmd_path = output_path + ".mmd"
    with open(mmd_path, "w", encoding='utf-8') as f:
        f.write(code)

    # Use npx to run mmdc
    cmd = ["npx", "-y", "@mermaid-js/mermaid-cli", "-i", mmd_path, "-o", output_path, "--backgroundColor", "white"]
    try:
        subprocess.run(cmd, check=True, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        print(f"FAILED to render Mermaid: {output_path}")
        return False

def render_plantuml(code, output_path):
    try:
        encoded = plantuml_encode(code)
        url = PLANTUML_SERVER + encoded
        urllib.request.urlretrieve(url, output_path)
        return True
    except Exception as e:
        print(f"FAILED to render PlantUML: {e}")
        return False

def process_file(filename):
    # Determine source path
    if filename == "EXECUTIVE-SUMMARY.md":
        src = os.path.join(ARTIFACTS_DIR, filename)
    else:
        src = os.path.join(SOURCE_DIR, filename)

    if not os.path.exists(src):
        print(f"Skipping missing file: {src}")
        return None

    with open(src, "r", encoding="utf-8") as f:
        content = f.read()

    # Find blocks
    # Regex for ```mermaid ... ```
    # minimal implementation: split by code blocks

    new_lines = []
    lines = content.split('\n')
    in_block = False
    block_type = None
    block_lines = []

    img_counter = 0
    base_name = os.path.splitext(filename)[0]

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            if in_block:
                # End of block
                in_block = False
                code = "\n".join(block_lines)

                if block_type in ["mermaid", "plantuml"]:
                    img_filename = f"{base_name}_fig{img_counter}.png"
                    img_path = os.path.join(TEMP_DIR, img_filename)

                    success = False
                    print(f"Rendering {block_type} diagram: {img_filename}...")

                    if block_type == "mermaid":
                        success = render_mermaid(code, img_path)
                    elif block_type == "plantuml":
                        success = render_plantuml(code, img_path)

                    if success:
                        abs_img_path = str(img_path).replace("\\", "/")
                        new_lines.append(f"![Diagram: {base_name}]({abs_img_path})")
                    else:
                        new_lines.append(f"``` {block_type}") # Keep original if fail
                        new_lines.extend(block_lines)
                        new_lines.append("```")

                    img_counter += 1
                else:
                    # Other code blocks
                    new_lines.append(f"``` {block_type if block_type else ''}")
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

    # Write processed file
    dest = os.path.join(TEMP_DIR, filename)
    with open(dest, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))

    return dest

# --- Main ---
if __name__ == "__main__":
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR)

    # Create cover page
    from datetime import datetime
    cover_page_path = os.path.join(TEMP_DIR, "00-cover-page.md")
    cover_content = f"""# {PROJECT} AS-IS Architecture Documentation

This document provides complete Arc42 architecture documentation of the current {PROJECT} (DNA Address Registry) system.

**Contents:**
- Business context and stakeholders
- Technical architecture
- System constraints and integrations
- Component structure and runtime behavior
- Deployment infrastructure
- Quality requirements and metrics
- Technical debt analysis and risks
- Domain model and glossary

**Purpose:** This documentation serves as the baseline for understanding the current system.

This document was generated during AI-assisted legacy system analysis process.

**Generated:** {datetime.now().strftime("%B %d, %Y")}

\\newpage

"""
    with open(cover_page_path, "w", encoding="utf-8") as f:
        f.write(cover_content)

    processed_files = [cover_page_path]
    print("Starting processing...")

    for f in FILES:
        p = process_file(f)
        if p:
            processed_files.append(p)

    # Run Pandoc
    output_docx = os.path.join(OUTPUT_DIR, "{PROJECT}-AS-IS-ARCHITECTURE-COMPLETE.docx")
    cmd = ["pandoc"] + processed_files + ["-o", output_docx, "--toc", "--toc-depth=3", "--number-sections"]

    print(f"Running Pandoc... {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    print(f"Done! Created {output_docx}")
