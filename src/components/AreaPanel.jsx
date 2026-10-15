import { useState } from 'react';
import { X, Radio, Search, MessageSquarePlus, History } from 'lucide-react';
import { OUTCOMES, commLabel, explain } from '../lib/priority';
import { LevelBadge, StatusBadge, fmtNum, fmtDate, timeAgo, btnPrimary, btnGhost, LEVELS } from './ui';
import VerifyForm from './VerifyForm';

export default function AreaPanel({ area, startVerify, onClose, dispatch }) {
  const [verifying, setVerifying] = useState(startVerify);
  const [rep, setRep] = useState({ text: '', source: 'SMS', error: '' });

  function logReport(e) {
    e.preventDefault();
    if (rep.text.trim().length < 5) return setRep({ ...rep, error: 'Enter the report text (at least 5 characters).' });
    dispatch({ type: 'report', id: area.id, text: rep.text.trim(), source: rep.source, now: Date.now() });
    setRep({ text: '', source: rep.source, error: '' });
  }

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end bg-slate-900/30" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={`Details for ${area.name}`} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{area.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2"><StatusBadge status={area.eff} /><LevelBadge level={area.level} /><span className="text-xs text-slate-500">{area.hazard} · severity {area.severity}/5</span></div>
          </div>
          <button autoFocus onClick={onClose} aria-label="Close details" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </header>

        <div className="space-y-5 p-5">
          <section aria-label="Priority score">
            <div className="flex items-baseline gap-2"><span className="text-3xl font-semibold" style={{ color: LEVELS[area.level].color }}>{area.score.toFixed(1)}</span><span className="text-sm text-slate-500">/ 100 verification priority</span></div>
            <p className="mt-1 text-xs text-slate-500">Priority to verify, not the probability that an emergency is occurring.</p>
            <ul className="mt-3 space-y-2">
              {area.calc.factors.map((f) => (
                <li key={f.key}>
                  <div className="flex justify-between text-xs text-slate-600"><span>{f.label} ({f.raw})</span><span>{f.norm.toFixed(0)} × {f.weight} = <b>{f.points.toFixed(1)}</b></span></div>
                  <div className="mt-0.5 h-1.5 rounded bg-slate-100"><div className="h-1.5 rounded bg-slate-700" style={{ width: `${f.norm}%` }} /></div>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Why this area is flagged</p>
              <ul className="list-disc space-y-1 pl-4">{explain(area).map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          </section>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Estimated population exposed</dt><dd className="font-medium">{fmtNum(area.population)}</dd></div>
            <div><dt className="text-xs text-slate-500">Communication</dt><dd className="font-medium">{commLabel(area.commDisruption)} ({area.commDisruption}%)</dd></div>
            <div><dt className="text-xs text-slate-500">Last reliable verification</dt><dd className="font-medium">{area.lastVerifiedAt ? `${timeAgo(area.lastVerifiedAt)} (${fmtDate(area.lastVerifiedAt)})` : 'Never verified'}</dd></div>
            <div><dt className="text-xs text-slate-500">Reports received</dt><dd className="font-medium">{area.reports}</dd></div>
          </dl>

          {verifying ? (
            <VerifyForm area={area} onCancel={() => setVerifying(false)} onSubmit={(record) => { dispatch({ type: 'verify', id: area.id, record, now: Date.now() }); setVerifying(false); }} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <button className={btnPrimary} onClick={() => setVerifying(true)}><Radio size={14} />Record field verification</button>
              {(area.eff === 'unknown' || area.eff === 'verification_required') && (
                <button className={btnGhost} onClick={() => dispatch({ type: 'investigate', id: area.id, now: Date.now() })}><Search size={14} />Mark under investigation</button>
              )}
            </div>
          )}

          <section aria-label="Evidence">
            <h3 className="text-sm font-semibold text-slate-800">Evidence received ({area.evidence.length})</h3>
            {area.evidence.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">No incoming reports. This is a gap in information, not confirmation of safety.</p>
            ) : (
              <ul className="mt-2 space-y-2">{area.evidence.map((e) => (
                <li key={e.id} className="rounded border border-slate-200 p-2 text-sm"><span className="text-xs text-slate-500">{e.source} · {timeAgo(e.at)}</span><p>{e.text}</p></li>
              ))}</ul>
            )}
            <form onSubmit={logReport} className="mt-2 flex flex-wrap items-start gap-2" aria-label="Log incoming report">
              <label className="sr-only" htmlFor="rep-src">Report source</label>
              <select id="rep-src" value={rep.source} onChange={(e) => setRep({ ...rep, source: e.target.value })} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                {['SMS', 'Call', 'Radio', 'Field team'].map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="min-w-[10rem] flex-1">
                <label className="sr-only" htmlFor="rep-text">Report text</label>
                <input id="rep-text" value={rep.text} onChange={(e) => setRep({ ...rep, text: e.target.value, error: '' })} placeholder="Log an incoming report…" className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm" />
                {rep.error && <p role="alert" className="mt-1 text-xs text-red-600">{rep.error}</p>}
              </div>
              <button className={btnGhost}><MessageSquarePlus size={14} />Log</button>
            </form>
          </section>

          <section aria-label="Verification history">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><History size={14} />Verification history ({area.history.length})</h3>
            {area.history.length === 0 ? <p className="mt-1 text-sm text-slate-500">No verification attempts recorded.</p> : (
              <ul className="mt-2 space-y-2">{area.history.map((h) => (
                <li key={h.id} className="rounded border border-slate-200 p-2 text-sm">
                  <p className="font-medium">{OUTCOMES[h.outcome]} <span className="font-normal text-slate-500">· inspected {fmtDate(h.at)}</span></p>
                  <p>{h.summary}</p>
                  {h.conditions && <p className="text-slate-600">Conditions: {h.conditions}</p>}
                  {h.people > 0 && <p className="text-slate-600">People needing assistance: {fmtNum(h.people)}</p>}
                  {h.outcome === 'safe' && <p className="text-xs text-slate-500">Safe at that inspection time only.</p>}
                </li>
              ))}</ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}