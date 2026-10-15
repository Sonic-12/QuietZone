import { enrich, OUTCOMES, STATUS, levelOf } from './priority.js';

// All records below are SYNTHETIC and fictional.
export const SCENARIOS = {
  delta: {
    name: 'Delta River Flood (synthetic)',
    center: [20.45, 86.55],
    rows: [
      { id: 'a1', name: 'Kuldiha Basin', hazard: 'Flood', sev: 5, pop: 20800, comm: 50, rep: 47, status: 'verification_required', ver: 30, lat: 20.52, lng: 86.4,
        ev: [[2, 'SMS', 'Water at roof level near the school road.'], [3, 'Call', 'Family stranded on temple platform.'], [5, 'SMS', 'Boats needed at ward 3.']],
        hist: [[30, 'safe', 'Pre-flood check: shelters stocked, embankment intact.', 0]] },
      { id: 'a2', name: 'Sundarpur Char', hazard: 'Flood', sev: 4, pop: 14500, comm: 88, rep: 0, status: 'unknown', ver: null, lat: 20.36, lng: 86.72, ev: [], hist: [] },
      { id: 'a3', name: 'Rajnagar Ward 7', hazard: 'Flood', sev: 3, pop: 6200, comm: 10, rep: 1, status: 'safe', ver: 52, lat: 20.6, lng: 86.62,
        ev: [[20, 'Call', 'Road partly waterlogged, passable.']],
        hist: [[52, 'safe', 'Ward dry, residents accounted for.', 0]] },
      { id: 'a4', name: 'Bhaskar Nagar', hazard: 'Flood', sev: 2, pop: 9800, comm: 8, rep: 2, status: 'safe', ver: 3, lat: 20.3, lng: 86.45, ev: [],
        hist: [[3, 'safe', 'Embankment holding; shelters dry; headcount complete.', 0]] },
      { id: 'a5', name: 'Telkoi Hamlets', hazard: 'Flood', sev: 4, pop: 7400, comm: 72, rep: 2, status: 'verification_required', ver: 40, lat: 20.25, lng: 86.62,
        ev: [[11, 'Radio', 'Intermittent relay: "water rising, no boats."']],
        hist: [[9, 'unable', 'Boat team turned back; channel blocked by debris.', 0], [40, 'safe', 'Routine check before rains.', 0]] },
      { id: 'a6', name: 'Pattamundai Low Ward', hazard: 'Flood', sev: 5, pop: 11300, comm: 55, rep: 12, status: 'confirmed_emergency', ver: 5, lat: 20.43, lng: 86.76,
        ev: [[6, 'Call', 'Elderly residents trapped upstairs.'], [7, 'SMS', 'Shelter roof leaking, 40 people inside.']],
        hist: [[5, 'assistance', 'Field team confirmed trapped families; rescue boats requested.', 120]] },
      { id: 'a7', name: 'Aul Embankment Villages', hazard: 'Flood', sev: 2, pop: 4200, comm: 30, rep: 1, status: 'verification_required', ver: null, lat: 20.55, lng: 86.3,
        ev: [[18, 'SMS', 'Seepage seen on embankment, single report.']], hist: [] },
      { id: 'a8', name: 'Marshaghai Fishing Colony', hazard: 'Storm Surge', sev: 4, pop: 8900, comm: 92, rep: 0, status: 'unknown', ver: null, lat: 20.2, lng: 86.82, ev: [], hist: [] },
      { id: 'a9', name: 'Derabish Town Centre', hazard: 'Flood', sev: 2, pop: 21000, comm: 5, rep: 14, status: 'safe', ver: 8, lat: 20.47, lng: 86.5,
        ev: [[9, 'SMS', 'Street flooding near market.'], [10, 'SMS', 'Drain overflow, ankle-deep water.']],
        hist: [[8, 'safe', 'Minor street flooding only; no one in need.', 0]] },
      { id: 'a10', name: 'Gop Riverside Camp', hazard: 'Flood', sev: 3, pop: 3100, comm: 60, rep: 3, status: 'under_investigation', ver: null, lat: 20.33, lng: 86.3,
        ev: [[4, 'Call', 'Camp cut off from main road.']], hist: [] },
    ],
  },
  cyclone: {
    name: 'Cyclone Landfall, Coastal Belt (synthetic)',
    center: [19.85, 85.95],
    rows: [
      { id: 'b1', name: 'Konark Shore Hamlets', hazard: 'Cyclone', sev: 5, pop: 12400, comm: 80, rep: 3, status: 'verification_required', ver: null, lat: 19.9, lng: 86.1, ev: [[3, 'Radio', 'Roofs lost, relay cut mid-message.']], hist: [] },
      { id: 'b2', name: 'Astaranga Fishing Belt', hazard: 'Storm Surge', sev: 5, pop: 9700, comm: 95, rep: 0, status: 'unknown', ver: null, lat: 19.97, lng: 86.28, ev: [], hist: [] },
      { id: 'b3', name: 'Satapada Lagoon Villages', hazard: 'Storm Surge', sev: 4, pop: 6800, comm: 45, rep: 8, status: 'under_investigation', ver: 20, lat: 19.67, lng: 85.9,
        ev: [[5, 'SMS', 'Surge crossing the lagoon road.']], hist: [[20, 'further', 'Access road partly cut; one hamlet unreachable.', 0]] },
      { id: 'b4', name: 'Brahmagiri Inland Ward', hazard: 'Cyclone', sev: 3, pop: 5400, comm: 20, rep: 2, status: 'safe', ver: 2, lat: 19.8, lng: 85.7, ev: [],
        hist: [[2, 'safe', 'Wind damage minor; power out, shelters fine.', 0]] },
      { id: 'b5', name: 'Nimapara Shelter Zone', hazard: 'Cyclone', sev: 4, pop: 15900, comm: 35, rep: 21, status: 'confirmed_emergency', ver: 4, lat: 19.78, lng: 85.8,
        ev: [[5, 'Call', 'Shelter roof partly collapsed.'], [6, 'SMS', 'Injured residents need transport.']],
        hist: [[4, 'assistance', 'Partial roof collapse confirmed; 60 people need relocation.', 60]] },
      { id: 'b6', name: 'Kakatpur Delta Edge', hazard: 'Storm Surge', sev: 3, pop: 7100, comm: 70, rep: 0, status: 'safe', ver: 55, lat: 19.95, lng: 86.0, ev: [],
        hist: [[55, 'safe', 'Pre-landfall evacuation check complete.', 0]] },
      { id: 'b7', name: 'Puri Old Town Lanes', hazard: 'Cyclone', sev: 2, pop: 14200, comm: 10, rep: 11, status: 'safe', ver: 6, lat: 19.81, lng: 85.83,
        ev: [[7, 'SMS', 'Fallen trees blocking lanes.']], hist: [[6, 'safe', 'Debris only; no injuries found.', 0]] },
      { id: 'b8', name: 'Chilika Mouth Islets', hazard: 'Storm Surge', sev: 4, pop: 2600, comm: 90, rep: 0, status: 'verification_required', ver: null, lat: 19.72, lng: 85.65, ev: [], hist: [] },
    ],
  },
};

const iso = (now, h) => new Date(now - h * 3600000).toISOString();
let seq = 0;
export const uid = (p = 'x') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

function buildAreas(rows, now) {
  return rows.map((r) => ({
    id: r.id, name: r.name, hazard: r.hazard, severity: r.sev, population: r.pop, commDisruption: r.comm, reports: r.rep,
    status: r.status, lat: r.lat, lng: r.lng, lastVerifiedAt: r.ver === null ? null : iso(now, r.ver),
    evidence: r.ev.map(([h, source, text], i) => ({ id: `${r.id}-e${i}`, at: iso(now, h), source, text })),
    history: r.hist.map(([h, outcome, summary, people], i) => ({ id: `${r.id}-h${i}`, at: iso(now, h), recordedAt: iso(now, h), outcome, summary, conditions: '', people })).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
  }));
}

export function seedState(scenarioId, now = Date.now()) {
  const sc = SCENARIOS[scenarioId];
  const areas = buildAreas(sc.rows, now);
  const activity = [];
  enrich(areas, now).forEach((a) => {
    a.history.forEach((h) => activity.push({ id: uid('ev'), at: h.at, areaId: a.id, type: 'verification', text: `${a.name}: field verification recorded (${OUTCOMES[h.outcome]})` }));
    if (a.level === 'critical') activity.push({ id: uid('ev'), at: iso(now, 1), areaId: a.id, type: 'flag', text: `${a.name}: flagged Critical priority for verification` });
  });
  activity.sort((x, y) => Date.parse(y.at) - Date.parse(x.at));
  return { scenarioId, areas, activity: activity.slice(0, 40) };
}

const KEY = (id) => `quietzone.v1.${id}`;
const ACTIVE = 'quietzone.v1.active';

export function loadActive() {
  try {
    const id = localStorage.getItem(ACTIVE);
    return SCENARIOS[id] ? id : 'delta';
  } catch { return 'delta'; }
}

export function loadState(scenarioId) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY(scenarioId)));
    const ok = raw && Array.isArray(raw.areas) && raw.areas.length && raw.areas.every((a) => a && typeof a.id === 'string' && typeof a.name === 'string' && Array.isArray(a.history) && Array.isArray(a.evidence));
    if (ok) return { scenarioId, areas: raw.areas, activity: Array.isArray(raw.activity) ? raw.activity : [] };
  } catch (e) { console.warn('QuietZone: saved data unreadable, loading demo data.', e); }
  return seedState(scenarioId);
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY(state.scenarioId), JSON.stringify({ areas: state.areas, activity: state.activity }));
    localStorage.setItem(ACTIVE, state.scenarioId);
  } catch (e) { console.warn('QuietZone: could not save to LocalStorage.', e); }
}

export function clearAll() {
  try { Object.keys(SCENARIOS).forEach((id) => localStorage.removeItem(KEY(id))); localStorage.removeItem(ACTIVE); } catch { /* storage unavailable */ }
}

const levels = (areas, now) => Object.fromEntries(enrich(areas, now).map((a) => [a.id, { level: a.level, eff: a.eff }]));

function withEvents(state, areas, now, extra) {
  const before = levels(state.areas, now);
  const after = enrich(areas, now);
  const events = [...extra];
  after.forEach((a) => {
    const b = before[a.id];
    if (!b) return;
    if (b.eff !== a.eff) events.push({ id: uid('ev'), at: new Date(now).toISOString(), areaId: a.id, type: 'status', text: `${a.name}: status changed ${STATUS[b.eff]} → ${STATUS[a.eff]}` });
    if (b.level !== a.level && a.level === 'critical') events.push({ id: uid('ev'), at: new Date(now).toISOString(), areaId: a.id, type: 'flag', text: `${a.name}: flagged Critical priority for verification` });
  });
  return { ...state, areas, activity: [...events.reverse(), ...state.activity].slice(0, 60) };
}

export function reducer(state, action) {
  const { now = Date.now() } = action;
  const at = new Date(now).toISOString();
  const area = state.areas.find((a) => a.id === action.id);
  switch (action.type) {
    case 'load': return action.state;
    case 'investigate': {
      if (!area || area.status === 'under_investigation' || area.status === 'confirmed_emergency') return state;
      const areas = state.areas.map((a) => (a.id === area.id ? { ...a, status: 'under_investigation' } : a));
      return withEvents(state, areas, now, []);
    }
    case 'report': {
      if (!area) return state;
      const ev = { id: uid('r'), at, source: action.source, text: action.text };
      const areas = state.areas.map((a) => (a.id !== area.id ? a : {
        ...a, reports: a.reports + 1, evidence: [ev, ...a.evidence],
        // A new report never confirms an emergency; it only asks for (re)verification.
        status: a.status === 'unknown' || a.status === 'safe' ? 'verification_required' : a.status,
      }));
      return withEvents(state, areas, now, [{ id: uid('ev'), at, areaId: area.id, type: 'report', text: `${area.name}: new report logged (${action.source})` }]);
    }
    case 'verify': {
      if (!area) return state;
      const r = action.record;
      const reliable = r.outcome === 'safe' || r.outcome === 'assistance';
      const history = [r, ...area.history].sort((x, y) => Date.parse(y.at) - Date.parse(x.at));
      const isLatest = history[0].id === r.id;
      const lastVerifiedAt = reliable && (!area.lastVerifiedAt || Date.parse(r.at) > Date.parse(area.lastVerifiedAt)) ? r.at : area.lastVerifiedAt;
      let status = area.status;
      if (isLatest) {
        if (r.outcome === 'safe') status = 'safe';
        else if (r.outcome === 'assistance') status = 'confirmed_emergency';
        else if (r.outcome === 'further') status = 'under_investigation';
        else if (status === 'unknown') status = 'verification_required';
      }
      const areas = state.areas.map((a) => (a.id === area.id ? { ...a, history, lastVerifiedAt, status } : a));
      return withEvents(state, areas, now, [{ id: uid('ev'), at, areaId: area.id, type: 'verification', text: `${area.name}: field verification recorded (${OUTCOMES[r.outcome]})` }]);
    }
    default: return state;
  }
}