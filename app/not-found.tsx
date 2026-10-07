import Link from 'next/link';
import { inventory } from '@/data/pricing';

export const metadata = { title: 'Halaman tidak ditemukan' };

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>Halaman tidak ditemukan</h1>
      <p className="mu" style={{ maxWidth: '46ch' }}>
        Alamat yang Anda buka tidak ada di situs ProductSchool. Kembali ke halaman utama untuk
        menjelajahi {inventory.features} fitur terverifikasi.
      </p>
      <Link className="btn p" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
