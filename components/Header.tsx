'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/lib/icons';
import SearchDialog from './SearchDialog';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mac, setMac] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
    const root = document.documentElement;
    const initial =
      root.dataset.theme ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem('ps-theme', next);
    } catch {}
  };

  return (
    <>
      <header className="site">
        <div className="logo">
          <b>
            <Icon name="graduation-cap" />
          </b>
          ProductSchool
        </div>
        <span className="sp" />
        <button className="ib" onClick={() => setSearchOpen(true)} aria-label="Cari">
          <Icon name="search" />
          <span className="lbl">Cari</span>
          <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <button
          className="ib"
          onClick={toggleTheme}
          aria-label="Ganti tema"
          aria-pressed={theme === 'dark'}
          title={theme === 'dark' ? 'Mode gelap aktif' : 'Mode terang aktif'}
        >
          <Icon name="sun-moon" />
        </button>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
