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
        {features.length} fitur terverifikasi
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
        <div className="mn">
          <div className="t">
            <Icon name="users" />
            <s />
          </div>
          <div className="t">
            <Icon name="calendar-check" />
            <s />
          </div>
          <div className="t">
            <Icon name="wallet" />
            <s />
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
        </div>
      </div>
    </section>
  );
}
