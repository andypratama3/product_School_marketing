import { features } from '@/data/features';
import { flows } from '@/data/flows';
import { categories } from '@/data/categories';
import { stats } from '@/data/sales';

/** Live inventory counts — always derived from data/, never hard-coded. */
export const inventory = {
  features: features.length,
  flows: flows.length,
  categories: categories.length,
  apiRoutes: stats.find((s) => s.label === 'Route API')?.value ?? '226',
  permissions: stats.find((s) => s.label === 'Permission RBAC')?.value ?? '380',
} as const;

export type PriceTier = {
  id: string;
  name: string;
  /** Display price, e.g. "Rp 349rb" or "Hubungi" */
  price: string;
  /** Machine amount in IDR for schema.org Offer (null = custom quote) */
  amountIdr: number | null;
  period: string;
  /** Billing period for Offer schema */
  billing: 'MONTH' | 'ONE_TIME' | 'CUSTOM';
  desc: string;
  features: string[];
  top?: boolean;
};

export const LANGGANAN: PriceTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Rp 149rb',
    amountIdr: 149_000,
    period: '/bulan',
    billing: 'MONTH',
    desc: 'Untuk sekolah kecil yang baru digitalisasi.',
    features: [
      '1 sekolah, maks 500 siswa',
      'Akademik + Kehadiran + CMS',
      'Notifikasi WhatsApp',
      'Update berkala',
    ],
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: 'Rp 349rb',
    amountIdr: 349_000,
    period: '/bulan',
    billing: 'MONTH',
    desc: 'Operasional penuh satu sekolah.',
    top: true,
    features: [
      'Siswa tanpa batas',
      `Semua ${inventory.features} fitur terbuka`,
      'Midtrans + QRIS & VA',
      'Instagram + chatbot WA',
      'Prioritas bantuan',
    ],
  },
  {
    id: 'yayasan',
    name: 'Yayasan',
    price: 'Rp 899rb',
    amountIdr: 899_000,
    period: '/bulan',
    billing: 'MONTH',
    desc: 'Multi-sekolah dalam satu kelola.',
    features: [
      'Maks 5 sekolah',
      'API + webhook',
      'Laporan gabungan yayasan',
      'Manajer akun khusus',
    ],
  },
];

export const PROJECT: PriceTier[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: 'Rp 4,9jt',
    amountIdr: 4_900_000,
    period: 'sekali bayar',
    billing: 'ONE_TIME',
    desc: 'Source modul inti, milik penuh.',
    features: [
      'Akademik + Siswa + Kehadiran',
      'Instalasi di server Anda',
      'Panduan deploy',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Rp 9,9jt',
    amountIdr: 9_900_000,
    period: 'sekali bayar',
    billing: 'ONE_TIME',
    desc: 'Seluruh source + pendampingan.',
    top: true,
    features: [
      `Semua ${inventory.features} fitur + ${inventory.flows} alur`,
      'Instalasi + training 2 sesi',
      'Update 1 tahun',
      'Hak modifikasi penuh',
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 'Hubungi',
    amountIdr: null,
    period: 'penawaran',
    billing: 'CUSTOM',
    desc: 'Kustomisasi dan integrasi khusus.',
    features: [
      'Fitur sesuai kebutuhan',
      'Integrasi sistem lama',
      'SLA dukungan',
    ],
  },
];

export const ALL_TIERS = [...LANGGANAN, ...PROJECT];

export function findTier(id: string | null | undefined) {
  if (!id) return undefined;
  return ALL_TIERS.find((t) => t.id === id || t.name.toLowerCase() === id.toLowerCase());
}
