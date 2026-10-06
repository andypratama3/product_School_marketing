const RAW = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (RAW || 'http://localhost:3100').replace(/\/+$/, '');
export const SITE_NAME = 'ProductSchool';
export const SITE_TITLE = 'ProductSchool — Sistem Sekolah Terintegrasi';
export const SITE_DESCRIPTION =
  'ProductSchool menyatukan akademik, keuangan, kehadiran, komunikasi, dan CMS sekolah dalam satu sistem. Jelajahi 75 fitur terverifikasi.';

/**
 * Indexable hanya bila: build produksi, domain diset, dan NOINDEX tidak diaktifkan.
 * Domain belum diset => noindex + peringatan (gagal aman, bukan canonical salah).
 */
export const INDEXABLE =
  process.env.NODE_ENV === 'production' &&
  Boolean(RAW) &&
  process.env.NEXT_PUBLIC_NOINDEX !== 'true';

if (process.env.NODE_ENV === 'production' && !RAW) {
  console.warn(
    '[seo] NEXT_PUBLIC_SITE_URL belum diset: situs dibuat noindex. Set domain produksi sebelum deploy.',
  );
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      // sameAs: [...]  // HANYA bila pemilik memberi akun resmi
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#org` },
      // JANGAN tambah SearchAction: pencarian situs ini dialog, bukan URL.
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'id-ID',
      // offers: {...}  // HANYA bila pemilik memberi harga resmi. Tanpa rating/review.
    },
  ],
};
