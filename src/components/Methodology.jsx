import { CONFIG, STATUS } from '../lib/priority';
import { Panel } from './ui';

const H = ({ children }) => <h3 className="mb-1 mt-5 text-sm font-semibold text-slate-900 first:mt-0">{children}</h3>;
const P = ({ children }) => <p className="text-sm leading-relaxed text-slate-700">{children}</p>;

export default function Methodology() {
  const w = CONFIG.weights;
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        QuietZone is an experimental decision-support prototype using illustrative data. Its scores are heuristic prioritization indicators, not validated predictions. It is not connected to official emergency services and must not be used as the sole basis for real-world rescue allocation.
      </div>
      <Panel>
        <div className="p-5">
          <H>Why reporting gaps matter</H>
          <P>During a disaster, communities that can still call or message become visible. Those that lose power, towers or access may go quiet. Counting reports alone ranks the loudest areas first and can hide the most cut-off ones. No reports does not mean no risk. Unknown does not mean safe.</P>
          <H>Signals considered</H>
          <P>Four separate signals: hazard severity (1–5), estimated population exposed, estimated communication disruption (0–100%), and hours since the last reliable field verification. Incoming report counts are displayed as evidence but are deliberately not part of the score, and a lack of reports is never used as proof of communication failure.</P>
          <H>Prioritization formula</H>
          <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{`Priority = ${w.hazard} × Hazard + ${w.population} × Population + ${w.communication} × Communication + ${w.verificationAge} × VerificationAge

Hazard         = severity / 5 × 100
Population     = population / max population in dataset × 100  (0 if max is 0)
Communication  = disruption %
VerificationAge= min(hours since verification / ${CONFIG.ageCapHours}, 1) × 100
                 (never verified = 100)
Result is clamped to 0–100.`}</pre>
          <H>Priority categories</H>
          <P>Critical ≥ {CONFIG.thresholds.critical}; High ≥ {CONFIG.thresholds.high}; Moderate ≥ {CONFIG.thresholds.moderate}; Low below that. A category says how urgently an area should be checked. It does not say an emergency is happening.</P>
          <H>How field verification changes status</H>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li><b>Safe at time of inspection</b> → {STATUS.safe}. This holds only for the inspection time and is shown as current for {CONFIG.freshHours} h, after which the area returns to {STATUS.verification_required}.</li>
            <li><b>Assistance required</b> → {STATUS.confirmed_emergency}. Only an operator-entered verification can set this.</li>
            <li><b>Further investigation required</b> → {STATUS.under_investigation}.</li>
            <li><b>Unable to verify</b> → recorded in history; the area is not marked safe and the verification clock is not reset.</li>
            <li>A new incoming report on a safe or unknown area changes it to {STATUS.verification_required}. It never creates a confirmed emergency.</li>
          </ul>
          <H>Why zero reports cannot establish safety</H>
          <P>Silence can mean safety, or it can mean people cannot reach a phone. Without verification the two look identical, so a quiet area stays unknown until someone checks.</P>
          <H>What QuietZone cannot determine</H>
          <P>It cannot validate its inputs, measure real network outages, predict outcomes, or replace field judgement. Weights and thresholds are untested heuristics. All records in this demo are synthetic. No machine learning or AI is used: the score is a fixed, deterministic formula.</P>
        </div>
      </Panel>
    </div>
  );
}