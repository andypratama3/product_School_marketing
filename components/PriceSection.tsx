'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/lib/icons';
import { inventory, LANGGANAN, PROJECT, type PriceTier } from '@/data/pricing';

export default function PriceSection() {
  const [mode, setMode] = useState<'langganan' | 'project'>('langganan');
  const tiers = mode === 'langganan' ? LANGGANAN : PROJECT;

  return (
    <section className="s" id="harga" aria-label="Harga">
      <h2 className="rv">Harga yang masuk akal sekolah.</h2>
      <p className="mu rv" style={{ marginTop: 10 }}>
        Langganan bulanan tanpa ribet, atau bayar sekali dan source jadi milik Anda.
        Harga mengacu pada inventori terkini: {inventory.features} fitur · {inventory.flows}{' '}
        alur · {inventory.apiRoutes} API.
      </p>

      {/* Hosting notice */}
      <div
        className="rv"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          background: 'color-mix(in srgb, var(--acb) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--acb) 30%, transparent)',
          borderRadius: 12,
          padding: '12px 16px',
          marginTop: 20,
          maxWidth: 640,
          fontSize: '0.85rem',
        }}
      >
        <Icon name="server-cog" />
        <div>
          <b>Hosting / VPS tidak termasuk.</b>{' '}
          Semua paket diinstalasi di server milik sekolah. Biaya server dibayar langsung ke
          penyedia hosting pilihan Anda (est.{' '}
          <b>Rp 150rb–1jt/bulan</b> tergantung spesifikasi). Kami bantu rekomendasi
          dan setup.
        </div>
      </div>

      <div className="flowpick rv" role="group" aria-label="Model harga" style={{ marginTop: 24 }}>
        <button
          type="button"
          className={mode === 'langganan' ? 'on' : undefined}
          aria-pressed={mode === 'langganan'}
          onClick={() => setMode('langganan')}
        >
          Langganan
        </button>
        <button
          type="button"
          className={mode === 'project' ? 'on' : undefined}
          aria-pressed={mode === 'project'}
          onClick={() => setMode('project')}
        >
          Sekali bayar
        </button>
      </div>
      <div className="bene rv" style={{ marginTop: 18 }}>
        {tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
      <p className="note rv">
        Harga usulan — hubungi kami untuk penawaran resmi sesuai kebutuhan sekolah Anda.
        Hosting/VPS dipilih dan dibayar sendiri ke penyedia server sesuai kebutuhan.
      </p>
    </section>
  );
}

function TierCard({ tier }: { tier: PriceTier }) {
  return (
    <div className="card price-card" style={tier.top ? { borderColor: 'var(--ac)' } : undefined}>
      {tier.top && <span className="tag">Paling dipilih</span>}
      <h3>{tier.name}</h3>
      <p className="price-line">
        <span className="price-val">{tier.price}</span>
        <span className="mu" style={{ fontWeight: 500 }}>
          {' '}
          {tier.period}
        </span>
      </p>
      <p>{tier.desc}</p>
      <ul className="cp">
        {tier.features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="check" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <div className="row" style={{ marginTop: 'auto', paddingTop: 8 }}>
        <Link
          className={tier.top ? 'btn p' : 'btn'}
          href={`/?paket=${encodeURIComponent(tier.id)}#cta`}
          aria-label={`Pilih paket ${tier.name}`}
        >
          Pilih {tier.name}
        </Link>
      </div>
    </div>
  );
}
