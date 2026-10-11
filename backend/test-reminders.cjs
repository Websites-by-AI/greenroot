/* Local transport MOCKS only. No real email account, recipient, delivery or outreach. */
const {Miniflare,createFetchMock}=require('miniflare');
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const results=[];function pass(x){results.push(x);console.log('PASS',x);}
(async()=>{
 const sent=[],captures=[],agent=createFetchMock();agent.disableNetConnect();
 agent.get('https://api.resend.com').intercept({path:'/emails',method:'POST'}).reply(200,opts=>{captures.push(new Response(opts.body).text().then(JSON.parse));return JSON.stringify({id:'SIMULATED_PROVIDER_ACCEPTANCE_'+captures.length});},{headers:{'content-type':'application/json'}}).persist();
 async function captured(){const all=await Promise.all(captures);sent.splice(0,sent.length,...all);}
 const m=new Miniflare({modules:true,script:fs.readFileSync(path.join(__dirname,'worker.mjs'),'utf8'),compatibilityDate:'2026-05-03',durableObjects:{STORE:{className:'ReminderStore',useSQLite:true}},bindings:{DEBUG_LOCAL:'true',RATE_SALT:'local-testing-only-no-real-secrets-in-this-test-fixture-123456789012345',RESEND_API_KEY:'simulated-not-a-real-email-key',EMAIL_FROM:'onboarding@resend.dev',TEST_RECIPIENT:'local-test@example.org'},fetchMock:agent});await m.ready;
 const key=crypto.randomBytes(32).toString('base64url'),h={Authorization:'Bearer '+key,'Content-Type':'application/json'};
 let r=await m.dispatchFetch('https://local/api/status');assert.equal(r.status,200);assert((await r.json()).configured);pass('Local worker, private SQLite adapter and owner-only setup are initialized');
 r=await m.dispatchFetch('https://local/api/workspace');assert.equal(r.status,401);
 r=await m.dispatchFetch('https://local/api/tasks',{method:'POST',headers:h,body:'{"tasks":[]}'});assert.equal(r.status,403);pass('Anonymous workspace reads and unverified task sync rejected');
 r=await m.dispatchFetch('https://local/api/email/connect',{method:'POST',headers:{...h,Origin:'https://untrusted.example'},body:'{}'});assert.equal(r.status,403);pass('Untrusted origin rejected');
 r=await m.dispatchFetch('https://local/api/email/connect',{method:'POST',headers:h,body:JSON.stringify({email:'another@example.org',consent:true})});assert.equal(r.status,403);assert.equal(sent.length,0);pass('Owner-only mode cannot mail another address');
 r=await m.dispatchFetch('https://local/api/email/connect',{method:'POST',headers:h,body:JSON.stringify({email:'local-test@example.org',consent:false})});assert.equal(r.status,400);pass('Explicit reminder consent required');
 r=await m.dispatchFetch('https://local/api/email/connect',{method:'POST',headers:h,body:JSON.stringify({email:'local-test@example.org',consent:true,locale:'fa'})});assert.equal(r.status,200);await captured();assert.equal(sent.length,1);assert.equal(sent[0].to[0],'local-test@example.org');assert.equal((await r.json()).verification,'provider_accepted');pass('MOCK verification message goes to owner only, not any institution');
 const verify=sent[0].text.match(/https:\/\/local\/verify\?token=([\w-]+)/)[0],unsub=sent[0].text.match(/https:\/\/local\/unsubscribe\?token=([\w-]+)/)[0];
 r=await m.dispatchFetch(verify);assert.equal(r.status,200);assert((await r.text()).includes('method="POST"'));
 r=await m.dispatchFetch('https://local/api/workspace',{headers:h});assert(!(await r.json()).verified);pass('Link scanner GET does not activate email');
 r=await m.dispatchFetch(verify,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'token='+new URL(verify).searchParams.get('token')});assert.equal(r.status,200);
 r=await m.dispatchFetch('https://local/api/workspace',{headers:h});let own=await r.json();assert(own.verified&&own.active);pass('Explicit verification POST activates only the authenticated owner workspace');
 const ns=await m.getDurableObjectNamespace('STORE'),stub=ns.get(ns.idFromName('greenroot-followups'));
 r=await stub.fetch('https://internal/internal/alarm-status');let alarm=(await r.json()).alarm;assert(alarm>Date.now()&&alarm<Date.now()+31*60000);pass('Persistent alarm armed independently of the browser / account cron quota');
 const job={id:'t_simulated_due_task',leadId:'IST-010',label:'University office — SIMULATED LOCAL QA ONLY',step:'check_reply',due:new Date(Date.now()-1000).toISOString()};
 r=await m.dispatchFetch('https://local/api/tasks',{method:'POST',headers:h,body:JSON.stringify({locale:'fa',tasks:[job],privateNote:'THIS FIELD MUST NEVER BE EMAILED'})});assert.equal(r.status,200);assert.equal((await r.json()).queued,1);pass('Verified task queue accepts minimal data; no institution message is sent');
 r=await m.dispatchFetch('https://local/internal/cron',{method:'POST'});assert.equal(r.status,404);pass('Public route cannot trigger sending / internal alarm operations');
 r=await stub.fetch('https://internal/internal/cron',{method:'POST'});assert.equal(r.status,200);await captured();assert.equal(sent.length,2);assert.equal(sent[1].to[0],'local-test@example.org');assert(!sent[1].text.includes('THIS FIELD'));assert(sent[1].text.includes('IST-010'));pass('MOCK due reminder: owner only, no notes/documents, no external filing');
 r=await stub.fetch('https://internal/internal/cron',{method:'POST'});assert.equal(sent.length,2);pass('Completed provider acceptance is not resent on the next tick');
 r=await m.dispatchFetch('https://local/api/workspace',{headers:h});own=await r.json();assert.equal(own.tasks[0].status,'provider_accepted');assert(!('deliveryConfirmed' in own.tasks[0]));pass('Provider acceptance is recorded, not invented delivery / reading');
 assert(sent[1].text.includes(new URL(unsub).searchParams.get('token')));pass('Original unsubscribe link remains valid after a reminder (encrypted stable token)');
 r=await m.dispatchFetch(unsub,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'List-Unsubscribe=One-Click'});assert.equal(r.status,200);
 r=await m.dispatchFetch('https://local/api/workspace',{headers:h});own=await r.json();assert(!own.verified&&!own.active&&own.tasks.length===0);r=await stub.fetch('https://internal/internal/alarm-status');assert.equal((await r.json()).alarm,null);pass('Unsubscribe deletes application records and disarms the idle timer');
 await m.dispose();await agent.close();
 fs.mkdirSync(path.join(__dirname,'../research'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../research/reminder-test-results.json'),JSON.stringify({date:'2026-10-11',checks:results,transport:'LOCAL MOCKS; no real messages delivered',localRuntimeCompatibility:'2026-05-03 (local emulator maximum); production 2026-10-11',realEmailDeliveryTested:false},null,2));console.log('ALL PASS',results.length,'backend checks; REAL EMAILS SENT: 0');
})().catch(e=>{console.error(e);process.exit(1)});
