"""
ChronicCare Icon v3 — Clean & Minimal
Design: Blue gradient bg + single white heart (perfectly proportioned)
No effects, no shadows, no glow circles. Just shape + color.
"""
from PIL import Image, ImageDraw
import math, os

S    = 1024
OUT  = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUT, exist_ok=True)

def heart_polygon(cx, cy, radius, steps=400):
    """
    Heart via clean parametric formula.
    radius controls overall size in pixels.
    """
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps - math.pi
        # Normalized heart: spans roughly [-1,1] in x, [-1, 1.2] in y
        x = math.sin(t) ** 3
        y = -(
            0.8125 * math.cos(t)
            - 0.3125 * math.cos(2 * t)
            - 0.125  * math.cos(3 * t)
            - 0.0625 * math.cos(4 * t)
        )
        pts.append((cx + x * radius, cy + y * radius))
    return pts


img  = Image.new('RGBA', (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# ── 1. Gradient background ──────────────────────────────────────────────────
# Top: #4F8AF7  Bottom: #1A40C4   (vibrant → deep blue)
for y in range(S):
    t = y / S
    r = int(79  + (26  - 79 ) * t)
    g = int(138 + (64  - 138) * t)
    b = int(247 + (196 - 247) * t)
    draw.line([(0, y), (S - 1, y)], fill=(r, g, b, 255))

# ── 2. Subtle top-left inner light (very gentle) ────────────────────────────
# Just a soft white ellipse, very low alpha, blended manually
for step in range(80, 0, -2):
    a   = int(6 * (1 - step / 80) ** 0.5)
    rx  = step * 3
    ry  = step * 2
    draw.ellipse(
        [S * 0.1 - rx, S * 0.08 - ry, S * 0.1 + rx, S * 0.08 + ry],
        fill=(255, 255, 255, a),
    )

# ── 3. White heart — centered, well padded ──────────────────────────────────
# Target: heart fits within a ~540px circle centered at canvas center
# But we shift the visual center up slightly (hearts look better slightly high)
cx = S // 2
cy = S // 2 + 10

radius = 252   # controls size; heart width ≈ radius*2, height ≈ radius*2.2

pts = heart_polygon(cx, cy, radius)
draw.polygon(pts, fill=(255, 255, 255, 252))

# ── 4. Tiny leaf / pulse dot — bottom right of heart, like an app badge ─────
# A small filled circle with a leaf inside, top-right of heart
leaf_cx = cx + int(radius * 0.72)
leaf_cy = cy - int(radius * 0.62)
leaf_r  = 68

# Circle bg (white, slightly off)
draw.ellipse(
    [leaf_cx - leaf_r, leaf_cy - leaf_r,
     leaf_cx + leaf_r, leaf_cy + leaf_r],
    fill=(255, 255, 255, 255),
)
# Small filled teardrop / leaf inside (blue, to match bg)
leaf_inner = 44
# Draw a simple upward-pointing leaf: ellipse rotated
for t_deg in range(0, 361, 1):
    t = math.radians(t_deg)
    # Leaf parametric: cardioid-ish
    lx = leaf_inner * 0.55 * math.sin(t) * math.cos(t)
    ly = -leaf_inner * (math.cos(t) ** 2)
    lx2 = leaf_inner * 0.55 * math.sin(t + 0.05) * math.cos(t + 0.05)
    ly2 = -leaf_inner * (math.cos(t + 0.05) ** 2)
    draw.line(
        [(leaf_cx + lx, leaf_cy + ly), (leaf_cx + lx2, leaf_cy + ly2)],
        fill=(58, 120, 230, 240), width=2,
    )
# Cleaner: just draw a filled leaf shape
leaf_pts = []
for i in range(200):
    t = 2 * math.pi * i / 200
    lx = 0.52 * leaf_inner * math.sin(t) * abs(math.cos(t)) ** 0.5
    ly = -leaf_inner * 0.9 * abs(math.cos(t)) * math.cos(t)
    leaf_pts.append((leaf_cx + lx, leaf_cy + ly))
draw.polygon(leaf_pts, fill=(52, 108, 220, 235))

# Leaf center vein (white hairline)
draw.line(
    [(leaf_cx, leaf_cy + leaf_inner * 0.85),
     (leaf_cx, leaf_cy - leaf_inner * 0.85)],
    fill=(255, 255, 255, 160), width=2,
)

# ── 5. Convert & save ────────────────────────────────────────────────────────
final = img.convert('RGB')
final.save(os.path.join(OUT, 'icon.png'), 'PNG')
final.save(os.path.join(OUT, 'icon-final-v3.png'), 'PNG')

# Splash (1284 x 2778)
SW, SH    = 1284, 2778
splash    = Image.new('RGB', (SW, SH))
sdraw     = ImageDraw.Draw(splash)
for y in range(SH):
    t = y / SH
    r = int(79  + (26  - 79 ) * t)
    g = int(138 + (64  - 138) * t)
    b = int(247 + (196 - 247) * t)
    sdraw.line([(0, y), (SW - 1, y)], fill=(r, g, b))

icon_sm = final.resize((280, 280), Image.LANCZOS)
ix = (SW - 280) // 2
iy = SH // 2 - 200
splash.paste(icon_sm, (ix, iy))
splash.save(os.path.join(OUT, 'splash-icon.png'), 'PNG')

print("icon.png and splash-icon.png written to assets/")
