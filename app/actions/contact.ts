'use server';

import { Resend } from 'resend';
import { CONTACT_EMAIL, RESEND_FROM } from '@/lib/site';
import { findTier } from '@/data/pricing';

export type ContactState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'school' | 'message', string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: FormDataEntryValue | null, max = 500) {
  return String(v ?? '')
    .trim()
    .slice(0, max);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot — bots fill this; humans never see it.
  if (str(formData.get('website'), 80)) {
    return { ok: true, message: 'Pesan terkirim. Kami akan membalas segera.' };
  }

  const name = str(formData.get('name'), 120);
  const email = str(formData.get('email'), 160).toLowerCase();
  const school = str(formData.get('school'), 160);
  const message = str(formData.get('message'), 4000);
  const paket = str(formData.get('paket'), 40);
  const tier = findTier(paket);

  const fieldErrors: ContactState['fieldErrors'] = {};
  if (name.length < 2) fieldErrors.name = 'Nama minimal 2 karakter.';
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Email tidak valid.';
  if (message.length < 10) fieldErrors.message = 'Pesan minimal 10 karakter.';

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: 'Periksa isian yang ditandai.',
      fieldErrors,
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY belum diset');
    return {
      ok: false,
      message:
        'Layanan email belum dikonfigurasi. Hubungi langsung via email atau jadwalkan panggilan.',
    };
  }

  const paketLabel = tier
    ? `${tier.name} (${tier.price}${tier.period === '/bulan' ? '/bln' : tier.period !== 'penawaran' ? ` · ${tier.period}` : ''})`
    : paket || 'Belum dipilih';

  const text = [
    `Nama: ${name}`,
    `Email: ${email}`,
    school ? `Sekolah/Yayasan: ${school}` : null,
    `Paket: ${paketLabel}`,
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#101410">
      <h2 style="margin:0 0 12px">Lead ProductSchool</h2>
      <p><strong>Nama:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${school ? `<p><strong>Sekolah/Yayasan:</strong> ${escapeHtml(school)}</p>` : ''}
      <p><strong>Paket:</strong> ${escapeHtml(paketLabel)}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject: `[ProductSchool] ${name}${tier ? ` · ${tier.name}` : ''}`,
      text,
      html,
    });

    if (error) {
      console.error('[contact] Resend error', error);
      return {
        ok: false,
        message: 'Gagal mengirim. Coba lagi atau jadwalkan panggilan langsung.',
      };
    }

    return {
      ok: true,
      message: 'Pesan terkirim. Kami akan membalas ke email Anda segera.',
    };
  } catch (err) {
    console.error('[contact] unexpected', err);
    return {
      ok: false,
      message: 'Terjadi gangguan. Coba lagi sebentar, atau gunakan jadwal panggilan.',
    };
  }
}
