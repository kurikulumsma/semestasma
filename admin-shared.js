/* ============================================================
   admin-shared.js
   Dipakai bareng oleh: admin.html, admin-webinar.html,
   admin-kurasi.html, admin-kelola-admin.html

   Isinya: supabase client, auth guard, fetch data peserta/admin/
   kurator, util umum (escapeHtml, showPageError, sidebar mobile
   toggle), dan modal konfirmasi password (hapus peserta/admin,
   demote/promote kurator).

   Style & markup TETAP di masing-masing HTML (sengaja gak
   dipindah ke sini) — cuma logic yang beneran sama persis di
   semua halaman yang ditaruh di sini.
   ============================================================ */

// ---------- SUPABASE CLIENT ----------
const SUPABASE_URL = 'https://gpjdmdrnvpuokptmkvqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwamRtZHJudnB1b2twdG1rdnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTg4NDYsImV4cCI6MjEwNDY3NDg0Nn0.Bs-MZPXfQ0xNfSfbdtq84XbwzdeSOUxlNvUSxAEaii4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Klien terpisah, khusus verifikasi password (signUp admin baru / konfirmasi
// hapus) — storageKey & persistSession beda supaya sesi admin yang lagi
// login TIDAK ikut tertimpa saat dipakai di tab yang sama.
const supabaseCreateClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storageKey: 'sb-admin-create-temp', persistSession: false, autoRefreshToken: false }
});

// ---------- ERROR BOX ----------
function showPageError(msg) {
  const pageError = document.getElementById('pageError');
  const pageErrorMsg = document.getElementById('pageErrorMsg');
  if (!pageError || !pageErrorMsg) return;
  pageErrorMsg.textContent = msg;
  pageError.classList.add('show');
}

// ---------- UTIL ----------
function escapeHtml(str) {
  return String(str || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ---------- SIDEBAR MOBILE (off-canvas) ----------
function initSidebarToggle() {
  const btnMenuToggle = document.getElementById('btnMenuToggle');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  if (!btnMenuToggle || !sidebarBackdrop) return;
  const openSidebar = () => document.body.classList.add('sidebar-open');
  const closeSidebar = () => document.body.classList.remove('sidebar-open');
  btnMenuToggle.addEventListener('click', openSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);
}

// ---------- NAV AKTIF (berdasarkan nama file saat ini) ----------
// Tiap link nav di sidebar dikasih atribut data-page="peserta|webinar|kurasi|kelola-admin".
// Fungsi ini otomatis nandain yang aktif, jadi gak perlu diubah manual di tiap file.
const NAV_PAGE_BY_FILE = {
  'admin.html': 'peserta',
  'admin-webinar.html': 'webinar',
  'admin-kurasi.html': 'kurasi',
  'admin-kelola-admin.html': 'kelola-admin'
};

function highlightActiveNav() {
  const file = (window.location.pathname.split('/').pop() || 'admin.html');
  const currentPage = NAV_PAGE_BY_FILE[file] || 'peserta';
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === currentPage);
  });
}

// ---------- LOGOUT ----------
function initLogout() {
  const btnLogout = document.getElementById('btnLogout');
  if (!btnLogout) return;
  btnLogout.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });
}

// ---------- AUTH GUARD ----------
// Panggil di awal tiap halaman admin-*.html. Return session kalau lolos
// (role === admin), atau null kalau udah di-redirect (gak login / bukan admin).
async function requireAdmin() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }

  const sidebarUserEmailEl = document.getElementById('sidebarUserEmail');
  if (sidebarUserEmailEl) {
    sidebarUserEmailEl.textContent = session.user.email;
    sidebarUserEmailEl.classList.remove('skel');
  }

  const { data: roleData, error: roleError } = await supabaseClient
    .from('user_roles').select('role').eq('id', session.user.id).single();

  if (roleError) { showPageError('Gagal membaca role akun: ' + roleError.message); return null; }
  if (roleData.role === 'kurator') { window.location.href = 'kurasi.html'; return null; }
  if (roleData.role !== 'admin') { window.location.href = 'beranda.html'; return null; }

  initSidebarToggle();
  highlightActiveNav();
  initLogout();

  return session;
}

// ---------- FETCH DATA PESERTA / ADMIN / KURATOR ----------
// Dipakai di semua halaman yang butuh salah satu dari list ini:
// - admin.html: pesertaList, adminList (buat stat ringkasan)
// - admin-webinar.html: pesertaList (mapping nama peserta di tabel skor pre/post)
// - admin-kurasi.html: pesertaList, kuratorList, profileById
// - admin-kelola-admin.html: adminList, kuratorList
// Supabase API punya default Max Rows 1000 per request, jadi query/RPC yang
// balikin >1000 row kepotong diem-diem tanpa error. Di-loop pakai .range()
// sampai halaman terakhir < pageSize biar semua row kebawa — penting karena
// profilesRes & rolesRes di-merge by id di bawah, dan dua potongan 1000 row
// yang beda bisa bikin sebagian row nggak ketemu pasangannya.
async function fetchAllPages(queryBuilderFn) {
  const pageSize = 1000;
  let from = 0;
  let all = [];
  while (true) {
    const { data, error } = await queryBuilderFn().range(from, from + pageSize - 1);
    if (error) throw error;
    all = all.concat(data || []);
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function loadPesertaData() {
  const [profilesRes, rolesRes] = await Promise.allSettled([
    fetchAllPages(() => supabaseClient.rpc('admin_list_profiles')),
    fetchAllPages(() => supabaseClient.from('user_roles').select('id, role'))
  ]);

  if (profilesRes.status === 'rejected') { showPageError('Gagal memuat data profil: ' + profilesRes.reason.message); throw profilesRes.reason; }
  if (rolesRes.status === 'rejected') { showPageError('Gagal memuat data role: ' + rolesRes.reason.message); throw rolesRes.reason; }

  const allProfiles = profilesRes.value;
  const allRoles = rolesRes.value;

  const profileById = {};
  allProfiles.forEach(p => { profileById[p.id] = p; });

  const merged = allRoles.map(r => ({
    id: r.id,
    role: r.role,
    profile: profileById[r.id] || null
  }));

  return {
    allProfiles,
    allRoles,
    profileById,
    pesertaList: merged.filter(m => m.role === 'peserta' && m.profile),
    adminList: merged.filter(m => m.role === 'admin'),
    kuratorList: merged.filter(m => m.role === 'kurator' && m.profile)
  };
}

// ---------- MODAL KONFIRMASI PASSWORD (hapus / demote / promote) ----------
// Markup modalnya (confirmDeleteModalBackdrop dkk) tetap di-duplikasi di tiap
// HTML yang makai; logic-nya sama persis jadi ditaruh di sini.
// opts: { title, text, confirmLabel?, confirmIcon?, danger?, action: async () => error|null, onSuccess?: async () => void }
let pendingDelete = null;

function openConfirmDelete(opts) {
  pendingDelete = opts;
  document.getElementById('confirmDeleteTitle').textContent = opts.title;
  document.getElementById('confirmDeleteText').textContent = opts.text;
  document.getElementById('confirmDeletePassword').value = '';
  const msg = document.getElementById('confirmDeleteMsg');
  msg.textContent = ''; msg.className = 'form-msg';

  const btn = document.getElementById('btnConfirmDelete');
  const label = opts.confirmLabel || 'Hapus';
  const icon = opts.confirmIcon || 'trash-2';
  btn.className = 'btn btn-sm ' + (opts.danger === false ? 'btn-primary' : 'btn-danger');
  btn.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
  lucide.createIcons();

  document.getElementById('confirmDeleteModalBackdrop').classList.add('show');
  setTimeout(() => document.getElementById('confirmDeletePassword').focus(), 50);
}

function closeConfirmDelete() {
  pendingDelete = null;
  document.getElementById('confirmDeletePassword').value = '';
  document.getElementById('confirmDeleteModalBackdrop').classList.remove('show');
}

// Dipanggil sekali per halaman yang punya modal ini di markup-nya.
function initConfirmDeleteModal() {
  const backdrop = document.getElementById('confirmDeleteModalBackdrop');
  if (!backdrop) return; // halaman ini gak punya modal ini di markup, skip

  document.getElementById('btnCloseConfirmDelete').addEventListener('click', closeConfirmDelete);
  document.getElementById('btnCancelConfirmDelete').addEventListener('click', closeConfirmDelete);
  backdrop.addEventListener('click', (e) => {
    if (e.target.id === 'confirmDeleteModalBackdrop') closeConfirmDelete();
  });
  document.getElementById('confirmDeletePassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btnConfirmDelete').click();
  });

  document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
    const job = pendingDelete;
    if (!job) return;
    const password = document.getElementById('confirmDeletePassword').value;
    const msg = document.getElementById('confirmDeleteMsg');
    msg.textContent = ''; msg.className = 'form-msg';
    if (!password) { msg.textContent = 'Password wajib diisi.'; msg.classList.add('error'); return; }

    const btn = document.getElementById('btnConfirmDelete');
    btn.disabled = true;

    // Verifikasi password lewat klien terpisah, biar sesi admin gak tertimpa.
    const { data: { session } } = await supabaseClient.auth.getSession();
    const { error: authError } = await supabaseCreateClient.auth.signInWithPassword({ email: session.user.email, password });
    if (authError) {
      msg.textContent = 'Password salah.';
      msg.classList.add('error');
      btn.disabled = false;
      return;
    }

    const error = await job.action();
    btn.disabled = false;
    if (error) {
      msg.textContent = 'Gagal: ' + error.message;
      msg.classList.add('error');
      return;
    }

    closeConfirmDelete();
    if (job.onSuccess) await job.onSuccess();
  });
}
