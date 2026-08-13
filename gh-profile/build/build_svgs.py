"""Builds every SVG asset for the profile README.

Theme: READOUT. Palette: cividis (a real perceptually-uniform scientific colormap,
navy -> slate -> warm grey -> gold), deliberately not the portfolio's magma.

All text is converted to outline paths — an <img>-embedded SVG cannot load webfonts.
Animation is CSS inside the file, which does run in that context.
"""
import math
import pathlib
import typeset as T

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets"
OUT.mkdir(parents=True, exist_ok=True)

# ── cividis control points ────────────────────────────────────────────────────
CIVIDIS = ["#00204C", "#20386B", "#41537B", "#5D6A7B", "#7E8474", "#A79E67", "#D3BC53", "#FFEA46"]

DARK = dict(
    ground="#0A1128", ink="#E8EAF0", dim="#8B93A6", faint="#3A4560",
    hair="#1E2A47", gold="#FFEA46", ramp=CIVIDIS, glow=0.55,
)
LIGHT = dict(
    ground="#F6F7F9", ink="#0A1128", dim="#5A6478", faint="#B9C0CC",
    hair="#DCE0E8", gold="#8A6D0B",
    # the pale end of cividis is invisible on white, so the ramp is compressed
    ramp=["#00204C", "#1B3364", "#334874", "#4A5C79", "#5F6B6E", "#77713F", "#8A6D0B", "#9A7A05"],
    glow=0.0,
)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def path(d, **attrs):
    a = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<path d="{d}" {a}/>'


def txt(text, size, x, y, fill, *, mono=False, wght=None, wdth=100,
        tracking=0.0, anchor="start", opacity=None, cls=None):
    """Typeset to outline paths. anchor: start | middle | end."""
    kw = dict(size=size, wght=wght if wght is not None else (400 if mono else 600),
              tracking=tracking)
    if mono:
        d, w = T.mono(text, size=size, wght=kw["wght"], tracking=tracking)
    else:
        d, w = T.typeset(text, size=size, wght=kw["wght"], wdth=wdth, tracking=tracking)
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    if mono:
        d, _ = T.mono(text, size=size, wght=kw["wght"], tracking=tracking, x=x, y=y)
    else:
        d, _ = T.typeset(text, size=size, wght=kw["wght"], wdth=wdth,
                         tracking=tracking, x=x, y=y)
    attrs = {"fill": fill}
    if opacity is not None:
        attrs["opacity"] = opacity
    if cls:
        attrs["class"] = cls
    return path(d, **attrs), w


def polyline_len(pts):
    return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def smooth_path(pts):
    """Catmull-Rom -> cubic bezier, so the trace reads as an instrument line."""
    if len(pts) < 3:
        return "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    d = [f"M {pts[0][0]:.1f},{pts[0][1]:.1f}"]
    for i in range(len(pts) - 1):
        p0 = pts[max(i - 1, 0)]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[min(i + 2, len(pts) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C {c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}")
    return " ".join(d)


def ramp_stops(ramp, gid, x1=0, y1=0, x2=1, y2=0):
    stops = "".join(
        f'<stop offset="{i/(len(ramp)-1):.3f}" stop-color="{c}"/>' for i, c in enumerate(ramp)
    )
    return (f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            f"{stops}</linearGradient>")


# ── 01 · banner ───────────────────────────────────────────────────────────────
def banner(t, name):
    W, H = 1200, 344
    P = []                                   # plot area
    px0, px1, py0, py1 = 606, 1140, 58, 244

    # the convergence curve: steep early drop, asymptotic tail — a real loss shape
    pts = []
    N = 190
    for i in range(N + 1):
        u = i / N
        v = 1 - math.exp(-3.5 * u)
        wob = (math.sin(u * 27) * 13 + math.sin(u * 61 + 1.4) * 6) * (1 - u) ** 2
        pts.append((px0 + u * (px1 - px0), py0 + 14 + v * (py1 - py0 - 34) + wob))
    curve_d = smooth_path(pts)
    L = polyline_len(pts) * 1.02
    endx, endy = pts[-1]

    # grid
    for gx in range(px0, px1 + 1, 76):
        P.append(f'<line x1="{gx}" y1="{py0}" x2="{gx}" y2="{py1}" stroke="{t["hair"]}" stroke-width="1"/>')
    for gy in range(py0, py1 + 1, 31):
        P.append(f'<line x1="{px0}" y1="{gy}" x2="{px1}" y2="{gy}" stroke="{t["hair"]}" stroke-width="1"/>')
    P.append(f'<line x1="{px0}" y1="{py1}" x2="{px1}" y2="{py1}" stroke="{t["faint"]}" stroke-width="1.5"/>')
    P.append(f'<line x1="{px0}" y1="{py0}" x2="{px0}" y2="{py1}" stroke="{t["faint"]}" stroke-width="1.5"/>')

    # axis labels
    a, _ = txt("EPOCH", 9, px0, py1 + 18, t["dim"], mono=True, tracking=0.22)
    P.append(a)
    a, _ = txt("LOSS", 9, px0 - 10, py0 + 8, t["dim"], mono=True, tracking=0.22, anchor="end")
    P.append(a)

    if t["glow"]:
        P.append(f'<path d="{curve_d}" fill="none" stroke="url(#g)" stroke-width="9" '
                 f'opacity="{t["glow"]*0.30:.2f}" stroke-linecap="round" filter="url(#soft)" class="draw"/>')
    P.append(f'<path d="{curve_d}" fill="none" stroke="url(#g)" stroke-width="3.1" '
             f'stroke-linecap="round" stroke-linejoin="round" class="draw"/>')

    # settled endpoint
    P.append(f'<g class="tip"><circle cx="{endx:.1f}" cy="{endy:.1f}" r="12" fill="{t["gold"]}" opacity=".16" class="pulse"/>'
             f'<circle cx="{endx:.1f}" cy="{endy:.1f}" r="4.2" fill="{t["gold"]}"/></g>')

    # sweep
    P.append(f'<rect class="sweep" x="{px0}" y="{py0}" width="70" height="{py1-py0}" fill="url(#sw)"/>')

    # ── left column ──
    a, _ = txt("PROFILE READOUT", 10, 64, 74, t["dim"], mono=True, tracking=0.34)
    P.append(a)
    P.append(f'<line x1="64" y1="90" x2="196" y2="90" stroke="{t["gold"]}" stroke-width="2"/>')

    # set in two runs: the font's own space is far too tight at this tracking,
    # and "VISHAL A S" collapses into "VISHALAS"
    first, rest = name.split(" ", 1)
    d1, w1 = txt(first, 104, 64, 178, t["ink"], wght=700, wdth=86, tracking=-0.045)
    d2, _ = txt(rest, 104, 64 + w1 + 104 * 0.20, 178, t["ink"], wght=700, wdth=86, tracking=-0.045)
    P.append(d1)
    P.append(d2)

    a, _ = txt("AI DEVELOPER  ·  ML ENGINEER", 15, 64, 212, t["ink"],
               mono=True, wght=500, tracking=0.10, opacity=".88")
    P.append(a)
    a, _ = txt("CISAI (INNSPARK)  ·  COIMBATORE, INDIA", 11, 64, 236, t["dim"],
               mono=True, tracking=0.16)
    P.append(a)

    # ── telemetry strip ──
    cells = [("PUBLICATIONS", "03", False), ("PATENTS FILED", "02", False),
             ("BEST RANK", "1 / 25", True), ("CGPA", "8.48", False)]
    # cells are sized by their own content so labels never run into the divider
    lw = [max(T.mono(lb, 8.5, tracking=0.24)[1],
              T.typeset(v, 21, wght=600, wdth=90, tracking=-0.02)[1]) + 34
          for lb, v, _ in cells]
    x = 64
    P.append(f'<line x1="64" y1="266" x2="{64+sum(lw)-34:.0f}" y2="266" stroke="{t["hair"]}" stroke-width="1"/>')
    for i, (label, value, hot) in enumerate(cells):
        a, _ = txt(label, 8.5, x, 288, t["dim"], mono=True, tracking=0.24)
        P.append(a)
        a, _ = txt(value, 21, x, 314, t["gold"] if hot else t["ink"],
                   wght=600, wdth=90, tracking=-0.02)
        P.append(a)
        x += lw[i]
        if i < len(cells) - 1:
            P.append(f'<line x1="{x-17:.0f}" y1="276" x2="{x-17:.0f}" y2="316" stroke="{t["hair"]}" stroke-width="1"/>')

    style = f"""
    .draw {{ stroke-dasharray: {L:.0f}; stroke-dashoffset: {L:.0f};
             animation: dr 2.4s cubic-bezier(.22,1,.36,1) .25s forwards; }}
    .tip  {{ opacity: 0; animation: fi .7s ease-out 2.35s forwards; }}
    .pulse{{ animation: pl 2.6s ease-out 2.6s infinite; transform-origin: {endx:.1f}px {endy:.1f}px; }}
    .sweep{{ opacity: 0; animation: sw 2.4s linear .25s 1; }}
    @keyframes dr {{ to {{ stroke-dashoffset: 0; }} }}
    @keyframes fi {{ to {{ opacity: 1; }} }}
    @keyframes pl {{ 0%{{transform:scale(.6);opacity:.34}} 70%{{transform:scale(2.4);opacity:0}} 100%{{opacity:0}} }}
    @keyframes sw {{ 0%{{opacity:.75;transform:translateX(0)}} 92%{{opacity:.55}}
                     100%{{opacity:0;transform:translateX({px1-px0-70}px)}} }}
    @media (prefers-reduced-motion: reduce) {{
      .draw {{ animation: none; stroke-dashoffset: 0; }}
      .tip  {{ animation: none; opacity: 1; }}
      .pulse, .sweep {{ animation: none; opacity: 0; }}
    }}"""

    defs = (ramp_stops(t["ramp"], "g")
            + f'<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">'
              f'<stop offset="0" stop-color="{t["gold"]}" stop-opacity="0"/>'
              f'<stop offset="1" stop-color="{t["gold"]}" stop-opacity=".30"/></linearGradient>'
            + '<filter id="soft"><feGaussianBlur stdDeviation="5"/></filter>')

    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'role="img" aria-label="{esc(name)} — AI Developer and ML Engineer">'
            f"<defs>{defs}</defs><style>{style}</style>"
            f'<rect width="{W}" height="{H}" fill="{t["ground"]}"/>'
            + "".join(P) + "</svg>")


# ── 02 · signal strip ─────────────────────────────────────────────────────────
CHANNELS = ["Fp1", "F3", "Cz", "Pz"]


def signal(t):
    """Four EEG channels on a scrolling chart recorder — his actual research domain,
    not generic waveform decoration. The labelled gutter is what sells it."""
    W, H = 1200, 152
    GUT = 92                                  # static label gutter
    TOP = 34                                  # headroom for the header label
    body, chrome = [], []
    seed = 7

    def rnd():
        nonlocal seed
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647

    lanes = len(CHANNELS)
    lane_h = (H - TOP - 14) / lanes
    for c in range(lanes):
        base = TOP + lane_h * (c + 0.5)
        col = t["ramp"][[1, 3, 5, 7][c]]
        amp = lane_h * 0.40
        ph = rnd() * 6.28
        # EEG reads as dense and spiky, so most of the energy is high-frequency
        comps = [(2 + c, .34), (7 + c * 2, .26), (17 + c * 3, .20),
                 (31 + c * 5, .13), (53 + c * 7, .07)]
        pts = []
        for i in range(0, 2 * W + 1, 8):
            th = ((i % W) / W) * 2 * math.pi
            y = base + amp * sum(math.sin(th * f + ph * (k + 1)) * a
                                 for k, (f, a) in enumerate(comps))
            pts.append((i, y))
        body.append(f'<path d="{smooth_path(pts)}" fill="none" stroke="{col}" '
                    f'stroke-width="1.6" stroke-linecap="round" opacity=".95"/>')

        a, _ = txt(CHANNELS[c], 10, GUT - 20, base + 3.5, t["dim"],
                   mono=True, tracking=0.14, anchor="end")
        chrome.append(a)

    chrome.append(f'<line x1="{GUT}" y1="{TOP-16}" x2="{GUT}" y2="{H-8}" stroke="{t["hair"]}" stroke-width="1"/>')
    a, _ = txt("EEG  ·  4 CHANNELS  ·  200 Hz", 8.5, 26, 20, t["gold"],
               mono=True, tracking=0.2, opacity=".8")
    chrome.append(a)
    chrome.append(f'<line x1="26" y1="{TOP-16}" x2="{W-26}" y2="{TOP-16}" stroke="{t["hair"]}" stroke-width="1"/>')

    style = """
    .scroll { animation: sc 30s linear infinite; }
    @keyframes sc { to { transform: translateX(-1200px); } }
    @media (prefers-reduced-motion: reduce) { .scroll { animation: none; } }"""

    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'role="img" aria-label="Four-channel EEG trace on a scrolling chart recorder">'
            f"<style>{style}</style>"
            f'<defs><clipPath id="pl"><rect x="{GUT}" y="0" width="{W-GUT}" height="{H}"/></clipPath>'
            f'<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">'
            f'<stop offset="0" stop-color="{t["ground"]}"/>'
            f'<stop offset=".06" stop-color="{t["ground"]}" stop-opacity="0"/>'
            f'<stop offset=".93" stop-color="{t["ground"]}" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="{t["ground"]}"/></linearGradient></defs>'
            f'<rect width="{W}" height="{H}" fill="{t["ground"]}"/>'
            f'<g clip-path="url(#pl)"><g class="scroll">{"".join(body)}</g></g>'
            f'<rect x="{GUT}" width="{W-GUT}" height="{H}" fill="url(#fade)"/>'
            + "".join(chrome) + "</svg>")


# ── 03 · stack matrix ─────────────────────────────────────────────────────────
STACK = [
    ("LANGUAGES", ["Python", "Java", "SQL", "TypeScript"]),
    ("ML / DL", ["PyTorch", "TensorFlow", "Keras", "scikit-learn", "Transformers", "timm", "Captum"]),
    ("LLM / AGENTS", ["LangChain", "LangGraph", "DeepAgents", "smolagents", "CrewAI", "vLLM",
                      "Hugging Face", "MCP", "RAG", "GRPO"]),
    ("SIGNAL / VISION", ["Librosa", "OpenCV", "SciPy", "EEG", "Spectrograms"]),
    ("DATA / INFRA", ["PostgreSQL", "MongoDB", "Neo4j", "DuckDB", "FAISS", "Redis", "Pinecone",
                      "Docker", "Azure", "FastAPI", "MLOps"]),
]


def stack(t):
    # narrower than the other assets on purpose: it scales down less inside
    # GitHub's ~830px column, so the type stays readable
    W = 920
    LX, RX = 210, 880           # label column / items column
    size = 14.5
    gap = 26.0
    lh = 27
    rows = []
    y = 46

    for label, items in STACK:
        # wrap items into lines that fit
        lines, cur, curw = [], [], 0.0
        for it in items:
            w = T.width(it, size, wght=400)
            if cur and curw + gap + w > RX - LX:
                lines.append(cur)
                cur, curw = [it], w
            else:
                curw = curw + (gap if cur else 0) + w
                cur.append(it)
        if cur:
            lines.append(cur)

        block_h = len(lines) * lh
        rows.append(f'<line x1="40" y1="{y-24}" x2="{RX}" y2="{y-24}" stroke="{t["hair"]}" stroke-width="1"/>')
        a, _ = txt(label, 9.5, LX - 26, y - 2, t["gold"], mono=True, tracking=0.22, anchor="end")
        rows.append(a)

        yy = y
        for line in lines:
            x = LX
            for it in line:
                a, w = txt(it, size, x, yy, t["ink"], wght=400, wdth=100, opacity=".92")
                rows.append(a)
                x += w + gap
                if it is not line[-1]:
                    rows.append(f'<circle cx="{x-gap/2:.1f}" cy="{yy-5:.1f}" r="1.6" fill="{t["faint"]}"/>')
            yy += lh
        y += block_h + 24

    H = int(y - 4)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'role="img" aria-label="Technical stack">'
            f'<rect width="{W}" height="{H}" fill="{t["ground"]}"/>' + "".join(rows) + "</svg>")


# ── 04 · rule ─────────────────────────────────────────────────────────────────
def rule(t):
    W, H = 1200, 5
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="presentation">'
            f'<defs>{ramp_stops(t["ramp"], "r")}</defs>'
            f'<rect width="{W}" height="{H}" fill="url(#r)"/></svg>')


if __name__ == "__main__":
    for suffix, t in (("dark", DARK), ("light", LIGHT)):
        (OUT / f"banner-{suffix}.svg").write_text(banner(t, "VISHAL A S"), encoding="utf-8")
        (OUT / f"signal-{suffix}.svg").write_text(signal(t), encoding="utf-8")
        (OUT / f"stack-{suffix}.svg").write_text(stack(t), encoding="utf-8")
        (OUT / f"rule-{suffix}.svg").write_text(rule(t), encoding="utf-8")
    for f in sorted(OUT.glob("*.svg")):
        print(f"{f.name:22s} {f.stat().st_size/1024:6.1f} KB")
