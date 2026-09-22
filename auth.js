// =====================================================================
//  auth.js — Supabase client, cek sesi & role, load biodata + status
//  peserta. Include SETELAH config.js, SEBELUM ui-sidebar.js.
//
//  Kontrak HTML yang dibutuhkan di tiap halaman:
//    <p class="error-box" id="pageError"><i data-lucide="alert-circle"></i> <span id="pageErrorMsg"></span></p>
//  (taruh di dalam .content-inner, paling atas)
// =====================================================================

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserId = null;
let profileCache = null;
let statusCache = { status: 'penjelajah' };

function showPageError(msg) {
  const box = document.getElementById('pageError');
  const msgEl = document.getElementById('pageErrorMsg');
  if (!box || !msgEl) { console.error(msg); return; }
  msgEl.textContent = msg;
  box.classList.add('show');
}

// Panggil sekali di awal tiap halaman peserta (beranda/webinar/pejuang/kreator/sertifikat/biodata).
// - Redirect ke login.html kalau belum ada sesi.
// - Redirect ke admin.html kalau role-nya admin.
// - Balikin null kalau ada redirect (halaman gak usah lanjut render apa-apa).
// - Balikin { error } kalau gagal fetch data (biar halaman yang manggil bisa showPageError sendiri).
// - Balikin { session, profile, status } kalau semua sukses.
async function bootstrapPeserta() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }

  const userId = session.user.id;
  currentUserId = userId;

  const { data: roleData, error: roleError } = await supabaseClient
    .from('user_roles').select('role').eq('id', userId).single();
  if (roleError) return { error: 'Gagal membaca role akun: ' + roleError.message };
  if (roleData.role === 'admin') { window.location.href = 'admin.html'; return null; }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles').select('*').eq('id', userId).single();
  if (profileError) return { error: 'Gagal memuat biodata: ' + profileError.message };
  profileCache = profile;

  const { data: statusRow, error: statusError } = await supabaseClient
    .from('peserta_status').select('status').eq('peserta_id', userId).single();
  // Baris peserta_status seharusnya otomatis dibuat trigger saat profil dibuat.
  // Kalau tetap gak ketemu (akun lama sebelum trigger dipasang), anggap masih Penjelajah.
  statusCache = statusError ? { status: 'penjelajah' } : statusRow;

  return { session, profile, status: statusCache };
}

function getLevel() { return (STATUS_MAP[statusCache.status] || STATUS_MAP.penjelajah).level; }
// n = 1 (jadi Pejuang), 2 (jadi Kreator), 3 (jadi Inspirator). Hasil: 'menunggu' | 'lolos' | 'tidak' | null
function getHasil(n) { return (STATUS_MAP[statusCache.status] || STATUS_MAP.penjelajah).h[n - 1] || null; }
function levelIdx() { return LEVEL_ORDER.indexOf(getLevel()); }

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}
