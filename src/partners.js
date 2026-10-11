/* GreenRoot source-backed partner finder. No network requests or automatic outreach. */
(function(){
'use strict';
var dataEl=document.getElementById('gr-partner-data');
if(!dataEl)return;
var DATA=JSON.parse(dataEl.textContent), ROWS=DATA.contacts, PAGE_SIZE=12;
var ids=new Set(ROWS.map(function(r){return r.id;}));
var saved=new Set();
try{var ss=JSON.parse(localStorage.getItem('gr-partner-saved-v1')||'[]');if(Array.isArray(ss))ss.forEach(function(id){if(ids.has(id))saved.add(id);});}catch(e){}
var state={region:'all',q:'',category:'',place:'',type:'',whatsapp:'',shortlist:false,phone:false,saved:false,sort:'priority',page:1};
var lastLang='', ready=false, current=[], toastTimer;
var categories=['civic','recovery','recycling','environment','employment','research','family'];
var ICON_PATHS={
 civic:'<path d="m3 9 9-5 9 5M3 20h18M5 10v7M10 10v7M14 10v7M19 10v7"/>',
 recovery:'<path d="M20.8 5.5a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.7a5.5 5.5 0 0 0 0-7.8Z"/><path d="M9 11h6m-3-3v6"/>',
 recycling:'<path d="m7 6 3-4 4 6M10 2l-2 6M16 8h5l-3 7M21 8l-6 2M16 20H5l3-7M5 20l-2-5"/>',
 environment:'<path d="M20 3c-9 0-16 3-16 10a7 7 0 0 0 7 7c7 0 9-8 9-17ZM4 21 15 10"/>',
 employment:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 13c5 3 13 3 18 0M10 13v4h4v-4"/>',
 research:'<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 9V3M8 15h8M8 18h2"/>',
 family:'<circle cx="8" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2 21v-5a6 6 0 0 1 12 0v5M15 13a5 5 0 0 1 7 4v4"/>'
};
function svg(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON_PATHS[k]||ICON_PATHS.environment)+'</svg>';}
function esc(s){return String(s===undefined||s===null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function lang(){return ['en','fa','tr'].indexOf(document.documentElement.lang)>-1?document.documentElement.lang:'en';}
function t(k){var l=lang();return (window.I18N[l]&&window.I18N[l][k])||(window.I18N.en&&window.I18N.en[k])||k;}
function n(v){return Number(v).toLocaleString(lang()==='fa'?'fa-IR':'en-US');}
function replace(k,p){var s=t(k);Object.keys(p).forEach(function(key){s=s.replace('{'+key+'}',n(p[key]));});return s;}
function norm(s){return String(s||'').replace(/[۰-۹٠-٩]/g,function(c){return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)>-1?'۰۱۲۳۴۵۶۷۸۹'.indexOf(c):'٠١٢٣٤٥٦٧٨٩'.indexOf(c));}).replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/ı/g,'i').replace(/İ/g,'I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u200c\u200d\u200e\u200f\u0640]/g,'').replace(/[^\p{L}\p{N}]+/gu,'');}
function placeLabel(x){return lang()==='fa'?(window.GR_PLACES_FA[x]||x):x;}
function getName(r){return lang()==='fa'?(r.name_fa||r.name):(r.name_en||r.name);}
function prettyPhone(r){
 var p=r.phone;
 if(!p)return '';
 if(r.phone_scope==='domestic')return p.slice(0,3)+' '+p.slice(3,4)+' '+p.slice(4);
 if(p.indexOf('+90')===0&&p.length===13)return '+90 '+p.slice(3,6)+' '+p.slice(6,9)+' '+p.slice(9,11)+' '+p.slice(11);
 if(p.indexOf('+98')===0&&p.length===13)return '+98 '+p.slice(3,5)+' '+p.slice(5,9)+' '+p.slice(9);
 return p;
}
function toast(text){var el=document.getElementById('pfToast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('show');},3400);}
function copy(text){
 if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);
 return new Promise(function(resolve,reject){
  var a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.top='-9999px';document.body.appendChild(a);a.select();
  try{var ok=document.execCommand('copy');a.remove();ok?resolve():reject(new Error('unavailable'));}catch(e){a.remove();reject(e);}
 });
}
function persist(){try{localStorage.setItem('gr-partner-saved-v1',JSON.stringify(Array.from(saved)));}catch(e){}}
function syncURL(){
 try{
  var u=new URL(location.href),p=u.searchParams;
  ['region','q','category','place','type','whatsapp','shortlist','phone','saved','sort','page'].forEach(function(k){
   var v=state[k];if((k==='region'&&v==='all')||(k==='sort'&&v==='priority')||(k==='page'&&v===1)||v===''||v===false)p.delete(k);else p.set(k,v===true?'1':String(v));
  });
  p.set('lang',lang());history.replaceState(null,'',u.pathname+u.search+u.hash);
 }catch(e){}
}
function loadURL(){
 try{
  var p=new URLSearchParams(location.search);
  if(['istanbul','turkey','iran'].indexOf(p.get('region'))>-1)state.region=p.get('region');
  state.q=(p.get('q')||'').slice(0,160);
  if(categories.indexOf(p.get('category'))>-1)state.category=p.get('category');
  if(['organization','branch','public_unit'].indexOf(p.get('type'))>-1)state.type=p.get('type');
  var place=p.get('place')||'';
  if(ROWS.some(function(r){return place===('d:'+r.district)&&r.region==='istanbul'||place===('c:'+r.city);}))state.place=place;
  state.shortlist=p.get('shortlist')==='1';state.phone=p.get('phone')==='1';state.saved=p.get('saved')==='1';
  if(p.get('sort')==='name')state.sort='name';
  if(['published','not_found','unavailable','directory_only','hq_only'].indexOf(p.get('whatsapp'))>-1)state.whatsapp=p.get('whatsapp');
  state.page=Math.max(1,parseInt(p.get('page')||'1',10)||1);
 }catch(e){}
}
function controlValues(){
 var map={pfSearch:'q',pfCategory:'category',pfPlace:'place',pfType:'type',pfSort:'sort',pfWhatsapp:'whatsapp'};
 Object.keys(map).forEach(function(id){var e=document.getElementById(id);if(e)e.value=state[map[id]];});
 ['Shortlist','PhoneOnly','SavedOnly'].forEach(function(s){var e=document.getElementById('pf'+s);if(e)e.checked=state[{Shortlist:'shortlist',PhoneOnly:'phone',SavedOnly:'saved'}[s]];});
 document.querySelectorAll('[data-pf-region]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.pfRegion===state.region));});
}
function fillPlaces(){
 var el=document.getElementById('pfPlace');
 var arr=ROWS.filter(function(r){return state.region==='all'||r.region===state.region;});
 var places=new Map();
 arr.forEach(function(r){var key=r.region==='istanbul'?'d:'+r.district:'c:'+r.city;places.set(key,r.region==='istanbul'?r.district:r.city);});
 var opts=Array.from(places.entries()).sort(function(a,b){return a[1].localeCompare(b[1],'tr');});
 if(state.place&&!places.has(state.place))state.place='';
 el.innerHTML='<option value="">'+esc(t('pf.placeAll'))+'</option>'+opts.map(function(p){return '<option value="'+esc(p[0])+'">'+esc(placeLabel(p[1]))+'</option>';}).join('');
}
function filter(){
 var q=norm(state.q);
 return ROWS.filter(function(r){
  if(state.region!=='all'&&state.region!==r.region)return false;
  if(state.category&&state.category!==r.category)return false;
  if(state.type&&state.type!==r.type)return false;
  if(state.whatsapp&&state.whatsapp!==r.whatsapp_status)return false;
  if(state.place){var good=state.place==='d:'+r.district&&r.region==='istanbul'||state.place==='c:'+r.city;if(!good)return false;}
  if(state.shortlist&&r.priority!==1)return false;
  if(state.phone&&!r.phone)return false;
  if(state.saved&&!saved.has(r.id))return false;
  if(q){var str=[r.id,r.name,r.name_fa,r.name_en,r.city,r.city_fa,r.district,r.district_fa,r.parent,r.phone,r.phone_raw,r.email,r.category,t('pf.cat.'+r.category),r.ask_en,r.ask_fa,r.ask_tr].join(' ');if(norm(str).indexOf(q)<0)return false;}
  return true;
 }).sort(function(a,b){
  if(state.sort==='priority'&&a.priority!==b.priority)return a.priority-b.priority;
  return getName(a).localeCompare(getName(b),lang()==='fa'?'fa':'tr');
 });
}
function card(r){
 var l=lang(),isSaved=saved.has(r.id),name=getName(r),original= name!==r.name?'<div class="pf-original"><bdi>'+esc(r.name)+'</bdi></div>':'';
 var loc=r.region==='istanbul'?placeLabel(r.city)+' · '+placeLabel(r.district):placeLabel(r.city)+(r.district!==r.city?' · '+placeLabel(r.district):'');
 var sourceLabel=r.evidence==='retrieved_official_page'?t('pf.direct'):r.evidence==='no_public_phone_found'?t('pf.noPhone'):t('pf.indexed');
 var phoneHtml=r.phone?'<a class="pf-phone" href="tel:'+esc(r.phone)+'" aria-label="'+esc(t('pf.call')+' '+prettyPhone(r))+'">'+esc(prettyPhone(r))+'</a><div class="pf-phone-state">'+esc(t('pf.untested'))+'</div>'+(r.phone_scope==='domestic'?'<div class="pf-number-note">'+esc(t('pf.domestic'))+'</div>':'')+'<a class="pf-call" href="tel:'+esc(r.phone)+'">↗ '+esc(t('pf.call'))+'</a>':'<div class="pf-no-phone">'+esc(t('pf.noPhone'))+'</div>';
 var email=r.email?'<a href="mailto:'+esc(r.email)+'" title="'+esc(r.email)+'">'+esc(t('pf.email'))+' ↗</a>':'';
 var note=r['note_'+l]||'';
 var wa='<div class="pf-wa"><b>'+esc(t('wa.label'))+'</b><p>'+esc(t('wa.'+r.whatsapp_status))+'</p>';
 if(r.whatsapp_status==='published'){
  var ch=r.whatsapp_channels[0];
  wa+='<a href="'+esc(ch.source)+'" target="_blank" rel="noopener noreferrer">'+esc(t('wa.source'))+' ↗</a><p class="pf-wa-purpose">'+esc(t(r.whatsapp_purpose==='support_not_business'?'wa.support':r.whatsapp_purpose==='public_service_not_business_confirmed'?'wa.service':'wa.purpose'))+'</p>';
 }
 wa+='</div><a class="pf-plan-contact" href="outreach.html?lead='+esc(r.id)+'&amp;lang='+l+'#desk">'+esc(t('wa.plan'))+' →</a>';
 var parent=r.type!=='organization'?'<div class="pf-parent">'+esc(t('pf.parent'))+': <bdi>'+esc(r.parent)+'</bdi></div>':'';
 return '<article class="pf-card" id="'+esc(r.id)+'" data-category="'+esc(r.category)+'">'+
 '<div class="pf-card-head"><div><div class="pf-card-id">'+esc(r.id)+'</div><div class="pf-cat-icon">'+svg(r.category)+'</div></div><button class="pf-save" type="button" data-pf-save="'+esc(r.id)+'" aria-pressed="'+isSaved+'" aria-label="'+esc((isSaved?t('pf.unsave'):t('pf.save'))+' '+name)+'"><svg viewBox="0 0 24 24" fill="'+(isSaved?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9L6.5 20l1-6.2L3 9.6l6.2-.9Z"/></svg>'+esc(isSaved?t('pf.unsave'):t('pf.save'))+'</button></div>'+
 '<h3>'+esc(name)+'</h3>'+original+
 '<div class="pf-location"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M16 8c0 5-6 10-6 10S4 13 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg>'+esc(loc)+'</div>'+
 '<div class="pf-labels"><span>'+esc(t('pf.cat.'+r.category))+'</span><span>'+esc(t('pf.type.'+r.type))+'</span>'+(r.priority===1?'<span class="pf-priority">'+esc(t('pf.start'))+'</span>':'')+'</div>'+parent+
 '<div class="pf-ask"><strong>'+esc(t('pf.ask'))+'</strong>'+esc(r['ask_'+l]||r.ask_en)+'</div><div class="pf-phonebox">'+phoneHtml+
 '<div class="pf-links">'+email+'<a href="'+esc(r.website)+'" target="_blank" rel="noopener noreferrer">'+esc(t('pf.website'))+' ↗</a><button class="pf-copy" type="button" data-pf-copy="'+esc(r.id)+'">'+esc(t('pf.copy'))+'</button></div>'+ (note?'<p class="pf-card-note">'+esc(note)+'</p>':'')+
 wa+'<div class="pf-card-source"><span>'+esc(t('pf.checked'))+'</span><a href="'+esc(r.source)+'" target="_blank" rel="noopener noreferrer">['+esc(r.source_ref||1)+'] '+esc(t('pf.source'))+' ↗</a></div><div class="pf-evidence">'+esc(sourceLabel)+'</div></div></article>';
}
function render(){
 if(!ready)return;
 fillPlaces();controlValues();current=filter();
 var pages=Math.max(1,Math.ceil(current.length/PAGE_SIZE));state.page=Math.min(state.page,pages);
 var start=(state.page-1)*PAGE_SIZE,end=Math.min(start+PAGE_SIZE,current.length),subset=current.slice(start,end);
 document.getElementById('pfCards').innerHTML=subset.length?subset.map(card).join(''):'<div class="pf-empty">'+esc(t('pf.empty'))+'</div>';
 document.getElementById('pfResultCount').textContent=replace('pf.results',{n:current.length,p:new Set(current.map(function(r){return r.parent;})).size});
 document.getElementById('pfSavedCount').textContent=replace('pf.savedCount',{n:saved.size});
 document.getElementById('pfPageStatus').textContent=replace('pf.page',{p:state.page,n:pages});
 document.getElementById('pfShowing').textContent=replace('pf.showing',{a:current.length?start+1:0,b:end,n:current.length});
 document.getElementById('pfPrev').disabled=state.page<=1;document.getElementById('pfNext').disabled=state.page>=pages;
 document.getElementById('pfExport').disabled=!current.length;
 var l=lang();
 if(l!==lastLang){document.getElementById('pfMessage').value=window.GR_MESSAGES[l]||window.GR_MESSAGES.en;lastLang=l;}
 syncURL();
}
function change(k,value){state[k]=value;state.page=1;render();}
function contactText(r){return [r.id+' — '+r.name,placeLabel(r.city)+' / '+placeLabel(r.district),t('pf.type.'+r.type)+' — '+r.parent,r.phone||t('pf.noPhone'),r.email,r.website,t('pf.source')+': '+r.source,t('pf.checked'),t('pf.untested'),t('wa.'+r.whatsapp_status),r['ask_'+lang()]].filter(Boolean).join('\n');}
function csvsafe(x){x=String(x===undefined||x===null?'':x);if(/^[\s]*[=+\-@]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"';}
function exportCSV(){
 var cols=['id','name','name_fa','name_en','region','city','district','parent','type','category','phone','phone_scope','email','website','source','checked','evidence','phone_called','priority','ask_'+lang(),'note_'+lang(),'whatsapp_status','whatsapp_checked','whatsapp_purpose','whatsapp_account_tested','outreach_profile','fit_level','message_subject_'+lang(),'message_'+lang(),'partnership'];
 var str='\uFEFF'+cols.map(csvsafe).join(',')+'\r\n'+current.map(function(r){return cols.map(function(k){return csvsafe(r[k]);}).join(',');}).join('\r\n');
 var blob=new Blob([str],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='GreenRoot-'+state.region+'-'+current.length+'-leads.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function init(){
 if(ready)return;ready=true;loadURL();
 if(window.matchMedia('(max-width:760px)').matches)document.getElementById('pfAdvanced').open=false;
 document.querySelectorAll('[data-pf-region]').forEach(function(b){b.addEventListener('click',function(){change('region',b.dataset.pfRegion);});});
 document.querySelectorAll('[data-pf-jump]').forEach(function(a){a.addEventListener('click',function(){change('region',a.dataset.pfJump);});});
 var debounce;
 document.getElementById('pfSearch').addEventListener('input',function(e){var val=e.target.value;clearTimeout(debounce);debounce=setTimeout(function(){change('q',val);},150);});
 var m={pfCategory:'category',pfPlace:'place',pfType:'type',pfSort:'sort',pfWhatsapp:'whatsapp'};
 Object.keys(m).forEach(function(id){document.getElementById(id).addEventListener('change',function(e){change(m[id],e.target.value);});});
 var checks={pfShortlist:'shortlist',pfPhoneOnly:'phone',pfSavedOnly:'saved'};
 Object.keys(checks).forEach(function(id){document.getElementById(id).addEventListener('change',function(e){change(checks[id],e.target.checked);});});
 document.getElementById('pfReset').addEventListener('click',function(){state={region:'all',q:'',category:'',place:'',type:'',whatsapp:'',shortlist:false,phone:false,saved:false,sort:'priority',page:1};render();});
 document.getElementById('pfCards').addEventListener('click',function(e){
  var b=e.target.closest('[data-pf-save]');if(b){var id=b.dataset.pfSave;saved.has(id)?saved.delete(id):saved.add(id);persist();render();return;}
  b=e.target.closest('[data-pf-copy]');if(b){var r=ROWS.find(function(x){return x.id===b.dataset.pfCopy;});if(r)copy(contactText(r)).then(function(){toast(t('pf.copied'));}).catch(function(){toast(t('pf.copyFailed'));});}
 });
 ['pfPrev','pfNext'].forEach(function(id){document.getElementById(id).addEventListener('click',function(){state.page+=id==='pfPrev'?-1:1;render();document.getElementById('pfResults').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});});});
 document.getElementById('pfExport').addEventListener('click',exportCSV);
 document.getElementById('pfMessageCopy').addEventListener('click',function(){copy(document.getElementById('pfMessage').value).then(function(){toast(t('pf.copied'));}).catch(function(){toast(t('pf.copyFailed'));});});
 window.addEventListener('popstate',function(){loadURL();render();});
 render();
}
// The existing site i18n engine dispatches this after each language switch.
document.addEventListener('greenroot:language',function(){if(ready)render();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
