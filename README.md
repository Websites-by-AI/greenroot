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
             └─► huggingface-sync.yml  → huggingface-cli upload     → HF Space
```

Required repo secrets (Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `HF_TOKEN`

## Repository layout

```
site/          built static site (deployed as-is to Pages & HF Space)
  ├─ *.html        18 pages (7 core + 10 area pages + areas index + START-HERE)
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
