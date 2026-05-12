/* ============================================================
   CMS.JS — Sulekh Convent Public School CMS
   Full CRUD for all sections via Google Sheets API
   ============================================================ */

// ── State ────────────────────────────────────────────────────
let STATE = {
  currentPanel : 'dashboard',
  currentSheet : '',
  currentFields: [],
  currentRows  : [],
  editRowNum   : null,
  user         : null,
};

// ── Panel → Sheet + Fields config ────────────────────────────
const PANEL_CONFIG = {

  slider: {
    sheet : 'home_slider',
    title : 'Hero Slider',
    fields: [
      { key:'sr_no',         label:'Sr No',        type:'number' },
      { key:'title',         label:'Title',         type:'text',     required:true },
      { key:'subtitle',      label:'Subtitle',      type:'text' },
      { key:'tag',           label:'Tag (small text above title)', type:'text' },
      { key:'button1_text',  label:'Button 1 Text', type:'text' },
      { key:'button1_link',  label:'Button 1 Link', type:'text' },
      { key:'button2_text',  label:'Button 2 Text', type:'text' },
      { key:'button2_link',  label:'Button 2 Link', type:'text' },
      { key:'bg_color',      label:'BG Color (hex)', type:'color' },
      { key:'image_url',     label:'Image URL',     type:'url',  hint:'Paste Google Drive / CDN image link' },
      { key:'active',        label:'Active',        type:'toggle' },
    ],
    cols: ['Sr No','Title','Subtitle','Button 1','Active','Actions'],
    row : r => [r.sr_no, r.title, r.subtitle||'—', r.button1_text||'—',
                badge(r.active), actions(r._row_number, r.active)],
  },

  news: {
    sheet : 'home_news',
    title : 'News Ticker',
    fields: [
      { key:'sr_no',    label:'Sr No',     type:'number' },
      { key:'news_text',label:'News Text', type:'text', required:true },
      { key:'link_url', label:'Link URL',  type:'url' },
      { key:'active',   label:'Active',    type:'toggle' },
    ],
    cols: ['Sr No','News Text','Link','Active','Actions'],
    row : r => [r.sr_no, r.news_text, r.link_url||'—', badge(r.active), actions(r._row_number, r.active)],
  },

  quicklinks: {
    sheet : 'home_quicklinks',
    title : 'Quick Links',
    fields: [
      { key:'sr_no',   label:'Sr No',  type:'number' },
      { key:'label',   label:'Label',  type:'text', required:true },
      { key:'icon',    label:'Icon',   type:'text', hint:'emoji or icon name' },
      { key:'link_url',label:'Link URL',type:'url' },
    ],
    cols: ['Sr No','Label','Icon','Link','Actions'],
    row : r => [r.sr_no, r.label, r.icon||'—', r.link_url||'—', actions(r._row_number, null, false)],
  },

  toppers: {
    sheet : 'home_toppers',
    title : 'Our Toppers',
    fields: [
      { key:'sr_no',       label:'Sr No',       type:'number' },
      { key:'student_name',label:'Student Name', type:'text', required:true },
      { key:'class',       label:'Class',        type:'text', required:true },
      { key:'percentage',  label:'Percentage %', type:'text', required:true },
      { key:'photo_url',   label:'Photo URL',    type:'url' },
      { key:'year',        label:'Year',         type:'text' },
      { key:'active',      label:'Active',       type:'toggle' },
    ],
    cols: ['Sr No','Name','Class','%','Year','Active','Actions'],
    row : r => [r.sr_no, r.student_name, r.class, r.percentage+'%', r.year||'—', badge(r.active), actions(r._row_number, r.active)],
  },

  birthdays: {
    sheet : 'home_birthdays',
    title : 'Birthdays',
    fields: [
      { key:'sr_no',       label:'Sr No',       type:'number' },
      { key:'student_name',label:'Student Name', type:'text', required:true },
      { key:'class',       label:'Class',        type:'text' },
      { key:'date',        label:'Date (DD-MM)', type:'text', required:true, hint:'Format: 25-01' },
    ],
    cols: ['Sr No','Name','Class','Date (DD-MM)','Actions'],
    row : r => [r.sr_no, r.student_name, r.class||'—', r.date, actions(r._row_number, null, false)],
  },

  circulars: {
    sheet : 'home_circulars',
    title : 'School Circulars',
    fields: [
      { key:'sr_no',   label:'Sr No',    type:'number' },
      { key:'title',   label:'Title',    type:'text', required:true },
      { key:'file_url',label:'File URL', type:'url' },
      { key:'date',    label:'Date',     type:'text' },
      { key:'active',  label:'Active',   type:'toggle' },
    ],
    cols: ['Sr No','Title','Date','Active','Actions'],
    row : r => [r.sr_no, r.title, r.date||'—', badge(r.active), actions(r._row_number, r.active)],
  },

  departments: {
    sheet : 'home_departments',
    title : 'Departments Preview (Homepage)',
    fields: [
      { key:'sr_no',    label:'Sr No',       type:'number' },
      { key:'dept_name',label:'Dept Name',   type:'text', required:true },
      { key:'short_desc',label:'Short Description', type:'textarea' },
      { key:'link_url', label:'Link URL',    type:'url' },
      { key:'bg_color', label:'BG Color',    type:'color' },
      { key:'image_url',label:'Image URL',   type:'url' },
    ],
    cols: ['Sr No','Name','Description','Link','Actions'],
    row : r => [r.sr_no, r.dept_name, trunc(r.short_desc||'—',60), r.link_url||'—', actions(r._row_number, null, false)],
  },

  partners: {
    sheet : 'home_partners',
    title : 'Partners / Affiliations',
    fields: [
      { key:'sr_no',   label:'Sr No',    type:'number' },
      { key:'name',    label:'Name',     type:'text', required:true },
      { key:'logo_url',label:'Logo URL', type:'url' },
      { key:'link_url',label:'Link URL', type:'url' },
    ],
    cols: ['Sr No','Name','Logo URL','Actions'],
    row : r => [r.sr_no, r.name, trunc(r.logo_url||'—',50), actions(r._row_number, null, false)],
  },

  trailblazers: {
    sheet : 'trailblazers',
    title : 'Trail Blazers',
    fields: [
      { key:'sr_no',       label:'Sr No',        type:'number' },
      { key:'name',        label:'Name',          type:'text', required:true },
      { key:'designation', label:'Designation',   type:'text' },
      { key:'organization',label:'Organization',  type:'text' },
      { key:'photo_url',   label:'Photo URL',     type:'url' },
    ],
    cols: ['Sr No','Name','Designation','Organization','Actions'],
    row : r => [r.sr_no, r.name, r.designation||'—', r.organization||'—', actions(r._row_number, null, false)],
  },

  values: {
    sheet : 'values_list',
    title : 'School Values',
    fields: [
      { key:'sr_no', label:'Sr No', type:'number' },
      { key:'value', label:'Value', type:'text', required:true },
    ],
    cols: ['Sr No','Value','Actions'],
    row : r => [r.sr_no, r.value, actions(r._row_number, null, false)],
  },

  policies: {
    sheet : 'policies',
    title : 'School Policies',
    fields: [
      { key:'sr_no',       label:'Sr No',       type:'number' },
      { key:'policy_name', label:'Policy Name', type:'text',     required:true },
      { key:'content',     label:'Content',     type:'textarea', required:true },
    ],
    cols: ['Sr No','Policy Name','Content','Actions'],
    row : r => [r.sr_no, r.policy_name, trunc(r.content||'—',80), actions(r._row_number, null, false)],
  },

  salient: {
    sheet : 'salient_features',
    title : 'Salient Features',
    fields: [
      { key:'sr_no',    label:'Sr No',    type:'number' },
      { key:'title',    label:'Title',    type:'text',     required:true },
      { key:'content',  label:'Content',  type:'textarea', required:true },
      { key:'image_url',label:'Image URL',type:'url' },
    ],
    cols: ['Sr No','Title','Content','Actions'],
    row : r => [r.sr_no, r.title, trunc(r.content||'—',80), actions(r._row_number, null, false)],
  },

  clubs: {
    sheet : 'clubs',
    title : 'Clubs',
    fields: [
      { key:'sr_no',    label:'Sr No',                type:'number' },
      { key:'group',    label:'Group (A / B / C)',     type:'select', options:['A','B','C'], required:true },
      { key:'club_name',label:'Club Name',             type:'text', required:true },
      { key:'active',   label:'Active',                type:'toggle' },
    ],
    cols: ['Sr No','Group','Club Name','Active','Actions'],
    row : r => [r.sr_no, `<strong>${r.group}</strong>`, r.club_name, badge(r.active), actions(r._row_number, r.active)],
  },

  houses: {
    sheet : 'houses',
    title : 'House Systems',
    fields: [
      { key:'sr_no',      label:'Sr No',      type:'number' },
      { key:'house_name', label:'House Name', type:'text',   required:true },
      { key:'color',      label:'Color',      type:'color' },
      { key:'active',     label:'Active',     type:'toggle' },
    ],
    cols: ['Sr No','House Name','Color','Active','Actions'],
    row : r => [r.sr_no, r.house_name, `<span style="background:${r.color};color:#fff;padding:2px 10px;border-radius:4px;font-size:11px;">${r.color}</span>`, badge(r.active), actions(r._row_number, r.active)],
  },

  discipline: {
    sheet : 'discipline',
    title : 'Discipline & Timings',
    fields: [
      { key:'sr_no',    label:'Sr No',                            type:'number' },
      { key:'type',     label:'Type (timings/cards/rules)',        type:'select', options:['timings','cards','rules'], required:true },
      { key:'category', label:'Category (e.g. Yellow Card)',       type:'text' },
      { key:'content',  label:'Content',                          type:'textarea', required:true },
    ],
    cols: ['Sr No','Type','Category','Content','Actions'],
    row : r => [r.sr_no, r.type, r.category||'—', trunc(r.content||'—',80), actions(r._row_number, null, false)],
  },

  infra: {
    sheet : 'infra_items',
    title : 'Infrastructure',
    fields: [
      { key:'sr_no',     label:'Sr No',                                                         type:'number' },
      { key:'section_id',label:'Section ID (e.g. computerlab, physics, library)',                type:'text', required:true },
      { key:'title',     label:'Title',                                                         type:'text', required:true },
      { key:'content',   label:'Content',                                                       type:'textarea', required:true },
      { key:'images',    label:'Images (comma-separated URLs)',                                  type:'textarea', hint:'Paste multiple image URLs separated by commas' },
    ],
    cols: ['Sr No','Section ID','Title','Content','Actions'],
    row : r => [r.sr_no, r.section_id, r.title, trunc(r.content||'—',80), actions(r._row_number, null, false)],
  },

  homework: {
    sheet : 'academics_lists',
    title : 'Holiday Homework',
    fields: [
      { key:'sr_no',    label:'Sr No',                   type:'number' },
      { key:'dept',     label:'Dept (use: homework)',     type:'text', required:true, hint:'Always type: homework' },
      { key:'list_type',label:'List Type',               type:'text', required:true, hint:'e.g. class_vi' },
      { key:'item_text',label:'File Title / Link Text',  type:'text', required:true },
    ],
    cols: ['Sr No','Dept','List Type','Item','Actions'],
    row : r => [r.sr_no, r.dept, r.list_type, r.item_text, actions(r._row_number, null, false)],
  },

  syllabus: {
    sheet : 'academics_lists',
    title : 'Syllabus Files',
    fields: [
      { key:'sr_no',    label:'Sr No',                    type:'number' },
      { key:'dept',     label:'Dept (use: syllabus)',      type:'text', required:true, hint:'Always type: syllabus' },
      { key:'list_type',label:'Class Range',              type:'text', required:true, hint:'e.g. class_i_v' },
      { key:'item_text',label:'Title / Link Text',        type:'text', required:true },
    ],
    cols: ['Sr No','Dept','Class Range','Title','Actions'],
    row : r => [r.sr_no, r.dept, r.list_type, r.item_text, actions(r._row_number, null, false)],
  },

  fee: {
    sheet : 'admission_fee',
    title : 'Fee Structure (Quarters)',
    fields: [
      { key:'sr_no',    label:'Sr No',    type:'number' },
      { key:'quarter',  label:'Quarter',  type:'text', required:true },
      { key:'month',    label:'Month',    type:'text', required:true },
      { key:'last_date',label:'Last Date',type:'text', required:true },
    ],
    cols: ['Sr No','Quarter','Month','Last Date','Actions'],
    row : r => [r.sr_no, r.quarter, r.month, r.last_date, actions(r._row_number, null, false)],
  },

  admission_docs: {
    sheet : 'admission_docs',
    title : 'Admission Documents & Downloads',
    fields: [
      { key:'sr_no',   label:'Sr No',                                             type:'number' },
      { key:'type',    label:'Type (guideline/transport/syllabus_nur/syllabus_vi)',type:'text', required:true },
      { key:'title',   label:'Title',                                             type:'text', required:true },
      { key:'file_url',label:'File URL',                                          type:'url' },
      { key:'active',  label:'Active',                                            type:'toggle' },
    ],
    cols: ['Sr No','Type','Title','Active','Actions'],
    row : r => [r.sr_no, r.type, r.title, badge(r.active), actions(r._row_number, r.active)],
  },

  enquiries: {
    sheet : 'enquiries',
    title : 'Enquiries Inbox',
    fields: [],   // read-only
    cols: ['Sr No','Date','Student Name','Class','Parent','Mobile','Email','Status','Actions'],
    row : r => [r.sr_no, r.date, r.student_name, r.class, r.parent_name, r.mobile, r.email||'—',
                `<span class="badge badge-${r.status==='New'?'new':'done'}">${r.status}</span>`,
                `<div class="action-btns">
                  <button class="btn-icon view" onclick="markDone(${r._row_number},'${r.status}')">✓ Done</button>
                  <button class="btn-icon del"  onclick="deleteRowConfirm('enquiries',${r._row_number})">🗑</button>
                </div>`],
  },

  gallery_images: {
    sheet : 'gallery_albums',
    title : 'Image Gallery Albums',
    fields: [
      { key:'sr_no',       label:'Sr No',                     type:'number' },
      { key:'album_title', label:'Album Title',               type:'text',     required:true },
      { key:'thumbnail_url',label:'Thumbnail URL',            type:'url' },
      { key:'images',      label:'Images (comma-separated URLs)', type:'textarea', hint:'Paste multiple image URLs separated by commas' },
      { key:'date',        label:'Date',                      type:'text' },
      { key:'active',      label:'Active',                    type:'toggle' },
    ],
    cols: ['Sr No','Album Title','Date','Active','Actions'],
    row : r => [r.sr_no, r.album_title, r.date||'—', badge(r.active), actions(r._row_number, r.active)],
  },

  gallery_videos: {
    sheet : 'gallery_videos',
    title : 'Video Gallery',
    fields: [
      { key:'sr_no',         label:'Sr No',         type:'number' },
      { key:'title',         label:'Video Title',   type:'text',  required:true },
      { key:'youtube_url',   label:'YouTube URL',   type:'url',   required:true, hint:'Full YouTube video URL' },
      { key:'thumbnail_url', label:'Thumbnail URL', type:'url' },
      { key:'active',        label:'Active',        type:'toggle' },
    ],
    cols: ['Sr No','Title','YouTube URL','Active','Actions'],
    row : r => [r.sr_no, r.title, trunc(r.youtube_url||'—',50), badge(r.active), actions(r._row_number, r.active)],
  },

  career: {
    sheet : 'career_cards',
    title : 'Career Guidance Cards',
    fields: [
      { key:'sr_no',    label:'Sr No',    type:'number' },
      { key:'icon_name',label:'Icon Name',type:'text',     hint:'emoji or icon keyword' },
      { key:'title',    label:'Title',    type:'text',     required:true },
      { key:'content',  label:'Content',  type:'textarea', required:true },
      { key:'active',   label:'Active',   type:'toggle' },
    ],
    cols: ['Sr No','Title','Content','Active','Actions'],
    row : r => [r.sr_no, r.title, trunc(r.content||'—',80), badge(r.active), actions(r._row_number, r.active)],
  },

  career_resources: {
    sheet : 'career_resources',
    title : 'Career Resources / Downloads',
    fields: [
      { key:'sr_no',    label:'Sr No',     type:'number' },
      { key:'title',    label:'Title',     type:'text',  required:true },
      { key:'file_url', label:'File URL',  type:'url' },
      { key:'file_size',label:'File Size', type:'text',  hint:'e.g. 2.4 MB' },
      { key:'active',   label:'Active',    type:'toggle' },
    ],
    cols: ['Sr No','Title','File Size','Active','Actions'],
    row : r => [r.sr_no, r.title, r.file_size||'—', badge(r.active), actions(r._row_number, r.active)],
  },

};

// Content block panels (text editor style)
const CONTENT_PANELS = {
  about_content: {
    title  : 'About / Vision / Mission / Philosophy',
    sections: [
      { section:'intro',      label:'About School Intro',   fields:['content'] },
      { section:'vision',     label:'Vision',               fields:['heading','content'] },
      { section:'mission',    label:'Mission',              fields:['heading','content'] },
      { section:'philosophy', label:'Philosophy',           fields:['heading','content'] },
      { section:'dear',       label:'D.E.A.R Section',      fields:['heading','content'] },
      { section:'director',   label:"Director's Message",   fields:['name','designation','quote','message','photo_url'] },
      { section:'principal',  label:"Principal's Message",  fields:['name','designation','quote','message','photo_url'] },
    ],
    page: 'about',
  },
  academics_content: {
    title  : 'Academics Department Content',
    sections: [
      { section:'preprimary_intro', label:'Pre-Primary Dept — Intro',   fields:['content'] },
      { section:'primary_intro',    label:'Primary Dept — Intro',       fields:['content'] },
      { section:'middle_intro',     label:'Middle Dept — Intro',        fields:['content'] },
      { section:'senior_intro',     label:'Senior Dept — Intro',        fields:['content'] },
      { section:'senior_motto',     label:'Senior Dept — Motto',        fields:['content'] },
      { section:'council',          label:'Student Council',            fields:['quote','content'] },
    ],
    page: 'academics',
  },
};

// ── SETTINGS fields ──────────────────────────────────────────
const SETTINGS_FIELDS = [
  { key:'school_name',   label:'School Name' },
  { key:'tagline',       label:'Tagline' },
  { key:'phone',         label:'Phone Number' },
  { key:'email',         label:'Email Address' },
  { key:'address',       label:'Full Address' },
  { key:'website',       label:'Website URL' },
  { key:'facebook_url',  label:'Facebook URL' },
  { key:'twitter_url',   label:'Twitter URL' },
  { key:'youtube_url',   label:'YouTube URL' },
  { key:'linkedin_url',  label:'LinkedIn URL' },
  { key:'erp_login_url', label:'ERP Login URL' },
  { key:'est_year',      label:'Established Year' },
  { key:'map_embed_url', label:'Google Map Embed URL' },
];

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('cms_token');
  const user  = localStorage.getItem('cms_user');
  if (token && user) {
    STATE.user = JSON.parse(user);
    showCMS();
  }

  // Enter key on login
  document.getElementById('loginPass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  // Nav item clicks
  document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const panel = item.dataset.panel;
      switchPanel(panel);
      // Mobile: close sidebar
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('mobile-open');
      }
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

  if (!username || !password) {
    showErr(errEl, 'Please enter username and password');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const res = await cmsPost('login', { username, password });
    if (res.success) {
      localStorage.setItem('cms_token', res.token);
      localStorage.setItem('cms_user',  JSON.stringify(res.user));
      STATE.user = res.user;
      showCMS();
    } else {
      showErr(errEl, res.error || 'Login failed');
    }
  } catch (e) {
    showErr(errEl, 'Network error. Check internet connection.');
  }

  btn.disabled = false;
  btn.textContent = 'Login';
}

function showCMS() {
  document.getElementById('loginWrap').style.display = 'none';
  document.getElementById('cmsShell').style.display  = 'flex';
  document.getElementById('sidebarUser').innerHTML =
    `<strong>${STATE.user?.name || 'Admin'}</strong>${STATE.user?.email || ''}`;
  switchPanel('dashboard');
}

async function doLogout() {
  if (!confirm('Logout?')) return;
  await cmsPost('logout', {});
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
  location.reload();
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// ════════════════════════════════════════════════════════════
//  PANEL SWITCHING
// ════════════════════════════════════════════════════════════
async function switchPanel(panelId) {
  STATE.currentPanel = panelId;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-panel="${panelId}"]`)?.classList.add('active');

  // Hide all panels
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  // Update topbar title
  const title = PANEL_CONFIG[panelId]?.title
    || CONTENT_PANELS[panelId]?.title
    || panelId.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  document.getElementById('topbarTitle').textContent = title;

  showLoading(true);

  if (panelId === 'dashboard')        { await loadDashboard();           showPanel('dashboard'); }
  else if (panelId === 'settings')    { await loadSettings();            showPanel('settings'); }
  else if (panelId === 'users')       { await loadUsers();               showPanel('users'); }
  else if (CONTENT_PANELS[panelId])  { await loadContentEditor(panelId);showPanel('content-editor'); }
  else if (PANEL_CONFIG[panelId])    { await loadListPanel(panelId);    showPanel('list'); }

  showLoading(false);
}

function showPanel(id) {
  document.getElementById(`panel-${id}`)?.classList.add('active');
}

function showLoading(on) {
  document.getElementById('panelLoading').style.display = on ? 'flex' : 'none';
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [enq, albums, videos, news] = await Promise.all([
      cmsGet('get_enquiries', {}),
      cmsGet('get_gallery_albums', {}),
      cmsGet('get_gallery_videos', {}),
      cmsGet('get_news', {}),
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

  // Hide add button for read-only panels
  const addBtn = document.querySelector('#panel-list .btn-primary-sm');
  addBtn.style.display = cfg.fields.length === 0 ? 'none' : '';

  // Load rows
  const rows = await loadRows(cfg.sheet);
  STATE.currentRows = rows || [];

  renderTable(cfg);
}

async function loadRows(sheet) {
  const res = await cmsGet('get_all_rows', { sheet });
  return res || [];
}

function renderTable(cfg) {
  const thead = document.getElementById('listThead');
  const tbody = document.getElementById('listTbody');
  const empty = document.getElementById('listEmpty');

  // Header
  thead.innerHTML = `<tr>${cfg.cols.map(c=>`<th>${c}</th>`).join('')}</tr>`;

  // Rows
  const rows = STATE.currentRows;
  if (!rows.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = rows.map(r => `<tr>${cfg.row(r).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');
}

function filterList() {
  const q   = document.getElementById('listSearch').value.toLowerCase();
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  if (!cfg) return;

  STATE.currentRows = (STATE.currentRows._original || STATE.currentRows).filter(r => {
    return Object.values(r).some(v => v.toString().toLowerCase().includes(q));
  });

  if (!STATE.currentRows._original) {
    STATE.currentRows._original = [...STATE.currentRows];
  }

  if (!q) {
    loadListPanel(STATE.currentPanel);
  } else {
    renderTable(cfg);
  }
}

// ════════════════════════════════════════════════════════════
//  MODAL — Add / Edit Row
// ════════════════════════════════════════════════════════════
function openModal(mode, rowNum) {
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  if (!cfg || !cfg.fields.length) return;

  STATE.editRowNum = mode === 'edit' ? rowNum : null;
  document.getElementById('modalTitle').textContent = mode === 'add' ? `Add ${cfg.title}` : `Edit ${cfg.title}`;

  const row = mode === 'edit' ? STATE.currentRows.find(r => r._row_number === rowNum) : {};
  const body = document.getElementById('modalBody');

  body.innerHTML = cfg.fields.map(f => buildField(f, row?.[f.key] ?? '')).join('');

  // Live image preview
  body.querySelectorAll('input[data-preview]').forEach(inp => {
    inp.addEventListener('input', () => updateImgPreview(inp));
    updateImgPreview(inp);
  });

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
}

function buildField(f, val) {
  const id = `field_${f.key}`;
  const hint = f.hint ? `<div class="form-hint">${f.hint}</div>` : '';

  if (f.type === 'toggle') {
    const isOn = (val.toString().toUpperCase() === 'YES');
    return `<div class="form-group">
      <label>${f.label}</label>
      <div class="toggle-wrap">
        <button type="button" class="toggle ${isOn?'on':''}" id="${id}"
          onclick="this.classList.toggle('on')"></button>
        <span>${isOn?'Active':'Inactive'}</span>
      </div>${hint}
    </div>`;
  }

  if (f.type === 'select') {
    const opts = f.options.map(o => `<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('');
    return `<div class="form-group"><label>${f.label}</label><select id="${id}">${opts}</select>${hint}</div>`;
  }

  if (f.type === 'textarea') {
    return `<div class="form-group"><label>${f.label}</label>
      <textarea id="${id}" rows="4">${escHtml(val)}</textarea>${hint}</div>`;
  }

  if (f.type === 'color') {
    return `<div class="form-group"><label>${f.label}</label>
      <input type="color" id="${id}" value="${val||'#1a3a6b'}"/>${hint}</div>`;
  }

  if (f.type === 'url') {
    return `<div class="form-group"><label>${f.label}</label>
      <input type="url" id="${id}" value="${escHtml(val)}" placeholder="https://"
        data-preview="${id}_img"/>
      <img id="${id}_img" class="img-preview" alt="preview"/>
      ${hint}</div>`;
  }

  return `<div class="form-group"><label>${f.label}</label>
    <input type="${f.type||'text'}" id="${id}" value="${escHtml(val)}"
      placeholder="${f.label}"/>${hint}</div>`;
}

function updateImgPreview(inp) {
  const imgId = inp.dataset.preview;
  const img   = document.getElementById(imgId);
  if (!img) return;
  const url = inp.value.trim();
  if (url && (url.startsWith('http') || url.startsWith('/'))) {
    img.src = url;
    img.classList.add('show');
    img.onerror = () => img.classList.remove('show');
  } else {
    img.classList.remove('show');
  }
}

async function saveModalRow() {
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  if (!cfg) return;

  // Validate required
  for (const f of cfg.fields) {
    if (f.required) {
      const el  = document.getElementById(`field_${f.key}`);
      const val = getFieldValue(f);
      if (!val.toString().trim()) {
        showToast(`"${f.label}" is required`, 'error');
        el?.focus();
        return;
      }
    }
  }

  // Collect data
  const data = {};
  cfg.fields.forEach(f => { data[f.key] = getFieldValue(f); });

  showLoading(true);
  try {
    let res;
    if (STATE.editRowNum) {
      res = await cmsPost('update_row', { sheet: cfg.sheet, row_number: STATE.editRowNum, data });
    } else {
      // Auto sr_no
      if (!data.sr_no) data.sr_no = (STATE.currentRows.length + 1).toString();
      res = await cmsPost('add_row', { sheet: cfg.sheet, data });
    }

    if (res.success) {
      showToast(STATE.editRowNum ? 'Updated successfully!' : 'Added successfully!', 'success');
      document.getElementById('modalOverlay').classList.remove('open');
      sessionCache.clear();
      await loadListPanel(STATE.currentPanel);
    } else {
      showToast(res.error || 'Save failed', 'error');
    }
  } catch(e) {
    showToast('Network error', 'error');
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
//  DELETE ROW
// ════════════════════════════════════════════════════════════
async function deleteRowConfirm(sheet, rowNum) {
  if (!confirm('Delete this record? This cannot be undone.')) return;
  showLoading(true);
  const res = await cmsPost('delete_row', { sheet, row_number: rowNum });
  if (res.success) {
    showToast('Deleted', 'success');
    sessionCache.clear();
    await loadListPanel(STATE.currentPanel);
  } else {
    showToast(res.error || 'Delete failed', 'error');
  }
  showLoading(false);
}

// ════════════════════════════════════════════════════════════
//  TOGGLE ACTIVE
// ════════════════════════════════════════════════════════════
async function toggleRow(sheet, rowNum, currentActive) {
  const newActive = currentActive.toUpperCase() !== 'YES';
  showLoading(true);
  const res = await cmsPost('toggle_active', { sheet, row_number: rowNum, active: newActive });
  if (res.success) {
    showToast(newActive ? 'Activated' : 'Deactivated', 'success');
    sessionCache.clear();
    await loadListPanel(STATE.currentPanel);
  } else {
    showToast(res.error || 'Failed', 'error');
  }
  showLoading(false);
}

// ════════════════════════════════════════════════════════════
//  CONTENT EDITOR (text blocks)
// ════════════════════════════════════════════════════════════
let _contentData = {};

async function loadContentEditor(panelId) {
  const cfg = CONTENT_PANELS[panelId];
  if (!cfg) return;

  document.getElementById('contentEditorTitle').textContent = cfg.title;
  const container = document.getElementById('contentEditorFields');
  container.innerHTML = '<div class="panel-loading" style="position:static;padding:40px;"><div class="spinner"></div></div>';

  const data = await cmsGet('get_content', { page: cfg.page });
  _contentData = data || {};

  container.innerHTML = cfg.sections.map(sec => `
    <div class="content-section-block" data-page="${cfg.page}" data-section="${sec.section}">
      <div class="content-section-header">${sec.label}</div>
      <div class="content-section-body">
        ${sec.fields.map(field => `
          <div class="form-group">
            <label>${field.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            ${field === 'message' || field === 'content'
              ? `<textarea rows="5" data-field="${field}">${escHtml(_contentData[sec.section]?.[field] || '')}</textarea>`
              : `<input type="text" data-field="${field}" value="${escHtml(_contentData[sec.section]?.[field] || '')}" placeholder="${field}"/>`
            }
          </div>
        `).join('')}
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
    for (const u of updates) {
      await cmsPost('update_content', u);
    }
    sessionCache.clear();
    showToast('All content saved!', 'success');
  } catch(e) {
    showToast('Save failed', 'error');
  }
  showLoading(false);
}

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════
async function loadSettings() {
  const data = await cmsGet('get_settings', {});
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
      if (el) await cmsPost('update_setting', { field: f.key, value: el.value });
    }
    sessionCache.clear();
    showToast('Settings saved!', 'success');
  } catch(e) {
    showToast('Save failed', 'error');
  }
  showLoading(false);
}

// ════════════════════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════════════════════
async function loadUsers() {
  const rows = await cmsGet('get_users', {});
  const tbody = document.getElementById('usersTbody');
  if (!rows || !rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#9aa3af;">No users found</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.sr_no}</td>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td><strong>${r.username}</strong></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon del" onclick="deleteUserConfirm(${r._row_number},'${r.username}')">🗑 Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openUserModal() {
  ['uName','uEmail','uUsername','uPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
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

  if (!name || !email || !username || !password) {
    showToast('All fields are required', 'error'); return;
  }
  if (username.includes(' ')) {
    showToast('Username cannot contain spaces', 'error'); return;
  }

  showLoading(true);
  const res = await cmsPost('add_user', { name, email, username, password });
  showLoading(false);

  if (res.success) {
    showToast('User added!', 'success');
    closeUserModal();
    await loadUsers();
  } else {
    showToast(res.error || 'Failed to add user', 'error');
  }
}

async function deleteUserConfirm(rowNum, username) {
  if (username === STATE.user?.username) {
    showToast('Cannot delete your own account', 'error'); return;
  }
  if (!confirm(`Delete user "${username}"?`)) return;
  showLoading(true);
  const res = await cmsPost('delete_user', { row_number: rowNum });
  showLoading(false);
  if (res.success) { showToast('User deleted', 'success'); await loadUsers(); }
  else showToast(res.error || 'Failed', 'error');
}

// ════════════════════════════════════════════════════════════
//  ENQUIRIES
// ════════════════════════════════════════════════════════════
async function markDone(rowNum, currentStatus) {
  const newStatus = currentStatus === 'New' ? 'Done' : 'New';
  showLoading(true);
  const res = await cmsPost('update_row', {
    sheet: 'enquiries', row_number: rowNum, data: { status: newStatus }
  });
  showLoading(false);
  if (res.success) {
    showToast('Status updated', 'success');
    sessionCache.clear();
    await loadListPanel('enquiries');
  }
}

// ════════════════════════════════════════════════════════════
//  SIDEBAR TOGGLE
// ════════════════════════════════════════════════════════════
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('cmsMain');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  }
}

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
function badge(active) {
  const isOn = active?.toString().toUpperCase() === 'YES';
  return `<span class="badge ${isOn?'badge-yes':'badge-no'}">${isOn?'YES':'NO'}</span>`;
}

function actions(rowNum, active, hasToggle = true) {
  const cfg = PANEL_CONFIG[STATE.currentPanel];
  let html  = `<div class="action-btns">`;
  if (cfg?.fields.length) {
    html += `<button class="btn-icon edit" onclick="openModal('edit',${rowNum})">✏️ Edit</button>`;
  }
  if (hasToggle && active !== null) {
    html += `<button class="btn-icon tog" onclick="toggleRow('${cfg?.sheet}',${rowNum},'${active}')">⏺ Toggle</button>`;
  }
  html += `<button class="btn-icon del" onclick="deleteRowConfirm('${cfg?.sheet}',${rowNum})">🗑 Del</button>`;
  html += `</div>`;
  return html;
}

function trunc(str, len) {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function escHtml(str) {
  return (str || '').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Auth helper for cmsGet (private endpoints)
async function cmsGet(action, params = {}) {
  const url = new URL(CMS_CONFIG.API_URL);
  url.searchParams.set('action', action);
  const token = localStorage.getItem('cms_token') || '';
  if (token) url.searchParams.set('token', token);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));

  const cacheKey = url.toString();
  const cached   = sessionCache.get(cacheKey);
  if (cached) return cached;

  const res  = await fetch(url.toString());
  const json = await res.json();

  if (json.success) sessionCache.set(cacheKey, json.data);
  return json.success ? json.data : null;
}
