import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { markerColor, fmtNum, timeAgo, LEVELS } from './ui';
import { STATUS, commLabel, explain } from '../lib/priority';

function popupNode(a, onOpen) {
  const el = document.createElement('div');
  el.style.minWidth = '230px';
  const row = (k, v) => {
    const d = document.createElement('div');
    const b = document.createElement('b');
    b.textContent = `${k}: `;
    d.append(b, document.createTextNode(v));
    d.style.fontSize = '12px';
    return d;
  };
  const t = document.createElement('div');
  t.textContent = a.name;
  t.style.cssText = 'font-weight:600;font-size:14px;margin-bottom:4px';
  el.append(
    t,
    row('Hazard', `${a.hazard}, severity ${a.severity}/5`),
    row('Population exposed (est.)', fmtNum(a.population)),
    row('Communication', `${commLabel(a.commDisruption)} (${a.commDisruption}% disrupted)`),
    row('Last verified', a.lastVerifiedAt ? timeAgo(a.lastVerifiedAt) : 'Never'),
    row('Reports received', String(a.reports)),
    row('Status', STATUS[a.eff]),
    row('Priority score', `${a.score.toFixed(1)} (${LEVELS[a.level].label})`)
  );
  const why = document.createElement('p');
  why.textContent = `Why flagged: ${explain(a)[0]}`;
  why.style.cssText = 'font-size:12px;margin:6px 0;color:#475569';
  const b = document.createElement('button');
  b.textContent = 'Open details & verify';
  b.style.cssText = 'background:#0f172a;color:#fff;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer';
  b.onclick = () => onOpen(a.id);
  el.append(why, b);
  return el;
}

function FallbackMap({ areas, onOpen }) {
  const lats = areas.map((a) => a.lat), lngs = areas.map((a) => a.lng);
  const [minLa, maxLa, minLn, maxLn] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const x = (v) => 30 + ((v - minLn) / (maxLn - minLn || 1)) * 540;
  const y = (v) => 270 - ((v - minLa) / (maxLa - minLa || 1)) * 240;
  return (
    <svg viewBox="0 0 600 300" className="h-full w-full bg-slate-100" role="img" aria-label="Schematic overview of areas">
      {areas.map((a) => (
        <g key={a.id} onClick={() => onOpen(a.id)} className="cursor-pointer">
          <circle cx={x(a.lng)} cy={y(a.lat)} r="10" fill={markerColor(a)} fillOpacity="0.7" stroke="#fff" strokeWidth="2" />
          <text x={x(a.lng) + 13} y={y(a.lat) + 4} fontSize="10" fill="#334155">{a.name}</text>
        </g>
      ))}
    </svg>
  );
}

export default function MapView({ areas, onOpen }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null);
  const [tileFail, setTileFail] = useState(false);
  const [broken, setBroken] = useState(false);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => {
    try {
      map.current = L.map(el.current, { scrollWheelZoom: false });
      let errs = 0;
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 });
      tiles.on('tileerror', () => { errs += 1; if (errs > 3) setTileFail(true); });
      tiles.addTo(map.current);
      layer.current = L.layerGroup().addTo(map.current);
      const b = L.latLngBounds(areas.map((a) => [a.lat, a.lng])).pad(0.2);
      map.current.fitBounds(b);
    } catch (e) { console.error('QuietZone: map failed to initialise', e); setBroken(true); }
    return () => { map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    const maxPop = Math.max(1, ...areas.map((a) => a.population));
    areas.forEach((a) => {
      const color = markerColor(a);
      L.circleMarker([a.lat, a.lng], {
        radius: 9 + Math.sqrt(a.population / maxPop) * 13, color: a.eff === 'confirmed_emergency' ? '#7f1d1d' : color,
        weight: a.eff === 'confirmed_emergency' ? 4 : 2, dashArray: a.eff === 'unknown' ? '4 3' : null, fillColor: color, fillOpacity: 0.55,
      }).bindTooltip(tileFail ? a.name : `${a.name} — ${a.score.toFixed(0)}`, { permanent: tileFail, direction: 'right', offset: [8, 0] }).bindPopup(() => popupNode(a, (id) => openRef.current(id))).addTo(layer.current);
    });
  }, [areas, tileFail]);

  if (broken) return <div className="h-[420px]"><FallbackMap areas={areas} onOpen={onOpen} /></div>;
  return (
    <div>
      {tileFail && <p className="bg-amber-50 px-4 py-1.5 text-xs text-amber-800">Basemap tiles unavailable (offline?). Areas are still plotted at their coordinates.</p>}
      <div ref={el} className="h-[420px] w-full bg-slate-100" aria-label="Map of monitored areas" />
      <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2 text-xs text-slate-600">
        {[['#dc2626', 'Critical'], ['#d97706', 'High'], ['#2563eb', 'Moderate / Low'], ['#16a34a', 'Recently verified safe']].map(([c, l]) => (
          <li key={l} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</li>
        ))}
        <li>Dashed outline = Unknown · Heavy outline = Confirmed emergency · Size = exposed population</li>
      </ul>
    </div>
  );
}