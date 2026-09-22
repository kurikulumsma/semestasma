// =====================================================================
//  config.js — Konstanta & helper murni (tanpa side effect / tanpa akses
//  Supabase). Include file ini PERTAMA, sebelum auth.js dan ui-sidebar.js.
// =====================================================================

const SUPABASE_URL = 'https://gpjdmdrnvpuokptmkvqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwamRtZHJudnB1b2twdG1rdnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTg4NDYsImV4cCI6MjEwNDY3NDg0Nn0.Bs-MZPXfQ0xNfSfbdtq84XbwzdeSOUxlNvUSxAEaii4';

const PRETEST_WAJIB = true;   // true: post-test terkunci sampai pre-test selesai, dan pre-test masuk syarat Pejuang

// Jadwal mengacu ke Panduan SEMESTA 2026, Bab II.D
const TGL = {
  daftarBuka:'2026-09-24', peluncuran:'2026-09-29', daftarTutup:'2026-10-02',
  w1:'2026-10-03', w2:'2026-10-07', w3:'2026-10-10',
  pengumumanChallenger:'2026-10-12', tantangan:'2026-10-13', batasDraft:'2026-10-20',
  kurasi1Mulai:'2026-10-21', kurasi1Selesai:'2026-10-27', pengumumanKurasi1:'2026-10-28',
  klinik:'2026-10-29', batasFinal:'2026-11-10',
  kurasi2Mulai:'2026-11-11', kurasi2Selesai:'2026-11-24',
  pengumumanTerpilih:'2026-11-25', apresiasi:'2026-11-30'
};

// DUMMY: jadwal dan tautan grup WhatsApp Klinik SEMESTA. TODO: ambil dari pengaturan admin.
const KLINIK_SESI = [
  { label:'Sesi Klinik SEMESTA', tanggal:TGL.klinik, jam:'13.00 - 15.00 WIB', wa:'https://chat.whatsapp.com/0000000000' }
];

const WEBINAR_FALLBACK = {
  1: { judul: 'Pembelajaran STEM untuk Semua', tgl: TGL.w1 },
  2: { judul: 'Keselarasan STEM dengan Pembelajaran Mendalam', tgl: TGL.w2 },
  3: { judul: 'Ragam dan Teknik Asesmen dalam Pembelajaran STEM', tgl: TGL.w3 }
};

const LEVEL_ORDER = ['penjelajah', 'challenger', 'kreator', 'inspirator'];

// Kotak tahap di beranda. Tiap tahap (kecuali Inspirator) punya info hasil di bawahnya.
const FASE = [
  { key:'penjelajah', nama:'Penjelajah', icon:'compass',
    desc:'Mendaftar melalui portal SEMESTA, mengikuti webinar, dan mengerjakan pre-test serta post-test.',
    tgl:TGL.pengumumanChallenger, hasil:{
      menunggu:'Penetapan SEMESTA Pejuang diumumkan pada {tgl}.',
      lolos:'Selamat! Kamu ditetapkan sebagai SEMESTA Pejuang. Menu Pejuang sudah tersedia di sidebar untuk mengikuti Tantangan SEMESTA.',
      tidak:'Terima kasih telah mengikuti SEMESTA 2026 dan menyelesaikan rangkaian webinar. Mohon maaf, kamu belum dapat melanjutkan ke tahap Pejuang. Materi webinar tetap bisa kamu akses, dan semoga kita bertemu lagi di kegiatan berikutnya.' } },
  { key:'challenger', nama:'Pejuang', icon:'swords',
    desc:'Menerima Tantangan SEMESTA dan mengirim draft modul ajar untuk Kurasi Tahap 1.',
    tgl:TGL.pengumumanKurasi1, hasil:{
      menunggu:'Hasil Kurasi Tahap 1 diumumkan pada {tgl}.',
      lolos:'Selamat! Karyamu lolos Kurasi Tahap 1 dan kamu ditetapkan sebagai Kreator SEMESTA. Menu Kreator sudah tersedia untuk mengikuti Klinik SEMESTA dan mengunggah karya akhir.',
      tidak:'Terima kasih telah mengirimkan karya dan berpartisipasi dalam Tantangan SEMESTA. Mohon maaf, karyamu belum lolos Kurasi Tahap 1. Semangatmu berkarya sangat kami hargai, dan semoga kamu bisa berpartisipasi lagi di kesempatan berikutnya.' } },
  { key:'kreator', nama:'Kreator', icon:'pen-tool',
    desc:'Mengikuti Klinik SEMESTA dan mengirim karya akhir untuk Kurasi Tahap 2.',
    tgl:TGL.pengumumanTerpilih, hasil:{
      menunggu:'Penetapan karya terpilih diumumkan pada {tgl}.',
      lolos:'Selamat! Karya akhirmu terpilih dan kamu ditetapkan sebagai Inspirator SEMESTA.',
      tidak:'Terima kasih atas karya akhir dan kerja kerasmu selama SEMESTA 2026. Mohon maaf, karyamu belum terpilih pada Kurasi Tahap 2. Semoga rancangan pembelajaran STEM yang telah kamu susun tetap bermanfaat bagi murid dan rekan sejawatmu.' } },
  { key:'inspirator', nama:'Inspirator', icon:'award',
    desc:'Karya akhir terpilih dan berbagi praktik baik di Apresiasi SEMESTA.',
    tgl:TGL.apresiasi, hasil:{
      lolos:'Selamat, kamu Inspirator SEMESTA! Panitia akan menghubungimu terkait berbagi praktik baik pada Apresiasi SEMESTA, {tgl}.' } }
];

// Status peserta (kolom peserta_status.status) -> level dan hasil tiap tahap (menunggu | lolos | tidak)
const STATUS_MAP = {
  penjelajah:       { label:'Penjelajah, menunggu hasil',        level:'penjelajah', h:['menunggu'] },
  penjelajah_tidak: { label:'Penjelajah, tidak lolos Pejuang', level:'penjelajah', h:['tidak'] },
  challenger:       { label:'Pejuang, menunggu Kurasi 1',      level:'challenger', h:['lolos','menunggu'] },
  challenger_tidak: { label:'Pejuang, tidak lolos Kurasi 1',   level:'challenger', h:['lolos','tidak'] },
  kreator:          { label:'Kreator, menunggu Kurasi 2',         level:'kreator',    h:['lolos','lolos','menunggu'] },
  kreator_tidak:    { label:'Kreator, tidak lolos Kurasi 2',      level:'kreator',    h:['lolos','lolos','tidak'] },
  inspirator:       { label:'Inspirator',                         level:'inspirator', h:['lolos','lolos','lolos'] }
};

const JADWAL = [
  { label:'Pendaftaran', start:TGL.daftarBuka, end:TGL.daftarTutup },
  { label:'Peluncuran SEMESTA 2026', start:TGL.peluncuran, end:TGL.peluncuran },
  { label:'Webinar 1: Pembelajaran STEM untuk Semua', start:TGL.w1, end:TGL.w1 },
  { label:'Webinar 2: Keselarasan STEM dengan Pembelajaran Mendalam', start:TGL.w2, end:TGL.w2 },
  { label:'Webinar 3: Ragam dan Teknik Asesmen dalam Pembelajaran STEM', start:TGL.w3, end:TGL.w3 },
  { label:'Pengumuman SEMESTA Pejuang', start:TGL.pengumumanChallenger, end:TGL.pengumumanChallenger },
  { label:'Tantangan SEMESTA dibuka', start:TGL.tantangan, end:TGL.tantangan },
  { label:'Batas pengumpulan karya awal', start:TGL.batasDraft, end:TGL.batasDraft },
  { label:'Kurasi Tahap 1', start:TGL.kurasi1Mulai, end:TGL.kurasi1Selesai },
  { label:'Pengumuman hasil Kurasi Tahap 1', start:TGL.pengumumanKurasi1, end:TGL.pengumumanKurasi1 },
  { label:'Klinik SEMESTA', start:TGL.klinik, end:TGL.klinik },
  { label:'Batas pengumpulan karya akhir', start:TGL.batasFinal, end:TGL.batasFinal },
  { label:'Kurasi Tahap 2', start:TGL.kurasi2Mulai, end:TGL.kurasi2Selesai },
  { label:'Penetapan dan pengumuman karya terpilih', start:TGL.pengumumanTerpilih, end:TGL.pengumumanTerpilih },
  { label:'Apresiasi SEMESTA', start:TGL.apresiasi, end:TGL.apresiasi }
];

const AI_KATEGORI = [
  'Tidak menggunakan AI', 'Brainstorming / eksplorasi ide', 'Pengembangan aktivitas pembelajaran',
  'Pengembangan asesmen', 'Penyuntingan bahasa', 'Pembuatan / pengembangan visual',
  'Analisis / refleksi', 'Lainnya'
];

const DAFTAR_MAPEL = [
  'Antropologi','Bahasa Arab','Bahasa Asing','Bahasa Indonesia','Bahasa Indonesia Tingkat Lanjut',
  'Bahasa Inggris','Bahasa Inggris Tingkat Lanjut','Bahasa Jepang','Bahasa Jerman','Bahasa Korea',
  'Bahasa Mandarin','Bahasa Prancis','Biologi','Bimbingan dan Konseling (BK)','Ekonomi',
  'Energi dan Pertambangan','Fikih','Fisika','Geografi','Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)','Informatika','Kimia','Koding dan Kecerdasan Artifisial',
  'Matematika','Matematika Tingkat Lanjut','Muatan Lokal',
  'Pendidikan Agama Buddha dan Budi Pekerti','Pendidikan Agama Hindu dan Budi Pekerti',
  'Pendidikan Agama Islam dan Budi Pekerti','Pendidikan Agama Katolik dan Budi Pekerti',
  'Pendidikan Agama Khonghucu dan Budi Pekerti','Pendidikan Agama Kristen dan Budi Pekerti',
  'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)','Pendidikan Pancasila','Prakarya',
  'Prakarya Budi Daya','Prakarya Kerajinan','Prakarya Pengolahan','Prakarya Rekayasa','Sejarah',
  'Sejarah Kebudayaan Islam','Sejarah Tingkat Lanjut','Seni Musik','Seni Rupa','Seni Tari',
  'Seni Teater','Sosiologi'
];

const MAKS_KARYA = 2; // maksimal karya yang boleh dikirim saat Tantangan Pejuang dibuka
const ICON_WHATSAPP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2c-5.46 0-9.89 4.43-9.89 9.89 0 1.74.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.89-4.43 9.89-9.89 0-2.64-1.03-5.12-2.9-6.99A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.23 0 4.32.87 5.89 2.44a8.2 8.2 0 0 1 2.42 5.83c0 4.55-3.71 8.26-8.27 8.26a8.27 8.27 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.4c0-4.55 3.71-8.27 8.21-8.27zm-4.52 4.64c-.16 0-.42.06-.64.31-.22.25-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.7 2.72 4.19 3.71 2.07.82 2.49.66 2.94.62.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.02-.38.11-.5.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47z"/></svg>';
const MAX_BERKAS = 10 * 1024 * 1024;
const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

// ---------- Helper format & escape (murni, gak nyentuh DOM/network) ----------
function fmtTgl(iso) { const p = iso.split('-').map(Number); return p[2] + ' ' + BULAN[p[1] - 1] + ' ' + p[0]; }
function fmtTglS(iso) { const p = iso.split('-').map(Number); return p[2] + ' ' + BULAN[p[1] - 1]; }
function fmtRange(a, b) { return a === b ? fmtTglS(a) : fmtTglS(a) + ' - ' + fmtTglS(b); }
function escapeHtml(str) { return String(str || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function escapeAttr(str) { return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function extractYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function todayStr() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); }
function jenisLabel(j) { return j === 'sudah' ? 'Sudah/sedang dilaksanakan' : 'Belum/akan dilaksanakan'; }
function cekBerkas(file, exts, label) {
  if (!file) return 'Berkas ' + label + ' belum dipilih.';
  if (!exts.some(x => file.name.toLowerCase().endsWith(x))) return 'Format berkas ' + label + ' harus ' + exts.join(' / ') + '.';
  if (file.size > MAX_BERKAS) return 'Ukuran berkas ' + label + ' melebihi 10 MB.';
  return '';
}
