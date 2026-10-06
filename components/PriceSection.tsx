'use client';

import { useState } from 'react';
import { Icon } from '@/lib/icons';

type Tier = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  top?: boolean;
};

const LANGGANAN: Tier[] = [
  {
    name: 'Starter',
    price: 'Rp 149rb',
    period: '/bulan',
    desc: 'Untuk sekolah kecil yang baru digitalisasi.',
    features: ['1 sekolah, maks 500 siswa', 'Akademik + Kehadiran + CMS', 'Notifikasi WhatsApp', 'Update berkala'],
  },
  {
    name: 'Profesional',
    price: 'Rp 349rb',
    period: '/bulan',
    desc: 'Operasional penuh satu sekolah.',
    top: true,
    features: [
      'Siswa tanpa batas',
      'Semua 75 fitur terbuka',
      'Midtrans + QRIS & VA',
      'Instagram + chatbot WA',
      'Prioritas bantuan',
    ],
  },
  {
    name: 'Yayasan',
    price: 'Rp 899rb',
    period: '/bulan',
    desc: 'Multi-sekolah dalam satu kelola.',
    features: ['Maks 5 sekolah', 'API + webhook', 'Laporan gabungan yayasan', 'Manajer akun khusus'],
  },
];

const PROJECT: Tier[] = [
  {
    name: 'Lite',
    price: 'Rp 4,9jt',
    period: 'sekali bayar',
    desc: 'Source modul inti, milik penuh.',
    features: ['Akademik + Siswa + Kehadiran', 'Instalasi di server Anda', 'Panduan deploy'],
  },
  {
    name: 'Pro',
    price: 'Rp 9,9jt',
    period: 'sekali bayar',
    desc: 'Seluruh source + pendampingan.',
    top: true,
    features: [
      'Semua 75 fitur + 71 alur',
      'Instalasi + training 2 sesi',
      'Update 1 tahun',
      'Hak modifikasi penuh',
    ],
  },
  {
    name: 'Custom',
    price: 'Hubungi',
    period: 'penawaran',
    desc: 'Kustomisasi dan integrasi khusus.',
    features: ['Fitur sesuai kebutuhan', 'Integrasi sistem lama', 'SLA dukungan'],
  },
];

export default function PriceSection() {
  const [mode, setMode] = useState<'langganan' | 'project'>('langganan');
  const tiers = mode === 'langganan' ? LANGGANAN : PROJECT;

  return (
    <section className="s" id="harga" aria-label="Harga">
      <h2 className="rv">Harga yang masuk akal sekolah.</h2>
      <p className="mu rv" style={{ marginTop: 10 }}>
        Langganan bulanan tanpa ribet, atau bayar sekali dan source jadi milik Anda.
      </p>
      <div className="flowpick rv" role="group" aria-label="Model harga" style={{ marginTop: 18 }}>
        <button
          className={mode === 'langganan' ? 'on' : undefined}
          aria-pressed={mode === 'langganan'}
          onClick={() => setMode('langganan')}
        >
          Langganan
        </button>
        <button
          className={mode === 'project' ? 'on' : undefined}
          aria-pressed={mode === 'project'}
          onClick={() => setMode('project')}
        >
          Sekali bayar
        </button>
      </div>
      <div className="bene rv" style={{ marginTop: 18 }}>
        {tiers.map((tier) => (
          <div className="card" key={tier.name} style={tier.top ? { borderColor: 'var(--ac)' } : undefined}>
            {tier.top && <span className="tag">Paling dipilih</span>}
            <h3>
              {tier.name} — {tier.price}
              <span className="mu" style={{ fontWeight: 500 }}>
                {' '}
                {tier.period}
              </span>
            </h3>
            <p>{tier.desc}</p>
            <ul className="cp">
              {tier.features.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="row" style={{ marginTop: 4 }}>
              <a className={tier.top ? 'btn p' : 'btn'} href="#cta" aria-label={`Pilih paket ${tier.name}`}>
                Pilih {tier.name}
              </a>
            </div>
          </div>
        ))}
      </div>
      <p className="note rv">Harga usulan — hubungi kami untuk penawaran resmi sesuai kebutuhan sekolah Anda.</p>
    </section>
  );
}
