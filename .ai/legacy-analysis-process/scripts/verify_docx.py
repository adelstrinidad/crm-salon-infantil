import zipfile
import re
import sys

docx_path = r"artifacts\09-summaries\{PROJECT}-AS-IS-ARCHITECTURE-COMPLETE.docx"

def analyze_docx(path):
    try:
        with zipfile.ZipFile(path) as document:
            # 1. Analyze Text for Chapter Headers
            xml_content = document.read('word/document.xml').decode('utf-8')
            text_parts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', xml_content)
            full_text = "".join(text_parts)

            print(f"--- Content Analysis ---")
            print(f"Total Text Length: {len(full_text)} chars")

            # Check for specific headers with basic regex (ignoring some XML noise/spacing)
            # We look for the literal strings found in the Markdown headers
            headers_to_check = [
                r"1. Business Vision",
                r"12. Domain Terminology",
                r"13. Documentation Reality",
                r"A1. Appendix 1" 
            ]
            
            for header in headers_to_check:
                # Simple check: remove most xml-like spacing for loose matching
                clean_text = full_text.replace("  ", " ")
                if re.search(header.replace(".", r"\."), clean_text): 
                    print(f"✅ Header Found: '{header}'")
                else:
                    print(f"⚠️ Header Not Found (Exact Match): '{header}'")

            # 2. Analyze Media (Diagrams)
            # Word stores images in word/media/
            media_files = [f for f in document.namelist() if f.startswith('word/media/')]
            print(f"\n--- Diagram/Media Analysis ---")
            print(f"Total Embedded Images: {len(media_files)}")
            for m in media_files[:5]: # Show first 5
                print(f" - {m}")
            if len(media_files) > 5: print(f" - ... and {len(media_files)-5} more")

    except Exception as e:
        print(f"Error: {str(e)}")

analyze_docx(docx_path)
