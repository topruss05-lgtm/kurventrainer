import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { IdentifyPointsExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return 'gen-idext-' + Math.random().toString(36).slice(2, 9);
}

// ─── Case 1: Minimum ablesen (Parabel, a > 0) ───

function genMinParabola(): IdentifyPointsExercise {
  const h = pick([-3, -2, -1, 0, 1, 2, 3]);
  const k = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  const a = pick([1, 2]);

  const fn = (x: number) => a * (x - h) ** 2 + k;

  // LaTeX: a(x - h)² + k
  const aStr = a === 1 ? '' : `${a}`;
  const variable = h === 0 ? 'x' : h > 0 ? `(x - ${h})` : `(x + ${-h})`;
  let latex = `f(x) = ${aStr}${variable}^2`;
  if (k > 0) latex += ` + ${k}`;
  else if (k < 0) latex += ` - ${-k}`;

  return {
    id: uid(),
    type: 'identify-points',
    module: 'extremstellen',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'minima',
    prompt: 'Markiere alle Minima im Graph.',
    targets: [{ x: h, y: k }],
    feedbackExplanation: `Der Tiefpunkt liegt bei TP(${h} | ${k}). Da a = ${a} > 0, ist die Parabel nach oben geöffnet und hat ein Minimum.`,
  };
}

// ─── Case 2: Maximum ablesen (Parabel, a < 0) ───

function genMaxParabola(): IdentifyPointsExercise {
  const h = pick([-3, -2, -1, 0, 1, 2, 3]);
  const k = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  const a = pick([-1, -2]);

  const fn = (x: number) => a * (x - h) ** 2 + k;

  const aStr = a === -1 ? '-' : `${a}`;
  const variable = h === 0 ? 'x' : h > 0 ? `(x - ${h})` : `(x + ${-h})`;
  let latex = `f(x) = ${aStr}${variable}^2`;
  if (k > 0) latex += ` + ${k}`;
  else if (k < 0) latex += ` - ${-k}`;

  return {
    id: uid(),
    type: 'identify-points',
    module: 'extremstellen',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'maxima',
    prompt: 'Markiere alle Maxima im Graph.',
    targets: [{ x: h, y: k }],
    feedbackExplanation: `Der Hochpunkt liegt bei HP(${h} | ${k}). Da a = ${a} < 0, ist die Parabel nach unten geöffnet und hat ein Maximum.`,
  };
}

// ─── Case 3: Extrema ablesen (kubisch, HP + TP) ───

function genExtremaCubic(): IdentifyPointsExercise {
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // f'(x) = 3(x - x1)(x - x2) where x1 < x2
    // → HP at x1, TP at x2
    const evens = [-4, -2, 0, 2, 4];
    const odds = [-3, -1, 1, 3];
    const pool = Math.random() < 0.5 ? evens : odds;

    let idx1 = Math.floor(Math.random() * pool.length);
    let idx2 = Math.floor(Math.random() * pool.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * pool.length);
    }

    let x1 = pool[idx1];
    let x2 = pool[idx2];
    if (x1 > x2) [x1, x2] = [x2, x1];

    const s = x1 + x2;
    const p = x1 * x2;
    // f(x) = x³ - (3s/2)x² + 3p·x + d
    const a = 1;
    const b = -(3 * s) / 2;
    const c = 3 * p;
    const d = pick([0, 1, -1, 2, -2]);
    const coeffs = [a, b, c, d];

    const evalPoly = (x: number) => {
      let result = 0;
      for (let i = 0; i < coeffs.length; i++) {
        result = result * x + coeffs[i];
      }
      return result;
    };

    const y1 = evalPoly(x1);
    const y2 = evalPoly(x2);

    if (Math.abs(y1) > 50 || Math.abs(y2) > 50) continue;

    // Build LaTeX
    const parts: string[] = [];
    for (let i = 0; i < coeffs.length; i++) {
      const coeff = coeffs[i];
      const deg = 3 - i;
      if (coeff === 0) continue;

      let term = '';
      if (parts.length === 0) {
        if (coeff < 0) term += '-';
      } else {
        term += coeff > 0 ? ' + ' : ' - ';
      }

      const absC = Math.abs(coeff);
      if (deg === 0) {
        term += `${absC}`;
      } else if (absC === 1) {
        term += deg === 1 ? 'x' : `x^{${deg}}`;
      } else {
        // Handle fractional coefficients
        if (absC === Math.floor(absC)) {
          term += deg === 1 ? `${absC}x` : `${absC}x^{${deg}}`;
        } else {
          const num = absC * 2;
          term += deg === 1 ? `\\frac{${num}}{2}x` : `\\frac{${num}}{2}x^{${deg}}`;
        }
      }
      parts.push(term);
    }
    const latex = `f(x) = ${parts.join('')}`;

    return {
      id: uid(),
      type: 'identify-points',
      module: 'extremstellen',
      competency: 'K1',
      function: { latex, fn: evalPoly },
      targetType: 'extrema',
      prompt: 'Markiere alle Extremstellen im Graph.',
      targets: [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ],
      feedbackExplanation: `Hochpunkt bei HP(${x1} | ${y1}), Tiefpunkt bei TP(${x2} | ${y2}).`,
    };
  }

  // Fallback: f(x) = x³ - 3x → HP(-1, 2), TP(1, -2)
  const fn = (x: number) => x ** 3 - 3 * x;
  return {
    id: uid(),
    type: 'identify-points',
    module: 'extremstellen',
    competency: 'K1',
    function: { latex: 'f(x) = x^{3} - 3x', fn },
    targetType: 'extrema',
    prompt: 'Markiere alle Extremstellen im Graph.',
    targets: [
      { x: -1, y: 2 },
      { x: 1, y: -2 },
    ],
    feedbackExplanation: 'Hochpunkt bei HP(-1 | 2), Tiefpunkt bei TP(1 | -2).',
  };
}

// ─── Case 4: Extrema ablesen (Grad 4) ───
// f(x) = x⁴ - 2b²x² with b ∈ {1, 2}
// f'(x) = 4x³ - 4b²x = 4x(x² - b²) = 4x(x-b)(x+b)
// Zeros at x = 0, ±b
// f''(x) = 12x² - 4b²
// f''(0) = -4b² < 0 → HP at (0, 0)
// f''(±b) = 12b² - 4b² = 8b² > 0 → TP at (±b, -b⁴)

function genExtremaQuartic(): IdentifyPointsExercise {
  const b = pick([1, 2]);
  const bSq = b * b;
  const bFourth = bSq * bSq; // b⁴

  // f(x) = x⁴ - 2b²x²
  const fn = (x: number) => x ** 4 - 2 * bSq * x ** 2;

  // Targets: HP(0, 0), TP(-b, -b⁴), TP(b, -b⁴)
  const targets = [
    { x: 0, y: 0 },
    { x: -b, y: -bFourth },
    { x: b, y: -bFourth },
  ];

  // Verify |y| ≤ 50 (b=1: -1, b=2: -16, both fine)
  const twoBSq = 2 * bSq;
  let latex: string;
  if (twoBSq === 2) {
    latex = 'f(x) = x^{4} - 2x^{2}';
  } else {
    latex = `f(x) = x^{4} - ${twoBSq}x^{2}`;
  }

  return {
    id: uid(),
    type: 'identify-points',
    module: 'extremstellen',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'extrema',
    prompt: 'Markiere alle Extremstellen im Graph.',
    targets,
    feedbackExplanation: `Hochpunkt bei HP(0 | 0), Tiefpunkte bei TP(${-b} | ${-bFourth}) und TP(${b} | ${-bFourth}).`,
  };
}

// ─── Public API ───

export const EXTREMA_IDENTIFY_CASES: CaseDefinition[] = [
  { id: 'min-parabola', label: 'Minimum ablesen (Parabel)', generate: genMinParabola },
  { id: 'max-parabola', label: 'Maximum ablesen (Parabel)', generate: genMaxParabola },
  { id: 'extrema-cubic', label: 'Extrema ablesen (kubisch)', generate: genExtremaCubic },
  { id: 'extrema-quartic', label: 'Extrema ablesen (Grad 4)', generate: genExtremaQuartic },
];

export const extremaIdentifyGenerator: ExerciseGenerator = {
  generate(): IdentifyPointsExercise {
    const caseIdx = Math.floor(Math.random() * EXTREMA_IDENTIFY_CASES.length);
    return EXTREMA_IDENTIFY_CASES[caseIdx].generate() as IdentifyPointsExercise;
  },
};
