#!/usr/bin/env python3
"""Provision/update the opted-in reminder Worker. Credentials only from environment.
No email provider or recipient is fabricated. Existing encrypted secrets are retained.
"""
from pathlib import Path
import os,json,secrets,requests
ROOT=Path(__file__).resolve().parent
account=os.environ['CLOUDFLARE_ACCOUNT_ID'];token=os.environ['CLOUDFLARE_API_TOKEN']
base='https://api.cloudflare.com/client/v4/accounts/'+account
headers={'Authorization':'Bearer '+token}
def api(method,path,**kw):
 r=requests.request(method,base+path,headers=headers,timeout=40,**kw)
 try:d=r.json()
 except Exception:raise RuntimeError('Cloudflare API returned non-JSON '+str(r.status_code))
 if not d.get('success'):raise RuntimeError(str([(x.get('code'),x.get('message')) for x in d.get('errors',[])]))
 return d.get('result')
name='greenroot-followups'
# Use a dedicated Durable Object rather than touching other projects' databases.
check=requests.get(base+'/workers/scripts/'+name,headers=headers,timeout=30)
exists=check.status_code==200
meta={'main_module':'worker.mjs','compatibility_date':'2026-10-11','bindings':[{'type':'durable_object_namespace','name':'STORE','class_name':'ReminderStore'},{'type':'plain_text','name':'WORKER_URL','text':'https://'+name+'.elasa2next.workers.dev'}],'keep_bindings':['secret_text'],'logpush':False}
if not exists:meta['migrations']={'new_tag':'v1','new_sqlite_classes':['ReminderStore']}
api('PUT','/workers/scripts/'+name,files={'metadata':('metadata.json',json.dumps(meta),'application/json'),'worker.mjs':('worker.mjs',(ROOT/'worker.mjs').read_bytes(),'application/javascript+module')})
existing=api('GET','/workers/scripts/'+name+'/secrets')
if 'RATE_SALT' not in [x['name'] for x in existing]:
 api('PUT','/workers/scripts/'+name+'/secrets',json={'name':'RATE_SALT','text':secrets.token_hex(32),'type':'secret_text'})
api('POST','/workers/scripts/'+name+'/subdomain',json={'enabled':True})
# Account cron quota is full: this service uses its dedicated store's persistent alarm instead.
(ROOT/'wrangler.toml').write_text('name = "greenroot-followups"\nmain = "worker.mjs"\ncompatibility_date = "2026-10-11"\n\n[vars]\nWORKER_URL = "https://greenroot-followups.elasa2next.workers.dev"\n\n[durable_objects]\nbindings = [{ name = "STORE", class_name = "ReminderStore" }]\n\n[[migrations]]\ntag = "v1"\nnew_sqlite_classes = ["ReminderStore"]\n')
(ROOT/'deployment.json').write_text(json.dumps({'worker':name,'url':'https://'+name+'.elasa2next.workers.dev','private_storage':'Dedicated SQLite Durable Object / ReminderStore','timer':'Persistent Durable Object alarm, 30-minute ticks while subscribers exist','provider_configured_by_this_script':False},indent=2))
print('Provisioned reminder Worker + dedicated private SQLite store + persistent 30-minute alarm. No provider key or sender configured.')
print('Worker URL: https://'+name+'.elasa2next.workers.dev')
