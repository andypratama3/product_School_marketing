'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Icon } from '@/lib/icons';
import { features } from '@/data/features';
import { lockScroll, openFlow, trapTab, unlockScroll } from './SearchDialog';

export default function FeatureDialog() {
  const [id, setId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => setId((e as CustomEvent<string>).detail);
    window.addEventListener('open-feature', onOpen);
    return () => window.removeEventListener('open-feature', onOpen);
  }, []);

  // Escape to close, lock background scroll, focus close button on open
  // and restore focus to the opener on close.
  useEffect(() => {
    if (!id) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setId(null);
      trapTab(e, panelRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [id]);

  const feature = useMemo(() => (id ? features.find((f) => f.id === id) : undefined), [id]);
  const related = useMemo(
    () =>
      feature
        ? features.filter((f) => f.category === feature.category && f.id !== feature.id)
        : [],
    [feature],
  );

  if (!feature) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 45,
        background: 'rgba(0,0,0,.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setId(null);
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Detail fitur"
        className="side"
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 'min(860px, 100vw)',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--bd)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000
        }}
      >
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sf)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--mu)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              <Icon name={feature.icon} />
              {feature.category}
            </div>
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{feature.name}</h2>
          </div>
          <button
            ref={closeRef}
            className="ib x"
            aria-label="Tutup"
            onClick={() => setId(null)}
            style={{ background: 'var(--bd)', borderRadius: '50%' }}
          >
            <Icon name="x" />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: 'row' }}>
          {/* Left: Interactive Visual Preview */}
          <div style={{ flex: 1, background: 'var(--sf2)', borderRight: '1px solid var(--bd)', padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 8px' }}>Pratinjau Antarmuka</h3>
              <p className="mu" style={{ fontSize: '0.85rem', margin: 0 }}>Ilustrasi fungsi utama fitur ini di dalam sistem.</p>
            </div>

            {/* Mock Dashboard Window */}
            <div className="pane" style={{ minHeight: 320, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', transform: 'translateZ(0)' }}>
              <div className="pane-header">
                <i className="dot red" />
                <i className="dot yellow" />
                <i className="dot green" />
                <span className="pane-title" style={{ fontFamily: 'monospace', color: 'var(--mu)' }}>
                  /dashboard/{feature.category.toLowerCase().replace(/\s/g, '-')}/{feature.id}
                </span>
              </div>
              
              {/* Contextual Visual Preview */}
              <div className="pb" style={{ background: 'var(--sf)' }}>
                <ContextualMock feature={feature} />
              </div>
            </div>
          </div>

          {/* Right: Details & Actions */}
          <div style={{ width: 380, padding: 32, overflowY: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mu)' }}>Informasi & Audit</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 24px' }}>{feature.description}</p>

            <h3 style={{ fontSize: '0.95rem', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mu)' }}>Pengguna Utama</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'color-mix(in srgb, var(--acb) 10%, transparent)', borderRadius: 12, color: 'var(--acx)', marginBottom: 24 }}>
              <div style={{ background: 'var(--acb)', color: 'var(--acx)', padding: 8, borderRadius: '50%', display: 'flex' }}><Icon name="user-round" /></div>
              <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{feature.users}</span>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mu)' }}>Detail Kemampuan</h3>
            {feature.capabilities.length ? (
              <ul className="cp" style={{ fontSize: '0.95rem', margin: 0 }}>
                {feature.capabilities.map((cap) => (
                  <li key={cap} style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--ac)' }}><Icon name="check" /></span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="need">Menunggu data terverifikasi</span>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 36 }}>
              {feature.flow ? (
                <div style={{ background: 'color-mix(in srgb, var(--acb) 5%, transparent)', border: '1px solid var(--bd)', padding: 20, borderRadius: 16 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="play" /> Alur Simulasi Tersedia
                  </h4>
                  <p className="mu" style={{ fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Lihat persis bagaimana fitur ini bekerja langkah-demi-langkah layaknya menggunakan aplikasi sungguhan.
                  </p>
                  <button
                    type="button"
                    className="btn p pulse"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}
                    onClick={() => {
                      const key = feature.flow;
                      setId(null);
                      if (key) openFlow(key);
                    }}
                  >
                    Mulai Simulasi Penuh
                  </button>
                </div>
              ) : (
                <div style={{ padding: 16, background: 'var(--sf)', borderRadius: 12, border: '1px solid var(--bd)' }}>
                  <span className="need" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="check" /> Berjalan mulus di latar belakang
                  </span>
                </div>
              )}
            </div>
            
            {related.length > 0 && (
              <div style={{ marginTop: 32, borderTop: '1px solid var(--bd)', paddingTop: 24 }}>
                <h3 style={{ fontSize: '0.9rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mu)' }}>Fitur Terkait</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {related.slice(0, 4).map((r) => (
                    <button
                      key={r.id}
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', background: 'var(--sf)' }}
                      onClick={() => setId(r.id)}
                      aria-label={`Lihat ${r.name}`}
                    >
                      <Icon name={r.icon} />
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import type { Feature } from '@/lib/types';

function ContextualMock({ feature }: { feature: Feature }) {
  // Keuangan
  if (feature.category === 'Keuangan') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '16px', borderRadius: 12, border: '1px solid var(--bd)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--mu)', marginBottom: 4 }}>TOTAL TAGIHAN</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Rp 450.000</div>
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--success, #10b981) 15%, transparent)', color: 'var(--success, #059669)', padding: '6px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600 }}>PAID</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--bd)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--mu)' }}>Bank Kaltim VA</span><span>009988776655</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--mu)' }}>Status</span><span>Selesai</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--mu)' }}>Tanggal</span><span>Otomatis tercatat</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {feature.capabilities.slice(0, 2).map((cap: string, i: number) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--mu)' }}><Icon name="check" /> {cap}</div>
          ))}
        </div>
      </div>
    );
  }
  
  // Komunikasi / AI / Notif
  if (feature.category === 'Komunikasi' || feature.category === 'AI') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', width: '85%' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user-round" /></div>
          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: '12px 12px 12px 0', border: '1px solid var(--bd)', fontSize: '0.85rem' }}>
            Cek tagihan SPP anak saya Budi?
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', width: '85%', alignSelf: 'flex-end' }}>
          <div style={{ background: 'var(--acb)', color: 'var(--bg)', padding: 12, borderRadius: '12px 12px 0 12px', fontSize: '0.85rem' }}>
            Tagihan Budi bulan ini Rp 150.000. VA Bank Kaltim: 098765432. Silakan bayar.
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ac)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bot" /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {feature.capabilities.slice(0, 2).map((cap: string, i: number) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--mu)' }}><Icon name="sparkles" /> {cap}</div>
          ))}
        </div>
      </div>
    );
  }

  // Kehadiran / Analitik
  if (feature.category === 'Kehadiran' || feature.category === 'Analitik') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, height: 120, alignItems: 'flex-end', borderBottom: '1px solid var(--bd)', paddingBottom: 8 }}>
          {[40, 70, 90, 60, 100, 80, 50].map((h, i) => (
            <div key={i} style={{ flex: 1, background: i === 4 ? 'var(--ac)' : 'var(--bd)', height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--mu)' }}>HADIR</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--success, #10b981)' }}>98%</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--mu)' }}>IZIN/SAKIT</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f59e0b' }}>2%</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {feature.capabilities.slice(0, 2).map((cap: string, i: number) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--mu)' }}><Icon name="chart-line" /> {cap}</div>
          ))}
        </div>
      </div>
    );
  }

  // Default / Sistem / Akademik
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: 16, border: '1px solid var(--bd)', borderRadius: 12, background: 'var(--bg)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={feature.icon} /> Status Layanan
          </h4>
          <span style={{ fontSize: '0.75rem', background: 'color-mix(in srgb, var(--success, #10b981) 15%, transparent)', color: 'var(--success, #059669)', padding: '4px 10px', borderRadius: 99, fontWeight: 600 }}>Aktif (Sync)</span>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: 'var(--mu)', lineHeight: 1.5 }}>{feature.description}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {feature.capabilities.slice(0, 3).map((cap: string, i: number) => (
          <div key={i} className="fld" style={{ background: 'var(--bg)', padding: '12px 16px', borderLeft: '3px solid var(--ac)', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--mu)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Proses Otomatis {i + 1}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{cap}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
