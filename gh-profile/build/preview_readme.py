"""Render README.md close to how GitHub renders it, in both colour schemes,
with the remote asset URLs rewritten to the local files so it can be checked
before anything is pushed."""
import pathlib, re, asyncio, sys
import markdown
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHOTS = ROOT / "build" / "preview"
SHOTS.mkdir(parents=True, exist_ok=True)
RAW = "https://raw.githubusercontent.com/Vishal-AS-0407/Vishal-AS-0407/main/assets/"

CSS = """
:root { color-scheme: %(scheme)s; }
body { margin:0; background:%(canvas)s; }
.md {
  max-width:830px; margin:0 auto; padding:32px 0 80px;
  color:%(fg)s; background:%(canvas)s;
  font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;
  word-wrap:break-word;
}
.md h2 {
  font-size:1.5em; font-weight:600; margin:24px 0 16px;
  padding-bottom:.3em; border-bottom:1px solid %(border)s;
}
.md p { margin:0 0 16px; }
.md a { color:%(link)s; text-decoration:none; }
.md a:hover { text-decoration:underline; }
.md table { border-collapse:collapse; display:block; width:max-content;
            max-width:100%%; overflow:auto; margin:0 0 16px; }
.md th, .md td { border:1px solid %(border)s; padding:6px 13px; }
.md th { font-weight:600; background:%(thbg)s; }
.md tr:nth-child(2n) td { background:%(altbg)s; }
.md img { max-width:100%%; box-sizing:content-box; vertical-align:middle; }
.md code { background:%(codebg)s; padding:.2em .4em; border-radius:6px;
           font:85%% ui-monospace,SFMono-Regular,Menlo,monospace; }
.md sub { font-size:.85em; color:%(muted)s; }
.md details { margin:0 0 16px; }
.md summary { cursor:pointer; }
.md hr { border:0; border-top:1px solid %(border)s; margin:24px 0; }
"""

THEMES = {
    "dark": dict(scheme="dark", canvas="#0d1117", fg="#e6edf3", border="#30363d",
                 link="#4493f8", thbg="#161b22", altbg="#161b22", codebg="#6e768166",
                 muted="#8d96a0"),
    "light": dict(scheme="light", canvas="#ffffff", fg="#1f2328", border="#d1d9e0",
                  link="#0969da", thbg="#f6f8fa", altbg="#f6f8fa", codebg="#afb8c133",
                  muted="#59636e"),
}


async def main():
    src = (ROOT / "README.md").read_text(encoding="utf-8")
    # point at the local assets so this works before the first push
    src = src.replace(RAW, (ROOT / "assets").as_uri() + "/")
    html_body = markdown.markdown(
        src, extensions=["tables", "md_in_html", "sane_lists"])

    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for name, t in THEMES.items():
            page_html = (f"<!doctype html><meta charset=utf-8><style>{CSS % t}</style>"
                         f'<div class="md">{html_body}</div>')
            host = ROOT / "assets" / "_readme.html"
            host.write_text(page_html, encoding="utf-8")
            p = await b.new_page(viewport={"width": 1000, "height": 1200},
                                 device_scale_factor=2,
                                 color_scheme=name)
            errs = []
            p.on("pageerror", lambda e: errs.append(str(e)))
            p.on("requestfailed", lambda r: errs.append(f"FAILED {r.url}"))
            await p.goto(host.as_uri())
            await p.wait_for_timeout(4200)
            # open the collapsed block so it can be checked too
            await p.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
            await p.wait_for_timeout(1200)
            h = await p.evaluate("document.querySelector('.md').scrollHeight")
            print(f"{name:6s} height={h}px" + (f"  ISSUES: {errs}" if errs else "  clean"))
            await p.screenshot(path=str(SHOTS / f"readme-{name}.png"), full_page=True)
            await p.close()
        await b.close()
        host.unlink(missing_ok=True)


asyncio.run(main())
