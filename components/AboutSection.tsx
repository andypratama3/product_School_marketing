import { Icon } from '@/lib/icons';
import { SOCIAL, CONTACT_EMAIL, CAL_PROFILE_URL, CAL_USERNAME } from '@/lib/site';

export default function AboutSection() {
  return (
    <section className="s" id="tentang" aria-label="Tentang pembuat">
      <h2 className="rv">Dibangun oleh praktisi, bukan agensi.</h2>
      <p className="lead mu rv">
        Saya Andy Pratama, Fullstack Software Engineer dari Samarinda dengan 3+ tahun pengalaman
        membangun aplikasi web produksi (Next.js, React, TypeScript, Laravel, API, DevOps).
        ProductSchool lahir dari kebutuhan nyata operasional sekolah: akademik, keuangan,
        kehadiran, hingga komunikasi orang tua dalam satu codebase.
      </p>
      <div className="row rv">
        <a
          className="btn p"
          href={CAL_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cal-link={CAL_USERNAME}
          data-cal-config='{"layout":"month_view"}'
          aria-label="Jadwalkan panggilan dengan Andy Pratama"
        >
          <Icon name="calendar-check" />
          Book a call
        </a>
        <a
          className="btn"
          href={SOCIAL.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Andy Pratama"
        >
          <Icon name="github" />
          GitHub
        </a>
        <a
          className="btn"
          href={SOCIAL.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Andy Pratama"
        >
          <Icon name="link" />
          LinkedIn
        </a>
        <a className="btn" href={SOCIAL.email} aria-label="Email Andy Pratama">
          <Icon name="mail" />
          {CONTACT_EMAIL}
        </a>
      </div>
    </section>
  );
}
