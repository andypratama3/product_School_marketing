import { Icon } from '@/lib/icons';

export default function AboutSection() {
  return (
    <section className="s" id="tentang" aria-label="Tentang pembuat">
      <h2 className="rv">Dibangun oleh praktisi, bukan agensi.</h2>
      <p className="lead mu rv">
        Saya Andy Pratama, Fullstack Software Engineer dari Samarinda dengan
        3+ tahun pengalaman membangun aplikasi web produksi (Next.js, React,
        TypeScript, Laravel, API, DevOps). ProductSchool lahir dari kebutuhan
        nyata operasional sekolah: akademik, keuangan, kehadiran, hingga
        komunikasi orang tua dalam satu codebase.
      </p>
      <div className="row rv">
        <a
          className="btn p"
          href="https://github.com/andypratama3"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Andy Pratama"
        >
          <Icon name="github" />
          GitHub saya
        </a>
        <a
          className="btn"
          href="https://www.linkedin.com/in/andypratama3"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Andy Pratama"
        >
          <Icon name="link" />
          LinkedIn
        </a>
        <a className="btn" href="mailto:andypratama1211@gmail.com" aria-label="Email Andy Pratama">
          <Icon name="mail" />
          andypratama1211@gmail.com
        </a>
      </div>
    </section>
  );
}
