import { inventory, ALL_TIERS } from '@/data/pricing';
import { SOCIAL } from '@/lib/site';

const PRODUCTION_URL = 'https://product-school.vercel.app';
const RAW = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_URL;

export const SITE_URL = RAW.replace(/\/+$/, '');
export const SITE_NAME = 'ProductSchool';
export const SITE_TITLE = 'ProductSchool — Sistem Sekolah Terintegrasi';
export const SITE_DESCRIPTION = `ProductSchool menyatukan akademik, keuangan, kehadiran, komunikasi, dan CMS sekolah dalam satu sistem. Jelajahi ${inventory.features} fitur dan ${inventory.flows} alur interaktif.`;

/**
 * Indexable hanya bila build produksi dan NOINDEX tidak diaktifkan.
 * Domain default sudah diketahui; NEXT_PUBLIC_SITE_URL menimpa bila diisi.
 */
export const INDEXABLE =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_NOINDEX !== 'true';

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
      logo: `${SITE_URL}/icon.png`,
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
