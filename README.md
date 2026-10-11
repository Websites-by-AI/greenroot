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


## Idea-stage outreach desk / 11 October 2026

https://greenroot-af0.pages.dev/outreach?lang=fa

- Main bank stays 210 entries / 88 parents (100 Istanbul, 100 other Türkiye, 10 Tehran/Iran).
- WhatsApp review via 136 public pages: 12 institution-specific published links; 180 no link found; 14 not inspectable; 4 directory-provider channels not attributable to the institution. No account probes or messages. Municipal-service and support routes are not business-outreach consent.
- Every bank row now has a role-specific EN/FA/TR draft, a fit label (not reply probability), channel evidence and a next-step link.
- 13 separate university/incubator/funding routes with official sources, current/archived deadline distinctions and explicit idea-stage/company/degree/shareholding gates.
- 3 editable application dossiers; actual achievements, CVs, costs, qualifications and partners remain blanks where unknown.
- Local private desk: actual user-reported send → +2-calendar-day inbox/portal check; no reply → one later manual follow-up review; decline → stop; positive reply → prepare requested materials. Time alone never means admission, company registration or grant award.
- Raha sidebar/playbook plus rules-based coach; not an autonomous filing or inbox-reading agent.
- Real-email backend deployed as a dedicated SQLite Durable Object with persistent alarms, not account cron. Other account databases/triggers were untouched; no paid plan upgrade. Provider/sender NOT configured; real delivery remains untested. Setup guide is on the page and in kit/GreenRoot-Email-Setup-FA.md.
- Owner-only beta or verified sender domain + Turnstile + real privacy contact/notice; email verification, salted per-workspace authorization, encrypted stable unsubscribe tokens, minimal task sync, deletion and retention controls. No private notes, drafts, documents or health records are sent/committed.
- Current build: 21 source templates / 23 total HTML pages (including standalone link hub / 404). Existing decks, districts, booklet and podcast retained.
- QA: 16 directory checks + 17 workbench checks + 16 backend checks. Backend transport tests use LOCAL MOCKS: zero real emails. 21 templates × 3 languages and viewport widths 320/390/768/1360/1600 passed. Screenshots 24–28 are clean-context captures with no fictional sends/replies/registrations.

### Rebuild committed public data / HTML

Install Python openpyxl and python-docx; from this repo run:

```sh
python src/export_contacts.py
python src/prepare_workflow.py
python src/export_contacts.py
python src/build.py
```

In the deploy repository these scripts detect site/ as output; in the canonical workspace they write alongside src/. The minimal institutional snapshots and source audits live in src/. A fresh scrape is a deliberate source-review task, not proof a phone/account works. Review changed source scope before publishing.

### Backend deployment

backend/wrangler.toml and the new GitHub workflow deploy the dedicated Worker while retaining encrypted secrets. Do not put API keys in HTML, Git or chat. Sender activation remains an owner action. See backend/README.md for API/autonomy/security limits.
