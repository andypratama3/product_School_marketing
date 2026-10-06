'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Icon } from '@/lib/icons';
import { scrollToId } from '@/lib/scroll';
import { flowMap, flowPickOptions } from '@/data/flows';
import { useFlow } from './FlowContext';

export default function FlowSection() {
  const { flowKey, flowNonce, setFlowKey } = useFlow();
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const flow = flowMap[flowKey];
  const total = flow?.steps.length || 0;
  const current = flow?.steps[step];

  // Reset step on flow switch AND on re-open of the same flow (nonce bump).
  useEffect(() => {
    setStep(0);
  }, [flowKey, flowNonce]);

  const go = useCallback((i: number) => {
    setStep(Math.max(0, Math.min(total - 1, i)));
  }, [total]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (
      e.key !== 'ArrowRight' &&
      e.key !== 'ArrowLeft'
    )
      return;
    const target = e.target as HTMLElement | null;
    if (target && /INPUT|TEXTAREA/.test(target.tagName)) return;
    // Don't hijack arrows while a modal dialog is open.
    if (document.querySelector('[role="dialog"]')) return;
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return;
    if (e.key === 'ArrowRight') go(step + 1);
    else go(step - 1);
  }, [step, go]);

  useEffect(() => {
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onKey]);

  if (!flow) {
    return null;
  }

  const advance = () => {
    if (step === total - 1) {
      scrollToId('done');
    } else {
      go(step + 1);
    }
  };

  return (
    <section className="s" id="flow" aria-label="Alur kerja">
      <div id="stage" ref={stageRef}>
        <div className="fh">
          <h2 id="ft">{flow.title}</h2>
          <span className="sim">
            <Icon name="flask-conical" />
            Simulasi, tidak mengubah data asli
          </span>
        </div>

        <div className="flowpick" role="group" aria-label="Pilih alur">
          {flowPickOptions.map((option) => (
            <button
              key={option.key}
              className={option.key === flowKey ? 'on' : undefined}
              onClick={() => setFlowKey(option.key)}
              aria-label={`Pilih alur ${option.title}`}
              aria-pressed={option.key === flowKey}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div className="prog" role="group" aria-label="Langkah">
          {flow.steps?.map((s, i) => (
            <button
              key={s.title}
              data-i={i}
              aria-label={`Langkah ${i + 1}`}
              aria-current={i === step ? 'step' : undefined}
              className={i === step ? 'on' : i < step ? 'dn' : undefined}
              onClick={() => go(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="pbar" aria-hidden="true">
          <i
            style={{
              transform: `scaleX(${(step + 1) / total})`,
            }}
          />
        </div>

        <div className="split step-swap" key={`split-${flowKey}-${step}`}>
          <div className="pane">
            <div className="pane-header">
              <i className="dot red" />
              <i className="dot yellow" />
              <i className="dot green" />
              <span className="pane-title">{flow.leftLabel}</span>
            </div>
            <div className="pb">
              {current?.fields?.map(([label, value, act], i) => (
                <div
                  className={`fld${act ? ' act' : ''}`}
                  key={`${label}-${i}`}
                >
                  <small>{label}</small>
                  {value}
                </div>
              ))}
              {current?.badge && (
                <span className={`bdg ${current.badge[1]}`}>
                  {current.badge[0]}
                </span>
              )}
              {current?.button && (
                <span
                  className="btn p pulse"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {current.button}
                </span>
              )}
            </div>
          </div>

          <div className="pane">
            <div className="pane-header">
              <i className="dot red" />
              <i className="dot yellow" />
              <i className="dot green" />
              <span className="pane-title">{flow.rightLabel}</span>
            </div>
            <div className="pb">
              {current?.publicView?.kind === 'page' ? (
                <div className="web">
                  <div className="pv">{current.publicView.label}</div>
                  <h3>{current.publicView.headline}</h3>
                  <p className="mu" style={{ whiteSpace: 'pre-line' }}>
                    {current.publicView.body}
                  </p>
                </div>
              ) : (
                <div className="web empty">{current?.publicView?.message || 'Loading...'}</div>
              )}
            </div>
          </div>
        </div>

        <div className="sy step-swap" key={`sy-${flowKey}-${step}`} aria-live="polite">
          <div>
            <h3>Langkah {step + 1}</h3>
            <p>
              <b>{current?.title || ''}</b>
            </p>
          </div>
          <div>
            <h3>Aksi Anda</h3>
            <p>{current?.action || ''}</p>
          </div>
          <div>
            <h3>Sistem</h3>
            <p>{current?.system || ''}</p>
            <p className="mu" style={{ marginTop: 6 }}>
              <b>Hasil:</b> {current?.result || ''}
            </p>
          </div>
        </div>

        <p className="note" id="fnote">
          Urutan langkah dan teks di panel adalah ilustrasi berdasarkan audit
          kode.
        </p>

        <details>
          <summary>Detail teknis</summary>
          <p style={{ marginTop: 8 }}>{flow.evidence || ''}</p>
        </details>

        <div className="ctl">
          <button className="btn" disabled={step === 0} onClick={() => go(step - 1)}>
            <Icon name="chevron-left" />
            Sebelumnya
          </button>
          <span className="note">
            Langkah {step + 1} dari {total}
          </span>
          <button className="btn p" onClick={advance}>
            <span>{step === total - 1 ? 'Lihat hasil' : 'Lanjut'}</span>
            <Icon name="chevron-right" />
          </button>
        </div>
      </div>
    </section>
  );
}
