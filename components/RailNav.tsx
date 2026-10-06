'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  ['hero', 'Pengenalan'],
  ['stats', 'Angka'],
  ['eco', 'Ekosistem'],
  ['fit', 'Fitur'],
  ['flow', 'Alur'],
  ['done', 'Hasil'],
  ['harga', 'Harga'],
  ['cta', 'Mulai'],
] as const;

export default function RailNav() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = SECTIONS.findIndex(([id]) => id === entry.target.id);
          if (idx >= 0) setActive(idx);
        });
      },
      // Short sections (e.g. #stats) need a tighter band to ever intersect.
      { rootMargin: '-30% 0px -60% 0px' },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="rail" aria-label="Bagian halaman">
      {SECTIONS.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          aria-label={label}
          className={
            SECTIONS[active]?.[0] === id ? 'on' : undefined
          }
        />
      ))}
    </nav>
  );
}
