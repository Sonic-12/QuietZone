import { Panel, StatusBadge, LevelBadge, timeAgo, fmtNum, btnPrimary, btnGhost } from './ui';
import { OUTCOMES } from '../lib/priority';

export default function Verification({ areas, now, onOpen }) {
  const queue = areas.filter((a) => ['unknown', 'verification_required', 'under_investigation'].includes(a.eff)).sort((x, y) => y.score - x.score);
  const log = areas.flatMap((a) => a.history.map((h) => ({ ...h, area: a }))).sort((x, y) => Date.parse(y.recordedAt) - Date.parse(x.recordedAt)).slice(0, 15);
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title={`Verification queue (${queue.length})`}>
        {queue.length === 0 ? <p className="p-4 text-sm text-slate-500">No areas are waiting for verification. Remember that safe findings expire after 12 hours.</p> : (
          <ul className="divide-y divide-slate-100">
            {queue.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{a.name}</p><p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500"><StatusBadge status={a.eff} /><LevelBadge level={a.level} />{fmtNum(a.population)} people · {a.reports} reports · verified {timeAgo(a.lastVerifiedAt, now)}</p></div>
                <span className="text-sm font-semibold">{a.score.toFixed(1)}</span>
                <button className={btnPrimary} onClick={() => onOpen(a.id, true)}>Verify</button>
                <button className={btnGhost} onClick={() => onOpen(a.id)}>Details</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Recent verification records">
        {log.length === 0 ? <p className="p-4 text-sm text-slate-500">No verification records yet.</p> : (
          <ul className="divide-y divide-slate-100">
            {log.map((h) => (
              <li key={h.id} className="px-4 py-3 text-sm">
                <button className="text-left font-medium hover:underline" onClick={() => onOpen(h.area.id)}>{h.area.name}</button>
                <span className="text-slate-500"> · {OUTCOMES[h.outcome]} · {timeAgo(h.at, now)}</span>
                <p className="text-slate-600">{h.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}