'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/lib/icons';
import type { Category, Feature } from '@/lib/types';

interface Props {
  categories: Category[];
  features: Feature[];
}

/**
 * Quadratic-bezier edge from the centre node to (x, y). The control
 * point stays close to the straight line so curves feel calm, not tangled.
 */
function edgePath(x: number, y: number) {
  const mx = (50 + x) / 2;
  const my = (50 + y) / 2;
  const dx = x - 50;
  const dy = y - 50;
  const len = Math.hypot(dx, dy) || 1;
  const bend = 4;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M 50 50 Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x} ${y}`;
}

export default function EcosystemMapClient({ categories, features }: Props) {
  const [active, setActive] = useState(() => {
    const idx = categories.findIndex((c) => c.id === 'CMS');
    return idx >= 0 ? idx : 0;
  });
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const category = categories[active];

  const items = useMemo(
    () => features.filter((f) => f.category === category.id),
    [category.id, features],
  );
  const shown = items.slice(0, 6);

  const move = (next: number) => {
    const n = (next + categories.length) % categories.length;
    setActive(n);
    nodeRefs.current[n]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(active + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(active - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      move(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      move(categories.length - 1);
    }
  };

  return (
    <section className="s" id="eco">
      <span className="eyebrow rv">Ekosistem terintegrasi</span>
      <h2 className="rv">Satu sistem, bukan modul yang berdiri sendiri.</h2>
      <p className="mu rv" style={{ marginTop: 10 }}>
        Arahkan atau pilih satu bagian untuk melihat perannya.
      </p>

      <div className="eco">
        <div
          className="map"
          id="map"
          role="group"
          aria-label="Diagram ekosistem"
          onKeyDown={onKeyDown}
        >
          <div className="map-inner">
            <svg className="edges" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
              {categories.map((c, i) => (
                <path
                  key={`edge-${c.id}`}
                  id={`edge-${i}`}
                  className={`edge${i === active ? ' hl' : ''}`}
                  d={edgePath(c.x, c.y)}
                />
              ))}

              {/* Glow + travelling arrows on the active edge. Keyed on `active`
                  so the animation restarts from the centre on every change. */}
              <g key={`flow-${active}`} className="edge-flow">
                <path
                  className="edge-glow"
                  d={edgePath(category.x, category.y)}
                />
                
                {[0, 1, 2].map((k) => (
                  <polygon
                    key={k}
                    className="edge-arrow"
                    points="-1.8,-1.4 1.4,0 -1.8,1.4"
                    opacity="0"
                  >
                    {!reducedMotion && (
                      <>
                        <animateMotion
                          dur="1.8s"
                          begin={`${k * 0.6}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                        >
                          <mpath href={`#edge-${active}`} />
                        </animateMotion>
                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          keyTimes="0;0.15;0.85;1"
                          dur="1.8s"
                          begin={`${k * 0.6}s`}
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </polygon>
                ))}
              </g>
            </svg>

            <div className="nd c" style={{ left: '50%', top: '50%' }} aria-hidden="true">
              <Icon name="graduation-cap" aria-hidden="true" />
              ProductSchool
            </div>

            {categories.map((c, i) => (
              <button
                key={`node-${c.id}`}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                type="button"
                className={`nd${i === active ? ' on' : ''}`}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                aria-pressed={i === active}
                aria-label={c.label}
                title={c.label}
                tabIndex={i === active ? 0 : -1}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <Icon name={c.icon} aria-hidden="true" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="info" aria-live="polite" aria-atomic="true">
          <div className="info-sync" aria-hidden="true">
            <span className="dot" />
            <span>Mengikuti node yang dipilih</span>
          </div>

          <span className="tag">{items.length} fitur</span>

          <h3>{category.label}</h3>
          <p className="mu">{category.description}</p>

          {shown.length > 0 && (
            <ul className="feat-list">
              {shown.map((f) => (
                <li key={f.id}>
                  <span className="fi" aria-hidden="true">
                    <Icon name={f.icon} />
                  </span>
                  {f.name}
                </li>
              ))}
            </ul>
          )}

          {items.length > shown.length && (
            <p className="note" style={{ marginTop: 10 }}>
              +{items.length - shown.length} fitur lainnya di kategori ini
            </p>
          )}
        </div>
      </div>
    </section>
  );
}