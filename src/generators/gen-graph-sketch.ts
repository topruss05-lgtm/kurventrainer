import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { GraphSketchExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return `gs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

// ─── Case 1: Graph aus Monotonie-Bedingungen ───

function genSketchMonotonie(): GraphSketchExercise {
  // f(x) = a(x - x1)(x - x2)² + shift or similar cubic with known monotonie behavior
  // Use f(x) = (x - x1)²(x - x2) which has extrema at x1 (TP or HP) and between x1, x2
  const x1 = pick([-2, -1, 0]);
  const x2 = x1 + pick([2, 3, 4]);

  // f(x) = (x - x1)²(x - x2) — cubic with double root at x1, simple root at x2
  // Leading coeff positive → for x→+∞: f→+∞
  // f'(x) = 2(x-x1)(x-x2) + (x-x1)² = (x-x1)[2(x-x2) + (x-x1)] = (x-x1)(3x - 2x2 - x1)
  // Extrema at x = x1 and x = (2*x2 + x1)/3
  const xE = (2 * x2 + x1) / 3;

  // Monotonie: f smw on (-∞, x1) if x1 < xE, smf on (x1, xE), smw on (xE, +∞)
  // Actually for (x-x1)²(x-x2) with x2 > x1:
  // f'(x1) = 0 → local max or min? f(x1) = 0. f'(x) = (x-x1)(3x-2x2-x1)
  // At x slightly < x1: (neg)(neg if 3x < 2x2+x1) → depends. Let's compute sign.
  // 3*x1 - 2*x2 - x1 = 2*x1 - 2*x2 = 2(x1-x2) < 0, so (3x-2x2-x1) < 0 near x1
  // x slightly < x1: (x-x1)<0, (3x-2x2-x1)<0 → f' > 0
  // x slightly > x1: (x-x1)>0, (3x-2x2-x1)<0 → f' < 0
  // So x1 is a local maximum, xE is a local minimum.
  // f smw on (-∞, x1), smf on (x1, xE), smw on (xE, +∞)

  const xERounded = Math.round(xE * 10) / 10;
  const xELabel = Number.isInteger(xE) ? `${xE}` : `${xERounded}`;

  const conditions = [
    `f ist auf (-\\infty,\\, ${x1}) streng monoton wachsend`,
    `f ist auf (${x1},\\, ${xELabel}) streng monoton fallend`,
    `f ist auf (${xELabel},\\, +\\infty) streng monoton wachsend`,
  ];

  const correctCoeffs = [1, -(2 * x1 + x2), x1 * (x1 + 2 * x2), -x1 * x1 * x2];
  // (x-x1)²(x-x2) expanded: x³ - (2x1+x2)x² + (x1²+2x1x2)x - x1²x2

  // Distractor 1: reflected (negative leading coeff) — wrong monotonie
  const d1Coeffs = correctCoeffs.map((c, i) => i === 0 ? -c : -c);

  // Distractor 2: shifted right by 2
  const s = 2;
  const d2x1 = x1 + s;
  const d2x2 = x2 + s;
  const d2Coeffs = [1, -(2 * d2x1 + d2x2), d2x1 * (d2x1 + 2 * d2x2), -d2x1 * d2x1 * d2x2];

  // Distractor 3: quadratic (wrong degree — only one extremum)
  const d3Coeffs = [1, -(x1 + x2), x1 * x2];

  const graphOptions = shuffle([
    {
      id: 'opt-correct',
      function: {
        latex: `f(x) = ${formatPolynomial(correctCoeffs)}`,
        fn: (x: number) => evalPoly(correctCoeffs, x),
      },
      isCorrect: true,
    },
    {
      id: 'opt-reflected',
      function: {
        latex: `g(x) = ${formatPolynomial(d1Coeffs)}`,
        fn: (x: number) => evalPoly(d1Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-shifted',
      function: {
        latex: `h(x) = ${formatPolynomial(d2Coeffs)}`,
        fn: (x: number) => evalPoly(d2Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-quadratic',
      function: {
        latex: `p(x) = ${formatPolynomial(d3Coeffs)}`,
        fn: (x: number) => evalPoly(d3Coeffs, x),
      },
      isCorrect: false,
    },
  ]);

  return {
    id: uid(),
    type: 'graph-sketch',
    module: 'monotonie',
    competency: 'K2',
    function: {
      latex: `f(x) = ${formatPolynomial(correctCoeffs)}`,
      fn: (x: number) => evalPoly(correctCoeffs, x),
    },
    conditions,
    graphOptions,
    explanation:
      `Der korrekte Graph hat einen Hochpunkt bei x = ${x1} und einen Tiefpunkt bei x ≈ ${xELabel}. ` +
      `Dazwischen fällt f (smf), außerhalb steigt f (smw). ` +
      `Der gespiegelte Graph hat umgekehrtes Monotonieverhalten. ` +
      `Der verschobene Graph hat die Extremstellen an falschen x-Werten. ` +
      `Die Parabel hat nur ein Extremum, nicht zwei.`,
  };
}

// ─── Case 2: Graph aus Nullstellen + Verhalten ───

function genSketchNullstellen(): GraphSketchExercise {
  // Cubic through three roots with positive leading coeff
  const roots = [randInt(-3, -1), randInt(0, 1), randInt(2, 4)];
  const [r1, r2, r3] = roots;

  // f(x) = (x - r1)(x - r2)(x - r3)
  // Expanded: x³ - (r1+r2+r3)x² + (r1r2+r1r3+r2r3)x - r1r2r3
  const sum = r1 + r2 + r3;
  const pairSum = r1 * r2 + r1 * r3 + r2 * r3;
  const prod = r1 * r2 * r3;
  const correctCoeffs = [1, -sum, pairSum, -prod];

  const conditions = [
    `f hat Nullstellen bei x = ${r1}, x = ${r2} und x = ${r3}`,
    `Für x \\to +\\infty gilt f(x) \\to +\\infty`,
  ];

  // Distractor 1: wrong end behavior (negative leading coeff)
  const d1Coeffs = correctCoeffs.map(c => -c);

  // Distractor 2: missing one root, extra root elsewhere
  const r4 = r3 + 2;
  const d2Sum = r1 + r2 + r4;
  const d2PairSum = r1 * r2 + r1 * r4 + r2 * r4;
  const d2Prod = r1 * r2 * r4;
  const d2Coeffs = [1, -d2Sum, d2PairSum, -d2Prod];

  // Distractor 3: extra root (quartic)
  const r5 = r1 - 1;
  // (x-r1)(x-r2)(x-r3)(x-r5), but simplify: just make a quartic through r1,r2,r3,r5
  const d3Fn = (x: number) => (x - r1) * (x - r2) * (x - r3) * (x - r5) * 0.25;

  const graphOptions = shuffle([
    {
      id: 'opt-correct',
      function: {
        latex: `f(x) = ${formatPolynomial(correctCoeffs)}`,
        fn: (x: number) => evalPoly(correctCoeffs, x),
      },
      isCorrect: true,
    },
    {
      id: 'opt-wrong-end',
      function: {
        latex: `g(x) = ${formatPolynomial(d1Coeffs)}`,
        fn: (x: number) => evalPoly(d1Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-wrong-root',
      function: {
        latex: `h(x) = ${formatPolynomial(d2Coeffs)}`,
        fn: (x: number) => evalPoly(d2Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-extra-root',
      function: {
        latex: `p(x) = 0{,}25(x ${r1 >= 0 ? `- ${r1}` : `+ ${-r1}`})(x ${r2 >= 0 ? `- ${r2}` : `+ ${-r2}`})(x ${r3 >= 0 ? `- ${r3}` : `+ ${-r3}`})(x ${r5 >= 0 ? `- ${r5}` : `+ ${-r5}`})`,
        fn: d3Fn,
      },
      isCorrect: false,
    },
  ]);

  return {
    id: uid(),
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K2',
    function: {
      latex: `f(x) = ${formatPolynomial(correctCoeffs)}`,
      fn: (x: number) => evalPoly(correctCoeffs, x),
    },
    conditions,
    graphOptions,
    explanation:
      `Der korrekte Graph schneidet die x-Achse genau bei x = ${r1}, ${r2}, ${r3} und steigt für x → +∞. ` +
      `Graph mit negativem Leitkoeffizient fällt für x → +∞ (falsches Verhalten). ` +
      `Graph mit verschobener Nullstelle hat x = ${r4} statt x = ${r3}. ` +
      `Der Grad-4-Graph hat eine zusätzliche Nullstelle bei x = ${r5}.`,
  };
}

// ─── Case 3: Graph aus Extrema-Info ───

function genSketchExtrema(): GraphSketchExercise {
  // f(x) = a(x - xHP)(x - xTP)... cubic with given HP and TP
  // Use f(x) = -(x - xHP)²(x - r) with r chosen to get desired TP
  // Simpler: use f(x) = -x³ + bx² + cx + d parameterized by HP and TP

  // HP at x = xHP, TP at x = xTP with xHP < xTP
  const xHP = pick([-2, -1, 0]);
  const xTP = xHP + pick([2, 3]);

  // f'(x) = -3(x - xHP)(x - xTP) = -3x² + 3(xHP+xTP)x - 3*xHP*xTP
  // Integrate: f(x) = -x³ + (3/2)(xHP+xTP)x² - 3*xHP*xTP*x + C
  // To get integer-friendly values, multiply by 2/3:
  // g(x) = -2/3 x³ + (xHP+xTP)x² - 2*xHP*xTP*x + C
  // Still messy. Use a simpler approach: f(x) = -(x-m)³ + s*(x-m) + yShift
  // where m = (xHP+xTP)/2, and extrema are symmetric around m.

  // Even simpler: f(x) = a*x³ + b*x² + c*x + d, with a = -1
  // f'(x) = -3x² + 2bx + c = -3(x - xHP)(x - xTP)
  // -3(x - xHP)(x - xTP) = -3x² + 3(xHP+xTP)x - 3*xHP*xTP
  // So 2b = 3(xHP+xTP) → b = 3(xHP+xTP)/2
  // c = -3*xHP*xTP

  // For integer b, need xHP+xTP even
  // xHP ∈ {-2,0}, xTP = xHP+2 → sum always even ✓
  // Redefine to ensure even sums:
  const sumHPTP = xHP + xTP;

  // Use scale factor 2 to avoid fractions:
  // f(x) = -2x³ + 3*sumHPTP*x² - 6*xHP*xTP*x + d
  const a = -2;
  const b = 3 * sumHPTP;
  const c = -6 * xHP * xTP;
  const d = randInt(-2, 2);

  const fCoeffs = [a, b, c, d];

  const yHP = evalPoly(fCoeffs, xHP);
  const yTP = evalPoly(fCoeffs, xTP);
  const y0 = evalPoly(fCoeffs, 0);

  const conditions = [
    `f hat einen Hochpunkt HP(${xHP}|${yHP})`,
    `f hat einen Tiefpunkt TP(${xTP}|${yTP})`,
    `f(0) = ${y0}`,
  ];

  // Distractor 1: swapped HP/TP (positive leading coeff)
  const d1Coeffs = fCoeffs.map(c => -c);

  // Distractor 2: wrong y-values (vertical shift)
  const shift = pick([3, -3, 5, -5]);
  const d2Coeffs = [...fCoeffs];
  d2Coeffs[d2Coeffs.length - 1] += shift;

  // Distractor 3: different extrema positions (shifted x)
  const xShift = pick([1, -1, 2]);
  const d3xHP = xHP + xShift;
  const d3xTP = xTP + xShift;
  const d3Sum = d3xHP + d3xTP;
  const d3Coeffs = [-2, 3 * d3Sum, -6 * d3xHP * d3xTP, d];

  const graphOptions = shuffle([
    {
      id: 'opt-correct',
      function: {
        latex: `f(x) = ${formatPolynomial(fCoeffs)}`,
        fn: (x: number) => evalPoly(fCoeffs, x),
      },
      isCorrect: true,
    },
    {
      id: 'opt-swapped',
      function: {
        latex: `g(x) = ${formatPolynomial(d1Coeffs)}`,
        fn: (x: number) => evalPoly(d1Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-shifted-y',
      function: {
        latex: `h(x) = ${formatPolynomial(d2Coeffs)}`,
        fn: (x: number) => evalPoly(d2Coeffs, x),
      },
      isCorrect: false,
    },
    {
      id: 'opt-shifted-x',
      function: {
        latex: `p(x) = ${formatPolynomial(d3Coeffs)}`,
        fn: (x: number) => evalPoly(d3Coeffs, x),
      },
      isCorrect: false,
    },
  ]);

  return {
    id: uid(),
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K2',
    function: {
      latex: `f(x) = ${formatPolynomial(fCoeffs)}`,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    conditions,
    graphOptions,
    explanation:
      `Der korrekte Graph hat HP(${xHP}|${yHP}) und TP(${xTP}|${yTP}) mit f(0) = ${y0}. ` +
      `Der gespiegelte Graph hat HP und TP vertauscht (Leitkoeffizient positiv statt negativ). ` +
      `Der vertikal verschobene Graph hat falsche y-Werte an den Extremstellen. ` +
      `Der horizontal verschobene Graph hat die Extremstellen an den falschen x-Positionen.`,
  };
}

// ─── Public API ───

export const GRAPH_SKETCH_CASES: CaseDefinition[] = [
  { id: 'sketch-monotonie', label: 'Graph aus Monotonie-Bedingungen', generate: genSketchMonotonie },
  { id: 'sketch-nullstellen', label: 'Graph aus Nullstellen + Verhalten', generate: genSketchNullstellen },
  { id: 'sketch-extrema', label: 'Graph aus Extrema-Info', generate: genSketchExtrema },
];

export const graphSketchGenerator: ExerciseGenerator = {
  generate(): GraphSketchExercise {
    const caseIdx = Math.floor(Math.random() * GRAPH_SKETCH_CASES.length);
    return GRAPH_SKETCH_CASES[caseIdx].generate() as GraphSketchExercise;
  },
};
