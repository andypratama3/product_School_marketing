'use client';

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Icon, type IconName } from '@/lib/icons';
import { features } from '@/data/features';
import { flowPickOptions } from '@/data/flows';
import { scrollToId } from '@/lib/scroll';

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
  // Dialog unlock runs in effect cleanup. Scroll twice: once soon after
  // unlock, again after the new flow's layout settles (height change).
  const go = () => {
    while (scrollLocks > 0) unlockScroll();
    scrollToId('flow', 'auto');
  };
  window.setTimeout(go, 50);
  window.setTimeout(go, 200);
}

// Reference-counted background scroll lock so overlapping dialogs restore
// overflow only when the last one closes.
let scrollLocks = 0;
let savedOverflow = '';

export function lockScroll() {
  if (scrollLocks === 0) savedOverflow = document.body.style.overflow;
  scrollLocks++;
  document.body.style.overflow = 'hidden';
}

export function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
}

// Keep Tab cycling inside an open modal dialog.
export function trapTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (e.key !== 'Tab' || !root) return;
  const items = [...root.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => !el.hasAttribute('disabled'),
  );
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
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
  const dialogRef = useRef<HTMLDivElement>(null);

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
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      trapTab(e, dialogRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
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
        aria-modal="true"
        aria-label="Pencarian"
        ref={dialogRef}
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
          aria-label="Cari fitur atau alur"
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
