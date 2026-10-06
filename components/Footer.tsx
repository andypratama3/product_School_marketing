import { Icon } from '@/lib/icons';

export default function Footer() {
  return (
    <footer className="site">
      <div className="logo">
        <b>
          <Icon name="graduation-cap" />
        </b>
        ProductSchool
      </div>
      <span className="sp" />
      <nav aria-label="Navigasi bawah">
        <a href="#fit">Fitur</a>
        <a href="#flow">Alur</a>
        <a href="#cta">Mulai</a>
      </nav>
      <span className="mu">© 2026 ProductSchool</span>
    </footer>
  );
}
