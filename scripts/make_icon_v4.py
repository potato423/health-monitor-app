"""
ChronicCare Icon v4 — Absolute minimal.
Blue gradient + white heart. Nothing else.
"""
from PIL import Image, ImageDraw
import math, os

S   = 1024
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')

def draw_heart(draw, cx, cy, size):
    """
    Draw a clean heart using two circles + a triangle.
    size = radius of each circle lobe.
    """
    r = size
    # Left circle
    draw.ellipse([cx - r*2, cy - r, cx, cy + r], fill=(255, 255, 255))
    # Right circle
    draw.ellipse([cx, cy - r, cx + r*2, cy + r], fill=(255, 255, 255))
    # Bottom triangle (inverted)
    tri = [
        (cx - r*2 + 4, cy + r * 0.5),
        (cx + r*2 - 4, cy + r * 0.5),
        (cx,           cy + r * 2.5),
    ]
    draw.polygon(tri, fill=(255, 255, 255))

# ── Create canvas ─────────────────────────────────────────────────────────────
img  = Image.new('RGB', (S, S))
draw = ImageDraw.Draw(img)

# ── Gradient: #4A90E2 (top) → #1A3FA0 (bottom) ───────────────────────────────
top_c = (74, 144, 226)
bot_c = (26,  63, 160)
for y in range(S):
    t = y / (S - 1)
    r = int(top_c[0] + (bot_c[0] - top_c[0]) * t)
    g = int(top_c[1] + (bot_c[1] - top_c[1]) * t)
    b = int(top_c[2] + (bot_c[2] - top_c[2]) * t)
    draw.line([(0, y), (S - 1, y)], fill=(r, g, b))

# ── Heart centered, well padded ───────────────────────────────────────────────
# Two-circle + triangle method gives a clean, simple heart
# lobe radius r: heart total width = 4r, height ≈ 3r
r   = 148   # lobe radius  →  width = 592px, fits nicely in 1024 with padding
cx  = S // 2
cy  = S // 2 - r // 2   # shift up slightly so heart looks vertically centered

draw_heart(draw, cx, cy, r)

# ── Save ──────────────────────────────────────────────────────────────────────
img.save(os.path.join(OUT, 'icon.png'), 'PNG')

# Splash screen 1284×2778
SW, SH = 1284, 2778
splash = Image.new('RGB', (SW, SH))
sd = ImageDraw.Draw(splash)
for y in range(SH):
    t = y / (SH - 1)
    r_ = int(top_c[0] + (bot_c[0] - top_c[0]) * t)
    g_ = int(top_c[1] + (bot_c[1] - top_c[1]) * t)
    b_ = int(bot_c[2] + (top_c[2] - bot_c[2]) * (1 - t))
    sd.line([(0, y), (SW - 1, y)], fill=(r_, g_, b_))

# Paste resized icon onto splash
icon_sm = img.resize((300, 300), Image.LANCZOS)
splash.paste(icon_sm, ((SW - 300) // 2, SH // 2 - 220))
splash.save(os.path.join(OUT, 'splash-icon.png'), 'PNG')

print("Done: assets/icon.png  assets/splash-icon.png")
