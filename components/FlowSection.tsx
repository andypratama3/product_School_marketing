'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Icon, type IconName } from '@/lib/icons';
import { scrollToId } from '@/lib/scroll';
import { flowMap, flowPickOptions } from '@/data/flows';
import { useFlow } from './FlowContext';
import { categories } from '@/data/categories';
import { features } from '@/data/features';
export default function FlowSection() {
  const { flowKey, flowNonce, setFlowKey } = useFlow();
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const flow = flowMap[flowKey];
  const total = flow?.steps.length || 0;

  // Reset step on flow switch / re-open during render so we never paint
  // one frame with an out-of-range step from the previous flow.
  const resetToken = `${flowKey}:${flowNonce}`;
  const [seenToken, setSeenToken] = useState(resetToken);
  if (seenToken !== resetToken) {
    setSeenToken(resetToken);
    setStep(0);
  }

  const activeStep = total === 0 ? 0 : Math.min(step, total - 1);
  const current = flow?.steps[activeStep];

  const go = useCallback((i: number) => {
    setStep(Math.max(0, Math.min(total - 1, i)));
  }, [total]);

  const advance = useCallback(() => {
    if (activeStep === total - 1) {
      scrollToId('done', 'auto');
      window.setTimeout(() => scrollToId('done', 'auto'), 120);
    } else {
      go(activeStep + 1);
    }
  }, [activeStep, total, go]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (
      e.key !== 'ArrowRight' &&
      e.key !== 'ArrowLeft' &&
      e.key !== ' ' &&
      e.key !== 'Home' &&
      e.key !== 'End'
    )
      return;
    const target = e.target as HTMLElement | null;
    if (target && /INPUT|TEXTAREA|SELECT|BUTTON/.test(target.tagName)) return;
    if (document.querySelector('[role="dialog"]')) return;
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return;
    
    e.preventDefault();
    if (e.key === 'ArrowRight' || e.key === ' ') {
      advance();
    } else if (e.key === 'ArrowLeft') {
      go(activeStep - 1);
    } else if (e.key === 'Home') {
      go(0);
    } else if (e.key === 'End') {
      go(total - 1);
    }
  }, [activeStep, go, advance, total]);
  useEffect(() => {
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onKey]);

  if (!flow || total === 0) {
    return null;
  }



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

        <div className="flow-explorer" role="group" aria-label="Eksplorasi alur">
          {categories.map((cat) => {
            const items = flowPickOptions.filter((opt) => {
              const feat = features.find((f) => f.flow === opt.key);
              return feat ? feat.category === cat.id : cat.id === 'Sistem';
            });
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="flow-grp" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--mu)' }}>
                  <Icon name={cat.icon as IconName} />
                  <span>{cat.label}</span>
                </div>
                <div className="flowpick" role="group" aria-label={`Alur ${cat.label}`}>
                  {items.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={opt.key === flowKey ? 'on' : undefined}
                      onClick={() => {
                        setFlowKey(opt.key);
                        window.setTimeout(() => scrollToId('flow', 'auto'), 50);
                      }}
                      aria-label={`Pilih alur ${opt.title}`}
                      aria-pressed={opt.key === flowKey}
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Simulator Area */}
        <div 
          className="sim-area" 
          style={{ 
            background: 'var(--sf)', 
            border: '1px solid var(--bd)', 
            borderRadius: 16, 
            padding: '24px',
            marginTop: 24,
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
          }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--acb)', color: 'var(--acx)', borderRadius: '50%', fontSize: '0.75rem' }}>{activeStep + 1}</span>
              {current?.title || ''}
            </h3>
            {activeStep === 0 && (
              <div className="pulse-hint" style={{ fontSize: '0.8rem', color: 'var(--ac)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, background: 'color-mix(in srgb, var(--acb) 15%, transparent)', padding: '4px 12px', borderRadius: 99 }}>
                <Icon name="chevron-right" /> Tekan Spasi atau Lanjut
              </div>
            )}
          </div>

          <div className="prog" role="group" aria-label="Langkah">
          {flow.steps.map((s, i) => (
            <button
              key={`${flowKey}-${i}-${s.title}`}
              type="button"
              data-i={i}
              aria-label={`Langkah ${i + 1}: ${s.title}`}
              aria-current={i === activeStep ? 'step' : undefined}
              className={i === activeStep ? 'on' : i < activeStep ? 'dn' : undefined}
              onClick={() => go(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="pbar" aria-hidden="true">
          <i
            style={{
              transform: `scaleX(${(activeStep + 1) / total})`,
            }}
          />
        </div>

          <div className="split step-swap" key={`split-${flowKey}-${activeStep}`} style={{ marginTop: 20 }}>
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

          {/* Narrative / Explanation Panel */}
          <div className="sy step-swap" key={`sy-${flowKey}-${activeStep}`} aria-live="polite" style={{ marginTop: 24, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--bd)', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: 'color-mix(in srgb, var(--acb) 15%, transparent)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="user-round" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mu)', marginBottom: 4 }}>Tindakan Anda</h4>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>{current?.action || ''}</p>
              </div>
            </div>
            
            <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', background: 'var(--sf2)' }}>
              <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: 'var(--bd)', color: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="cpu" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mu)', marginBottom: 4 }}>Respon Sistem</h4>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{current?.system || ''}</p>
                {current?.result && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'color-mix(in srgb, var(--success, #10b981) 15%, transparent)', color: 'var(--success, #059669)', borderRadius: 6, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                    <Icon name="check" /> {current.result}
                  </div>
                )}
              </div>
            </div>
          </div>

        <p className="note" id="fnote">
          Urutan langkah dan teks di panel adalah ilustrasi berdasarkan audit
          kode.
        </p>

          <details style={{ marginTop: 16, marginBottom: 24, fontSize: '0.85rem', color: 'var(--mu)' }}>
            <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Detail teknis & file kode</summary>
            <div style={{ marginTop: 10, padding: 12, background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 8, fontFamily: 'monospace' }}>
              {flow.evidence || 'Tidak ada detail teknis.'}
            </div>
          </details>

          <div className="ctl" style={{ marginTop: 'auto', borderTop: '1px solid var(--bd)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn"
            disabled={activeStep === 0}
            onClick={() => go(activeStep - 1)}
          >
            <Icon name="chevron-left" />
            Sebelumnya
          </button>
          <span className="note">
            Langkah {activeStep + 1} dari {total}
          </span>
          <button
            type="button"
            className="btn"
            disabled={activeStep === 0}
            onClick={() => go(0)}
            title="Mulai dari awal"
            aria-label="Mulai dari awal"
          >
            <Icon name="rotate-ccw" />
          </button>
          <button type="button" className="btn p" onClick={advance}>
            <span>{activeStep === total - 1 ? 'Lihat hasil' : 'Lanjut'}</span>
            <Icon name="chevron-right" />
          </button>
        </div>
        </div> {/* End sim-area */}
      </div>
    </section>
  );
}
