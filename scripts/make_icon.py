"""
ChronicCare App Icon Generator
Produces a 1024x1024 PNG ready for Apple App Store submission.
Design: Deep blue gradient + white heart + white leaf — clean, premium, minimal.
"""

from PIL import Image, ImageDraw
import math, os

SIZE = 1024
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUT_DIR, exist_ok=True)

# ── Helper: smooth gradient background ───────────────────────────────────────

def make_gradient(size, top_color, bottom_color):
    img = Image.new('RGBA', (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * t)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * t)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    return img

# ── Helper: draw heart shape ─────────────────────────────────────────────────

def heart_points(cx, cy, scale, steps=300):
    """Parametric heart curve, centered at (cx, cy)."""
    pts = []
    for i in range(steps + 1):
        t = -math.pi + 2 * math.pi * i / steps
        # Classic heart parametric
        x = scale * 16 * math.sin(t) ** 3
        y = -scale * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t))
        pts.append((cx + x, cy + y))
    return pts

# ── Helper: draw ellipse (leaf) ───────────────────────────────────────────────

def ellipse_points(cx, cy, rx, ry, angle_deg, steps=120):
    a = math.radians(angle_deg)
    pts = []
    for i in range(steps + 1):
        t = 2 * math.pi * i / steps
        x = rx * math.cos(t)
        y = ry * math.sin(t)
        # Rotate
        xr = x * math.cos(a) - y * math.sin(a)
        yr = x * math.sin(a) + y * math.cos(a)
        pts.append((cx + xr, cy + yr))
    return pts

# ── Main icon: Blue gradient + heart + leaf ───────────────────────────────────

def make_icon_blue():
    # Background: #3B82F6 → #1D4ED8
    img = make_gradient(SIZE, (59, 130, 246), (29, 78, 216))

    # Subtle radial highlight (top-left)
    overlay = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    for radius in range(360, 0, -1):
        alpha = int(30 * (1 - radius / 360))
        ImageDraw.Draw(overlay).ellipse(
            [SIZE*0.25 - radius, SIZE*0.2 - radius,
             SIZE*0.25 + radius, SIZE*0.2 + radius],
            fill=(255, 255, 255, alpha)
        )
    img = Image.alpha_composite(img.convert('RGBA'), overlay)

    draw = ImageDraw.Draw(img)

    # ── Heart (white, centered slightly above middle) ──
    cx, cy = SIZE // 2, SIZE // 2 + 30
    scale = 17.5  # controls heart size
    h_pts = heart_points(cx, cy, scale)
    draw.polygon(h_pts, fill=(255, 255, 255, 242))

    # ── Leaf (top-right of heart, tilted) ──
    lx = cx + 168
    ly = cy - 155
    leaf_pts = ellipse_points(lx, ly, 72, 36, -42)
    draw.polygon(leaf_pts, fill=(255, 255, 255, 235))

    # Leaf vein (subtle, blue-tinted)
    angle = math.radians(-42)
    dx = 62 * math.cos(angle)
    dy = 62 * math.sin(angle)
    draw.line(
        [(lx - dx, ly - dy), (lx + dx, ly + dy)],
        fill=(120, 170, 240, 160), width=5
    )

    # ── Leaf stem connecting to heart ──
    draw.line(
        [(cx + 120, cy - 95), (lx - 30, ly + 20)],
        fill=(255, 255, 255, 180), width=6
    )

    return img.convert('RGB')


# ── Variant: Dark navy + heart + pulse line ───────────────────────────────────

def make_icon_dark():
    img = make_gradient(SIZE, (15, 23, 42), (22, 52, 88))

    draw = ImageDraw.Draw(img)

    # Blue glow center
    cx, cy = SIZE // 2, SIZE // 2 - 20
    for r in range(280, 0, -4):
        alpha = int(18 * (1 - r / 280))
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(59, 130, 246, alpha))

    # Corner bracket marks
    b = 240  # half-size of bracket square
    blen = 80
    bw = 7
    for sx, sy in [(-1,-1),(1,-1),(-1,1),(1,1)]:
        px, py = cx + sx*b, cy + sy*b
        draw.line([(px, py), (px + sx*blen, py)], fill=(255,255,255,100), width=bw)
        draw.line([(px, py), (px, py + sy*blen)], fill=(255,255,255,100), width=bw)

    # Gradient heart (blue shades)
    h_pts = heart_points(cx, cy - 30, 15.5)
    # Draw layered for gradient feel
    for i, col in enumerate([
        (96, 165, 250, 255),
        (59, 130, 246, 255),
        (37, 99, 235, 255),
    ]):
        offset = i * 6
        pts_off = [(x, y + offset) for x, y in h_pts]
        if i < 2:
            draw.polygon(pts_off, fill=col)
    draw.polygon(h_pts, fill=(96, 165, 250, 255))

    # Pulse / ECG line below heart
    py_base = cy + 210
    pulse_x = [
        cx - 220, cx - 160, cx - 120, cx - 90,
        cx - 65,  cx - 40,  cx - 15, cx + 10,
        cx + 35,  cx + 70,  cx + 120, cx + 160, cx + 220
    ]
    pulse_y = [
        py_base, py_base, py_base, py_base,
        py_base - 65, py_base + 65, py_base - 85, py_base + 55,
        py_base - 25, py_base, py_base, py_base, py_base
    ]
    for i in range(len(pulse_x) - 1):
        draw.line(
            [(pulse_x[i], pulse_y[i]), (pulse_x[i+1], pulse_y[i+1])],
            fill=(96, 165, 250, 200), width=7
        )

    return img.convert('RGB')


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("Generating icons...")

    # Option A (recommended for App Store)
    icon_a = make_icon_blue()
    path_a = os.path.join(OUT_DIR, 'icon-blue-1024.png')
    icon_a.save(path_a, 'PNG', optimize=False)
    print(f"  [OK] Option A (Blue): {path_a}")

    # Option B (dark premium)
    icon_b = make_icon_dark()
    path_b = os.path.join(OUT_DIR, 'icon-dark-1024.png')
    icon_b.save(path_b, 'PNG', optimize=False)
    print(f"  [OK] Option B (Dark): {path_b}")

    # Copy Option A as the default icon.png
    default_path = os.path.join(OUT_DIR, 'icon.png')
    icon_a.save(default_path, 'PNG')
    print(f"  [OK] Default icon.png set to Option A")

    print("\nDone! Open assets/ to preview both options.")
    print("Right-click → Open With → Photos to preview on Windows.")
