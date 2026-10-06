import type { Category } from '@/lib/types';

/**
 * Category order also drives the ecosystem map layout, so the labels and the
 * node positions can never disagree. Positions sit on one uniform circle
 * (R = 40% of the square stage) so every neighbour gap is identical:
 * no clustering, no dead zones.
 */
const SEED: Array<Omit<Category, 'x' | 'y'>> = [
  { id: 'Akademik', label: 'Akademik', icon: 'book-open', description: 'Kurikulum Merdeka, penilaian, rapor QR, template dokumen.' },
  { id: 'Siswa', label: 'Siswa', icon: 'users', description: 'Data siswa, performa, dan peringatan dini.' },
  { id: 'PPDB', label: 'PPDB', icon: 'user-plus', description: 'Pendaftaran publik sampai enroll siswa.' },
  { id: 'Kehadiran', label: 'Kehadiran', icon: 'calendar-check', description: 'Absensi GPS, geofence KML, QR, notifikasi.' },
  { id: 'Guru & HR', label: 'Guru & HR', icon: 'briefcase', description: 'Guru, pegawai, cuti, dan SDM.' },
  { id: 'Payroll', label: 'Payroll', icon: 'banknote', description: 'Konfigurasi gaji, proses run, slip PDF/ZIP.' },
  { id: 'Keuangan', label: 'Keuangan', icon: 'wallet', description: 'SPP, Midtrans Snap, VA/QR/e-Wallet, reminder WA.' },
  { id: 'CMS', label: 'CMS', icon: 'file-text', description: 'Konten, halaman, media, publikasi website.' },
  { id: 'Komunikasi', label: 'Komunikasi', icon: 'message-circle', description: 'WhatsApp Cloud, bot, komunikasi orang tua.' },
  { id: 'Instagram', label: 'Instagram', icon: 'instagram', description: 'OAuth Meta, feed, carousel, Facebook page.' },
  { id: 'Analitik', label: 'Analitik', icon: 'trending-up', description: 'Dashboard real-time, laporan akademik dan keuangan.' },
  { id: 'AI', label: 'AI', icon: 'sparkles', description: 'Asisten, template dokumen, balasan cerdas.' },
  { id: 'Administrasi', label: 'Administrasi', icon: 'shield', description: 'User, role, permission, Sanctum, RBAC.' },
  { id: 'Sistem', label: 'Sistem', icon: 'server-cog', description: 'REST API, job queue, Reverb, Sentry.' },
];

export const categories: Category[] = SEED.map((category, index, all) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / all.length;
  const radius = 40;
  return {
    ...category,
    x: Math.round((50 + radius * Math.cos(angle)) * 100) / 100,
    y: Math.round((50 + radius * Math.sin(angle)) * 100) / 100,
  };
});

export const categoryIds = categories.map((category) => category.id);

export const featuresInCategory = (categoryId: string, features: Array<{ category: string }>) =>
  features.filter((feature) => feature.category === categoryId);