import { inventory, ALL_TIERS } from '@/data/pricing';
import { SOCIAL } from '@/lib/site';

const RAW = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (RAW || 'http://localhost:3100').replace(/\/+$/, '');
export const SITE_NAME = 'ProductSchool';
export const SITE_TITLE = 'ProductSchool — Sistem Sekolah Terintegrasi';
export const SITE_DESCRIPTION = `ProductSchool menyatukan akademik, keuangan, kehadiran, komunikasi, dan CMS sekolah dalam satu sistem. Jelajahi ${inventory.features} fitur dan ${inventory.flows} alur terverifikasi.`;

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

const pricedOffers = ALL_TIERS.filter((t) => t.amountIdr != null).map((t) => ({
  '@type': 'Offer' as const,
  name: `ProductSchool ${t.name}`,
  price: String(t.amountIdr),
  priceCurrency: 'IDR',
  availability: 'https://schema.org/InStock',
  url: `${SITE_URL}/?paket=${t.id}#harga`,
  ...(t.billing === 'MONTH'
    ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: t.amountIdr, priceCurrency: 'IDR', billingDuration: 'P1M' } }
    : {}),
}));

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      email: SOCIAL.email.replace(/^mailto:/, ''),
      sameAs: [SOCIAL.github, SOCIAL.linkedin, SOCIAL.cal],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#org` },
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'id-ID',
      offers: pricedOffers,
    },
    {
      '@type': 'Person',
      name: 'Andy Pratama',
      url: SOCIAL.cal,
      sameAs: [SOCIAL.github, SOCIAL.linkedin, SOCIAL.cal],
      jobTitle: 'Fullstack Software Engineer',
      email: SOCIAL.email.replace(/^mailto:/, ''),
    },
  ],
};
