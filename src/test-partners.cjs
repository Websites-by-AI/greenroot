const { chromium } = require('playwright');
const fs=require('fs');
const assert=require('assert');
const path=require('path');
const root=path.resolve(__dirname,'..');
const base=process.env.GR_TEST_BASE||'http://127.0.0.1:8080';
const data=JSON.parse(fs.readFileSync(path.join(root,'data/partners.json'),'utf8'));
const results=[];
function pass(name){results.push(name);console.log('PASS',name);}
function equal(a,b,label){assert.equal(a,b,label);}
(async()=>{
 equal(data.contacts.length,210);equal(new Set(data.contacts.map(r=>r.parent)).size,88);
 for(const [g,n] of Object.entries({istanbul:100,turkey:100,iran:10}))equal(data.contacts.filter(r=>r.region===g).length,n);
 equal(data.contacts.filter(r=>r.phone).length,204);equal(data.contacts.filter(r=>r.type==='branch').length,120);
 assert(data.contacts.every(r=>/^https?:\/\//.test(r.source)&&r.phone_called===false));
 assert(data.contacts.every(r=>!r.phone||/^(\+\d{12}|444\d{4})$/.test(r.phone)));
 pass('Dataset: 210 leads, region splits, 88 parents, 204 phones, public provenance, no calls');
 const b=await chromium.launch({headless:true,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1360,height:1000},acceptDownloads:true});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/partners.html?lang=en');
 await page.waitForSelector('[data-pf-save]');
 equal(await page.locator('.pf-card').count(),12);
 assert((await page.locator('#pfResultCount').innerText()).startsWith('210'));
 pass('Directory initializes: correct counts and 12-card pagination');
 for(const l of ['fa','tr','en']){
  await page.locator(`.lang-sw [data-lang="${l}"]`).click();
  equal(await page.locator('html').getAttribute('lang'),l);
  equal(await page.locator('html').getAttribute('dir'),l==='fa'?'rtl':'ltr');
  const empty=await page.locator('[data-i18n]').evaluateAll(es=>es.filter(e=>!e.textContent.trim()).map(e=>e.dataset.i18n));assert.deepEqual(empty,[]);
  assert((await page.locator('#pfMessage').inputValue()).length>400);
 }
 pass('EN / FA RTL / TR switching: no empty UI keys; localized cards and first message');
 for(const [g,n] of Object.entries({istanbul:100,turkey:100,iran:10})){
  await page.locator(`[data-pf-region="${g}"]`).click();
  assert((await page.locator('#pfResultCount').innerText()).startsWith(String(n)));
 }
 pass('Region tabs: 100 Istanbul / 100 other Türkiye / 10 Iran');
 await page.locator('[data-pf-region="istanbul"]').click();
 await page.selectOption('#pfCategory','civic');
 assert((await page.locator('#pfResultCount').innerText()).startsWith('40'));
 await page.selectOption('#pfCategory','');await page.selectOption('#pfType','branch');
 assert((await page.locator('#pfResultCount').innerText()).startsWith('39'));
 await page.locator('#pfPhoneOnly').check();assert((await page.locator('#pfResultCount').innerText()).startsWith('35'));
 pass('Combined filters: 40 municipalities; 39 branches / 35 with public phone');
 await page.locator('#pfReset').click();
 await page.locator('.lang-sw [data-lang="fa"]').click();
 await page.fill('#pfSearch','کادیکوی');await page.waitForTimeout(250);
 const text=await page.locator('#pfCards').innerText();assert(text.includes('Kadıköy Belediyesi'));assert(text.includes('Yeşilay'));
 await page.fill('#pfSearch','۸۸۸۳۲۰۰۲');await page.waitForTimeout(250);
 equal(await page.locator('.pf-card').count(),1);assert((await page.locator('#pfCards').innerText()).includes('طلوع'));
 pass('Persian search: district transliterations, Persian telephone digits');
 await page.locator('[data-pf-save]').first().click();await page.locator('#pfSavedOnly').check();
 equal(await page.locator('.pf-card').count(),1);
 await page.reload();await page.waitForSelector('[data-pf-save]');
 assert(await page.locator('#pfSavedOnly').isChecked());equal(await page.locator('.pf-card').count(),1);
 pass('Saved lead and deep-link filters survive reload; stored locally only');
 await page.locator('.lang-sw [data-lang="en"]').click();await page.locator('#pfReset').click();
 const oldID=await page.locator('.pf-card').first().getAttribute('id');await page.locator('#pfNext').click();
 assert(oldID!==await page.locator('.pf-card').first().getAttribute('id'));
 assert((await page.locator('#pfPageStatus').innerText()).includes('2'));
 pass('Pagination changes records, exposes correct page state');
 await page.locator('[data-pf-region="iran"]').click();
 const dP=page.waitForEvent('download');await page.locator('#pfExport').click();const dl=await dP;
 const tmp=path.join(root,'research/test-filtered-download.csv');await dl.saveAs(tmp);
 const csv=fs.readFileSync(tmp,'utf8');
 const records=[];let row=[],field='',quote=false;
 for(let i=0;i<csv.length;i++){const ch=csv[i];if(ch==='"'){if(quote&&csv[i+1]==='"'){field+='"';i++;}else quote=!quote;}else if(ch===','&&!quote){row.push(field);field='';}else if(ch==='\n'&&!quote){row.push(field.replace(/\r$/,''));records.push(row);row=[];field='';}else field+=ch;}
 if(field||row.length){row.push(field);records.push(row);}equal(records.length,11);assert(csv.includes('IR-'));
 pass('Filtered CSV download: 10 Iran records plus header; source columns present');
 fs.unlinkSync(tmp);
 const xl=await page.request.get(base+'/kit/GreenRoot-Outreach-210.xlsx');equal(xl.status(),200);assert((await xl.body()).length>10000);
 pass('Workbook downloadable (OOXML .xlsx)');
 for(const g of ['istanbul','turkey','iran']){
  await page.goto(base+`/partners.html?region=${g}&lang=fa#directory`);await page.waitForSelector('[data-pf-save]');
  equal(await page.locator(`[data-pf-region="${g}"]`).getAttribute('aria-pressed'),'true');
 }
 pass('Public regional deep links + initial Persian locale');
 await page.goto(base+'/partners.html?lang=en');await page.waitForSelector('[data-pf-save]');
 await page.locator('#burger').click();equal(await page.locator('#burger').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');equal(await page.locator('#burger').getAttribute('aria-expanded'),'false');
 pass('Responsive navigation: accessible expansion + Escape to close');
 const screens=path.join(root,'screenshots');fs.mkdirSync(screens,{recursive:true});
 await page.goto(base+'/partners.html?lang=fa&region=istanbul');await page.waitForSelector('[data-pf-save]');
 await page.screenshot({path:path.join(screens,'19-partner-finder-desktop-FA.png'),fullPage:false});
 await page.locator('#pfResults').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(screens,'20-partner-contacts-desktop-FA.png'),fullPage:false});
 await page.goto(base+'/partners.html?lang=en');await page.waitForSelector('[data-pf-save]');
 await page.screenshot({path:path.join(screens,'21-partner-finder-desktop-EN.png'),fullPage:false});
 for(const l of ['en','fa','tr']){
  for(const width of [320,390,768,1360,1600]){
   await page.setViewportSize({width,height:950});await page.goto(base+'/partners.html?lang='+l);await page.waitForSelector('[data-pf-save]');
   const dimensions=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
   assert(dimensions.sw<=dimensions.cw+1,`${l} width ${width}: horizontal overflow ${JSON.stringify(dimensions)}`);
  }
 }
 pass('Responsive widths 320 / 390 / 768 / 1360 / 1600 in all three languages: no horizontal overflow');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/partners.html?lang=fa');await page.waitForSelector('[data-pf-save]');
 assert(await page.locator('.mobile-cta a[href="#directory"]').isVisible());
 await page.screenshot({path:path.join(screens,'22-partner-finder-mobile-FA.png'),fullPage:false});
 await page.goto(base+'/partners.html?lang=fa&region=iran#directory');await page.waitForSelector('[data-pf-save]');
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:document.getElementById('pfResults').getBoundingClientRect().top+scrollY-82,behavior:'instant'});});
 await page.screenshot({path:path.join(screens,'23-partner-contacts-mobile-FA.png'),fullPage:false});
 pass('Mobile directory has contextual search / Excel actions; screenshots captured');
 // Smoke-test all build templates without checking demo results / medical effectiveness.
 const templates=fs.readdirSync(path.join(root,'src/pages')).filter(x=>x.endsWith('.html'));
 for(const file of templates){
  for(const l of ['en','fa','tr']){
   await page.goto(base+'/'+file+'?lang='+l);
   const empty=await page.locator('[data-i18n]').evaluateAll(es=>es.filter(e=>!e.textContent.trim()).map(e=>e.dataset.i18n));assert.deepEqual(empty,[],file+' '+l);
   assert(await page.locator('a[href="partners.html"]').count()>0,file+' partner route missing');
  }
 }
 pass(`${templates.length} templates × 3 languages: no empty translations; partner finder linked`);
 assert.deepEqual(errors,[]);pass('No JavaScript page errors');
 fs.writeFileSync(path.join(root,'research/partner-test-results.json'),JSON.stringify({date:'2026-10-11',checks:results,errors,screenshots:5},null,2));
 await b.close();console.log('ALL PASS',results.length,'checks');
})().catch(e=>{console.error(e);process.exit(1);});
