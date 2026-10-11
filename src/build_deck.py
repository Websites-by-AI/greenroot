#!/usr/bin/env python3
"""GreenRoot trilingual pitch decks (EN/FA/TR) — python-pptx."""
import pathlib
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

OUT = pathlib.Path("/home/user/greenroot/kit")
OUT.mkdir(parents=True, exist_ok=True)

# palette
DEEP   = RGBColor(0x0B, 0x3B, 0x2A)
GREEN  = RGBColor(0x16, 0xA3, 0x4A)
LIME   = RGBColor(0xA3, 0xE6, 0x35)
INK    = RGBColor(0x0C, 0x23, 0x18)
MUTED  = RGBColor(0x54, 0x68, 0x5C)
LINE   = RGBColor(0xE2, 0xE9, 0xDD)
BG     = RGBColor(0xF6, 0xF8, 0xF3)
AMBER  = RGBColor(0xF5, 0x9E, 0x0B)
TEAL   = RGBColor(0x0D, 0x94, 0x88)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
CREAM  = RGBColor(0xD9, 0xF9, 0x9D)

W, H = 13.333, 7.5

def C(hexs): return RGBColor(*[int(hexs[i:i+2],16) for i in (0,2,4)])

# ---------------- content ----------------
DECKS = {}

DECKS["en"] = dict(
  font="Calibri", rtl=False,
  slides=[
    dict(k="ADDICTION RECOVERY × GREEN WORK × AI", t="GreenRoot",
         s="Healing people, healing the planet — recovery through environmental work, funded by recycling, guided by AI.",
         f="COP31 · Antalya & Istanbul · 9–20 November 2026"),
    dict(k="THE PROBLEM", t="Three crises, one root",
         cards=[("Addiction thrives in emptiness","Most relapses happen in long, unstructured hours alone — no structure, no purpose, no people."),
                ("The job trap","CV gaps close the employer's door; joblessness pushes people back to use. Closed from both sides."),
                ("Cities drowning in waste","Parks and riverbanks litter faster than cities clean; recyclables worth millions are lost every year.")],
         note="Addiction, unemployment and waste feed each other. GreenRoot attacks all three at once."),
    dict(k="THE SOLUTION", t="One program, three engines",
         cards=[("1 · Evidence-based recovery","Contingency management (token economy), behavioral activation and therapeutic community — built into every workday."),
                ("2 · Paid green work","Real wages for cleanup crews, sorting lines and upcycling. Recycling income funds therapy and medicine."),
                ("3 · AI career rewind","Raha, our AI companion, coaches cravings, tracks mood and maps skills back to the job each person had before.")],
         note="Each engine makes the other two stronger."),
    dict(k="HOW IT WORKS", t="The GreenRoot Loop",
         loop=[("Collect","Outdoor cleanup shifts: structure, exercise, nature."),
               ("Earn","Wages + tokens — immediate, earned reward."),
               ("Heal","Recycling income funds therapy and medicine."),
               ("Return","AI career rewind leads back to the old profession.")],
         note="Recovery and environment compound like interest."),
    dict(k="THE SCIENCE", t="Built on addiction science",
         bullets=["Contingency management — strong randomized-trial evidence; raises abstinence and treatment retention.",
                  "Supported employment — meaningful work improves outcomes, self-esteem and quality of life.",
                  "Behavioral activation — structured, value-driven activity reduces substance use.",
                  "Green care — nature lowers stress hormones; exercise is linked to reduced craving.",
                  "Therapeutic community — peer roles rebuild identity: from 'patient' to environmental worker."],
         note="Design informed by established literature; pilot figures in this deck are illustrative."),
    dict(k="STREET → WARD", t="Waste in, medicine out",
         cards=[("Recycling revenue funds treatment","Sold PET, metal, paper and glass pay for therapy sessions, psychiatric care and essential medicines."),
                ("Materials become medical supplies","With certified partners, collected plastics are cleaned, shredded and remanufactured into face shields, splint parts and clinical packaging."),
                ("Open budget","Crew revenue → 40% wages · 30% treatment fund · 30% operations. Published monthly.")],
         stats=[("€41k","to therapy & medicine*"),("3,200","medical items produced*"),("26 t","CO₂e saved*")]),
    dict(k="TECHNOLOGY", t="Meet Raha — the AI companion",
         bullets=["Craving SOS — urge-surfing coach, breathing, 24/7.",
                  "Mood & relapse watch — daily check-ins, risk alerts to counselors (opt-in only).",
                  "Token wallet & goals — small wins wired into the habit loop.",
                  "Career rewind — skills map, résumé rebuild, interview practice back to the previous job.",
                  "Private by design — encrypted, participant-owned; crisis routes to humans, never to police."],
         note="AI assists; licensed humans make clinical decisions."),
    dict(k="IMPACT", t="Impact you can weigh",
         stats=[("120+","people in recovery"),("18.4 t","waste collected & sorted"),("63% vs 60%","6-month relapse: GR vs typical*"),("87%","program completion*")],
         note="*Demo cohort figures for the concept. An open dashboard publishes monthly numbers for every cohort."),
    dict(k="ROADMAP", t="Twelve months, four phases",
         loop=[("Stabilize · wk 0–4","Medical assessment, MAT where indicated, safety plan, meet Raha."),
               ("Work & heal · wk 2–12","3 supported shifts/week, group therapy, tokens."),
               ("Build · mo 3–6","Sorting line & upcycling skills; career-rewind plan drafted."),
               ("Return · mo 6–12","CV rebuild, mock interviews, placement, alumni network.")],
         note="Pilot cities: Frankfurt · Tehran · Istanbul."),
    dict(k="BUSINESS MODEL", t="The circular economy of recovery",
         cards=[("Revenue","Sale of recyclables; upcycled medical products; municipal cleanup service contracts; ESG partnerships."),
                ("Costs","40% participant wages · 30% treatment fund · 30% operations & growth."),
                ("Unit dignity","Wages at or above local minimum. No quotas used against participants — ever.")],
         note="Dual return: environmental (tons diverted) and public-health (remission, employment)."),
    dict(k="AT COP31", t="Our five asks",
         numbered=["Recognize recovery-through-work as climate finance: fund therapeutic green employment.",
                   "Include waste-picker and recovery communities in national just-transition plans.",
                   "Back city pilots — Istanbul, Frankfurt, Tehran — with open impact dashboards.",
                   "Set data rights for AI recovery tools: opt-in, participant-owned, never policing tools.",
                   "Count health outcomes next to CO₂ — a person in remission is a climate result too."],
         note="Antalya 9–20 Nov 2026 · civil-society & Peoples' Climate Summit"),
    dict(k="THE ASK", t="Be the crew that cleans two crises at once",
         cards=[("City partners","Host a pilot cohort: Frankfurt, Tehran or Istanbul — with an open dashboard."),
                ("Operators & clinics","Waste streams, sorting sites, clinical supervision and placement partners."),
                ("Seed funding","€350k for the first 12-month cohort: equipment, micro-factory line, clinical team.")],
         note="hello@greenroot.example · greenroot — healing people, healing the planet."),
  ])

DECKS["fa"] = dict(
  font="Tahoma", rtl=True,
  slides=[
    dict(k="بهبودی از اعتیاد × کار سبز × هوش مصنوعی", t="گرین‌روت",
         s="انسان‌ها را شفا بده، سیاره را شفا بده — بهبودی از راه کار محیط‌زیستی، تأمین‌شده با بازیافت، هدایت‌شده با هوش مصنوعی.",
         f="COP31 · آنتالیا و استانبول · ۹ تا ۲۰ نوامبر ۲۰۲۶"),
    dict(k="مسئله", t="سه بحران، یک ریشه",
         cards=[("اعتیاد در خلأ رشد می‌کند","بیشتر لغزش‌ها در ساعات طولانیِ بی‌ساختار و در تنهایی رخ می‌دهند — بدون نظم، هدف و آدم‌ها."),
                ("تلهٔ شغل","جای خالی رزومه، درِ کارفرما را می‌بندد؛ بیکاری فرد را به مصرف برمی‌گرداند. در از هر دو سو بسته است."),
                ("شهرها در زباله غرق می‌شوند","پارک‌ها و حاشیهٔ رودها سریع‌تر از توان شهرداری آلوده می‌شوند؛ سالانه مواد بازیافتی به‌ارزش میلیون‌ها از دست می‌رود.")],
         note="اعتیاد، بیکاری و زباله به هم غذا می‌دهند. گرین‌روت هر سه را هم‌زمان هدف می‌گیرد."),
    dict(k,"راه‌حل".replace("راه‌حل","راه‌حل"), t="یک برنامه، سه موتور") if False else dict(k="راه‌حل", t="یک برنامه، سه موتور",
         cards=[("۱ · بهبودی مبتنی بر شواهد","مدیریت پیامد (اقتصاد توکنی)، فعال‌سازی رفتاری و جامعهٔ درمانی — درون هر روزِ کاری."),
                ("۲ · کار سبز حقوق‌دار","دستمزد واقعی برای تیم‌های پاک‌سازی، خط جداسازی و بازیافت خلاق. درآمد بازیافت، درمان و دارو را تأمین می‌کند."),
                ("۳ · بازگشت شغلی با هوش مصنوعی","رها، همیار هوش مصنوعی، برای هوس‌ها مربیگری می‌کند، خلق را رصد می‌کند و مهارت‌ها را به شغلِ قبلی وصل می‌کند.")],
         note="هر موتور، دو موتور دیگر را قوی‌تر می‌کند."),
    dict(k="چگونه کار می‌کند", t="چرخهٔ گرین‌روت",
         loop=[("جمع‌آوری","شیفت‌های پاک‌سازی در فضای باز: نظم، ورزش، طبیعت."),
               ("درآمد","دستمزد + توکن — پاداشِ فوری و اوده‌شده."),
               ("درمان","درآمد بازیافت، درمان و دارو را تأمین می‌کند."),
               ("بازگشت","بازگشت شغلی با هوش مصنوعی، به حرفهٔ قبلی.")],
         note="بهبودی و محیط‌زیست مثل بهرهٔ مرکب رشد می‌کنند."),
    dict(k="علم", t="بر پایهٔ علم اعتیاد",
         bullets=["مدیریت پیامد — شواهد قوی کارآزمایی‌های تصادفی؛ افزایش پرهیز از مصرف و ماندگاری در درمان.",
                  "اشتغال حمایتی — کارِ معنادار، نتایج درمان، عزت‌نفس و کیفیت زندگی را بهتر می‌کند.",
                  "فعال‌سازی رفتاری — فعالیت ساخت‌یافته و ارزش‌محور، مصرف را کاهش می‌دهد.",
                  "مراقبت سبز — طبیعت هورمون‌های استرس را کم می‌کند؛ ورزش با کاهش هوس پیوند دارد.",
                  "جامعهٔ درمانی — نقش‌های همتا، هویت را بازمی‌سازند: از «بیمار» به کارگر محیط‌زیست."],
         note="طراحی بر پایهٔ ادبیات علمیِ تثبیت‌شده؛ ارقام این دِک نمایشی است."),
    dict(k="از خیابان تا بیمارستان", t="زباله داخل، دارو خارج",
         cards=[("درآمد بازیافت، هزینهٔ درمان","فروش پت، فلز، کاغذ و شیشه، جلسات درمان، مراقبت روان‌پزشکی و داروهای ضروری را تأمین می‌کند."),
                ("مواد، تجهیزات پزشکی می‌شوند","با شرکای معتبر، پلاستیک‌ها شسته، خرد و به شیلد صورت، قطعات اسپلینت و بسته‌بندی کلینیکال تبدیل می‌شوند."),
                ("بودجهٔ باز","درآمد تیم ← ۴۰٪ دستمزد · ۳۰٪ صندوق درمان · ۳۰٪ عملیات. انتشار ماهانه.")],
         stats=[("€۴۱هزار","برای درمان و دارو*"),("۳٬۲۰۰","قلم تجهیزات پزشکی*"),("۲۶ تن","CO₂e صرفه‌جویی*")]),
    dict(k="فناوری", t="با رها آشنا شوید — همیار هوش مصنوعی",
         bullets=["SOS هوس — مربی موج‌سواریِ هوس، تنفس، شبانه‌روزی.",
                  "رصد خلق و لغزش — چک-این روزانه، هشدار خطر به مشاور (فقط با رضایت).",
                  "کیف توکن و اهداف — برد کوچک، قلاب‌شده در حلقهٔ عادت.",
                  "بازگشت شغلی — نقشهٔ مهارت، بازسازی رزومه، تمرین مصاحبه تا شغل قبلی.",
                  "خصوصی از پایه — رمزنگاری‌شده، متعلق به خودِ فرد؛ بحران به انسان می‌رسد، نه پلیس."],
         note="هوش مصنوعی کمک می‌کند؛ تصمیم بالینی با انسان‌های مجاز است."),
    dict(k="اثرگذاری", t="اثری که می‌شود وزنش کرد",
         stats=[("+۱۲۰","فرد در بهبودی"),("۱۸.۴ تن","زباله جمع‌آوری‌شده"),("۶۳٪ در برابر ۶۰٪","لغزش ۶ماهه: گرین‌روت/معمول*"),("۸۷٪","تکمیل برنامه*")],
         note="*ارقام نمایشی برای معرفی مفهوم. داشبورد باز، عددهای هر گروه را ماهانه منتشر می‌کند."),
    dict(k="نقشهٔ راه", t="دوازده ماه، چهار فاز",
         loop=[("تثبیت · هفته ۰–۴","ارزیابی پزشکی، دارو در صورت لزوم، برنامهٔ ایمنی، آشنایی با رها."),
               ("کار و شفا · هفته ۲–۱۲","هفته‌ای ۳ شیفت همراهی‌شده، گروه‌درمانی، توکن."),
               ("ساختن · ماه ۳–۶","مهارت‌های جداسازی و بازیافت خلاق؛ نوشتن طرح بازگشت شغلی."),
               ("بازگشت · ماه ۶–۱۲","رزومه، مصاحبهٔ تمرینی، استخدام، شبکهٔ فارغ‌التحصیلان.")],
         note="شهرهای پایلوت: فرانکفورت · تهران · استانبول."),
    dict(k="مدل کسب‌وکار", t="اقتصاد چرخه‌ایِ بهبودی",
         cards=[("درآمد","فروش مواد بازیافتی؛ محصولات پزشکیِ بازیافت خلاق؛ قراردادهای خدمات پاک‌سازی شهری؛ شراکت‌های ESG."),
                ("هزینه","۴۰٪ دستمزد اعضا · ۳۰٪ صندوق درمان · ۳۰٪ عملیات و رشد."),
                ("عزت واحد","دستمزد در حد یا بالای حداقل محلی. هیچ سهمیه‌ای علیه اعضا استفاده نمی‌شود — هرگز.")],
         note="بازده دوگانه: محیط‌زیستی (تن‌های بازیافت‌شده) و سلامت عمومی (بهبودی، اشتغال)."),
    dict(k="در COP31", t="پنج خواستهٔ ما",
         numbered=["بهبودی از راه کار به‌عنوان تأمین مالی اقلیمی به رسمیت شناخته شود: کارِ سبزِ درمانی تأمین مالی شود.",
                   "جامعهٔ زباله‌چین‌ها و افراد در بهبودی در برنامه‌های گذار عادلانهٔ ملی دیده شوند.",
                   "از پایلوت‌های شهری — استانبول، فرانکفورت، تهران — با داشبورد باز پشتیبانی شود.",
                   "حقوق داده برای ابزارهای هوش مصنوعی بهبودی تعیین شود: اختیاری، متعلق به فرد، هرگز ابزار پلیس‌گری نه.",
                   "پیامدهای سلامت را کنار CO₂ بشمارید — انسانِ در بهبودی هم نتیجهٔ اقلیمی است."],
         note="آنتالیا، ۹ تا ۲۰ نوامبر ۲۰۲۶ · جامعهٔ مدنی و قلهٔ اقلیم مردم‌ها"),
    dict(k="درخواست ما", t="همان تیمی باش که دو بحران را با هم تمیز می‌کند",
         cards=[("شهرهای شریک","میزبانی یک گروه پایلوت: فرانکفورت، تهران یا استانبول — با داشبورد باز."),
                ("بهره‌برداران و کلینیک‌ها","جریان پسماند، سایت جداسازی، نظارت بالینی و کارفرمایانِ پذیرش."),
                ("سرمایهٔ اولیه","€۳۵۰هزار برای نخستین گروه ۱۲ماهه: تجهیزات، خط ریز-کارخانه، تیم بالینی.")],
         note="hello@greenroot.example · گرین‌روت — انسان‌ها را شفا بده، سیاره را شفا بده."),
  ])

DECKS["tr"] = dict(
  font="Calibri", rtl=False,
  slides=[
    dict(k="BAĞIMLILIKTAN TOPARLANMA × YEŞİL İŞ × YAPAY ZEKÂ", t="GreenRoot",
         s="İnsanları iyileştir, gezegeni iyileştir — çevre işiyle toparlanma; geri dönüşümle finanse edilen tedavi, yapay zekâ desteğiyle dönüş.",
         f="COP31 · Antalya & İstanbul · 9–20 Kasım 2026"),
    dict(k="SORUN", t="Üç kriz, tek kök",
         cards=[("Bağımlılık boşlukta büyür","Nükslerin çoğu uzun ve yapılandırılmamış saatlerde, yalnızken yaşanır — yapı yok, amaç yok, insan yok."),
                ("İş tuzağı","Özgeçmişteki boşluk işveren kapısını kapatır; işsizlik yeniden kullanıma iter. Kapı iki taraftan kapalı."),
                ("Şehirler çöpe gömülüyor","Parklar ve nehir kenarları belediyeden hızlı kirleniyor; her yıl milyonlarca değerinde geri dönüşüm malzemesi kayboluyor.")],
         note="Bağımlılık, işsizlik ve atık birbirini besler. GreenRoot üçüne birden vurur."),
    dict(k="ÇÖZÜM", t="Tek program, üç motor",
         cards=[("1 · Kanıta dayalı toparlanma","Sonuç yönetimi (jeton ekonomisi), davranışsal aktivasyon ve terapötik topluluk — her iş gününe işlenmiş."),
                ("2 · Ücretli yeşil iş","Temizlik ekipleri, ayrıştırma hatları ve geri dönüşüm atölyeleri için gerçek ücret. Geri dönüşüm geliri tedaviyi ve ilacı finanse eder."),
                ("3 · YZ ile kariyer dönüşü","YZ dostumuz Raha krizde koçluk yapar, ruh halini izler ve becerileri kişinin eski mesleğine geri bağlar.")],
         note="Her motor diğer ikisini güçlendirir."),
    dict(k="NASIL ÇALIŞIR", t="GreenRoot Döngüsü",
         loop=[("Topla","Açık havada temizlik vardiyası: yapı, egzersiz, doğa."),
               ("Kazan","Ücret + jeton — anında, kazanılmış ödül."),
               ("İyileş","Geri dönüşüm geliri terapiyi ve ilacı finanse eder."),
               ("Dön","YZ kariyer dönüşü eski mesleğe taşır.")],
         note="Toparlanma ve çevre, bileşik faiz gibi büyür."),
    dict(k="BİLİM", t="Bağımlılık bilimi üzerine kurulu",
         bullets=["Sonuç yönetimi — güçlü randomize çalışma kanıtı; kesinleşmeyi ve tedavide kalmayı artırır.",
                  "Destekli istihdam — anlamlı iş; sonuçları, benlik saygısını ve yaşam kalitesini iyileştirir.",
                  "Davranışsal aktivasyon — yapılandırılmış, değer güdümlü etkinlik kullanımı azaltır.",
                  "Yeşil bakım — doğa stres hormonlarını düşürür; egzersiz azalan krizle ilişkilidir.",
                  "Terapötik topluluk — akran rolleri kimliği kurar: 'hasta'dan çevre işçisine."],
         note="Tasarım yerleşik literatürle bilgilendirilmiştir; döküdeki rakamlar temsilidir."),
    dict(k="SOKAK → SERVİS", t="Atık girer, ilaç çıkar",
         cards=[("Geri dönüşüm geliri tedaviyi finanse eder","Satılan PET, metal, kâğıt ve cam; terapi seanslarını, psikiyatrik bakımı ve temel ilaçları öder."),
                ("Malzeme tıbbi sarfa dönüşür","Sertifikalı ortaklarla plastikler yıkanır, parçalanır; yüz siperi, atel parçası ve klinik ambalaja dönüşür."),
                ("Açık bütçe","Ekip geliri → %40 ücret · %30 tedavi fonu · %30 operasyon. Aylık yayımlanır.")],
         stats=[("€41 bin","terapi ve ilaca*"),("3.200","üretilen tıbbi ürün*"),("26 t","tasarruf edilen CO₂e*")]),
    dict(k="TEKNOLOJİ", t="Raha ile tanış — YZ dostu",
         bullets=["Kriz SOS — dürtü sörfü koçu, nefes egzersizi, 7/24.",
                  "Ruh hali ve nüks gözcüsü — günlük check-in; danışmana risk uyarısı (yalnızca isteğe bağlı).",
                  "Jeton cüzdanı ve hedefler — alışkanlık döngüsüne bağlanmış küçük zaferler.",
                  "Kariyer dönüşü — beceri haritası, özgeçmiş, eski işe dönüş için mülakat pratiği.",
                  "Tasarım gereği özel — şifreli, katılımcıya ait; kriz polise değil, insana gider."],
         note="YZ destekler; klinik kararı yetkili insanlar verir."),
    dict(k="ETKİ", t="Tartılabilir etki",
         stats=[("120+","toparlanmada kişi"),("18,4 t","toplanan & ayrıştırılan atık"),("%63 vs %60","6 aylık nüks: GR/tipik*"),("%87","program tamamlama*")],
         note="*Kavram için temsili kohort verisi. Açık pano her kohortun aylık sayılarını yayımlar."),
    dict(k="YOL HARİTASI", t="On iki ay, dört evre",
         loop=[("Sağlamlaş · 0–4. hf","Tıbbi değerlendirme, gerekirse ilaçla tedavi, güvenlik planı, Raha ile tanışma."),
               ("Çalış & iyileş · 2–12. hf","Haftada 3 destekli vardiya, grup terapisi, jeton."),
               ("İnşa et · 3–6. ay","Ayrıştırma ve geri dönüşüm becerileri; kariyer dönüşü planı."),
               ("Dön · 6–12. ay","Özgeçmiş, deneme mülakatı, yerleştirme, mezunlar ağı.")],
         note="Pilot şehirler: Frankfurt · Tahran · İstanbul."),
    dict(k="İŞ MODELİ", t="Toparlanmanın döngüsel ekonomisi",
         cards=[("Gelir","Geri dönüşüm malzemesi satışı; dönüştürülmüş tıbbi ürünler; belediye temizlik hizmet sözleşmeleri; ESG ortaklıkları."),
                ("Maliyet","%40 katılımcı ücreti · %30 tedavi fonu · %30 operasyon ve büyüme."),
                ("Birim onuru","Ücret yerel asgarinin düzeyinde veya üzerinde. Kota asla katılımcıya karşı kullanılmaz.")],
         note="Çifte getiri: çevresel (diverte edilen tonlar) ve toplum sağlığı (remisyon, istihdam)."),
    dict(k="COP31'DE", t="Beş talebimiz",
         numbered=["İşle toparlanma iklim finansmanı olarak tanınsın: terapötik yeşil istihdam fonlansın.",
                   "Çöp toplayıcı ve toparlanma toplulukları ulusal adil geçiş planlarına alınsın.",
                   "Şehir pilotları desteklensin — İstanbul, Frankfurt, Tahran — açık etki panolarıyla.",
                   "YZ destekli toparlanma araçlarına veri hakları gelsin: isteğe bağlı, katılımcıya ait, asla kolluk aracı değil.",
                   "Sağlık sonuçlarını CO₂'nin yanına koyun — remisyondaki insan da iklim sonucudur."],
         note="Antalya 9–20 Kasım 2026 · sivil toplum & Halkların İklim Zirvesi"),
    dict(k="ÇAĞRI", t="İki krizi birden temizleyen ekiple gel",
         cards=[("Şehir ortakları","Açık panoyla bir pilot kohorta ev sahipliği: Frankfurt, Tahran veya İstanbul."),
                ("İşletmeciler & klinikler","Atık akışları, ayrıştırma alanları, klinik gözetim ve istihdam ortakları."),
                ("Tohum yatırım","İlk 12 aylık kohort için €350 bin: ekipman, mikro-fabrika hattı, klinik ekip.")],
         note="hello@greenroot.example · GreenRoot — insanları iyileştir, gezegeni iyileştir."),
  ])

# ---------------- builder ----------------
def set_font(run, size, bold=False, color=INK, font="Calibri"):
    run.font.size = Pt(size); run.font.bold = bold; run.font.color.rgb = color; run.font.name = font
    # ensure complex-script (Arabic/Persian) font matches
    rPr = run._r.get_or_add_rPr()
    cs = rPr.find(qn('a:cs'))
    if cs is None:
        cs = rPr.makeelement(qn('a:cs'), {}); rPr.append(cs)
    cs.set('typeface', font)

def add_rect(slide, x, y, w, h, fill, line=None, round_=False, radius=0.08):
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if round_ else MSO_SHAPE.RECTANGLE,
                                 Inches(x), Inches(y), Inches(w), Inches(h))
    shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line: shp.line.color.rgb = line; shp.line.width = Pt(1)
    else: shp.line.fill.background()
    shp.shadow.inherit = False
    if round_:
        try: shp.adjustments[0] = radius
        except Exception: pass
    return shp

def add_text(slide, x, y, w, h, runs_lines, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
             font="Calibri", space_after=6, line_spacing=1.0):
    """runs_lines: list of paragraphs; each paragraph = list of (text,size,bold,color)"""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    for i, para in enumerate(runs_lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space_after); p.line_spacing = line_spacing
        for (txt, size, bold, color) in para:
            r = p.add_run(); r.text = txt; set_font(r, size, bold, color, font)
    return tb

def build_deck(lang, spec, path):
    rtl = spec["rtl"]; F = spec["font"]
    prs = Presentation(); prs.slide_width = Inches(W); prs.slide_height = Inches(H)
    blank = prs.slide_layouts[6]
    def X(x, w):  # mirror helper
        return (W - x - w) if rtl else x
    AL = PP_ALIGN.RIGHT if rtl else PP_ALIGN.LEFT

    for idx, sl in enumerate(spec["slides"], 1):
        s = prs.slides.add_slide(blank)
        add_rect(s, 0, 0, W, H, BG)
        add_rect(s, 0, 0, 0.16, H, GREEN)          # accent bar
        # kicker + title
        add_text(s, X(0.62, 12.1), 0.42, 12.1, 0.42, [[(sl["k"], 12.5, True, GREEN)]], align=AL, font=F)
        add_text(s, X(0.6, 12.1), 0.78, 12.1, 1.0, [[(sl["t"], 30, True, DEEP)]], align=AL, font=F)
        # footer
        add_text(s, X(0.62, 9.6), 7.08, 9.6, 0.32,
                 [[("GreenRoot", 10, True, GREEN), ("  ·  COP31 · Antalya & İstanbul · Nov 2026", 10, False, MUTED)]],
                 align=AL, font=F)
        add_text(s, X(12.35, 0.55), 7.08, 0.55, 0.32, [[(f"{idx:02d}", 10, True, MUTED)]],
                 align=PP_ALIGN.RIGHT if not rtl else PP_ALIGN.LEFT, font=F)

        y = 2.0
        if "s" in sl:  # title slide subtitle
            add_text(s, X(0.62, 11.5), 2.35, 11.5, 1.4, [[(sl["s"], 17, False, MUTED)]], align=AL, font=F, line_spacing=1.25)
            # hero chips
            chips = [("120+", "recovery"), ("18.4 t", "waste"), ("63%", "less relapse*")] if lang=="en" else \
                    (["+120|فرد در بهبودی","18.4 t|زباله","63%|لغزش کمتر*"] if lang=="fa" else ["120+|toparlanma","18,4 t|atık","%63|daha az nüks*"])
            cx = 0.62
            for ch in chips:
                a, b = (ch.split("|") if "|" in ch else (ch[0], ch[1]))
                cwid = 2.6
                add_rect(s, X(cx, cwid), 4.3, cwid, 1.05, WHITE, LINE, round_=True)
                add_text(s, X(cx+0.15, cwid-0.3), 4.42, cwid-0.3, 0.45, [[(a, 16, True, GREEN)]], align=AL, font=F)
                add_text(s, X(cx+0.15, cwid-0.3), 4.88, cwid-0.3, 0.35, [[(b, 10.5, False, MUTED)]], align=AL, font=F)
                cx += cwid + 0.25
            add_text(s, X(0.62, 11.5), 5.85, 11.5, 0.5, [[(sl["f"], 12, True, DEEP)]], align=AL, font=F)
            continue

        if "cards" in sl:
            n = len(sl["cards"]); gap = 0.28
            cwid = (12.11 - gap*(n-1)) / n
            for i, (h, b) in enumerate(sl["cards"]):
                x = 0.62 + i*(cwid+gap)
                if rtl: x = 0.62 + (n-1-i)*(cwid+gap)
                add_rect(s, X(x, cwid), y, cwid, 3.4, WHITE, LINE, round_=True)
                add_rect(s, X(x, cwid), y, cwid, 0.12, GREEN if i%3==0 else (AMBER if i%3==1 else TEAL), round_=False)
                add_text(s, X(x+0.22, cwid-0.44), y+0.3, cwid-0.44, 0.8, [[(h, 14.5, True, DEEP)]], align=AL, font=F, line_spacing=1.05)
                add_text(s, X(x+0.22, cwid-0.44), y+1.15, cwid-0.44, 2.1, [[(b, 11.5, False, MUTED)]], align=AL, font=F, line_spacing=1.22)
            y += 3.65

        if "loop" in sl:
            n = len(sl["loop"]); gap = 0.3
            cwid = (12.11 - gap*(n-1)) / n
            colors = [GREEN, AMBER, TEAL, GREEN]
            for i, (h, b) in enumerate(sl["loop"]):
                x = 0.62 + i*(cwid+gap)
                if rtl: x = 0.62 + (n-1-i)*(cwid+gap)
                add_rect(s, X(x, cwid), y, cwid, 3.15, WHITE, LINE, round_=True)
                # number circle
                circ = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(X(x, cwid)+Inches(0.22).inches), Inches(y+0.25), Inches(0.6), Inches(0.6)) if False else None
                circ = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(X(x+0.22, 0.6)), Inches(y+0.25), Inches(0.6), Inches(0.6))
                circ.fill.solid(); circ.fill.fore_color.rgb = colors[i%4]; circ.line.fill.background(); circ.shadow.inherit=False
                etf = circ.text_frame; etf.word_wrap=False
                ep = etf.paragraphs[0]; ep.alignment = PP_ALIGN.CENTER
                er = ep.add_run(); er.text = str(i+1); set_font(er, 18, True, WHITE, F)
                add_text(s, X(x+0.22, cwid-0.44), y+1.0, cwid-0.44, 0.55, [[(h, 14, True, DEEP)]], align=AL, font=F)
                add_text(s, X(x+0.22, cwid-0.44), y+1.55, cwid-0.44, 1.5, [[(b, 11, False, MUTED)]], align=AL, font=F, line_spacing=1.2)
            y += 3.4

        if "bullets" in sl or "numbered" in sl:
            items = sl.get("bullets") or sl.get("numbered")
            paras = []
            for j, it in enumerate(items):
                mark = "•  " if "bullets" in sl else f"{j+1}.  "
                paras.append([(mark, 14, True, GREEN), (it, 14, False, INK)])
            add_rect(s, X(0.62, 12.11), y, 12.11, 3.4, WHITE, LINE, round_=True)
            add_text(s, X(0.95, 11.45), y+0.3, 11.45, 2.9, paras, align=AL, font=F, space_after=10, line_spacing=1.15)
            y += 3.65

        if "stats" in sl:
            n = len(sl["stats"]); gap = 0.3
            cwid = (12.11 - gap*(n-1)) / n
            base_y = y if "cards" not in sl else y
            yy = 5.35 if "cards" in sl else y
            hh = 1.15 if "cards" in sl else 2.6
            for i, (a, b) in enumerate(sl["stats"]):
                x = 0.62 + i*(cwid+gap)
                if rtl: x = 0.62 + (n-1-i)*(cwid+gap)
                add_rect(s, X(x, cwid), yy, cwid, hh, DEEP, round_=True)
                add_text(s, X(x+0.2, cwid-0.4), yy+0.18, cwid-0.4, 0.55, [[(a, 20, True, CREAM)]], align=AL, font=F)
                add_text(s, X(x+0.2, cwid-0.4), yy+0.72 if hh>1.3 else yy+0.62, cwid-0.4, 0.4, [[(b, 10.5, False, RGBColor(0xC8,0xE6,0xCF))]], align=AL, font=F)
            if hh > 1.3: y += 2.8

        if "note" in sl:
            add_text(s, X(0.62, 12.11), 6.62, 12.11, 0.42, [[("◆ ", 11, True, GREEN), (sl["note"], 11.5, False, MUTED)]], align=AL, font=F)

    prs.save(path)
    print("saved", path.name, f"({path.stat().st_size//1024} KB, {len(spec['slides'])} slides)")

for lang in ["en", "fa", "tr"]:
    spec = DECKS[lang]
    build_deck(lang, spec, OUT / f"GreenRoot-Pitch-{lang.upper()}.pptx")
print("ALL DECKS DONE")
