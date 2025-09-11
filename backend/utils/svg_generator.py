"""
SVG banner generation utilities for health blogs
"""
import os
import re
from datetime import datetime, timezone

def ensure_uploads_dir():
    """Ensure uploads directory exists"""
    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    return uploads_dir

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    base = re.sub(r"[^a-zA-Z0-9-_]+", "-", text.strip().lower())
    base = re.sub(r"-+", "-", base).strip('-')
    return base or "blog"

def wrap_text(title: str, max_len=28):
    """Wrap text to fit within specified length"""
    words = title.split()
    lines = []
    cur = []
    for w in words:
        if sum(len(x) for x in cur) + len(cur) + len(w) <= max_len:
            cur.append(w)
        else:
            lines.append(' '.join(cur))
            cur = [w]
    if cur:
        lines.append(' '.join(cur))
    return lines[:3]  # cap lines

def generate_svg_banner(title: str, subtitle: str, filename: str, bg="#0ea5e9", accent="#22d3ee"):
    """Generate SVG banner for health blogs"""
    uploads_dir = ensure_uploads_dir()
    width, height = 1200, 630  # OG-image friendly
    lines = wrap_text(title, 28)

    # Basic geometric background
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{bg}"/>
      <stop offset="100%" stop-color="{accent}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="100" cy="80" r="60" fill="rgba(255,255,255,0.15)"/>
  <circle cx="1100" cy="560" r="90" fill="rgba(255,255,255,0.12)"/>
  <rect x="60" y="60" rx="24" ry="24" width="1080" height="510" fill="rgba(0,0,0,0.25)"/>
  <text x="90" y="230" fill="#fff" font-family="Segoe UI, Roboto, Arial" font-size="64" font-weight="700" letter-spacing="0.5">
    {('</text><text x="90" y="330" fill="#fff" font-family="Segoe UI, Roboto, Arial" font-size="64" font-weight="700" letter-spacing="0.5">').join(lines)}
  </text>
  <text x="90" y="400" fill="#e2e8f0" font-family="Segoe UI, Roboto, Arial" font-size="32" font-weight="400">
    {subtitle}
  </text>
  <text x="90" y="480" fill="#a7f3d0" font-family="Segoe UI, Roboto, Arial" font-size="28" font-weight="600">AshaAssist</text>
</svg>'''
    
    out_path = os.path.join(uploads_dir, filename)
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(svg)
        return f"/uploads/{filename}"
    except Exception as e:
        print(f"Failed creating SVG banner {filename}: {e}")
        return None

