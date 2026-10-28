export default function Footer() {
  return (
    <footer className="site">
      <div className="logo">
        <img
          src="/brand/logo-sakolentra.png"
          alt="Sakolentra — Pendidikan Digital"
          width={768}
          height={230}
        />
      </div>
      <span className="sp" />
      <nav aria-label="Navigasi bawah">
        <a href="#fit">Fitur</a>
        <a href="#flow">Alur</a>
        <a href="#harga">Harga</a>
        <a href="#tentang">Tentang</a>
        <a href="#cta">Kontak</a>
      </nav>
      <span className="mu">© 2026 ProductSchool</span>
    </footer>
  );
}
