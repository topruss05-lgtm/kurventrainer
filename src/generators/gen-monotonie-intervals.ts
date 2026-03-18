import type { IdentifyPointsExercise, MonotonicityInterval } from '../types/exercise.js';
import type { CaseDefinition, ExerciseGenerator } from './types.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return 'gen-mono-' + Math.random().toString(36).slice(2, 9);
}


// ─── Case 1: Grad 3, positiver Leitkoeffizient (smw, smf, smw) ───

function genCubicPositive(): IdentifyPointsExercise {
  const k = pick([1, 2, 3]);
  const d = pick([0, 0, 1, -1, 2]);
  const x1 = -k + d;
  const x2 = k + d;
  const c_coeff = -3 * k * k;
  // f(x) = (x-d)^3 + c_coeff*(x-d) = x^3 - 3d*x^2 + (3d^2+c)*x - d^3 - c*d
  const fn = (x: number) => (x - d) ** 3 + c_coeff * (x - d);
  const y1 = fn(x1);
  const y2 = fn(x2);

  const variable = d === 0 ? 'x' : d > 0 ? `(x - ${d})` : `(x + ${-d})`;
  const cubic = variable === 'x' ? 'x\u00b3' : `${variable}\u00b3`;
  const linear = c_coeff === 0 ? '' : (c_coeff > 0 ? ` + ${Math.abs(c_coeff) === 1 ? '' : Math.abs(c_coeff)}${variable}` : ` - ${Math.abs(c_coeff) === 1 ? '' : Math.abs(c_coeff)}${variable}`);
  const latex = `f(x) = ${cubic}${linear}`;

  return {
    id: uid(), type: 'identify-points', module: 'monotonie', competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Untersuche f auf Monotonie.',
    targets: [],
    intervalBounds: [x1, x2],
    includeInfinity: true,
    intervalCount: 3,
    correctIntervals: [
      { from: '-\u221e', to: x1, type: 'smw' },
      { from: x1, to: x2, type: 'smf' },
      { from: x2, to: '+\u221e', type: 'smw' },
    ],
    feedbackExplanation: `HP(${x1}|${y1}), TP(${x2}|${y2}). f steigt auf (\u2212\u221e; ${x1}) und (${x2}; \u221e), f\u00e4llt auf (${x1}; ${x2}).`,
  };
}

// ─── Case 2: Grad 3, negativer Leitkoeffizient (smf, smw, smf) ───

function genCubicNegative(): IdentifyPointsExercise {
  const k = pick([1, 2, 3]);
  const d = pick([0, 0, 1, -1]);
  const x1 = -k + d;
  const x2 = k + d;
  const c_coeff = 3 * k * k;
  const fn = (x: number) => -((x - d) ** 3) + c_coeff * (x - d);
  const y1 = fn(x1);
  const y2 = fn(x2);

  const variable = d === 0 ? 'x' : d > 0 ? `(x - ${d})` : `(x + ${-d})`;
  const cubic = variable === 'x' ? '-x\u00b3' : `-${variable}\u00b3`;
  const linear = c_coeff === 0 ? '' : ` + ${c_coeff === 1 ? '' : c_coeff}${variable}`;
  const latex = `f(x) = ${cubic}${linear}`;

  return {
    id: uid(), type: 'identify-points', module: 'monotonie', competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Untersuche f auf Monotonie.',
    targets: [],
    intervalBounds: [x1, x2],
    includeInfinity: true,
    intervalCount: 3,
    correctIntervals: [
      { from: '-\u221e', to: x1, type: 'smf' },
      { from: x1, to: x2, type: 'smw' },
      { from: x2, to: '+\u221e', type: 'smf' },
    ],
    feedbackExplanation: `TP(${x1}|${y1}), HP(${x2}|${y2}). f f\u00e4llt auf (\u2212\u221e; ${x1}) und (${x2}; \u221e), steigt auf (${x1}; ${x2}).`,
  };
}

// ─── Case 3: Grad 2, Parabel (2 Intervalle) ───

function genParabola(): IdentifyPointsExercise {
  const a = pick([1, -1]);
  const xv = pick([-3, -2, -1, 0, 1, 2, 3]);
  const c = pick([0, 1, -1, 2, -2, 3]);
  // f(x) = a*(x - xv)^2 + c = a*x^2 - 2a*xv*x + a*xv^2 + c
  const fn = (x: number) => a * (x - xv) ** 2 + c;
  const yv = c;

  const aStr = a === 1 ? '' : '-';
  const variable = xv === 0 ? 'x\u00b2' : xv > 0 ? `(x - ${xv})\u00b2` : `(x + ${-xv})\u00b2`;
  let latex = `f(x) = ${aStr}${variable}`;
  if (c > 0) latex += ` + ${c}`;
  else if (c < 0) latex += ` - ${-c}`;

  const type1: 'smw' | 'smf' = a > 0 ? 'smf' : 'smw';
  const type2: 'smw' | 'smf' = a > 0 ? 'smw' : 'smf';
  const extremType = a > 0 ? 'TP' : 'HP';

  return {
    id: uid(), type: 'identify-points', module: 'monotonie', competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Untersuche f auf Monotonie.',
    targets: [],
    intervalBounds: [xv],
    includeInfinity: true,
    intervalCount: 2,
    correctIntervals: [
      { from: '-\u221e', to: xv, type: type1 },
      { from: xv, to: '+\u221e', type: type2 },
    ],
    feedbackExplanation: `${extremType}(${xv}|${yv}). f ${type1 === 'smf' ? 'f\u00e4llt' : 'steigt'} auf (\u2212\u221e; ${xv}), ${type2 === 'smw' ? 'steigt' : 'f\u00e4llt'} auf (${xv}; \u221e).`,
  };
}

// ─── Case 4: Grad 4 mit Sattelpunkt (Doppel-NS von f', kein VZW) ───

function genQuarticSattelpunkt(): IdentifyPointsExercise {
  // f(x) = x^4 - 4*p*x^3 where TP at x=3p, Sattelpunkt at x=0
  // Actually: f(x) = x^4 + a*x^3, f'(x) = 4x^3 + 3ax^2 = x^2(4x + 3a)
  // Sattelpunkt at x=0 (Doppel-NS), Extremum at x = -3a/4
  // For integer extremum: a must be multiple of 4. Pick a from {-4, -8, 4, 8}
  const a = pick([-4, 4]); // |xE| = 3a/4 must be ≤ 4 to stay in visible range
  const xE = -3 * a / 4; // extremum x-value
  const fn = (x: number) => x ** 4 + a * x ** 3;
  const yE = fn(xE);

  const aStr = a > 0 ? ` + ${a}x\u00b3` : ` - ${-a}x\u00b3`;
  const latex = `f(x) = x\u2074${aStr}`;

  // f'(x) = x^2(4x + 3a). Sign of f' depends on (4x + 3a) since x^2 >= 0.
  // 4x + 3a = 0 at x = -3a/4 = xE
  // If xE > 0: f' < 0 for x in (-inf, 0) union (0, xE), f' > 0 for x > xE
  //   → f falls on (-inf, xE), rises on (xE, inf)
  // If xE < 0: f' > 0 for x < xE, f' < 0 for x in (xE, 0) union (0, inf)... wait
  // Actually let me recalculate. f'(x) = 4x^3 + 3ax^2 = x^2(4x + 3a)
  // For x != 0: sign of f' = sign of (4x + 3a)
  // 4x + 3a > 0 ↔ x > -3a/4 = xE
  // So f' > 0 for x > xE (and x != 0), f' < 0 for x < xE
  // At x = 0: f'(0) = 0 but no sign change (since x^2 doesn't change sign)
  // So: f falls on (-inf, xE), rises on (xE, inf) — regardless of where 0 is!

  const intervals: MonotonicityInterval[] = [
    { from: '-\u221e', to: xE, type: 'smf' },
    { from: xE, to: '+\u221e', type: 'smw' },
  ];

  return {
    id: uid(), type: 'identify-points', module: 'monotonie', competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Untersuche f auf Monotonie.',
    targets: [],
    intervalBounds: [xE],
    includeInfinity: true,
    intervalCount: 2,
    correctIntervals: intervals,
    feedbackExplanation: `f\u2019(x) = x\u00b2(4x ${a * 3 > 0 ? '+' : '\u2212'} ${Math.abs(3 * a)}). ` +
      `Bei x = 0 hat f\u2019 eine Doppel-Nullstelle (kein VZW!) \u2014 dort \u00e4ndert sich das Monotonieverhalten NICHT. ` +
      `Erst bei x = ${xE} wechselt f\u2019 das Vorzeichen. ` +
      `TP(${xE}|${yE}). f f\u00e4llt auf (\u2212\u221e; ${xE}), steigt auf (${xE}; \u221e).`,
  };
}

// ─── Case 5: x^3 — überall streng monoton (keine Änderungsstelle) ───

function genCubicNoChange(): IdentifyPointsExercise {
  // f(x) = a*(x-d)^3 + c, streng monoton auf ganz R
  const a = pick([1, -1]);
  const d = pick([0, 0, 1, -1, 2]);
  const c = pick([0, 0, 1, -1, 3, -2]);
  const fn = (x: number) => a * (x - d) ** 3 + c;

  const variable = d === 0 ? 'x' : d > 0 ? `(x - ${d})` : `(x + ${-d})`;
  const aStr = a === 1 ? '' : '-';
  let latex = `f(x) = ${aStr}${variable}\u00b3`;
  if (c > 0) latex += ` + ${c}`;
  else if (c < 0) latex += ` - ${-c}`;

  const type: 'smw' | 'smf' = a > 0 ? 'smw' : 'smf';
  const word = type === 'smw' ? 'steigend' : 'fallend';

  return {
    id: uid(), type: 'identify-points', module: 'monotonie', competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Untersuche f auf Monotonie.',
    targets: [],
    intervalBounds: [],
    includeInfinity: true,
    intervalCount: 1,
    correctIntervals: [
      { from: '-\u221e', to: '+\u221e', type },
    ],
    feedbackExplanation: `f ist auf ganz \u211d streng monoton ${word}. ` +
      (d === 0
        ? `f\u2019(0) = 0 (waagerechte Tangente), aber das Monotonieverhalten \u00e4ndert sich trotzdem nicht \u2014 eine einzelne Stelle mit f\u2019 = 0 verhindert strenge Monotonie nicht!`
        : `f\u2019(${d}) = 0, aber das ist nur eine waagerechte Tangente, kein Monotoniewechsel.`),
  };
}

// ─── Case 6: Zwei-Phasen (Änderungsstellen finden + klassifizieren), Grad 3 ───

function genTwoPhase(): IdentifyPointsExercise {
  const base = genCubicPositive();
  const bounds = base.intervalBounds!;
  // Add distractors to the extremaOptions
  const distractors = new Set<number>();
  distractors.add(0);
  for (const b of bounds) {
    distractors.add(b - 1);
    distractors.add(b + 1);
  }
  // Remove actual bounds from distractors
  for (const b of bounds) distractors.delete(b);
  const allOptions = [...bounds, ...Array.from(distractors)].sort((a, b) => a - b);
  const correctIndices = bounds.map(b => allOptions.indexOf(b));

  return {
    ...base,
    id: uid(),
    extremaOptions: {
      xValues: allOptions,
      correctIndices,
    },
  };
}

// ─── Case 7: Zwei-Phasen, x^3 — KEINE Änderungsstelle ───

function genTwoPhaseNoChange(): IdentifyPointsExercise {
  const base = genCubicNoChange();
  return {
    ...base,
    id: uid(),
    extremaOptions: {
      xValues: [-2, -1, 0, 1, 2],
      correctIndices: [],
      prompt: 'An welchen Stellen \u00e4ndert f ihr Monotonieverhalten? W\u00e4hle alle aus \u2014 oder keine.',
    },
  };
}

// ─── Case 8: Zwei-Phasen, Grad 4 Sattelpunkt ───

function genTwoPhaseSattelpunkt(): IdentifyPointsExercise {
  const base = genQuarticSattelpunkt();
  const xE = base.intervalBounds![0];
  const allOptions = [0, xE].sort((a, b) => a - b);
  // Add some distractors
  const opts = [-2, -1, ...allOptions, xE + 1, xE + 2].filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b);
  const correctIdx = opts.indexOf(xE);

  return {
    ...base,
    id: uid(),
    extremaOptions: {
      xValues: opts,
      correctIndices: [correctIdx],
      prompt: 'An welchen Stellen \u00e4ndert f ihr Monotonieverhalten? Achtung: nicht jede Nullstelle von f\u2019 ist eine \u00c4nderungsstelle!',
    },
  };
}

// ─── Public API ───

export const MONOTONIE_INTERVAL_CASES: CaseDefinition[] = [
  { id: 'cubic-pos', label: 'Grad 3, positiv', generate: genCubicPositive },
  { id: 'cubic-neg', label: 'Grad 3, negativ', generate: genCubicNegative },
  { id: 'parabola', label: 'Grad 2, Parabel', generate: genParabola },
  { id: 'quartic-sat', label: 'Grad 4, Sattelpunkt', generate: genQuarticSattelpunkt },
  { id: 'cubic-no-change', label: '\u00dcberall monoton', generate: genCubicNoChange },
  { id: 'two-phase', label: '\u00c4nderungsstellen finden', generate: genTwoPhase },
  { id: 'two-phase-none', label: 'Keine \u00c4nderungsstelle', generate: genTwoPhaseNoChange },
  { id: 'two-phase-sat', label: 'Sattelpunkt erkennen', generate: genTwoPhaseSattelpunkt },
];

export const monotonieIntervalGenerator: ExerciseGenerator = {
  generate(): IdentifyPointsExercise {
    const caseIdx = Math.floor(Math.random() * MONOTONIE_INTERVAL_CASES.length);
    return MONOTONIE_INTERVAL_CASES[caseIdx].generate() as IdentifyPointsExercise;
  },
};
