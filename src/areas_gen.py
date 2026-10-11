#!/usr/bin/env python3
"""Generate 10 Istanbul-district landing pages (EN/FA/TR) + index + i18n layer."""
import pathlib

SRC = pathlib.Path(__file__).parent
PAGES = SRC / "pages"

DISTRICTS = [
  ("kadikoy",  "Kadıköy",  "کادی‌کوی", "Coastline, parks and market streets",        "ساحل، پارک‌ها و خیابان‌های بازار",   "Sahil, parklar ve çarşı sokakları"),
  ("besiktas", "Beşiktaş", "بشیکتاش",  "Bosphorus shore and park entrances",         "کرانهٔ بسفر و ورودی پارک‌ها",        "Boğaz kıyısı ve park girişleri"),
  ("sisli",    "Şişli",    "شیشلی",    "Boulevards, squares and metro exits",        "بلوارها، میدان‌ها و خروجی‌های مترو", "Bulvarlar, meydanlar ve metro çıkışları"),
  ("fatih",    "Fatih",    "فاتح",     "Historic streets and neighborhood parks",    "خیابان‌های تاریخی و پارک‌های محله",  "Tarihî sokaklar ve mahalle parkları"),
  ("bakirkoy", "Bakırköy", "باکرکوی",  "Seaside walkways and shopping streets",      "پیاده‌راه‌های ساحلی و خیابان‌های خرید","Deniz kenarı yolları ve çarşı sokakları"),
  ("uskudar",  "Üsküdar",  "اسکودار",  "Shoreline, hills and neighborhood squares",  "کرانه، تپه‌ها و میدان‌های محله",      "Kıyı, tepeler ve mahalle meydanları"),
  ("beyoglu",  "Beyoğlu",  "بی‌اوغلو", "Side streets off the main corridor",         "کوچه‌های اطراف محور اصلی",           "Ana aksın yan sokakları"),
  ("sariyer",  "Sarıyer",  "ساری‌یر",  "Bosphorus villages and forest edges",        "روستاهای بسفر و حاشیهٔ جنگل",        "Boğaz köyleri ve orman kenarları"),
  ("maltepe",  "Maltepe",  "مالتپه",   "Long coastline and event lawns",             "ساحل طولانی و چمن‌های رویداد",       "Uzun kıyı ve etkinlik çayırları"),
  ("kartal",   "Kartal",   "كارتال",   "Harbor shore and city squares",              "کرانهٔ بندر و میدان‌های شهر",         "Sahil ve kent meydanları"),
]

T = {
 "lead": {
  "en": "The GreenRoot crew for {n}: two supported cleanup shifts a week in {s} — paid roles for people in recovery, tokens for every shift, and therapy and medicine funded by the recycling income.",
  "fa": "تیم گرین‌روت در {n}: دو شیفت پاک‌سازیِ همراهی‌شده در هفته در {s} — نقش‌های حقوق‌دار برای افراد در بهبودی، توکن برای هر شیفت، و تأمین درمان و دارو از درآمد بازیافت.",
  "tr": "{n} GreenRoot ekibi: haftada iki destekli temizlik vardiyası — {s} bölgesinde. Toparlanmakta olanlar için ücretli roller, her vardiya için jeton; terapi ve ilaç, geri dönüşüm geliriyle finanse edilir."},
 "meet": {
  "en": "Meetup point: announced to registered crew members. Register on the Join page — it takes one minute.",
  "fa": "نقطهٔ قرار: به اعضای ثبت‌نام‌شده اعلام می‌شود. در صفحهٔ پیوستن ثبت‌نام کنید — یک دقیقه بیشتر وقت نمی‌گیرد.",
  "tr": "Buluşma noktası: kayıtlı ekip üyelerine duyurulur. Katıl sayfasından kaydolun — bir dakika sürer."},
 "sched": {
  "en": "Draft rhythm: one weekday morning shift + one weekend shift · equipment and safety gear provided · Raha logs your check-in.",
  "fa": "ریتم پیشنهادی: یک شیفت صبح در هفته + یک شیفت آخر هفته · تجهیزات و وسایل ایمنی ارائه می‌شود · رها چک-این را ثبت می‌کند.",
  "tr": "Önerilen ritim: hafta içi bir sabah vardiyası + hafta sonu bir vardiya · ekipman ve güvenlik malzemesi sağlanır · Raha check-in'i kaydeder."},
 "cop": {
  "en": "This crew carries {n}'s voice to COP31 (Antalya & Istanbul, 9–20 November 2026): clean streets, clean starts.",
  "fa": "این تیم، صدای {n} را به COP31 می‌رساند (آنتالیا و استانبول، ۹ تا ۲۰ نوامبر ۲۰۲۶): خیابان تمیز، آغازِ تمیز.",
  "tr": "Bu ekip, {n} sesini COP31'e taşır (Antalya ve İstanbul, 9–20 Kasım 2026): temiz sokaklar, temiz başlangıçlar."},
 "kicker": {"en": "Istanbul crew · {n}", "fa": "تیم استانبول · {n}", "tr": "İstanbul ekibi · {n}"},
 "h1": {"en": "GreenRoot {n}", "fa": "گرین‌روت {n}", "tr": "GreenRoot {n}"},
}

NAV_AREAS = {"en": "Istanbul areas", "fa": "مناطق استانبول", "tr": "İstanbul bölgeleri"}
IDX = {
 "kicker": {"en": "Ten districts, one city", "fa": "ده منطقه، یک شهر", "tr": "On bölge, tek şehir"},
 "h1": {"en": "GreenRoot Istanbul crews", "fa": "تیم‌های گرین‌روت استانبول", "tr": "GreenRoot İstanbul ekipleri"},
 "lead": {"en": "Ten neighborhood crews across Istanbul — European and Asian side. Each one: paid green roles for people in recovery, two supported shifts a week, therapy funded by recycling. Pick your district.",
          "fa": "ده تیم محله‌ای در سراسر استانبول — سمت اروپایی و آسیایی. هر تیم: نقش‌های سبزِ حقوق‌دار برای افراد در بهبودی، دو شیفت همراهی‌شده در هفته، درمانِ تأمین‌شده با بازیافت. منطقهٔ خودتان را انتخاب کنید.",
          "tr": "İstanbul genelinde on mahalle ekibi — Avrupa ve Anadolu yakası. Her biri: toparlanmakta olanlar için ücretli yeşil roller, haftada iki destekli vardiya, geri dönüşümle finanse edilen terapi. Bölgenizi seçin."},
 "note": {"en": "Meetup points are set with the first registered members of each crew — your vote counts. Istanbul emergency: 112 · Yeşilay: 115.",
          "fa": "نقاط قرار، با نخستین اعضای ثبت‌نام‌شدهٔ هر تیم تعیین می‌شود — رأی شما مؤثر است. اورژانس استانبول: ۱۱۲ · یشیل‌آی: ۱۱۵.",
          "tr": "Buluşma noktaları her ekibin ilk kayıtlı üyeleriyle belirlenir — oyunuz önemli. İstanbul acil: 112 · Yeşilay: 115."},
}

def fmt(tpl, n): return tpl.replace("{n}", n)

# ---------- 1) areas-i18n.js ----------
js = ['/* Auto-generated: Istanbul area pages i18n (EN/FA/TR) */', '(function(){ "use strict";', 'if(!window.I18N) window.I18N={};']
for L in ["en","fa","tr"]:
    d = [f'var A{L.replace("en","en").capitalize() if False else L.upper()}={{}}'] if False else []
lines = ['(function(){ "use strict";', 'if(!window.I18N) window.I18N={en:{},fa:{},tr:{}};']
for L in ["en","fa","tr"]:
    lines.append(f'Object.assign(window.I18N.{L}, {{')
    lines.append(f'  "nav.areas":{NAV_AREAS[L]!r},'.replace("'", '"') if False else f'  "nav.areas": "{NAV_AREAS[L]}",')
    for k in ["kicker","h1","lead","note"]:
        lines.append(f'  "ar.index.{k}": "{IDX[k][L]}",')
    for slug, name, fan, sen, sfa, str_ in DISTRICTS:
        n = fan if L == "fa" else name
        spot = {"en": sen, "fa": sfa, "tr": str_}[L]
        lead = fmt(T["lead"][L], n).replace("{s}", spot)
        cop  = fmt(T["cop"][L], n)
        lines.append(f'  "ar.{slug}.kicker": "{fmt(T["kicker"][L], n)}",')
        lines.append(f'  "ar.{slug}.h1": "{fmt(T["h1"][L], n)}",')
        lines.append(f'  "ar.{slug}.lead": "{lead}",')
        lines.append(f'  "ar.{slug}.meet": "{T["meet"][L]}",')
        lines.append(f'  "ar.{slug}.sched": "{T["sched"][L]}",')
        lines.append(f'  "ar.{slug}.cop": "{cop}",')
    lines.append('});')
lines.append('})();')
(SRC / "areas-i18n.js").write_text("\n".join(lines), encoding="utf-8")
print("areas-i18n.js written")

# ---------- 2) shared page template ----------
HEAD = '''<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='88'>%F0%9F%8C%B1</text></svg>">
<!--STYLE-->
</head>
<body data-page="area">

<header class="nav" id="nav">
  <div class="container nav-inner">
    <a class="brand" href="index.html">
      <svg class="logo" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="23" fill="#0B3B2A"/><path d="M24 38c0-9 2-14 9-19-1 8-3 13-9 19Z" fill="#A3E635"/><path d="M24 38c0-9-2-14-9-19 1 8 3 13 9 19Z" fill="#4ADE80"/><path d="M24 38V22" stroke="#D9F99D" stroke-width="2" stroke-linecap="round"/></svg>
      <span>GreenRoot</span>
    </a>
    <nav class="links" id="links">
      <a href="index.html" data-i18n="nav.home">Home</a>
      <a href="science.html" data-i18n="nav.science">Science</a>
      <a href="program.html" data-i18n="nav.program">Program</a>
      <a href="ai.html" data-i18n="nav.ai">AI companion</a>
      <a href="dashboard.html" data-i18n="nav.impact">Impact</a>
      <a href="cop31.html" data-i18n="nav.cop31">COP31</a>
      <a href="areas.html" data-i18n="nav.areas">Istanbul areas</a>
      <a href="partners.html" data-i18n="nav.partners">Partner finder</a>
      <a href="join.html" data-i18n="nav.join">Join</a>
    </nav>
    <div class="nav-actions">
      <div class="lang-sw"><button class="lang on" data-lang="en" type="button">EN</button><button class="lang" data-lang="fa" type="button">فا</button><button class="lang" data-lang="tr" type="button">TR</button></div>
      <a class="btn small" href="join.html" data-i18n="nav.cta">Join the pilot</a>
      <button class="burger" id="burger" aria-label="Menu" type="button"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

<main>
<section class="hero">
  <div class="container">
    <span class="kicker light" data-i18n="{P}.kicker">Istanbul crew</span>
    <h1 data-i18n="{P}.h1">GreenRoot</h1>
    <p class="lead" data-i18n="{P}.lead"></p>
  </div>
</section>

<section>
  <div class="container">
    <div class="grid g3">
      <div class="card rv"><div class="ic green">📍</div><h3 data-i18n="ar.meet.t">Meetup point</h3><p data-i18n="{P}.meet"></p><a href="join.html" data-i18n="ar.meet.b">Register now →</a></div>
      <div class="card rv"><div class="ic amber">🗓️</div><h3 data-i18n="ar.sched.t">Shift rhythm</h3><p data-i18n="{P}.sched"></p></div>
      <div class="card rv"><div class="ic teal">📣</div><h3 data-i18n="ar.cop.t">To COP31</h3><p data-i18n="{P}.cop"></p><a href="cop31.html" data-i18n="ar.cop.b">COP31 page →</a></div>
    </div>
  </div>
</section>

<section style="background:#EFF5EA">
  <div class="container">
    <div class="center rv">
      <span class="kicker" data-i18n="ar.other.k">Other districts</span>
      <h2 class="title" data-i18n="ar.other.t">Find your crew</h2>
    </div>
    <div class="grid g3 mt rv" style="font-size:15px;line-height:2">
      {OTHERS}
    </div>
  </div>
</section>
</main>

<footer>
  <div class="container">
    <div class="grid g3">
      <div>
        <div class="fbrand"><svg class="logo" viewBox="0 0 48 48" fill="none" width="34" height="34"><circle cx="24" cy="24" r="23" fill="#0E4D36"/><path d="M24 38c0-9 2-14 9-19-1 8-3 13-9 19Z" fill="#A3E635"/><path d="M24 38c0-9-2-14-9-19 1 8 3 13 9 19Z" fill="#4ADE80"/><path d="M24 38V22" stroke="#D9F99D" stroke-width="2" stroke-linecap="round"/></svg>GreenRoot</div>
        <p data-i18n="footer.tag">Healing people, healing the planet.</p>
      </div>
      <div>
        <h4 data-i18n="footer.links">Explore</h4>
        <p><a href="science.html" data-i18n="nav.science">Science</a> · <a href="program.html" data-i18n="nav.program">Program</a> · <a href="ai.html" data-i18n="nav.ai">AI companion</a></p>
        <p class="mt-s"><a href="dashboard.html" data-i18n="nav.impact">Impact</a> · <a href="cop31.html" data-i18n="nav.cop31">COP31</a> · <a href="areas.html" data-i18n="nav.areas">Istanbul areas</a>
      <a href="partners.html" data-i18n="nav.partners">Partner finder</a></p>
      </div>
      <div>
        <h4 data-i18n="footer.contact">Contact</h4>
        <p>hello@greenroot.example</p>
        <p data-i18n="footer.contact2">Frankfurt · Tehran · Istanbul (pilot cities)</p>
      </div>
    </div>
    <p class="disclaimer" data-i18n="footer.disclaimer">GreenRoot is a concept prototype. Nothing on this site is medical advice.</p>
    <p class="copy">© <span id="year">2026</span> GreenRoot.</p>
  </div>
</footer>

<!--APP-->
</body>
</html>
'''

extra_keys = '''Object.assign(window.I18N.en, {
  "ar.meet.t":"Meetup point","ar.meet.b":"Register now →",
  "ar.sched.t":"Shift rhythm","ar.cop.t":"To COP31","ar.cop.b":"COP31 page →",
  "ar.other.k":"Other districts","ar.other.t":"Find your crew",
  "ar.idx.cta":"Open crew page →"
});
Object.assign(window.I18N.fa, {
  "ar.meet.t":"نقطهٔ قرار","ar.meet.b":"همین حالا ثبت‌نام کنید ←",
  "ar.sched.t":"ریتم شیفت‌ها","ar.cop.t":"به سوی COP31","ar.cop.b":"صفحهٔ COP31 ←",
  "ar.other.k":"مناطق دیگر","ar.other.t":"تیم خودتان را پیدا کنید",
  "ar.idx.cta":"صفحهٔ تیم ←"
});
Object.assign(window.I18N.tr, {
  "ar.meet.t":"Buluşma noktası","ar.meet.b":"Hemen kaydol →",
  "ar.sched.t":"Vardiya ritmi","ar.cop.t":"COP31'e","ar.cop.b":"COP31 sayfası →",
  "ar.other.k":"Diğer bölgeler","ar.other.t":"Ekibinizi bulun",
  "ar.idx.cta":"Ekip sayfası →"
});'''

# ---------- 3) area pages ----------
slugs = [d[0] for d in DISTRICTS]
for slug, name, fan, sen, sfa, str_ in DISTRICTS:
    others = []
    for s2, n2, *_ in DISTRICTS:
        if s2 != slug:
            others.append(f'<a href="area-{s2}.html">📍 {n2}</a>')
    title_en = f"GreenRoot {name} — Istanbul crew"
    html = HEAD.replace("{TITLE}", title_en).replace("{P}", f"ar.{slug}").replace("{OTHERS}", " ".join(others))
    (PAGES / f"area-{slug}.html").write_text(html, encoding="utf-8")
print("10 area pages written")

# ---------- 4) areas index page ----------
cards = "\n".join(
  f'''<a class="card rv" href="area-{slug}.html" style="text-align:center"><div class="ic {'green' if i%3==0 else ('amber' if i%3==1 else 'teal')}">📍</div><h3>{name}</h3><p class="small muted">{fan}</p></a>'''
  for i, (slug, name, fan, *_rest) in enumerate(DISTRICTS))

INDEX = HEAD.replace("{TITLE}", "GreenRoot Istanbul crews — 10 districts").replace("{P}", "ar.index").replace("{OTHERS}", "")
INDEX = INDEX.replace('''    <span class="kicker light" data-i18n="ar.index.kicker">Ten districts, one city</span>
    <h1 data-i18n="ar.index.h1">GreenRoot Istanbul crews</h1>
    <p class="lead" data-i18n="ar.index.lead"></p>''',
'''    <span class="kicker light" data-i18n="ar.index.kicker">Ten districts, one city</span>
    <h1 data-i18n="ar.index.h1">GreenRoot Istanbul crews</h1>
    <p class="lead" data-i18n="ar.index.lead"></p>
    <div class="chips"><div class="chip"><span data-i18n="ar.index.note"></span></div></div>''')
INDEX = INDEX.replace('''      <div class="card rv"><div class="ic green">📍</div><h3 data-i18n="ar.meet.t">Meetup point</h3><p data-i18n="ar.index.meet"></p><a href="join.html" data-i18n="ar.meet.b">Register now →</a></div>
      <div class="card rv"><div class="ic amber">🗓️</div><h3 data-i18n="ar.sched.t">Shift rhythm</h3><p data-i18n="ar.index.sched"></p></div>
      <div class="card rv"><div class="ic teal">📣</div><h3 data-i18n="ar.cop.t">To COP31</h3><p data-i18n="ar.index.cop"></p><a href="cop31.html" data-i18n="ar.cop.b">COP31 page →</a></div>''',
f'''      <div class="grid g4 rv">{cards}
      </div>''')
# fix: index uses g3 grid wrapper around the cards grid -> replace outer too
INDEX = INDEX.replace('''    <div class="grid g3">
      <div class="grid g4 rv">''', '''    <div>
      <div class="grid g4 rv">''')
(PAGES / "areas.html").write_text(INDEX, encoding="utf-8")
print("areas.html written")

# ---------- 5) append extra keys to areas-i18n.js ----------
with open(SRC / "areas-i18n.js", "a", encoding="utf-8") as f:
    f.write("\n" + extra_keys + "\n")
print("extra keys appended")
