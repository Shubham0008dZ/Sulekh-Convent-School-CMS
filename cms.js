
const STATE = {
  panel  : 'dashboard',
  sheet  : '',
  fields : [],
  rows   : [],
  editRow: null,
  user   : null,
};

// ── Date helpers ──────────────────────────────────────────────
function toHtmlDate(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d,m,y] = val.split('-');
    return `${y}-${m}-${d}`;
  }
  try {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      return dt.toISOString().split('T')[0];
    }
  } catch(e) {}
  return '';
}

function toDisplayDate(htmlVal) {
  if (!htmlVal) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(htmlVal)) {
    const [y,m,d] = htmlVal.split('-');
    return `${d}-${m}-${y}`;
  }
  return htmlVal;
}

function cleanBdDate(val) {
  if (!val) return '';
  if (/^\d{2}-\d{2}$/.test(val)) return val;
  try {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      const d = String(dt.getDate()).padStart(2,'0');
      const m = String(dt.getMonth()+1).padStart(2,'0');
      return `${d}-${m}`;
    }
  } catch(e) {}
  const match = String(val).match(/^(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : '';
}

function getYTThumb(url) {
  if (!url) return '';
  const m = (url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

// ── Panel configs ─────────────────────────────────────────────
const PANELS = {
  slider:{
    sheet:'home_slider',title:'Hero Slider',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'subtitle',label:'Subtitle',type:'text'},
      {key:'tag',label:'Tag (small label)',type:'text'},
      {key:'button1_text',label:'Button 1 Text',type:'text'},
      {key:'button1_link',label:'Button 1 Link',type:'text'},
      {key:'button2_text',label:'Button 2 Text',type:'text'},
      {key:'button2_link',label:'Button 2 Link',type:'text'},
      {key:'bg_color',label:'BG Color',type:'color'},
      {key:'image_url',label:'Slide Image',type:'image'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Title','Subtitle','Active','Actions'],
    row:r=>[r.sr_no,r.title,trunc(r.subtitle||'—',35),yesno(r.active),acts(r)],
  },
  news:{
    sheet:'home_news',title:'News Ticker',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'news_text',label:'News Text',type:'text',req:true},
      {key:'link_url',label:'Link URL',type:'text'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','News Text','Active','Actions'],
    row:r=>[r.sr_no,trunc(r.news_text||'',55),yesno(r.active),acts(r)],
  },
  quicklinks:{
    sheet:'home_quicklinks',title:'Quick Links',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'label',label:'Label',type:'text',req:true},
      {key:'icon',label:'Icon',type:'text',hint:'form / users / book / phone'},
      {key:'link_url',label:'Link URL',type:'text'},
    ],
    cols:['Sr','Label','Icon','Link','Actions'],
    row:r=>[r.sr_no,r.label,r.icon||'—',r.link_url||'—',acts(r,false)],
  },
  toppers:{
    sheet:'home_toppers',title:'Our Toppers',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'student_name',label:'Student Name',type:'text',req:true},
      {key:'class',label:'Class',type:'text',req:true},
      {key:'percentage',label:'Percentage %',type:'text',req:true},
      {key:'photo_url',label:'Photo',type:'image'},
      {key:'year',label:'Year',type:'text'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Name','Class','%','Year','Active','Actions'],
    row:r=>[r.sr_no,r.student_name,r.class,r.percentage+'%',r.year||'—',yesno(r.active),acts(r)],
  },
  birthdays:{
    sheet:'home_birthdays',title:'Birthdays',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'student_name',label:'Student Name',type:'text',req:true},
      {key:'class',label:'Class',type:'text'},
      {key:'date',label:'Date (DD-MM)',type:'ddmm',req:true,hint:'Format: 25-01 (day-month only)'},
    ],
    cols:['Sr','Name','Class','Date (DD-MM)','Actions'],
    row:r=>[r.sr_no,r.student_name,r.class||'—',cleanBdDate(r.date)||r.date,acts(r,false)],
  },
  circulars:{
    sheet:'home_circulars',title:'School Circulars',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'description',label:'Description',type:'textarea'},
      {key:'file_url',label:'Circular PDF / File',type:'fileurl'},
      {key:'date',label:'Circular Date (DD-MM-YYYY)',type:'date'},
      {key:'start_date',label:'Publish From (DD-MM-YYYY)',type:'date',hint:'Circular shows from this date'},
      {key:'end_date',label:'Publish Until (DD-MM-YYYY)',type:'date',hint:'Circular hides after this date'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Title','Description','Date','From','Until','Active','Actions'],
    row:r=>[r.sr_no,r.title,trunc(r.description||'—',30),r.date||'—',
            r.start_date||'Always',r.end_date||'Always',yesno(r.active),acts(r)],
  },
  departments:{
    sheet:'home_departments',title:'Departments Preview',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'dept_name',label:'Dept Name',type:'text',req:true},
      {key:'short_desc',label:'Short Description',type:'textarea'},
      {key:'link_url',label:'Link URL',type:'text'},
      {key:'bg_color',label:'BG Color',type:'color'},
      {key:'image_url',label:'Image',type:'image'},
    ],
    cols:['Sr','Name','Description','Actions'],
    row:r=>[r.sr_no,r.dept_name,trunc(r.short_desc||'—',40),acts(r,false)],
  },
  partners:{
    sheet:'home_partners',title:'Partners / Affiliations',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'name',label:'Name',type:'text',req:true},
      {key:'logo_url',label:'Logo',type:'image'},
      {key:'link_url',label:'Link',type:'text'},
    ],
    cols:['Sr','Name','Actions'],
    row:r=>[r.sr_no,r.name,acts(r,false)],
  },
  trailblazers:{
    sheet:'trailblazers',title:'Trail Blazers',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'name',label:'Name',type:'text',req:true},
      {key:'designation',label:'Designation',type:'text'},
      {key:'organization',label:'Organization',type:'text'},
      {key:'photo_url',label:'Photo',type:'image'},
    ],
    cols:['Sr','Name','Designation','Actions'],
    row:r=>[r.sr_no,r.name,r.designation||'—',acts(r,false)],
  },
  values:{
    sheet:'values_list',title:'School Values',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'value',label:'Value',type:'text',req:true},
    ],
    cols:['Sr','Value','Actions'],
    row:r=>[r.sr_no,r.value,acts(r,false)],
  },
  policies:{
    sheet:'policies',title:'School Policies',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'policy_name',label:'Policy Name',type:'text',req:true},
      {key:'content',label:'Content',type:'textarea',req:true},
    ],
    cols:['Sr','Policy Name','Actions'],
    row:r=>[r.sr_no,r.policy_name,acts(r,false)],
  },
  salient:{
    sheet:'salient_features',title:'Salient Features',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'content',label:'Content',type:'textarea',req:true},
      {key:'image_url',label:'Image',type:'image'},
    ],
    cols:['Sr','Title','Actions'],
    row:r=>[r.sr_no,r.title,acts(r,false)],
  },
  clubs:{
    sheet:'clubs',title:'Clubs',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'group',label:'Group (A / B / C)',type:'select',opts:['A','B','C'],req:true},
      {key:'club_name',label:'Club Name',type:'text',req:true},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Group','Club Name','Active','Actions'],
    row:r=>[r.sr_no,`<b>${r.group}</b>`,r.club_name,yesno(r.active),acts(r)],
  },
  houses:{
    sheet:'houses',title:'House Systems',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'house_name',label:'House Name',type:'text',req:true},
      {key:'color',label:'Color',type:'color'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','House Name','Color','Active','Actions'],
    row:r=>[r.sr_no,r.house_name,
      `<span style="background:${r.color||'#ccc'};color:#fff;padding:2px 10px;border-radius:4px;font-size:11px;">${r.color||''}</span>`,
      yesno(r.active),acts(r)],
  },
  discipline:{
    sheet:'discipline',title:'Discipline & Timings',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'type',label:'Type',type:'select',opts:['timings','cards','rules'],req:true},
      {key:'category',label:'Category (e.g. Yellow Card)',type:'text'},
      {key:'content',label:'Content',type:'textarea',req:true},
    ],
    cols:['Sr','Type','Category','Actions'],
    row:r=>[r.sr_no,r.type,r.category||'—',acts(r,false)],
  },
  infra:{
    sheet:'infra_items',title:'Infrastructure',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'section_id',label:'Section ID (computerlab/physics/library...)',type:'text',req:true},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'content',label:'Content',type:'textarea',req:true},
      {key:'images',label:'Images',type:'multiimage',hint:'Upload multiple OR paste comma-separated URLs'},
    ],
    cols:['Sr','Section ID','Title','Actions'],
    row:r=>[r.sr_no,r.section_id,r.title,acts(r,false)],
  },
  homework:{
    sheet:'academics_lists',title:'Holiday Homework',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'dept',label:'Dept (type exactly: homework)',type:'text',req:true},
      {key:'list_type',label:'Class / Label',type:'text',req:true},
      {key:'item_text',label:'File URL or Title',type:'text',req:true},
    ],
    cols:['Sr','Class','Title/URL','Actions'],
    row:r=>[r.sr_no,r.list_type,trunc(r.item_text||'',45),acts(r,false)],
  },
  syllabus:{
    sheet:'academics_lists',title:'Syllabus Files',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'dept',label:'Dept (type exactly: syllabus)',type:'text',req:true},
      {key:'list_type',label:'Class Range',type:'text',req:true},
      {key:'item_text',label:'File URL or Title',type:'text',req:true},
    ],
    cols:['Sr','Class Range','Title/URL','Actions'],
    row:r=>[r.sr_no,r.list_type,trunc(r.item_text||'',45),acts(r,false)],
  },
  fee:{
    sheet:'admission_fee',title:'Fee Structure',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'quarter',label:'Quarter',type:'text',req:true},
      {key:'month',label:'Month',type:'text',req:true},
      {key:'last_date',label:'Last Date',type:'text',req:true},
    ],
    cols:['Sr','Quarter','Month','Last Date','Actions'],
    row:r=>[r.sr_no,r.quarter,r.month,r.last_date,acts(r,false)],
  },
  admission_docs:{
    sheet:'admission_docs',title:'Admission Documents',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'type',label:'Type (guideline/transport/syllabus_nur/syllabus_vi)',type:'text',req:true},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'file_url',label:'File',type:'fileurl'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Type','Title','Active','Actions'],
    row:r=>[r.sr_no,r.type,r.title,yesno(r.active),acts(r)],
  },
  enquiries:{
    sheet:'enquiries',title:'Enquiries Inbox',
    fields:[],
    cols:['Sr','Date','Student','Class','Parent','Mobile','Status','Actions'],
    row:r=>[r.sr_no,r.date||'—',r.student_name,r.class,r.parent_name,r.mobile,
      `<span class="badge badge-${(r.status||'New')==='New'?'new':'done'}">${r.status||'New'}</span>`,
      `<div class="action-btns">
        <button class="btn-icon view" onclick="markEnqDone(${r._row_number},'${r.status||'New'}')">✓ Done</button>
        <button class="btn-icon del" onclick="delRow('enquiries',${r._row_number})">🗑</button>
      </div>`],
  },
  gallery_images:{
    sheet:'gallery_albums',title:'Image Gallery Albums',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'album_title',label:'Album Title',type:'text',req:true},
      {key:'thumbnail_url',label:'Thumbnail Image',type:'image'},
      {key:'images',label:'Album Images',type:'multiimage',hint:'Upload multiple OR comma-separated URLs'},
      {key:'date',label:'Date (DD-MM-YYYY)',type:'date'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Album Title','Date','Active','Actions'],
    row:r=>[r.sr_no,r.album_title,r.date||'—',yesno(r.active),acts(r)],
  },
  gallery_videos:{
    sheet:'gallery_videos',title:'Video Gallery',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'title',label:'Video Title',type:'text',req:true},
      {key:'youtube_url',label:'YouTube / Video URL',type:'videourl',req:true,hint:'Paste YouTube link — thumbnail auto-generates'},
      {key:'thumbnail_url',label:'Custom Thumbnail (optional)',type:'image',hint:'Leave empty to use YouTube auto-thumbnail'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Title','URL','Active','Actions'],
    row:r=>[r.sr_no,r.title,trunc(r.youtube_url||'—',40),yesno(r.active),acts(r)],
  },
  career:{
    sheet:'career_cards',title:'Career Guidance Cards',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'icon_name',label:'Icon / Emoji',type:'text',hint:'e.g. 🎯 or keyword'},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'content',label:'Content',type:'textarea',req:true},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Title','Active','Actions'],
    row:r=>[r.sr_no,r.title,yesno(r.active),acts(r)],
  },
  career_resources:{
    sheet:'career_resources',title:'Career Resources',
    fields:[
      {key:'sr_no',label:'Sr No',type:'number'},
      {key:'title',label:'Title',type:'text',req:true},
      {key:'file_url',label:'File',type:'fileurl'},
      {key:'file_size',label:'File Size (e.g. 2.4 MB)',type:'text'},
      {key:'active',label:'Active',type:'toggle'},
    ],
    cols:['Sr','Title','File Size','Active','Actions'],
    row:r=>[r.sr_no,r.title,r.file_size||'—',yesno(r.active),acts(r)],
  },
};

const CONTENT_PANELS = {
  about_content:{
    title:'About / Vision / Mission / Philosophy',page:'about',
    sections:[
      {section:'intro',      label:'About School Intro',       fields:['content']},
      {section:'vision',     label:'Vision',                   fields:['heading','content']},
      {section:'mission',    label:'Mission',                  fields:['heading','content']},
      {section:'philosophy', label:'Philosophy',               fields:['heading','content']},
      {section:'dear',       label:'D.E.A.R',                  fields:['heading','content']},
      {section:'director',   label:"Director's Message",       fields:['name','designation','quote','message','photo_url']},
      {section:'principal',  label:"Principal's Message",      fields:['name','designation','quote','message','photo_url']},
    ],
  },
  academics_content:{
    title:'Academics Dept. Content',page:'academics',
    sections:[
      {section:'preprimary_intro',label:'Pre-Primary — Intro', fields:['content']},
      {section:'primary_intro',   label:'Primary — Intro',     fields:['content']},
      {section:'middle_intro',    label:'Middle — Intro',       fields:['content']},
      {section:'senior_intro',    label:'Senior — Intro',      fields:['content']},
      {section:'senior_motto',    label:'Senior — Motto',      fields:['content']},
      {section:'council',         label:'Student Council',     fields:['quote','content']},
    ],
  },
};

const SETTINGS_FIELDS = [
  {key:'school_name',  label:'School Name'},
  {key:'tagline',      label:'Tagline / Slogan'},
  {key:'phone',        label:'Phone Number'},
  {key:'email',        label:'Email Address'},
  {key:'address',      label:'Full Address'},
  {key:'website',      label:'Website URL'},
  {key:'facebook_url', label:'Facebook URL'},
  {key:'twitter_url',  label:'Twitter URL'},
  {key:'youtube_url',  label:'YouTube URL'},
  {key:'linkedin_url', label:'LinkedIn URL'},
  {key:'erp_login_url',label:'ERP Login URL'},
  {key:'est_year',     label:'Established Year'},
  {key:'map_embed_url',label:'Google Map Embed URL'},
];

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Check existing valid session
  const token = localStorage.getItem('cms_token');
  const user  = localStorage.getItem('cms_user');
  if (token && user) {
    try {
      STATE.user = JSON.parse(user);
      showCMS();
    } catch(e) {
      clearSession();
    }
  }

  document.getElementById('loginPass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  document.querySelectorAll('.nav-item[data-panel]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      switchPanel(el.dataset.panel);
      if (window.innerWidth <= 768)
        document.getElementById('sidebar')?.classList.remove('mobile-open');
    });
  });

  setTimeout(restoreSidebar, 50);
});

// ═══════════════════════════════════════════
//  AUTH — FIXED: no session loop, no token on login
// ═══════════════════════════════════════════
async function doLogin() {
  const uEl  = document.getElementById('loginUser');
  const pEl  = document.getElementById('loginPass');
  const err  = document.getElementById('loginError');
  const btn  = document.getElementById('loginBtn');

  const u = (uEl?.value || '').trim();
  const p = (pEl?.value || '').trim();

  err.style.display = 'none';
  if (!u || !p) {
    err.textContent = 'Enter username and password';
    err.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    // IMPORTANT: login uses direct fetch, NOT post() helper
    // This avoids sending old expired token and avoids sessionExpired() loop
    const res  = await fetch(CMS_CONFIG.API_URL, {
      method : 'POST',
      body   : JSON.stringify({ action: 'login', username: u, password: p }),
    });
    const json = await res.json();

    if (json.success) {
      localStorage.setItem('cms_token', json.token);
      localStorage.setItem('cms_user',  JSON.stringify(json.user));
      STATE.user = json.user;
      showCMS();
    } else {
      err.textContent  = json.error || 'Invalid username or password';
      err.style.display = 'block';
    }
  } catch(e) {
    err.textContent  = 'Network error. Check your internet connection.';
    err.style.display = 'block';
    console.error('Login error:', e);
  }

  btn.disabled    = false;
  btn.textContent = 'Login';
}

function showCMS() {
  document.getElementById('loginWrap').style.display  = 'none';
  document.getElementById('cmsShell').style.display   = 'flex';
  const nameEl = document.getElementById('sidebarUser');
  if (nameEl) nameEl.innerHTML =
    `<strong>${STATE.user?.name || 'Admin'}</strong><br>${STATE.user?.email || ''}`;
  switchPanel('dashboard');
}

async function doLogout() {
  if (!confirm('Are you sure you want to logout?')) return;
  const token = localStorage.getItem('cms_token');
  if (token) {
    try {
      await fetch(CMS_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'logout', token }),
      });
    } catch(e) {}
  }
  clearSession();
  location.reload();
}

function clearSession() {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
}

// ═══════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════
function toggleSidebar() {
  const sb   = document.getElementById('sidebar');
  const main = document.getElementById('cmsMain');
  if (!sb) return;
  if (window.innerWidth <= 768) {
    sb.classList.toggle('mobile-open');
    return;
  }
  const collapsed = sb.classList.toggle('collapsed');
  main.classList.toggle('expanded', collapsed);
  localStorage.setItem('cms_sb', collapsed ? '1' : '0');
}

function restoreSidebar() {
  if (window.innerWidth <= 768) return;
  const sb   = document.getElementById('sidebar');
  const main = document.getElementById('cmsMain');
  if (!sb || !main) return;
  if (localStorage.getItem('cms_sb') === '1') {
    sb.classList.add('collapsed');
    main.classList.add('expanded');
  } else {
    sb.classList.remove('collapsed');
    main.classList.remove('expanded');
  }
}

// ═══════════════════════════════════════════
//  PANEL SWITCHING
// ═══════════════════════════════════════════
async function switchPanel(id) {
  STATE.panel = id;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-panel="${id}"]`)?.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  const title = PANELS[id]?.title || CONTENT_PANELS[id]?.title
    || id.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = title;

  loading(true);
  try {
    if      (id === 'dashboard')    { await loadDash();       show('dashboard'); }
    else if (id === 'settings')     { await loadSettings();   show('settings'); }
    else if (id === 'users')        { await loadUsers();      show('users'); }
    else if (CONTENT_PANELS[id])   { await loadContent(id);  show('content-editor'); }
    else if (PANELS[id])           { await loadList(id);     show('list'); }
  } catch(e) {
    toast('Failed to load: ' + (e.message || 'Unknown error'), 'error');
    console.error('switchPanel error:', e);
  }
  loading(false);
}

function show(id) { document.getElementById(`panel-${id}`)?.classList.add('active'); }
function loading(on) {
  const el = document.getElementById('panelLoading');
  if (el) el.style.display = on ? 'flex' : 'none';
}

// ═══════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════
async function loadDash() {
  try {
    const [enq, albums, vids, news] = await Promise.all([
      apiGet('get_enquiries'), apiGet('get_gallery_albums'),
      apiGet('get_gallery_videos'), apiGet('get_news'),
    ]);
    const s = (id, arr) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Array.isArray(arr) ? arr.length : '—';
    };
    s('dStat1', enq); s('dStat2', albums); s('dStat3', vids); s('dStat4', news);
  } catch(e) {}
}

// ═══════════════════════════════════════════
//  LIST PANEL
// ═══════════════════════════════════════════
async function loadList(id) {
  const cfg = PANELS[id];
  if (!cfg) return;
  STATE.sheet  = cfg.sheet;
  STATE.fields = cfg.fields;

  const titleEl = document.getElementById('listPanelTitle');
  if (titleEl) titleEl.textContent = cfg.title;

  const addBtn = document.querySelector('#panel-list .btn-primary-sm');
  if (addBtn) addBtn.style.display = cfg.fields.length ? '' : 'none';

  const rows = await apiGet('get_all_rows', { sheet: cfg.sheet });
  STATE.rows = rows || [];
  renderList(cfg);
}

function renderList(cfg) {
  const thead = document.getElementById('listThead');
  const tbody = document.getElementById('listTbody');
  const empty = document.getElementById('listEmpty');
  if (!thead || !tbody) return;

  thead.innerHTML = `<tr>${cfg.cols.map(c => `<th>${c}</th>`).join('')}</tr>`;

  if (!STATE.rows.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  tbody.innerHTML = STATE.rows.map(r =>
    `<tr>${cfg.row(r).map(c => `<td>${c}</td>`).join('')}</tr>`
  ).join('');
}

function filterList() {
  const q   = (document.getElementById('listSearch')?.value || '').toLowerCase();
  const cfg = PANELS[STATE.panel];
  if (!cfg) return;
  if (!q) { loadList(STATE.panel); return; }
  STATE.rows = STATE.rows.filter(r =>
    Object.values(r).some(v => String(v).toLowerCase().includes(q))
  );
  renderList(cfg);
}

// ═══════════════════════════════════════════
//  MODAL
// ═══════════════════════════════════════════
function openModal(mode, rowNum) {
  const cfg = PANELS[STATE.panel];
  if (!cfg || !cfg.fields.length) return;
  STATE.editRow = mode === 'edit' ? rowNum : null;
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = mode === 'add' ? `Add — ${cfg.title}` : `Edit — ${cfg.title}`;
  const row = mode === 'edit' ? STATE.rows.find(r => r._row_number === rowNum) : {};
  const body = document.getElementById('modalBody');
  if (body) body.innerHTML = cfg.fields.map(f => buildField(f, row?.[f.key] ?? '')).join('');
  document.getElementById('modalOverlay')?.classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay')?.classList.remove('open');
}

function buildField(f, rawVal) {
  const id  = `mf_${f.key}`;
  const val = String(rawVal ?? '');
  const hint = f.hint ? `<p class="form-hint">${f.hint}</p>` : '';

  switch (f.type) {
    case 'toggle': {
      const on = val.toUpperCase() === 'YES';
      return `<div class="form-group"><label>${f.label}</label>
        <div class="toggle-wrap">
          <button type="button" class="toggle ${on?'on':''}" id="${id}"
            onclick="this.classList.toggle('on');this.nextElementSibling.textContent=this.classList.contains('on')?'Active':'Inactive'">
          </button><span>${on ? 'Active' : 'Inactive'}</span>
        </div>${hint}</div>`;
    }
    case 'select': {
      const opts = (f.opts||[]).map(o =>
        `<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('');
      return `<div class="form-group"><label>${f.label}</label>
        <select id="${id}">${opts}</select>${hint}</div>`;
    }
    case 'textarea':
      return `<div class="form-group"><label>${f.label}</label>
        <textarea id="${id}" rows="4">${esc(val)}</textarea>${hint}</div>`;
    case 'color':
      return `<div class="form-group"><label>${f.label}</label>
        <input type="color" id="${id}" value="${val || '#1a3a6b'}"/>${hint}</div>`;
    case 'date': {
      return `<div class="form-group"><label>${f.label}</label>
        <input type="date" id="${id}" value="${toHtmlDate(val)}"/>${hint}</div>`;
    }
    case 'ddmm':
      return `<div class="form-group"><label>${f.label}</label>
        <input type="text" id="${id}" value="${esc(cleanBdDate(val))}"
          placeholder="DD-MM e.g. 25-01" maxlength="5"
          oninput="fmtDDMM(this)"/>${hint}</div>`;
    case 'image':
      return buildImageField(id, f.label, val, hint);
    case 'multiimage':
      return buildMultiImageField(id, f.label, val, hint);
    case 'fileurl':
      return buildFileField(id, f.label, val, hint);
    case 'videourl':
      return `<div class="form-group"><label>${f.label}</label>
        <input type="url" id="${id}" value="${esc(val)}"
          placeholder="https://youtube.com/watch?v=..."
          oninput="prevVid(this)"/>
        <img id="${id}_thumb" class="img-preview ${val?'show':''}"
          src="${val ? getYTThumb(val) : ''}" alt="Video thumbnail"
          onerror="this.classList.remove('show')"/>
        ${hint}</div>`;
    default:
      return `<div class="form-group"><label>${f.label}</label>
        <input type="${f.type||'text'}" id="${id}" value="${esc(val)}"
          placeholder="${f.label}"/>${hint}</div>`;
  }
}

function buildImageField(id, label, val, hint) {
  return `<div class="form-group"><label>${label}</label>
    <div class="dual-wrap">
      <div class="dual-tabs">
        <button type="button" class="dtab active" onclick="swTab(this,'${id}','up')">📁 Upload File</button>
        <button type="button" class="dtab" onclick="swTab(this,'${id}','url')">🔗 Paste URL</button>
      </div>
      <div id="${id}_up">
        <input type="file" accept="image/*" onchange="doUploadImg(this,'${id}')"/>
        <div class="uprog" id="${id}_prog" style="display:none">Uploading…</div>
      </div>
      <div id="${id}_url" style="display:none">
        <input type="url" id="${id}_urlinp" value="${esc(val)}"
          placeholder="https://…" oninput="syncUrl(this,'${id}')"/>
      </div>
      <input type="hidden" id="${id}" value="${esc(val)}"/>
      <img id="${id}_prev" class="img-preview ${val?'show':''}" src="${esc(val)}"
        onerror="this.classList.remove('show')" alt="Preview"/>
    </div>${hint}</div>`;
}

function buildMultiImageField(id, label, val, hint) {
  return `<div class="form-group"><label>${label}</label>
    <div class="dual-wrap">
      <div class="dual-tabs">
        <button type="button" class="dtab active" onclick="swTab(this,'${id}','up')">📁 Upload Files</button>
        <button type="button" class="dtab" onclick="swTab(this,'${id}','url')">🔗 Paste URLs</button>
      </div>
      <div id="${id}_up">
        <input type="file" accept="image/*" multiple onchange="doUploadMulti(this,'${id}')"/>
        <div class="uprog" id="${id}_prog" style="display:none">Uploading…</div>
      </div>
      <div id="${id}_url" style="display:none">
        <textarea id="${id}_urlinp" rows="3"
          placeholder="Paste image URLs, comma-separated"
          oninput="syncMulti(this,'${id}')">${esc(val)}</textarea>
      </div>
      <input type="hidden" id="${id}" value="${esc(val)}"/>
      <div id="${id}_thumbs" class="multi-thumbs">${thumbsHtml(val)}</div>
    </div>${hint}</div>`;
}

function buildFileField(id, label, val, hint) {
  return `<div class="form-group"><label>${label}</label>
    <div class="dual-wrap">
      <div class="dual-tabs">
        <button type="button" class="dtab active" onclick="swTab(this,'${id}','up')">📁 Upload File</button>
        <button type="button" class="dtab" onclick="swTab(this,'${id}','url')">🔗 Paste URL</button>
      </div>
      <div id="${id}_up">
        <input type="file" onchange="doUploadImg(this,'${id}')"/>
        <div class="uprog" id="${id}_prog" style="display:none">Uploading…</div>
      </div>
      <div id="${id}_url" style="display:none">
        <input type="url" id="${id}_urlinp" value="${esc(val)}"
          placeholder="https://…" oninput="syncUrl(this,'${id}')"/>
      </div>
      <input type="hidden" id="${id}" value="${esc(val)}"/>
      ${val ? `<a href="${esc(val)}" target="_blank"
        style="font-size:12px;color:var(--blue-mid);margin-top:4px;display:inline-block;">
        📎 Current file</a>` : ''}
    </div>${hint}</div>`;
}

// ── Upload helpers ────────────────────────
function swTab(btn, id, mode) {
  btn.closest('.dual-wrap').querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`${id}_up`).style.display  = mode === 'up'  ? '' : 'none';
  document.getElementById(`${id}_url`).style.display = mode === 'url' ? '' : 'none';
}

function syncUrl(inp, id) {
  const h = document.getElementById(id);
  const p = document.getElementById(`${id}_prev`);
  if (h) h.value = inp.value;
  if (p && inp.value) {
    p.src = inp.value;
    p.classList.add('show');
    p.onerror = () => p.classList.remove('show');
  }
}

function syncMulti(ta, id) {
  const h = document.getElementById(id);
  if (h) h.value = ta.value;
  const t = document.getElementById(`${id}_thumbs`);
  if (t) t.innerHTML = thumbsHtml(ta.value);
}

async function doUploadImg(input, id) {
  const file = input.files[0]; if (!file) return;
  const prog = document.getElementById(`${id}_prog`);
  if (prog) { prog.style.display = ''; prog.textContent = 'Uploading…'; }
  const url = await uploadToDrive(file);
  if (prog) prog.style.display = 'none';
  if (url) {
    const h = document.getElementById(id);
    const p = document.getElementById(`${id}_prev`);
    if (h) h.value = url;
    if (p) { p.src = url; p.classList.add('show'); }
    toast('Uploaded!', 'success');
  } else {
    toast('Upload failed. Check your internet connection.', 'error');
  }
}

async function doUploadMulti(input, id) {
  const files = Array.from(input.files); if (!files.length) return;
  const prog  = document.getElementById(`${id}_prog`);
  const h     = document.getElementById(id);
  const t     = document.getElementById(`${id}_thumbs`);
  if (prog) prog.style.display = '';
  const existing = (h?.value || '').split(',').map(u => u.trim()).filter(Boolean);
  const newUrls  = [];
  for (let i = 0; i < files.length; i++) {
    if (prog) prog.textContent = `Uploading ${i+1}/${files.length}…`;
    const url = await uploadToDrive(files[i]);
    if (url) newUrls.push(url);
  }
  if (prog) prog.style.display = 'none';
  const all = [...existing, ...newUrls].join(',');
  if (h) h.value = all;
  if (t) t.innerHTML = thumbsHtml(all);
  toast(`${newUrls.length} file(s) uploaded!`, 'success');
}

async function uploadToDrive(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const token = localStorage.getItem('cms_token') || '';
        const res   = await fetch(CMS_CONFIG.API_URL, {
          method : 'POST',
          body   : JSON.stringify({
            action   : 'upload_image',
            token,
            base64   : e.target.result.split(',')[1],
            filename : file.name,
            mimetype : file.type,
          }),
        });
        const json = await res.json();
        resolve(json.success ? json.url : null);
      } catch(e) { resolve(null); }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function thumbsHtml(urls) {
  return (urls || '').split(',').map(u => u.trim()).filter(Boolean)
    .map(u => `<img src="${u}" style="width:60px;height:60px;object-fit:cover;
      border-radius:4px;border:1px solid #e2e8f0;" onerror="this.remove()"/>`)
    .join('');
}

function prevVid(inp) {
  const img = inp.nextElementSibling;
  if (!img || img.tagName !== 'IMG') return;
  const thumb = getYTThumb(inp.value || '');
  if (thumb) { img.src = thumb; img.classList.add('show'); }
  else img.classList.remove('show');
}

function fmtDDMM(inp) {
  let v = inp.value.replace(/[^0-9]/g, '');
  if (v.length > 2) v = v.slice(0, 2) + '-' + v.slice(2, 4);
  inp.value = v;
}

// ═══════════════════════════════════════════
//  SAVE MODAL
// ═══════════════════════════════════════════
async function saveModal() {
  const cfg = PANELS[STATE.panel];
  if (!cfg) return;

  for (const f of cfg.fields) {
    if (f.req && !getVal(f).trim()) {
      toast(`"${f.label}" is required`, 'error');
      document.getElementById(`mf_${f.key}`)?.focus();
      return;
    }
  }

  const data = {};
  cfg.fields.forEach(f => {
    let v = getVal(f);
    if (f.type === 'date' && v) v = toDisplayDate(v);
    data[f.key] = v;
  });

  loading(true);
  try {
    let res;
    if (STATE.editRow) {
      res = await apiPost('update_row', { sheet: cfg.sheet, row_number: STATE.editRow, data });
    } else {
      if (!data.sr_no) data.sr_no = String((STATE.rows.length || 0) + 1);
      res = await apiPost('add_row', { sheet: cfg.sheet, data });
    }
    if (res && res.success) {
      toast(STATE.editRow ? 'Updated successfully!' : 'Added successfully!', 'success');
      document.getElementById('modalOverlay')?.classList.remove('open');
      await loadList(STATE.panel);
    } else {
      toast((res && res.error) || 'Save failed', 'error');
    }
  } catch(e) {
    toast('Error: ' + e.message, 'error');
    console.error('saveModal error:', e);
  }
  loading(false);
}

function getVal(f) {
  const el = document.getElementById(`mf_${f.key}`);
  if (!el) return '';
  if (f.type === 'toggle') return el.classList.contains('on') ? 'YES' : 'NO';
  return el.value || '';
}

// ═══════════════════════════════════════════
//  DELETE / TOGGLE
// ═══════════════════════════════════════════
async function delRow(sheet, rowNum) {
  if (!confirm('Delete this record? This cannot be undone.')) return;
  loading(true);
  const res = await apiPost('delete_row', { sheet, row_number: rowNum });
  loading(false);
  if (res && res.success) {
    toast('Deleted', 'success');
    await loadList(STATE.panel);
  } else {
    toast((res && res.error) || 'Delete failed', 'error');
  }
}

async function toggleRow(sheet, rowNum, cur) {
  const newVal = String(cur).toUpperCase() !== 'YES';
  loading(true);
  const res = await apiPost('toggle_active', { sheet, row_number: rowNum, active: newVal });
  loading(false);
  if (res && res.success) {
    toast(newVal ? 'Activated' : 'Deactivated', 'success');
    await loadList(STATE.panel);
  } else {
    toast((res && res.error) || 'Toggle failed', 'error');
  }
}

// ═══════════════════════════════════════════
//  CONTENT EDITOR
// ═══════════════════════════════════════════
async function loadContent(id) {
  const cfg = CONTENT_PANELS[id];
  if (!cfg) return;
  const titleEl = document.getElementById('contentEditorTitle');
  if (titleEl) titleEl.textContent = cfg.title;
  const container = document.getElementById('contentEditorFields');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:40px"><div class="spinner" style="margin:auto"></div></div>';
  const data = await apiGet('get_content', { page: cfg.page }) || {};
  container.innerHTML = cfg.sections.map(sec => `
    <div class="content-section-block" data-page="${cfg.page}" data-section="${sec.section}">
      <div class="content-section-header">${sec.label}</div>
      <div class="content-section-body">
        ${sec.fields.map(field => {
          const val = data[sec.section]?.[field] || '';
          const isLong = field === 'message' || field === 'content';
          return `<div class="form-group">
            <label>${field.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
            ${isLong
              ? `<textarea rows="5" data-field="${field}">${esc(val)}</textarea>`
              : `<input type="text" data-field="${field}" value="${esc(val)}"/>`}
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

async function saveAllContent() {
  const updates = [];
  document.querySelectorAll('.content-section-block').forEach(block => {
    const page = block.dataset.page, section = block.dataset.section;
    block.querySelectorAll('[data-field]').forEach(el =>
      updates.push({ page, section, field: el.dataset.field, value: el.value }));
  });
  loading(true);
  try {
    for (const u of updates) await apiPost('update_content', u);
    toast('All content saved!', 'success');
  } catch(e) { toast('Save failed', 'error'); }
  loading(false);
}

// ═══════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════
async function loadSettings() {
  const data = await apiGet('get_settings') || {};
  const grid = document.getElementById('settingsGrid');
  if (!grid) return;
  grid.innerHTML = SETTINGS_FIELDS.map(f => `
    <div class="form-group">
      <label>${f.label}</label>
      <input type="text" id="s_${f.key}" value="${esc(data[f.key] || '')}" placeholder="${f.label}"/>
    </div>`).join('');
}

async function saveAllSettings() {
  loading(true);
  try {
    for (const f of SETTINGS_FIELDS) {
      const el = document.getElementById(`s_${f.key}`);
      if (el) await apiPost('update_setting', { field: f.key, value: el.value });
    }
    toast('Settings saved!', 'success');
  } catch(e) { toast('Save failed', 'error'); }
  loading(false);
}

// ═══════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════
async function loadUsers() {
  const rows  = await apiGet('get_users') || [];
  const tbody = document.getElementById('usersTbody');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#9aa3af">No users found</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.sr_no}</td><td>${r.name}</td><td>${r.email}</td>
      <td><strong>${r.username}</strong></td>
      <td><button class="btn-icon del" onclick="delUser(${r._row_number},'${r.username}')">🗑 Delete</button></td>
    </tr>`).join('');
}

function openUserModal() {
  ['uName','uEmail','uUsername','uPassword'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('userModalOverlay')?.classList.add('open');
}

function closeUserModal(e) {
  if (e && e.target !== document.getElementById('userModalOverlay')) return;
  document.getElementById('userModalOverlay')?.classList.remove('open');
}

async function saveUser() {
  const name     = document.getElementById('uName')?.value.trim();
  const email    = document.getElementById('uEmail')?.value.trim();
  const username = document.getElementById('uUsername')?.value.trim();
  const password = document.getElementById('uPassword')?.value.trim();
  if (!name || !email || !username || !password) { toast('All fields required', 'error'); return; }
  if (username.includes(' ')) { toast('Username cannot have spaces', 'error'); return; }
  loading(true);
  const res = await apiPost('add_user', { name, email, username, password });
  loading(false);
  if (res && res.success) { toast('User added!', 'success'); closeUserModal(); await loadUsers(); }
  else toast((res && res.error) || 'Failed to add user', 'error');
}

async function delUser(rowNum, username) {
  if (username === STATE.user?.username) { toast('Cannot delete your own account', 'error'); return; }
  if (!confirm(`Delete user "${username}"?`)) return;
  loading(true);
  const res = await apiPost('delete_user', { row_number: rowNum });
  loading(false);
  if (res && res.success) { toast('User deleted', 'success'); await loadUsers(); }
  else toast((res && res.error) || 'Delete failed', 'error');
}

// ═══════════════════════════════════════════
//  ENQUIRIES
// ═══════════════════════════════════════════
async function markEnqDone(rowNum, cur) {
  const newStatus = cur === 'New' ? 'Done' : 'New';
  loading(true);
  await apiPost('update_row', { sheet: 'enquiries', row_number: rowNum, data: { status: newStatus } });
  loading(false);
  toast('Status updated', 'success');
  await loadList('enquiries');
}

// ═══════════════════════════════════════════
//  API HELPERS — FIXED: no session loop
// ═══════════════════════════════════════════
async function apiGet(action, params = {}) {
  try {
    const url   = new URL(CMS_CONFIG.API_URL);
    const token = localStorage.getItem('cms_token') || '';
    url.searchParams.set('action', action);
    if (token) url.searchParams.set('token', token);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res  = await fetch(url.toString());
    const json = await res.json();
    if (!json.success && json.error) {
      // Only trigger session expired for non-login actions
      if (action !== 'login' && json.error.toLowerCase().includes('session')) {
        handleSessionExpired();
        return null;
      }
    }
    return json.success ? json.data : null;
  } catch(e) {
    console.error('apiGet failed:', action, e);
    return null;
  }
}

async function apiPost(action, body = {}) {
  try {
    const token = localStorage.getItem('cms_token') || '';
    const res   = await fetch(CMS_CONFIG.API_URL, {
      method : 'POST',
      body   : JSON.stringify({ action, token, ...body }),
    });
    const json = await res.json();
    // Only trigger session expired for non-login/non-enquiry actions
    if (!json.success && json.error && action !== 'login' && action !== 'enquiry') {
      if (json.error.toLowerCase().includes('session')) {
        handleSessionExpired();
        return json;
      }
    }
    return json;
  } catch(e) {
    console.error('apiPost failed:', action, e);
    return { success: false, error: e.message };
  }
}

function handleSessionExpired() {
  // Only show message and reload if currently logged in
  if (!localStorage.getItem('cms_token')) return;
  clearSession();
  toast('Session expired. Please login again.', 'error');
  setTimeout(() => location.reload(), 2500);
}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════
function yesno(v) {
  const on = (v || '').toUpperCase() === 'YES';
  return `<span class="badge ${on?'badge-yes':'badge-no'}">${on?'YES':'NO'}</span>`;
}

function acts(r, hasToggle = true) {
  const cfg = PANELS[STATE.panel];
  let h = `<div class="action-btns">`;
  if (cfg?.fields.length)
    h += `<button class="btn-icon edit" onclick="openModal('edit',${r._row_number})">✏️ Edit</button>`;
  if (hasToggle && r.active !== undefined)
    h += `<button class="btn-icon tog" onclick="toggleRow('${cfg?.sheet}',${r._row_number},'${r.active}')">⏺ Toggle</button>`;
  h += `<button class="btn-icon del" onclick="delRow('${cfg?.sheet}',${r._row_number})">🗑 Del</button>`;
  return h + `</div>`;
}

function trunc(s, n) { return (s||'').length > n ? s.slice(0,n) + '…' : (s||''); }

function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

