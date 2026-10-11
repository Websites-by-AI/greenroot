#!/usr/bin/env python3
"""Review published institutional WhatsApp links. No account probing and no messages.
Caches public page evidence; branches do not inherit a general HQ channel as local.
"""
from pathlib import Path
import json,re,time,html,sys
from urllib.parse import urlparse,urljoin,parse_qs,unquote
from concurrent.futures import ThreadPoolExecutor,as_completed
import requests
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'data/partners.json').read_text())
HEADERS={'User-Agent':'Mozilla/5.0 GreenRoot institutional-contact source review (no account probing)'}
def wa_link(href):
    try:
        u=urlparse(html.unescape(href));host=(u.hostname or '').lower()
        if host not in ['wa.me','api.whatsapp.com','web.whatsapp.com']:return None
        phone=u.path.strip('/').split('/')[0] if host=='wa.me' else parse_qs(u.query).get('phone',[''])[0]
        phone=re.sub(r'\D','',phone)
        if not 10<=len(phone)<=15 or phone.startswith('0'):return None # share links / no recipient are not channels
        return {'url':'https://wa.me/'+phone,'phone':'+'+phone}
    except Exception:return None

def fetch(url):
    result={'url':url,'checked':'2026-10-11','http':None,'usable':False,'whatsapp':[],'contact_links':[]}
    try:
        r=requests.get(url,headers=HEADERS,timeout=(5,10),allow_redirects=True);result['http']=r.status_code;result['final_url']=r.url
        if r.status_code!=200 or 'text/html' not in r.headers.get('content-type',''):return result
        s=BeautifulSoup(r.text,'html.parser');body=s.get_text(' ',strip=True)
        if len(body)<120:return result
        result['usable']=True;result['title']=s.title.get_text(' ',strip=True)[:160] if s.title else ''
        for a in s.find_all('a',href=True):
            href=urljoin(r.url,a['href']);w=wa_link(href)
            if w and w['url'] not in {v['url'] for v in result['whatsapp']}:
                label=a.get('aria-label') or a.get('title') or a.get_text(' ',strip=True)
                w['label']=label[:120];w['source']=r.url;result['whatsapp'].append(w)
            if urlparse(href).hostname==urlparse(r.url).hostname and re.search(r'iletisim|contact|تماس|ارتباط',unquote(href),re.I) and '#' not in href:
                if href not in result['contact_links'] and href!=url:result['contact_links'].append(href)
        # Widgets sometimes contain the same recipient-specific link in JS rather than an anchor.
        for match in re.findall(r'https?://(?:wa\.me/[0-9+]+|(?:api|web)\.whatsapp\.com/send\?[^\s\"\'<>]+)',r.text):
            w=wa_link(match)
            if w and w['url'] not in {v['url'] for v in result['whatsapp']}:
                w['label']='Recipient-specific website widget; purpose not independently confirmed';w['source']=r.url;result['whatsapp'].append(w)
    except Exception as e:result['error']=type(e).__name__
    return result
urls=sorted({x for r in DATA['contacts'] for x in [r.get('website'),r.get('source')] if x})
if '--cached' in sys.argv:
    cache=json.loads((ROOT/'research/whatsapp-page-audit.json').read_text())
else:
    cache={}
    with ThreadPoolExecutor(max_workers=14) as pool:
        for f in as_completed({pool.submit(fetch,u):u for u in urls}):
            x=f.result();cache[x['url']]=x
    # A bounded second pass of official same-host contact pages.
    extra=sorted({v for x in cache.values() for v in x['contact_links'][:2] if v not in cache})
    with ThreadPoolExecutor(max_workers=14) as pool:
        for f in as_completed({pool.submit(fetch,u):u for u in extra}):
            x=f.result();cache[x['url']]=x
records={}
for r in DATA['contacts']:
    roots=[cache.get(x) for x in {r.get('website'),r.get('source')} if x in cache]
    related=roots[:]
    for x in roots:related += [cache[u] for u in x['contact_links'][:2] if u in cache]
    ws={v['url']:v for x in related for v in x['whatsapp']};matches=list(ws.values())
    def issuer_allowed(x):
        host=(urlparse(x['source']).hostname or '').removeprefix('www.')
        if host=='bursa.bel.tr' and r['parent']!='Bursa Büyükşehir Belediyesi':return False
        if host.endswith('ibb.istanbul') and r['parent']!='İstanbul Büyükşehir Belediyesi':return False
        if host.endswith('turkiye.gov.tr') or host.endswith('ankara.gov.tr'):return False
        wh=(urlparse(r.get('website','')).hostname or '').removeprefix('www.')
        final_hosts={(urlparse(z.get('final_url','')).hostname or '').removeprefix('www.') for z in roots if z['url']==r.get('website')}
        return host==wh or host in final_hosts
    own=[x for x in matches if x['phone']==r.get('phone')]
    published=own or ([x for x in matches if issuer_allowed(x)] if r['type']!='branch' else [])
    status='published' if published else ('hq_only' if r['type']=='branch' else 'directory_only') if matches else 'not_found' if any(x['usable'] for x in related) else 'unavailable'
    records[r['id']]={'status':status,'checked':'2026-10-11','source_pages':[{'url':x['url'],'http':x['http'],'usable':x['usable']} for x in related],
                     'channels':published,'other_institution_channels':matches if status in ['hq_only','directory_only'] else [],
                     'account_tested':False,'purpose':'support_not_business' if r['id']=='IST-041' else 'public_service_not_business_confirmed' if r['category']=='civic' else 'care_or_general_route_not_for_sales' if r['category']=='recovery' else 'institutional_purpose_unconfirmed'}
result={'checked':'2026-10-11','method':'Official site/contact-page recipient-specific links only. No probing, calls or messages. Absence does not mean no WhatsApp account. Branches do not inherit HQ availability. Public service/counselling channels are not outreach permission.',
        'pages_reviewed':len(cache),'records':records}
(ROOT/'src/whatsapp-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
(ROOT/'research/whatsapp-page-audit.json').write_text(json.dumps(cache,ensure_ascii=False,indent=2))
from collections import Counter
print('WhatsApp source review:',len(cache),'pages;',dict(Counter(x['status'] for x in records.values())))
for k,x in records.items():
    if x['status']=='published':print(k,[(v['url'],v['source']) for v in x['channels']])
