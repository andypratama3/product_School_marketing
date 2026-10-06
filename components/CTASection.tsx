import { Icon } from '@/lib/icons';
import { audiences, stack } from '@/data/sales';

export default function CTASection() {
  return (
    <section className="s" id="cta">
      <div className="ck rv" aria-hidden="true">
        <Icon name="rocket" />
      </div>
      <h2 className="rv">Siap membawa sekolah ke satu sistem?</h2>
      <p className="lead mu rv">
        ProductSchool adalah source code lengkap sistem sekolah — bukan SaaS
        terkunci. Instal, sesuaikan, miliki sepenuhnya.
      </p>
      <div className="bene rv">
        {audiences.map((item) => (
          <div className="card" key={item.title}>
            <span className="ic">
              <Icon name={item.icon} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      <div className="chips rv" style={{ justifyContent: 'center', maxWidth: 760 }}>
        {stack.map((item) => (
          <span className="chip" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="row rv" style={{ justifyContent: 'center' }}>
        <a className="btn p" href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Icon name="github" />
          Lihat source
        </a>
        <a className="btn" href="#fit">
          <Icon name="layout-grid" />
          Jelajahi fitur lagi
        </a>
      </div>
    </section>
  );
}
