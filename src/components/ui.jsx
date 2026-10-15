import { STATUS } from '../lib/priority';

export const LEVELS = {
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 border-red-200', color: '#dc2626' },
  high: { label: 'High', cls: 'bg-amber-50 text-amber-800 border-amber-200', color: '#d97706' },
  moderate: { label: 'Moderate', cls: 'bg-blue-50 text-blue-700 border-blue-200', color: '#2563eb' },
  low: { label: 'Low', cls: 'bg-slate-100 text-slate-600 border-slate-200', color: '#64748b' },
};
const STATUS_CLS = {
  unknown: 'bg-white text-slate-600 border-slate-400 border-dashed',
  verification_required: 'bg-amber-50 text-amber-800 border-amber-200',
  under_investigation: 'bg-blue-50 text-blue-700 border-blue-200',
  safe: 'bg-green-50 text-green-700 border-green-200',
  confirmed_emergency: 'bg-red-600 text-white border-red-700',
};

export const markerColor = (a) => (a.eff === 'safe' ? '#16a34a' : LEVELS[a.level].color);
export const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN');

export function timeAgo(iso, now = Date.now()) {
  if (!iso) return 'Never';
  const h = (now - Date.parse(iso)) / 3600000;
  if (Number.isNaN(h)) return 'Never';
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min ago`;
  if (h < 48) return `${Math.round(h)} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export const LevelBadge = ({ level }) => (
  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${LEVELS[level].cls}`}>{LEVELS[level].label}</span>
);
export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${STATUS_CLS[status]}`}>{STATUS[status]}</span>
);
export const Panel = ({ title, action, children, className = '' }) => (
  <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    {title && (
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {action}
      </header>
    )}
    {children}
  </section>
);
export const btn = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
export const btnPrimary = `${btn} bg-slate-900 text-white hover:bg-slate-700`;
export const btnGhost = `${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;