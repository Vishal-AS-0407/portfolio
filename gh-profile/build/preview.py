"""Render each asset exactly the way GitHub does — as an <img>, which puts the SVG
in restricted mode (no external fonts, no scripts). If it looks right here it looks
right on the profile."""
import pathlib, sys, asyncio
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SHOTS = ROOT / "build" / "preview"
SHOTS.mkdir(parents=True, exist_ok=True)

# GitHub's README content column is ~830px wide
GH_W = 830


async def main():
    theme = sys.argv[1] if len(sys.argv) > 1 else "dark"
    bg = "#0d1117" if theme == "dark" else "#ffffff"
    files = sorted(ASSETS.glob(f"*-{theme}.svg"))

    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for f in files:
            # a real file next to the asset, so the relative file:// load is allowed
            host = ASSETS / "_preview.html"
            host.write_text(
                f"<style>html,body{{margin:0;background:{bg}}}"
                f"img{{display:block;width:{GH_W}px}}</style>"
                f'<img src="{f.name}">', encoding="utf-8")
            p = await b.new_page(viewport={"width": GH_W, "height": 400},
                                 device_scale_factor=2)
            errs = []
            p.on("pageerror", lambda e: errs.append(str(e)))
            await p.goto(host.as_uri())
            await p.wait_for_timeout(3400)          # let the draw-on finish
            el = await p.query_selector("img")
            box = await el.bounding_box()
            await p.set_viewport_size({"width": GH_W, "height": max(40, int(box["height"]) + 2)})
            await p.wait_for_timeout(300)
            await p.screenshot(path=str(SHOTS / f"{f.stem}.png"))
            print(f"{f.name:22s} rendered {box['width']:.0f}x{box['height']:.0f}"
                  + (f"  ERRORS {errs}" if errs else ""))
            await p.close()
        await b.close()


asyncio.run(main())
