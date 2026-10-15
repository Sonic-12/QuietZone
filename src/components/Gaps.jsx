import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Radio, Search } from 'lucide-react';
import { CONFIG, STATUS, commLabel } from '../lib/priority';
import { Panel, LevelBadge, StatusBadge, fmtNum, timeAgo, btnGhost } from './ui';

const sel = 'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm';

export default function Gaps({ areas, query, setQuery, now, onOpen, dispatch }) {
  const [level, setLevel] = useState('all');
  const [hazard, setHazard] = useState('all');
  const [status, setStatus] = useState('all');
  const [dir, setDir] = useState('desc');
  const hazards = [...new Set(areas.map((a) => a.hazard))];
  const rows = areas
    .filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((a) => level === 'all' || a.level === level)
    .filter((a) => hazard === 'all' || a.hazard === hazard)
    .filter((a) => status === 'all' || a.eff === status)
    .sort((x, y) => (dir === 'desc' ? y.score - x.score : x.score - y.score));
  const clear = () => { setQuery(''); setLevel('all'); setHazard('all'); setStatus('all'); };

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-end gap-3 p-4">
          <div><label htmlFor="g-q" className="block text-xs text-slate-500">Search area</label>
            <div className="relative"><Search size={14} className="absolute left-2 top-2.5 text-slate-400" /><input id="g-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Area name" className={`${sel} pl-7`} /></div></div>
          <div><label htmlFor="g-l" className="block text-xs text-slate-500">Priority level</label>
            <select id="g-l" className={sel} value={level} onChange={(e) => setLevel(e.target.value)}><option value="all">All levels</option>{['critical', 'high', 'moderate', 'low'].map((l) => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}</select></div>
          <div><label htmlFor="g-h" className="block text-xs text-slate-500">Hazard</label>
            <select id="g-h" className={sel} value={hazard} onChange={(e) => setHazard(e.target.value)}><option value="all">All hazards</option>{hazards.map((h) => <option key={h}>{h}</option>)}</select></div>
          <div><label htmlFor="g-s" className="block text-xs text-slate-500">Verification status</label>
            <select id="g-s" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <button className={btnGhost} onClick={clear}>Clear filters</button>
          <p className="ml-auto text-xs text-slate-500" aria-live="polite">{rows.length} of {areas.length} areas</p>
        </div>
        <details className="border-t border-slate-100 px-4 py-2 text-sm text-slate-600">
          <summary className="cursor-pointer text-xs font-medium text-slate-700">Prioritization settings (read-only)</summary>
          <p className="mt-2">Weights: hazard {CONFIG.weights.hazard}, population {CONFIG.weights.population}, communication {CONFIG.weights.communication}, verification age {CONFIG.weights.verificationAge}. Thresholds: Critical ≥ {CONFIG.thresholds.critical}, High ≥ {CONFIG.thresholds.high}, Moderate ≥ {CONFIG.thresholds.moderate}. Verification age saturates at {CONFIG.ageCapHours} h; a safe finding is shown as current for {CONFIG.freshHours} h. Heuristic values, not a validated model.</p>
        </details>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Area', 'Hazard', 'Exposed population', 'Communication', 'Last verified', 'Reports', null, 'Verification status', 'Actions'].map((h, i) => h === null ? (
                  <th key="score" scope="col" className="px-3 py-2" aria-sort={dir === 'desc' ? 'descending' : 'ascending'}>
                    <button onClick={() => setDir(dir === 'desc' ? 'asc' : 'desc')} className="inline-flex items-center gap-1 uppercase" aria-label="Sort by priority score">Priority score {dir === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}</button>
                  </th>
                ) : <th key={h} scope="col" className="px-3 py-2">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-800">{a.name}</td>
                  <td className="px-3 py-2">{a.hazard} <span className="text-xs text-slate-500">({a.severity}/5)</span></td>
                  <td className="px-3 py-2">{fmtNum(a.population)}</td>
                  <td className="px-3 py-2">{commLabel(a.commDisruption)} <span className="text-xs text-slate-500">({a.commDisruption}%)</span></td>
                  <td className="px-3 py-2">{timeAgo(a.lastVerifiedAt, now)}</td>
                  <td className="px-3 py-2">{a.reports}</td>
                  <td className="px-3 py-2"><span className="mr-1.5 font-semibold">{a.score.toFixed(1)}</span><LevelBadge level={a.level} /></td>
                  <td className="px-3 py-2"><StatusBadge status={a.eff} />{a.staleSafe && <span className="mt-0.5 block text-xs text-amber-700">Last safe finding expired</span>}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <button className={btnGhost} onClick={() => onOpen(a.id)} aria-label={`Details for ${a.name}`}><Eye size={14} />Details</button>
                      <button className={btnGhost} onClick={() => { if (a.eff === 'unknown' || a.eff === 'verification_required') dispatch({ type: 'investigate', id: a.id, now: Date.now() }); onOpen(a.id, true); }} aria-label={`Investigate ${a.name}`}><Radio size={14} />Investigate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No areas match these filters. <button className="underline" onClick={clear}>Clear filters</button></p>}
        </div>
      </Panel>
    </div>
  );
}