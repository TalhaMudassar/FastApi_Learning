import sys, os
import re

md_path = r"d:\FASTAPI\FinalProject\STRIPE_PAYMENT\ecomm\ecommfastapi\docs\STRIPE_FASTAPI_INTEGRATION_GUIDE.md"
doc_path = r"d:\FASTAPI\FinalProject\STRIPE_PAYMENT\ecomm\ecommfastapi\docs\STRIPE_FASTAPI_INTEGRATION_GUIDE.doc"

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

html_body = []
in_code = False
code_lang = ""
code_buffer = []

for line in lines:
    clean_line = line.rstrip("\r\n")

    # Code block toggle
    if clean_line.startswith("```"):
        if in_code:
            in_code = False
            code_text = "\n".join(code_buffer)
            # escape html
            code_text = code_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            html_body.append(f"<pre style='background:#f8f9fa; border:1px solid #e2e8f0; border-left:4px solid #4f46e5; padding:12px; font-family:Consolas, monospace; font-size:10.5pt; color:#1e293b; overflow-x:auto; line-height:1.4;'>{code_text}</pre>")
            code_buffer = []
        else:
            in_code = True
            code_lang = clean_line[3:].strip()
            code_buffer = []
        continue

    if in_code:
        code_buffer.append(clean_line)
        continue

    # Headings
    if clean_line.startswith("# "):
        html_body.append(f"<h1 style='color:#1e1b4b; font-family:Calibri, Arial, sans-serif; font-size:24pt; border-bottom:2px solid #4f46e5; padding-bottom:8px; margin-top:24pt;'>{clean_line[2:]}</h1>")
    elif clean_line.startswith("## "):
        html_body.append(f"<h2 style='color:#312e81; font-family:Calibri, Arial, sans-serif; font-size:18pt; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-top:18pt;'>{clean_line[3:]}</h2>")
    elif clean_line.startswith("### "):
        html_body.append(f"<h3 style='color:#4338ca; font-family:Calibri, Arial, sans-serif; font-size:14pt; margin-top:14pt;'>{clean_line[4:]}</h3>")
    elif clean_line.startswith("> "):
        html_body.append(f"<div style='background:#eef2ff; border-left:4px solid #6366f1; padding:10px 14px; margin:10px 0; color:#3730a3; font-size:11pt;'>{clean_line[2:]}</div>")
    elif clean_line.startswith("- [ ]") or clean_line.startswith("- [x]"):
        checked = "☑" if clean_line.startswith("- [x]") else "☐"
        text = clean_line[5:].strip()
        html_body.append(f"<p style='margin:4px 0 4px 20px; font-family:Calibri, sans-serif; font-size:11pt;'><strong>{checked}</strong> {text}</p>")
    elif clean_line.startswith("- ") or clean_line.startswith("* "):
        text = clean_line[2:].strip()
        # Bold formatting
        text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"`(.*?)`", r"<code style='background:#f1f5f9; padding:2px 4px; font-family:Consolas;'>\1</code>", text)
        html_body.append(f"<li style='margin:4px 0; font-family:Calibri, sans-serif; font-size:11pt;'>{text}</li>")
    elif clean_line.startswith("|"):
        # table row
        parts = [p.strip() for p in clean_line.split("|")[1:-1]]
        if all(re.match(r"^:?-+:?$", p) for p in parts):
            continue # separator
        cols = "".join([f"<td style='border:1px solid #cbd5e1; padding:8px 12px; font-family:Calibri, sans-serif; font-size:10.5pt;'>{p}</td>" for p in parts])
        html_body.append(f"<table style='border-collapse:collapse; width:100%; margin:10px 0;'><tr>{cols}</tr></table>")
    elif clean_line.strip() == "":
        continue
    else:
        text = clean_line
        text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"`(.*?)`", r"<code style='background:#f1f5f9; padding:2px 4px; font-family:Consolas;'>\1</code>", text)
        html_body.append(f"<p style='margin:6px 0; line-height:1.5; font-family:Calibri, sans-serif; font-size:11pt; color:#334155;'>{text}</p>")

html_doc = f"""<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Stripe Payment Gateway Integration - FastAPI & Next.js</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
body {{
    font-family: Calibri, 'Segoe UI', Arial, sans-serif;
    margin: 36pt 48pt;
    color: #1e293b;
}}
h1, h2, h3, h4 {{
    font-family: Calibri, 'Segoe UI', Arial, sans-serif;
}}
pre, code {{
    font-family: Consolas, 'Courier New', monospace;
}}
table {{
    border-collapse: collapse;
    width: 100%;
    margin: 12pt 0;
}}
th, td {{
    border: 1px solid #cbd5e1;
    padding: 6pt 10pt;
    text-align: left;
}}
th {{
    background-color: #f1f5f9;
    font-weight: bold;
}}
</style>
</head>
<body>
{"".join(html_body)}
</body>
</html>"""

with open(doc_path, "w", encoding="utf-8") as f:
    f.write(html_doc)

print(f"Successfully generated Word document at: {doc_path}")
