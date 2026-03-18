import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { TrueFalseExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return `tf-ext-${Math.random().toString(36).slice(2, 9)}`;
}

function formatPoly(coeffs: number[]): string {
  const maxDeg = coeffs.length - 1;
  const parts: string[] = [];
  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const deg = maxDeg - i;
    if (c === 0) continue;
    let term = '';
    if (parts.length === 0) {
      if (c < 0) term += '-';
    } else {
      term += c > 0 ? ' + ' : ' - ';
    }
    const abs = Math.abs(c);
    if (deg === 0) term += `${abs}`;
    else if (abs === 1) term += deg === 1 ? 'x' : `x^{${deg}}`;
    else term += deg === 1 ? `${abs}x` : `${abs}x^{${deg}}`;
    parts.push(term);
  }
  return parts.length === 0 ? '0' : parts.join('');
}

function evalPoly(coeffs: number[], x: number): number {
  let r = 0;
  for (const c of coeffs) r = r * x + c;
  return r;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findCorrect(options: string[], keyword: string): number {
  return options.findIndex(r => r.includes(keyword));
}

function m(latex: string): string {
  return `\\(${latex}\\)`;
}

function makeTF(
  partial: Omit<TrueFalseExercise, 'id' | 'type' | 'module' | 'competency'>,
): TrueFalseExercise {
  return { id: uid(), type: 'true-false', module: 'extremstellen', competency: 'K3', ...partial };
}

// ─── Case 1: f'(x₀) = 0 allein reicht nicht (FALSCH) ───
function genNotwendig(): TrueFalseExercise {
  const k = pick([-2, -1, 0, 1, 2]);
  const d = randInt(-3, 3);
  const fCoeffs = [1, -3 * k, 3 * k * k, -k * k * k + d];
  const kStr = k < 0 ? `(${k})` : `${k}`;

  const reasons = shuffle([
    `${m("f'(x_0) = 0")} ist nur eine notwendige, aber keine hinreichende Bedingung für ein Extremum. Es könnte auch ein Sattelpunkt sein.`,
    `${m("f'(x_0) = 0")} bedeutet immer, dass f bei ${m("x_0")} ein Extremum hat.`,
    `Wenn ${m("f'(x_0) = 0")}, dann hat f bei ${m("x_0")} einen Wendepunkt.`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = 3(x - ${kStr})^{2}`, fn: x => 3 * (x - k) ** 2 } },
    statement: `${m(`f'(${k}) = 0`)}, also hat f bei ${m(`x = ${k}`)} ein Extremum.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'notwendige'),
    feedbackExplanation:
      `${m(`f'(${k}) = 0`)} ist nur eine notwendige Bedingung. Bei ${m(`f(x) = ${formatPoly(fCoeffs)}`)} ist ${m(`f'(${k}) = 0`)}, ` +
      `aber ${m(`x = ${k}`)} ist kein Extremum, sondern ein Sattelpunkt. ` +
      `Man braucht zusätzlich einen VZW von f' oder ${m("f''(x_0) \\neq 0")}.`,
    highlightX: k,
  });
}

// ─── Case 2: f'(x₀)=0, f''(x₀)=0 → hinreichende Bed. versagt (FALSCH) ───
function genSattelpunkt(): TrueFalseExercise {
  const a = pick([-4, -2, 2, 4]);
  const fCoeffs = [1, a, 0, 0, 0];
  const fPrimeCoeffs = [4, 3 * a, 0, 0];

  const reasons = shuffle([
    `${m("f'(0) = 0")} und ${m("f''(0) = 0")} bedeutet, dass die hinreichende Bedingung 2. Ordnung versagt. Man muss weiter prüfen (z. B. VZW von f').`,
    `${m("f'(0) = 0")} und ${m("f''(0) = 0")} beweist, dass ein Extremum vorliegt.`,
    `Wenn ${m("f''(0) = 0")}, dann hat f bei ${m("x = 0")} immer einen Wendepunkt.`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: `f'(x) = ${formatPoly(fPrimeCoeffs)}`, fn: x => evalPoly(fPrimeCoeffs, x) },
      second: { latex: `f''(x) = ${formatPoly([12, 6 * a, 0])}`, fn: x => evalPoly([12, 6 * a, 0], x) },
    },
    statement: `Für ${m(`f(x) = ${formatPoly(fCoeffs)}`)} gilt ${m("f'(0) = 0")} und ${m("f''(0) = 0")}. Also hat f bei ${m("x = 0")} ein Extremum.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'versagt'),
    feedbackExplanation:
      `${m("f'(0) = 0")} und ${m("f''(0) = 0")} bedeutet nur, dass die hinreichende Bedingung 2. Ordnung KEINE Aussage liefert. ` +
      `Man muss das VZW-Kriterium prüfen: ${m(`f'(x) = ${formatPoly(fPrimeCoeffs)}`)}. ` +
      `Bei ${m("x = 0")} liegt eine Doppel-Nullstelle von f' vor → kein VZW → kein Extremum, sondern ein Sattelpunkt.`,
    highlightX: 0,
  });
}

// ─── Public API ───

export const TF_EXTREMSTELLEN_CASES: CaseDefinition[] = [
  { id: 'tf-ext-notwendig', label: 'Notwendige Bedingung Extremum', generate: genNotwendig },
  { id: 'tf-ext-sattelpunkt', label: 'Sattelpunkt erkennen', generate: genSattelpunkt },
];

export const tfExtremstellenGenerator: ExerciseGenerator = {
  generate(): TrueFalseExercise {
    const c = TF_EXTREMSTELLEN_CASES[Math.floor(Math.random() * TF_EXTREMSTELLEN_CASES.length)];
    return c.generate() as TrueFalseExercise;
  },
};
