import { stats } from '@/data/sales';

export default function StatsBar() {
  return (
    <section className="s" id="stats" aria-label="Angka utama">
      <div className="stats-row r">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
