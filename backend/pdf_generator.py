import re
from datetime import datetime
from fpdf import FPDF

class PremiumBriefingPDF(FPDF):
    def __init__(self, company_name: str):
        super().__init__()
        self.company_name = company_name
        self.alias_nb_pages()

    def header(self):
        # Top banner on all pages after page 1
        if self.page_no() > 1:
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(100, 116, 139)  # Slate muted (#64748B)
            # Left-aligned company, right-aligned brand
            self.cell(0, 10, f"COMPETITIVE INTELLIGENCE REPORT: {self.company_name.upper()}", border="B", ln=0, align="L")
            self.set_x(-45)
            self.cell(30, 10, "BRIEFD AI", border="B", ln=1, align="R")
            self.ln(5)

    def footer(self):
        # Footer on all pages
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)  # Light slate (#94A3B8)
        
        # Center-aligned page number
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")
        
        # Right-aligned confidentiality statement
        self.set_x(-60)
        self.cell(0, 10, "Confidential - Generated via Briefd", align="R")

def sanitize_for_pdf(text: str) -> str:
    if not text:
        return ""
    # Replace common unicode punctuation with ASCII equivalents
    replacements = {
        "\u201c": '"',  # left double quotation mark
        "\u201d": '"',  # right double quotation mark
        "\u2018": "'",  # left single quotation mark
        "\u2019": "'",  # right single quotation mark
        "\u2013": "-",  # en dash
        "\u2014": "-",  # em dash
        "\u2022": "*",  # bullet
        "\u2026": "...",# ellipsis
        "\u00a0": " ",  # non-breaking space
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    
    # Keep only characters that can be encoded in latin-1 (or cp1252)
    # We encode to latin-1 with 'replace' to ensure safety
    encoded = text.encode("latin-1", errors="replace")
    return encoded.decode("latin-1")

def escape_html(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def parse_inline_elements(text: str) -> str:
    # 1. Escape HTML characters first to avoid XML parser conflicts
    text = escape_html(text)
    # 2. Replace markdown bold **text** with <b>text</b>
    text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
    # 3. Replace markdown inline code `code` with <i>code</i>
    text = re.sub(r"`(.*?)`", r"<i>\1</i>", text)
    return text

def markdown_to_html(md_text: str) -> str:
    lines = md_text.split("\n")
    html_lines = []
    in_list = False
    
    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            html_lines.append("<br/>")
            continue
            
        # Headings
        if trimmed.startswith("## "):
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            heading_text = parse_inline_elements(trimmed[3:])
            html_lines.append(f'<h3><font color="#4F46E5"><b>{heading_text}</b></font></h3>')
            continue
            
        if trimmed.startswith("# "):
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            heading_text = parse_inline_elements(trimmed[2:])
            html_lines.append(f'<h2><font color="#1E293B"><b>{heading_text}</b></font></h2>')
            continue
            
        # Bullet list items
        if trimmed.startswith("- ") or trimmed.startswith("* "):
            if not in_list:
                html_lines.append("<ul>")
                in_list = True
            bullet_text = parse_inline_elements(trimmed[2:])
            html_lines.append(f"<li>{bullet_text}</li>")
            continue
            
        # Numbered list items
        num_match = re.match(r"^\d+\.\s+(.*)", trimmed)
        if num_match:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            item_text = num_match.group(1)
            item_text = parse_inline_elements(item_text)
            html_lines.append(f"<p>{trimmed.split('.')[0]}. {item_text}</p>")
            continue
            
        # Normal paragraph
        if in_list:
            html_lines.append("</ul>")
            in_list = False
        paragraph_text = parse_inline_elements(trimmed)
        html_lines.append(f"<p>{paragraph_text}</p>")
        
    if in_list:
        html_lines.append("</ul>")
        
    return "\n".join(html_lines)

def generate_briefing_pdf(company_name: str, briefing_text: str) -> bytes:
    # 1. Sanitize text for PDF encoding safety
    sanitized_text = sanitize_for_pdf(briefing_text)
    
    # 2. Convert Markdown to HTML layout
    html_content = markdown_to_html(sanitized_text)
    
    # 3. Create PDF instance
    pdf = PremiumBriefingPDF(company_name)
    pdf.set_margins(15, 20, 15)  # Left, Top, Right
    pdf.add_page()
    
    # Page 1 Header Block (Premium aesthetics)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(79, 70, 229)  # Indigo accent (#4F46E5)
    pdf.cell(0, 5, "BRIEFD COMPETITIVE INTELLIGENCE SUITE", ln=1, align="L")
    
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(30, 41, 59)  # Slate dark (#1E293B)
    pdf.cell(0, 15, f"Research Briefing: {company_name}", ln=1, align="L")
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)  # Slate muted (#64748B)
    date_str = datetime.utcnow().strftime("%B %d, %Y")
    pdf.cell(0, 5, f"Generated on {date_str}  |  Suite version: v3.0.0", ln=1, align="L")
    
    # Thick colored divider line
    pdf.ln(4)
    pdf.set_draw_color(79, 70, 229)  # Indigo accent
    pdf.set_line_width(0.8)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(8)
    
    # Reset typography for HTML body
    pdf.set_font("Helvetica", size=10)
    pdf.set_text_color(51, 65, 85)  # Slate dark body (#334155)
    
    # Render HTML content flow
    pdf.write_html(html_content)
    
    # Return PDF content as bytes
    return bytes(pdf.output())
