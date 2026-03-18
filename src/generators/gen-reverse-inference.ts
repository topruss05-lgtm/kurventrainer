import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { ReverseInferenceExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return 'gen-rev-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Format a polynomial as clean LaTeX.
 * coeffs = [a_n, ..., a_0] for degree n down to 0.
 */
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

    if (deg === 0) {
      term += `${absC}`;
    } else if (absC === 1) {
      term += deg === 1 ? 'x' : `x^{${deg}}`;
    } else {
      term += deg === 1 ? `${absC}x` : `${absC}x^{${deg}}`;
    }

    parts.push(term);
  }

  return parts.length === 0 ? '0' : parts.join('');
}

/** Evaluate polynomial with coeffs [a_n, ..., a_0] at x (Horner). */
function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

// ─── Case 1: f' linear → Monotonie ───
// f'(x) = 2x + b (linear), one zero at x₀ = -b/2
// For x < x₀: f' has sign opposite to leading coeff behavior
// For x > x₀: f' has sign of leading coeff behavior

function genRevLinear(): ReverseInferenceExercise {
  // f'(x) = 2(x - x0) = 2x - 2x0
  const x0 = pick([-3, -2, -1, 0, 1, 2, 3]);
  const b = -2 * x0; // f'(x) = 2x + b

  const fPrimeCoeffs = [2, b];
  const fn = (x: number) => evalPoly(fPrimeCoeffs, x);
  const latex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  // f'(x) = 2(x - x0)
  // x < x0: f' < 0 → f fällt (smf)
  // x > x0: f' > 0 → f steigt (smw)
  // x = x0: f' = 0, VZW von - nach + → TP von f

  return {
    id: uid(),
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    givenGraph: "f'",
    function: { latex, fn },
    derivatives: {
      first: { latex, fn },
    },
    prompt: `Der Graph zeigt f'(x). Bestimme, wo f streng monoton wachsend (smw) bzw. streng monoton fallend (smf) ist.`,
    targets: [
      { x: x0, type: 'Tiefpunkt', reason: `f'(${x0}) = 0 mit VZW von − nach + → TP von f` },
    ],
    feedbackExplanation:
      `f'(x) > 0 für x > ${x0} → f steigt dort (smw). ` +
      `f'(x) < 0 für x < ${x0} → f fällt dort (smf). ` +
      `Bei x = ${x0} hat f' einen Vorzeichenwechsel von − nach + → f hat dort einen Tiefpunkt.`,
  };
}

// ─── Case 2: f' Parabel (positiver Leitkoeff.) → Extrema ───
// f'(x) = 3(x - p)(x - q) with p < q (positive leading coefficient)
// f' < 0 between p and q → f fällt
// f' > 0 outside → f steigt
// VZW + nach − bei p → HP, VZW − nach + bei q → TP

function genRevQuadraticPos(): ReverseInferenceExercise {
  const p = pick([-3, -2, -1, 0]);
  let q = pick([1, 2, 3]);
  if (q <= p) q = p + 2;

  // f'(x) = 3(x-p)(x-q) = 3x² - 3(p+q)x + 3pq
  const fPrimeCoeffs = [3, -3 * (p + q), 3 * p * q];
  const fn = (x: number) => evalPoly(fPrimeCoeffs, x);
  const latex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  // Verify |y| ≤ 50 at critical display points
  // f' at midpoint: f'((p+q)/2) = 3 * (-(q-p)/2) * ((q-p)/2) = -3(q-p)²/4
  // With |q-p| ≤ 6: max |f'| = 3*36/4 = 27 → fine

  return {
    id: uid(),
    type: 'reverse-inference',
    module: 'extremstellen',
    competency: 'K1',
    givenGraph: "f'",
    function: { latex, fn },
    derivatives: {
      first: { latex, fn },
    },
    prompt: `Der Graph zeigt f'(x). Bestimme die Extremstellen von f und deren Art.`,
    targets: [
      { x: p, type: 'Hochpunkt', reason: `f'(${p}) = 0 mit VZW von + nach − → HP von f` },
      { x: q, type: 'Tiefpunkt', reason: `f'(${q}) = 0 mit VZW von − nach + → TP von f` },
    ],
    feedbackExplanation:
      `f'(x) hat Nullstellen bei x = ${p} und x = ${q}. ` +
      `Bei x = ${p}: f' wechselt von + nach − → f hat einen Hochpunkt. ` +
      `Bei x = ${q}: f' wechselt von − nach + → f hat einen Tiefpunkt. ` +
      `Regel: f' > 0 → f steigt, f' < 0 → f fällt, VZW von f' → Extremum von f.`,
  };
}

// ─── Case 3: f' Parabel (negativer Leitkoeff.) → Extrema ───
// f'(x) = -3(x - p)(x - q) with p < q (negative leading coefficient)
// f' > 0 between p and q → f steigt
// f' < 0 outside → f fällt
// VZW − nach + bei p → TP, VZW + nach − bei q → HP

function genRevQuadraticNeg(): ReverseInferenceExercise {
  const p = pick([-3, -2, -1, 0]);
  let q = pick([1, 2, 3]);
  if (q <= p) q = p + 2;

  // f'(x) = -3(x-p)(x-q) = -3x² + 3(p+q)x - 3pq
  const fPrimeCoeffs = [-3, 3 * (p + q), -3 * p * q];
  const fn = (x: number) => evalPoly(fPrimeCoeffs, x);
  const latex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  return {
    id: uid(),
    type: 'reverse-inference',
    module: 'extremstellen',
    competency: 'K1',
    givenGraph: "f'",
    function: { latex, fn },
    derivatives: {
      first: { latex, fn },
    },
    prompt: `Der Graph zeigt f'(x). Bestimme die Extremstellen von f und deren Art.`,
    targets: [
      { x: p, type: 'Tiefpunkt', reason: `f'(${p}) = 0 mit VZW von − nach + → TP von f` },
      { x: q, type: 'Hochpunkt', reason: `f'(${q}) = 0 mit VZW von + nach − → HP von f` },
    ],
    feedbackExplanation:
      `f'(x) hat Nullstellen bei x = ${p} und x = ${q}. ` +
      `Bei x = ${p}: f' wechselt von − nach + → f hat einen Tiefpunkt. ` +
      `Bei x = ${q}: f' wechselt von + nach − → f hat einen Hochpunkt. ` +
      `Regel: f' > 0 → f steigt, f' < 0 → f fällt, VZW von f' → Extremum von f.`,
  };
}

// ─── Case 4: f' Doppel-NS → Sattelpunkt ───
// f'(x) = x²(x - a) with a ≠ 0
// Zeros: x = 0 (double), x = a (simple)
// At x = 0: double root → no sign change → Sattelpunkt (no extremum)
// At x = a: simple root → sign change → Extremum
// f'(x) = x³ - ax²
// For a > 0: f'(x) = x²(x - a). For x slightly < a: f' < 0. For x slightly > a: f' > 0. → TP at x = a.
// For a < 0: f'(x) = x²(x - a). For x slightly < a: f' < 0... wait.
// Let's check: a < 0, say a = -2. f'(x) = x²(x+2).
// x = -3: 9*(-1) = -9 < 0. x = -1: 1*(1) = 1 > 0. So VZW at x = -2: − → + → TP.
// x = -0.1: 0.01 * 1.9 = 0.019 > 0. x = 0.1: 0.01 * 2.1 = 0.021 > 0. No VZW at 0 → Sattelpunkt. ✓

function genRevDoubleRoot(): ReverseInferenceExercise {
  const a = pick([-3, -2, -1, 1, 2, 3]);

  // f'(x) = x²(x - a) = x³ - ax²
  const fPrimeCoeffs = [1, -a, 0, 0];
  const fn = (x: number) => evalPoly(fPrimeCoeffs, x);
  const latex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  // Verify |y| ≤ 50 at key points. The function can get large but the graph
  // renderer handles clipping. The zero values are exact integers.

  // At x = 0: double root, no VZW → Sattelpunkt of f
  // At x = a: simple root, VZW → Extremum of f
  // Determine type of extremum at x = a:
  // f'(x) = x²(x - a). Near x = a: x² > 0, so sign of f' = sign of (x - a).
  // x < a: f' < 0 (times positive x²), x > a: f' > 0 → VZW − nach + → TP
  const extremumType = 'Tiefpunkt';

  return {
    id: uid(),
    type: 'reverse-inference',
    module: 'extremstellen',
    competency: 'K1',
    givenGraph: "f'",
    function: { latex, fn },
    derivatives: {
      first: { latex, fn },
    },
    prompt: `Der Graph zeigt f'(x). Bestimme, wo f Extremstellen oder einen Sattelpunkt hat.`,
    targets: [
      { x: 0, type: 'Sattelpunkt', reason: `f'(0) = 0, aber Doppel-Nullstelle → kein VZW → Sattelpunkt` },
      { x: a, type: extremumType, reason: `f'(${a}) = 0 mit VZW von − nach + → ${extremumType}` },
    ],
    feedbackExplanation:
      `f'(x) = x²(x ${a >= 0 ? `- ${a}` : `+ ${-a}`}) hat Nullstellen bei x = 0 und x = ${a}. ` +
      `Bei x = 0: Doppel-Nullstelle von f' → kein Vorzeichenwechsel → Sattelpunkt von f (kein Extremum). ` +
      `Bei x = ${a}: einfache Nullstelle von f' → VZW von − nach + → f hat dort einen Tiefpunkt. ` +
      `Merke: Nur wenn f' das Vorzeichen wechselt (VZW), liegt ein Extremum vor!`,
  };
}

// ─── Public API ───

export const REVERSE_INFERENCE_CASES: CaseDefinition[] = [
  { id: 'rev-linear', label: "f' linear → Monotonie", generate: genRevLinear },
  { id: 'rev-quadratic-pos', label: "f' Parabel (pos) → Extrema", generate: genRevQuadraticPos },
  { id: 'rev-quadratic-neg', label: "f' Parabel (neg) → Extrema", generate: genRevQuadraticNeg },
  { id: 'rev-double-root', label: "f' Doppel-NS → Sattelpunkt", generate: genRevDoubleRoot },
];

export const reverseInferenceGenerator: ExerciseGenerator = {
  generate(): ReverseInferenceExercise {
    const caseIdx = Math.floor(Math.random() * REVERSE_INFERENCE_CASES.length);
    return REVERSE_INFERENCE_CASES[caseIdx].generate() as ReverseInferenceExercise;
  },
};
