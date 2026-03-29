"""
ChronicCare - Final Production Icon
1024x1024, Apple App Store ready.

Design concept:
  - Deep blue-to-indigo gradient background (premium, trustworthy)  
  - White shield/drop shape (protection, health care)
  - Inside: a clean heart + EKG pulse line (health monitoring)
  - Subtle inner glow, no harsh edges
  - Completely flat vector aesthetic — no 3D, no texture
"""

from PIL import Image, ImageDraw, ImageFilter
import math, os, shutil

SIZE = 1024
HALF = SIZE // 2
OUT  = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUT, exist_ok=True)


# ─── Low-level drawing helpers ────────────────────────────────────────────────

def lerp_color(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def draw_gradient_bg(img: Image.Image,
                     top=(45, 108, 223),
                     bottom=(20, 52, 147)):
    """Vertical linear gradient, with a subtle diagonal overlay for depth."""
    px = img.load()
    w, h = img.size
    for y in range(h):
        t = y / h
        base = lerp_color(top, bottom, t)
        for x in range(w):
            # slight diagonal warmth on top-left
            s = max(0.0, 1.0 - (x + y) / (w + h) * 0.6) * 0.08
            r = min(255, int(base[0] + 255 * s))
            g = min(255, int(base[1] + 255 * s))
            b = min(255, int(base[2] + 255 * s))
            px[x, y] = (r, g, b, 255)
    return img


def heart_poly(cx, cy, scale, steps=512):
    """Parametric heart; scale ≈ pixel half-width."""
    pts = []
    for i in range(steps):
        t = -math.pi + 2 * math.pi * i / steps
        x = 16 * math.sin(t) ** 3
        y = -(13*math.cos(t) - 5*math.cos(2*t) - 2*math.cos(3*t) - math.cos(4*t))
        pts.append((cx + x * scale, cy + y * scale))
    return pts


def draw_radial_glow(draw, cx, cy, max_r, color_rgb, max_alpha=40, steps=60):
    """Soft radial glow by layering transparent circles."""
    for i in range(steps, 0, -1):
        r     = int(max_r * i / steps)
        alpha = int(max_alpha * (1 - i / steps) ** 1.5)
        if alpha < 1:
            continue
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(*color_rgb, alpha),
        )


# ─── Main draw ────────────────────────────────────────────────────────────────

def make_icon():
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))

    # 1. Gradient background
    draw_gradient_bg(img,
                     top=(52, 120, 240),
                     bottom=(18, 50, 160))

    draw = ImageDraw.Draw(img)

    # 2. Central glow (makes it feel lit from within)
    draw_radial_glow(draw, HALF, HALF - 30, 380,
                     color_rgb=(100, 160, 255), max_alpha=55)

    # ── 3. Shield / drop shape (white, slightly transparent) ─────────────────
    #    A rounded shield: wide top, narrowing to a soft point at bottom.
    shield_w = 310
    shield_h = 370
    sx, sy   = HALF, HALF - 20   # center of shield

    shield_pts = []
    # Top arc (flat): from left to right across the top
    top_y = sy - shield_h * 0.48
    for a in range(180, -1, -2):
        rad   = math.radians(a)
        px_   = sx + shield_w * math.cos(rad)
        py_   = top_y + shield_w * 0.28 * math.sin(rad)   # slight oval top
        shield_pts.append((px_, py_))

    # Right side curving down to bottom point
    for t_ in range(0, 101, 2):
        frac  = t_ / 100
        px_   = sx + shield_w * (1 - frac) * (1 - frac * 0.3)
        # cubic ease to point
        py_   = top_y + shield_w * 0.28 + (shield_h - shield_w * 0.28) * (frac ** 1.6)
        shield_pts.append((px_, py_))

    # Left side (mirror) bottom to top
    for t_ in range(100, -1, -2):
        frac  = t_ / 100
        px_   = sx - shield_w * (1 - frac) * (1 - frac * 0.3)
        py_   = top_y + shield_w * 0.28 + (shield_h - shield_w * 0.28) * (frac ** 1.6)
        shield_pts.append((px_, py_))

    # Draw shield fill
    draw.polygon(shield_pts, fill=(255, 255, 255, 230))

    # Very subtle inner shadow on shield (darkened rim)
    shield_inner = [(x + (sx - x) * 0.06, y + (sy + shield_h*0.3 - y) * 0.04)
                    for x, y in shield_pts]
    draw.polygon(shield_inner, fill=(255, 255, 255, 255))

    # ── 4. Heart inside the shield ───────────────────────────────────────────
    hx, hy    = HALF, HALF - 45
    h_scale   = 13.0
    h_pts     = heart_poly(hx, hy, h_scale)

    # Heart color: vivid blue on white shield = use the bg blue
    draw.polygon(h_pts, fill=(45, 105, 220, 240))

    # Thin white highlight on heart top-left
    h_pts_sm  = heart_poly(hx - 6, hy - 8, h_scale * 0.88)
    draw.polygon(h_pts_sm, fill=(80, 140, 235, 80))

    # ── 5. EKG pulse line below heart ────────────────────────────────────────
    base_y = hy + 168
    # Key x positions relative to center
    kx = [HALF + dx for dx in
          [-200, -140, -100, -70, -45, -20, 10, 40, 70, 90, 120, 160, 200]]
    ky_offsets = [0, 0, 0, 0, -72, 72, -100, 80, -28, 0, 0, 0, 0]

    for i in range(len(kx) - 1):
        x1, y1 = kx[i],   base_y + ky_offsets[i]
        x2, y2 = kx[i+1], base_y + ky_offsets[i+1]
        # Glow layer (wider, more transparent)
        draw.line([(x1, y1), (x2, y2)],
                  fill=(45, 105, 220, 60), width=14)
        # Core line
        draw.line([(x1, y1), (x2, y2)],
                  fill=(45, 105, 220, 200), width=6)

    # ── 6. Subtle vignette (darker corners) ──────────────────────────────────
    vignette = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    vd       = ImageDraw.Draw(vignette)
    for r in range(SIZE // 2, 0, -8):
        alpha = int(60 * (r / (SIZE // 2)) ** 3)
        vd.ellipse([HALF - r, HALF - r, HALF + r, HALF + r],
                   fill=(0, 0, 0, alpha))
    # Invert: dark at corners, light at center — use composite subtract
    vignette_inv = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    vi           = ImageDraw.Draw(vignette_inv)
    for r in range(SIZE // 2, 0, -6):
        alpha = int(55 * (1 - r / (SIZE // 2)) ** 2)
        vi.ellipse([HALF - r, HALF - r, HALF + r, HALF + r],
                   fill=(0, 0, 0, alpha))
    img = Image.alpha_composite(img, vignette_inv)

    # ── 7. Very slight blur to smooth any pixel edges ─────────────────────────
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))

    return img


# ─── Export ───────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("Rendering final icon...")
    icon = make_icon()

    # Save master (RGBA)
    master_path = os.path.join(OUT, 'icon-final-master.png')
    icon.save(master_path, 'PNG')

    # App Store submission copy (RGB, no alpha — Apple requires this)
    rgb_icon = icon.convert('RGB')

    icon_path   = os.path.join(OUT, 'icon.png')
    rgb_icon.save(icon_path, 'PNG')
    print(f"  icon.png         -> {icon_path}")

    # Splash (centered icon on gradient, 1284x2778)
    SW, SH = 1284, 2778
    splash = Image.new('RGBA', (SW, SH))
    draw_gradient_bg(splash, top=(52,120,240), bottom=(18,50,160))
    # Paste icon centered, slightly above middle
    icon_sm = icon.resize((340, 340), Image.LANCZOS)
    px_ = (SW - 340) // 2
    py_ = SH // 2 - 240
    splash.paste(icon_sm, (px_, py_), icon_sm)
    splash_path = os.path.join(OUT, 'splash-icon.png')
    splash.convert('RGB').save(splash_path, 'PNG')
    print(f"  splash-icon.png  -> {splash_path}")

    # Adaptive icon foreground for Android (icon on transparent)
    android = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    android.paste(icon.resize((800, 800), Image.LANCZOS), (112, 112), icon.resize((800,800), Image.LANCZOS))
    android_path = os.path.join(OUT, 'android-icon-foreground.png')
    android.save(android_path, 'PNG')
    print(f"  android fg       -> {android_path}")

    print("\nAll done. Preview assets/icon.png.")
