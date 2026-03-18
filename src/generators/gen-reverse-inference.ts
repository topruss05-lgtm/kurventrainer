import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { IdentifyPointsExercise } from '../types/exercise.js';

// R\u00fcckschluss-Trainer: Vom f'-Graph auf Monotonie von f schlie\u00dfen.
// Nur Monotonie-Stoff — keine Extrema-Terminologie (HP/TP/SP).
// Bildungsplan BW Kompetenz (23): "vom Graphen der Ableitungsfunktion auf den
// Graphen der Funktion schlie\u00dfen und umgekehrt"

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return 'gen-rev-' + Math.random().toString(36).slice(2, 9);
}

function formatPolynomial(coeffs: number[]): string {
  const startDeg = coeffs.length - 1;
  const parts: string[] = [];
  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const deg = startDeg - i;
    if (c === 0) continue;
    let term = '';
    if (parts.length === 0) {
      if (c < 0) term += '-';
    } else {
      term += c > 0 ? ' + ' : ' - ';
    }
    const absC = Math.abs(c);
    if (deg === 0) term += `${absC}`;
    else if (absC === 1) term += deg === 1 ? 'x' : `x^{${deg}}`;
    else term += deg === 1 ? `${absC}x` : `${absC}x^{${deg}}`;
    parts.push(term);
  }
  return parts.length === 0 ? '0' : parts.join('');
}

function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (const c of coeffs) result = result * x + c;
  return result;
}

// ─── Case 1: f' linear → 2 Intervalle klassifizieren (vorgegeben) ───
// f' ist eine Gerade mit einer Nullstelle → f hat genau einen Monotoniewechsel

function genRevLinearClassify(): IdentifyPointsExercise {
  const x0 = pick([-3, -2, -1, 0, 1, 2, 3]);
  const a = pick([2, -2, 3, -3]);
  const b = -a * x0;
  const fPrimeCoeffs = [a, b];
  const fn = (x: number) => evalPoly(fPrimeCoeffs, x);
  const latex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  const leftType: 'smw' | 'smf' = a > 0 ? 'smf' : 'smw';
  const rightType: 'smw' | 'smf' = a > 0 ? 'smw' : 'smf';

  return {
    id: uid(),
    type: 'identify-points',
    module: 'monotonie',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Der Graph zeigt f\u2019. Wo ist f steigend, wo fallend?',
    targets: [],
    intervalBounds: [x0],
    includeInfinity: true,
    intervalCount: 2,
    correctIntervals: [
      { from: '-\u221e', to: x0, type: leftType },
      { from: x0, to: '+\u221e', type: rightType },
    ],
    feedbackExplanation:
      `f\u2019 hat eine Nullstelle bei x = ${x0}. ` +
      `Links davon ist f\u2019 ${a > 0 ? 'negativ' : 'positiv'} \u2192 f ${leftType === 'smf' ? 'f\u00e4llt' : 'steigt'}. ` +
      `Rechts davon ist f\u2019 ${a > 0 ? 'positiv' : 'negativ'} \u2192 f ${rightType === 'smw' ? 'steigt' : 'f\u00e4llt'}.`,
  };
}

// ─── Case 2: f' quadratisch → 3 Intervalle klassifizieren (vorgegeben) ───
// f' ist eine Parabel mit zwei Nullstellen → f hat zwei Monotoniewechsel

function genRevQuadraticClassify(): IdentifyPointsExercise {
  const p = pick([-3, -2, -1]);
  const q = pick([1, 2, 3]);
  const sign = pick([1, -1]);

  const fPrimeCoeffs = [3 * sign, -3 * sign * (p + q), 3 * sign * p * q];
  const fn = (x: number) => evalPoly(fPrimeCoeffs, x);
  const latex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  const outerType: 'smw' | 'smf' = sign > 0 ? 'smw' : 'smf';
  const innerType: 'smw' | 'smf' = sign > 0 ? 'smf' : 'smw';

  return {
    id: uid(),
    type: 'identify-points',
    module: 'monotonie',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Der Graph zeigt f\u2019. Wo ist f steigend, wo fallend?',
    targets: [],
    intervalBounds: [p, q],
    includeInfinity: true,
    intervalCount: 3,
    correctIntervals: [
      { from: '-\u221e', to: p, type: outerType },
      { from: p, to: q, type: innerType },
      { from: q, to: '+\u221e', type: outerType },
    ],
    feedbackExplanation:
      `f\u2019 hat Nullstellen bei x = ${p} und x = ${q}. ` +
      `f\u2019 ist ${sign > 0 ? 'positiv' : 'negativ'} au\u00dferhalb \u2192 f ${outerType === 'smw' ? 'steigt' : 'f\u00e4llt'} dort. ` +
      `Dazwischen ist f\u2019 ${sign > 0 ? 'negativ' : 'positiv'} \u2192 f ${innerType === 'smw' ? 'steigt' : 'f\u00e4llt'}.`,
  };
}

// ─── Case 3: f' quadratisch → Nullstellen finden + klassifizieren (Zwei-Phasen) ───
// Gleich wie Case 2, aber der Sch\u00fcler muss erst die Nullstellen von f' finden

function genRevTwoPhase(): IdentifyPointsExercise {
  const base = genRevQuadraticClassify();
  const bounds = base.intervalBounds!;

  const distractors = new Set<number>();
  distractors.add(0);
  for (const b of bounds) {
    distractors.add(b - 1);
    distractors.add(b + 1);
  }
  for (const b of bounds) distractors.delete(b);
  const allOptions = [...bounds, ...Array.from(distractors)].sort((a, b) => a - b);
  const correctIndices = bounds.map(b => allOptions.indexOf(b));

  return {
    ...base,
    id: uid(),
    extremaOptions: {
      xValues: allOptions,
      correctIndices,
      prompt: 'An welchen Stellen hat f\u2019 Nullstellen? W\u00e4hle alle aus.',
    },
  };
}

// ─── Public API ───

export const REVERSE_INFERENCE_CASES: CaseDefinition[] = [
  { id: 'rev-classify-linear', label: "f\u2019-Gerade \u2192 Intervalle", generate: genRevLinearClassify },
  { id: 'rev-classify-quadratic', label: "f\u2019-Parabel \u2192 Intervalle", generate: genRevQuadraticClassify },
  { id: 'rev-two-phase', label: "f\u2019-Nullstellen finden + klassifizieren", generate: genRevTwoPhase },
];

export const reverseInferenceGenerator: ExerciseGenerator = {
  generate(): IdentifyPointsExercise {
    const caseIdx = Math.floor(Math.random() * REVERSE_INFERENCE_CASES.length);
    return REVERSE_INFERENCE_CASES[caseIdx].generate() as IdentifyPointsExercise;
  },
};
