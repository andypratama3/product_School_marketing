import { ImageResponse } from 'next/og';
import { features } from '@/data/features';
import { SITE_NAME } from '@/lib/seo';

export const alt = `${SITE_NAME} — Sistem Sekolah Terintegrasi`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0a0b0a',
          color: '#f2f4f0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#5ce70b' }}>
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
          Semua kebutuhan sekolah, terhubung dalam satu sistem.
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#97a096' }}>
          {features.length} fitur terverifikasi
        </div>
      </div>
    ),
    { ...size },
  );
}
