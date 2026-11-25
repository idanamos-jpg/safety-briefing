/* ===== shared.js — תרגומים, כלים משותפים, משטח חתימה ===== */

const LANGS = [
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'ro', name: 'Română', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'si', name: 'සිංහල', dir: 'ltr' },
];

const TOPIC_KEYS = ['ppe', 'height', 'openings', 'housekeeping', 'coordination', 'tools'];
const TOPIC_ICONS = { ppe: '⛑️', height: '🪜', openings: '🚧', housekeeping: '🧹', coordination: '🤝', tools: '🛠️' };

const TOPICS = {
  he: {
    ppe: { t: 'ציוד מגן אישי', b: ['חובה לחבוש קסדה עם רצועת סנטר בכל שטח האתר', 'נעלי בטיחות ואפוד זוהר לאורך כל יום העבודה', 'משקפי מגן, כפפות ואטמי אוזניים לפי סוג העבודה'] },
    height: { t: 'עבודה בגובה', b: ['עבודה מעל 2 מטר רק עם הסמכה לעבודה בגובה', 'רתמת בטיחות מחוברת לנקודת עיגון תקינה בכל זמן', 'לבדוק פיגום או סולם לפני עלייה — אין לעלות על פיגום ללא תווית בדיקה'] },
    openings: { t: 'פתחים ומעקות', b: ['כל פתח ברצפה חייב להיות מכוסה או מגודר', 'אין להסיר מעקה או כיסוי בלי אישור מנהל העבודה', 'לדווח מיד על מעקה פגום או חסר'] },
    housekeeping: { t: 'סדר וניקיון', b: ['לשמור על מעברים ודרכי מילוט פנויים', 'לפנות פסולת וחומרים בסוף כל יום עבודה', 'לאחסן חומרים בצורה יציבה, הרחק משולי קומה ומפתחים'] },
    coordination: { t: 'תיאום קבלנים', b: ['אין לעבוד מתחת או מעל צוות אחר בלי תיאום', 'עבודות חמות, הרמות ועבודות מסוכנות — רק באישור מנהל העבודה', 'לדווח למנהל העבודה על כל שינוי באזור העבודה'] },
    tools: { t: 'שימוש בטוח בכלי עבודה', b: ['להשתמש רק בכלים תקינים עם המגנים במקומם', 'לבדוק כבלים ותקעים לפני שימוש — אין להשתמש בכבל פגוע', 'לנתק כלי מהחשמל לפני החלפת דיסק, מקדח או ניקוי'] },
  },
  ar: {
    ppe: { t: 'معدات الحماية الشخصية', b: ['يجب ارتداء الخوذة مع حزام الذقن في جميع أنحاء الموقع', 'حذاء السلامة والسترة العاكسة طوال يوم العمل', 'نظارات واقية وقفازات وسدادات أذن حسب نوع العمل'] },
    height: { t: 'العمل على ارتفاع', b: ['العمل فوق 2 متر فقط مع شهادة العمل على ارتفاع', 'حزام الأمان مربوط بنقطة تثبيت سليمة في كل الأوقات', 'افحص السقالة أو السلم قبل الصعود — لا تصعد على سقالة بدون بطاقة فحص'] },
    openings: { t: 'الفتحات والدرابزين', b: ['كل فتحة في الأرضية يجب أن تكون مغطاة أو مسيّجة', 'لا تُزِل درابزيناً أو غطاءً بدون إذن مدير العمل', 'أبلغ فوراً عن درابزين تالف أو مفقود'] },
    housekeeping: { t: 'الترتيب والنظافة', b: ['حافظ على الممرات وطرق الإخلاء خالية', 'أزل النفايات والمواد في نهاية كل يوم عمل', 'خزّن المواد بشكل ثابت بعيداً عن حواف الطوابق والفتحات'] },
    coordination: { t: 'التنسيق بين المقاولين', b: ['لا تعمل تحت أو فوق فريق آخر بدون تنسيق', 'الأعمال الساخنة والرفع والأعمال الخطرة — فقط بإذن مدير العمل', 'أبلغ مدير العمل عن أي تغيير في منطقة العمل'] },
    tools: { t: 'الاستخدام الآمن لأدوات العمل', b: ['استخدم فقط أدوات سليمة مع واقياتها في مكانها', 'افحص الكوابل والقوابس قبل الاستخدام — لا تستخدم كابلاً تالفاً', 'افصل الأداة عن الكهرباء قبل تغيير القرص أو المثقاب أو التنظيف'] },
  },
  ru: {
    ppe: { t: 'Средства индивидуальной защиты', b: ['Каска с подбородочным ремнём обязательна на всей территории объекта', 'Защитная обувь и светоотражающий жилет в течение всего рабочего дня', 'Защитные очки, перчатки и беруши — в зависимости от вида работ'] },
    height: { t: 'Работа на высоте', b: ['Работа выше 2 метров — только при наличии допуска к работе на высоте', 'Страховочная привязь всегда закреплена за исправную точку анкеровки', 'Проверьте леса или лестницу перед подъёмом — не поднимайтесь на леса без бирки проверки'] },
    openings: { t: 'Проёмы и ограждения', b: ['Каждый проём в перекрытии должен быть закрыт или огорожен', 'Не снимайте ограждение или крышку без разрешения прораба', 'Немедленно сообщайте о повреждённом или отсутствующем ограждении'] },
    housekeeping: { t: 'Порядок и чистота', b: ['Держите проходы и пути эвакуации свободными', 'Убирайте мусор и материалы в конце каждого рабочего дня', 'Складируйте материалы устойчиво, вдали от краёв перекрытий и проёмов'] },
    coordination: { t: 'Координация подрядчиков', b: ['Не работайте под или над другой бригадой без согласования', 'Огневые работы, подъём грузов и опасные работы — только с разрешения прораба', 'Сообщайте прорабу о любых изменениях в зоне работ'] },
    tools: { t: 'Безопасное использование инструментов', b: ['Используйте только исправные инструменты с установленными защитными кожухами', 'Проверяйте кабели и вилки перед работой — не используйте повреждённый кабель', 'Отключайте инструмент от сети перед заменой диска, сверла или чисткой'] },
  },
  ro: {
    ppe: { t: 'Echipament individual de protecție', b: ['Casca cu bărbie este obligatorie pe tot șantierul', 'Bocanci de protecție și vestă reflectorizantă pe toată durata zilei de lucru', 'Ochelari de protecție, mănuși și antifoane, în funcție de tipul lucrării'] },
    height: { t: 'Lucrul la înălțime', b: ['Lucrul peste 2 metri doar cu autorizare pentru lucru la înălțime', 'Hamul de siguranță prins permanent de un punct de ancorare sigur', 'Verificați schela sau scara înainte de urcare — nu urcați pe o schelă fără etichetă de verificare'] },
    openings: { t: 'Goluri și balustrade', b: ['Orice gol în planșeu trebuie acoperit sau împrejmuit', 'Nu îndepărtați o balustradă sau un capac fără aprobarea șefului de lucrări', 'Raportați imediat o balustradă deteriorată sau lipsă'] },
    housekeeping: { t: 'Ordine și curățenie', b: ['Păstrați libere căile de acces și de evacuare', 'Îndepărtați deșeurile și materialele la sfârșitul fiecărei zile de lucru', 'Depozitați materialele stabil, departe de marginile planșeului și de goluri'] },
    coordination: { t: 'Coordonarea antreprenorilor', b: ['Nu lucrați sub sau deasupra altei echipe fără coordonare', 'Lucrări cu foc, ridicări de sarcini și lucrări periculoase — doar cu aprobarea șefului de lucrări', 'Raportați șefului de lucrări orice schimbare în zona de lucru'] },
    tools: { t: 'Utilizarea în siguranță a sculelor', b: ['Folosiți doar scule în stare bună, cu apărătorile montate', 'Verificați cablurile și ștecherele înainte de utilizare — nu folosiți un cablu deteriorat', 'Deconectați scula de la curent înainte de a schimba discul, burghiul sau de a o curăța'] },
  },
  hi: {
    ppe: { t: 'व्यक्तिगत सुरक्षा उपकरण', b: ['पूरी साइट पर ठुड्डी के पट्टे वाला हेलमेट पहनना अनिवार्य है', 'पूरे कार्य दिवस में सेफ्टी जूते और रिफ्लेक्टिव जैकेट पहनें', 'काम के प्रकार के अनुसार सुरक्षा चश्मा, दस्ताने और कान के प्लग पहनें'] },
    height: { t: 'ऊँचाई पर काम', b: ['2 मीटर से ऊपर काम केवल ऊँचाई पर काम के प्रमाणपत्र के साथ करें', 'सेफ्टी हार्नेस हमेशा मज़बूत एंकर पॉइंट से जुड़ा रहे', 'चढ़ने से पहले मचान या सीढ़ी की जाँच करें — बिना जाँच टैग वाले मचान पर न चढ़ें'] },
    openings: { t: 'खुले स्थान और रेलिंग', b: ['फर्श का हर खुला स्थान ढका हुआ या घेरा हुआ होना चाहिए', 'फोरमैन की अनुमति के बिना रेलिंग या ढक्कन न हटाएँ', 'टूटी या गायब रेलिंग की तुरंत सूचना दें'] },
    housekeeping: { t: 'व्यवस्था और सफ़ाई', b: ['रास्ते और निकास मार्ग खाली रखें', 'हर कार्य दिवस के अंत में कचरा और सामग्री हटाएँ', 'सामग्री को स्थिर रूप से, फर्श के किनारों और खुले स्थानों से दूर रखें'] },
    coordination: { t: 'ठेकेदारों के बीच तालमेल', b: ['बिना तालमेल के किसी दूसरी टीम के नीचे या ऊपर काम न करें', 'वेल्डिंग/कटिंग, भारी सामान उठाना और खतरनाक काम — केवल फोरमैन की अनुमति से', 'कार्य क्षेत्र में किसी भी बदलाव की सूचना फोरमैन को दें'] },
    tools: { t: 'औज़ारों का सुरक्षित उपयोग', b: ['केवल ठीक हालत वाले औज़ार, गार्ड लगे हुए, इस्तेमाल करें', 'उपयोग से पहले तार और प्लग जाँचें — कटी हुई तार इस्तेमाल न करें', 'डिस्क या ड्रिल बदलने या सफ़ाई से पहले औज़ार को बिजली से निकालें'] },
  },
  si: {
    ppe: { t: 'පුද්ගලික ආරක්ෂක උපකරණ', b: ['වැඩබිම පුරාම නිකට පටිය සහිත හෙල්මට් පැළඳීම අනිවාර්යයි', 'මුළු වැඩ දිනය පුරාම ආරක්ෂිත සපත්තු සහ පරාවර්තක ජැකට් පැළඳිය යුතුයි', 'වැඩේ ස්වභාවය අනුව ආරක්ෂිත කණ්ණාඩි, අත්වැසුම් සහ කන් ආවරණ පැළඳිය යුතුයි'] },
    height: { t: 'උසක වැඩ කිරීම', b: ['මීටර් 2ට වඩා උසින් වැඩ කළ හැක්කේ උසක වැඩ කිරීමේ අවසරය ඇත්නම් පමණි', 'ආරක්ෂිත පටිය (හාර්නස්) සෑම විටම ශක්තිමත් රැඳවුම් ස්ථානයකට සම්බන්ධ කර තිබිය යුතුයි', 'නැගීමට පෙර පලංචිය හෝ ඉණිමඟ පරීක්ෂා කරන්න — පරීක්ෂණ ලේබලයක් නැති පලංචියකට නොනඟින්න'] },
    openings: { t: 'විවරයන් සහ වැටවල්', b: ['බිමේ ඇති සෑම විවරයක්ම වසා හෝ වට කර තිබිය යුතුයි', 'වැඩ කළමනාකරුගේ අවසරයකින් තොරව වැටක් හෝ ආවරණයක් ඉවත් නොකරන්න', 'හානි වූ හෝ නැති වැටක් ගැන වහාම දන්වන්න'] },
    housekeeping: { t: 'පිළිවෙල සහ පිරිසිදුකම', b: ['මංපෙත් සහ හදිසි පිටවීමේ මාර්ග හිස්ව තබා ගන්න', 'සෑම වැඩ දිනයක් අවසානයේම අපද්‍රව්‍ය සහ ද්‍රව්‍ය ඉවත් කරන්න', 'ද්‍රව්‍ය ස්ථාවරව, තට්ටුවේ දාරවලින් සහ විවරවලින් ඈතින් ගබඩා කරන්න'] },
    coordination: { t: 'කොන්ත්‍රාත්කරුවන් අතර සම්බන්ධීකරණය', b: ['සම්බන්ධීකරණයකින් තොරව වෙනත් කණ්ඩායමකට යටින් හෝ ඉහළින් වැඩ නොකරන්න', 'වෑල්ඩින්, බර එසවීම සහ අනතුරුදායක වැඩ — වැඩ කළමනාකරුගේ අවසරය ඇතිව පමණි', 'වැඩ කරන ප්‍රදේශයේ ඕනෑම වෙනසක් ගැන වැඩ කළමනාකරුට දන්වන්න'] },
    tools: { t: 'උපකරණ ආරක්ෂිතව භාවිතය', b: ['ආරක්ෂක ආවරණ සවි කළ, හොඳ තත්ත්වයේ උපකරණ පමණක් භාවිත කරන්න', 'භාවිතයට පෙර කේබල් සහ ප්ලග් පරීක්ෂා කරන්න — හානි වූ කේබලයක් භාවිත නොකරන්න', 'තැටිය හෝ බිට් එක මාරු කිරීමට හෝ පිරිසිදු කිරීමට පෙර විදුලියෙන් ගලවන්න'] },
  },
};

/* ---------- כלים ---------- */

const TZ = 'Asia/Jerusalem';

function todayIL() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
}
function nowTimeIL() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
}
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}
function fmtTime(t) { return t ? String(t).slice(0, 5) : ''; }
function fmtDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
  const g = k => p.find(x => x.type === k)?.value || '';
  return `${g('day')}.${g('month')}.${g('year')} ${g('hour')}:${g('minute')}:${g('second')}`;
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function isConfigured() {
  const c = window.APP_CONFIG || {};
  return c.SUPABASE_URL && !c.SUPABASE_URL.includes('YOUR-') && c.SUPABASE_ANON_KEY && !c.SUPABASE_ANON_KEY.includes('YOUR-');
}
function makeClient() {
  const c = window.APP_CONFIG;
  return window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
}

/* דחיסת תמונה לפני שליחה (≈ 30–60KB) */
function compressImage(file, max = 520, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/* ---------- משטח חתימה באצבע ---------- */
class SigPad {
  constructor(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.empty = true;
    canvas.style.touchAction = 'none';
    let drawing = false, last = null;
    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!this.c.width) this.resize();
      drawing = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      last = pos(e);
      this.ctx.beginPath(); this.ctx.arc(last.x, last.y, 1.3, 0, Math.PI * 2); this.ctx.fill();
      this.empty = false;
    });
    canvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = pos(e);
      this.ctx.beginPath(); this.ctx.moveTo(last.x, last.y); this.ctx.lineTo(p.x, p.y); this.ctx.stroke();
      last = p;
    });
    ['pointerup', 'pointercancel'].forEach(ev => canvas.addEventListener(ev, () => { drawing = false; }));
    window.addEventListener('resize', () => { if (this.empty) this.resize(); });
    requestAnimationFrame(() => this.resize());
  }
  resize() {
    const r = this.c.getBoundingClientRect();
    if (!r.width) return;
    const d = window.devicePixelRatio || 1;
    this.c.width = Math.round(r.width * d); this.c.height = Math.round(r.height * d);
    const x = this.ctx;
    x.setTransform(d, 0, 0, d, 0, 0);
    x.lineWidth = 2.6; x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = '#0b2545'; x.fillStyle = '#0b2545';
    this.empty = true;
  }
  clear() { this.resize(); }
  isEmpty() { return this.empty; }
  toDataURL() {
    const w = 500, h = Math.round(500 * this.c.height / this.c.width) || 200;
    const t = document.createElement('canvas'); t.width = w; t.height = h;
    t.getContext('2d').drawImage(this.c, 0, 0, w, h);
    return t.toDataURL('image/png');
  }
}

/* רכיב טופס חתימה משותף (משמש גם את הפועל וגם את החתימות הרצופות אצל המנהל) */
function signFormHTML(T) {
  return `
  <label class="fld"><span>${esc(T.fullName)}</span><input name="full_name" autocomplete="name" maxlength="80"></label>
  <label class="fld"><span>${esc(T.contractor)}</span><input name="contractor" maxlength="80"></label>
  <div class="fld"><span>${esc(T.photo)}</span>
    <div class="photo-box">
      <img class="photo-preview" alt="" hidden>
      <label class="btn btn-outline photo-btn">📷 <span class="photo-label">${esc(T.takePhoto)}</span>
        <input type="file" accept="image/*" capture="user" hidden name="photo_file">
      </label>
    </div>
  </div>
  <div class="fld"><span>${esc(T.sign)}</span>
    <div class="sig-wrap"><canvas class="sig"></canvas><div class="sig-hint">${esc(T.signHere)}</div></div>
    <button type="button" class="btn btn-link sig-clear">${esc(T.clear)}</button>
  </div>
  <label class="check"><input type="checkbox" name="attended"> <span>${esc(T.attended)}</span></label>
  <div class="form-err" hidden></div>`;
}

function bindSignForm(root, T) {
  const pad = new SigPad($('canvas.sig', root));
  const hint = $('.sig-hint', root);
  $('canvas.sig', root).addEventListener('pointerdown', () => { hint.hidden = true; });
  $('.sig-clear', root).onclick = () => { pad.clear(); hint.hidden = false; };
  let photo = null;
  const fileIn = $('input[name=photo_file]', root), prev = $('.photo-preview', root);
  fileIn.onchange = async () => {
    const f = fileIn.files[0]; if (!f) return;
    try {
      photo = await compressImage(f);
      prev.src = photo; prev.hidden = false;
      $('.photo-label', root).textContent = T.retake;
    } catch (_) { photo = null; }
  };
  const errBox = $('.form-err', root);
  return {
    pad,
    showError(msg) { errBox.textContent = msg; errBox.hidden = !msg; if (msg) errBox.scrollIntoView({ block: 'center', behavior: 'smooth' }); },
    collect() {
      const full_name = $('input[name=full_name]', root).value.trim().replace(/\s+/g, ' ');
      const contractor = $('input[name=contractor]', root).value.trim();
      const attended = $('input[name=attended]', root).checked;
      if (full_name.length < 2) return { error: T.errName };
      if (!contractor) return { error: T.errContractor };
      if (!photo) return { error: T.errPhoto };
      if (pad.isEmpty()) return { error: T.errSign };
      if (!attended) return { error: T.errAttended };
      return { full_name, contractor, attended, photo, signature: pad.toDataURL() };
    },
    reset(keepContractor = false) {
      $('input[name=full_name]', root).value = '';
      if (!keepContractor) $('input[name=contractor]', root).value = '';
      $('input[name=attended]', root).checked = false; fileIn.value = '';
      photo = null; prev.hidden = true; prev.removeAttribute('src');
      $('.photo-label', root).textContent = T.takePhoto;
      pad.clear(); hint.hidden = false; errBox.hidden = true;
    },
  };
}

/* ---------- רשימת נושאים מאוחדת: מובנים + מהספרייה האישית ---------- */
const LANG_CODES_TR = ['ar', 'ru', 'ro', 'hi', 'si'];
function briefingTopicList(b, lang = 'he') {
  const out = [];
  (b.topics || []).filter(k => TOPICS.he[k]).forEach(k => {
    const L = (TOPICS[lang] || TOPICS.he)[k];
    out.push({ icon: TOPIC_ICONS[k], t: L.t, b: L.b, custom: false });
  });
  (b.custom_topics || []).forEach(ct => {
    if (!ct || !ct.he) return;
    const tr = ct[lang];
    const ok = tr && tr.t && Array.isArray(tr.b);
    const L = ok ? tr : ct.he;
    out.push({ icon: '📄', t: L.t, b: L.b || [], custom: true, fallback: !ok && lang !== 'he' });
  });
  return out;
}
