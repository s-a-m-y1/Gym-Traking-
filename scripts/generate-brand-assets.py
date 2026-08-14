"""Generate deterministic Expo brand assets from the Heavy mark."""

from pathlib import Path

from PIL import Image, ImageColor, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
INK = "#F8F8FC"
ACCENT = "#7C6EF8"
ACCENT_DARK = "#5549D8"
BACKGROUND = "#0F0F0F"


def rounded_line(draw, points, width, fill):
    draw.line(points, fill=fill, width=width, joint="curve")
    radius = width // 2
    for x, y in (points[0], points[-1]):
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)


def draw_mark(size, fill=INK, scale=1.0):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    center = size / 2
    factor = size / 1024 * scale

    def point(x, y):
        return (round(center + (x - 512) * factor), round(center + (y - 512) * factor))

    rounded_line(draw, [point(284, 360), point(284, 664)], round(104 * factor), fill)
    rounded_line(draw, [point(740, 360), point(740, 664)], round(104 * factor), fill)
    rounded_line(draw, [point(336, 512), point(688, 512)], round(88 * factor), fill)
    rounded_line(draw, [point(436, 384), point(436, 640)], round(72 * factor), fill)
    rounded_line(draw, [point(588, 384), point(588, 640)], round(72 * factor), fill)
    return image


def gradient_square(size):
    image = Image.new("RGB", (size, size))
    pixels = image.load()
    top = ImageColor.getrgb(ACCENT)
    bottom = ImageColor.getrgb(ACCENT_DARK)
    for y in range(size):
        t = y / max(size - 1, 1)
        row = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(size):
            pixels[x, y] = row
    return image.convert("RGBA")


def save_icon():
    image = gradient_square(1024)
    image.alpha_composite(draw_mark(1024, scale=0.78))
    image.convert("RGB").save(ASSETS / "icon.png", optimize=True)


def save_android_assets():
    foreground = draw_mark(1024, scale=0.66)
    foreground.save(ASSETS / "android-icon-foreground.png", optimize=True)

    background = gradient_square(1024)
    background.save(ASSETS / "android-icon-background.png", optimize=True)

    monochrome = draw_mark(432, fill="#FFFFFF", scale=0.66)
    monochrome.save(ASSETS / "android-icon-monochrome.png", optimize=True)


def save_splash():
    # The native splash uses this transparent mark over app.json's backgroundColor.
    mark = draw_mark(1024, fill=INK, scale=0.72)
    mark.save(ASSETS / "splash-icon.png", optimize=True)


def save_favicon():
    large = gradient_square(192)
    large.alpha_composite(draw_mark(192, scale=0.78))
    large.resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / "favicon.png", optimize=True)


if __name__ == "__main__":
    save_icon()
    save_android_assets()
    save_splash()
    save_favicon()
