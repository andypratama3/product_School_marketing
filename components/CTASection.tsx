import { Icon } from '@/lib/icons';
import { audiences, stack } from '@/data/sales';
import { inventory } from '@/data/pricing';
import ContactForm from './ContactForm';
import CalBook from './CalBook';

export default function CTASection() {
  return (
    <section className="s" id="cta">
      <div className="ck rv" aria-hidden="true">
        <Icon name="rocket" />
      </div>
      <h2 className="rv">Siap membawa sekolah ke satu sistem?</h2>
      <p className="lead mu rv">
        ProductSchool adalah source code lengkap sistem sekolah — bukan SaaS terkunci. Kirim
        pesan, atau jadwalkan panggilan langsung. Inventori terkini: {inventory.features} fitur
        dan {inventory.flows} alur terverifikasi.
      </p>

      <div className="cta-split rv">
        <div className="cta-panel">
          <h3 className="cta-panel-title">Kirim pesan</h3>
          <p className="mu" style={{ marginBottom: 16 }}>
            Kami balas via email. Sertakan paket jika sudah memilih.
          </p>
          <ContactForm />
        </div>
        <div className="cta-panel">
          <h3 className="cta-panel-title">Jadwalkan panggilan</h3>
          <p className="mu" style={{ marginBottom: 16 }}>
            Pilih slot di Cal.com — tanpa bolak-balik email.
          </p>
          <CalBook variant="cards" />
        </div>
      </div>

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
        <a className="btn" href="#fit">
          <Icon name="layout-grid" />
          Jelajahi fitur lagi
        </a>
        <a className="btn" href="#harga">
          <Icon name="wallet" />
          Lihat harga
        </a>
      </div>
    </section>
  );
}
