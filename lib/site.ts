/** Public + server contact / booking constants. */

export const CONTACT_EMAIL =
  process.env.CONTACT_TO_EMAIL?.trim() || 'andypratama1211@gmail.com';

export const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL?.trim() ||
  'ProductSchool <onboarding@resend.dev>';

/** Cal.com username — profile lists 15m and 30m meetings. */
export const CAL_USERNAME =
  process.env.NEXT_PUBLIC_CAL_USERNAME?.trim() || 'andypratama';

export const CAL_PROFILE_URL = `https://cal.com/${CAL_USERNAME}`;

/** Event slugs verified live: /15min and /30min return 200 on cal.com. */
export const CAL_EVENTS = [
  {
    id: '15min',
    label: '15 menit',
    desc: 'Diskusi singkat kebutuhan sekolah',
    slug: '15min',
    href: `${CAL_PROFILE_URL}/15min`,
  },
  {
    id: '30min',
    label: '30 menit',
    desc: 'Demo ProductSchool + rencana implementasi',
    slug: '30min',
    href: `${CAL_PROFILE_URL}/30min`,
  },
] as const;

export const SOCIAL = {
  github: 'https://github.com/andypratama3',
  linkedin: 'https://www.linkedin.com/in/andypratama3',
  email: `mailto:${CONTACT_EMAIL}`,
  cal: CAL_PROFILE_URL,
} as const;
