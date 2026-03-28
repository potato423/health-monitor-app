"""Generate splash screen (1284x2778 for iPhone 15 Pro Max)."""
from PIL import Image, ImageDraw
import math, os

W, H = 1284, 2778
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')

def heart_points(cx, cy, scale, steps=300):
    pts = []
    for i in range(steps + 1):
        t = -math.pi + 2 * math.pi * i / steps
        x = scale * 16 * math.sin(t) ** 3
        y = -scale * (13*math.cos(t) - 5*math.cos(2*t) - 2*math.cos(3*t) - math.cos(4*t))
        pts.append((cx + x, cy + y))
    return pts

def ellipse_pts(cx, cy, rx, ry, angle_deg, steps=120):
    a = math.radians(angle_deg)
    pts = []
    for i in range(steps + 1):
        t = 2 * math.pi * i / steps
        x = rx*math.cos(t); y = ry*math.sin(t)
        pts.append((cx + x*math.cos(a) - y*math.sin(a),
                    cy + x*math.sin(a) + y*math.cos(a)))
    return pts

img = Image.new('RGBA', (W, H))
draw = ImageDraw.Draw(img)

# Background: same blue gradient
for y in range(H):
    t = y / H
    r = int(59  + (29 - 59)  * t)
    g = int(130 + (78 - 130) * t)
    b = int(246 + (216-246)  * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Subtle top glow
for radius in range(400, 0, -4):
    alpha = int(20 * (1 - radius/400))
    draw.ellipse([W*0.3-radius, H*0.18-radius, W*0.3+radius, H*0.18+radius],
                 fill=(255,255,255,alpha))

# Heart centered
cx, cy = W//2, H//2 - 120
draw.polygon(heart_points(cx, cy, 16), fill=(255,255,255,242))

# Leaf
lx, ly = cx+155, cy-143
draw.polygon(ellipse_pts(lx, ly, 66, 33, -42), fill=(255,255,255,230))
a = math.radians(-42)
draw.line([(lx-55*math.cos(a), ly-55*math.sin(a)),
           (lx+55*math.cos(a), ly+55*math.sin(a))],
          fill=(120,170,240,150), width=5)
draw.line([(cx+110, cy-88), (lx-28, ly+18)], fill=(255,255,255,170), width=5)

# App name text
try:
    from PIL import ImageFont
    font_title = ImageFont.truetype("arial.ttf", 80)
    font_sub   = ImageFont.truetype("arial.ttf", 42)
except:
    font_title = ImageFont.load_default()
    font_sub   = font_title

title = "ChronicCare"
sub   = "Diet & Health Monitor"

# Title
bbox = draw.textbbox((0,0), title, font=font_title)
tw = bbox[2]-bbox[0]
draw.text(((W-tw)//2, cy+330), title, fill=(255,255,255,235), font=font_title)

# Subtitle
bbox2 = draw.textbbox((0,0), sub, font=font_sub)
sw = bbox2[2]-bbox2[0]
draw.text(((W-sw)//2, cy+430), sub, fill=(255,255,255,140), font=font_sub)

out_path = os.path.join(OUT, 'splash-icon.png')
img.convert('RGB').save(out_path, 'PNG')
print(f"Splash saved: {out_path}")
