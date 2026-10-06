import type { MetadataRoute } from 'next';
import { INDEXABLE, SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXABLE) return [];
  // Tanpa lastModified: tanggal palsu per build justru merusak kepercayaan crawler.
  return [{ url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 }];
}
