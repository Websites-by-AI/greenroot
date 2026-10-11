#!/usr/bin/env python3
"""GreenRoot build: inline CSS + JS into self-contained HTML pages."""
import pathlib, re, json

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent / "site" if (SRC.parent / "site").is_dir() else SRC.parent
PAGES = SRC / "pages"

css = (SRC / "style.css").read_text(encoding="utf-8")
if (SRC / "partners.css").exists():
    css += "\n" + (SRC / "partners.css").read_text(encoding="utf-8")
if (SRC / "outreach.css").exists():
    css += "\n" + (SRC / "outreach.css").read_text(encoding="utf-8")
i18n = (SRC / "i18n.js").read_text(encoding="utf-8")
extra = (SRC / "i18n-extra.js").read_text(encoding="utf-8")
areas = (SRC / "areas-i18n.js").read_text(encoding="utf-8")
app = (SRC / "app.js").read_text(encoding="utf-8")
partners_i18n = (SRC / "partners-i18n.js").read_text(encoding="utf-8") if (SRC / "partners-i18n.js").exists() else ""

SCRIPTS = ("<script>\n" + i18n + "\n</script>\n<script>\n" + extra +
           "\n</script>\n<script>\n" + areas +
           "\n</script>\n<script>\n" + partners_i18n +
           "\n</script>\n<script>\n" + (SRC/"workflow-i18n.js").read_text() +
           "\n</script>\n<script>\n" + (SRC/"workflow.js").read_text() +
           "\n</script>\n<script>\n" + app + "\n</script>")
STYLE = "<style>\n" + css + "\n</style>"

for page in sorted(PAGES.glob("*.html")):
    html = page.read_text(encoding="utf-8")
    assert "<!--STYLE-->" in html and "<!--APP-->" in html, page.name
    html = html.replace("<!--STYLE-->", STYLE).replace("<!--APP-->", SCRIPTS)
    if "<!--PARTNER-DATA-->" in html:
        import json, html as h
        data = json.loads((OUT / "data/partners.json").read_text(encoding="utf-8"))
        payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
        html = html.replace("<!--PARTNER-DATA-->", '<script type="application/json" id="gr-partner-data">' + payload + '</script>')
        directory = (SRC / "partners.js").read_text(encoding="utf-8")
        html = html.replace("<!--DIRECTORY-->", '<script>\n' + directory + '\n</script>')
        preview = []
        for r in data['contacts'][:12]:
            name = h.escape(r.get('name_en') or r['name'])
            phone = ('<a class="pf-phone" href="tel:' + h.escape(r['phone']) + '">' + h.escape(r['phone']) + '</a>') if r['phone'] else '<p class="pf-no-phone">No public phone found.</p>'
            preview.append('<article class="pf-card"><h3>'+name+'</h3><p class="pf-parent">'+h.escape(r['type'])+' · '+h.escape(r['city'])+'</p><p class="pf-ask">'+h.escape(r['ask_en'])+'</p>'+phone+'<p class="pf-phone-state">Published number, not called</p><a href="'+h.escape(r['source'],quote=True)+'" target="_blank" rel="noopener noreferrer">['+str(r.get('source_ref',1))+'] Official source ↗</a></article>')
        html = html.replace('<!--PARTNER-FALLBACK-->', '\n'.join(preview))
    if "<!--WORKFLOW-DATA-->" in html:
        payload=json.dumps(json.loads((OUT/"data/funding-routes.json").read_text()),ensure_ascii=False).replace("</","<\\/")
        html=html.replace("<!--WORKFLOW-DATA-->",'<script type="application/json" id="gr-workflow-data">'+payload+'</script>')
    if "<!--OUTREACH-->" in html:
        html=html.replace("<!--OUTREACH-->",'<script>\n'+(SRC/"outreach.js").read_text()+'\n</script>')
    out = OUT / page.name
    out.write_text(html, encoding="utf-8")
    print(f"built {out.name}  ({len(html)//1024} KB)")
print("done")
