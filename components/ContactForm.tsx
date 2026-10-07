'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitContact, type ContactState } from '@/app/actions/contact';
import { ALL_TIERS, findTier } from '@/data/pricing';
import { Icon } from '@/lib/icons';
import { showToast } from './Toast';

const initial: ContactState = { ok: false, message: '' };

function ContactFormInner() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const searchParams = useSearchParams();
  const paketParam = searchParams.get('paket') ?? '';
  const [paket, setPaket] = useState(() => findTier(paketParam)?.id ?? '');

  useEffect(() => {
    const matched = findTier(paketParam);
    setPaket(matched?.id ?? '');
  }, [paketParam]);

  useEffect(() => {
    if (!state.message) return;
    showToast(state.message, state.ok ? 4000 : 5000);
  }, [state]);

  return (
    <form className="contact-form" action={action} noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hp"
      />

      <div className="field">
        <label htmlFor="cf-name">Nama</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          placeholder="Nama lengkap"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? 'cf-name-err' : undefined}
          disabled={pending}
        />
        {state.fieldErrors?.name && (
          <span id="cf-name-err" className="ferr" role="alert">
            {state.fieldErrors.name}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          placeholder="nama@sekolah.id"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? 'cf-email-err' : undefined}
          disabled={pending}
        />
        {state.fieldErrors?.email && (
          <span id="cf-email-err" className="ferr" role="alert">
            {state.fieldErrors.email}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="cf-school">Sekolah / Yayasan</label>
        <input
          id="cf-school"
          name="school"
          type="text"
          maxLength={160}
          autoComplete="organization"
          placeholder="Opsional"
          disabled={pending}
        />
      </div>

      <div className="field">
        <label htmlFor="cf-paket">Paket minat</label>
        <select
          id="cf-paket"
          name="paket"
          value={paket}
          onChange={(e) => setPaket(e.target.value)}
          disabled={pending}
        >
          <option value="">Belum dipilih</option>
          {ALL_TIERS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.price}
              {t.period === '/bulan' ? '/bln' : t.period !== 'penawaran' ? ` (${t.period})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="cf-message">Pesan</label>
        <textarea
          id="cf-message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          placeholder="Ceritakan kebutuhan sekolah Anda…"
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? 'cf-msg-err' : undefined}
          disabled={pending}
        />
        {state.fieldErrors?.message && (
          <span id="cf-msg-err" className="ferr" role="alert">
            {state.fieldErrors.message}
          </span>
        )}
      </div>

      <button className="btn p" type="submit" disabled={pending} aria-busy={pending}>
        <Icon name="send" />
        {pending ? 'Mengirim…' : 'Kirim pesan'}
      </button>

      {state.message && (
        <p
          className={`contact-status ${state.ok ? 'ok' : 'err'}`}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export default function ContactForm() {
  return (
    <Suspense
      fallback={
        <div className="contact-form" aria-busy="true">
          <p className="mu">Memuat formulir…</p>
        </div>
      }
    >
      <ContactFormInner />
    </Suspense>
  );
}
