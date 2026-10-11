# GreenRoot 🌱

**Healing people, healing the planet** — addiction recovery through paid environmental work, funded by recycling, guided by an AI companion. Brought to **COP31** (Antalya & Istanbul, 9–20 November 2026).

- 🌐 Trilingual site: **English · فارسی · Türkçe** (full RTL support)
- 📣 COP31 campaign page with 5 asks for negotiators
- 🗺️ **10 Istanbul district crew pages** (Kadıköy, Beşiktaş, Şişli, Fatih, Bakırköy, Üsküdar, Beyoğlu, Sarıyer, Maltepe, Kartal)
- 🤖 "Raha" AI companion demo (craving SOS, mood check-in, career rewind — offline scripted demo)
- 📊 Open impact dashboard (demo cohort data)

## Live links

| Platform | URL |
|---|---|
| Cloudflare Pages (production) | https://greenroot-af0.pages.dev |
| Hugging Face Space (mirror) | https://sosa123456-greenroot.static.hf.space |
| GitHub (this repo) | https://github.com/Websites-by-AI/greenroot |

## Automation (push → live everywhere)

```
git push → GitHub Actions
             ├─► cloudflare-pages.yml  → wrangler pages deploy site → Cloudflare Pages
             └─► huggingface-sync.yml  → HfApi.upload_folder     → HF Space
```

Required repo secrets (Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `HF_TOKEN`

## Repository layout

```
site/          built static site (deployed as-is to Pages & HF Space)
  ├─ *.html        22 HTML pages (core site, Istanbul districts, partner finder, link hub and 404)
  ├─ kit/          trilingual pitch decks (EN/FA/TR .pptx) + one-pager PDF
  └─ screenshots/  real rendered screenshots of the site
src/           build sources (pages templates, i18n dictionaries, generators)
```

## Build locally

```bash
cd src && python3 build.py        # inlines CSS+JS+ i18n into self-contained HTML
python3 areas_gen.py              # regenerates the 10 Istanbul district pages
python3 build_deck.py             # regenerates pitch decks (needs python-pptx)
```

## ⚠️ Security note

Development tokens used for initial setup were exposed in chat and must be **rotated**: GitHub PATs, Cloudflare API token + R2 keys, Hugging Face token.

---
*Concept prototype. Demo figures. Nothing here is medical advice. In crisis: TR 112 · Yeşilay 115 · IR 09628 · DE 112.*


## Source-backed partner finder (11 October 2026)

Live: https://greenroot-af0.pages.dev/partners

- 100 Istanbul + 100 other Türkiye + 10 Iran / Tehran contact entries.
- 88 parent institutions, including 120 branches and 5 public/university units — NOT 210 independent organizations.
- 204 entries with a published phone (203 distinct phone strings); 6 explicitly missing. No calls, outreach, agreements or willingness assessment.
- 190 telephone entries matched directly fetched official pages; 14 rely on official-source search evidence. Source URLs and review limits appear on each card.
- Source-backed contacts are real public institutional information, not the other pages’ demo pilot figures. A source review is not a live-phone test, endorsement or clinical-licensing check.
- Search, regional / sector / type filters, Persian RTL, local-only saved leads and filtered CSV export. No automatic emails or phone calls.
- `site/kit/GreenRoot-Outreach-210.xlsx`: three regional tabs, first contacts, source list, editable outreach tracker, first messages (EN / FA / TR).
- `site/data/partners.json`: canonical contact data with provenance and proposed asks.
- `src/contacts-snapshot.json`: minimal institutional snapshots only — no branch-chair names.
- `src/build_contacts_dataset.py` → `src/export_contacts.py` → `src/build.py`: dataset, exports / translations and HTML pipeline. Run from a workspace laid out like greenroot; deployed site files are committed in site/.
- `src/test-partners.cjs`: Playwright UI/data tests (requires playwright and browser dependencies; `GR_TEST_BASE` selects the URL). 16 checks passed, including 20 templates × 3 languages and five viewport widths.
- Phone conflicts: Buğday / Toloo; legacy contact route: Tehran waste management. Email / reconfirm before calling.

No participant health data should be stored or sent. Clinical care must remain independent of work output. Eligibility, lawful wages, work permits, insurance and licensing require local professional review.
