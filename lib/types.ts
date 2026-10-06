import type { IconName } from '@/lib/icons';

export type { IconName };

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  /** Position on the ecosystem map, in percent of the map box. */
  x: number;
  y: number;
};

export type FlowKey =
  | 'cms'
  | 'bayar'
  | 'ig'
  | 'ppdb'
  | 'payroll'
  | 'hadir'
  | 'rapor'
  | 'ttd'
  | 'wa'
  | 'kurikulum'
  | 'tahun-ajaran'
  | 'akd-kelola'
  | 'jadwal-ajar'
  | 'nilai-olah'
  | 'dokumen-buat'
  | 'kanvas-dok'
  | 'inklusi'
  | 'siswa-baru'
  | 'siswa-kelas'
  | 'siswa-performa'
  | 'ews-resiko'
  | 'ekskul-ikut'
  | 'hadir-kelola'
  | 'geofence-cek'
  | 'hadir-ingat'
  | 'guru-data'
  | 'pegawai-data'
  | 'cuti-aju'
  | 'sdm-peta'
  | 'gaji-aturan'
  | 'payroll-periode'
  | 'payroll-riwayat'
  | 'payroll-lapor'
  | 'spp-tagih'
  | 'midtrans-bayar'
  | 'vaqr-metode'
  | 'bayar-notif'
  | 'ingat-bayar'
  | 'leads-kelola'
  | 'halaman-kelola'
  | 'media-kelola'
  | 'publikasi-jadwal'
  | 'wa-sambung'
  | 'wa-notif'
  | 'wa-balas'
  | 'ig-terbit'
  | 'ig-carousel'
  | 'ig-posting'
  | 'ig-info'
  | 'fb-terbit'
  | 'lap-akademik'
  | 'lap-keuangan'
  | 'analitik-siswa'
  | 'analitik-hadir'
  | 'reverb-live'
  | 'ai-asisten'
  | 'ai-dokumen'
  | 'ai-saran'
  | 'user-kelola'
  | 'role-kelola'
  | 'perm-kelola'
  | 'rbac-scope'
  | 'sanctum-auth'
  | 'tasks-waktu'
  | 'setting-sistem'
  | 'api-akses'
  | 'jobs-antre'
  | 'webhook-hub'
  | 'bulk-impor'
  | 'audit-jejak'
  | 'cctv-pantau';

export type Feature = {
  id: string;
  name: string;
  category: string;
  icon: IconName;
  description: string;
  /** Capabilities verified from the Laravel repository. */
  capabilities: string[];
  /** Primary operator persona, from the audit. */
  users: string;
  /** Key of the interactive flow simulator, when one exists. */
  flow?: FlowKey;
};

export type AdminField = [label: string, value: string, active?: boolean];

export type PublicView =
  | { kind: 'empty'; message: string }
  | { kind: 'page'; label: string; headline: string; body: string };

export type FlowStep = {
  title: string;
  action: string;
  system: string;
  result: string;
  fields: AdminField[];
  badge: [label: string, tone: '' | 'g' | 'y'];
  button: string;
  publicView: PublicView;
};

export type Flow = {
  key: FlowKey;
  title: string;
  leftLabel: string;
  rightLabel: string;
  /** Service, route, and storage evidence backing the flow. */
  evidence: string;
  /** [what changed, where it is visible] */
  results: [string, string];
  steps: FlowStep[];
};

export type Stat = {
  value: string;
  label: string;
};

export type Audience = {
  icon: IconName;
  title: string;
  body: string;
};

export type StackItem = string;