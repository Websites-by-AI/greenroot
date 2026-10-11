/* GreenRoot app: i18n engine, nav, counters, reveal, chat, career, mood, charts, form */
(function(){
"use strict";

/* ---------- safe storage ---------- */
var store = (function(){ try{ var s=window.localStorage; s.setItem("__gr","1"); s.removeItem("__gr"); return s; }catch(e){ return null; } })();

/* ---------- language ---------- */
var lang = "en";
var saved = store ? store.getItem("gr-lang") : null;
if (saved && ["en","fa","tr"].indexOf(saved)>-1) lang = saved;
else {
  var nav3 = (navigator.language||"");
  if (nav3.indexOf("fa")===0) lang = "fa";
  else if (nav3.indexOf("tr")===0) lang = "tr";
}

function t(k){
  var d = I18N[lang] || I18N.en;
  if (d[k]!==undefined) return d[k];
  if (I18N.en[k]!==undefined) return I18N.en[k];
  return "";
}
function fmt(n){ return n.toLocaleString("en-US"); }
var raf = (window.requestAnimationFrame
  ? function(f){ return window.requestAnimationFrame(f); }
  : function(f){ return setTimeout(function(){ f(Date.now()); }, 16); });
function safe(fn){ try{ fn(); }catch(e){ if (window.console) console.warn("GreenRoot init:", e); } }
function mergeTr(){
  var X = window.GR_EXTRA_TR;
  if (!X) return;
  CHAT_GREETING.tr = X.greeting;
  CHAT_FALLBACK.tr = X.fallback;
  X.chips.forEach(function(c){
    var dst = CHAT_CHIPS.find(function(x){ return x.id===c.id; });
    if (dst) dst.tr = c.tr;
  });
  Object.keys(X.intents).forEach(function(id){
    var dst = CHAT_INTENTS.find(function(x){ return x.id===id; });
    if (dst) dst.r.tr = X.intents[id];
  });
  Object.keys(X.career||{}).forEach(function(job){
    var s = X.career[job], d = CAREER_PLANS[job];
    if (d){ d.title.tr=s.title; d.s1.tr=s.s1; d.s2.tr=s.s2; d.s3.tr=s.s3; d.story.tr=s.story; }
  });
}

function applyLang(){
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang==="fa") ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(function(el){
    el.innerHTML = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(function(el){
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  document.querySelectorAll(".lang-sw .lang").forEach(function(b){
    b.classList.toggle("on", b.getAttribute("data-lang")===lang);
  });
  /* COP31 countdown */
  var days = Math.max(0, Math.ceil((new Date(2026,10,9) - new Date())/86400000));
  document.querySelectorAll("[data-cop-days]").forEach(function(elm){
    elm.textContent = t("cop.countdown").replace("{d}", days);
  });
  var page = document.body.getAttribute("data-page");
  if (page && t("title."+page)) document.title = t("title."+page);
  var cs = document.getElementById("chatShellDir");
  if (page==="ai") renderChips();
  applyChatDir();
  if (page==="dashboard" && document.getElementById("chartMonthly")) initDashboard();
  var file = (page === "home" ? "index" : page) + ".html";
  document.querySelectorAll(".links a").forEach(function(a){
    a.classList.toggle("active", a.getAttribute("href") === file);
  });
}

function setLang(l){
  lang = l;
  if (store) try{ store.setItem("gr-lang", l); }catch(e){}
  safe(applyLang);
}

document.addEventListener("DOMContentLoaded", function(){
  safe(mergeTr);
  safe(applyLang);

  document.querySelectorAll(".lang-sw .lang").forEach(function(b){
    b.addEventListener("click", function(){ setLang(b.getAttribute("data-lang")); });
  });

  /* burger */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  if (burger && nav){
    burger.addEventListener("click", function(){ nav.classList.toggle("open"); });
    nav.querySelectorAll(".links a").forEach(function(a){
      a.addEventListener("click", function(){ nav.classList.remove("open"); });
    });
  }

  /* footer year */
  document.querySelectorAll("#year").forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* reveal on scroll */
  var rvs = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, {threshold:.12});
    rvs.forEach(function(el){ io.observe(el); });
  } else { rvs.forEach(function(el){ el.classList.add("in"); }); }

  /* animated counters */
  function runCounter(el){
    var target = parseFloat(el.getAttribute("data-count"))||0;
    var pre = el.getAttribute("data-prefix")||"", suf = el.getAttribute("data-suffix")||"";
    var dur = 1500, t0 = null;
    function step(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts-t0)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = pre + fmt(Math.round(target*eased)) + suf;
      if (p<1) raf(step);
    }
    raf(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ safe(function(){ runCounter(e.target); }); cio.unobserve(e.target); } });
    }, {threshold:.4});
    counters.forEach(function(el){ cio.observe(el); });
  } else { counters.forEach(function(el){ safe(function(){ runCounter(el); }); }); }

  /* page inits */
  var page = document.body.getAttribute("data-page");
  safe(function(){
    if (page==="ai") initAI();
    if (page==="dashboard") initDashboard();
    if (page==="join") initJoin();
  });
});

/* ============================================================
   Raha chat (AI page)
============================================================ */
var CHAT_INTENTS = [
  { id:"crisis",
    kw:["suicide","kill myself","overdose","end it","خودکشی","اوردوز","مردن","تموم کنم","نابود","intihar","aşırı doz","bitirmek istiyorum"],
    r:{ en:"I'm really glad you told me. Please reach a human right now:\n• Your local emergency number (DE: 112 · IR: 123)\n• Iran addiction hotline: 09628\n• Your GreenRoot counselor — number is on your card.\nYou are not alone, and this moment will pass. Stay with me — then call.",
        fa:"خیلی خوشحالم که گفتی. لطفاً همین حالا به یک انسان وصل شو:\n• شمارهٔ اورژانس محلی (آلمان: ۱۱۲ · ایران: ۱۲۳)\n• خط اعتیاد ایران: ۰۹۶۲۸\n• شمارهٔ مشاور گرین‌روت روی کارتت هست.\nتنها نیستی و این لحظه رد می‌شود. با من بمون — بعد زنگ بزن." } },
  { id:"craving",
    kw:["craving","crave","urge","relapse now","using again","هوس","کشش","میل","لغزش","مصرف","kriz","canım çekti","kullanmak istiyorum"],
    r:{ en:"Craving noticed — that's already a win. Let's ride the wave:\n1. Put the thought on a 10-minute timer.\n2. 4-7-8 breathing ×3 with me: in 4… hold 7… out 8…\n3. Walk toward a crew member or call your buddy.\nCravings peak and pass — usually under 20 minutes. I'm staying right here.",
        fa:"هوس رو شنیدم — همین که گفتی یعنی یک برد. موج رو سوار بشیم:\n۱. فکر رو روی تایمر ۱۰ دقیقه‌ای بذار.\n۲. سه بار تنفس ۴-۷-۸ با من: دم ۴… نگه ۷… بازدم ۸…\n۳. برو سمت یکی از اعضای تیم یا به همراهت زنگ بزن.\nهوس اوج می‌گیره و رد می‌شه — معمولاً زیر ۲۰ دقیقه. من همین‌جام." } },
  { id:"mood",
    kw:["sad","depress","low","lonely","tired","empty","anxious","غم","افسر","تنها","خسته","حالم","اضطراب","نگران","mutsuz","yalnızım","kötüyüm","yorgunum","kaygılı"],
    r:{ en:"Thanks for telling me. Low days are data, not failure.\n• Today's shift is optional — rest is treatment too.\n• Want me to draft a message to your counselor?\n• One small thing: water, window, 5 slow breaths. That's enough for now.",
        fa:"ممنون که گفتی. روزهای پایین، داده‌ان نه شکست.\n• شیفت امروز اختیاریه — استراحت هم بخشی از درمانه.\n• برات یک پیام برای مشاورت بنویسم؟\n• یک کار کوچک: آب، پنجره، ۵ نفس آروم. فعلاً همین کافیه." } },
  { id:"career",
    kw:["job","career","work again","cv","resume","interview","شغل","کار","رزومه","مصاحبه","حرفه","kariyer","meslek","mülakat","özgeçmiş"],
    r:{ en:"Career rewind is my favourite topic 💼 Your plan has 3 steps: skill map → paid refresh role inside the program → placement with a partner employer.\nTell me your old job — driver, nurse, accountant, mechanic, teacher, cook — or try the Career rewind demo below the chat.",
        fa:"بازگشت شغلی موضوع موردعلاقه‌ام هست 💼 طرحت ۳ قدم داره: نقشهٔ مهارت → نقشِ تمرینیِ حقوق‌دار در برنامه → قرارگیری در یک کارفرمای شریک.\nشغل قبلیت رو بگو — راننده، پرستار، حسابدار، مکانیک، معلم، آشپز — یا دموی «بازگشت شغلی» زیر چت رو امتحان کن." } },
  { id:"balance",
    kw:["token","balance","reward","point","wallet","توکن","موجودی","پاداش","امتیاز","کیف","jeton","bakiye","cüzdan"],
    r:{ en:"Token balance: 340 🪙\n• This week: +60 (3 shifts)\n• Available rewards: bus pass (40) · phone credit (25) · welding course (220)\nTip: set a goal in the wallet — goals roughly double follow-through.",
        fa:"موجودی توکن: 340 🪙\n• این هفته: +60 (۳ شیفت)\n• پاداش‌های موجود: کارت اتوبوس (40) · شارژ (25) · دورهٔ جوشکاری (220)\nپیشنهاد: در کیف، یک هدف بذار — هدف‌گذاری پیگیری رو تقریباً دوبرابر می‌کنه." } },
  { id:"schedule",
    kw:["schedule","shift","time","plan","when","برنامه","شیفت","ساعت","کی","وقت","vardiya","bu hafta"],
    r:{ en:"This week's plan:\n• Mon / Wed / Fri 08:00 — cleanup shift (meet at the depot)\n• Tue 17:00 — group therapy\n• Thu 16:00 — Raha session + skills class\nRain plan: indoor sorting line. Missed a day? It happens — tell your mentor, your place is safe.",
        fa:"برنامهٔ این هفته:\n• دوشنبه / چهارشنبه / جمعه 08:00 — شیفت پاک‌سازی (قرار مقابل انبار)\n• سه‌شنبه 17:00 — گروه‌درمانی\n• پنجشنبه 16:00 — جلسهٔ رها + کلاس مهارت\nبرنامهٔ بارونی: خط جداسازی سرپوشیده. یه روز جا موندی؟ پیش میاد — به مربیت بگو، جایگاهت محفوظه." } },
  { id:"trash",
    kw:["trash","waste","recycl","collect","زباله","بازیافت","جمع","çöp","atık"],
    r:{ en:"Today's crews collected 214 kg: 96 kg PET · 41 kg metal · 52 kg paper · 25 kg glass.\nThat's about €118 to the treatment fund — and enough flake for 3 face shields heading to the workshop. You make that happen.",
        fa:"تیم‌های امروز ۲۱۴ کیلو جمع کردند: ۹۶ کیلو پت · ۴۱ فلز · ۵۲ کاغذ · ۲۵ شیشه.\nیعنی حدود €118 به صندوق درمان — و خردِ کافی برای ۳ شیلد صورت به سمت کارگاه. این تو اتفاق انداختی." } },
  { id:"about",
    kw:["who are you","what are you","raha","رها کیست","تو کی هستی","چی هستی"],
    r:{ en:"I'm Raha — \"رهاء\" means freedom. I'm the program's AI companion: craving SOS, mood check-ins, token wallet and career-rewind coach. I'm a tool with human oversight — your counselor and doctors make the clinical calls. My data policy is simple: your story belongs to you.",
        fa:"من رها هستم؛ «رهاء» یعنی آزادی. همیار هوش مصنوعی برنامه‌ام: SOS هوس، چک-این خلق، کیف توکن و مربی بازگشت شغلی. من یک ابزار با نظارت انسانی‌ام — تصمیم‌های بالینی با مشاور و پزشکت. سیاست داده‌ام ساده‌ست: داستان زندگی‌ات مال خودته." } },
  { id:"thanks",
    kw:["thank","thanks","merci","مرسی","ممنون","متشکر","سپاس","teşekkür","sağol"],
    r:{ en:"Anytime. That's what I'm here for — see you at check-in tomorrow? 🌱",
        fa:"همیشه در خدمتم. برای همین اینجام — فردا سر چک-این می‌بینمت؟ 🌱" } }
];
var CHAT_FALLBACK = {
  en:"I hear you. I'm the demo version — I know cravings, mood, tokens, the weekly plan and career rewind. Try a chip below, or type \"craving\", \"job\", \"balance\"…",
  fa:"شنیدمت. من نسخهٔ دمو هستم — از هوس، خلق، توکن، برنامهٔ هفتگی و بازگشت شغلی سر درمیارم. یکی از دکمه‌ها رو بزن، یا بنویس «هوس»، «شغل»، «موجودی»…"
};
var CHAT_GREETING = {
  en:"Hi, I'm Raha 🌱 GreenRoot's recovery companion. How are you feeling today? Tap a chip below or just type — English or فارسی, both work.",
  fa:"سلام، من رها هستم 🌱 همیار بهبودی گرین‌روت. امروز حالت چطوره؟ از دکمه‌های پایین استفاده کن یا آزادانه بنویس — فارسی یا English، هر دو جواب می‌ده."
};
var CHAT_CHIPS = [
  { id:"craving", en:"I have a craving", fa:"هوس دارم" },
  { id:"mood",    en:"I feel low",      fa:"حالم پایینه" },
  { id:"career",  en:"Career rewind",   fa:"بازگشت شغلی" },
  { id:"balance", en:"Token balance",   fa:"موجودی توکن" },
  { id:"schedule",en:"This week's plan",fa:"برنامهٔ این هفته" }
];

var chatBody, chatInput;
function el(id){ return document.getElementById(id); }

function chatMsg(text, who){
  var m = document.createElement("div");
  m.className = "msg " + who;
  m.textContent = text;
  chatBody.appendChild(m);
  chatBody.scrollTop = chatBody.scrollHeight;
  return m;
}
function botReply(intentId, userText){
  var typing = document.createElement("div");
  typing.className = "msg bot typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
  var resp, d = I18N[lang]||I18N.en;
  if (intentId){ resp = CHAT_INTENTS.find(function(i){return i.id===intentId;}).r[lang] || CHAT_INTENTS.find(function(i){return i.id===intentId;}).r.en; }
  else {
    var lower = (userText||"").toLowerCase();
    var hit = CHAT_INTENTS.find(function(i){ return i.kw.some(function(k){ return lower.indexOf(k.toLowerCase())>-1; }); });
    resp = hit ? (hit.r[lang]||hit.r.en) : (CHAT_FALLBACK[lang]||CHAT_FALLBACK.en);
  }
  setTimeout(function(){ typing.remove(); chatMsg(resp,"bot"); }, 800 + Math.random()*500);
}
function routeIntent(intentId){
  var chip = CHAT_CHIPS.find(function(c){return c.id===intentId;});
  var label = chip ? (chip[lang]||chip.en) : intentId;
  chatMsg(label,"user");
  botReply(intentId,null);
}
function renderChips(){
  var wrap = el("chatChips");
  if (!wrap) return;
  wrap.innerHTML = "";
  CHAT_CHIPS.forEach(function(c){
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = c[lang]||c.en;
    b.addEventListener("click", function(){ routeIntent(c.id); });
    wrap.appendChild(b);
  });
}
function sendChat(){
  var v = (chatInput.value||"").trim();
  if (!v) return;
  chatMsg(v,"user");
  chatInput.value = "";
  botReply(null,v);
}
function initAI(){
  chatBody = el("chatBody"); chatInput = el("chatInput");
  var shell = document.querySelector(".chat-shell");
  if (shell){ shell.removeAttribute("dir"); }
  applyChatDir();
  chatMsg(CHAT_GREETING[lang]||CHAT_GREETING.en,"bot");
  renderChips();
  var send = el("chatSend");
  if (send) send.addEventListener("click", sendChat);
  if (chatInput) chatInput.addEventListener("keydown", function(e){ if (e.key==="Enter") sendChat(); });

  /* career rewind */
  var plans = CAREER_PLANS;
  var picker = el("careerPicker"), planBox = el("careerPlan");
  if (picker && planBox){
    picker.querySelectorAll("button").forEach(function(b){
      b.addEventListener("click", function(){
        picker.querySelectorAll("button").forEach(function(x){ x.classList.remove("on"); });
        b.classList.add("on");
        var job = b.getAttribute("data-job");
        renderPlan(job);
      });
    });
  }
  function renderPlan(job){
    var p = plans[job];
    planBox.style.display = "block";
    planBox.innerHTML =
      "<h4>"+ (p.title[lang]||p.title.en) +"</h4>" +
      "<ol><li>"+ (p.s1[lang]||p.s1.en) +"</li><li>"+ (p.s2[lang]||p.s2.en) +"</li><li>"+ (p.s3[lang]||p.s3.en) +"</li></ol>" +
      "<p class='small' style='margin-top:12px;color:var(--teal);font-weight:700'>💡 "+ (p.story[lang]||p.story.en) +"</p>";
  }

  /* mood tracker */
  var moodLog = [];
  var moodRow = el("moodRow"), moodMsg = el("moodMsg");
  if (moodRow && moodMsg){
    moodRow.querySelectorAll("button").forEach(function(b){
      b.addEventListener("click", function(){
        moodLog.push(parseInt(b.getAttribute("data-mood"),10));
        if (moodLog.length>12) moodLog.shift();
        renderMood();
      });
    });
  }
  function renderMood(){
    if (!moodLog.length) return;
    var MOOD_TXT = {
      1:{en:"Very low — you're not alone. Tap \"I have a craving\" / SOS or call your counselor. I've flagged a check-in.",fa:"خیلی پایین — تنها نیستی. «هوس دارم»/SOS رو بزن یا به مشاورت زنگ بزن. یک چک-این علامت خوردم."},
      2:{en:"Low — thanks for logging. Consider an SOS session or an early night.",fa:"پایین — ممنون که ثبت کردی. یک جلسهٔ SOS یا زودخوابیدن رو در نظر بگیر."},
      3:{en:"Okay days count too. Logged.",fa:"روزهای معمولی هم می‌شمارند. ثبت شد."},
      4:{en:"Good — noted. Keep the rhythm.",fa:"خوب — ثبت شد. ریتم رو نگه دار."},
      5:{en:"Great day — logged. Streaks are how recovery is built. 🌱",fa:"روزِ خوبی بود — ثبت شد. رشته‌ها، بهبودی را می‌سازند. 🌱"}
    };
    var last = moodLog[moodLog.length-1];
    var txt = (lang==="tr" && window.GR_EXTRA_TR && window.GR_EXTRA_TR.mood[last]) || MOOD_TXT[last][lang] || MOOD_TXT[last].en;
    var trend = moodLog.length>1 ? (moodLog[moodLog.length-1]>=moodLog[moodLog.length-2] ? " ↗" : " ↘") : "";
    /* sparkline */
    var w=220,h=44,pts="";
    moodLog.forEach(function(v,i){
      var x = moodLog.length===1 ? w/2 : (i/(moodLog.length-1))*(w-8)+4;
      var y = h-6-((v-1)/4)*(h-12);
      pts += x.toFixed(1)+","+y.toFixed(1)+" ";
    });
    var svg = "<svg width='"+w+"' height='"+h+"' viewBox='0 0 "+w+" "+h+"'><polyline points='"+pts+"' fill='none' stroke='#16A34A' stroke-width='2.5' stroke-linecap='round'/></svg>";
    moodMsg.innerHTML = txt + trend + "<br>" + svg + "<br><span class='muted'>" + moodLog.length + " × " + (lang==="fa"?"چک-این":"check-ins") + "</span>";
  }
}

var CAREER_PLANS = {
  driver:{ title:{en:"🚚 Driver — rewind plan",fa:"🚚 راننده — طرح بازگشت"},
    s1:{en:"Licence & record check: we verify your licence status and the skills fund covers any refresher course.",fa:"بررسی گواهینامه و سوابق: وضعیت گواهینامه‌ات را بررسی می‌کنیم و صندوق مهارت هزینهٔ دورهٔ تجدید را می‌پوشاند."},
    s2:{en:"6 paid weeks as relief driver for the cleanup crews' logistics — with a clean-shift certificate.",fa:"۶ هفتهٔ حقوق‌دار به‌عنوان رانندهٔ جانشین در حمل‌ونقل تیم‌های پاک‌سازی — با گواهی شیفت‌های تمیز."},
    s3:{en:"Raha rebuilds your CV around 12+ months of documented reliability, then places you with partner logistics firms.",fa:"رها رزومه‌ات را حول ۱۲+ ماه اتکاپذیریِ مستند بازمی‌سازد و بعد با شرکت‌های حمل‌ونقل شریک قرارت می‌دهد."},
    story:{en:"Your time on the crew isn't a gap — it's proof of reliability.",fa:"بودنت در تیم، یک «وقفه» نیست — مدرک اتکاپذیری است."}},
  nurse:{ title:{en:"🧑‍⚕️ Nurse / health worker — rewind plan",fa:"🧑‍⚕️ پرستار / کارمند سلامت — طرح بازگشت"},
    s1:{en:"Re-enter clinical life through lower-intensity roles: hygiene and health-promotion rounds within the crews.",fa:"بازگشت به فضای بالینی از نقش‌های کم‌فشار: گشتی‌های بهداشت و ارتقای سلامت درون تیم‌ها."},
    s2:{en:"Skills revalidation: BLS refresher, licence paperwork — supported by the skills fund.",fa:"بازاعتبارسنجی مهارت: دورهٔ BLS، امور پروانه — با پشتیبانی صندوق مهارت."},
    s3:{en:"Supported shifts with partner clinics while Raha builds your gradual full-return plan.",fa:"شیفت‌های حمایتی در کلینیک‌های شریک، در حالی که رها طرح بازگشت کامل تدریجی‌ات را می‌سازد."},
    story:{en:"The care you learned to give yourself is now your credential.",fa:"مراقبتی که یاد گرفتی به خودت بدهی، حالا اعتبارت است."}},
  accountant:{ title:{en:"🧾 Accountant — rewind plan",fa:"🧾 حسابدار — طرح بازگشت"},
    s1:{en:"Skills audit with free assessments (Excel, bookkeeping) — a gap map within one week.",fa:"ارزیابی مهارت با تست‌های رایگان (اکسل، اصول حسابداری) — نقشهٔ شکاف‌ها در یک هفته."},
    s2:{en:"Six weeks of software refresh + a real role: counting and reporting the crews' material revenue.",fa:"شش هفته به‌روزرسانی نرم‌افزار + یک نقش واقعی: شمارش و گزارش درآمد مواد تیم‌ها."},
    s3:{en:"Raha frames your CV around \"12 months of clean data\", then runs interview practice with partner firms.",fa:"رها رزومه را حول «۱۲ ماه دادهٔ تمیز» قاب می‌گیرد و بعد با شرکت‌های شریک مصاحبه تمرینی می‌گذارد."},
    story:{en:"The discipline you built in recovery is exactly what accounting wants.",fa:"انضباطی که در بهبودی ساختی، دقیقاً همان چیزی است که حسابداری می‌خواهد."}},
  mechanic:{ title:{en:"🔧 Mechanic — rewind plan",fa:"🔧 مکانیک — طرح بازگشت"},
    s1:{en:"Workshop assessment: tools, safety, current skills — with a technical mentor.",fa:"ارزیابی کارگاهی: ابزار، ایمنی، مهارت‌های فعلی — با یک مربی فنی."},
    s2:{en:"Documented experience maintaining the recycling line's machines and vehicles, on site.",fa:"تجربهٔ مستند نگهداشت ماشین‌آلات و خودروهای خط بازیافت — در همان سایت."},
    s3:{en:"Specialist certificate (e.g. electromechanics) from the skills fund + placement at partner workshops.",fa:"گواهی تخصصی (مثلاً الکترومکانیک) از صندوق مهارت + قرارگیری در کارگاه‌های شریک."},
    story:{en:"The machines you brought back to life are your best résumé.",fa:"ماشین‌هایی که به آن‌ها زندگی دوباره دادی، بهترین رزومهٔ تو هستند."}},
  teacher:{ title:{en:"🧑‍🏫 Teacher — rewind plan",fa:"🧑‍🏫 معلم — طرح بازگشت"},
    s1:{en:"The honest-narrative plan: how to tell the gap in interviews, practised with Raha until it's strength.",fa:"طرحِ روایت صادقانه: چطور وقفه را در مصاحبه بگویی — با رها تمرین می‌کنی تا به نقطه‌قوت تبدیل شود."},
    s2:{en:"Real classroom: environmental-literacy lessons for school groups in the parks your crew cleaned.",fa:"کلاس واقعی: درس‌های سواد محیط‌زیست برای گروه‌های مدرسه‌ای در پارک‌هایی که تیمت تمیز کرده."},
    s3:{en:"Teaching-certificate refresh + assistant placement at partner schools, stepping up to full-time.",fa:"روزآمدسازی گواهی تدریس + جایگاه دستیار در مدارس شریک، تا رسیدن به تمام‌وقت."},
    story:{en:"Your recovery is the deepest lesson your future classroom will ever get.",fa:"بهبودی‌ات، عمیق‌ترین درسی است که کلاس آینده‌ات می‌گیرد."}},
  cook:{ title:{en:"🍳 Cook — rewind plan",fa:"🍳 آشپز — طرح بازگشت"},
    s1:{en:"Food safety & hygiene certificate — official, funded by the skills fund.",fa:"گواهی ایمنی و بهداشت غذا — رسمی، هزینه‌اش با صندوق مهارت."},
    s2:{en:"Real volume experience: cooking crew lunches for 50+ people every day.",fa:"تجربهٔ حجم واقعی: پخت ناهار تیم‌ها برای ۵۰+ نفر هر روز."},
    s3:{en:"Supported internship in a partner kitchen with a mentor, then part-time or full-time placement.",fa:"کارآموزی حمایتی در آشپزخانهٔ شریک با مربی، بعد جایگاه پاره‌وقت یا تمام‌وقت."},
    story:{en:"The meals you cook for the crew are the first order of your comeback.",fa:"غذاهایی که برای تیم می‌پزی، اولین سفارشِ بازگشت تو هستند."}}
};

function applyChatDir(){
  var shell = document.querySelector(".chat-shell");
  if (shell) shell.setAttribute("dir", lang==="fa" ? "rtl" : "ltr");
  if (chatBody) chatBody.setAttribute("dir", lang==="fa" ? "rtl" : "ltr");
}

/* ============================================================
   Dashboard charts
============================================================ */
var MONTHLY_KG = [1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2400];
var WASTE_MIX = [
  {label:"PET", v:42, color:"#16A34A"},
  {label:"Paper", v:22, color:"#0D9488"},
  {label:"Metal", v:18, color:"#F59E0B"},
  {label:"Glass", v:11, color:"#3B82F6"},
  {label:"Other", v:7, color:"#94A3B8"}
];
var FUND = [
  {v:1900, color:"#16A34A"},
  {v:1250, color:"#F59E0B"},
  {v:600,  color:"#0D9488"}
];
var REPORT = [
  {m:7, a:98,  kg:1600, eur:3200},
  {m:8, a:104, kg:1700, eur:3400},
  {m:9, a:109, kg:1800, eur:3600},
  {m:10,a:113, kg:1900, eur:3800},
  {m:11,a:117, kg:2000, eur:4100},
  {m:12,a:120, kg:2400, eur:4600}
];

function renderReportTable(){
  var body = el("reportBody");
  if (!body) return;
  body.innerHTML = REPORT.map(function(r){
    return "<tr><td>"+r.m+"</td><td>"+r.a+"</td><td>"+fmt(r.kg)+"</td><td>€"+fmt(r.eur)+"</td></tr>";
  }).join("");
}

function initDashboard(){
  drawBars(el("chartMonthly"), MONTHLY_KG);
  drawDonut(el("chartMix"), WASTE_MIX);
  drawHBars(el("chartFund"), FUND);
  renderReportTable();
}

function drawBars(container, values){
  if (!container) return;
  var W=460,H=230,pad=34,bw=(W-pad-10)/values.length;
  var max = Math.max.apply(null,values)*1.12;
  var s = "<svg viewBox='0 0 "+W+" "+H+"' style='width:100%;height:auto'>";
  s += "<line x1='"+pad+"' y1='"+(H-26)+"' x2='"+(W-4)+"' y2='"+(H-26)+"' stroke='#E2E9DD' stroke-width='1.5'/>";
  values.forEach(function(v,i){
    var h = Math.round((v/max)*(H-58));
    var x = pad + i*bw + 3;
    var y = H-26-h;
    s += "<rect x='"+x+"' y='"+y+"' width='"+(bw-7)+"' height='"+h+"' rx='4' fill='url(#gbars)'><title>"+fmt(v)+" kg</title></rect>";
    if (i%2===0) s += "<text x='"+(x+(bw-7)/2)+"' y='"+(H-10)+"' font-size='10' fill='#8AA395' text-anchor='middle'>"+(i+1)+"</text>";
    if (i===values.length-1) s += "<text x='"+(x+(bw-7)/2)+"' y='"+(y-6)+"' font-size='11' font-weight='700' fill='#166534' text-anchor='middle'>"+fmt(v)+"</text>";
  });
  s += "<defs><linearGradient id='gbars' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#22C55E'/><stop offset='1' stop-color='#15803D'/></linearGradient></defs>";
  s += "</svg>";
  container.innerHTML = s;
}

function drawDonut(container, segs){
  if (!container) return;
  var total = segs.reduce(function(a,b){return a+b.v;},0);
  var R=76,C=2*Math.PI*R, off=0;
  var s = "<svg viewBox='0 0 200 200' style='width:min(220px,100%);margin:auto;display:block'>";
  s += "<g transform='rotate(-90 100 100)'>";
  segs.forEach(function(seg){
    var len = seg.v/total*C;
    s += "<circle cx='100' cy='100' r='"+R+"' fill='none' stroke='"+seg.color+"' stroke-width='34' stroke-dasharray='"+len.toFixed(1)+" "+(C-len).toFixed(1)+"' stroke-dashoffset='"+(-off).toFixed(1)+"'><title>"+seg.label+" "+seg.v+"%</title></circle>";
    off += len;
  });
  s += "</g><text x='100' y='96' text-anchor='middle' font-size='24' font-weight='800' fill='#0C2318'>"+t("dash.ch2.t1")+"</text>";
  s += "<text x='100' y='116' text-anchor='middle' font-size='11' fill='#54685C'>"+t("dash.ch2.t2")+"</text></svg>";
  container.innerHTML = s;
  var lg = el("mixLegend");
  if (lg){
    lg.innerHTML = segs.map(function(seg){
      return "<span><i style='background:"+seg.color+"'></i>"+seg.label+" "+seg.v+"%</span>";
    }).join("");
  }
}

function drawHBars(container, items){
  if (!container) return;
  var labels = [ t("dash.ch3.l1"), t("dash.ch3.l2"), t("dash.ch3.l3") ];
  var max = Math.max.apply(null, items.map(function(i){return i.v;}))*1.1;
  var s = "";
  items.forEach(function(it,i){
    var pct = Math.round(it.v/max*100);
    s += "<div style='margin-bottom:14px'>" +
      "<div style='display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:5px'><b>"+labels[i]+"</b><span class='muted' dir='ltr'>€"+fmt(it.v)+"/"+(lang==="fa"?"ماه":"mo")+"</span></div>" +
      "<div style='background:#EEF3EA;border-radius:99px;height:14px;overflow:hidden' dir='ltr'><div style='width:"+pct+"%;height:100%;border-radius:99px;background:"+it.color+"'></div></div></div>";
  });
  container.innerHTML = s;
}

/* ============================================================
   Join form
============================================================ */
function initJoin(){
  var f = el("joinForm");
  if (!f) return;
  f.addEventListener("submit", function(e){
    e.preventDefault();
    el("formOk").style.display = "block";
    f.querySelector("button[type=submit]").disabled = true;
  });
}

/* ============================================================
   UX pass: progress bar, back-to-top, mobile CTA, share, a11y
============================================================ */
document.addEventListener("DOMContentLoaded", function(){
  safe(function(){
    /* scroll progress + back-to-top visibility */
    var bar = document.createElement("div"); bar.id = "progress"; bar.setAttribute("aria-hidden","true");
    document.body.appendChild(bar);
    var top = document.createElement("button"); top.id = "toTop"; top.type = "button";
    top.setAttribute("aria-label", lang==="fa" ? "بازگشت به بالا" : (lang==="tr" ? "Yukarı dön" : "Back to top"));
    top.innerHTML = "&#8593;";
    top.addEventListener("click", function(){ window.scrollTo({top:0, behavior:"smooth"}); });
    document.body.appendChild(top);
    var upd = function(){
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max>0 ? (h.scrollTop/max)*100 : 0) + "%";
      top.classList.toggle("show", h.scrollTop > 600);
    };
    document.addEventListener("scroll", upd, {passive:true});
    upd();

    /* sticky mobile CTA */
    if (window.matchMedia && window.matchMedia("(max-width:660px)").matches && !document.querySelector(".mobile-cta")){
      var cta = document.createElement("div"); cta.className = "mobile-cta";
      var j = document.createElement("a"); j.className="btn small"; j.href="join.html"; j.innerHTML="🌱 "+t("nav.cta");
      var p = document.createElement("a"); p.className="btn small ghost"; p.href="podcast.html"; p.innerHTML="🎧 "+t("nav.podcast");
      p.style.border = "1.5px solid rgba(217,249,157,.5)"; p.style.background="rgba(255,255,255,.08)";
      cta.appendChild(j); cta.appendChild(p);
      document.body.appendChild(cta);
    }

    /* share / copy-link buttons */
    document.querySelectorAll("[data-share]").forEach(function(b){
      b.addEventListener("click", function(){
        var url = location.href.split("#")[0];
        var span = b.querySelector("span");
        if (navigator.share){
          navigator.share({title:document.title, url:url}).catch(function(){});
        } else if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(function(){
            if (span){ var old=span.textContent; span.textContent="✓ "+t("pod.copied");
              setTimeout(function(){ span.textContent=old; },1800); }
          }).catch(function(){});
        }
      });
    });

    /* burger a11y */
    var burger = document.getElementById("burger");
    if (burger) burger.setAttribute("aria-expanded","false");
  });
});

})();
