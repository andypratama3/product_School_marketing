import type { Audience, Stat, StackItem } from '@/lib/types';
import { features } from '@/data/features';
import { categories } from '@/data/categories';
import { flows } from '@/data/flows';

export const stats: Stat[] = [
  { value: String(features.length), label: 'Fitur terverifikasi' },
  { value: String(categories.length), label: 'Kategori inti' },
  { value: String(flows.length), label: 'Alur interaktif' },
  { value: '226', label: 'Route API' },
  { value: '380', label: 'Permission RBAC' },
];

export const audiences: Audience[] = [
  {
    icon: 'code-2',
    title: 'Source code milik Anda',
    body: 'Laravel + Next.js, tanpa vendor lock-in. Kode dibuka, dimodifikasi, dan di-deploy sesuai kebutuhan.',
  },
  {
    icon: 'shield',
    title: 'Keamanan berlapis',
    body: 'Sanctum auth, 34 policy, 380 permission, data scoping per kelas, dan audit trail.',
  },
  {
    icon: 'network',
    title: 'API-first',
    body: '226 route REST API — siap untuk aplikasi mobile, portal orang tua, dan integrasi pihak ketiga.',
  },
];

export const stack: StackItem[] = [
  'Laravel 11 (PHP 8.3)',
  'Next.js 15 + React 19',
  'MySQL / PostgreSQL',
  'Midtrans Snap & Core API',
  'WhatsApp Cloud API',
  'Google Maps & KML geofence',
  'Spatie Permission (RBAC)',
  'Laravel Sanctum',
  'Queue workers (jobs terjadwal)',
  'Sentry monitoring',
];
