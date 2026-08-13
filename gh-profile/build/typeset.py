"""Text -> SVG outline paths.

An SVG referenced by <img> (which is how GitHub embeds README images) runs in a
restricted mode: no external requests, so no @font-face, no webfonts. Any text left
as <text> falls back to whatever the viewer happens to have installed. So every
glyph here is converted to an outline path at build time.
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from functools import lru_cache
import pathlib

FONTS = pathlib.Path(__file__).resolve().parents[2] / "v2" / "public" / "fonts"


@lru_cache(maxsize=None)
def _instance(path: str, wght: float, wdth: float):
    f = TTFont(str(FONTS / path))
    f = instancer.instantiateVariableFont(f, {"wght": wght, "wdth": wdth}, inplace=True)
    return f, f.getGlyphSet(), f.getBestCmap(), f["head"].unitsPerEm


def missing(text: str, font="archivo.woff2", wght=600, wdth=100):
    _, _, cmap, _ = _instance(font, wght, wdth)
    return sorted({c for c in text if c != " " and ord(c) not in cmap})


def typeset(text, size, font="archivo.woff2", wght=600, wdth=100,
            tracking=0.0, x=0.0, y=0.0):
    """Return (path_d, advance_width).

    `tracking` is in em (like CSS letter-spacing / font-size). `y` is the baseline.
    Missing glyphs are skipped rather than tofu'd — call missing() first.
    """
    f, gs, cmap, upem = _instance(font, wght, wdth)
    scale = size / upem
    track = tracking * size
    pen_out = []
    cursor = 0.0

    for ch in text:
        gname = cmap.get(ord(ch))
        if gname is None:
            if ch == " ":
                cursor += size * 0.30 + track
            continue
        glyph = gs[gname]
        spen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}")
        # font units are Y-up; SVG is Y-down. Flip and place on the baseline.
        tpen = TransformPen(spen, Transform(scale, 0, 0, -scale, x + cursor, y))
        glyph.draw(tpen)
        d = spen.getCommands()
        if d:
            pen_out.append(d)
        cursor += glyph.width * scale + track

    return " ".join(pen_out), cursor - (track if text else 0)


def width(text, size, **kw):
    return typeset(text, size, **kw)[1]


def mono(text, size, wght=400, **kw):
    """Martian Mono. Its width axis is pinned at 112.5."""
    return typeset(text, size, font="martian-mono.woff2", wght=wght, wdth=112.5, **kw)
