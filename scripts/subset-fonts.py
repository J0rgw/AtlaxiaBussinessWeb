"""
Regenerates the subset web fonts in src/assets/fonts.

Sources:
- Overused Grotesk (variable, OFL): scripts/fonts/source/OverusedGrotesk-VF.woff2,
  from https://github.com/RandomMaerks/Overused-Grotesk (not published on npm).
- JetBrains Mono (variable, OFL): the Fontsource package in node_modules.

Both are limited to weights 400 to 600, without slant, and subset to Latin
(covers Spanish and English).

Usage (from v2/):
    python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools brotli
    .venv-fonts/bin/python scripts/subset-fonts.py
"""

from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
MODULES = ROOT / "node_modules"
SOURCES = ROOT / "scripts" / "fonts" / "source"
OUT = ROOT / "src" / "assets" / "fonts"

# Same Latin range Google Fonts uses. Must match unicode-range in src/styles/fonts.css.
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,"
    "U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"
)


def limit_axes(source: Path, axes: dict) -> TTFont:
    """Instantiate a variable font and reload it (subsetting a freshly instanced
    font in memory fails on lazily loaded variation data)."""
    font = instancer.instantiateVariableFont(TTFont(source), axes)
    buffer = BytesIO()
    font.save(buffer)
    buffer.seek(0)
    return TTFont(buffer)


def subset_font(font: TTFont, output: Path) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.hinting = False
    options.desubroutinize = True
    options.layout_features = [*options.layout_features, "case", "tnum"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(LATIN))
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(output)
    print(f"{output.relative_to(ROOT)}: {output.stat().st_size / 1024:.1f} KB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    grotesk = limit_axes(SOURCES / "OverusedGrotesk-VF.woff2", {"wght": (400, 600), "slnt": 0})
    subset_font(grotesk, OUT / "overused-grotesk-latin-wght-400-600.woff2")

    mono = MODULES / "@fontsource-variable" / "jetbrains-mono" / "files"
    mono_font = limit_axes(mono / "jetbrains-mono-latin-wght-normal.woff2", {"wght": (400, 600)})
    subset_font(mono_font, OUT / "jetbrains-mono-latin-wght-400-600.woff2")


if __name__ == "__main__":
    main()
