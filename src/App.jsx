import { useEffect, useMemo, useReducer, useState } from 'react';
import { LayoutDashboard, RadioTower, ClipboardCheck, BookOpen, Search, Database, RotateCcw, PlayCircle } from 'lucide-react';
import { enrich } from './lib/priority';
import { SCENARIOS, reducer, loadActive, loadState, saveState, seedState, clearAll } from './lib/data';
import Overview from './components/Overview';
import Gaps from './components/Gaps';
import Verification from './components/Verification';
import Methodology from './components/Methodology';
import AreaPanel from './components/AreaPanel';
import { btnGhost, btnPrimary } from './components/ui';

const NAV = [
  ['overview', 'Overview', LayoutDashboard],
  ['gaps', 'Coverage Gaps', RadioTower],
  ['verification', 'Field Verification', ClipboardCheck],
  ['methodology', 'Methodology', BookOpen],
];

function Confirm({ title, body, action, onYes, onNo }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onNo(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onNo]);
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 p-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="cf-t" className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h2 id="cf-t" className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
        <div className="mt-4 flex justify-end gap-2"><button autoFocus className={btnGhost} onClick={onNo}>Cancel</button><button className={btnPrimary} onClick={onYes}>{action}</button></div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, () => loadState(loadActive()));
  const [view, setView] = useState('overview');
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => saveState(state), [state]);
  useEffect(() => { const k = (e) => e.key === 'Escape' && setPanel(null); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  const areas = useMemo(() => enrich(state.areas, now), [state.areas, now]);
  const ranked = useMemo(
    () => areas.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase())).sort((x, y) => y.score - x.score),
    [areas, query]
  );
  const open = (id, verify = false) => setPanel({ id, verify, k: Date.now() });
  const current = panel && areas.find((a) => a.id === panel.id);

  const switchScenario = (id) => { setPanel(null); dispatch({ type: 'load', state: loadState(id) }); };
  const onSearch = (v) => { setQuery(v); if (view !== 'overview' && view !== 'gaps') setView('gaps'); };
  const doConfirm = () => {
    setPanel(null);
    if (confirm === 'reset') { clearAll(); dispatch({ type: 'load', state: seedState('delta') }); }
    else dispatch({ type: 'load', state: seedState(state.scenarioId) });
    setQuery('');
    setConfirm(null);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-3 bg-slate-900 p-3 text-slate-200 md:min-h-screen md:w-60 md:p-4">
        <div><h1 className="text-lg font-semibold text-white">QuietZone</h1><p className="text-xs text-slate-400">Find the gaps before they become emergencies.</p></div>
        <nav aria-label="Main" className="grid grid-cols-2 gap-1 md:flex md:flex-col">
          {NAV.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${view === id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <div className="flex gap-2 md:mt-auto md:flex-col">
          <button onClick={() => setConfirm('demo')} className="flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"><PlayCircle size={16} />Load Demo Scenario</button>
          <button onClick={() => setConfirm('reset')} className="flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"><RotateCcw size={16} />Reset prototype</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div><label htmlFor="scn" className="sr-only">Disaster scenario</label>
            <select id="scn" value={state.scenarioId} onChange={(e) => switchScenario(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm">
              {Object.entries(SCENARIOS).map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}
            </select></div>
          <div className="relative min-w-[10rem] flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" /><label htmlFor="hq" className="sr-only">Search areas</label>
            <input id="hq" value={query} onChange={(e) => onSearch(e.target.value)} placeholder="Search areas…" className="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-2 text-sm" />
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"><Database size={12} />Demo data · synthetic</span>
        </header>
        <main className="p-4">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">{NAV.find((n) => n[0] === view)[1]}</h2>
          {view === 'overview' && <Overview areas={areas} ranked={ranked} activity={state.activity} scenarioId={state.scenarioId} now={now} onOpen={open} />}
          {view === 'gaps' && <Gaps areas={areas} query={query} setQuery={setQuery} now={now} onOpen={open} dispatch={dispatch} />}
          {view === 'verification' && <Verification areas={areas} now={now} onOpen={open} />}
          {view === 'methodology' && <Methodology />}
        </main>
      </div>

      {current && <AreaPanel key={panel.k} area={current} startVerify={panel.verify} onClose={() => setPanel(null)} dispatch={dispatch} />}
      {confirm && (
        <Confirm onNo={() => setConfirm(null)} onYes={doConfirm} action={confirm === 'reset' ? 'Reset everything' : 'Restore demo data'}
          title={confirm === 'reset' ? 'Reset the prototype?' : 'Load the demo scenario?'}
          body={confirm === 'reset' ? 'This erases all saved changes in every scenario and restores the original synthetic datasets.' : 'This replaces the current scenario with its original synthetic data. Verification records you added will be lost.'} />
      )}
    </div>
  );
}