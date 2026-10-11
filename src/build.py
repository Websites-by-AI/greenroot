#!/usr/bin/env python3
"""GreenRoot build: inline CSS + JS into self-contained HTML pages."""
import pathlib, re

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent
PAGES = SRC / "pages"

css = (SRC / "style.css").read_text(encoding="utf-8")
i18n = (SRC / "i18n.js").read_text(encoding="utf-8")
extra = (SRC / "i18n-extra.js").read_text(encoding="utf-8")
areas = (SRC / "areas-i18n.js").read_text(encoding="utf-8")
app = (SRC / "app.js").read_text(encoding="utf-8")

SCRIPTS = ("<script>\n" + i18n + "\n</script>\n<script>\n" + extra +
           "\n</script>\n<script>\n" + areas +
           "\n</script>\n<script>\n" + app + "\n</script>")
STYLE = "<style>\n" + css + "\n</style>"

for page in sorted(PAGES.glob("*.html")):
    html = page.read_text(encoding="utf-8")
    assert "<!--STYLE-->" in html and "<!--APP-->" in html, page.name
    html = html.replace("<!--STYLE-->", STYLE).replace("<!--APP-->", SCRIPTS)
    out = OUT / page.name
    out.write_text(html, encoding="utf-8")
    print(f"built {out.name}  ({len(html)//1024} KB)")
print("done")
