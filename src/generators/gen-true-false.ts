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
  return `tf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Case 1: Monotoniesatz anwenden ───
// f(x) = x³ + bx² + cx + d, compute f' > 0 on an interval → f smw there → CORRECT

function genTfMonotoniesatz(): TrueFalseExercise {
  // f(x) = x³ - 3px² + ... with p chosen so f' = 3x² - 6px has roots at 0 and 2p
  // Pick p so that f' > 0 on a nice interval
  const p = pick([-2, -1, 1, 2]);
  const d = randInt(-3, 3);

  // f(x) = x³ - 3p x² + d  →  f'(x) = 3x² - 6px = 3x(x - 2p)
  const fCoeffs = [1, -3 * p, 0, d];
  const fPrimeCoeffs = [3, -6 * p, 0];

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;
  const fPrimeLatex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  // f'(x) = 3x(x - 2p). Roots at 0 and 2p.
  // If p > 0: f' > 0 on (-inf, 0) and (2p, +inf)
  // If p < 0: f' > 0 on (-inf, 2p) and (0, +inf)
  let a: number, b: number;
  if (p > 0) {
    // f' > 0 on (2p, +inf), pick interval (2p, 2p+3)
    a = 2 * p;
    b = 2 * p + 3;
  } else {
    // f' > 0 on (0, +inf), pick interval (0, 3)
    a = 0;
    b = 3;
  }

  const reasonOptions = shuffle([
    `Der Monotoniesatz besagt: f'(x) > 0 auf einem Intervall ⇒ f ist dort streng monoton wachsend.`,
    `f'(x) > 0 bedeutet, dass f dort Nullstellen hat.`,
    `Aus f'(x) > 0 folgt, dass f dort konkav ist.`,
  ]);
  const correctReasonIndex = reasonOptions.findIndex(r => r.includes('Monotoniesatz'));

  return {
    id: uid(),
    type: 'true-false',
    module: 'monotonie',
    competency: 'K2',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
    },
    statement: `\\(f'(x) = ${formatPolynomial(fPrimeCoeffs)}\\) ist auf \\((${a};\\ ${b})\\) positiv. Also ist f dort streng monoton wachsend.`,
    correct: true,
    reasonOptions,
    correctReasonIndex,
    feedbackExplanation:
      `Der Monotoniesatz besagt: Ist f'(x) > 0 auf einem offenen Intervall, so ist f dort streng monoton wachsend (smw). ` +
      `Hier ist f'(x) = ${formatPolynomial(fPrimeCoeffs)} = 3x(x ${p > 0 ? `- ${2 * p}` : `+ ${-2 * p}`}). ` +
      `Auf (${a}, ${b}) ist f'(x) tatsächlich positiv, also ist f dort smw.`,
    highlightX: Math.round((a + b) / 2),
  };
}

// ─── Case 2: Nichtumkehrbarkeit ───
// f(x) = x³ smw on R, but f'(0) = 0 → Rückrichtung gilt NICHT → FALSE

function genTfNichtumkehrbar(): TrueFalseExercise {
  const fCoeffs = [1, 0, 0, 0]; // x³
  const fPrimeCoeffs = [3, 0, 0]; // 3x²

  const reasonOptions = shuffle([
    `Die Umkehrung des Monotoniesatzes gilt nicht: f smw bedeutet NICHT, dass f'(x) > 0 für alle x.`,
    `f ist smw, also muss f'(x) überall positiv sein.`,
    `f'(0) = 0 widerspricht der Monotonie, also ist f doch nicht smw.`,
  ]);
  const correctReasonIndex = reasonOptions.findIndex(r => r.includes('Umkehrung'));

  return {
    id: uid(),
    type: 'true-false',
    module: 'monotonie',
    competency: 'K3',
    function: { latex: 'f(x) = x^{3}', fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: "f'(x) = 3x^{2}", fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
    },
    statement: `\\(f(x) = x^3\\) ist auf ganz \u211d streng monoton wachsend. Also gilt \\(f'(x) > 0\\) f\u00fcr alle \\(x \u2208 \u211d\\).`,
    correct: false,
    reasonOptions,
    correctReasonIndex,
    feedbackExplanation:
      `f(x) = x³ ist tatsächlich auf ganz ℝ streng monoton wachsend. ` +
      `Aber f'(x) = 3x², und f'(0) = 0. Die Ableitung ist also NICHT überall positiv. ` +
      `Die Umkehrung des Monotoniesatzes gilt nicht: Aus „f smw" folgt NICHT „f' > 0 überall".`,
    highlightX: 0,
  };
}

// ─── Case 3: Notwendige Bedingung Extremum ───
// f'(x₀) = 0 allein reicht nicht → FALSE

function genTfExtremumNotwendig(): TrueFalseExercise {
  // f(x) = x³ + ax, so f'(x) = 3x² + a
  // Wähle a = 0: f'(0) = 0, aber x=0 ist kein Extremum (Sattelpunkt)
  const c = randInt(-3, 3);
  // f(x) = x³ + c → f'(x) = 3x²
  const fCoeffs = [1, 0, 0, c];
  const fPrimeCoeffs = [3, 0, 0];

  const x0 = 0;

  const reasonOptions = shuffle([
    `f'(x₀) = 0 ist nur eine notwendige, aber keine hinreichende Bedingung für ein Extremum. Es könnte auch ein Sattelpunkt sein.`,
    `f'(x₀) = 0 bedeutet immer, dass f bei x₀ ein Extremum hat.`,
    `Wenn f'(x₀) = 0, dann hat f bei x₀ einen Wendepunkt.`,
  ]);
  const correctReasonIndex = reasonOptions.findIndex(r => r.includes('notwendige'));

  return {
    id: uid(),
    type: 'true-false',
    module: 'extremstellen',
    competency: 'K3',
    function: { latex: `f(x) = ${formatPolynomial(fCoeffs)}`, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
    },
    statement: `\\(f'(${x0}) = 0\\), also hat f bei \\(x = ${x0}\\) ein Extremum.`,
    correct: false,
    reasonOptions,
    correctReasonIndex,
    feedbackExplanation:
      `f'(${x0}) = 0 ist nur eine notwendige Bedingung. Bei f(x) = x³ ist f'(0) = 0, ` +
      `aber x = 0 ist kein Extremum, sondern ein Sattelpunkt. ` +
      `Man braucht zusätzlich einen Vorzeichenwechsel von f' (VZW-Kriterium) oder f''(x₀) ≠ 0 (hinreichende Bedingung).`,
    highlightX: x0,
  };
}

// ─── Case 4: Sattelpunkt erkennen ───
// f(x) = x⁴ + ax³ mit f'(0) = 0, f''(0) = 0 → kein Extremum → FALSE

function genTfSattelpunkt(): TrueFalseExercise {
  const a = pick([-4, -2, 2, 4]);

  // f(x) = x⁴ + ax³
  // f'(x) = 4x³ + 3ax²
  // f''(x) = 12x² + 6ax
  // f'(0) = 0, f''(0) = 0
  // f'''(x) = 24x + 6a, f'''(0) = 6a ≠ 0 → Wendestelle von f, kein Extremum
  const fCoeffs = [1, a, 0, 0, 0];
  const fPrimeCoeffs = [4, 3 * a, 0, 0];
  const fDoublePrimeCoeffs = [12, 6 * a, 0];

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;
  const fPrimeLatex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;

  const reasonOptions = shuffle([
    `f'(0) = 0 und f''(0) = 0 bedeutet, dass die hinreichende Bedingung 2. Ordnung versagt. Man muss weiter prüfen (z. B. VZW von f').`,
    `f'(0) = 0 und f''(0) = 0 beweist, dass ein Extremum vorliegt.`,
    `Wenn f''(0) = 0, dann hat f bei x = 0 immer einen Wendepunkt.`,
  ]);
  const correctReasonIndex = reasonOptions.findIndex(r => r.includes('versagt'));

  return {
    id: uid(),
    type: 'true-false',
    module: 'extremstellen',
    competency: 'K3',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: {
        latex: `f''(x) = ${formatPolynomial(fDoublePrimeCoeffs)}`,
        fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x),
      },
    },
    statement: `F\u00fcr \\(f(x) = ${formatPolynomial(fCoeffs)}\\) gilt \\(f'(0) = 0\\) und \\(f''(0) = 0\\). Also hat f bei \\(x = 0\\) ein Extremum.`,
    correct: false,
    reasonOptions,
    correctReasonIndex,
    feedbackExplanation:
      `f'(0) = 0 und f''(0) = 0 bedeutet nur, dass die hinreichende Bedingung 2. Ordnung KEINE Aussage liefert. ` +
      `Man muss das VZW-Kriterium prüfen: f'(x) = ${formatPolynomial(fPrimeCoeffs)} = x²(4x + ${3 * a}). ` +
      `Bei x = 0 liegt eine Doppel-Nullstelle von f' vor → kein VZW → kein Extremum, sondern ein Sattelpunkt.`,
    highlightX: 0,
  };
}

// ─── Case 5: Wendestelle Bedingung ───
// f''(x_W) = 0 allein reicht nicht → FALSE

function genTfWendestelle(): TrueFalseExercise {
  // f(x) = x⁴ → f''(x) = 12x², f''(0) = 0, aber kein Wendepunkt
  // f'''(x) = 24x, f'''(0) = 0 → notwendige Bed. nicht hinreichend
  const c = randInt(-2, 2);
  // f(x) = x⁴ + c
  const fCoeffs = [1, 0, 0, 0, c];
  const fDoublePrimeCoeffs = [12, 0, 0];
  const fTriplePrimeCoeffs = [24, 0];

  const xW = 0;

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;

  const reasonOptions = shuffle([
    `f''(x_W) = 0 ist nur notwendig, nicht hinreichend. Man braucht zusätzlich f'''(x_W) ≠ 0 oder einen VZW von f''.`,
    `f''(x_W) = 0 ist die einzige Bedingung für eine Wendestelle.`,
    `f''(x_W) = 0 bedeutet, dass f bei x_W eine Extremstelle hat.`,
  ]);
  const correctReasonIndex = reasonOptions.findIndex(r => r.includes('notwendig'));

  return {
    id: uid(),
    type: 'true-false',
    module: 'wendestellen',
    competency: 'K3',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      second: {
        latex: `f''(x) = ${formatPolynomial(fDoublePrimeCoeffs)}`,
        fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x),
      },
      third: {
        latex: `f'''(x) = ${formatPolynomial(fTriplePrimeCoeffs)}`,
        fn: (x: number) => evalPoly(fTriplePrimeCoeffs, x),
      },
    },
    statement: `\\(f''(${xW}) = 0\\), also hat f bei \\(x = ${xW}\\) eine Wendestelle.`,
    correct: false,
    reasonOptions,
    correctReasonIndex,
    feedbackExplanation:
      `Für f(x) = ${formatPolynomial(fCoeffs)} gilt f''(x) = 12x², also f''(0) = 0. ` +
      `Aber f'''(x) = 24x und f'''(0) = 0. Es gibt keinen VZW von f'': f''(x) = 12x² ≥ 0 für alle x. ` +
      `Der Graph ist überall linksgekrümmt (oder flach), es liegt KEIN Wendepunkt vor. ` +
      `f''(x₀) = 0 ist nur notwendig, nicht hinreichend!`,
    highlightX: xW,
  };
}

// ─── Case 6: Krümmung interpretieren ───
// f''(x) > 0 → linksgekrümmt (konvex) → CORRECT

function genTfKruemmung(): TrueFalseExercise {
  // f(x) = ax³ + bx² + cx + d, pick so f'' at some x is positive
  const a = pick([1, -1]);
  const b = pick([-3, -1, 1, 3]);
  const d = randInt(-3, 3);

  // f(x) = ax³ + bx² + d
  const fCoeffs = [a, b, 0, d];
  const fDoublePrimeCoeffs = [6 * a, 2 * b];

  // f''(x) = 6ax + 2b. Find x where f''(x) > 0.
  // f''(x) > 0 ⇔ 6ax > -2b ⇔ x > -b/(3a) (if a>0) or x < -b/(3a) (if a<0)
  const xW = -b / (3 * a); // f'' changes sign here (Wendestelle)
  let testX: number;
  if (a > 0) {
    testX = Math.ceil(xW) + 1; // f''(testX) > 0
  } else {
    testX = Math.floor(xW) - 1; // f''(testX) > 0
  }

  const fDoublePrimeAtTest = evalPoly(fDoublePrimeCoeffs, testX);

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;

  const reasonOptions = shuffle([
    `f''(x) > 0 bedeutet, dass der Graph von f bei x linksgekrümmt (konvex) ist.`,
    `f''(x) > 0 bedeutet, dass f bei x streng monoton wachsend ist.`,
    `f''(x) > 0 bedeutet, dass f bei x ein Minimum hat.`,
  ]);
  const correctReasonIndex = reasonOptions.findIndex(r => r.includes('linksgekrümmt'));

  return {
    id: uid(),
    type: 'true-false',
    module: 'wendestellen',
    competency: 'K2',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      second: {
        latex: `f''(x) = ${formatPolynomial(fDoublePrimeCoeffs)}`,
        fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x),
      },
    },
    statement: `\\(f''(${testX}) = ${fDoublePrimeAtTest} > 0\\), also ist der Graph von f bei \\(x = ${testX}\\) linksgekr\u00fcmmt.`,
    correct: true,
    reasonOptions,
    correctReasonIndex,
    feedbackExplanation:
      `f''(x) gibt die Krümmung des Graphen an. ` +
      `f''(x) > 0 → der Graph ist linksgekrümmt (konvex, „Tal-Form"). ` +
      `f''(x) < 0 → der Graph ist rechtsgekrümmt (konkav, „Berg-Form"). ` +
      `Hier ist f''(${testX}) = ${fDoublePrimeAtTest} > 0, also ist f bei x = ${testX} tatsächlich linksgekrümmt.`,
    highlightX: testX,
  };
}

// ─── Public API ───

export const TRUE_FALSE_CASES: CaseDefinition[] = [
  { id: 'tf-monotoniesatz', label: 'Monotoniesatz anwenden', generate: genTfMonotoniesatz },
  { id: 'tf-nichtumkehrbar', label: 'Nichtumkehrbarkeit', generate: genTfNichtumkehrbar },
  { id: 'tf-extremum-notwendig', label: 'Notwendige Bedingung Extremum', generate: genTfExtremumNotwendig },
  { id: 'tf-sattelpunkt', label: 'Sattelpunkt erkennen', generate: genTfSattelpunkt },
  { id: 'tf-wendestelle', label: 'Wendestelle Bedingung', generate: genTfWendestelle },
  { id: 'tf-kruemmung', label: 'Krümmung interpretieren', generate: genTfKruemmung },
];

export const trueFalseGenerator: ExerciseGenerator = {
  generate(): TrueFalseExercise {
    const caseIdx = Math.floor(Math.random() * TRUE_FALSE_CASES.length);
    return TRUE_FALSE_CASES[caseIdx].generate() as TrueFalseExercise;
  },
};
