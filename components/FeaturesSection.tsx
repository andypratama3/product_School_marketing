'use client';

import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Icon } from '@/lib/icons';
import { categories } from '@/data/categories';
import { features } from '@/data/features';
import type { Feature } from '@/lib/types';
import { openFeature } from './SearchDialog';

const CHIPS = ['Semua', ...categories.map((c) => c.id)];

const FeatureCard = memo(function FeatureCard({ feature }: { feature: Feature }) {
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <button
      className={`card${feature.flow ? ' big' : ''}`}
      data-id={feature.id}
      onClick={() => {
        openFeature(feature.id);
      }}
      onMouseMove={onMove}
      aria-label={`Lihat detail ${feature.name}`}
    >
      <span className="ic">
        <Icon name={feature.icon} />
      </span>
      <h3>{feature.name}</h3>
      <p>{feature.description}</p>
      {feature.flow && (
        <span className="tag">
          <Icon name="play" />
          Ada alur interaktif
        </span>
      )}
    </button>
  );
});

export default function FeaturesSection() {
  const [active, setActive] = useState('Semua');
  const listRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(
    () =>
      categories
        .filter((c) => active === 'Semua' || c.id === active)
        .map((c) => ({
          category: c,
          items: features.filter((f) => f.category === c.id),
        }))
        .filter((g) => g.items.length > 0),
    [active],
  );

  // Card entrance per filter change. Self-contained context (created +
  // reverted here) so chip filtering can never leave stale ScrollTriggers.
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (cancelled || matchMedia('(prefers-reduced-motion: reduce)').matches)
          return;
        gsap.registerPlugin(ScrollTrigger);
        const root = listRef.current;
        if (!root) return;
        ctx = gsap.context(() => {
          root.querySelectorAll<HTMLElement>('.grp').forEach((group) => {
            gsap.from(group.querySelectorAll('.card'), {
              autoAlpha: 0,
              y: 20,
              duration: 0.5,
              stagger: 0.04,
              scrollTrigger: { trigger: group, start: 'top 88%', once: true },
              ease: 'power2.out',
              clearProps: 'opacity,visibility,transform',
              // Cards already in view (just filtered) still play once.
              immediateRender: true,
            });
          });
        }, root);
        ScrollTrigger.refresh();
      } catch {
        // Animation chunk unavailable — cards stay visible.
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [active]);

  return (
    <section className="s" id="fit">
      <h2 className="rv">Semua fitur dalam satu peta.</h2>
      <p className="mu rv" style={{ marginTop: 10 }}>
        {features.length} fitur terverifikasi dari repository ProductSchool.
      </p>
      <div className="chips" role="group" aria-label="Filter kategori">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            className="chip"
            aria-pressed={active === chip}
            onClick={() => setActive(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      <div ref={listRef}>
        {groups.map((group) => (
          <div className="grp" key={group.category.id}>
            <h3 className="gh">
              <Icon name={group.category.icon} />
              {group.category.id}
              <span>{group.items.length} fitur</span>
            </h3>
            <div className="grid">
              {group.items.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
