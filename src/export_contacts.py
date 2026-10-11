#!/usr/bin/env python3
from pathlib import Path
import json, csv, importlib.util
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.utils import get_column_letter

ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('partners_content', ROOT/'src/partners-content.py')
c=importlib.util.module_from_spec(spec); spec.loader.exec_module(c)
D=json.loads((ROOT/'data/partners.json').read_text()); rows=D['contacts'];meta=D['meta']
for r in rows:
    r['city_fa']=c.PLACES_FA.get(r['city'],r['city'])
    r['district_fa']=c.PLACES_FA.get(r['district'],r['district'])
    if r['name'].startswith('Yeşilay — '):r['name_fa']='یشیلای — شعبه '+r['district_fa']
    elif r['category']=='civic' and r['name'].endswith(' Belediyesi'):
        r['name_fa']='شهرداری '+r['district_fa']
    r['ask_en']=c.OFFERS[r['offer']]['en'];r['ask_fa']=c.OFFERS[r['offer']]['fa'];r['ask_tr']=c.OFFERS[r['offer']]['tr']
    r['note_en']=c.TEXT['en'].get('pf.note.'+r['note_key'],'')
    r['note_fa']=c.TEXT['fa'].get('pf.note.'+r['note_key'],'')
    r['note_tr']=c.TEXT['tr'].get('pf.note.'+r['note_key'],'')
(ROOT/'data/partners.json').write_text(json.dumps(D,ensure_ascii=False,indent=2))

# This dictionary is loaded after existing translations, before the app.
js='/* Researched outreach directory UI: EN / FA / TR. */\n(function(){\nvar X='+json.dumps(c.TEXT,ensure_ascii=False)+';\nObject.keys(X).forEach(function(l){window.I18N[l]=Object.assign(window.I18N[l]||{},X[l]);});\nwindow.GR_MESSAGES='+json.dumps(c.MESSAGES,ensure_ascii=False)+';\nwindow.GR_PLACES_FA='+json.dumps(c.PLACES_FA,ensure_ascii=False)+';\n})();\n'
(ROOT/'src/partners-i18n.js').write_text(js)

KIT=ROOT/'kit';KIT.mkdir(exist_ok=True)
columns=['id','name','name_fa','name_en','region','country','city','district','parent','type','category','phone','phone_raw','phone_scope','email','website','source','checked','evidence','phone_called','priority','ask_en','ask_fa','ask_tr','note_en','note_fa','partnership']
def csvsafe(v):
    if v is None: return ''
    v=str(v)
    # Phone numbers start with +; protect them as text against Excel formula evaluation.
    return "'"+v if v.lstrip().startswith(('=','+','-','@')) else v
with (KIT/'GreenRoot-Outreach-210.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(columns)
    for r in rows:w.writerow([csvsafe(r.get(k,'')) for k in columns])

GREEN='0B3B2A';LIME='D9F99D'; PALE='EFF6EA';GREY='54685C';AMBER='FEF3C7'
wb=Workbook();overview=wb.active;overview.title='READ ME'
overview.sheet_view.showGridLines=False
info=[('GREENROOT | OUTREACH RESEARCH','210 source-backed contact entries · 11 October 2026'),
 ('Scope','100 Istanbul + 100 other Türkiye + 10 Iran / Tehran'),
 ('Meaning of counts',f"{meta['parent_institutions']} parent institutions; {meta['branches']} local branches; {meta['units']} public/university units. Not 210 independent organizations."),
 ('Published public phone',f"{meta['public_phones']} entries have a published phone; {meta['missing_phones']} have no usable phone in the checked source."),
 ('Verification limit','Source review only. No calls, messages or partnership agreements. Published numbers are not tested lines.'),
 ('Evidence','retrieved_official_page = telephone found on fetched official page. indexed_official_source = official-source search evidence; direct retrieval blocked / missing. no_public_phone_found = no number supplied.'),
 ('Suggested first contacts','Priority 1 is an editorial assessment of fit, not a likelihood of funding or agreement. All first-contact and follow-up data remain empty.'),
 ('Foreign founder / work eligibility','Company registration, permissions, labour contracts, work permits, insurance, clinical licensing and grant eligibility need local professional checks.'),
 ('Medical boundary','Concept prototype, not medical advice. No participant health records. Clinical care must never depend on waste output or work quotas.'),
 ('Safe outreach','Ask the switchboard for the relevant team. Do not use emergency / counselling hotlines for business. Individual, respectful outreach only; honour a decline.'),
 ('Türkiye short lines','444… lines are stored as domestic numbers. They may not connect from abroad; use the official contact page / email instead.'),
 ('Missing phones','Four Istanbul Yeşilay branches: Başakşehir, Kağıthane, Küçükçekmece, Şişli. Two other branches: Kütahya, Sinop. Do not replace these with a made-up local number.'),
 ('Number conflicts','Buğday and Toloo have inconsistent published numbers across pages. Prefer email; see row notes. Tehran waste directory is legacy / intermittently inaccessible.'),
 ('Source date','The review date is not the source’s update date. Reconfirm the number and contact owner before sending a proposal.'),
 ('CSV phone formatting','Leading apostrophes prevent phones beginning with + from being interpreted by Excel as formulas. JSON and Excel retain clean phone strings.'),
 ('Live directory','https://greenroot-af0.pages.dev/partners?lang=fa'),
 ('Project material','https://greenroot-af0.pages.dev/program'),
 ('Use this workbook','Filter the region sheets, select five leads, use Messages for a first introduction, and fill Outreach tracker only after actual contact.'),
 ('فارسی','این فهرست سرنخ همکاری است؛ نه شریک تأییدشده. شماره‌ها منتشر شده‌اند، اما با تماس آزمایش نشده‌اند. شعب محلی نهاد مستقل نیستند.'),
 ('Türkçe','Rehber potansiyel adayları içerir, onaylanmış ortakları değil. Yayımlanan numaralar aranarak test edilmedi. Şubeler bağımsız kuruluş değildir.')]
for v in info: overview.append(v)
overview.column_dimensions['A'].width=30;overview.column_dimensions['B'].width=105
for i in range(1,len(info)+1):
    overview.cell(i,1).font=Font(bold=True,color=GREEN,size=11)
    overview.cell(i,2).alignment=Alignment(wrap_text=True,vertical='center')
    overview.cell(i,1).alignment=Alignment(wrap_text=True,vertical='center')
    overview.row_dimensions[i].height=55 if i>1 else 46
    if i%2==0:
        for cell in overview[i]:cell.fill=PatternFill('solid',fgColor=PALE)
for cell in overview[1]:cell.fill=PatternFill('solid',fgColor=GREEN);cell.font=Font(color=LIME,bold=True,size=14)
overview.freeze_panes='B2'

headers=['ID','Official name','نام فارسی','City','District','Category','Entry type','Parent institution','Public phone','Phone scope','Email','Website / contact route','Official source','Source reviewed','Evidence','Suggested ask (EN)','پیشنهاد همکاری (FA)','Notes (EN)','Phone called?','Priority']
keys=['id','name','name_fa','city','district','category','type','parent','phone','phone_scope','email','website','source','checked','evidence','ask_en','ask_fa','note_en','phone_called','priority']
widths=[13,46,42,20,21,19,18,37,24,18,35,45,45,18,32,70,70,65,17,13]
def setup_table(ws, table_name, widths):
    ws.sheet_view.showGridLines=False;ws.freeze_panes='D2'
    end=get_column_letter(ws.max_column)
    tab=Table(displayName=table_name,ref=f'A1:{end}{ws.max_row}');tab.tableStyleInfo=TableStyleInfo(name='TableStyleMedium4',showRowStripes=True);ws.add_table(tab)
    for cell in ws[1]:
        cell.fill=PatternFill('solid',fgColor=GREEN);cell.font=Font(color='FFFFFF',bold=True);cell.alignment=Alignment(wrap_text=True,vertical='center')
    ws.row_dimensions[1].height=34
    for i,w in enumerate(widths,1):ws.column_dimensions[get_column_letter(i)].width=w
    for i in range(2,ws.max_row+1):
        ws.row_dimensions[i].height=78
        for cell in ws[i]:
            cell.alignment=Alignment(wrap_text=True,vertical='top');cell.font=Font(size=10,color='142C1F')
            if isinstance(cell.value,str) and cell.value.startswith(('https://','http://')):
                cell.hyperlink=cell.value;cell.font=Font(size=10,color='166534',underline='single')
    ws.sheet_properties.pageSetUpPr.fitToPage=True
    ws.page_setup.orientation='landscape';ws.page_setup.paperSize=ws.PAPERSIZE_A3;ws.page_setup.fitToWidth=1;ws.page_setup.fitToHeight=0
    ws.print_title_rows='1:1'
for name, subset in [('Istanbul',[r for r in rows if r['region']=='istanbul']),('Other Türkiye',[r for r in rows if r['region']=='turkey']),('Iran Tehran',[r for r in rows if r['region']=='iran']),('First contacts',[r for r in rows if r['priority']==1])]:
    ws=wb.create_sheet(name);ws.append(headers)
    for r in subset:ws.append([r.get(k,'') for k in keys])
    setup_table(ws,'Leads'+name.replace(' ','').replace('ü','u'),widths)
    for cell in ws['I'][1:]:cell.number_format='@'

ws=wb.create_sheet('Outreach tracker');ws.append(['ID','Organization / branch','Region','Phone','Email','Status — fill after real contact','Owner','First contact date','Next follow-up date','Actual agreed next step','Notes — no health records'])
for r in rows:ws.append([r['id'],r['name'],r['region'],r['phone'],r['email'],'Not contacted','','','','',''])
setup_table(ws,'OutreachTracker',[13,55,18,24,36,32,24,23,23,60,60]);ws.freeze_panes='C2'
for row in ws.iter_rows(min_row=2,min_col=6,max_col=11):
    for cell in row:cell.fill=PatternFill('solid',fgColor='FFF9E7')
from openpyxl.worksheet.datavalidation import DataValidation
dv=DataValidation(type='list',formula1='"Not contacted,Contacted,Replied,Meeting agreed,Declined,Follow-up,Closed"');dv.error='Choose a status based on actual contact.';dv.showErrorMessage=True;ws.add_data_validation(dv);dv.add(f'F2:F{ws.max_row}')

ws=wb.create_sheet('Sources');ws.append(['Official source','Source type','Research date','Number of linked entries','Direct retrieval HTTP','Evidence notes'])
for u in sorted({r['source'] for r in rows}):
    subset=[r for r in rows if r['source']==u]
    ws.append([u,subset[0]['source_kind'],meta['checked'],len(subset),subset[0].get('source_http') or 'unavailable','Public-source review only; no telephone test.'])
setup_table(ws,'ResearchSources',[80,25,22,24,25,65])
ws=wb.create_sheet('Messages');ws.append(['Language','First message — replace placeholders'])
for lang,msg in c.MESSAGES.items():ws.append([lang.upper(),msg])
setup_table(ws,'MessageTemplates',[15,125]);
for i in range(2,5):ws.row_dimensions[i].height=320

wb.save(KIT/'GreenRoot-Outreach-210.xlsx')
messages='GREENROOT | FIRST CONTACT MESSAGES\nSource-backed concept outreach; no automatic sending. Replace every bracketed placeholder.\n\n'
for lang,msg in c.MESSAGES.items():messages+='========== '+lang.upper()+' ==========\n\n'+msg+'\n'
(KIT/'GreenRoot-Outreach-Messages-EN-FA-TR.txt').write_text(messages)

short=[r for r in rows if r['priority']==1]
guide='''# GreenRoot — بانک ارتباط با همکاران بالقوه

**تاریخ بررسی منابع: ۱۱ اکتبر ۲۰۲۶.**

## دامنه و معنی تعداد
- استانبول: ۱۰۰ ردیف تماس.
- دیگر شهرهای ترکیه: ۱۰۰ ردیف تماس (استانبول حذف شده).
- ایران: ۱۰ ردیف تماس در تهران.
- در مجموع ۲۱۰ ردیف زیرمجموعه **۸۸ نهاد مادر**؛ شامل **۱۲۰ شعبه** و **۵ واحد عمومی/دانشگاهی**، نه ۲۱۰ نهاد مستقل.
- **۲۰۴ ردیف دارای شماره عمومی منتشرشده؛ ۶ ردیف بدون شماره پیدا‌شده.**
- هیچ مجموعه‌ای تماس گرفته نشده و هیچ همکاری تأیید نشده است.

## منابع و راستی‌آزمایی
نام و مسیر تماس از صفحات رسمی نهادها یا فهرست عمومی رسمی آمده است. هر ردیف لینک منبع مستقل دارد.
`retrieved_official_page` یعنی شماره در صفحه رسمی بازیابی‌شده دیده شده؛ `indexed_official_source` یعنی مدرک از نمایه جست‌وجوی همان منبع رسمی است و بازیابی مستقیم ممکن نبوده یا صفحه با جاوااسکریپت بارگذاری می‌شود. این برچسب‌ها هرگز به معنی آزمایش خط تلفن نیستند. تاریخ بررسی ما نیز تاریخ آخرین به‌روزرسانی خود منبع نیست.

شماره کوتاه ترکیه با `444` ممکن است از خارج کشور قابل تماس نباشد. شماره عمومی ممکن است تلفنخانه باشد؛ نام بخش همکاری، خدمات محیط‌زیست، اشتغال یا مدیریت درمان را بخواهید. خطوط بحران و مشاوره برای بازاریابی نیستند.

## شش ردیف بدون شماره
- یشیلای استانبول: Başakşehir، Kağıthane، Küçükçekmece، Şişli.
- یشیلای سایر ترکیه: Kütahya و Sinop.
شماره دفتر مرکزی به عنوان شماره محلی درج نشده است. منبع شعب را باز کنید و مسیر تماس فعلی را بپرسید.

## تعارض‌هایی که باید تأیید مجدد شوند
- Buğday: صفحه پرسش‌های متداول 349 99 93 و صفحات رسمی قدیمی‌تر 349 99 33 را منتشر کرده‌اند؛ ابتدا ایمیل.
- طلوع بی‌نشان‌ها: صفحه اصلی فعلی 8883 2002 و صفحات قدیمی انگلیسی شماره دیگری دارند؛ ابتدا ایمیل.
- فهرست مدیریت پسماند تهران قدیمی است و گاهی در دسترس نیست؛ مسئول و شماره فعلی را دوباره تأیید کنید.

## تناسب همکاری — پیشنهاد ما، نه ادعای خود نهاد
اولویت ۱ فقط برآورد موضوعی ما از تناسب است؛ نه درصد احتمال پاسخ، گرفتن پول یا امضای قرارداد. مثال‌ها: بازیافت‌کننده برای خرید مواد مجاز و حمل ایمن؛ شهرداری برای مجوز و نقطه تماس؛ مجموعه بهبودی برای چارچوب ارجاع؛ دانشگاه برای ارزیابی اخلاقی مستقل. فعالیت اختصاصی اعتیاد برای همه نهادها بررسی نشده است.

## تماس ایمن و قانونی
۱. پنج مجموعه نزدیک انتخاب کنید: بهبودی، بازیافت، شهرداری، اشتغال و پژوهش.
۲. درخواست جلسه آشنایی ۲۰ دقیقه‌ای با **یک خواسته مشخص** بدهید. متن‌ها در فایل Messages و سایت هستند.
۳. هیچ اطلاعات فردی بیمار، تشخیص، مصرف یا پرونده درمانی ارسال نکنید.
۴. گرین‌روت هنوز نمونه اولیه مفهومی است؛ آمار دیگر صفحات سایت داده نمایشی است. به هیچ نهاد، نتیجه اثبات‌نشده ارائه نکنید.
۵. درمان مستقل از میزان کار؛ مشارکت با رضایت؛ مزد واقعی، قرارداد قانونی، اجازه کار، بیمه، ارزیابی خطر و نظارت بالینی برای پایلوت ضروری‌اند. این فهرست توصیه پزشکی یا تأیید مجوز نیست.
۶. شرایط ثبت شرکت، مؤسس خارجی و هر حمایت مالی را با متخصص محلی بررسی کنید. کمک‌هزینه وعده داده نشده است.
۷. پیگیری محترمانه، فقط یک بار بعد از ۵ تا ۷ روز کاری؛ پاسخ منفی را محترم بدانید. فایل پیگیری ابتدا «Not contacted» است.

## فایل‌ها و دسترسی
- [سایت فارسی](https://greenroot-af0.pages.dev/partners?lang=fa)
- [۱۰۰ مورد استانبول](https://greenroot-af0.pages.dev/partners?region=istanbul&lang=fa#directory)
- [۱۰۰ مورد سایر ترکیه](https://greenroot-af0.pages.dev/partners?region=turkey&lang=fa#directory)
- [۱۰ مورد ایران](https://greenroot-af0.pages.dev/partners?region=iran&lang=fa#directory)
- Excel: GreenRoot-Outreach-210.xlsx — سه منطقه، اولویت‌ها، منابع، متن تماس و برگه پیگیری قابل ویرایش.
- CSV: GreenRoot-Outreach-210.csv — ۲۱۰ ردیف با UTF-8 BOM؛ علامت ' قبل شماره‌های + برای حفظ متن در اکسل است.
- JSON: data/partners.json — داده پاک و قابل پردازش.
- ذخیره موارد در سایت فقط روی همان مرورگر است؛ داده به سرور ارسال نمی‌شود.

## پیشنهادهای اولین تماس و منبع هرکدام
'''
for r in short:
    guide+=f"- **{r.get('name_fa') or r['name']}** — `{r['phone']}` · {r['ask_fa']} · [{r.get('source_ref',1)}]({r['source']})\n"
(KIT/'GreenRoot-Outreach-Methodology-FA.md').write_text(guide)
print('Exported Excel, CSV, trilingual first messages and methodology.',len(rows),'rows;',len(short),'suggested first contacts')
