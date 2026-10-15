import { AlertTriangle, Siren, Users, ShieldCheck, Activity } from 'lucide-react';
import MapView from './MapView';
import { Panel, LevelBadge, StatusBadge, fmtNum, timeAgo } from './ui';

export function summarize(areas) {
  const needs = areas.filter((a) => a.eff === 'unknown' || a.eff === 'verification_required');
  return {
    verify: needs.length,
    critical: areas.filter((a) => a.level === 'critical').length,
    // Population in areas that are not currently verified safe
    exposed: areas.filter((a) => a.eff !== 'safe').reduce((s, a) => s + a.population, 0),
    verified: areas.filter((a) => a.eff === 'safe').length,
  };
}

function Card({ icon: Icon, label, value, note, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><p className="text-xs font-medium text-slate-500">{label}</p><Icon size={16} className={tone} /></div>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function ReportGap({ areas, onOpen }) {
  const byReports = [...areas].sort((x, y) => y.reports - x.reports).slice(0, 5);
  const byPriority = [...areas].sort((x, y) => y.score - x.score).slice(0, 5);
  const repIds = new Set(byReports.map((a) => a.id));
  const missed = byPriority.filter((a) => !repIds.has(a.id));
  const item = (a, flag) => (
    <li key={a.id}>
      <button onClick={() => onOpen(a.id)} className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${flag ? 'bg-red-50/60' : ''}`}>
        <span className="truncate">{a.name}</span><span className="whitespace-nowrap text-xs text-slate-500">{a.reports} reports · {a.score.toFixed(0)} pts</span>
      </button>
    </li>
  );
  return (
    <Panel title="Why report counts alone are not enough">
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Top 5 by reports received</p><ol className="space-y-0.5">{byReports.map((a) => item(a, false))}</ol></div>
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Top 5 by QuietZone priority</p><ol className="space-y-0.5">{byPriority.map((a) => item(a, !repIds.has(a.id)))}</ol></div>
      </div>
      <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-700" aria-live="polite">
        {missed.length === 0 ? 'Both rankings currently agree. Verification and communication signals can still change that.' : <>A report-count ranking would miss <b>{missed.length}</b> of the top 5 priority areas ({missed.map((a) => a.name).join(', ')}). They are highlighted: little or no reporting, yet high hazard, exposure, disruption or verification age.</>}
      </p>
    </Panel>
  );
}

export default function Overview({ areas, ranked, activity, scenarioId, now, onOpen }) {
  const s = summarize(areas);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card icon={AlertTriangle} tone="text-amber-600" label="Areas Requiring Verification" value={s.verify} note="Unknown or verification required" />
        <Card icon={Siren} tone="text-red-600" label="Critical-Priority Areas" value={s.critical} note="Priority score 75 or above" />
        <Card icon={Users} tone="text-blue-600" label="Estimated Population Exposed" value={fmtNum(s.exposed)} note="Areas not currently verified safe" />
        <Card icon={ShieldCheck} tone="text-green-600" label="Areas Recently Verified" value={s.verified} note="Safe finding within last 12 h" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Affected areas (synthetic data)" className="overflow-hidden xl:col-span-2">
          <MapView key={scenarioId} areas={areas} onOpen={onOpen} />
        </Panel>
        <Panel title="Verification priority ranking">
          {ranked.length === 0 ? <p className="p-4 text-sm text-slate-500">No areas match your search.</p> : (
            <ol className="max-h-[470px] divide-y divide-slate-100 overflow-y-auto">
              {ranked.map((a, i) => (
                <li key={a.id}>
                  <button onClick={() => onOpen(a.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus:outline-none">
                    <span className="w-5 text-xs text-slate-400">{i + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{a.name}</span><span className="mt-0.5 flex items-center gap-1.5"><StatusBadge status={a.eff} /></span></span>
                    <span className="text-right"><span className="block text-sm font-semibold">{a.score.toFixed(1)}</span><LevelBadge level={a.level} /></span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
      <ReportGap areas={areas} onOpen={onOpen} />
      <Panel title="Recent activity" action={<Activity size={14} className="text-slate-400" />}>
        {activity.length === 0 ? <p className="p-4 text-sm text-slate-500">No activity yet.</p> : (
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {activity.slice(0, 12).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <span className="text-slate-700">{e.text}</span><span className="whitespace-nowrap text-xs text-slate-400">{timeAgo(e.at, now)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}