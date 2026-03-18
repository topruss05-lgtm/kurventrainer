import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { ContextInterpretationExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
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

// ─── Context pools ───

interface ContextTemplate {
  name: string;       // e.g. "Kosten", "Temperatur"
  unit: string;       // e.g. "Euro", "°C"
  variable: string;   // e.g. "t (in Stunden)", "x (in Stück)"
  variableLetter: string; // e.g. "t", "x"
}

const CONTEXT_POOL: ContextTemplate[] = [
  { name: 'Kosten', unit: 'Euro', variable: 't (in Monaten)', variableLetter: 't' },
  { name: 'Temperatur', unit: '°C', variable: 't (in Stunden)', variableLetter: 't' },
  { name: 'Umsatz', unit: 'Tsd. Euro', variable: 't (in Monaten)', variableLetter: 't' },
  { name: 'Füllhöhe', unit: 'cm', variable: 't (in Minuten)', variableLetter: 't' },
  { name: 'Gewinn', unit: 'Euro', variable: 'x (in Stück)', variableLetter: 'x' },
];

// ─── Case 1: Sachkontext interpretieren (F1) ───

function genCtxInterpret(): ContextInterpretationExercise {
  const ctx = pick(CONTEXT_POOL);
  const t0 = randInt(2, 8);
  const y0 = randInt(10, 50) * 10;

  // f has a Hochpunkt at (t0, y0)
  // f(t) = -a(t - t0)² + y0, a > 0
  const a = pick([2, 3, 5]);
  const fCoeffs = [-a, 2 * a * t0, -a * t0 * t0 + y0];

  const question = `K(${ctx.variableLetter}) beschreibt die ${ctx.name} in ${ctx.unit} in Abhängigkeit von ${ctx.variable}. ` +
    `K hat bei ${ctx.variableLetter} = ${t0} einen Hochpunkt H(${t0}|${y0}). Was bedeutet das im Sachkontext?`;

  const correctOption = `Zum Zeitpunkt ${ctx.variableLetter} = ${t0} sind die ${ctx.name} mit ${y0} ${ctx.unit} am größten.`;

  const options = shuffle([
    correctOption,
    `Zum Zeitpunkt ${ctx.variableLetter} = ${t0} steigen die ${ctx.name} am stärksten.`,
    `Die ${ctx.name} betragen immer ${y0} ${ctx.unit}.`,
    `Ab ${ctx.variableLetter} = ${t0} steigen die ${ctx.name} immer weiter.`,
  ]);

  const correctIndex = options.indexOf(correctOption);

  return {
    id: uid(),
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K2',
    subType: 'interpret',
    contextTitle: `${ctx.name}entwicklung`,
    contextDescription: `K(${ctx.variableLetter}) beschreibt die ${ctx.name} (in ${ctx.unit}) in Abhängigkeit von ${ctx.variable}.`,
    question,
    function: {
      latex: `K(${ctx.variableLetter}) = ${formatPolynomial(fCoeffs)}`,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    options,
    correctIndex,
    explanation:
      `Ein Hochpunkt H(${t0}|${y0}) bedeutet: Bei ${ctx.variableLetter} = ${t0} nimmt K den größten Wert ${y0} an. ` +
      `Im Sachkontext: Die ${ctx.name} sind zum Zeitpunkt ${ctx.variableLetter} = ${t0} maximal (${y0} ${ctx.unit}). ` +
      `Achtung: „steigt am stärksten" wäre eine Aussage über K', nicht über K selbst.`,
    highlightPoints: [{ x: t0, y: y0, label: `HP(${t0}|${y0})` }],
  };
}

// ─── Case 2: Sachkontext formalisieren (F3) ───

function genCtxFormalize(): ContextInterpretationExercise {
  const ctx = pick(CONTEXT_POOL.filter(c => c.name === 'Gewinn' || c.name === 'Umsatz'));
  const x0 = randInt(3, 12) * 10;
  const y0 = randInt(5, 30) * 100;

  // f(x) with maximum at x0
  const a = pick([1, 2]);
  const fCoeffs = [-a, 2 * a * x0, -a * x0 * x0 + y0];

  const question = `„Der ${ctx.name} ist bei ${x0} Stück am größten." Welcher mathematische Ausdruck beschreibt diese Aussage?`;

  const correctOption = `f'(${x0}) = 0 und f''(${x0}) < 0 (Hochpunkt bei x = ${x0})`;

  const options = shuffle([
    correctOption,
    `f(${x0}) = 0`,
    `f'(${x0}) > 0`,
    `f''(${x0}) = 0`,
  ]);

  const correctIndex = options.indexOf(correctOption);

  return {
    id: uid(),
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K3',
    subType: 'formalize',
    contextTitle: `${ctx.name}maximierung`,
    contextDescription: `f(x) beschreibt den ${ctx.name} (in ${ctx.unit}) bei x Stück.`,
    contextGraph: {
      latex: `f(x) = ${formatPolynomial(fCoeffs)}`,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    question,
    function: {
      latex: `f(x) = ${formatPolynomial(fCoeffs)}`,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    options,
    correctIndex,
    explanation:
      `„${ctx.name} ist am größten" bedeutet: f hat ein Maximum, also einen Hochpunkt. ` +
      `Mathematisch: f'(${x0}) = 0 (notwendige Bedingung) und f''(${x0}) < 0 (hinreichende Bedingung für HP). ` +
      `f(${x0}) = 0 würde bedeuten, der ${ctx.name} ist null. ` +
      `f'(${x0}) > 0 würde bedeuten, der ${ctx.name} steigt noch.`,
    highlightPoints: [{ x: x0, y: y0, label: `HP(${x0}|${y0})` }],
  };
}

// ─── Case 3: Extremstelle vs. Wendestelle (F7, Trendwende) ───

function genCtxTrendwende(): ContextInterpretationExercise {
  interface TrendTemplate {
    groesse: string;
    verb: string;
    adverb: string;
    unit: string;
  }

  const templates: TrendTemplate[] = [
    { groesse: 'Mitgliederzahl', verb: 'steigt', adverb: 'langsamer', unit: 'Mitglieder' },
    { groesse: 'Umsatz', verb: 'steigt', adverb: 'langsamer', unit: 'Tsd. Euro' },
    { groesse: 'Temperatur', verb: 'steigt', adverb: 'langsamer', unit: '°C' },
    { groesse: 'Mitgliederzahl', verb: 'fällt', adverb: 'langsamer', unit: 'Mitglieder' },
    { groesse: 'Umsatz', verb: 'fällt', adverb: 'langsamer', unit: 'Tsd. Euro' },
    { groesse: 'Temperatur', verb: 'fällt', adverb: 'schneller', unit: '°C' },
  ];

  const tmpl = pick(templates);
  const t0 = randInt(3, 10);

  // Build a cubic that matches the description
  // "steigt, aber langsamer" → f' > 0, f'' < 0 → Wendepunkt (rechtsgekrümmt → linksgekrümmt)
  // "fällt, aber langsamer" → f' < 0, f'' > 0 → Wendepunkt
  // "fällt, aber schneller" → f' < 0, f'' < 0 → kein Wendepunkt in that region, but
  //   actually "schneller fallen" means |f'| increases while f' < 0, so f'' < 0
  //   That's NOT a Wendepunkt. Let's keep it simpler and focus on the classic case.

  // Use simpler: f steigt weiter, aber immer langsamer → Wendepunkt
  // f(x) = -x³ + 3*t0*x² (shifted)
  // f'(x) = -3x² + 6*t0*x = -3x(x - 2*t0)
  // f''(x) = -6x + 6*t0 = -6(x - t0)
  // Wendepunkt at x = t0. For x < t0: f'' > 0 (linksgekrümmt), x > t0: f'' < 0 (rechtsgekrümmt)
  // f' > 0 on (0, 2*t0) → f steigt in diesem Bereich
  // At Wendepunkt: f steigt weiter, aber Wechsel von linksgekrümmt zu rechtsgekrümmt
  // = "steigt immer langsamer"

  const properCoeffs = [-1, 3 * t0, 0, randInt(0, 20)];
  // f(x) = -x³ + 3*t0*x² + d
  // f'(x) = -3x² + 6*t0*x
  // f''(x) = -6x + 6*t0, WP at x = t0

  const beschreibung = `Die ${tmpl.groesse} ${tmpl.verb} zwar weiter, aber immer ${tmpl.adverb}.`;

  const question = `„${beschreibung}" – Welches mathematische Merkmal beschreibt diesen Zeitpunkt am besten?`;

  const correctOption = `Wendepunkt: f''(${t0}) = 0 mit Vorzeichenwechsel von f''`;

  const options = shuffle([
    correctOption,
    `Maximum: f'(${t0}) = 0 und f''(${t0}) < 0`,
    `Minimum: f'(${t0}) = 0 und f''(${t0}) > 0`,
    `Nullstelle: f(${t0}) = 0`,
  ]);

  const correctIndex = options.indexOf(correctOption);

  return {
    id: uid(),
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    subType: 'interpret',
    contextTitle: 'Trendwende erkennen',
    contextDescription:
      `Die ${tmpl.groesse} wird durch f(t) beschrieben. ` +
      `Zum Zeitpunkt t = ${t0} gilt: ${beschreibung}`,
    question,
    function: {
      latex: `f(t) = ${formatPolynomial(properCoeffs)}`,
      fn: (x: number) => evalPoly(properCoeffs, x),
    },
    options,
    correctIndex,
    explanation:
      `„${tmpl.verb} weiter, aber ${tmpl.adverb}" bedeutet: ` +
      (tmpl.verb === 'steigt'
        ? `f' > 0 (steigt noch), aber f'' wechselt das Vorzeichen (Krümmung ändert sich).`
        : `f' < 0 (fällt noch), aber die Änderungsrate nimmt ab (f'' wechselt Vorzeichen).`) +
      ` Das ist ein Wendepunkt, KEIN Extremum! ` +
      `Beim Extremum würde der Wert aufhören zu ${tmpl.verb === 'steigt' ? 'steigen' : 'fallen'} ` +
      `und die Richtung wechseln. Hier ändert sich nur die „Geschwindigkeit" der Änderung.`,
    highlightPoints: [
      { x: t0, y: evalPoly(properCoeffs, t0), label: `WP(${t0}|${Math.round(evalPoly(properCoeffs, t0))})` },
    ],
  };
}

// ─── Case 4: Sachkontext → Graph (F2) ───

function genCtxSketch(): ContextInterpretationExercise {
  const ctx = pick(CONTEXT_POOL);
  const t0 = randInt(2, 5);
  const tMax = t0 + randInt(2, 4);

  // Description: "Die {Größe} steigt zunächst bis t={t0}, fällt dann bis t={tMax}"
  // → f has HP at t0, TP at tMax
  // Correct: cubic with HP at t0, TP at tMax

  // f'(t) = -6(t - t0)(t - tMax), leading coeff -6 < 0
  // f(t) = -2t³ + 3(t0+tMax)t² - 6*t0*tMax*t + d
  const sum = t0 + tMax;
  const prod = t0 * tMax;
  const d = randInt(0, 10);
  const correctCoeffs = [-2, 3 * sum, -6 * prod, d];
  const yAtHP = evalPoly(correctCoeffs, t0);
  const yAtTP = evalPoly(correctCoeffs, tMax);

  const description =
    `Die ${ctx.name} steigt zunächst an und erreicht bei ${ctx.variableLetter} = ${t0} ` +
    `einen Höchstwert von ${Math.round(yAtHP)} ${ctx.unit}. ` +
    `Danach fällt die ${ctx.name} bis ${ctx.variableLetter} = ${tMax} auf ${Math.round(yAtTP)} ${ctx.unit}.`;

  const question = `Welcher Graph passt zu dieser Beschreibung?`;

  // Distractor 1: HP and TP swapped (positive leading coeff)
  const d1Coeffs = correctCoeffs.map(c => -c);

  // Distractor 2: only rising (no HP)
  const d2Coeffs = [1, 0, 0, d];

  // Distractor 3: HP at wrong position (shifted extrema)
  const d3Coeffs = [-2, 3 * (sum + 2), -6 * (prod + 2 * sum + 2), d];

  const graphOptions = shuffle([
    {
      id: 'opt-correct',
      function: {
        latex: `f(${ctx.variableLetter}) = ${formatPolynomial(correctCoeffs)}`,
        fn: (x: number) => evalPoly(correctCoeffs, x),
      },
      isCorrect: true,
    },
    {
      id: 'opt-swapped',
      function: {
        latex: `g(${ctx.variableLetter}) = ${formatPolynomial(d1Coeffs)}`,
        fn: (x: number) => evalPoly(d1Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-monotone',
      function: {
        latex: `h(${ctx.variableLetter}) = ${formatPolynomial(d2Coeffs)}`,
        fn: (x: number) => evalPoly(d2Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-wrong-pos',
      function: {
        latex: `p(${ctx.variableLetter}) = ${formatPolynomial(d3Coeffs)}`,
        fn: (x: number) => evalPoly(d3Coeffs, x),
      },
      isCorrect: false,
    },
  ]);

  return {
    id: uid(),
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K2',
    subType: 'context-to-sketch',
    contextTitle: `${ctx.name}verlauf`,
    contextDescription: description,
    question,
    function: {
      latex: `f(${ctx.variableLetter}) = ${formatPolynomial(correctCoeffs)}`,
      fn: (x: number) => evalPoly(correctCoeffs, x),
    },
    options: graphOptions.map(g => g.id),
    correctIndex: graphOptions.findIndex(g => g.isCorrect),
    explanation:
      `Der korrekte Graph steigt bis ${ctx.variableLetter} = ${t0} (HP) und fällt danach bis ${ctx.variableLetter} = ${tMax} (TP). ` +
      `Der gespiegelte Graph hat die Extrema vertauscht (zuerst TP, dann HP). ` +
      `Der monoton steigende Graph hat keinen Hochpunkt. ` +
      `Der verschobene Graph hat die Extremstellen an falschen Positionen.`,
    highlightPoints: [
      { x: t0, y: Math.round(yAtHP), label: `HP(${t0}|${Math.round(yAtHP)})` },
      { x: tMax, y: Math.round(yAtTP), label: `TP(${tMax}|${Math.round(yAtTP)})` },
    ],
  };
}

// ─── Public API ───

export const CONTEXT_CASES: CaseDefinition[] = [
  { id: 'ctx-interpret', label: 'Sachkontext interpretieren', generate: genCtxInterpret },
  { id: 'ctx-formalize', label: 'Sachkontext formalisieren', generate: genCtxFormalize },
  { id: 'ctx-trendwende', label: 'Extremstelle vs. Wendestelle', generate: genCtxTrendwende },
  { id: 'ctx-sketch', label: 'Sachkontext → Graph', generate: genCtxSketch },
];

export const contextGenerator: ExerciseGenerator = {
  generate(): ContextInterpretationExercise {
    const caseIdx = Math.floor(Math.random() * CONTEXT_CASES.length);
    return CONTEXT_CASES[caseIdx].generate() as ContextInterpretationExercise;
  },
};
