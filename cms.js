/* ============================================================
   CMS.JS v2.0 — All bugs fixed, image upload, date pickers,
   sidebar toggle, video thumbnails, circulars date range
   ============================================================ */

// ── State ────────────────────────────────────────────────────
const STATE = {
  currentPanel : 'dashboard',
  currentSheet : '',
  currentFields: [],
  currentRows  : [],
  editRowNum   : null,
  user         : null,
};

// ── Date/Time helpers ─────────────────────────────────────────
function todayDDMMYYYY() {
  const d  = new Date();
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

// Convert YYYY-MM-DD (HTML date input) ↔ DD-MM-YYYY (our format)
function htmlDateToDisplay(val) {
  if (!val || !val.includes('-')) return val;
  if (val.split('-')[0].length === 4) {
    const [y,m,d] = val.split('-');
    return `${d}-${m}-${y}`;
  }
  return val;
}
function displayDateToHtml(val) {
  if (!val || !val.includes('-')) return val;
  if (val.split('-')[2]?.length === 4) {
    const [d,m,y] = val.split('-');
    return `${y}-${m}-${d}`;
  }
  return val;
}

// ── Panel config ──────────────────────────────────────────────
const PANEL_CONFIG = {

  slider: {
    sheet : 'home_slider',
    title : 'Hero Slider',
    fields: [
      { key:'sr_no',        label:'Sr No',          type:'number' },
      { key:'title',        label:'Title',           type:'text',   required:true },
      { key:'subtitle',     label:'Subtitle',        type:'text' },
      { key:'tag',          label:'Tag (small text)',type:'text' },
      { key:'button1_text', label:'Button 1 Text',   type:'text' },
      { key:'button1_link', label:'Button 1 Link',   type:'text' },
      { key:'button2_text', label:'Button 2 Text',   type:'text' },
      { key:'button2_link', label:'Button 2 Link',   type:'text' },
      { key:'bg_color',     label:'BG Color',        type:'color' },
      { key:'image_url',    label:'Slide Image',     type:'image' },
      { key:'active',       label:'Active',          type:'toggle' },
    ],
    cols: ['Sr','Title','Subtitle','Button 1','Active','Actions'],
    row : r => [r.sr_no, r.title, trunc(r.subtitle||'—',40), r.button1_text||'—', badge(r.active), rowActions(r)],
  },

  news: {
    sheet : 'home_news',
    title : 'News Ticker',
    fields: [
      { key:'sr_no',    label:'Sr No',    type:'number' },
      { key:'news_text',label:'News Text',type:'text', required:true },
      { key:'link_url', label:'Link URL', type:'text' },
      { key:'active',   label:'Active',   type:'toggle' },
    ],
    cols: ['Sr','News Text','Link','Active','Actions'],
    row : r => [r.sr_no, trunc(r.news_text,60), r.link_url||'—', badge(r.active), rowActions(r)],
  },

  quicklinks: {
    sheet : 'home_quicklinks',
    title : 'Quick Links',
    fields: [
      { key:'sr_no',   label:'Sr No', type:'number' },
      { key:'label',   label:'Label', type:'text', required:true },
      { key:'icon',    label:'Icon',  type:'text', hint:'form / users / book / phone' },
      { key:'link_url',label:'Link',  type:'text' },
    ],
    cols: ['Sr','Label','Icon','Link','Actions'],
    row : r => [r.sr_no, r.label, r.icon||'—', r.link_url||'—', rowActions(r, false)],
  },

  toppers: {
    sheet : 'home_toppers',
    title : 'Our Toppers',
    fields: [
      { key:'sr_no',       label:'Sr No',       type:'number' },
      { key:'student_name',label:'Student Name', type:'text',   required:true },
      { key:'class',       label:'Class',        type:'text',   required:true },
      { key:'percentage',  label:'Percentage %', type:'text',   required:true },
      { key:'photo_url',   label:'Photo',        type:'image' },
      { key:'year',        label:'Year',         type:'text' },
      { key:'active',      label:'Active',       type:'toggle' },
    ],
    cols: ['Sr','Name','Class','%','Year','Active','Actions'],
    row : r => [r.sr_no, r.student_name, r.class, r.percentage+'%', r.year||'—', badge(r.active), rowActions(r)],
  },

  birthdays: {
    sheet : 'home_birthdays',
    title : 'Birthdays',
    fields: [
      { key:'sr_no',       label:'Sr No',         type:'number' },
      { key:'student_name',label:'Student Name',  type:'text',  required:true },
      { key:'class',       label:'Class',         type:'text' },
      { key:'date',        label:'Date (DD-MM)',  type:'ddmm',  required:true, hint:'e.g. 25-01' },
    ],
    cols: ['Sr','Name','Class','Date','Actions'],
    row : r => [r.sr_no, r.student_name, r.class||'—', r.date, rowActions(r, false)],
  },

  circulars: {
    sheet : 'home_circulars',
    title : 'School Circulars',
    fields: [
      { key:'sr_no',      label:'Sr No',                   type:'number' },
      { key:'title',      label:'Title',                   type:'text',     required:true },
      { key:'description',label:'Description',             type:'textarea' },
      { key:'file_url',   label:'Circular File / PDF',     type:'file_or_url', hint:'Upload file OR paste URL' },
      { key:'date',       label:'Date (DD-MM-YYYY)',        type:'date' },
      { key:'start_date', label:'Publish From (DD-MM-YYYY)',type:'date',     hint:'Circular shows from this date' },
      { key:'end_date',   label:'Publish Until (DD-MM-YYYY)',type:'date',    hint:'Circular hides after this date' },
      { key:'active',     label:'Active',                  type:'toggle' },
    ],
    cols: ['Sr','Title','Date','Publish From','Publish Until','Active','Actions'],
    row : r => [r.sr_no, r.title, r.date||'—', r.start_date||'Always', r.end_date||'Always', badge(r.active), rowActions(r)],
  },

  departments: {
    sheet : 'home_departments',
    title : 'Departments Preview',
    fields: [
      { key:'sr_no',    label:'Sr No',     type:'number' },
      { key:'dept_name',label:'Dept Name', type:'text',     required:true },
      { key:'short_desc',label:'Short Desc',type:'textarea' },
      { key:'link_url', label:'Link URL',  type:'text' },
      { key:'bg_color', label:'BG Color',  type:'color' },
      { key:'image_url',label:'Image',     type:'image' },
    ],
    cols: ['Sr','Name','Desc','Actions'],
    row : r => [r.sr_no, r.dept_name, trunc(r.short_desc||'—',50), rowActions(r, false)],
  },

  partners: {
    sheet : 'home_partners',
    title : 'Partners / Affiliations',
    fields: [
      { key:'sr_no',   label:'Sr No', type:'number' },
      { key:'name',    label:'Name',  type:'text',  required:true },
      { key:'logo_url',label:'Logo',  type:'image' },
      { key:'link_url',label:'Link',  type:'text' },
    ],
    cols: ['Sr','Name','Actions'],
    row : r => [r.sr_no, r.name, rowActions(r, false)],
  },

  trailblazers: {
    sheet : 'trailblazers',
    title : 'Trail Blazers',
    fields: [
      { key:'sr_no',       label:'Sr No',       type:'number' },
      { key:'name',        label:'Name',         type:'text', required:true },
      { key:'designation', label:'Designation',  type:'text' },
      { key:'organization',label:'Organization', type:'text' },
      { key:'photo_url',   label:'Photo',        type:'image' },
    ],
    cols: ['Sr','Name','Designation','Actions'],
    row : r => [r.sr_no, r.name, r.designation||'—', rowActions(r, false)],
  },

  values: {
    sheet : 'values_list',
    title : 'School Values',
    fields: [
      { key:'sr_no',label:'Sr No',type:'number' },
      { key:'value',label:'Value',type:'text', required:true },
    ],
    cols: ['Sr','Value','Actions'],
    row : r => [r.sr_no, r.value, rowActions(r, false)],
  },

  policies: {
    sheet : 'policies',
    title : 'School Policies',
    fields: [
      { key:'sr_no',      label:'Sr No',       type:'number' },
      { key:'policy_name',label:'Policy Name', type:'text',     required:true },
      { key:'content',    label:'Content',     type:'textarea', required:true },
    ],
    cols: ['Sr','Policy Name','Actions'],
    row : r => [r.sr_no, r.policy_name, rowActions(r, false)],
  },

  salient: {
    sheet : 'salient_features',
    title : 'Salient Features',
    fields: [
      { key:'sr_no',   label:'Sr No',  type:'number' },
      { key:'title',   label:'Title',  type:'text',     required:true },
      { key:'content', label:'Content',type:'textarea', required:true },
      { key:'image_url',label:'Image', type:'image' },
    ],
    cols: ['Sr','Title','Actions'],
    row : r => [r.sr_no, r.title, rowActions(r, false)],
  },

  clubs: {
    sheet : 'clubs',
    title : 'Clubs',
    fields: [
      { key:'sr_no',   label:'Sr No',          type:'number' },
      { key:'group',   label:'Group (A/B/C)',   type:'select', options:['A','B','C'], required:true },
      { key:'club_name',label:'Club Name',      type:'text',   required:true },
      { key:'active',  label:'Active',          type:'toggle' },
    ],
    cols: ['Sr','Group','Club Name','Active','Actions'],
    row : r => [r.sr_no, `<strong>${r.group}</strong>`, r.club_name, badge(r.active), rowActions(r)],
  },

  houses: {
    sheet : 'houses',
    title : 'House Systems',
    fields: [
      { key:'sr_no',     label:'Sr No',      type:'number' },
      { key:'house_name',label:'House Name', type:'text',  required:true },
      { key:'color',     label:'Color',      type:'color' },
      { key:'active',    label:'Active',     type:'toggle' },
    ],
    cols: ['Sr','House Name','Color','Active','Actions'],
    row : r => [r.sr_no, r.house_name,
      `<span style="background:${r.color};color:#fff;padding:2px 10px;border-radius:4px;font-size:11px;">${r.color}</span>`,
      badge(r.active), rowActions(r)],
  },

  discipline: {
    sheet : 'discipline',
    title : 'Discipline & Timings',
    fields: [
      { key:'sr_no',   label:'Sr No',                     type:'number' },
      { key:'type',    label:'Type',                      type:'select', options:['timings','cards','rules'], required:true },
      { key:'category',label:'Category (e.g. Yellow Card)',type:'text' },
      { key:'content', label:'Content',                   type:'textarea', required:true },
    ],
    cols: ['Sr','Type','Category','Actions'],
    row : r => [r.sr_no, r.type, r.category||'—', rowActions(r, false)],
  },

  infra: {
    sheet : 'infra_items',
    title : 'Infrastructure',
    fields: [
      { key:'sr_no',    label:'Sr No',                                           type:'number' },
      { key:'section_id',label:'Section ID (computerlab/physics/library etc)',    type:'text',     required:true },
      { key:'title',    label:'Title',                                           type:'text',     required:true },
      { key:'content',  label:'Content',                                         type:'textarea', required:true },
      { key:'images',   label:'Images (upload multiple OR paste comma-sep URLs)',type:'multi_image' },
    ],
    cols: ['Sr','Section ID','Title','Actions'],
    row : r => [r.sr_no, r.section_id, r.title, rowActions(r, false)],
  },

  homework: {
    sheet : 'academics_lists',
    title : 'Holiday Homework',
    fields: [
      { key:'sr_no',    label:'Sr No',                   type:'number' },
      { key:'dept',     label:'Dept (type: homework)',   type:'text', required:true },
      { key:'list_type',label:'Class / Label',           type:'text', required:true },
      { key:'item_text',label:'File URL or Title',       type:'text', required:true },
    ],
    cols: ['Sr','Dept','Class','Title/URL','Actions'],
    row : r => [r.sr_no, r.dept, r.list_type, trunc(r.item_text||'—',50), rowActions(r, false)],
  },

  syllabus: {
    sheet : 'academics_lists',
    title : 'Syllabus Files',
    fields: [
      { key:'sr_no',    label:'Sr No',                   type:'number' },
      { key:'dept',     label:'Dept (type: syllabus)',   type:'text', required:true },
      { key:'list_type',label:'Class Range',             type:'text', required:true },
      { key:'item_text',label:'File URL or Title',       type:'text', required:true },
    ],
    cols: ['Sr','Dept','Class Range','Title/URL','Actions'],
    row : r => [r.sr_no, r.dept, r.list_type, trunc(r.item_text||'—',50), rowActions(r, false)],
  },

  fee: {
    sheet : 'admission_fee',
    title : 'Fee Structure',
    fields: [
      { key:'sr_no',   label:'Sr No',    type:'number' },
      { key:'quarter', label:'Quarter',  type:'text', required:true },
      { key:'month',   label:'Month',    type:'text', required:true },
      { key:'last_date',label:'Last Date',type:'text', required:true },
    ],
    cols: ['Sr','Quarter','Month','Last Date','Actions'],
    row : r => [r.sr_no, r.quarter, r.month, r.last_date, rowActions(r, false)],
  },

  admission_docs: {
    sheet : 'admission_docs',
    title : 'Admission Documents',
    fields: [
      { key:'sr_no',  label:'Sr No',                                               type:'number' },
      { key:'type',   label:'Type (guideline/transport/syllabus_nur/syllabus_vi)', type:'text', required:true },
      { key:'title',  label:'Title',                                               type:'text', required:true },
      { key:'file_url',label:'File',                                               type:'file_or_url' },
      { key:'active', label:'Active',                                              type:'toggle' },
    ],
    cols: ['Sr','Type','Title','Active','Actions'],
    row : r => [r.sr_no, r.type, r.title, badge(r.active), rowActions(r)],
  },

  enquiries: {
    sheet : 'enquiries',
    title : 'Enquiries Inbox',
    fields: [],
    cols: ['Sr','Date','Student','Class','Parent','Mobile','Status','Actions'],
    row : r => [r.sr_no, r.date, r.student_name, r.class, r.parent_name, r.mobile,
      `<span class="badge badge-${r.status==='New'?'new':'done'}">${r.status||'New'}</span>`,
      `<div class="action-btns">
        <button class="btn-icon view" onclick="markDone(${r._row_number},'${r.status||'New'}')">✓ Done</button>
        <button class="btn-icon del"  onclick="deleteRowConfirm('enquiries',${r._row_number})">🗑</button>
      </div>`],
  },

  gallery_images: {
    sheet : 'gallery_albums',
    title : 'Image Gallery Albums',
    fields: [
      { key:'sr_no',        label:'Sr No',        type:'number' },
      { key:'album_title',  label:'Album Title',  type:'text',       required:true },
      { key:'thumbnail_url',label:'Thumbnail',    type:'image' },
      { key:'images',       label:'Album Images', type:'multi_image', hint:'Upload multiple images for this album' },
      { key:'date',         label:'Date',         type:'date' },
      { key:'active',       label:'Active',       type:'toggle' },
    ],
    cols: ['Sr','Album Title','Date','Active','Actions'],
    row : r => [r.sr_no, r.album_title, r.date||'—', badge(r.active), rowActions(r)],
  },

  gallery_videos: {
    sheet : 'gallery_videos',
    title : 'Video Gallery',
    fields: [
      { key:'sr_no',       label:'Sr No',               type:'number' },
      { key:'title',       label:'Video Title',         type:'text', required:true },
      { key:'youtube_url', label:'YouTube / Video URL', type:'video_url', required:true,
        hint:'Paste YouTube link — thumbnail will auto-generate' },
      { key:'thumbnail_url',label:'Custom Thumbnail (optional)', type:'image',
        hint:'Leave empty to use YouTube auto-thumbnail' },
      { key:'active',      label:'Active',              type:'toggle' },
    ],
    cols: ['Sr','Title','URL','Active','Actions'],
    row : r => [r.sr_no, r.title, trunc(r.youtube_url||'—',40), badge(r.active), rowActions(r)],
  },

  career: {
    sheet : 'career_cards',
    title : 'Career Guidance Cards',
    fields: [
      { key:'sr_no',   label:'Sr No',  type:'number' },
      { key:'icon_name',label:'Icon',  type:'text',     hint:'emoji or keyword' },
      { key:'title',   label:'Title',  type:'text',     required:true },
      { key:'content', label:'Content',type:'textarea', required:true },
      { key:'active',  label:'Active', type:'toggle' },
    ],
    cols: ['Sr','Title','Active','Actions'],
    row : r => [r.sr_no, r.title, badge(r.active), rowActions(r)],
  },

  career_resources: {
    sheet : 'career_resources',
    title : 'Career Resources',
    fields: [
      { key:'sr_no',   label:'Sr No',    type:'number' },
      { key:'title',   label:'Title',    type:'text',        required:true },
      { key:'file_url',label:'File',     type:'file_or_url' },
      { key:'file_size',label:'File Size',type:'text',       hint:'e.g. 2.4 MB' },
      { key:'active',  label:'Active',   type:'toggle' },
    ],
    cols: ['Sr','Title','File Size','Active','Actions'],
    row : r => [r.sr_no, r.title, r.file_size||'—', badge(r.active), rowActions(r)],
  },
};

const CONTENT_PANELS = {
  about_content: {
    title   : 'About / Vision / Mission / Philosophy',
    page    : 'about',
    sections: [
      { section:'intro',      label:'About School Intro',    fields:['content'] },
      { section:'vision',     label:'Vision',                fields:['heading','content'] },
      { section:'mission',    label:'Mission',               fields:['heading','content'] },
      { section:'philosophy', label:'Philosophy',            fields:['heading','content'] },
      { section:'dear',       label:'D.E.A.R',               fields:['heading','content'] },
      { section:'director',   label:"Director's Message",    fields:['name','designation','quote','message','photo_url'] },
      { section:'principal',  label:"Principal's Message",   fields:['name','designation','quote','message','photo_url'] },
    ],
  },
  academics_content: {
    title   : 'Academics Dept. Content',
    page    : 'academics',
    sections: [
      { section:'preprimary_intro',label:'Pre-Primary — Intro',  fields:['content'] },
      { section:'primary_intro',   label:'Primary — Intro',      fields:['content'] },
      { section:'middle_intro',    label:'Middle — Intro',       fields:['content'] },
      { section:'senior_intro',    label:'Senior — Intro',       fields:['content'] },
      { section:'senior_motto',    label:'Senior — Motto',       fields:['content'] },
      { section:'council',         label:'Student Council',      fields:['quote','content'] },
    ],
  },
};

const SETTINGS_FIELDS = [
  { key:'school_name',  label:'School Name' },
  { key:'tagline',      label:'Tagline' },
  { key:'phone',        label:'Phone Number' },
  { key:'email',        label:'Email Address' },
  { key:'address',      label:'Full Address' },
  { key:'website',      label:'Website URL' },
  { key:'facebook_url', label:'Facebook URL' },
  { key:'twitter_url',  label:'Twitter URL' },
  { key:'youtube_url',  label:'YouTube URL' },
  { key:'linkedin_url', label:'LinkedIn URL' },
  { key:'erp_login_url',label:'ERP Login URL' },
  { key:'est_year',     label:'Established Year' },
  { key:'map_embed_url',label:'Google Map Embed URL' },
];

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Check existing session
  const token = localStorage.getItem('cms_token');
  const user  = localStorage.getItem('cms_user');
  if (token && user) {
    STATE.user = JSON.parse(user);
    showCMS();
  }

  document.getElementById('loginPass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchPanel(item.dataset.panel);
      if (window.innerWidth <= 768)
        document.getElementById('sidebar').classList.remove('mobile-open');
    });
  });
});

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════
async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');

  errEl.style.display = 'none';
  if (!username || !password) { showErr(errEl,'Enter username and password'); return; }

  btn.disabled    = true;
  btn.textContent = 'Logging in...';

  try {
    const res = await apiPost('login', { username, password });
    if (res.success) {
      localStorage.setItem('cms_token', res.token);
      localStorage.setItem('cms_user',  JSON.stringify(res.user));
      STATE.user = res.user;
      showCMS();
    } else {
      showErr(errEl, res.error || 'Login failed');
    }
  } catch(e) {
    showErr(errEl, 'Network error. Check internet connection.');
  }
  btn.disabled = false; btn.textContent = 'Login';
}

function showCMS() {
  document.getElementById('loginWrap').style.display = 'none';
  document.getElementById('cmsShell').style.display  = 'flex';
  document.getElementById('sidebarUser').innerHTML =
    `<strong>${STATE.user?.name||'Admin'}</strong>${STATE.user?.email||''}`;
  switchPanel('dashboard');
}

async function doLogout() {
  if (!confirm('Logout?')) return;
  try { await apiPost('logout', {}); } catch(e) {}
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
  location.reload();
}

function showErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

// ════════════════════════════════════════════════════════════
//  SIDEBAR TOGGLE — Fixed
// ════════════════════════════════════════════════════════════
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('cmsMain');

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded', isCollapsed);
    // Save state
    localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
  }
}

// Restore sidebar state on load
function restoreSidebarState() {
  if (window.innerWidth > 768 && localStorage.getItem('sidebar_collapsed') === '1') {
    document.getElementById('sidebar')?.classList.add('collapsed');
    document.getElementById('cmsMain')?.classList.add('expanded');
  }
}

// ════════════════════════════════════════════════════════════
//  PANEL SWITCHING
// ════════════════════════════════════════════════════════════
async function switchPanel(panelId) {
  STATE.currentPanel = panelId;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-panel="${panelId}"]`)?.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  const title = PANEL_CONFIG[panelId]?.title
    || CONTENT_PANELS[panelId]?.title
    || panelId.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  document.getElementById('topbarTitle').textContent = title;

  showLoading(true);
  try {
    if (panelId === 'dashboard')       { await loadDashboard();            showPanel('dashboard'); }
    else if (panelId === 'settings')   { await loadSettings();             showPanel('settings'); }
    else if (panelId === 'users')      { await loadUsers();                showPanel('users'); }
    else if (CONTENT_PANELS[panelId]) { await loadContentEditor(panelId); showPanel('content-editor'); }
    else if (PANEL_CONFIG[panelId])   { await loadListPanel(panelId);     showPanel('list'); }
  } catch(e) {
    showToast('Load failed: ' + e.message, 'error');
  }
  showLoading(false);
}

function showPanel(id) { document.getElementById(`panel-${id}`)?.classList.add('active'); }
function showLoading(on) { document.getElementById('panelLoading').style.display = on ? 'flex' : 'none'; }

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [enq, albums, videos, news] = await Promise.all([
      apiGet('get_enquiries'), apiGet('get_gallery_albums'),
      apiGet('get_gallery_videos'), apiGet('get_news'),
    ]);
    document.getElementById('dStat1').textContent = Array.isArray(enq)    ? enq.length    : '—';
    document.getElementById('dStat2').textContent = Array.isArray(albums) ? albums.length : '—';
    document.getElementById('dStat3').textContent = Array.isArray(videos) ? videos.length : '—';
    document.getElementById('dStat4').textContent = Array.isArray(news)   ? news.length   : '—';
  } catch(e) {}
}

// ════════════════════════════════════════════════════════════
//  GENERIC LIST PANEL
// ════════════════════════════════════════════════════════════
async function loadListPanel(panelId) {
  const cfg = PANEL_CONFIG[panelId];
  if (!cfg) return;

  STATE.currentSheet  = cfg.sheet;
  STATE.currentFields = cfg.fields;

  document.getElementById('listPanelTitle').textContent = cfg.title;
  document.querySelector('#panel-list .btn-primary-sm').style.display =
    cfg.fields.length === 0 ? 'none' : '';

  const rows = await apiGet('get_all_rows', { sheet: cfg.sheet });
  STATE.currentRows = rows || [];
  renderTable(cfg);
}

function renderTable(cfg) {
  const thead = document.getElementById('listThead');
  const tbody = document.getElementById('listTbody');
  const empty = document.getElementById('listEmpty');

  thead.innerHTML = `<tr>${cfg.cols.map(c=>`<th>${c}</th>`).join('')}</tr>`;

  const rows = STATE.currentRows;
  if (!rows.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = rows.map(r =>
    `<tr>${cfg.row(r).map(c=>`<td>${c}</td>`).join('')}</tr>`
  ).join('');
}

function filterList() {
  const q   = document.getElementById('listSearch').value.toLowerCase();
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  if (!cfg) return;
  if (!q) { loadListPanel(STATE.currentPanel); return; }

  const allRows = STATE.currentRows._orig || STATE.currentRows;
  STATE.currentRows = allRows.filter(r =>
    Object.values(r).some(v => v.toString().toLowerCase().includes(q))
  );
  if (!STATE.currentRows._orig) STATE.currentRows._orig = [...allRows];
  renderTable(cfg);
}

// ════════════════════════════════════════════════════════════
//  MODAL — Add / Edit
// ════════════════════════════════════════════════════════════
function openModal(mode, rowNum) {
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  if (!cfg || !cfg.fields.length) return;

  STATE.editRowNum = mode === 'edit' ? rowNum : null;
  document.getElementById('modalTitle').textContent =
    mode === 'add' ? `Add ${cfg.title}` : `Edit ${cfg.title}`;

  const row  = mode === 'edit' ? STATE.currentRows.find(r => r._row_number === rowNum) : {};
  const body = document.getElementById('modalBody');
  body.innerHTML = cfg.fields.map(f => buildField(f, row?.[f.key] ?? '')).join('');

  // Post-render hooks
  body.querySelectorAll('[data-video-preview]').forEach(inp => {
    inp.addEventListener('input', () => updateVideoPreview(inp));
    if (inp.value) updateVideoPreview(inp);
  });

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
}

// ── Field builder ──────────────────────────────────────────
function buildField(f, val) {
  const id   = `field_${f.key}`;
  const hint = f.hint ? `<div class="form-hint">${f.hint}</div>` : '';

  switch(f.type) {

    case 'toggle': {
      const isOn = (val.toString().toUpperCase() === 'YES');
      return `<div class="form-group">
        <label>${f.label}</label>
        <div class="toggle-wrap">
          <button type="button" class="toggle ${isOn?'on':''}" id="${id}"
            onclick="this.classList.toggle('on');this.nextElementSibling.textContent=this.classList.contains('on')?'Active':'Inactive'"></button>
          <span>${isOn?'Active':'Inactive'}</span>
        </div>${hint}
      </div>`;
    }

    case 'select': {
      const opts = f.options.map(o => `<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('');
      return `<div class="form-group"><label>${f.label}</label><select id="${id}">${opts}</select>${hint}</div>`;
    }

    case 'textarea':
      return `<div class="form-group"><label>${f.label}</label>
        <textarea id="${id}" rows="4">${escHtml(val)}</textarea>${hint}</div>`;

    case 'color':
      return `<div class="form-group"><label>${f.label}</label>
        <input type="color" id="${id}" value="${val||'#1a3a6b'}"/>${hint}</div>`;

    // ── Date picker (DD-MM-YYYY) ──
    case 'date': {
      const htmlVal = displayDateToHtml(val); // convert stored DD-MM-YYYY → YYYY-MM-DD for input
      return `<div class="form-group"><label>${f.label}</label>
        <input type="date" id="${id}" value="${htmlVal}"
          onchange="this.dataset.display=formatDisplayDate(this.value)"/>
        ${hint}</div>`;
    }

    // ── DD-MM only (birthdays) ──
    case 'ddmm':
      return `<div class="form-group"><label>${f.label}</label>
        <input type="text" id="${id}" value="${escHtml(val)}" placeholder="DD-MM e.g. 25-01"
          maxlength="5" oninput="formatDDMM(this)"/>
        ${hint}</div>`;

    // ── Image upload + URL input (dual option) ──
    case 'image':
      return `<div class="form-group">
        <label>${f.label}</label>
        <div class="dual-upload">
          <div class="dual-tab-btns">
            <button type="button" class="dual-tab active" onclick="switchDualTab(this,'upload','${id}')">📁 Upload File</button>
            <button type="button" class="dual-tab" onclick="switchDualTab(this,'url','${id}')">🔗 Paste URL</button>
          </div>
          <div id="${id}_upload_pane" class="dual-pane">
            <input type="file" id="${id}_file" accept="image/*" onchange="handleImageFile(this,'${id}')"/>
            <div class="upload-progress" id="${id}_prog" style="display:none;">Uploading...</div>
          </div>
          <div id="${id}_url_pane" class="dual-pane" style="display:none;">
            <input type="url" id="${id}_url" value="${escHtml(val)}" placeholder="https://..." oninput="syncImageUrl(this,'${id}')"/>
          </div>
          <input type="hidden" id="${id}" value="${escHtml(val)}"/>
          ${val ? `<img id="${id}_preview" src="${escHtml(val)}" class="img-preview show" alt="preview" onerror="this.classList.remove('show')"/>` : `<img id="${id}_preview" class="img-preview" alt="preview"/>`}
        </div>${hint}
      </div>`;

    // ── Multi-image upload ──
    case 'multi_image':
      return `<div class="form-group">
        <label>${f.label}</label>
        <div class="dual-upload">
          <div class="dual-tab-btns">
            <button type="button" class="dual-tab active" onclick="switchDualTab(this,'upload','${id}')">📁 Upload Files</button>
            <button type="button" class="dual-tab" onclick="switchDualTab(this,'url','${id}')">🔗 Paste URLs</button>
          </div>
          <div id="${id}_upload_pane" class="dual-pane">
            <input type="file" id="${id}_file" accept="image/*" multiple onchange="handleMultiImageFiles(this,'${id}')"/>
            <div class="upload-progress" id="${id}_prog" style="display:none;">Uploading 0/${0}...</div>
          </div>
          <div id="${id}_url_pane" class="dual-pane" style="display:none;">
            <textarea id="${id}_url" rows="3" placeholder="Paste image URLs separated by commas" oninput="syncMultiUrl(this,'${id}')">${escHtml(val)}</textarea>
          </div>
          <input type="hidden" id="${id}" value="${escHtml(val)}"/>
          <div id="${id}_thumbs" class="multi-thumbs">${renderThumbs(val)}</div>
        </div>${hint}
      </div>`;

    // ── File upload OR URL (for PDFs/docs) ──
    case 'file_or_url':
      return `<div class="form-group">
        <label>${f.label}</label>
        <div class="dual-upload">
          <div class="dual-tab-btns">
            <button type="button" class="dual-tab active" onclick="switchDualTab(this,'upload','${id}')">📁 Upload File</button>
            <button type="button" class="dual-tab" onclick="switchDualTab(this,'url','${id}')">🔗 Paste URL</button>
          </div>
          <div id="${id}_upload_pane" class="dual-pane">
            <input type="file" id="${id}_file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
              onchange="handleAnyFile(this,'${id}')"/>
            <div class="upload-progress" id="${id}_prog" style="display:none;">Uploading...</div>
          </div>
          <div id="${id}_url_pane" class="dual-pane" style="display:none;">
            <input type="url" id="${id}_url" value="${escHtml(val)}" placeholder="https://..." oninput="syncImageUrl(this,'${id}')"/>
          </div>
          <input type="hidden" id="${id}" value="${escHtml(val)}"/>
          ${val ? `<a href="${escHtml(val)}" target="_blank" id="${id}_filelink" style="font-size:12px;color:var(--blue-mid);">📎 View current file</a>` : ''}
        </div>${hint}
      </div>`;

    // ── Video URL with auto thumbnail ──
    case 'video_url':
      return `<div class="form-group">
        <label>${f.label}</label>
        <input type="url" id="${id}" value="${escHtml(val)}" placeholder="https://youtube.com/watch?v=..."
          data-video-preview="${id}_thumb" oninput="updateVideoPreview(this)"/>
        <img id="${id}_thumb" class="img-preview ${val?'show':''}"
          src="${val ? getYTThumb(val) : ''}" alt="Video thumbnail"
          onerror="this.classList.remove('show')"/>
        ${hint}
      </div>`;

    default:
      return `<div class="form-group"><label>${f.label}</label>
        <input type="${f.type||'text'}" id="${id}" value="${escHtml(val)}" placeholder="${f.label}"/>
        ${hint}</div>`;
  }
}

// ── Image upload helpers ──────────────────────────────────

function switchDualTab(btn, mode, fieldId) {
  const container = btn.closest('.dual-upload');
  container.querySelectorAll('.dual-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  container.querySelector(`#${fieldId}_upload_pane`).style.display = mode==='upload' ? '' : 'none';
  container.querySelector(`#${fieldId}_url_pane`).style.display    = mode==='url'    ? '' : 'none';
}

function syncImageUrl(input, fieldId) {
  const hidden  = document.getElementById(fieldId);
  const preview = document.getElementById(`${fieldId}_preview`);
  if (hidden)  hidden.value = input.value;
  if (preview && input.value) {
    preview.src = input.value;
    preview.classList.add('show');
    preview.onerror = () => preview.classList.remove('show');
  }
}

function syncMultiUrl(textarea, fieldId) {
  const hidden = document.getElementById(fieldId);
  if (hidden) hidden.value = textarea.value;
  document.getElementById(`${fieldId}_thumbs`).innerHTML = renderThumbs(textarea.value);
}

async function handleImageFile(input, fieldId) {
  const file = input.files[0];
  if (!file) return;
  await uploadAndSet(file, fieldId);
}

async function handleAnyFile(input, fieldId) {
  const file = input.files[0];
  if (!file) return;
  await uploadAndSet(file, fieldId);
}

async function handleMultiImageFiles(input, fieldId) {
  const files = Array.from(input.files);
  if (!files.length) return;

  const progEl  = document.getElementById(`${fieldId}_prog`);
  const hidden  = document.getElementById(fieldId);
  const thumbs  = document.getElementById(`${fieldId}_thumbs`);
  progEl.style.display = '';

  const existing = (hidden.value || '').split(',').map(u=>u.trim()).filter(Boolean);
  const newUrls  = [];

  for (let i = 0; i < files.length; i++) {
    progEl.textContent = `Uploading ${i+1}/${files.length}...`;
    const url = await uploadFileToDrive(files[i]);
    if (url) newUrls.push(url);
  }

  progEl.style.display = 'none';
  const all = [...existing, ...newUrls].join(',');
  hidden.value = all;
  thumbs.innerHTML = renderThumbs(all);
  showToast(`${newUrls.length} image(s) uploaded!`, 'success');
}

async function uploadAndSet(file, fieldId) {
  const progEl  = document.getElementById(`${fieldId}_prog`);
  progEl.style.display = '';
  progEl.textContent   = 'Uploading...';

  const url = await uploadFileToDrive(file);

  progEl.style.display = 'none';
  if (url) {
    document.getElementById(fieldId).value = url;
    const preview = document.getElementById(`${fieldId}_preview`);
    const link    = document.getElementById(`${fieldId}_filelink`);
    if (preview) { preview.src = url; preview.classList.add('show'); }
    if (link)    { link.href = url; link.style.display = ''; }
    showToast('Uploaded successfully!', 'success');
  } else {
    showToast('Upload failed', 'error');
  }
}

async function uploadFileToDrive(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const base64   = e.target.result.split(',')[1];
        const res      = await fetch(CMS_CONFIG.API_URL, {
          method : 'POST',
          body   : JSON.stringify({
            action   : 'upload_image',
            token    : localStorage.getItem('cms_token') || '',
            base64,
            filename : file.name,
            mimetype : file.type,
          }),
        });
        const json = await res.json();
        resolve(json.success ? json.url : null);
      } catch(err) { resolve(null); }
    };
    reader.readAsDataURL(file);
  });
}

function renderThumbs(urlStr) {
  if (!urlStr) return '';
  return urlStr.split(',').map(u => u.trim()).filter(Boolean).map(url =>
    `<img src="${url}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #e2e8f0;" alt="" onerror="this.remove()"/>`
  ).join('');
}

// ── Video URL → YouTube thumbnail ─────────────────────────
function getYTThumb(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&\s]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

function updateVideoPreview(inp) {
  const previewId = inp.dataset.videoPreview || `field_${inp.id.replace('field_','')}_thumb`;
  const img = document.getElementById(previewId) || inp.nextElementSibling;
  if (!img) return;
  const thumb = getYTThumb(inp.value || '');
  if (thumb) { img.src = thumb; img.classList.add('show'); }
  else img.classList.remove('show');
}

// ── Date format helpers ───────────────────────────────────
function formatDisplayDate(htmlDate) {
  if (!htmlDate) return '';
  const [y,m,d] = htmlDate.split('-');
  return `${d}-${m}-${y}`;
}

function formatDDMM(inp) {
  let v = inp.value.replace(/[^0-9]/g,'');
  if (v.length > 2) v = v.slice(0,2) + '-' + v.slice(2,4);
  inp.value = v;
}

// ════════════════════════════════════════════════════════════
//  SAVE MODAL ROW
// ════════════════════════════════════════════════════════════
async function saveModalRow() {
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  if (!cfg) return;

  for (const f of cfg.fields) {
    if (f.required) {
      const val = getFieldValue(f);
      if (!val.toString().trim()) {
        showToast(`"${f.label}" is required`, 'error');
        document.getElementById(`field_${f.key}`)?.focus();
        return;
      }
    }
  }

  const data = {};
  cfg.fields.forEach(f => { data[f.key] = getFieldValue(f); });

  // Convert date fields from YYYY-MM-DD back to DD-MM-YYYY
  cfg.fields.forEach(f => {
    if (f.type === 'date' && data[f.key]) {
      data[f.key] = htmlDateToDisplay(data[f.key]);
    }
  });

  showLoading(true);
  try {
    let res;
    if (STATE.editRowNum) {
      res = await apiPost('update_row', { sheet: cfg.sheet, row_number: STATE.editRowNum, data });
    } else {
      if (!data.sr_no) data.sr_no = (STATE.currentRows.length + 1).toString();
      res = await apiPost('add_row', { sheet: cfg.sheet, data });
    }

    if (res.success) {
      showToast(STATE.editRowNum ? 'Updated!' : 'Added!', 'success');
      document.getElementById('modalOverlay').classList.remove('open');
      await loadListPanel(STATE.currentPanel);
    } else {
      showToast(res.error || 'Save failed', 'error');
    }
  } catch(e) {
    showToast('Network error: ' + e.message, 'error');
  }
  showLoading(false);
}

function getFieldValue(f) {
  const el = document.getElementById(`field_${f.key}`);
  if (!el) return '';
  if (f.type === 'toggle') return el.classList.contains('on') ? 'YES' : 'NO';
  return el.value || '';
}

// ════════════════════════════════════════════════════════════
//  DELETE / TOGGLE
// ════════════════════════════════════════════════════════════
async function deleteRowConfirm(sheet, rowNum) {
  if (!confirm('Delete this record? This cannot be undone.')) return;
  showLoading(true);
  const res = await apiPost('delete_row', { sheet, row_number: rowNum });
  showLoading(false);
  if (res.success) { showToast('Deleted', 'success'); await loadListPanel(STATE.currentPanel); }
  else showToast(res.error || 'Delete failed', 'error');
}

async function toggleRow(sheet, rowNum, currentActive) {
  const newActive = currentActive.toUpperCase() !== 'YES';
  showLoading(true);
  const res = await apiPost('toggle_active', { sheet, row_number: rowNum, active: newActive });
  showLoading(false);
  if (res.success) { showToast(newActive ? 'Activated' : 'Deactivated', 'success'); await loadListPanel(STATE.currentPanel); }
  else showToast(res.error || 'Failed', 'error');
}

// ════════════════════════════════════════════════════════════
//  CONTENT EDITOR
// ════════════════════════════════════════════════════════════
async function loadContentEditor(panelId) {
  const cfg = CONTENT_PANELS[panelId];
  if (!cfg) return;

  document.getElementById('contentEditorTitle').textContent = cfg.title;
  const container = document.getElementById('contentEditorFields');
  container.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner" style="margin:auto;"></div></div>';

  const data = await apiGet('get_content', { page: cfg.page });
  const _d   = data || {};

  container.innerHTML = cfg.sections.map(sec => `
    <div class="content-section-block" data-page="${cfg.page}" data-section="${sec.section}">
      <div class="content-section-header">${sec.label}</div>
      <div class="content-section-body">
        ${sec.fields.map(field => {
          const val = _d[sec.section]?.[field] || '';
          const isLong = field === 'message' || field === 'content';
          return `<div class="form-group">
            <label>${field.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            ${isLong
              ? `<textarea rows="5" data-field="${field}">${escHtml(val)}</textarea>`
              : `<input type="text" data-field="${field}" value="${escHtml(val)}" placeholder="${field}"/>`}
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

async function saveAllContent() {
  const blocks  = document.querySelectorAll('.content-section-block');
  const updates = [];
  blocks.forEach(block => {
    const page    = block.dataset.page;
    const section = block.dataset.section;
    block.querySelectorAll('[data-field]').forEach(el => {
      updates.push({ page, section, field: el.dataset.field, value: el.value });
    });
  });

  showLoading(true);
  try {
    for (const u of updates) await apiPost('update_content', u);
    showToast('All content saved!', 'success');
  } catch(e) { showToast('Save failed', 'error'); }
  showLoading(false);
}

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════
async function loadSettings() {
  const data = await apiGet('get_settings');
  const grid = document.getElementById('settingsGrid');
  grid.innerHTML = SETTINGS_FIELDS.map(f => `
    <div class="form-group">
      <label>${f.label}</label>
      <input type="text" id="setting_${f.key}" value="${escHtml(data?.[f.key]||'')}" placeholder="${f.label}"/>
    </div>
  `).join('');
}

async function saveAllSettings() {
  showLoading(true);
  try {
    for (const f of SETTINGS_FIELDS) {
      const el = document.getElementById(`setting_${f.key}`);
      if (el) await apiPost('update_setting', { field: f.key, value: el.value });
    }
    showToast('Settings saved!', 'success');
  } catch(e) { showToast('Save failed', 'error'); }
  showLoading(false);
}

// ════════════════════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════════════════════
async function loadUsers() {
  const rows  = await apiGet('get_users');
  const tbody = document.getElementById('usersTbody');
  if (!rows || !rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#9aa3af;">No users found</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.sr_no}</td><td>${r.name}</td><td>${r.email}</td>
      <td><strong>${r.username}</strong></td>
      <td><div class="action-btns">
        <button class="btn-icon del" onclick="deleteUserConfirm(${r._row_number},'${r.username}')">🗑 Delete</button>
      </div></td>
    </tr>
  `).join('');
}

function openUserModal() {
  ['uName','uEmail','uUsername','uPassword'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('userModalOverlay').classList.add('open');
}

function closeUserModal(e) {
  if (e && e.target !== document.getElementById('userModalOverlay')) return;
  document.getElementById('userModalOverlay').classList.remove('open');
}

async function saveUser() {
  const name     = document.getElementById('uName').value.trim();
  const email    = document.getElementById('uEmail').value.trim();
  const username = document.getElementById('uUsername').value.trim();
  const password = document.getElementById('uPassword').value.trim();

  if (!name||!email||!username||!password) { showToast('All fields required','error'); return; }
  if (username.includes(' '))              { showToast('Username cannot have spaces','error'); return; }

  showLoading(true);
  const res = await apiPost('add_user', { name, email, username, password });
  showLoading(false);

  if (res.success) { showToast('User added!','success'); closeUserModal(); await loadUsers(); }
  else showToast(res.error||'Failed','error');
}

async function deleteUserConfirm(rowNum, username) {
  if (username === STATE.user?.username) { showToast('Cannot delete your own account','error'); return; }
  if (!confirm(`Delete user "${username}"?`)) return;
  showLoading(true);
  const res = await apiPost('delete_user', { row_number: rowNum });
  showLoading(false);
  if (res.success) { showToast('User deleted','success'); await loadUsers(); }
  else showToast(res.error||'Failed','error');
}

// ════════════════════════════════════════════════════════════
//  ENQUIRIES
// ════════════════════════════════════════════════════════════
async function markDone(rowNum, currentStatus) {
  const newStatus = currentStatus === 'New' ? 'Done' : 'New';
  showLoading(true);
  const res = await apiPost('update_row', {
    sheet: 'enquiries', row_number: rowNum, data: { status: newStatus }
  });
  showLoading(false);
  if (res.success) { showToast('Status updated','success'); await loadListPanel('enquiries'); }
}

// ════════════════════════════════════════════════════════════
//  API HELPERS
// ════════════════════════════════════════════════════════════
async function apiGet(action, params = {}) {
  const url   = new URL(CMS_CONFIG.API_URL);
  const token = localStorage.getItem('cms_token') || '';
  url.searchParams.set('action', action);
  if (token) url.searchParams.set('token', token);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v));

  const res  = await fetch(url.toString());
  const json = await res.json();

  // Handle expired session
  if (!json.success && json.error && json.error.toLowerCase().includes('session')) {
    handleSessionExpired();
    return null;
  }
  return json.success ? json.data : null;
}

async function apiPost(action, body = {}) {
  const token = localStorage.getItem('cms_token') || '';
  const res   = await fetch(CMS_CONFIG.API_URL, {
    method : 'POST',
    body   : JSON.stringify({ action, token, ...body }),
  });
  const json = await res.json();

  // Handle expired session
  if (!json.success && json.error && json.error.toLowerCase().includes('session')) {
    handleSessionExpired();
  }
  return json;
}

function handleSessionExpired() {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
  showToast('Session expired. Please login again.', 'error');
  setTimeout(() => location.reload(), 2000);
}

// ════════════════════════════════════════════════════════════
//  UI HELPERS
// ════════════════════════════════════════════════════════════
function badge(active) {
  const on = (active||'').toUpperCase() === 'YES';
  return `<span class="badge ${on?'badge-yes':'badge-no'}">${on?'YES':'NO'}</span>`;
}

function rowActions(r, hasToggle = true) {
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  let html  = `<div class="action-btns">`;
  if (cfg?.fields.length)
    html += `<button class="btn-icon edit" onclick="openModal('edit',${r._row_number})">✏️ Edit</button>`;
  if (hasToggle && r.active !== undefined)
    html += `<button class="btn-icon tog" onclick="toggleRow('${cfg?.sheet}',${r._row_number},'${r.active}')">⏺ Toggle</button>`;
  html += `<button class="btn-icon del" onclick="deleteRowConfirm('${cfg?.sheet}',${r._row_number})">🗑</button>`;
  return html + `</div>`;
}

function trunc(str, len) { return str.length > len ? str.slice(0,len)+'…' : str; }

function escHtml(str) {
  return (str||'').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type='success') {
  const t   = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Init sidebar state on page load ──
window.addEventListener('load', restoreSidebarState);
