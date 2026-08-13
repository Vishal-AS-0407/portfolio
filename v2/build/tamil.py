"""Render Tamil script to a transparent PNG for the dravidian-sentiment page.

Tamil needs complex-script shaping (vowel signs reorder and combine). fontTools
alone does cmap lookup with no shaping, which produces visually wrong text — so the
word is laid out by a real browser, which does shape it, and captured as an image.
That also means no 340KB font ships to visitors.
"""
import base64, pathlib, asyncio
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
FONT = HERE / "NotoSansTamil.ttf"
OUT = HERE.parent / "public" / "plates"

WORD = "தமிழ்"   # தமிழ் — "Tamil". The language itself.


async def main():
    b64 = base64.b64encode(FONT.read_bytes()).decode()
    html = f"""<!doctype html><meta charset=utf-8><style>
    @font-face {{ font-family: NT; src: url(data:font/ttf;base64,{b64}) format('truetype');
                  font-weight: 100 900; }}
    html,body {{ margin:0; background:transparent; }}
    #w {{ font-family: NT; font-weight: 700; font-size: 340px; line-height: 1;
          color: #fff; padding: 40px 60px; display: inline-block; white-space: nowrap; }}
    </style><div id="w">{WORD}</div>"""

    async with async_playwright() as pw:
        br = await pw.chromium.launch()
        p = await br.new_page(viewport={"width": 1800, "height": 600},
                              device_scale_factor=1)
        await p.set_content(html)
        await p.wait_for_timeout(1200)
        el = await p.query_selector("#w")
        box = await el.bounding_box()
        # a sanity check: unshaped Tamil collapses to a much narrower run
        print(f"shaped extent: {box['width']:.0f} x {box['height']:.0f}")
        assert box["width"] > 500, "text did not shape — refusing to ship it"
        await el.screenshot(path=str(OUT / "tamil.png"), omit_background=True)
        await br.close()
    f = OUT / "tamil.png"
    print("wrote", f, f.stat().st_size // 1024, "KB")


asyncio.run(main())
