/* ===== worker.js — עמוד הפועלים (QR קבוע לאתר) ===== */

const UI = {
  he: { chooseLang: 'בחרו שפה', enterPw: 'הקלידו את סיסמת האתר', pwPh: 'סיסמת אתר', enter: 'כניסה', wrongPw: 'סיסמה שגויה', loading: 'טוען…', noBriefing: 'אין תדריך בטיחות להיום באתר זה. פנו למנהל העבודה.', closed: 'התדריך של היום נסגר — לא ניתן לחתום עליו.', today: 'תדריך הבטיחות של היום', date: 'תאריך', time: 'שעה', foreman: 'מנהל עבודה מתדרך', topics: 'נושאי התדריך', notes: 'הערות מנהל העבודה', notesOrig: 'מוצג כפי שנכתב, ללא תרגום', form: 'אישור השתתפות וחתימה', fullName: 'שם מלא', contractor: 'קבלן משנה / חברה', attended: 'אני מאשר/ת שהשתתפתי בתדריך בפועל והבנתי את תוכנו', photo: 'תמונה עצמית (חובה)', takePhoto: 'צילום תמונה', retake: 'צילום מחדש', sign: 'חתימה', signHere: 'חתמו כאן באצבע', clear: 'ניקוי', submit: 'שליחת חתימה', sending: 'שולח…', success: 'החתימה נקלטה בהצלחה', successSub: 'תודה — עבודה בטוחה!', already: 'כבר חתמת על תדריך היום', another: 'חתימה של אדם נוסף מטלפון זה', duplicate: 'שם זה כבר חתום על התדריך', errName: 'יש להקליד שם מלא', errContractor: 'יש להקליד שם קבלן', errAttended: 'יש לאשר השתתפות', errPhoto: 'יש לצלם תמונה עצמית', errSign: 'יש לחתום', errGeneric: 'שגיאה — נסו שוב', offline: 'אין חיבור לאינטרנט', changeLang: 'שפה', changeSite: 'החלפת סיסמה', noSite: 'סרקו את קוד ה-QR של האתר', refresh: 'רענון', signedAt: 'נחתם ב־' },
  ar: { chooseLang: 'اختر اللغة', enterPw: 'أدخل كلمة مرور الموقع', pwPh: 'كلمة مرور الموقع', enter: 'دخول', wrongPw: 'كلمة المرور غير صحيحة', loading: 'جارٍ التحميل…', noBriefing: 'لا يوجد إرشاد سلامة لهذا اليوم في هذا الموقع. توجّه إلى مدير العمل.', closed: 'تم إغلاق إرشاد اليوم — لا يمكن التوقيع عليه.', today: 'إرشاد السلامة لهذا اليوم', date: 'التاريخ', time: 'الساعة', foreman: 'مدير العمل المُرشِد', topics: 'مواضيع الإرشاد', notes: 'ملاحظات مدير العمل', notesOrig: 'معروضة كما كُتبت، بدون ترجمة', form: 'تأكيد المشاركة والتوقيع', fullName: 'الاسم الكامل', contractor: 'المقاول الفرعي / الشركة', attended: 'أؤكد أنني شاركت فعلاً في الإرشاد وفهمت محتواه', photo: 'صورة ذاتية (إلزامية)', takePhoto: 'التقاط صورة', retake: 'إعادة التصوير', sign: 'التوقيع', signHere: 'وقّع هنا بإصبعك', clear: 'مسح', submit: 'إرسال التوقيع', sending: 'جارٍ الإرسال…', success: 'تم استلام التوقيع بنجاح', successSub: 'شكراً — عملاً آمناً!', already: 'لقد وقّعت على إرشاد اليوم', another: 'توقيع شخص آخر من هذا الهاتف', duplicate: 'هذا الاسم موقّع مسبقاً على الإرشاد', errName: 'يجب إدخال الاسم الكامل', errContractor: 'يجب إدخال اسم المقاول', errAttended: 'يجب تأكيد المشاركة', errPhoto: 'يجب التقاط صورة ذاتية', errSign: 'يجب التوقيع', errGeneric: 'خطأ — حاول مرة أخرى', offline: 'لا يوجد اتصال بالإنترنت', changeLang: 'اللغة', changeSite: 'تغيير كلمة المرور', noSite: 'امسح رمز QR الخاص بالموقع', refresh: 'تحديث', signedAt: 'وُقّع في ' },
  ru: { chooseLang: 'Выберите язык', enterPw: 'Введите пароль объекта', pwPh: 'Пароль объекта', enter: 'Войти', wrongPw: 'Неверный пароль', loading: 'Загрузка…', noBriefing: 'На сегодня на этом объекте нет инструктажа. Обратитесь к прорабу.', closed: 'Сегодняшний инструктаж закрыт — подписать его нельзя.', today: 'Инструктаж по технике безопасности на сегодня', date: 'Дата', time: 'Время', foreman: 'Проводящий прораб', topics: 'Темы инструктажа', notes: 'Замечания прораба', notesOrig: 'Показано как написано, без перевода', form: 'Подтверждение участия и подпись', fullName: 'Полное имя', contractor: 'Субподрядчик / компания', attended: 'Подтверждаю, что я лично участвовал(а) в инструктаже и понял(а) его содержание', photo: 'Селфи (обязательно)', takePhoto: 'Сделать фото', retake: 'Переснять', sign: 'Подпись', signHere: 'Распишитесь здесь пальцем', clear: 'Очистить', submit: 'Отправить подпись', sending: 'Отправка…', success: 'Подпись успешно принята', successSub: 'Спасибо — безопасной работы!', already: 'Вы уже подписали сегодняшний инструктаж', another: 'Подпись другого человека с этого телефона', duplicate: 'Это имя уже подписано в инструктаже', errName: 'Введите полное имя', errContractor: 'Введите название подрядчика', errAttended: 'Подтвердите участие', errPhoto: 'Сделайте селфи', errSign: 'Поставьте подпись', errGeneric: 'Ошибка — попробуйте ещё раз', offline: 'Нет подключения к интернету', changeLang: 'Язык', changeSite: 'Сменить пароль', noSite: 'Отсканируйте QR-код объекта', refresh: 'Обновить', signedAt: 'Подписано в ' },
  ro: { chooseLang: 'Alegeți limba', enterPw: 'Introduceți parola șantierului', pwPh: 'Parola șantierului', enter: 'Intrare', wrongPw: 'Parolă greșită', loading: 'Se încarcă…', noBriefing: 'Nu există instructaj de siguranță astăzi pe acest șantier. Adresați-vă șefului de lucrări.', closed: 'Instructajul de astăzi a fost închis — nu mai poate fi semnat.', today: 'Instructajul de siguranță de astăzi', date: 'Data', time: 'Ora', foreman: 'Șef de lucrări (instructor)', topics: 'Temele instructajului', notes: 'Observațiile șefului de lucrări', notesOrig: 'Afișate așa cum au fost scrise, fără traducere', form: 'Confirmarea participării și semnătura', fullName: 'Nume complet', contractor: 'Subantreprenor / firmă', attended: 'Confirm că am participat efectiv la instructaj și am înțeles conținutul', photo: 'Selfie (obligatoriu)', takePhoto: 'Faceți o fotografie', retake: 'Refaceți fotografia', sign: 'Semnătura', signHere: 'Semnați aici cu degetul', clear: 'Ștergere', submit: 'Trimiteți semnătura', sending: 'Se trimite…', success: 'Semnătura a fost înregistrată', successSub: 'Mulțumim — lucru în siguranță!', already: 'Ați semnat deja instructajul de astăzi', another: 'Semnătura altei persoane de pe acest telefon', duplicate: 'Acest nume a semnat deja instructajul', errName: 'Introduceți numele complet', errContractor: 'Introduceți numele antreprenorului', errAttended: 'Confirmați participarea', errPhoto: 'Faceți un selfie', errSign: 'Semnați', errGeneric: 'Eroare — încercați din nou', offline: 'Fără conexiune la internet', changeLang: 'Limba', changeSite: 'Schimbați parola', noSite: 'Scanați codul QR al șantierului', refresh: 'Reîmprospătare', signedAt: 'Semnat la ' },
  hi: { chooseLang: 'भाषा चुनें', enterPw: 'साइट का पासवर्ड डालें', pwPh: 'साइट पासवर्ड', enter: 'प्रवेश', wrongPw: 'गलत पासवर्ड', loading: 'लोड हो रहा है…', noBriefing: 'आज इस साइट पर कोई सुरक्षा ब्रीफ़िंग नहीं है। फोरमैन से संपर्क करें।', closed: 'आज की ब्रीफ़िंग बंद हो चुकी है — इस पर हस्ताक्षर नहीं किए जा सकते।', today: 'आज की सुरक्षा ब्रीफ़िंग', date: 'तारीख', time: 'समय', foreman: 'ब्रीफ़िंग देने वाले फोरमैन', topics: 'ब्रीफ़िंग के विषय', notes: 'फोरमैन की टिप्पणियाँ', notesOrig: 'जैसा लिखा गया वैसा ही, बिना अनुवाद', form: 'भागीदारी की पुष्टि और हस्ताक्षर', fullName: 'पूरा नाम', contractor: 'उप-ठेकेदार / कंपनी', attended: 'मैं पुष्टि करता/करती हूँ कि मैंने ब्रीफ़िंग में भाग लिया और इसकी सामग्री समझ ली', photo: 'सेल्फ़ी (अनिवार्य)', takePhoto: 'फ़ोटो लें', retake: 'फिर से फ़ोटो लें', sign: 'हस्ताक्षर', signHere: 'यहाँ उंगली से हस्ताक्षर करें', clear: 'मिटाएँ', submit: 'हस्ताक्षर भेजें', sending: 'भेजा जा रहा है…', success: 'हस्ताक्षर सफलतापूर्वक दर्ज हुआ', successSub: 'धन्यवाद — सुरक्षित काम करें!', already: 'आप आज की ब्रीफ़िंग पर पहले ही हस्ताक्षर कर चुके हैं', another: 'इस फ़ोन से किसी दूसरे व्यक्ति का हस्ताक्षर', duplicate: 'यह नाम पहले ही ब्रीफ़िंग पर हस्ताक्षर कर चुका है', errName: 'पूरा नाम लिखें', errContractor: 'ठेकेदार का नाम लिखें', errAttended: 'भागीदारी की पुष्टि करें', errPhoto: 'सेल्फ़ी लें', errSign: 'हस्ताक्षर करें', errGeneric: 'त्रुटि — फिर से कोशिश करें', offline: 'इंटरनेट कनेक्शन नहीं है', changeLang: 'भाषा', changeSite: 'पासवर्ड बदलें', noSite: 'साइट का QR कोड स्कैन करें', refresh: 'रीफ़्रेश', signedAt: 'हस्ताक्षर समय ' },
  si: { chooseLang: 'භාෂාව තෝරන්න', enterPw: 'වැඩබිමේ මුරපදය ඇතුළත් කරන්න', pwPh: 'වැඩබිම් මුරපදය', enter: 'ඇතුළු වන්න', wrongPw: 'මුරපදය වැරදියි', loading: 'පූරණය වෙමින්…', noBriefing: 'අද මෙම වැඩබිමේ ආරක්ෂක උපදෙස් සැසියක් නැත. වැඩ කළමනාකරු හමුවන්න.', closed: 'අද උපදෙස් සැසිය වසා ඇත — අත්සන් කළ නොහැක.', today: 'අද දින ආරක්ෂක උපදෙස්', date: 'දිනය', time: 'වේලාව', foreman: 'උපදෙස් දෙන වැඩ කළමනාකරු', topics: 'උපදෙස් මාතෘකා', notes: 'වැඩ කළමනාකරුගේ සටහන්', notesOrig: 'ලියූ ආකාරයටම, පරිවර්තනයකින් තොරව', form: 'සහභාගීත්වය තහවුරු කිරීම සහ අත්සන', fullName: 'සම්පූර්ණ නම', contractor: 'උප කොන්ත්‍රාත්කරු / සමාගම', attended: 'මම උපදෙස් සැසියට සැබවින්ම සහභාගී වූ බවත් එහි අන්තර්ගතය තේරුම් ගත් බවත් තහවුරු කරමි', photo: 'සෙල්ෆි ඡායාරූපය (අනිවාර්යයි)', takePhoto: 'ඡායාරූපයක් ගන්න', retake: 'නැවත ගන්න', sign: 'අත්සන', signHere: 'මෙතන ඇඟිල්ලෙන් අත්සන් කරන්න', clear: 'මකන්න', submit: 'අත්සන යවන්න', sending: 'යවමින්…', success: 'අත්සන සාර්ථකව ලැබුණි', successSub: 'ස්තූතියි — ආරක්ෂිතව වැඩ කරන්න!', already: 'ඔබ දැනටමත් අද උපදෙස් සැසියට අත්සන් කර ඇත', another: 'මෙම දුරකථනයෙන් වෙනත් අයෙකුගේ අත්සන', duplicate: 'මෙම නම දැනටමත් අත්සන් කර ඇත', errName: 'සම්පූර්ණ නම ඇතුළත් කරන්න', errContractor: 'කොන්ත්‍රාත්කරුගේ නම ඇතුළත් කරන්න', errAttended: 'සහභාගීත්වය තහවුරු කරන්න', errPhoto: 'සෙල්ෆි ඡායාරූපයක් ගන්න', errSign: 'අත්සන් කරන්න', errGeneric: 'දෝෂයකි — නැවත උත්සාහ කරන්න', offline: 'අන්තර්ජාල සම්බන්ධතාවයක් නැත', changeLang: 'භාෂාව', changeSite: 'මුරපදය වෙනස් කරන්න', noSite: 'වැඩබිමේ QR කේතය ස්කෑන් කරන්න', refresh: 'නැවුම් කරන්න', signedAt: 'අත්සන් කළ වේලාව ' },
};

const app = $('#app');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
  del(k) { try { localStorage.removeItem(k); } catch (_) {} },
};

let sb = null;
const params = new URLSearchParams(location.search);
const UUID_RE = /^[0-9a-f-]{36}$/i;
let siteId = params.get('s');
if (siteId && UUID_RE.test(siteId)) store.set('sb_last_site', siteId);
else siteId = store.get('sb_last_site');
let lang = store.get('sb_lang');

function T() { return UI[lang] || UI.he; }
function applyLang() {
  const L = LANGS.find(l => l.code === lang) || LANGS[0];
  document.documentElement.lang = L.code; document.documentElement.dir = L.dir;
  const b = $('#tb-lang'); b.hidden = !lang; b.textContent = '🌐 ' + L.name;
}
$('#tb-lang').onclick = () => { renderLangPicker(); };

function pwKey() { return 'sb_pw_' + siteId; }

async function start() {
  if (!isConfigured()) { app.innerHTML = `<div class="card alert bad">האפליקציה עוד לא הוגדרה (config.js)</div>`; return; }
  sb = makeClient();
  if (!siteId) {
    app.innerHTML = `<div class="card center"><div class="big-icon">📷</div>${LANGS.map(l => `<div dir="${l.dir}">${esc(UI[l.code].noSite)}</div>`).join('')}</div>`;
    return;
  }
  if (!lang) return renderLangPicker();
  applyLang();
  if (!store.get(pwKey())) return renderPassword();
  loadBriefing();
}

function renderLangPicker() {
  document.documentElement.dir = 'ltr';
  app.innerHTML = `<div class="card">
    <h1 class="center">🌐 בחרו שפה · اختر اللغة · Выберите язык</h1>
    <div class="lang-grid">${LANGS.map(l => `<button data-l="${l.code}" dir="${l.dir}">${esc(l.name)}</button>`).join('')}</div>
  </div>`;
  $$('.lang-grid button').forEach(b => b.onclick = () => {
    lang = b.dataset.l; store.set('sb_lang', lang); applyLang();
    if (!store.get(pwKey())) renderPassword(); else loadBriefing();
  });
}

function renderPassword(err) {
  const t = T();
  app.innerHTML = `<form class="card" id="pwf">
    <div class="center big-icon">🔒</div>
    <h1 class="center">${esc(t.enterPw)}</h1>
    ${err ? `<div class="alert bad">${esc(err)}</div>` : ''}
    <label class="fld"><input type="password" id="pw" placeholder="${esc(t.pwPh)}" autocomplete="current-password" required></label>
    <button class="btn btn-block btn-lg" id="pwb">${esc(t.enter)}</button>
  </form>`;
  $('#pw').focus();
  $('#pwf').onsubmit = async e => {
    e.preventDefault();
    const pw = $('#pw').value;
    $('#pwb').disabled = true; $('#pwb').textContent = t.loading;
    const r = await callGet(pw);
    if (r && r.error === 'bad_password') return renderPassword(t.wrongPw);
    if (r && r.netError) return renderPassword(t.offline);
    store.set(pwKey(), pw);
    showBriefing(r);
  };
}

async function callGet(pw) {
  try {
    const { data, error } = await sb.rpc('worker_get_briefing', { p_site: siteId, p_password: pw });
    if (error) return { netError: true };
    return data;
  } catch (_) { return { netError: true }; }
}

async function loadBriefing() {
  const t = T();
  app.innerHTML = `<div class="spinner"></div><p class="center muted">${esc(t.loading)}</p>`;
  const r = await callGet(store.get(pwKey()));
  if (r.error === 'bad_password') { store.del(pwKey()); return renderPassword(t.wrongPw); }
  if (r.netError) {
    app.innerHTML = `<div class="card center"><div class="big-icon">📶</div><p>${esc(t.offline)}</p><button class="btn" onclick="loadBriefing()">${esc(t.refresh)}</button></div>`;
    return;
  }
  showBriefing(r);
}

function footerLinks() {
  const t = T();
  return `<p class="center small"><button class="btn-link" id="chg-pw">${esc(t.changeSite)}</button> · <button class="btn-link" id="reload">${esc(t.refresh)}</button></p>`;
}
function bindFooter() {
  const a = $('#chg-pw'); if (a) a.onclick = () => { store.del(pwKey()); renderPassword(); };
  const b = $('#reload'); if (b) b.onclick = () => loadBriefing();
}

function showBriefing(r) {
  const t = T();
  if (r.site_name) $('#tb-title').textContent = r.site_name;
  if (r.error === 'no_briefing' || !r.briefing) {
    app.innerHTML = `<div class="card center"><div class="big-icon">📋</div><p>${esc(t.noBriefing)}</p></div>${footerLinks()}`;
    return bindFooter();
  }
  const b = r.briefing;
  const topics = (b.topics || []).filter(k => TOPICS.he[k]);
  const L = TOPICS[lang] || TOPICS.he;
  const signedName = store.get('sb_signed_' + b.id);

  let action;
  if (b.status !== 'open') action = `<div class="card alert warn center">🔒 ${esc(t.closed)}</div>`;
  else if (signedName) action = `<div class="card center"><div class="big-icon">✅</div><h2>${esc(t.already)}</h2><p class="muted">${esc(signedName)}</p>
      <button class="btn btn-outline" id="another">${esc(t.another)}</button></div>`;
  else action = `<form class="card" id="signf" novalidate><h2>✍️ ${esc(t.form)}</h2>${signFormHTML(t)}
      <button class="btn btn-block btn-lg" id="sendb">${esc(t.submit)}</button></form>`;

  app.innerHTML = `
    <div class="card">
      <h1>⛑️ ${esc(t.today)}</h1>
      <dl class="kv">
        <dt>${esc(t.date)}</dt><dd>${esc(fmtDate(b.date))}</dd>
        <dt>${esc(t.time)}</dt><dd dir="ltr" style="text-align:start">${esc(b.time)}</dd>
        <dt>${esc(t.foreman)}</dt><dd>${esc(b.foreman)}</dd>
      </dl>
    </div>
    <div class="card">
      <h2>${esc(t.topics)}</h2>
      ${topics.map(k => `<div class="topic"><h3>${TOPIC_ICONS[k]} ${esc(L[k].t)}</h3><ul>${L[k].b.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
      ${b.notes ? `<h3 style="margin-top:14px">${esc(t.notes)}</h3><div class="small muted">${esc(t.notesOrig)}</div><div class="notes-box" dir="auto">${esc(b.notes)}</div>` : ''}
    </div>
    ${action}
    ${footerLinks()}`;
  bindFooter();

  const another = $('#another');
  if (another) another.onclick = () => { store.del('sb_signed_' + b.id); showBriefing(r); };

  const form = $('#signf');
  if (!form) return;
  const ctl = bindSignForm(form, t);
  form.onsubmit = async e => {
    e.preventDefault();
    const v = ctl.collect();
    if (v.error) return ctl.showError(v.error);
    ctl.showError('');
    const btn = $('#sendb'); btn.disabled = true; btn.textContent = t.sending;
    let res;
    try {
      const { data, error } = await sb.rpc('worker_sign', {
        p_site: siteId, p_password: store.get(pwKey()), p_briefing: b.id,
        p_full_name: v.full_name, p_contractor: v.contractor, p_attended: v.attended,
        p_photo: v.photo, p_signature: v.signature,
      });
      res = error ? { error: 'net' } : data;
    } catch (_) { res = { error: 'net' }; }
    btn.disabled = false; btn.textContent = t.submit;
    if (res.ok) {
      store.set('sb_signed_' + b.id, v.full_name);
      app.innerHTML = `<div class="card center"><div class="big-icon">✅</div><h1>${esc(t.success)}</h1>
        <p>${esc(v.full_name)} · ${esc(v.contractor)}</p><p class="muted">${esc(t.signedAt)}${esc(fmtDateTime(new Date()))}</p>
        <h2>${esc(t.successSub)}</h2></div>`;
      return;
    }
    if (res.error === 'duplicate') return ctl.showError(t.duplicate);
    if (res.error === 'closed') { b.status = 'closed'; return showBriefing(r); }
    if (res.error === 'bad_password') { store.del(pwKey()); return renderPassword(t.wrongPw); }
    if (res.error === 'no_briefing') return loadBriefing();
    if (res.error === 'net') return ctl.showError(t.offline);
    ctl.showError(t.errGeneric);
  };
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
start();
