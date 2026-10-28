'use client';

import { Icon } from '@/lib/icons';
import { features } from '@/data/features';
import { stats } from '@/data/sales';

const apiStat = stats.find((s) => s.label === 'Route API');

export default function Hero() {
  return (
    <section className="s" id="hero">
      <span className="hero-badge r">
        <Icon name="sparkles" />
        {features.length} fitur
        {apiStat ? ` · ${apiStat.value} API route` : ''}
      </span>
      <h1 className="r">
        Semua kebutuhan sekolah, terhubung dalam satu sistem.
      </h1>
      <p className="lead mu r">
        ProductSchool menyatukan akademik, siswa, staf, keuangan, dan konten
        sekolah. Pilih satu fitur, lalu ikuti alurnya dari awal sampai hasil.
      </p>
      <div className="row r">
        <a className="btn p" href="#fit">
          <Icon name="layout-grid" />
          Jelajahi fitur
        </a>
        <a className="btn" href="#flow">
          <Icon name="play" />
          Coba alur interaktif
        </a>
        <a className="btn" href="#cta">
          <Icon name="calendar-check" />
          Hubungi / book call
        </a>
      </div>
      <div className="hv r" aria-hidden="true">
        <div className="sb">
          <b>
            <Icon name="graduation-cap" />
          </b>
          <u className="on">
            <Icon name="layout-dashboard" />
          </u>
          <u>
            <Icon name="users" />
          </u>
          <u>
            <Icon name="calendar-check" />
          </u>
          <u>
            <Icon name="wallet" />
          </u>
          <u>
            <Icon name="file-text" />
          </u>
        </div>
        <div className="mn" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="t">
            <Icon name="users" />
            <div style={{ flex: 1 }}>
              <s />
              <s style={{ width: '60%', marginTop: 6 }} />
            </div>
          </div>
          <div className="t">
            <Icon name="calendar-check" />
            <div style={{ flex: 1 }}>
              <s />
              <s style={{ width: '80%', marginTop: 6 }} />
            </div>
          </div>
          <div className="t">
            <Icon name="wallet" />
            <div style={{ flex: 1 }}>
              <s />
              <s style={{ width: '40%', marginTop: 6 }} />
            </div>
          </div>
          <div className="ch">
            <s style={{ height: '40%' }} />
            <s style={{ height: '62%' }} />
            <s style={{ height: '48%' }} />
            <s style={{ height: '80%' }} />
            <s style={{ height: '58%' }} />
            <s style={{ height: '90%' }} />
            <s style={{ height: '70%' }} />
          </div>
          <div className="ls">
            <s />
            <s style={{ width: '50%' }} />
            <s style={{ width: '80%' }} />
          </div>
          
          {/* Floating UI elements for tech feel */}
          <div className="float-badge fb1" style={{ top: 20, right: -10 }}>+42k IDR</div>
          <div className="float-badge fb2" style={{ top: 90, right: 30 }}>Synced</div>
          <div className="float-badge fb3" style={{ bottom: 30, right: 10 }}>24/7</div>
        </div>
      </div>
    </section>
  );
}
