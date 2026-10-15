import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreArea, levelOf, effectiveStatus, maxPopulation, enrich } from './priority.js';

const NOW = Date.parse('2026-10-15T12:00:00Z');
const base = { severity: 5, population: 1000, commDisruption: 100, lastVerifiedAt: null };

test('maximum inputs score 100 and are critical', () => {
  const r = scoreArea(base, 1000, NOW);
  assert.equal(r.score, 100);
  assert.equal(r.level, 'critical');
});

test('formula matches hand calculation', () => {
  const a = { severity: 3, population: 500, commDisruption: 40, lastVerifiedAt: new Date(NOW - 36 * 3600000).toISOString() };
  // 0.4*60 + 0.2*50 + 0.25*40 + 0.15*50 = 24+10+10+7.5
  assert.equal(scoreArea(a, 1000, NOW).score, 51.5);
});

test('zero or missing values are safe', () => {
  const r = scoreArea({ severity: null, population: undefined, commDisruption: '' }, 0, NOW);
  assert.ok(Number.isFinite(r.score));
  assert.equal(maxPopulation([{ population: 0 }, { population: 0 }]), 0);
});

test('out-of-range inputs are clamped', () => {
  const r = scoreArea({ severity: 9, population: 5000, commDisruption: 250, lastVerifiedAt: null }, 1000, NOW);
  assert.equal(r.score, 100);
});

test('threshold boundaries', () => {
  assert.equal(levelOf(75), 'critical');
  assert.equal(levelOf(74.99), 'high');
  assert.equal(levelOf(50), 'high');
  assert.equal(levelOf(49.99), 'moderate');
  assert.equal(levelOf(25), 'moderate');
  assert.equal(levelOf(24.99), 'low');
});

test('zero reports never makes an area safe', () => {
  const [a] = enrich([{ ...base, reports: 0, status: 'unknown' }], NOW);
  assert.notEqual(a.eff, 'safe');
});

test('stale safe verification expires to Verification Required', () => {
  const fresh = { status: 'safe', lastVerifiedAt: new Date(NOW - 3 * 3600000).toISOString() };
  const stale = { status: 'safe', lastVerifiedAt: new Date(NOW - 30 * 3600000).toISOString() };
  assert.equal(effectiveStatus(fresh, NOW), 'safe');
  assert.equal(effectiveStatus(stale, NOW), 'verification_required');
});

test('high score never infers a confirmed emergency', () => {
  const [a] = enrich([{ ...base, reports: 50, status: 'verification_required' }], NOW);
  assert.equal(a.level, 'critical');
  assert.notEqual(a.eff, 'confirmed_emergency');
});