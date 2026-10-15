// Prioritization logic. Heuristic verification priority, NOT an emergency probability.
export const CONFIG = {
  weights: { hazard: 0.4, population: 0.2, communication: 0.25, verificationAge: 0.15 },
  thresholds: { critical: 75, high: 50, moderate: 25 },
  ageCapHours: 72, // verification age saturates at this many hours
  freshHours: 12, // a "safe" finding is only displayed as current inside this window
};

export const STATUS = {
  unknown: 'Unknown',
  verification_required: 'Verification Required',
  under_investigation: 'Under Investigation',
  safe: 'Recently Verified Safe',
  confirmed_emergency: 'Confirmed Emergency',
};

export const OUTCOMES = {
  safe: 'Safe at time of inspection',
  assistance: 'Assistance required',
  unable: 'Unable to verify',
  further: 'Further investigation required',
};

const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
const num = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? 0 : Number(v));

export function hoursSince(iso, now = Date.now()) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : Math.max(0, (now - t) / 3600000);
}

export const maxPopulation = (areas) => Math.max(0, ...areas.map((a) => num(a.population)));

export function levelOf(score, cfg = CONFIG) {
  if (score >= cfg.thresholds.critical) return 'critical';
  if (score >= cfg.thresholds.high) return 'high';
  if (score >= cfg.thresholds.moderate) return 'moderate';
  return 'low';
}

export function scoreArea(area, maxPop, now = Date.now(), cfg = CONFIG) {
  const h = hoursSince(area.lastVerifiedAt, now);
  const w = cfg.weights;
  const inputs = [
    { key: 'hazard', label: 'Hazard severity', raw: `${num(area.severity)} / 5`, norm: clamp((num(area.severity) / 5) * 100), weight: w.hazard },
    { key: 'population', label: 'Population exposed', raw: num(area.population).toLocaleString('en-IN'), norm: maxPop > 0 ? clamp((num(area.population) / maxPop) * 100) : 0, weight: w.population },
    { key: 'communication', label: 'Communication disruption', raw: `${num(area.commDisruption)}%`, norm: clamp(num(area.commDisruption)), weight: w.communication },
    {
      key: 'verificationAge',
      label: 'Verification age',
      raw: h === null ? 'never verified' : `${Math.round(h)} h`,
      norm: h === null ? 100 : clamp(Math.min(h / cfg.ageCapHours, 1) * 100),
      weight: w.verificationAge,
    },
  ].map((f) => ({ ...f, points: f.norm * f.weight }));
  const score = Math.round(clamp(inputs.reduce((s, f) => s + f.points, 0)) * 100) / 100;
  return { score, level: levelOf(score, cfg), factors: inputs, hours: h };
}

// A stale "safe" finding must not keep implying safety.
export function effectiveStatus(area, now = Date.now(), cfg = CONFIG) {
  if (area.status === 'safe') {
    const h = hoursSince(area.lastVerifiedAt, now);
    return h !== null && h <= cfg.freshHours ? 'safe' : 'verification_required';
  }
  return STATUS[area.status] ? area.status : 'unknown';
}

export function commLabel(pct) {
  const v = num(pct);
  if (v >= 85) return 'Largely offline';
  if (v >= 60) return 'Severely disrupted';
  if (v >= 25) return 'Degraded';
  return 'Normal';
}

export function enrich(areas, now = Date.now(), cfg = CONFIG) {
  const mp = maxPopulation(areas);
  return areas.map((a) => {
    const calc = scoreArea(a, mp, now, cfg);
    const eff = effectiveStatus(a, now, cfg);
    const staleSafe = a.status === 'safe' && eff !== 'safe';
    return { ...a, calc, eff, staleSafe, score: calc.score, level: calc.level };
  });
}

export function explain(a, cfg = CONFIG) {
  const lines = [];
  const top = [...a.calc.factors].sort((x, y) => y.points - x.points).slice(0, 2);
  lines.push(
    `Priority ${a.score.toFixed(1)} (${a.level}). Largest contributors: ${top.map((f) => `${f.label.toLowerCase()} (${f.points.toFixed(1)} pts)`).join(' and ')}.`
  );
  if (a.commDisruption >= 60) lines.push(`Estimated communication disruption is ${a.commDisruption}%, so silence from this area is weak evidence of safety.`);
  if (a.lastVerifiedAt === null || a.lastVerifiedAt === undefined) lines.push('No reliable field verification is on record; it is scored as maximum verification age.');
  else if (a.staleSafe) lines.push(`The last reliable verification was ${Math.round(a.calc.hours)} h ago. It has aged out and no longer supports a safe status.`);
  else if (a.eff === 'safe') lines.push(`Verified safe ${Math.round(a.calc.hours)} h ago. This holds only for that inspection time.`);
  if (a.reports === 0) lines.push('0 reports received. This is not treated as evidence of safety.');
  else lines.push(`${a.reports} report(s) received. Report volume is shown as evidence but is not part of the score.`);
  if (a.eff === 'confirmed_emergency') lines.push('Emergency was confirmed by an operator-entered field verification, not inferred from the score.');
  return lines;
}