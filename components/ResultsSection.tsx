'use client';

import { Icon } from '@/lib/icons';
import { features } from '@/data/features';
import { flowMap, flows } from '@/data/flows';
import { useFlow } from './FlowContext';
import { openFeature, openFlow } from './SearchDialog';
import { useMemo } from 'react';

export default function ResultsSection() {
  const { flowKey } = useFlow();
  const flow = flowMap[flowKey];
  const owner = useMemo(() => features.find((f) => f.flow === flowKey), [flowKey]);
  const related = useMemo(
    () =>
      owner
        ? features.filter((f) => f.category === owner.category && f.id !== owner.id).slice(0, 3)
        : [],
    [owner],
  );

  if (!flow) {
    return null;
  }

  return (
    <section className="s res" id="done">
      <div className="ck" aria-hidden="true">
        <Icon name="check" />
      </div>
      <h2 className="rv">Alur selesai</h2>
      <div className="lst rv">
        <div>
          <b>Yang berubah:</b> {flow.results?.[0] || ''}
        </div>
        <div>
          <b>Di mana melihatnya:</b> {flow.results?.[1] || ''}
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button
          className="btn p"
          onClick={() => openFlow(flowKey)}
          aria-label="Ulangi alur simulasi"
        >
          <Icon name="rotate-ccw" />
          Ulangi alur
        </button>
        <a className="btn" href="#fit" aria-label="Kembali ke daftar fitur">
          Kembali ke daftar fitur
        </a>
      </div>
      {related.length > 0 && (
        <>
          <h3 style={{ marginTop: 40 }}>Fitur terkait</h3>
          <div className="row" style={{ marginTop: 12, justifyContent: 'center' }}>
            {related.map((r) => (
              <button key={r.id} className="btn" onClick={() => openFeature(r.id)} aria-label={`Lihat ${r.name}`}>
                <Icon name={r.icon} />
                {r.name}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="row" style={{ marginTop: 20, justifyContent: 'center' }}>
        {flows.map((item) => (
          <button
            key={item.key}
            type="button"
            className="chip"
            aria-pressed={item.key === flowKey}
            onClick={() => openFlow(item.key)}
            aria-label={`Coba alur ${item.title.replace(/^Alur /, '').replace(/:.*/, '')}`}
          >
            {item.title.replace(/^Alur /, '').replace(/:.*/, '')}
          </button>
        ))}
      </div>
    </section>
  );
}
