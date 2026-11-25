/* ===== app.js — אפליקציית המנהל ===== */

const HE = Object.assign({}, {
  fullName: 'שם מלא', contractor: 'קבלן משנה / חברה', attended: 'הפועל מאשר שהשתתף בתדריך בפועל והבין את תוכנו',
  photo: 'תמונה של הפועל (חובה)', takePhoto: 'צילום תמונה', retake: 'צילום מחדש', sign: 'חתימת הפועל',
  signHere: 'חתימה באצבע', clear: 'ניקוי', errName: 'יש להקליד שם מלא', errContractor: 'יש להקליד שם קבלן',
  errAttended: 'יש לסמן אישור השתתפות', errPhoto: 'יש לצלם תמונה', errSign: 'חסרה חתימה',
});
const ERR = {
  briefing_closed: 'התדריך סגור — אי אפשר להוסיף או לשנות חתימות',
  manager_signature_required: 'חובה שם וחתימת מנהל לפני סגירה',
  password_too_short: 'סיסמת אתר — לפחות 4 תווים',
  site_not_owned: 'האתר לא שייך למשתמש',
};
function errMsg(e) {
  if (!e) return 'שגיאה';
  if (e.code === '23505') return 'שם זה כבר חתום על התדריך';
  for (const k in ERR) if ((e.message || '').includes(k)) return ERR[k];
  return e.message || 'שגיאה';
}

const app = $('#app');
let sb = null, user = null, pollTimer = null;

function toast(msg, bad = false) {
  const d = document.createElement('div'); d.className = 'toast' + (bad ? ' bad' : ''); d.textContent = msg;
  document.body.appendChild(d); setTimeout(() => d.remove(), 3500);
}
function modal(title, html) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal"><div class="modal-head"><h2>${esc(title)}</h2><button class="x" aria-label="סגירה">×</button></div><div class="modal-body">${html}</div></div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  $('.x', bg).onclick = close;
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  return { el: $('.modal-body', bg), close };
}
function loading() { app.innerHTML = '<div class="spinner"></div>'; }

/* ---------- אתחול ---------- */
async function init() {
  if (!isConfigured()) {
    app.innerHTML = `<div class="card"><h1>⚙️ נדרשת הגדרה</h1><p>יש למלא בקובץ <b>config.js</b> את כתובת ה-Supabase ואת המפתח הציבורי (anon key). ההוראות בקובץ README.</p></div>`;
    return;
  }
  sb = makeClient();
  const { data } = await sb.auth.getSession();
  user = data.session?.user || null;
  sb.auth.onAuthStateChange((_ev, session) => {
    const was = user?.id; user = session?.user || null;
    if (was !== user?.id) route();
  });
  $('#logout').onclick = async () => { await sb.auth.signOut(); location.hash = '#/'; };
  window.addEventListener('hashchange', route);
  route();
}

function route() {
  clearInterval(pollTimer);
  $('#topbar').hidden = !user;
  if (!user) return renderLogin();
  const full = location.hash.replace(/^#/, '') || '/';
  const [h, qs] = full.split('?');
  const q = new URLSearchParams(qs || '');
  if (h === '/' || h === '') return renderDashboard();
  if (h === '/new') return renderNew(q.get('site'), q.get('topic'));
  if (h === '/sites') return renderSites();
  if (h === '/library') return renderLibrary();
  if (h === '/library/new') return renderTopicEditor(null);
  const lm = h.match(/^\/library\/([0-9a-f-]{36})$/i);
  if (lm) return renderTopicEditor(lm[1]);
  const m = h.match(/^\/b\/([0-9a-f-]{36})$/i);
  if (m) return renderBriefing(m[1]);
  location.hash = '#/';
}

/* ---------- כניסה / הרשמה ---------- */
function renderLogin(mode = 'login', msg = '') {
  const signup = mode === 'signup';
  app.innerHTML = `
  <div style="max-width:420px;margin:30px auto">
    <div class="center"><div class="big-icon">⛑️</div><h1>תדריך בטיחות באתר</h1><p class="muted">${signup ? 'הרשמה של מנהל פרויקט' : 'כניסת מנהלים'}</p></div>
    <form class="card" id="lf">
      ${msg ? `<div class="alert ${msg.startsWith('✓') ? 'ok' : 'bad'}">${esc(msg)}</div>` : ''}
      <label class="fld"><span>אימייל</span><input type="email" id="em" required autocomplete="email" dir="ltr"></label>
      <label class="fld"><span>סיסמה</span><input type="password" id="pw" required minlength="6" autocomplete="${signup ? 'new-password' : 'current-password'}" dir="ltr"></label>
      <button class="btn btn-block" id="lb">${signup ? 'הרשמה' : 'כניסה'}</button>
      <div class="divider">או</div>
      <button type="button" class="btn btn-outline btn-block" id="gg"><b style="color:#4285f4">G</b> המשך עם Google</button>
      <p class="center small" style="margin-bottom:0">
        <button type="button" class="btn-link" id="sw">${signup ? 'כבר רשום? כניסה' : 'משתמש חדש? הרשמה'}</button>
        ${signup ? '' : ' · <button type="button" class="btn-link" id="fg">שכחתי סיסמה</button>'}
      </p>
    </form>
  </div>`;
  $('#sw').onclick = () => renderLogin(signup ? 'login' : 'signup');
  $('#gg').onclick = async () => {
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (error) renderLogin(mode, 'כניסה עם Google לא הוגדרה עדיין: ' + error.message);
  };
  const fg = $('#fg');
  if (fg) fg.onclick = async () => {
    const em = $('#em').value.trim(); if (!em) return toast('הקלידו אימייל קודם', true);
    const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
    renderLogin('login', error ? error.message : '✓ נשלח מייל לאיפוס סיסמה');
  };
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    const email = $('#em').value.trim(), password = $('#pw').value;
    $('#lb').disabled = true;
    const { data, error } = signup
      ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } })
      : await sb.auth.signInWithPassword({ email, password });
    if (error) return renderLogin(mode, error.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים' : error.message);
    if (signup && !data.session) return renderLogin('login', '✓ נשלח מייל אימות — אשרו אותו ואז היכנסו');
  };
}

/* ---------- דשבורד ---------- */
async function renderDashboard() {
  loading();
  const { data, error } = await sb.from('briefings')
    .select('id,briefing_date,briefing_time,foreman_name,status,site_id,sites(name),signatures(count)')
    .order('briefing_date', { ascending: false }).order('briefing_time', { ascending: false }).limit(500);
  if (error) { app.innerHTML = `<div class="card alert bad">${esc(errMsg(error))}</div>`; return; }
  const rows = data || [];
  app.innerHTML = `
    <div class="row" style="margin-bottom:12px"><h1 class="grow" style="margin:0">תדריכים</h1>
      <a class="btn" href="#/new">➕ תדריך יומי לאתר</a></div>
    <div class="card">
      <div class="row">
        <input class="grow" id="q" placeholder="🔍 חיפוש לפי אתר / מנהל עבודה">
        <input type="date" id="qd" style="max-width:180px">
        <select id="qs" style="max-width:130px"><option value="">כל הסטטוסים</option><option value="open">פתוח</option><option value="closed">סגור</option></select>
      </div>
    </div>
    <div id="list"></div>`;
  const draw = () => {
    const q = $('#q').value.trim().toLowerCase(), d = $('#qd').value, s = $('#qs').value;
    const f = rows.filter(r =>
      (!q || (r.sites?.name || '').toLowerCase().includes(q) || (r.foreman_name || '').toLowerCase().includes(q)) &&
      (!d || r.briefing_date === d) && (!s || r.status === s));
    $('#list').innerHTML = f.length ? f.map(r => `
      <a class="list-item" href="#/b/${r.id}">
        <div class="main"><div class="title">${esc(r.sites?.name || '')}</div>
          <div class="small muted">${fmtDate(r.briefing_date)} · ${fmtTime(r.briefing_time)} · ${esc(r.foreman_name)} · ${r.signatures?.[0]?.count ?? 0} חותמים</div></div>
        <span class="badge ${r.status}">${r.status === 'open' ? 'פתוח' : 'סגור'}</span>
      </a>`).join('')
      : `<div class="card center muted">${rows.length ? 'אין תוצאות לחיפוש' : 'עדיין אין תדריכים. פועלים שסורקים את ה-QR של אתר רואים רק <b>תדריך יומי שנוצר לאותו אתר להיום</b> — לחצו "תדריך יומי לאתר".'}</div>`;
  };
  ['q', 'qd', 'qs'].forEach(id => $('#' + id).addEventListener('input', draw));
  draw();
}

/* ---------- אתרים ---------- */
async function loadSites() {
  const { data, error } = await sb.from('sites').select('id,name,created_at').order('name');
  if (error) throw error;
  return data || [];
}
function siteUrl(id) { return new URL('w.html?s=' + id, location.href).href; }

async function renderSites() {
  loading();
  let sites;
  let todays = [], counts = {};
  try {
    sites = await loadSites();
    const { data, error } = await sb.from('briefings').select('id,site_id,briefing_date,status,signatures(count)');
    if (error) throw error;
    (data || []).forEach(b => { counts[b.site_id] = (counts[b.site_id] || 0) + 1; if (b.briefing_date === todayIL()) todays.push(b); });
  } catch (e) { app.innerHTML = `<div class="card alert bad">${esc(errMsg(e))}</div>`; return; }
  const todayOf = id => todays.filter(b => b.site_id === id).sort((a, b) => (a.status === 'open' ? -1 : 1))[0];
  const dupNames = sites.map(x => x.name).filter((n, i, a) => a.indexOf(n) !== i);
  app.innerHTML = `
    <h1>🏗️ אתרים</h1>
    ${dupNames.length ? `<div class="alert warn">יש כמה אתרים באותו שם (${esc([...new Set(dupNames)].join(', '))}). לכל אתר QR שונה — מחקו את הכפולים שאין בהם תדריכים כדי לא להתבלבל.</div>` : ''}
    <form class="card" id="nf"><h2>אתר חדש</h2>
      <div class="grid2">
        <label class="fld"><span>שם האתר</span><input id="sn" required placeholder="למשל: מגדל רוטשילד 22"></label>
        <label class="fld"><span>סיסמת אתר לפועלים</span><input id="sp" required minlength="4" placeholder="לפחות 4 תווים" dir="ltr"></label>
      </div>
      <button class="btn">יצירת אתר</button>
      <p class="small muted" style="margin-bottom:0">לכל אתר QR קבוע אחד. הסיסמה נשמרת מוצפנת ונבדקת בשרת.</p>
    </form>
    <div>${sites.map(s => {
      const tb = todayOf(s.id);
      const status = tb
        ? `<a class="badge ${tb.status}" href="#/b/${tb.id}">תדריך היום: ${tb.status === 'open' ? 'פתוח' : 'סגור'} · ${tb.signatures?.[0]?.count ?? 0} חותמים</a>`
        : '<span class="badge gray">אין תדריך להיום — הפועלים לא יראו כלום בסריקה</span>';
      return `
      <div class="card" style="padding:12px">
        <div class="row"><div class="grow"><div style="font-weight:700">${esc(s.name)}</div><div class="small muted">נוצר ${fmtDateTime(s.created_at).slice(0, 16)}</div></div></div>
        <div style="margin:8px 0">${status}</div>
        <div class="row">
          ${tb ? `<a class="btn" href="#/b/${tb.id}">פתיחת תדריך היום</a>` : `<a class="btn" href="#/new?site=${s.id}">➕ תדריך להיום</a>`}
          <button class="btn btn-navy" data-qr="${s.id}">QR</button>
          <button class="btn btn-ghost" data-pw="${s.id}" title="שינוי סיסמה">🔑</button>
          <button class="btn btn-ghost" data-rn="${s.id}" title="שינוי שם">✏️</button>
          ${counts[s.id] ? '' : `<button class="btn btn-danger" data-del="${s.id}" title="מחיקת אתר">🗑️</button>`}
        </div>
      </div>`;
    }).join('') || '<div class="card center muted">עוד אין אתרים</div>'}</div>`;
  $$('[data-del]').forEach(b => b.onclick = async () => {
    const st = sites.find(x => x.id === b.dataset.del);
    if (!confirm(`למחוק את האתר "${st.name}"? ה-QR שלו יפסיק לעבוד.`)) return;
    const { error } = await sb.from('sites').delete().eq('id', st.id);
    error ? toast(errMsg(error), true) : (toast('האתר נמחק'), renderSites());
  });
  $('#nf').onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.rpc('create_site', { p_name: $('#sn').value.trim(), p_password: $('#sp').value });
    if (error) return toast(errMsg(error), true);
    toast('האתר נוצר'); renderSites();
  };
  $$('[data-qr]').forEach(b => b.onclick = () => showQr(sites.find(s => s.id === b.dataset.qr)));
  $$('[data-pw]').forEach(b => b.onclick = async () => {
    const p = prompt('סיסמת אתר חדשה (לפחות 4 תווים). פועלים יתבקשו להקליד אותה מחדש:');
    if (!p) return;
    const { error } = await sb.rpc('set_site_password', { p_site: b.dataset.pw, p_password: p });
    error ? toast(errMsg(error), true) : toast('הסיסמה עודכנה');
  });
  $$('[data-rn]').forEach(b => b.onclick = async () => {
    const s = sites.find(x => x.id === b.dataset.rn);
    const n = prompt('שם האתר:', s.name); if (!n || n.trim() === s.name) return;
    const { error } = await sb.from('sites').update({ name: n.trim() }).eq('id', s.id);
    error ? toast(errMsg(error), true) : renderSites();
  });
}

function showQr(site) {
  const url = siteUrl(site.id);
  const m = modal('QR קבוע — ' + site.name, `
    <div class="qr-box" id="qrb"></div>
    <p class="small" dir="ltr" style="word-break:break-all;text-align:center">${esc(url)}</p>
    <div class="row" style="justify-content:center">
      <button class="btn" id="pr">🖨️ הדפסת שלט לאתר</button>
      <button class="btn btn-ghost" id="cp">העתקת קישור</button>
    </div>`);
  new QRCode($('#qrb', m.el), { text: url, width: 260, height: 260, correctLevel: QRCode.CorrectLevel.M });
  $('#cp', m.el).onclick = async () => { try { await navigator.clipboard.writeText(url); toast('הקישור הועתק'); } catch (_) { prompt('העתיקו:', url); } };
  $('#pr', m.el).onclick = () => {
    const pa = $('#print-area');
    pa.innerHTML = `<div class="poster" dir="rtl"><h1>⛑️ תדריך בטיחות יומי</h1><div class="site">${esc(site.name)}</div>
      <div class="qr" id="pqr"></div>
      <div class="langs">${LANGS.map(l => `<div dir="${l.dir}">${esc(TOPIC_POSTER[l.code])}</div>`).join('')}</div></div>`;
    new QRCode($('#pqr'), { text: url, width: 420, height: 420, correctLevel: QRCode.CorrectLevel.M });
    setTimeout(() => window.print(), 300);
  };
}
const TOPIC_POSTER = {
  he: 'סרקו, הקלידו את סיסמת האתר וחתמו על תדריך היום',
  ar: 'امسح الرمز، أدخل كلمة مرور الموقع ووقّع على إرشاد اليوم',
  ru: 'Отсканируйте, введите пароль объекта и подпишите сегодняшний инструктаж',
  ro: 'Scanați, introduceți parola șantierului și semnați instructajul de astăzi',
  hi: 'स्कैन करें, साइट पासवर्ड डालें और आज की ब्रीफ़िंग पर हस्ताक्षर करें',
  si: 'ස්කෑන් කර, වැඩබිම් මුරපදය ඇතුළත් කර අද උපදෙස්වලට අත්සන් කරන්න',
};

/* ---------- תדריך חדש ---------- */
async function renderNew(preSite = null, preTopic = null) {
  loading();
  let sites;
  let library = [];
  try {
    sites = await loadSites();
    const { data, error } = await sb.from('custom_topics').select('id,title,content').order('title');
    if (error) throw error; library = data || [];
  } catch (e) { app.innerHTML = `<div class="card alert bad">${esc(errMsg(e))}</div>`; return; }
  let lastTopics = null, lastCustom = [];
  try { lastTopics = JSON.parse(localStorage.getItem('sb_last_topics') || 'null'); lastCustom = JSON.parse(localStorage.getItem('sb_last_custom') || '[]'); } catch (_) {}
  const lastRecipients = localStorage.getItem('sb_last_recipients') || '';
  const lastForeman = localStorage.getItem('sb_last_foreman') || '';
  const lastSite = preSite || localStorage.getItem('sb_last_site_sel') || '';
  if (preTopic) { lastTopics = []; lastCustom = [preTopic]; }
  app.innerHTML = `
    <h1>➕ תדריך יומי לאתר</h1>
    <p class="muted small">הפועלים שסורקים את ה-QR של האתר יראו את התדריך הזה בתאריך שנבחר, ויחתמו עליו.</p>
    <form class="card" id="bf">
      <label class="fld"><span>אתר</span>
        <select id="site" required>
          <option value="">${sites.length ? 'בחרו אתר…' : 'אין אתרים — צרו אתר חדש למטה'}</option>
          ${sites.map(s => `<option value="${s.id}" ${s.id === lastSite ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
          <option value="__new">➕ אתר חדש…</option>
        </select></label>
      <div id="newsite" class="grid2" hidden>
        <label class="fld"><span>שם האתר החדש</span><input id="nsn" placeholder="מגדל רוטשילד 22"></label>
        <label class="fld"><span>סיסמת אתר לפועלים</span><input id="nsp" placeholder="לפחות 4 תווים" dir="ltr"></label>
      </div>
      <div class="grid2">
        <label class="fld"><span>תאריך</span><input type="date" id="dt" required value="${todayIL()}"></label>
        <label class="fld"><span>שעה</span><input type="time" id="tm" required value="${nowTimeIL()}"></label>
      </div>
      <label class="fld"><span>מנהל העבודה המתדרך</span><input id="fm" required value="${esc(lastForeman)}"></label>
      <div class="fld"><span>נושאי בטיחות</span>
        <div class="topic-pick">${TOPIC_KEYS.map(k => `<label><input type="checkbox" name="tp" value="${k}" ${!lastTopics || lastTopics.includes(k) ? 'checked' : ''}> ${TOPIC_ICONS[k]} ${esc(TOPICS.he[k].t)}</label>`).join('')}</div>
      </div>
      <div class="fld"><span>📚 תכני תדריך מהספרייה שלי</span>
        ${library.length ? `<div class="topic-pick">${library.map(c => `<label><input type="checkbox" name="ct" value="${c.id}" ${lastCustom.includes(c.id) ? 'checked' : ''}> 📄 ${esc(c.title)}${missingLangs(c.content).length ? ' <span class="badge open">חסר תרגום</span>' : ''}</label>`).join('')}</div>` : '<div class="small muted">עוד אין תכנים בספרייה.</div>'}
        <a class="btn-link small" href="#/library/new">➕ כתיבה / העלאה של תוכן חדש לספרייה</a>
      </div>
      <label class="fld"><span>הערות חופשיות (אופציונלי)</span><textarea id="nt" placeholder="לא מתורגמות — יוצגו לפועלים כפי שנכתבו"></textarea></label>
      <label class="fld"><span>נמעני ה-PDF בסגירה</span><textarea id="rc" dir="ltr" placeholder="safety@company.co.il, pm@company.co.il" style="min-height:60px">${esc(lastRecipients)}</textarea>
        <div class="small muted">מופרדים בפסיק או בשורה חדשה</div></label>
      <div class="form-err" id="be" hidden></div>
      <button class="btn btn-block btn-lg" id="bs">יצירת התדריך והפעלתו לפועלים</button>
    </form>`;
  const sel = $('#site');
  const syncNew = () => { $('#newsite').hidden = sel.value !== '__new'; };
  sel.onchange = syncNew; if (!sites.length) { sel.value = '__new'; } syncNew();
  $('#bf').onsubmit = async e => {
    e.preventDefault();
    const err = m => { $('#be').textContent = m; $('#be').hidden = false; };
    const topics = $$('input[name=tp]:checked').map(i => i.value);
    const customIds = $$('input[name=ct]:checked').map(i => i.value);
    if (!topics.length && !customIds.length) return err('בחרו לפחות נושא אחד');
    const custom_topics = customIds.map(id => { const c = library.find(x => x.id === id); return Object.assign({ id }, c.content); });
    const recips = $('#rc').value.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
    const bad = recips.filter(r => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r));
    if (bad.length) return err('כתובת מייל לא תקינה: ' + bad.join(', '));
    $('#bs').disabled = true;
    let siteId = sel.value;
    if (siteId === '__new') {
      const n = $('#nsn').value.trim(), p = $('#nsp').value;
      if (n.length < 2) { $('#bs').disabled = false; return err('הקלידו שם אתר'); }
      const { data, error } = await sb.rpc('create_site', { p_name: n, p_password: p });
      if (error) { $('#bs').disabled = false; return err(errMsg(error)); }
      siteId = data;
    }
    if (!siteId) { $('#bs').disabled = false; return err('בחרו אתר'); }
    const row = {
      site_id: siteId, briefing_date: $('#dt').value, briefing_time: $('#tm').value,
      foreman_name: $('#fm').value.trim(), topics, custom_topics, notes: $('#nt').value.trim() || null, recipients: recips,
    };
    const { data, error } = await sb.from('briefings').insert(row).select('id').single();
    if (error) { $('#bs').disabled = false; return err(errMsg(error)); }
    localStorage.setItem('sb_last_recipients', recips.join(', '));
    localStorage.setItem('sb_last_foreman', row.foreman_name);
    localStorage.setItem('sb_last_site_sel', siteId);
    localStorage.setItem('sb_last_topics', JSON.stringify(topics));
    localStorage.setItem('sb_last_custom', JSON.stringify(customIds));
    location.hash = '#/b/' + data.id;
  };
}

/* ---------- דף תדריך ---------- */
const photoCache = {};

async function fetchBriefing(id) {
  const { data, error } = await sb.from('briefings')
    .select('id,site_id,briefing_date,briefing_time,foreman_name,topics,custom_topics,notes,recipients,status,manager_name,manager_signature,closed_at,email_status,email_error,sites(name)')
    .eq('id', id).single();
  if (error) throw error;
  return data;
}
async function fetchSigners(id) {
  const { data, error } = await sb.from('signatures').select('id,full_name,contractor,method,signed_at')
    .eq('briefing_id', id).order('signed_at');
  if (error) throw error;
  return data || [];
}
async function fetchPhotos(ids) {
  const need = ids.filter(i => !photoCache[i]);
  if (!need.length) return;
  const { data } = await sb.from('signatures').select('id,photo,signature').in('id', need);
  (data || []).forEach(r => { photoCache[r.id] = r; });
}

function emailStatusHTML(b) {
  if (b.status !== 'closed') return '';
  const map = {
    sent: ['ok', '✓ ה-PDF נשלח במייל לנמענים'],
    failed: ['bad', '✗ שליחת המייל נכשלה' + (b.email_error ? ': ' + b.email_error : '')],
    not_configured: ['warn', 'שליחת מייל עדיין לא הוגדרה — הורידו את ה-PDF ושלחו ידנית'],
    no_recipients: ['warn', 'לא הוגדרו נמענים למייל'],
  };
  const [cls, txt] = map[b.email_status] || ['warn', 'המייל טרם נשלח'];
  return `<div class="alert ${cls}">${esc(txt)}</div>`;
}

async function renderBriefing(id) {
  loading();
  let b, signers;
  try { [b, signers] = await Promise.all([fetchBriefing(id), fetchSigners(id)]); }
  catch (e) { app.innerHTML = `<div class="card alert bad">${esc(errMsg(e))}</div>`; return; }
  const open = b.status === 'open';
  const isToday = b.briefing_date === todayIL();

  app.innerHTML = `
    <div class="row" style="margin-bottom:10px"><a class="btn-link" href="#/">→ חזרה לרשימה</a></div>
    <div class="card">
      <div class="row"><h1 class="grow" style="margin:0">${esc(b.sites?.name || '')}</h1><span class="badge ${b.status}">${open ? 'פתוח' : 'סגור'}</span></div>
      <dl class="kv" style="margin-top:10px">
        <dt>תאריך</dt><dd>${fmtDate(b.briefing_date)}</dd>
        <dt>שעה</dt><dd>${fmtTime(b.briefing_time)}</dd>
        <dt>מנהל עבודה</dt><dd>${esc(b.foreman_name)}</dd>
        <dt>נמענים</dt><dd dir="ltr" style="text-align:right">${esc((b.recipients || []).join(', ') || '—')}</dd>
        ${b.closed_at ? `<dt>נסגר</dt><dd>${fmtDateTime(b.closed_at)} · ${esc(b.manager_name || '')}</dd>` : ''}
      </dl>
      ${open && !isToday ? `<div class="alert warn" style="margin-top:10px">התדריך אינו מתאריך היום — הוא לא יוצג לפועלים ב-QR. חתימה אפשרית רק על טלפון זה.</div>` : ''}
      <div class="row" style="margin-top:12px">
        <button class="btn btn-navy" id="pdf">📄 הורדת PDF</button>
        ${open ? `<button class="btn btn-ghost" id="qr">QR של האתר</button>` : ''}
        ${open && signers.length === 0 ? `<button class="btn btn-danger" id="del">מחיקה</button>` : ''}
      </div>
    </div>
    ${b.status === 'closed' ? `<div class="card">${emailStatusHTML(b)}${(b.recipients || []).length ? '<button class="btn btn-ghost" id="resend">שליחה חוזרת במייל</button>' : ''}</div>` : ''}
    <div class="card">
      <h2>נושאי התדריך</h2>
      ${briefingTopicList(b, 'he').map(tp => `<div class="topic"><h3>${tp.icon} ${esc(tp.t)}${tp.custom ? ' <span class="badge gray">מהספרייה</span>' : ''}</h3><ul>${tp.b.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
      ${b.notes ? `<h3>הערות</h3><div class="notes-box">${esc(b.notes)}</div>` : ''}
    </div>
    <div class="card">
      <div class="row"><h2 class="grow" style="margin:0">חותמים (<span id="cnt">${signers.length}</span>)</h2>
        ${open ? `<button class="btn" id="seq">✍️ חתימות על טלפון זה</button>` : ''}</div>
      <div id="signers" style="margin-top:8px"></div>
    </div>
    ${open ? `
    <form class="card" id="cf">
      <h2>🔒 סגירת התדריך</h2>
      <p class="small muted">לאחר הסגירה אי אפשר להוסיף או לשנות חתימות. ה-PDF יופק וישלח לנמענים.</p>
      <label class="fld"><span>שם המנהל המאשר</span><input id="mn" required value="${esc(localStorage.getItem('sb_manager_name') || '')}"></label>
      <div class="fld"><span>חתימת המנהל</span><div class="sig-wrap"><canvas class="sig" id="msig"></canvas><div class="sig-hint" id="mh">חתמו כאן</div></div>
        <button type="button" class="btn-link" id="mclr">ניקוי</button></div>
      <div class="form-err" id="ce" hidden></div>
      <button class="btn btn-navy btn-block btn-lg" id="cb">סגירת תדריך</button>
    </form>` : `
    <div class="card"><h2>אישור המנהל</h2><p><b>${esc(b.manager_name || '')}</b> · ${fmtDateTime(b.closed_at)}</p>
      ${b.manager_signature ? `<img src="${b.manager_signature}" style="max-height:90px;border:1px solid var(--line);border-radius:8px;background:#fff">` : ''}</div>`}
  `;

  const drawSigners = async list => {
    $('#cnt').textContent = list.length;
    const box = $('#signers');
    if (!list.length) { box.innerHTML = `<p class="muted">עדיין אין חותמים${open ? ' — הפועלים סורקים את ה-QR של האתר, או חותמים כאן על הטלפון' : ''}</p>`; return; }
    box.innerHTML = list.map((s, i) => `
      <div class="signer" data-id="${s.id}">
        <span class="muted small" style="width:22px">${i + 1}</span>
        <span class="ph-empty"></span>
        <div class="info"><b>${esc(s.full_name)}</b><div class="small muted">${esc(s.contractor)} · ${fmtDateTime(s.signed_at)} · ${s.method === 'qr' ? 'QR' : 'טלפון המנהל'}</div></div>
        <span class="sg-slot"></span>
      </div>`).join('');
    await fetchPhotos(list.map(s => s.id));
    list.forEach(s => {
      const p = photoCache[s.id]; if (!p) return;
      const row = box.querySelector(`[data-id="${s.id}"]`); if (!row) return;
      const img = document.createElement('img'); img.className = 'ph'; img.src = p.photo; img.alt = s.full_name;
      img.onclick = () => modal(s.full_name, `<img src="${p.photo}" style="width:100%;border-radius:12px"><p class="center"><img src="${p.signature}" style="max-width:100%;max-height:120px"></p>`);
      row.querySelector('.ph-empty').replaceWith(img);
      row.querySelector('.sg-slot').innerHTML = `<img class="sg" src="${p.signature}" alt="">`;
    });
  };
  drawSigners(signers);

  $('#pdf').onclick = async () => {
    const btn = $('#pdf'); btn.disabled = true; btn.textContent = 'מפיק PDF…';
    try { const fresh = await fetchBriefing(id); const blob = await makePdf(fresh); downloadBlob(blob, pdfName(fresh)); }
    catch (e) { toast('שגיאה בהפקת PDF: ' + (e.message || e), true); }
    btn.disabled = false; btn.textContent = '📄 הורדת PDF';
  };
  const qrb = $('#qr'); if (qrb) qrb.onclick = () => showQr({ id: b.site_id, name: b.sites?.name || '' });
  const del = $('#del'); if (del) del.onclick = async () => {
    if (!confirm('למחוק את התדריך?')) return;
    const { error } = await sb.from('briefings').delete().eq('id', id);
    error ? toast(errMsg(error), true) : (location.hash = '#/');
  };
  const rs = $('#resend'); if (rs) rs.onclick = async () => { rs.disabled = true; await sendEmail(b); renderBriefing(id); };

  if (!open) return;

  // רענון אוטומטי של רשימת החותמים
  pollTimer = setInterval(async () => {
    if (location.hash !== '#/b/' + id) return clearInterval(pollTimer);
    try { const l = await fetchSigners(id); if (l.length !== Number($('#cnt').textContent)) drawSigners(l); } catch (_) {}
  }, 8000);

  $('#seq').onclick = () => openSeqSign(b, () => fetchSigners(id).then(drawSigners));

  const pad = new SigPad($('#msig'));
  $('#msig').addEventListener('pointerdown', () => { $('#mh').hidden = true; });
  $('#mclr').onclick = () => { pad.clear(); $('#mh').hidden = false; };
  $('#cf').onsubmit = async e => {
    e.preventDefault();
    const err = m => { $('#ce').textContent = m; $('#ce').hidden = !m; };
    const mn = $('#mn').value.trim();
    if (mn.length < 2) return err('הקלידו שם מנהל');
    if (pad.isEmpty()) return err('חסרה חתימת מנהל');
    const n = Number($('#cnt').textContent);
    if (!confirm(`לסגור את התדריך עם ${n} חותמים? לאחר הסגירה לא ניתן להוסיף חתימות.`)) return;
    err(''); const cb = $('#cb'); cb.disabled = true; cb.textContent = 'סוגר…';
    clearInterval(pollTimer);
    localStorage.setItem('sb_manager_name', mn);
    const { error } = await sb.from('briefings').update({ status: 'closed', manager_name: mn, manager_signature: pad.toDataURL() }).eq('id', id);
    if (error) { cb.disabled = false; cb.textContent = 'סגירת תדריך'; return err(errMsg(error)); }
    toast('התדריך נסגר');
    cb.textContent = 'מפיק PDF ושולח…';
    const closed = await fetchBriefing(id);
    await sendEmail(closed);
    renderBriefing(id);
  };
}

/* ---------- חתימות רצופות על טלפון המנהל ---------- */
function openSeqSign(b, onDone) {
  let count = 0;
  const m = modal('חתימות על טלפון זה', `
    <p class="small muted">העבירו את הטלפון מפועל לפועל. אחרי כל חתימה הטופס מתאפס לפועל הבא (שם הקבלן נשמר).</p>
    <div class="alert ok" id="sq-ok" hidden></div>
    <form id="sqf" novalidate>${signFormHTML(HE)}
      <div class="row"><button class="btn grow btn-lg" id="sqb">שמירה ופועל הבא</button>
      <button type="button" class="btn btn-ghost btn-lg" id="sqd">סיום</button></div>
    </form>`);
  const form = $('#sqf', m.el);
  const ctl = bindSignForm(form, HE);
  const finish = () => { m.close(); onDone(); };
  $('#sqd', m.el).onclick = finish;
  $('.x', m.el.parentElement).onclick = finish;
  form.onsubmit = async e => {
    e.preventDefault();
    const v = ctl.collect();
    if (v.error) return ctl.showError(v.error);
    const btn = $('#sqb', m.el); btn.disabled = true;
    const { error } = await sb.from('signatures').insert({
      briefing_id: b.id, full_name: v.full_name, contractor: v.contractor, attended: true,
      photo: v.photo, signature: v.signature, method: 'manager',
    });
    btn.disabled = false;
    if (error) return ctl.showError(errMsg(error));
    count++;
    const ok = $('#sq-ok', m.el); ok.hidden = false; ok.textContent = `✓ ${v.full_name} נחתם (${count} בסבב זה)`;
    ctl.reset(true);
    m.el.parentElement.parentElement.scrollTop = 0;
    $('input[name=full_name]', form).focus();
  };
}

/* ---------- ספריית תדריכים אישית ---------- */
function missingLangs(content) {
  return LANG_CODES_TR.filter(l => !(content && content[l] && content[l].t && (content[l].b || []).length === (content.he.b || []).length));
}
async function gtx(text, tl) {
  const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=he&tl=' + tl + '&dt=t&q=' + encodeURIComponent(text));
  if (!r.ok) throw new Error('שירות התרגום החזיר ' + r.status);
  const j = await r.json();
  return (j[0] || []).map(x => x[0]).join('');
}
async function translateTopic(t, bullets, tl) {
  const lines = [t, ...bullets];
  let out = null;
  const joined = lines.join('\n');
  if (joined.length < 1500) {
    try { out = (await gtx(joined, tl)).split('\n').map(x => x.trim()); } catch (_) { out = null; }
  }
  if (!out || out.length !== lines.length) {
    out = [];
    for (const l of lines) out.push((await gtx(l, tl)).trim());
  }
  return { t: out[0], b: out.slice(1) };
}
function parseLines(text) {
  return String(text || '').split(/\r?\n/)
    .map(l => l.replace(/^\s*(?:[•●○◦▪■\-–—*·]+|\d{1,2}[.)])\s*/, '').trim())
    .filter(Boolean);
}

async function renderLibrary() {
  loading();
  const { data, error } = await sb.from('custom_topics').select('id,title,content,updated_at').order('title');
  if (error) { app.innerHTML = `<div class="card alert bad">${esc(errMsg(error))}</div>`; return; }
  app.innerHTML = `
    <div class="row" style="margin-bottom:12px"><h1 class="grow" style="margin:0">📚 תכני תדריך — הספרייה שלי</h1>
      <a class="btn" href="#/library/new">➕ תוכן חדש</a></div>
    <p class="muted small">תדריכים שכתבת או העלית, עם תרגום לכל השפות. בוחרים אותם בעת יצירת תדריך יומי, לצד 6 הנושאים המובנים.</p>
    ${(data || []).map(c => {
      const miss = missingLangs(c.content);
      return `<div class="card" style="padding:12px">
        <div class="row"><div class="grow"><div style="font-weight:700">📄 ${esc(c.title)}</div>
          <div class="small muted">${(c.content.he.b || []).length} סעיפים · עודכן ${fmtDateTime(c.updated_at).slice(0, 10)}</div></div>
          ${miss.length ? `<span class="badge open">חסר תרגום: ${miss.length}</span>` : '<span class="badge closed">6 שפות</span>'}</div>
        <div class="row" style="margin-top:8px">
          <a class="btn" href="#/new?topic=${c.id}">📤 שליחה לאתר כתדריך יומי</a>
          <a class="btn btn-ghost" href="#/library/${c.id}">✏️ עריכה</a>
        </div></div>`;
    }).join('') || '<div class="card center muted">הספרייה ריקה. לחצו "תוכן חדש" כדי לכתוב או להעלות תדריך.</div>'}
    <p class="small muted">תוכן בספרייה לא מוצג לפועלים לבד — לוחצים "שליחה לאתר" כדי ליצור ממנו תדריך יומי לאתר.</p>`;
}

async function renderTopicEditor(id) {
  loading();
  let row = null;
  if (id) {
    const { data, error } = await sb.from('custom_topics').select('id,title,content').eq('id', id).single();
    if (error) { app.innerHTML = `<div class="card alert bad">${esc(errMsg(error))}</div>`; return; }
    row = data;
  }
  const content = row ? JSON.parse(JSON.stringify(row.content)) : { he: { t: '', b: [] } };
  const trLangs = LANGS.filter(l => l.code !== 'he');
  app.innerHTML = `
    <div class="row" style="margin-bottom:10px"><a class="btn-link" href="#/library">→ חזרה לספרייה</a></div>
    <h1>${row ? '✏️ עריכת תוכן תדריך' : '➕ תוכן תדריך חדש לספרייה'}</h1>
    <div class="card">
      <h2>1. התדריך בעברית</h2>
      <label class="fld"><span>כותרת</span><input id="he-t" maxlength="200" value="${esc(content.he.t)}" placeholder="למשל: עבודה ליד בור חפירה"></label>
      <label class="fld"><span>סעיפים — כל שורה היא סעיף</span>
        <textarea id="he-b" style="min-height:170px" placeholder="אסור לעבוד ליד שפת הבור בלי מעקה&#10;ירידה לבור רק בסולם מאושר&#10;...">${esc((content.he.b || []).join('\n'))}</textarea></label>
      <div class="row">
        <label class="btn btn-ghost">📎 העלאת קובץ (Word / טקסט)<input type="file" id="upl" accept=".docx,.txt,.md,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden></label>
        <span class="small muted">התוכן מהקובץ ייכנס לשדות למעלה — אפשר לערוך לפני התרגום</span>
      </div>
    </div>
    <div class="card">
      <div class="row"><h2 class="grow" style="margin:0">2. תרגום לשפות הפועלים</h2>
        <button class="btn btn-navy" id="trb">🌐 תרגום אוטומטי לכל השפות</button></div>
      <div class="alert warn small" id="stale" hidden style="margin-top:10px">העברית שונתה אחרי התרגום — מומלץ לתרגם מחדש.</div>
      <p class="small muted">התרגום אוטומטי (Google Translate). אפשר לתקן כל שפה ידנית. מומלץ שדובר השפה יעבור על התרגום לפני שימוש.</p>
      <div id="trs">${trLangs.map(l => `
        <details class="card" style="margin:8px 0;padding:10px 12px" data-l="${l.code}">
          <summary style="cursor:pointer;font-weight:700">${esc(l.name)} <span class="badge st"></span></summary>
          <div dir="${l.dir}" style="margin-top:10px">
            <label class="fld"><span>כותרת</span><input class="tr-t" value="${esc(content[l.code]?.t || '')}"></label>
            <label class="fld"><span>סעיפים</span><textarea class="tr-b" style="min-height:130px">${esc((content[l.code]?.b || []).join('\n'))}</textarea></label>
          </div>
        </details>`).join('')}</div>
    </div>
    <div class="form-err" id="ee" hidden></div>
    <div class="row sticky-actions">
      <button class="btn btn-lg grow" id="sv">💾 שמירה בספרייה</button>
      ${row ? '<button class="btn btn-danger btn-lg" id="dl">מחיקה</button>' : ''}
    </div>`;

  const he = () => ({ t: $('#he-t').value.trim(), b: parseLines($('#he-b').value) });
  const readTr = l => { const d = $(`details[data-l="${l}"]`); return { t: $('.tr-t', d).value.trim(), b: parseLines($('.tr-b', d).value) }; };
  const refreshStatus = () => {
    const n = he().b.length;
    trLangs.forEach(l => {
      const tr = readTr(l.code), badge = $(`details[data-l="${l.code}"] .st`);
      const ok = tr.t && tr.b.length && tr.b.length === n;
      badge.className = 'badge st ' + (ok ? 'closed' : 'open');
      badge.textContent = ok ? '✓ מתורגם' : (tr.t || tr.b.length ? 'מספר סעיפים לא תואם' : 'לא תורגם');
    });
  };
  refreshStatus();
  let translatedFrom = row ? JSON.stringify(content.he) : null;
  const onHeChange = () => { $('#stale').hidden = !translatedFrom || translatedFrom === JSON.stringify(he()); refreshStatus(); };
  $('#he-t').addEventListener('input', onHeChange); $('#he-b').addEventListener('input', onHeChange);
  $$('.tr-t, .tr-b').forEach(el => el.addEventListener('input', refreshStatus));
  const err = m => { $('#ee').textContent = m; $('#ee').hidden = !m; };

  $('#upl').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      let text;
      if (/\.docx$/i.test(f.name)) {
        if (!window.mammoth) throw new Error('רכיב קריאת Word לא נטען');
        text = (await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value;
      } else text = await f.text();
      const lines = parseLines(text);
      if (!lines.length) throw new Error('הקובץ ריק');
      if (!$('#he-t').value.trim()) { $('#he-t').value = lines.shift().slice(0, 200); }
      $('#he-b').value = lines.join('\n');
      onHeChange(); toast(`נטענו ${lines.length} סעיפים מהקובץ`);
    } catch (x) { toast('לא הצלחתי לקרוא את הקובץ: ' + (x.message || x), true); }
    e.target.value = '';
  };

  $('#trb').onclick = async () => {
    const h = he();
    if (h.t.length < 2 || !h.b.length) return err('כתבו כותרת ולפחות סעיף אחד בעברית');
    err('');
    const btn = $('#trb'); btn.disabled = true;
    let done = 0, failed = [];
    for (const l of trLangs) {
      btn.textContent = `מתרגם… ${l.name} (${++done}/${trLangs.length})`;
      try {
        const tr = await translateTopic(h.t, h.b, l.code);
        const d = $(`details[data-l="${l.code}"]`);
        $('.tr-t', d).value = tr.t; $('.tr-b', d).value = tr.b.join('\n');
      } catch (x) { failed.push(l.name); }
    }
    btn.disabled = false; btn.textContent = '🌐 תרגום אוטומטי לכל השפות';
    translatedFrom = JSON.stringify(h); $('#stale').hidden = true; refreshStatus();
    failed.length ? toast('התרגום נכשל ל: ' + failed.join(', ') + ' — נסו שוב או מלאו ידנית', true) : toast('התרגום הושלם — אפשר לפתוח כל שפה ולבדוק');
  };

  $('#sv').onclick = async () => {
    const h = he();
    if (h.t.length < 2) return err('חסרה כותרת');
    if (!h.b.length) return err('חסר לפחות סעיף אחד');
    const c = { he: h };
    trLangs.forEach(l => { const tr = readTr(l.code); if (tr.t && tr.b.length) c[l.code] = tr; });
    const stale = translatedFrom && translatedFrom !== JSON.stringify(h);
    if (missingLangs(c).length || stale) {
      // תרגום אוטומטי לפני שמירה לשפות שחסרות (או כשהעברית השתנתה)
      const btn = $('#sv'); btn.disabled = true;
      for (const l of trLangs) {
        if (!stale && !missingLangs(c).includes(l.code)) continue;
        btn.textContent = 'מתרגם… ' + l.name;
        try { c[l.code] = await translateTopic(h.t, h.b, l.code); } catch (_) {}
      }
      btn.disabled = false; btn.textContent = '💾 שמירה בספרייה';
    }
    const miss = missingLangs(c);
    if (miss.length && !confirm(`ב-${miss.length} שפות התרגום חסר או לא תואם למספר הסעיפים — פועלים בשפות אלה יראו את התדריך בעברית. לשמור בכל זאת?`)) return;
    const btn = $('#sv'); btn.disabled = true;
    const payload = { title: h.t, content: c, updated_at: new Date().toISOString() };
    const res = row ? await sb.from('custom_topics').update(payload).eq('id', row.id).select('id').single()
                    : await sb.from('custom_topics').insert(payload).select('id').single();
    btn.disabled = false;
    if (res.error) return err(errMsg(res.error));
    toast('נשמר בספרייה');
    location.hash = confirm('נשמר. ליצור ממנו עכשיו תדריך יומי לאתר, כדי שהפועלים יראו אותו בסריקת ה-QR?')
      ? '#/new?topic=' + res.data.id : '#/library';
  };
  const dl = $('#dl');
  if (dl) dl.onclick = async () => {
    if (!confirm('למחוק את התדריך מהספרייה? תדריכים יומיים שכבר נוצרו איתו לא ישתנו.')) return;
    const { error } = await sb.from('custom_topics').delete().eq('id', row.id);
    error ? toast(errMsg(error), true) : (location.hash = '#/library');
  };
}

/* ---------- PDF ---------- */
function pdfName(b) {
  return `תדריך בטיחות - ${(b.sites?.name || '').replace(/[\\/:*?"<>|]/g, '')} - ${fmtDate(b.briefing_date)}.pdf`;
}
function downloadBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function makePdf(b) {
  const { data: sigs, error } = await sb.from('signatures').select('full_name,contractor,method,signed_at,signature')
    .eq('briefing_id', b.id).order('signed_at');
  if (error) throw error;
  const loadImg = src => new Promise(r => { if (!src) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  const sigImgs = await Promise.all(sigs.map(s => loadImg(s.signature)));
  const mgrImg = await loadImg(b.manager_signature);

  // A4 ב-150dpi; הטקסט מצויר במנוע הטקסט של הדפדפן (תומך עברית/ערבית מלא)
  const W = 1240, H = 1754, M = 80, R = W - M, CW = W - 2 * M;
  const FONT = 'Arial, "Noto Sans Hebrew", "Noto Sans Arabic", "Segoe UI", sans-serif';
  const holder = document.createElement('div'); holder.style.cssText = 'position:fixed;left:-99999px;top:0;width:1px;height:1px;overflow:hidden';
  holder.setAttribute('dir', 'rtl'); document.body.appendChild(holder);
  const pages = []; let ctx, y;
  const newPage = () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.setAttribute('dir', 'rtl'); holder.appendChild(c);
    ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    try { ctx.direction = 'rtl'; } catch (_) {}
    ctx.textBaseline = 'top'; ctx.textAlign = 'right'; pages.push(c); y = M;
  };
  const font = (sz, bold) => { ctx.font = `${bold ? 'bold ' : ''}${sz}px ${FONT}`; };
  const ensure = h => { if (y + h > H - M - 20) newPage(); };
  const wrap = (text, maxW) => {
    const out = [];
    String(text ?? '').split('\n').forEach(par => {
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach(w => {
        const t = line ? line + ' ' + w : w;
        if (ctx.measureText(t).width <= maxW || !line) line = t; else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  };
  const text = (t, x, yy, { size = 24, bold = false, color = '#111', align = 'right', dir = 'rtl' } = {}) => {
    font(size, bold); ctx.fillStyle = color; ctx.textAlign = align; try { ctx.direction = dir; } catch (_) {}
    ctx.fillText(t, x, yy); try { ctx.direction = 'rtl'; } catch (_) {} ctx.textAlign = 'right';
  };
  const para = (t, { size = 24, bold = false, color = '#111', indent = 0, gap = 8 } = {}) => {
    font(size, bold); const lh = Math.round(size * 1.42);
    wrap(t, CW - indent).forEach(l => { ensure(lh); text(l, R - indent, y, { size, bold, color }); y += lh; });
    y += gap;
  };
  const heading = t => { ensure(70); y += 10; para(t, { size: 30, bold: true, color: '#0b2545', gap: 6 }); };
  // טבלה: עמודות מימין לשמאל
  const table = (cols, rows, { header = true, rowMin = 44 } = {}) => {
    const pad = 10, size = 22, lh = 30;
    const drawRow = (cells, isHead, imgCell) => {
      font(size, isHead);
      const lines = cells.map((c, i) => (c && c.img !== undefined) ? null : wrap(c ?? '', cols[i].w - 2 * pad));
      const hgt = Math.max(rowMin, ...lines.map(l => l ? l.length * lh + 2 * pad : 0), imgCell ? 76 : 0);
      const before = pages.length; ensure(hgt);
      if (header && !isHead && pages.length !== before) { drawRow(cols.map(c => c.h), true); font(size, false); }
      let x = R;
      cells.forEach((c, i) => {
        const w = cols[i].w;
        if (isHead) { ctx.fillStyle = '#eceff3'; ctx.fillRect(x - w, y, w, hgt); }
        ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 1.5; ctx.strokeRect(x - w, y, w, hgt);
        if (lines[i]) lines[i].forEach((l, k) => text(l, cols[i].ltr ? x - w + pad : x - pad, y + pad + k * lh + 2,
          { size, bold: isHead, align: cols[i].ltr ? 'left' : 'right', dir: cols[i].ltr ? 'ltr' : 'rtl' }));
        else if (c.img) {
          const im = c.img, mh = hgt - 12, mw = w - 16, s = Math.min(mw / im.width, mh / im.height);
          ctx.drawImage(im, x - w / 2 - im.width * s / 2, y + hgt / 2 - im.height * s / 2, im.width * s, im.height * s);
        }
        x -= w;
      });
      y += hgt;
    };
    if (header) drawRow(cols.map(c => c.h), true);
    rows.forEach(r => drawRow(r.cells, false, r.img));
  };

  newPage();
  // כותרת
  text('תדריך בטיחות יומי באתר', R, y, { size: 44, bold: true, color: '#0b2545' });
  text(`הופק: ${fmtDateTime(new Date())}`, M, y + 6, { size: 19, color: '#555', align: 'left', dir: 'ltr' });
  y += 58;
  text(b.sites?.name || '', R, y, { size: 32, bold: true });
  text(b.status === 'closed' ? 'סטטוס: סגור' : 'סטטוס: פתוח — טיוטה', M, y + 6, { size: 21, color: b.status === 'closed' ? '#1a8f4b' : '#b54708', align: 'left' });
  y += 50; ctx.fillStyle = '#f28c00'; ctx.fillRect(M, y, CW, 6); y += 24;

  table([{ w: 240 }, { w: 300 }, { w: 220 }, { w: CW - 760 }], [
    { cells: ['תאריך', fmtDate(b.briefing_date), 'שעה', fmtTime(b.briefing_time)] },
    { cells: ['מנהל עבודה מתדרך', b.foreman_name, 'מספר חותמים', String(sigs.length)] },
  ], { header: false });

  heading('נושאי התדריך');
  briefingTopicList(b, 'he').forEach(tp => {
    ensure(80);
    para('• ' + tp.t, { size: 25, bold: true, gap: 2 });
    tp.b.forEach(x => para('– ' + x, { size: 22, color: '#333', indent: 26, gap: 0 }));
    y += 10;
  });
  if (b.notes) { heading('הערות'); para(b.notes, { size: 23 }); }

  heading('רשימת משתתפים וחתימות');
  const cols = [{ h: '#', w: 60 }, { h: 'שם מלא', w: 300 }, { h: 'קבלן', w: 250 }, { h: 'חותמת זמן', w: 230, ltr: true }, { h: 'חתימה', w: CW - 840 }];
  table(cols, sigs.length ? sigs.map((s, i) => ({ img: true, cells: [String(i + 1), s.full_name, s.contractor, fmtDateTime(s.signed_at), { img: sigImgs[i] }] }))
    : [{ cells: ['', 'אין חותמים', '', '', ''] }]);
  y += 8;
  para('כל משתתף אישר שהשתתף בתדריך בפועל והבין את תוכנו, וצילם תמונה עצמית בעת החתימה (התמונות שמורות במערכת).', { size: 19, color: '#555' });

  // אישור מנהל
  ensure(220); y += 14;
  const boxTop = y;
  y += 18; text('אישור המנהל', R - 20, y, { size: 28, bold: true, color: '#0b2545' }); y += 46;
  if (b.status === 'closed') {
    text(`שם: ${b.manager_name || ''}`, R - 20, y, { size: 24, bold: true });
    text(`נסגר: ${fmtDateTime(b.closed_at)}`, R - 520, y, { size: 22 });
    y += 40;
    if (mgrImg) { const s = Math.min(320 / mgrImg.width, 100 / mgrImg.height); ctx.drawImage(mgrImg, R - 20 - mgrImg.width * s, y, mgrImg.width * s, mgrImg.height * s); y += mgrImg.height * s + 10; }
  } else { text('התדריך טרם נסגר — מסמך זה אינו סופי', R - 20, y, { size: 24, color: '#b54708' }); y += 44; }
  y += 10; ctx.strokeStyle = '#0b2545'; ctx.lineWidth = 3; ctx.strokeRect(M, boxTop, CW, y - boxTop);

  // מספרי עמודים
  pages.forEach((c, i) => {
    ctx = c.getContext('2d');
    text(`עמוד ${i + 1} מתוך ${pages.length} · ${b.sites?.name || ''} · ${fmtDate(b.briefing_date)}`, W / 2, H - 50, { size: 18, color: '#777', align: 'center' });
  });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  pages.forEach((c, i) => { if (i) pdf.addPage(); pdf.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297); });
  holder.remove();
  return pdf.output('blob');
}

/* ---------- מייל ---------- */
function blobToBase64(blob) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
}
async function setEmailStatus(id, status, msg = null) {
  await sb.from('briefings').update({ email_status: status, email_error: msg }).eq('id', id);
}
async function sendEmail(b) {
  if (!(b.recipients || []).length) return setEmailStatus(b.id, 'no_recipients');
  let blob;
  try { blob = await makePdf(b); } catch (e) { return setEmailStatus(b.id, 'failed', 'הפקת PDF נכשלה'); }
  const pdf_base64 = await blobToBase64(blob);
  try {
    const { data, error } = await sb.functions.invoke('send-briefing-email', { body: { briefing_id: b.id, pdf_base64, filename: pdfName(b) } });
    if (error) {
      const st = error.context?.status;
      if (!st || st === 404) return setEmailStatus(b.id, 'not_configured'); // הפונקציה לא נפרסה עדיין
      let m = error.message; try { m = (await error.context.json()).error || m; } catch (_) {}
      return setEmailStatus(b.id, 'failed', m);
    }
    if (data?.status === 'not_configured') return setEmailStatus(b.id, 'not_configured');
    // הפונקציה מעדכנת בעצמה sent/failed
  } catch (_) { return setEmailStatus(b.id, 'not_configured'); }
}

init();
