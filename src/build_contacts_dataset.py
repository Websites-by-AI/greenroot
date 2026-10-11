#!/usr/bin/env python3
"""Build the source-backed GreenRoot outreach directory. No invented contacts.
Research snapshots are local only; published files contain institutional contacts,
not names/contact details of individual branch chairs.
"""
from pathlib import Path
from collections import Counter
import re, json, csv, unicodedata

ROOT = Path(__file__).resolve().parent.parent
DATE = '2026-10-11'
PARENT = 'Türkiye Yeşilay Cemiyeti'

DIGITS = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789')
def digits(x): return re.sub(r'\D','',x.translate(DIGITS))
def normalize(raw,country='TR'):
    # Do not invent missing area codes or silently expand abbreviated ranges.
    raw = raw.translate(DIGITS)
    raw = raw.split(' - ')[0].split('–')[0]
    d = digits(raw)
    if d.startswith('00'): d=d[2:]
    cc = '98' if country=='IR' else '90'
    if d.startswith(cc) and len(d)==12: return '+'+d, 'international'
    if len(d)==11 and d.startswith('0'): return '+'+cc+d[1:], 'international'
    if len(d)==10: return '+'+cc+d, 'international'
    if country=='TR' and len(d)==7 and d.startswith('444'): return d, 'domestic'
    return '', 'missing' if not d else 'incomplete'

seed = json.loads((ROOT/'src/contacts-seed.json').read_text())
rows=[]
for r in seed:
    r.setdefault('country','IR' if r['region']=='iran' else 'TR')
    r.setdefault('website',r['source'])
    r.setdefault('source_kind','official_site')
    if 'turkiye.gov.tr' in r['source'] or 'ankara.gov.tr' in r['source']:
        r['source_kind']='official_directory'
    r.setdefault('note_key','')
    r['checked']=DATE
    r['phone'],r['phone_scope']=normalize(r['phone_raw'],r['country'])
    r['phone_called']=False
    r['partnership']='Not contacted; willingness unknown'
    rows.append(r)

# 39 district municipalities: official IBB telephone directory.
snapshot=json.loads((ROOT/'src/contacts-snapshot.json').read_text())
website_map = {
 'Adalar':'https://adalar.bel.tr/', 'Arnavutköy':'https://www.arnavutkoy.bel.tr/',
 'Ataşehir':'https://www.atasehir.bel.tr/', 'Avcılar':'https://www.avcilar.bel.tr/',
 'Bağcılar':'https://www.bagcilar.bel.tr/', 'Bahçelievler':'https://www.bahcelievler.bel.tr/',
 'Bakırköy':'https://www.bakirkoy.bel.tr/', 'Başakşehir':'https://www.basaksehir.bel.tr/',
 'Bayrampaşa':'https://www.bayrampasa.bel.tr/', 'Beşiktaş':'https://besiktas.bel.tr/',
 'Beykoz':'https://www.beykoz.bel.tr/', 'Beylikdüzü':'https://www.beylikduzu.istanbul/',
 'Beyoğlu':'https://beyoglu.bel.tr/', 'Büyükçekmece':'https://www.bcekmece.bel.tr/',
 'Çatalca':'https://www.catalca.bel.tr/', 'Çekmeköy':'https://www.cekmekoy.bel.tr/',
 'Esenler':'https://esenler.bel.tr/', 'Esenyurt':'https://www.esenyurt.bel.tr/',
 'Eyüpsultan':'https://www.eyupsultan.bel.tr/', 'Fatih':'https://www.fatih.bel.tr/',
 'Gaziosmanpaşa':'https://www.gaziosmanpasa.bel.tr/', 'Güngören':'https://www.gungoren.bel.tr/',
 'Kadıköy':'https://www.kadikoy.bel.tr/', 'Kağıthane':'https://www.kagithane.istanbul/',
 'Kartal':'https://www.kartal.bel.tr/', 'Küçükçekmece':'https://kucukcekmece.istanbul/',
 'Maltepe':'https://www.maltepe.bel.tr/', 'Pendik':'https://www.pendik.bel.tr/',
 'Sancaktepe':'https://www.sancaktepe.bel.tr/', 'Sarıyer':'https://sariyer.bel.tr/',
 'Silivri':'https://www.silivri.bel.tr/', 'Sultanbeyli':'https://sultanbeyli.bel.tr/',
 'Sultangazi':'https://www.sultangazi.bel.tr/', 'Şile':'https://www.sile.bel.tr/',
 'Şişli':'https://www.sisli.bel.tr/', 'Tuzla':'https://www.tuzla.bel.tr/',
 'Ümraniye':'https://www.umraniye.bel.tr/', 'Üsküdar':'https://www.uskudar.bel.tr/',
 'Zeytinburnu':'https://zeytinburnu.istanbul/'
}
# Only publish an independently retrieved website; otherwise the official directory is the fallback.
site_audit_path=ROOT/'src/municipal-websites-audit.json'
site_audit=json.loads(site_audit_path.read_text()) if site_audit_path.exists() else {}
for m in snapshot['municipalities']:
    district=m['district']
    raw=m['phone_raw']; phone,scope=normalize(raw)
    source='https://ibb.istanbul/ibb/belediye-hakkinda/yetki-alani/'
    aud=site_audit.get(district,{})
    rows.append(dict(name=district+' Belediyesi',name_fa='شهرداری '+district,
        region='istanbul',country='TR',city='İstanbul',district=district,category='civic',
        type='organization',parent=district+' Belediyesi',phone_raw=raw,phone=phone,phone_scope=scope,
        email='',website=aud.get('website') or source,source=source,source_ref=1,
        source_kind='official_directory',checked=DATE,phone_called=False,
        priority=1 if district in ['Kadıköy','Üsküdar','Şişli','Beşiktaş'] else 2,
        offer='municipal',note_key='switchboard',partnership='Not contacted; willingness unknown'))

# Yeşilay: explicitly local branches, NOT 119 independent charities.
yesilay=snapshot['yesilay']
seen=set()
for r in yesilay:
    if r['name'] in seen: continue  # official page has one duplicate/empty Adana row with "111".
    seen.add(r['name'])
    city=r['city']; in_ist=city=='İstanbul'
    candidates=[]
    for raw in r['phones']:
        phone,scope=normalize(raw)
        if phone: candidates.append((raw,phone,scope))
    # Prefer public landline over mobile when both are printed for this branch.
    candidates.sort(key=lambda x:x[1].startswith('+905'))
    raw,phone,scope=candidates[0] if candidates else ('','','missing')
    district=r['name'].replace('İstanbul ','') if in_ist else city
    if district=='Eyüp': district='Eyüpsultan'
    name='Yeşilay — '+r['name']+' Şubesi'
    rows.append(dict(name=name,name_fa='یشیلای — شعبه '+district,region='istanbul' if in_ist else 'turkey',
        country='TR',city=city,district=district,category='recovery',type='branch',parent=PARENT,
        address=r['address'],phone_raw=raw,phone=phone,phone_scope=scope,email='',
        website='https://www.yesilay.org.tr/subeler/',source='https://www.yesilay.org.tr/subeler/',
        source_ref=1,source_kind='official_directory',checked=DATE,phone_called=False,
        priority=1 if district in ['Kadıköy','Antalya'] else 2,offer='recovery',
        note_key='branch' if phone else 'nophone',partnership='Not contacted; willingness unknown'))

# Five distinct Bursa municipalities, each source-backed by Bursa's public directory.
for m in snapshot['bursa']:
    name=m['name'];raw=m['phone_raw'];phone,scope=normalize(raw);url=m['website']
    rows.append(dict(name=name,name_fa='شهرداری '+name.replace(' Belediyesi',''),region='turkey',
        country='TR',city='Bursa',district=name.replace(' Belediyesi',''),category='civic',type='organization',
        parent=name,phone_raw=raw,phone=phone,phone_scope=scope,email='',website=url,
        source='https://www.bursa.bel.tr/rehber',source_ref=2,source_kind='official_directory',
        checked=DATE,phone_called=False,priority=2,offer='municipal',note_key='switchboard',
        partnership='Not contacted; willingness unknown'))

# Audit distinguishes a directly fetched page from a search-indexed official source.
audit_path=ROOT/'src/contacts-source-audit.json'
audit=json.loads(audit_path.read_text()) if audit_path.exists() else {}
for r in rows:
    a=audit.get(r['source'],{})
    if r['source_kind']=='official_directory' and ('yesilay.org.tr/subeler' in r['source'] or 'yetki-alani' in r['source'] or 'bursa.bel.tr/rehber' in r['source']):
        r['evidence']='retrieved_official_page'
    else:
        r['evidence']='retrieved_official_page' if a.get('phone_found',{}).get(r['phone'],False) else 'indexed_official_source'
    if not r['phone']: r['evidence']='no_public_phone_found'
    r['source_http']=a.get('http')

# A fixed research set, not a fabricated population count or a likelihood score.
counts=Counter(r['region'] for r in rows)
assert counts=={'istanbul':100,'turkey':100,'iran':10}, counts
assert len({(r['name'],r['city']) for r in rows})==210
rows.sort(key=lambda r:({'istanbul':0,'turkey':1,'iran':2}[r['region']],r['priority'],r['name'].casefold()))
rcount=Counter()
for r in rows:
    rcount[r['region']]+=1
    r['id']={'istanbul':'IST','turkey':'TR','iran':'IR'}[r['region']]+'-'+str(rcount[r['region']]).zfill(3)

meta=dict(version='1.0',checked=DATE,counts=dict(counts),total=len(rows),
    public_phones=sum(bool(r['phone']) for r in rows),missing_phones=sum(not r['phone'] for r in rows),
    parent_institutions=len({r['parent'] for r in rows}),branches=sum(r['type']=='branch' for r in rows),
    units=sum(r['type']=='public_unit' for r in rows),
    caveat='Potential outreach leads only; includes branches and units, not 210 independent organizations. No calls made, consent/willingness unconfirmed. Medical advice, licensing and funding eligibility are not assessed.')
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data/partners.json').write_text(json.dumps({'meta':meta,'contacts':rows},ensure_ascii=False,indent=2))
print(json.dumps(meta,ensure_ascii=False,indent=2))
for r in rows:
    if not r['phone']: print('NO VERIFIED PUBLIC PHONE',r['id'],r['name'])
