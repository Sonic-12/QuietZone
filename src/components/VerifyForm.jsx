import { useState } from 'react';
import { OUTCOMES } from '../lib/priority';
import { btnPrimary, btnGhost } from './ui';

const pad = (n) => String(n).padStart(2, '0');
const localNow = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

export default function VerifyForm({ area, onSubmit, onCancel }) {
  const [f, setF] = useState({ summary: '', conditions: '', people: '0', outcome: '', at: localNow() });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const er = {};
    const people = Number(f.people);
    const t = Date.parse(f.at);
    if (f.summary.trim().length < 10) er.summary = 'Enter a field report summary (at least 10 characters).';
    if (!f.conditions.trim()) er.conditions = 'Describe the observed conditions.';
    if (!f.outcome) er.outcome = 'Select a verification outcome.';
    if (f.people === '' || !Number.isInteger(people) || people < 0 || people > 1000000) er.people = 'Enter a whole number, 0 or more.';
    else if (f.outcome === 'assistance' && people < 1) er.people = 'Assistance required needs at least 1 person.';
    else if (f.outcome === 'safe' && people > 0) er.people = 'A "safe" outcome cannot list people needing assistance.';
    if (Number.isNaN(t)) er.at = 'Enter a valid inspection time.';
    else if (t > Date.now() + 60000) er.at = 'Inspection time cannot be in the future.';
    setErr(er);
    if (Object.keys(er).length) return;
    onSubmit({ id: `v${Date.now().toString(36)}`, at: new Date(t).toISOString(), recordedAt: new Date().toISOString(), outcome: f.outcome, summary: f.summary.trim(), conditions: f.conditions.trim(), people });
  }

  const field = 'mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const E = ({ k }) => (err[k] ? <p role="alert" className="mt-1 text-xs text-red-600">{err[k]}</p> : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-4" aria-label={`Record field verification for ${area.name}`}>
      <h3 className="text-sm font-semibold text-slate-800">Record field verification</h3>
      <div>
        <label htmlFor="vf-summary" className="text-xs font-medium text-slate-700">Field report summary</label>
        <textarea id="vf-summary" rows={2} className={field} value={f.summary} onChange={set('summary')} aria-invalid={!!err.summary} />
        <E k="summary" />
      </div>
      <div>
        <label htmlFor="vf-cond" className="text-xs font-medium text-slate-700">Observed conditions</label>
        <textarea id="vf-cond" rows={2} className={field} value={f.conditions} onChange={set('conditions')} aria-invalid={!!err.conditions} />
        <E k="conditions" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vf-people" className="text-xs font-medium text-slate-700">People needing assistance (est.)</label>
          <input id="vf-people" type="number" min="0" step="1" className={field} value={f.people} onChange={set('people')} aria-invalid={!!err.people} />
          <E k="people" />
        </div>
        <div>
          <label htmlFor="vf-at" className="text-xs font-medium text-slate-700">Inspection time</label>
          <input id="vf-at" type="datetime-local" className={field} value={f.at} max={localNow()} onChange={set('at')} aria-invalid={!!err.at} />
          <E k="at" />
        </div>
      </div>
      <fieldset>
        <legend className="text-xs font-medium text-slate-700">Verification outcome</legend>
        <div className="mt-1 space-y-1">
          {Object.entries(OUTCOMES).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="outcome" value={k} checked={f.outcome === k} onChange={set('outcome')} /> {label}
            </label>
          ))}
        </div>
        <E k="outcome" />
      </fieldset>
      <p className="text-xs text-slate-600">
        "Safe at time of inspection" is true only at the recorded inspection time. It expires from the dashboard after 12 hours. "Unable to verify" and "Further investigation" do not reset the verification clock.
      </p>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>Submit verification</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
      </div>
    </form>
  );
}