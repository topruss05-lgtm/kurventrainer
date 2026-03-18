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
  return `tf-wp-${Math.random().toString(36).slice(2, 9)}`;
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
  return { id: uid(), type: 'true-false', module: 'wendestellen', competency: 'K3', ...partial };
}

// ─── Case 1: f''(x₀) = 0 allein reicht nicht (FALSCH) ───
function genWendeNotwendig(): TrueFalseExercise {
  const c = randInt(-4, 4);
  const fCoeffs = [1, 0, 0, 0, c];

  const reasons = shuffle([
    `${m("f''(x_W) = 0")} ist nur notwendig, nicht hinreichend. Man braucht zusätzlich ${m("f'''(x_W) \\neq 0")} oder einen VZW von f''.`,
    `${m("f''(x_W) = 0")} ist die einzige Bedingung für eine Wendestelle.`,
    `${m("f''(x_W) = 0")} bedeutet, dass f bei ${m("x_W")} eine Extremstelle hat.`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: {
      second: { latex: `f''(x) = 12x^{2}`, fn: x => 12 * x * x },
      third: { latex: `f'''(x) = 24x`, fn: x => 24 * x },
    },
    statement: `${m("f''(0) = 0")}, also hat f bei ${m("x = 0")} eine Wendestelle.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'notwendig'),
    feedbackExplanation:
      `Für ${m(`f(x) = ${formatPoly(fCoeffs)}`)} gilt ${m("f''(x) = 12x^2")}, also ${m("f''(0) = 0")}. ` +
      `Aber ${m("f'''(0) = 0")} und es gibt keinen VZW von f'': ${m("f''(x) = 12x^2 \\geq 0")} für alle x. ` +
      `Der Graph ist überall linksgekrümmt, es liegt KEIN Wendepunkt vor. ` +
      `${m("f''(x_0) = 0")} ist nur notwendig, nicht hinreichend!`,
    highlightX: 0,
  });
}

// ─── Case 2: f''(x) > 0 → linksgekrümmt (WAHR) ───
function genKruemmung(): TrueFalseExercise {
  const a = pick([1, -1]);
  const b = pick([-3, -1, 1, 3]);
  const d = randInt(-3, 3);
  const fCoeffs = [a, b, 0, d];
  const fDoublePrimeCoeffs = [6 * a, 2 * b];

  const xW = -b / (3 * a);
  let testX: number;
  if (a > 0) {
    testX = Math.ceil(xW) + 1;
  } else {
    testX = Math.floor(xW) - 1;
  }
  const fppAtTest = evalPoly(fDoublePrimeCoeffs, testX);

  const reasons = shuffle([
    `${m("f''(x) > 0")} bedeutet, dass der Graph von f bei x linksgekrümmt (konvex) ist.`,
    `${m("f''(x) > 0")} bedeutet, dass f bei x streng monoton wachsend ist.`,
    `${m("f''(x) > 0")} bedeutet, dass f bei x ein Minimum hat.`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: {
      second: { latex: `f''(x) = ${formatPoly(fDoublePrimeCoeffs)}`, fn: x => evalPoly(fDoublePrimeCoeffs, x) },
    },
    statement: `${m(`f''(${testX}) = ${fppAtTest} > 0`)}, also ist der Graph von f bei ${m(`x = ${testX}`)} linksgekrümmt.`,
    correct: true,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'linksgekrümmt'),
    feedbackExplanation:
      `${m("f''(x)")} gibt die Krümmung des Graphen an. ` +
      `${m("f''(x) > 0")} → linksgekrümmt (konvex, „Tal-Form"). ` +
      `${m("f''(x) < 0")} → rechtsgekrümmt (konkav, „Berg-Form"). ` +
      `Hier ist ${m(`f''(${testX}) = ${fppAtTest} > 0`)}, also ist f bei ${m(`x = ${testX}`)} tatsächlich linksgekrümmt.`,
    highlightX: testX,
  });
}

// ─── Public API ───

export const TF_WENDESTELLEN_CASES: CaseDefinition[] = [
  { id: 'tf-wp-notwendig', label: 'Wendestelle: notwendige Bedingung', generate: genWendeNotwendig },
  { id: 'tf-wp-kruemmung', label: 'Krümmung interpretieren', generate: genKruemmung },
];

export const tfWendestellenGenerator: ExerciseGenerator = {
  generate(): TrueFalseExercise {
    const c = TF_WENDESTELLEN_CASES[Math.floor(Math.random() * TF_WENDESTELLEN_CASES.length)];
    return c.generate() as TrueFalseExercise;
  },
};
