'use client';

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Icon, type IconName } from '@/lib/icons';
import { scrollToId } from '@/lib/scroll';
import { features } from '@/data/features';
import { flowPickOptions } from '@/data/flows';

type Entry = {
  id: string;
  name: string;
  kind: string;
  icon: IconName;
  flow?: string;
};

export function openFeature(id: string) {
  window.dispatchEvent(new CustomEvent('open-feature', { detail: id }));
}

export function openFlow(key: string) {
  window.dispatchEvent(new CustomEvent('open-flow', { detail: key }));
  // Ensure the user actually sees the flow they just picked.
  requestAnimationFrame(() => {
    scrollToId('flow');
  });
}

export default function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const index: Entry[] = useMemo(
    () => [
      ...features.map((f) => ({
        id: f.id,
        name: f.name,
        kind: 'Fitur',
        icon: f.icon,
        flow: f.flow,
      })),
      ...flowPickOptions.map((f) => ({
        id: f.key,
        name: `Alur ${f.title}`,
        kind: 'Alur',
        icon: 'play' as const,
        flow: f.key,
      })),
    ],
    [],
  );

  const results = useMemo(
    () =>
      query
        ? index.filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))
        : index,
    [query, index],
  );

  const choose = useCallback((entry: Entry) => {
    onClose();
    setQuery('');
    // 'Alur' entries switch the simulator; 'Fitur' entries always open the
    // feature detail (which itself links to its flow when one exists).
    if (entry.kind === 'Alur' && entry.flow) openFlow(entry.flow);
    else openFeature(entry.id);
  }, [onClose]);

  // Focus input on open, lock background scroll, close on Escape.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Clear stale query so reopening always starts fresh.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  const visible = results.slice(0, 50);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,.5)',
        display: 'grid',
        placeItems: 'start center',
        paddingTop: '12vh',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Pencarian"
        style={{
          background: 'var(--sf)',
          border: '1px solid var(--bd)',
          borderRadius: 14,
          width: 'min(560px, 92vw)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          id="q"
          ref={inputRef}
          placeholder="Cari fitur atau alur"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) choose(results[0]);
            if (e.key === 'Escape') onClose();
          }}
        />
        <div id="ql" aria-label="Hasil pencarian">
          {visible.length ? (
            visible.map((entry) => (
              <button key={`${entry.kind}-${entry.id}`} onClick={() => choose(entry)} aria-label={`Buka ${entry.name}`}>
                <Icon name={entry.icon} />
                {entry.name}
                <small>{entry.kind}</small>
              </button>
            ))
          ) : (
            <p className="mu" style={{ padding: 14 }}>
              Tidak ada hasil. Coba kata kunci lain.
            </p>
          )}
          {results.length > visible.length && (
            <p className="mu" style={{ padding: '8px 14px' }}>
              Menampilkan {visible.length} dari {results.length} hasil — ketik
              untuk mempersempit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
