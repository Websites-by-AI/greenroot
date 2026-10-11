/* GreenRoot reminder service. Sends only opted-in task reminders to verified owners.
   No institutional outreach, inbox reading, filing, signing or medical data handling. */
const SITE='https://greenroot-af0.pages.dev';
const ORIGINS=[SITE,'https://sosa123456-greenroot.static.hf.space'];
const STEPS=['check_reply','followup_once','prepare_dossier','review_eligibility','review_application','check_nextcall'];
const TEXT={
 en:{verify:'Confirm your GreenRoot reminder address',verifyBody:'You requested task reminders to your own address. Confirm below. No collaboration message or application will be sent to any institution.',confirm:'Confirm my email and reminders',due:'GreenRoot — a task is due',stop:'Stop and delete reminders',boundary:'This is a reminder to you, not a message to the institution. Open the desk, check your inbox/portal yourself and record the real outcome. Nothing is registered or approved automatically.',check_reply:'Check inbox / portal for a response',followup_once:'Review one polite follow-up',prepare_dossier:'Prepare the requested concept / R&D pack',review_eligibility:'Confirm intake, eligibility and documents',review_application:'Check your actual submitted application',check_nextcall:'Check the official next call',verified:'Address confirmed. Return to your desk, refresh verification, then sync your pending tasks.',stopped:'Server reminders stopped and records deleted. Your local desk is unchanged.'},
 fa:{verify:'تأیید آدرس یادآور گرین‌روت',verifyBody:'یادآور کارهای خودتان را به این آدرس درخواست کرده‌اید. پایین تأیید کنید. هیچ پیام همکاری یا درخواست به نهادها ارسال نمی‌شود.',confirm:'تأیید ایمیل و یادآورها',due:'گرین‌روت — موعد یک کار رسیده است',stop:'توقف و حذف یادآورها',boundary:'این یادآور برای شماست، نه پیام به مجموعه. دفتر کار را باز کنید، خودتان صندوق پیام/پرتال را بررسی و نتیجه واقعی را ثبت کنید. هیچ ثبت‌نام یا پذیرشی خودکار نیست.',check_reply:'بررسی پاسخ در صندوق پیام / پرتال',followup_once:'بررسی یک پیگیری محترمانه',prepare_dossier:'آماده کردن پرونده ایده / پژوهش خواسته‌شده',review_eligibility:'تأیید پذیرش، شرایط و مدارک',review_application:'بررسی درخواست واقعاً ارسال‌شده',check_nextcall:'بررسی فراخوان بعدی در منبع رسمی',verified:'آدرس تأیید شد. به دفتر کار بازگردید، وضعیت تأیید را تازه و سپس کارهای در انتظار را همگام کنید.',stopped:'یادآورها و داده‌های سرور حذف شدند. دفتر محلی شما تغییر نکرده است.'},
 tr:{verify:'GreenRoot hatırlatma adresinizi doğrulayın',verifyBody:'Kendi adresinize görev hatırlatmaları istediniz. Aşağıda onaylayın. Kurumlara işbirliği mesajı veya başvuru gönderilmez.',confirm:'Adresimi ve hatırlatmaları onayla',due:'GreenRoot — görevin zamanı geldi',stop:'Hatırlatmaları durdur ve sil',boundary:'Bu size hatırlatmadır; kuruma mesaj değildir. Çalışma alanını açın, gelen kutusu/portalınızı kendiniz kontrol edip gerçek sonucu kaydedin. Kayıt veya kabul otomatik yapılmaz.',check_reply:'Yanıt için gelen kutusu / portalı kontrol et',followup_once:'Tek nazik takip mesajını değerlendir',prepare_dossier:'İstenen fikir / Ar-Ge dosyasını hazırla',review_eligibility:'Kabul, uygunluk ve belgeleri teyit et',review_application:'Gerçek gönderilen başvuruyu kontrol et',check_nextcall:'Resmi sonraki çağrıyı kontrol et',verified:'Adres doğrulandı. Çalışma alanına dönün, doğrulamayı yenileyin ve bekleyen görevleri eşleyin.',stopped:'Sunucu hatırlatmaları ve kayıtlar silindi; yerel çalışma alanınız değişmedi.'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const locale=s=>['en','fa','tr'].includes(s)?s:'en';
function emailOK(x){return typeof x==='string'&&x.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(x)&&!/[\r\n]/.test(x)&&!/@[^@]+\.(example|invalid|test)$/i.test(x);}
function fromOK(x){if(typeof x!=='string'||/[\r\n]/.test(x))return false;const m=x.match(/<([^<>]+)>$/);return emailOK(m?m[1]:x);}
function ready(env){const basic=!!env.RESEND_API_KEY&&fromOK(env.EMAIL_FROM)&&String(env.RATE_SALT||'').length>=32;if(!basic)return false;if(env.TEST_RECIPIENT)return emailOK(env.TEST_RECIPIENT);return !!env.TURNSTILE_SECRET&&!!env.TURNSTILE_SITE_KEY&&emailOK(env.PRIVACY_CONTACT)&&/^https:\/\//.test(env.PRIVACY_NOTICE_URL||'');}
async function hash(x){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x));return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');}
function token(){const b=new Uint8Array(32);crypto.getRandomValues(b);return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}
async function seal(value,env){const k=await crypto.subtle.importKey('raw',new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('unsub:'+env.RATE_SALT))),'AES-GCM',false,['encrypt']);const iv=new Uint8Array(12);crypto.getRandomValues(iv);const x=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(value)));return btoa(String.fromCharCode(...iv,...x));}
async function unseal(value,env){const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));const k=await crypto.subtle.importKey('raw',new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('unsub:'+env.RATE_SALT))),'AES-GCM',false,['decrypt']);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},k,bytes.slice(12)));}
const iso=()=>new Date().toISOString();
function headers(req){const o=req.headers.get('Origin');const h={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};if(ORIGINS.includes(o))h['Access-Control-Allow-Origin']=o;return h;}
function json(req,x,status=200){return new Response(JSON.stringify(x),{status,headers:headers(req)});}
function page(title,text,action='',tok='',l='en'){
 const dir=l==='fa'?'rtl':'ltr';return new Response(`<!doctype html><html lang="${l}" dir="${dir}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>body{font:17px/1.8 system-ui,Tahoma,sans-serif;background:#eef5e9;color:#123c2b;padding:30px}main{max-width:650px;margin:10vh auto;background:white;padding:32px;border:1px solid #d9e7d2;border-radius:24px}button,a{color:#12673b}button{font:inherit;background:#146b3c;color:white;border:0;border-radius:99px;padding:12px 22px;cursor:pointer}small{display:block;color:#687c6d;margin-top:16px}</style><main><h1>${esc(title)}</h1><p>${esc(text)}</p>${action?`<form method="POST" action="${action}"><input type="hidden" name="token" value="${esc(tok)}"><button type="submit">${esc(action==='/verify'?TEXT[l].confirm:TEXT[l].stop)}</button></form>`:''}<p><a href="${SITE}/outreach?lang=${l}#email">GreenRoot · دفتر کار · Çalışma alanı</a></p><small>No inbox access, automated institutional messages or registrations.</small></main></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
}
async function key(req,env){const v=(req.headers.get('Authorization')||'').match(/^Bearer ([A-Za-z0-9_-]{43})$/);return v?hash((env.RATE_SALT||'')+v[1]):null;}
async function body(req){if(Number(req.headers.get('content-length')||0)>20000)throw Error('too_large');const text=await req.text();if(text.length>20000)throw Error('too_large');try{return JSON.parse(text);}catch(e){throw Error('invalid_json');}}
async function limit(env,bucket,max,seconds){const now=Date.now(),start=Math.floor(now/(seconds*1000))*seconds*1000;await env.DB.prepare('INSERT INTO limits (bucket,period,n) VALUES (?,?,1) ON CONFLICT(bucket,period) DO UPDATE SET n=n+1').bind(bucket,start).run();const x=await env.DB.prepare('SELECT n FROM limits WHERE bucket=? AND period=?').bind(bucket,start).first();return x.n<=max;}
async function provider(env,to,subject,text,html,id,unsubscribe=''){
 const out={from:env.EMAIL_FROM,to:[to],subject,text,html};if(unsubscribe)out.headers={'List-Unsubscribe':`<${unsubscribe}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'};
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify(out),signal:AbortSignal.timeout(15000)});
 const d=await r.json().catch(()=>({}));if(!r.ok||!d.id)throw Error('provider_'+r.status);return d.id;
}
async function remove(env,k){await env.DB.batch([env.DB.prepare('DELETE FROM jobs WHERE key_hash=?').bind(k),env.DB.prepare('DELETE FROM subscribers WHERE key_hash=?').bind(k),env.DB.prepare('DELETE FROM delivery_log WHERE key_hash=?').bind(k)]);}
async function signedPage(req,env,path){const u=new URL(req.url);let raw=u.searchParams.get('token');if(req.method==='POST'){const f=await req.formData();raw=raw||f.get('token');}if(!/^[\w-]{43}$/.test(raw||''))return page('Invalid / expired link','Return to the live desk and request a new link.');const h=await hash(raw);const col=path==='/verify'?'verify_hash':'unsubscribe_hash';const s=await env.DB.prepare('SELECT * FROM subscribers WHERE '+col+'=?').bind(h).first();if(!s||path==='/verify'&&Date.parse(s.verify_expires)<Date.now())return page('Invalid / expired link','Return to the live desk and request a new link.');const l=locale(s.locale),tt=TEXT[l];
 if(req.method!=='POST')return page(path==='/verify'?tt.verify:tt.stop,path==='/verify'?tt.verifyBody:tt.boundary,path,raw,l);
 if(path==='/unsubscribe'){await remove(env,s.key_hash);return page(tt.stop,tt.stopped,'','',l);}
 // A confirmed address has one active workspace; recovery/new device cannot create duplicate reminders.
 const old=await env.DB.prepare('SELECT key_hash FROM subscribers WHERE email=? AND key_hash<>?').bind(s.email,s.key_hash).all();
 for(const x of old.results)await remove(env,x.key_hash);
 await env.DB.prepare('UPDATE subscribers SET verified=1,active=1,verify_hash=NULL,verify_expires=NULL,updated_at=? WHERE key_hash=?').bind(iso(),s.key_hash).run();return page(tt.confirm,tt.verified,'','',l);
}
async function handle(req,env){const u=new URL(req.url),path=u.pathname;
 if(['/verify','/unsubscribe'].includes(path)&&['GET','POST'].includes(req.method))return signedPage(req,env,path);
 const origin=req.headers.get('Origin');if(origin&&!ORIGINS.includes(origin))return json(req,{error:'origin_not_allowed'},403);
 if(req.method==='OPTIONS'){const h=headers(req);h['Access-Control-Allow-Methods']='GET,POST,DELETE,OPTIONS';h['Access-Control-Allow-Headers']='Authorization,Content-Type';h['Access-Control-Max-Age']='600';return new Response(null,{status:204,headers:h});}
 if(path==='/api/status'&&req.method==='GET')return json(req,{version:1,configured:ready(env),provider:'resend',singleUserTestMode:!!env.TEST_RECIPIENT,turnstileSiteKey:env.TEST_RECIPIENT?'':(env.TURNSTILE_SITE_KEY||''),privacyContact:env.TEST_RECIPIENT?'':(env.PRIVACY_CONTACT||''),privacyNotice:env.TEST_RECIPIENT?'':(env.PRIVACY_NOTICE_URL||''),requiresVerification:true,timer:'persistent_durable_object_alarm',tickMinutes:30,noInstitutionalOutreach:true,serverUTC:iso()});
 if(!env.DB)return json(req,{error:'storage_not_configured'},503);
 const k=await key(req,env);if(!k)return json(req,{error:'workspace_key_required'},401);
 if(path==='/api/email/connect'&&req.method==='POST'){
  if(!ready(env))return json(req,{error:'email_provider_not_configured'},503);
  const b=await body(req),em=String(b.email||'').trim().toLowerCase(),l=locale(b.locale);if(!emailOK(em)||b.consent!==true)return json(req,{error:'valid_own_email_and_explicit_consent_required'},400);
  if(env.TEST_RECIPIENT&&em!==env.TEST_RECIPIENT.trim().toLowerCase())return json(req,{error:'owner_only_test_mode'},403);
  if(!env.TEST_RECIPIENT){const q=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET,response:b.captcha||'',remoteip:req.headers.get('CF-Connecting-IP')||''})});const v=await q.json();if(!v.success||!ORIGINS.map(x=>new URL(x).hostname).includes(v.hostname)||v.action!=='greenroot-email')return json(req,{error:'verification_challenge_failed'},403);}
  const ip=await hash((env.RATE_SALT||'')+(req.headers.get('CF-Connecting-IP')||'no-ip'));
  if(!await limit(env,'ip:'+ip,4,3600)||!await limit(env,'em:'+await hash((env.RATE_SALT||'')+em),2,3600)||!await limit(env,'global_verify',30,86400))return json(req,{error:'verification_rate_limited'},429);
  const existing=await env.DB.prepare('SELECT unsubscribe_cipher FROM subscribers WHERE key_hash=?').bind(k).first();
  const verify=token(),unsub=existing&&existing.unsubscribe_cipher?await unseal(existing.unsubscribe_cipher,env):token(),now=iso(),expire=new Date(Date.now()+1800000).toISOString();
  await env.DB.prepare('INSERT INTO subscribers (key_hash,email,locale,verified,active,verify_hash,verify_expires,unsubscribe_hash,unsubscribe_cipher,created_at,updated_at,consent_at) VALUES (?,?,?,0,0,?,?,?,?,?,?,?) ON CONFLICT(key_hash) DO UPDATE SET email=excluded.email,locale=excluded.locale,verified=0,active=0,verify_hash=excluded.verify_hash,verify_expires=excluded.verify_expires,unsubscribe_hash=excluded.unsubscribe_hash,unsubscribe_cipher=excluded.unsubscribe_cipher,updated_at=excluded.updated_at,consent_at=excluded.consent_at').bind(k,em,l,await hash(verify),expire,await hash(unsub),await seal(unsub,env),now,now,now).run();
  const link=u.origin+'/verify?token='+verify,stop=u.origin+'/unsubscribe?token='+unsub,tt=TEXT[l];
  let id;try{id=await provider(env,em,tt.verify,tt.verifyBody+'\n\n'+link+'\n\n'+tt.stop+': '+stop,`<div dir="${l==='fa'?'rtl':'ltr'}" style="font-family:system-ui,Tahoma;line-height:1.8"><h2>${esc(tt.verify)}</h2><p>${esc(tt.verifyBody)}</p><p><a href="${link}">${esc(tt.confirm)}</a></p><p><a href="${stop}">${esc(tt.stop)}</a></p></div>`,'gr-verify-'+await hash(verify),stop);}catch(e){await remove(env,k);throw e;}
  return json(req,{verification:'provider_accepted',emailVerified:false,providerId:id});
 }
 const s=await env.DB.prepare('SELECT * FROM subscribers WHERE key_hash=?').bind(k).first();
 if(path==='/api/workspace'&&req.method==='DELETE'){await remove(env,k);return json(req,{deleted:true});}
 if(path==='/api/workspace'&&req.method==='GET'){if(!s)return json(req,{verified:false,active:false,tasks:[]});const jobs=await env.DB.prepare('SELECT id,lead_id,step,due,status,attempts,provider_id,sent_at FROM jobs WHERE key_hash=? ORDER BY due').bind(k).all();return json(req,{verified:!!s.verified,active:!!s.active,emailMasked:s.email[0]+'***@'+s.email.split('@')[1],tasks:jobs.results,lastConsent:s.consent_at});}
 if(path==='/api/tasks'&&req.method==='POST'){
  if(!s||!s.verified||!s.active)return json(req,{error:'email_not_verified'},403);if(!ready(env))return json(req,{error:'email_provider_not_configured'},503);
  const b=await body(req);if(!Array.isArray(b.tasks)||b.tasks.length>60)return json(req,{error:'invalid_task_list'},400);
  const jobs=b.tasks.map(x=>({id:x.id,leadId:x.leadId,label:String(x.label||'').slice(0,180),step:x.step,due:x.due}));
  const seen=new Set();for(const x of jobs){if(!/^t_[\w-]{1,40}$/.test(x.id||'')||seen.has(x.id)||! /^(?:IST|TR|IR)-\d{3}$|^PATH-\d{2}$/.test(x.leadId||'')||!STEPS.includes(x.step)||!x.label||!Number.isFinite(Date.parse(x.due))||Date.parse(x.due)<Date.now()-90*86400000||Date.parse(x.due)>Date.now()+730*86400000)return json(req,{error:'invalid_task'},400);seen.add(x.id);x.due=new Date(x.due).toISOString();}
  const stmts=[];stmts.push(env.DB.prepare('DELETE FROM jobs WHERE key_hash=?'+(jobs.length?' AND id NOT IN ('+jobs.map(()=>'?').join(',')+')':'')).bind(k,...jobs.map(x=>x.id)));
  for(const x of jobs)stmts.push(env.DB.prepare("INSERT INTO jobs (key_hash,id,lead_id,label,step,due,status,attempts,next_attempt,updated_at) VALUES (?,?,?,?,?,?,'pending',0,?,?) ON CONFLICT(key_hash,id) DO UPDATE SET lead_id=excluded.lead_id,label=excluded.label,step=excluded.step,status=CASE WHEN jobs.due<>excluded.due THEN 'pending' ELSE jobs.status END,attempts=CASE WHEN jobs.due<>excluded.due THEN 0 ELSE jobs.attempts END,due=excluded.due,next_attempt=CASE WHEN jobs.due<>excluded.due THEN excluded.next_attempt ELSE jobs.next_attempt END,updated_at=excluded.updated_at").bind(k,x.id,x.leadId,x.label,x.step,x.due,iso(),iso()));
  stmts.push(env.DB.prepare('UPDATE subscribers SET locale=?,updated_at=? WHERE key_hash=?').bind(locale(b.locale),iso(),k));await env.DB.batch(stmts);return json(req,{queued:jobs.length,deliveryConfirmed:false,noInstitutionalOutreach:true});
 }
 return json(req,{error:'not_found'},404);
}
async function scheduled(env){if(!env.DB)return;
 await env.DB.prepare('DELETE FROM limits WHERE period<?').bind(Date.now()-172800000).run();
 await env.DB.prepare('DELETE FROM delivery_log WHERE accepted_at<?').bind(new Date(Date.now()-30*86400000).toISOString()).run();
 const stale=await env.DB.prepare('SELECT key_hash FROM subscribers WHERE updated_at<?').bind(new Date(Date.now()-180*86400000).toISOString()).all();for(const x of stale.results)await remove(env,x.key_hash);
 if(!ready(env))return;const now=iso();
 await env.DB.prepare("UPDATE jobs SET status='pending' WHERE status='sending' AND lease_until<?").bind(now).run();
 const result=await env.DB.prepare("SELECT j.*,s.email,s.locale,s.active,s.verified,s.unsubscribe_cipher FROM jobs j JOIN subscribers s ON s.key_hash=j.key_hash WHERE j.status='pending' AND j.due<=? AND j.next_attempt<=? AND j.attempts<3 AND s.active=1 AND s.verified=1 ORDER BY j.due LIMIT 15").bind(now,now).all();
 for(const j of result.results){
  if(!await limit(env,'global_reminders',50,86400))break;
  const claim=await env.DB.prepare("UPDATE jobs SET status='sending',attempts=attempts+1,lease_until=? WHERE key_hash=? AND id=? AND status='pending' AND EXISTS (SELECT 1 FROM subscribers s WHERE s.key_hash=jobs.key_hash AND s.active=1 AND s.verified=1)").bind(new Date(Date.now()+300000).toISOString(),j.key_hash,j.id).run();if(claim.meta.changes!==1)continue;
  try{const l=locale(j.locale),tt=TEXT[l],link=SITE+'/outreach?lead='+encodeURIComponent(j.lead_id)+'&lang='+l+'#desk',due=new Date(j.due).toLocaleString(l==='fa'?'fa-IR':l==='tr'?'tr-TR':'en-GB',{timeZone:'Europe/Istanbul'}),stop=(env.WORKER_URL||'https://greenroot-followups.elasa2next.workers.dev')+'/unsubscribe?token=';
   // Stable one-purpose token, encrypted at rest; older email unsubscribe links remain valid.
   const unsub=await unseal(j.unsubscribe_cipher,env);const unsubURL=stop+unsub;
   const text=tt[j.step]+' — '+j.label+'\n'+due+' (Europe/Istanbul)\n\n'+tt.boundary+'\n\n'+link+'\n\n'+tt.stop+': '+unsubURL;
   const html=`<div dir="${l==='fa'?'rtl':'ltr'}" style="font-family:system-ui,Tahoma;line-height:1.9;color:#153c2b"><h2>${esc(tt.due)}</h2><h3>${esc(tt[j.step])}</h3><p>${esc(j.label)}</p><p>${esc(due)} · Europe/Istanbul</p><p>${esc(tt.boundary)}</p><p><a href="${link}">GreenRoot · دفتر کار · Çalışma alanı</a></p><p><a href="${unsubURL}">${esc(tt.stop)}</a></p></div>`;
   const id=await provider(env,j.email,tt.due,text,html,'gr-task-'+j.key_hash.slice(0,16)+'-'+j.id+'-'+j.due,unsubURL);
   const stillActive=await env.DB.prepare('SELECT active FROM subscribers WHERE key_hash=?').bind(j.key_hash).first();if(!stillActive||!stillActive.active)continue;
   await env.DB.batch([env.DB.prepare("UPDATE jobs SET status='provider_accepted',provider_id=?,sent_at=?,lease_until=NULL WHERE key_hash=? AND id=?").bind(id,iso(),j.key_hash,j.id),env.DB.prepare('INSERT INTO delivery_log (key_hash,job_id,provider_id,accepted_at) VALUES (?,?,?,?)').bind(j.key_hash,j.id,id,iso())]);
  }catch(e){await env.DB.prepare("UPDATE jobs SET status=?,last_error=?,next_attempt=?,lease_until=NULL WHERE key_hash=? AND id=?").bind(j.attempts+1>=3?'failed':'pending',/^provider_\d+$/.test(e.message)?e.message:'send_failed',new Date(Date.now()+1800000).toISOString(),j.key_hash,j.id).run();}
 }

}
export {ready,emailOK,fromOK,handle,scheduled};
// Dedicated SQLite Durable Object: avoids the account's unrelated D1 quota.
// The namespace is new to this project; no other database is modified.
const SCHEMA="-- Private reminder data only: no patient records, documents, drafts or notes.\nCREATE TABLE IF NOT EXISTS subscribers (\n key_hash TEXT PRIMARY KEY,\n email TEXT NOT NULL,\n locale TEXT NOT NULL DEFAULT 'en',\n verified INTEGER NOT NULL DEFAULT 0,\n active INTEGER NOT NULL DEFAULT 0,\n verify_hash TEXT,\n verify_expires TEXT,\n unsubscribe_hash TEXT NOT NULL,\n unsubscribe_cipher TEXT NOT NULL,\n created_at TEXT NOT NULL,\n updated_at TEXT NOT NULL,\n consent_at TEXT NOT NULL\n);\nCREATE INDEX IF NOT EXISTS sub_email ON subscribers(email);\nCREATE UNIQUE INDEX IF NOT EXISTS sub_verify ON subscribers(verify_hash);\nCREATE UNIQUE INDEX IF NOT EXISTS sub_unsubscribe ON subscribers(unsubscribe_hash);\nCREATE TABLE IF NOT EXISTS jobs (\n key_hash TEXT NOT NULL,\n id TEXT NOT NULL,\n lead_id TEXT NOT NULL,\n label TEXT NOT NULL,\n step TEXT NOT NULL,\n due TEXT NOT NULL,\n status TEXT NOT NULL DEFAULT 'pending',\n attempts INTEGER NOT NULL DEFAULT 0,\n next_attempt TEXT NOT NULL,\n lease_until TEXT,\n last_error TEXT,\n provider_id TEXT,\n sent_at TEXT,\n updated_at TEXT NOT NULL,\n PRIMARY KEY(key_hash,id)\n);\nCREATE INDEX IF NOT EXISTS jobs_due ON jobs(status,due,next_attempt);\nCREATE TABLE IF NOT EXISTS limits (bucket TEXT NOT NULL,period INTEGER NOT NULL,n INTEGER NOT NULL,PRIMARY KEY(bucket,period));\nCREATE TABLE IF NOT EXISTS delivery_log (key_hash TEXT NOT NULL,job_id TEXT NOT NULL,provider_id TEXT NOT NULL,accepted_at TEXT NOT NULL);\nCREATE INDEX IF NOT EXISTS log_time ON delivery_log(accepted_at);\n";
class SQLStatement {
 constructor(store,query,args=[]){this.store=store;this.query=query;this.args=args;}
 bind(...args){return new SQLStatement(this.store,this.query,args);}
 async run(){const c=this.store.storage.sql.exec(this.query,...this.args);const results=c.toArray();const n=this.store.storage.sql.exec('SELECT changes() AS n').toArray()[0].n;return {success:true,results,meta:{changes:n}};}
 async first(){const c=this.store.storage.sql.exec(this.query,...this.args);const rows=c.toArray();return rows[0]||null;}
 async all(){return {results:this.store.storage.sql.exec(this.query,...this.args).toArray()};}
}
class SQLAdapter {
 constructor(state){this.state=state;}
 prepare(q){return new SQLStatement(this.state,q);}
 async batch(stmts){return this.state.storage.transactionSync(()=>stmts.map(x=>{const c=this.state.storage.sql.exec(x.query,...x.args);const results=c.toArray();const n=this.state.storage.sql.exec('SELECT changes() AS n').toArray()[0].n;return {success:true,results,meta:{changes:n}};}));}
}
export class ReminderStore {
 constructor(state,env){this.state=state;this.env={...env,DB:new SQLAdapter(state)};state.blockConcurrencyWhile(async()=>{for(const statement of SCHEMA.split(';').map(x=>x.trim()).filter(Boolean))state.storage.sql.exec(statement);});}
 async maintainAlarm(){const n=this.state.storage.sql.exec('SELECT COUNT(*) AS n FROM subscribers').toArray()[0].n;if(n){if(await this.state.storage.getAlarm()===null)await this.state.storage.setAlarm(Date.now()+1800000);}else await this.state.storage.deleteAlarm();}
 async alarm(){try{await scheduled(this.env);}finally{const n=this.state.storage.sql.exec('SELECT COUNT(*) AS n FROM subscribers').toArray()[0].n;if(n)await this.state.storage.setAlarm(Date.now()+1800000);}}
 async fetch(req){try{if(new URL(req.url).pathname==='/internal/alarm-status')return new Response(JSON.stringify({alarm:await this.state.storage.getAlarm()}),{headers:{'Content-Type':'application/json'}});if(new URL(req.url).pathname==='/internal/cron'){await scheduled(this.env);await this.maintainAlarm();return new Response('Checked due tasks');}const result=await handle(req,this.env);await this.maintainAlarm();return result;}catch(e){if(this.env.DEBUG_LOCAL)console.error('LOCAL QA ERROR:',e.message);return json(req,{error:['too_large','invalid_json'].includes(e.message)?e.message:'operation_failed',deliveryConfirmed:false},['too_large','invalid_json'].includes(e.message)?400:502);}}
}
export default {
 async fetch(req,env){if(new URL(req.url).pathname.startsWith('/internal/'))return json(req,{error:'not_found'},404);if(!env.STORE)return json(req,{error:'storage_not_configured'},503);return env.STORE.get(env.STORE.idFromName('greenroot-followups')).fetch(req);},
 async scheduled(event,env,ctx){if(env.STORE)ctx.waitUntil(env.STORE.get(env.STORE.idFromName('greenroot-followups')).fetch('https://internal/internal/cron',{method:'POST'}));}
};
