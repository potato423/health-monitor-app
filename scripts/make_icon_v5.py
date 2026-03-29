"""
ChronicCare Icon v5
One clean parametric heart, no seams, no artifacts.
"""
from PIL import Image, ImageDraw, ImageFilter
import math, os

S   = 1024
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')

# ── Parametric heart (no gaps, no sharp bottom corners) ──────────────────────
def heart_pts(cx, cy, scale, n=600):
    """
    Uses the standard heart parametric equation scaled so the
    full shape height ~ scale*2 pixels, width ~ scale*2 pixels.
    """
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        # Standard formula (heart facing up)
        x =  math.sin(t) ** 3
        y = -(0.8125 * math.cos(t)
              - 0.3125 * math.cos(2*t)
              - 0.125  * math.cos(3*t)
              - 0.0625 * math.cos(4*t))
        # x in [-1, 1], y in [-1, ~1.17]
        # We want total height ~= scale, so divide by 1.1 to normalise
        pts.append((cx + x * scale, cy + y * scale / 1.05))
    return pts

# ── Canvas & gradient ─────────────────────────────────────────────────────────
img  = Image.new('RGB', (S, S))
draw = ImageDraw.Draw(img)

TOP = (70, 148, 238)   # #4694EE  (bright, clean blue)
BOT = (24,  58, 168)   # #183AA8  (deep indigo-blue)

for y in range(S):
    t = y / (S - 1)
    col = tuple(int(TOP[i] + (BOT[i] - TOP[i]) * t) for i in range(3))
    draw.line([(0, y), (S-1, y)], fill=col)

# ── Heart ─────────────────────────────────────────────────────────────────────
# scale=265 → heart ≈ 530px wide, 570px tall on 1024px canvas → nice padding
scale = 262
cx    = S // 2
cy    = S // 2 + 18   # shift 18px down so visual centre feels right

pts = heart_pts(cx, cy, scale)
draw.polygon(pts, fill=(255, 255, 255))

# ── 1-px anti-alias pass: tiny blur then resample ────────────────────────────
img = img.filter(ImageFilter.GaussianBlur(radius=0.8))
# Re-draw heart sharp on top (fixes blur bleed onto bg)
draw2 = ImageDraw.Draw(img)
draw2.polygon(pts, fill=(255, 255, 255))

# ── Save ──────────────────────────────────────────────────────────────────────
img.save(os.path.join(OUT, 'icon.png'), 'PNG')

# ── Splash 1284×2778 ──────────────────────────────────────────────────────────
SW, SH = 1284, 2778
splash = Image.new('RGB', (SW, SH))
sd = ImageDraw.Draw(splash)
for y in range(SH):
    t = y / (SH - 1)
    col = tuple(int(TOP[i] + (BOT[i] - TOP[i]) * t) for i in range(3))
    sd.line([(0, y), (SW-1, y)], fill=col)
icon_sm = img.resize((300, 300), Image.LANCZOS)
splash.paste(icon_sm, ((SW-300)//2, SH//2 - 200))
splash.save(os.path.join(OUT, 'splash-icon.png'), 'PNG')

print("icon.png  splash-icon.png  →  assets/")
