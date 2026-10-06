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
        role="dialog"
        aria-modal="true"
        aria-label="Detail fitur"
        className="side"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          background: 'var(--sf)',
          borderLeft: '1px solid var(--bd)',
          padding: 28,
          overflowY: 'auto',
        }}
      >
        <button
          ref={closeRef}
          className="ib x"
          style={{ position: 'absolute', right: 16, top: 16 }}
          aria-label="Tutup"
          onClick={() => setId(null)}
        >
          <Icon name="x" />
        </button>
        <span className="tag q">{feature.category}</span>
        <h2 style={{ fontSize: '1.9rem', margin: '10px 0 8px' }}>{feature.name}</h2>
        <p className="mu">{feature.description}</p>

        <h3 style={{ fontSize: '0.95rem', margin: '22px 0 8px' }}>Siapa yang memakai</h3>
        <span className="need">{feature.users}</span>

        <h3 style={{ fontSize: '0.95rem', margin: '22px 0 8px' }}>Kemampuan</h3>
        {feature.capabilities.length ? (
          <>
            <ul className="cp">
              {feature.capabilities.map((cap) => (
                <li key={cap}>{cap}</li>
              ))}
            </ul>
            <p className="note" style={{ marginTop: 6 }}>
              Diverifikasi dari repository Laravel.
            </p>
          </>
        ) : (
          <span className="need">Menunggu data terverifikasi</span>
        )}

        <h3 style={{ fontSize: '0.95rem', margin: '22px 0 8px' }}>Alur kerja</h3>
        {feature.flow ? (
          <button
            className="btn p"
            onClick={() => {
              setId(null);
              if (feature.flow) openFlow(feature.flow);
            }}
            aria-label="Lihat alur interaktif untuk fitur ini"
          >
            <Icon name="play" />
            Lihat alur interaktif
          </button>
        ) : (
          <span className="need">Alur menyusul setelah audit</span>
        )}

        {related.length > 0 && (
          <>
            <h3 style={{ fontSize: '0.95rem', margin: '22px 0 8px' }}>
              Fitur dalam kelompok yang sama
            </h3>
            <div className="row">
              {related.slice(0, 5).map((r) => (
                <button
                  key={r.id}
                  className="btn"
                  onClick={() => setId(r.id)}
                  aria-label={`Lihat ${r.name}`}
                >
                  <Icon name={r.icon} />
                  {r.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
