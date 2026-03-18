import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { StepByStepExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return 'gen-wende-' + Math.random().toString(36).slice(2, 9);
}

/** Shuffle an array in place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Polynomial formatting ───

/**
 * Format a polynomial f(x) = ax³ + bx² + cx + d as LaTeX.
 * Handles signs, coefficients of ±1, and zero terms cleanly.
 */
function formatPolynomial(a: number, b: number, c: number, d: number): string {
  const parts: string[] = [];

  if (a !== 0) {
    if (a === 1) parts.push('x^3');
    else if (a === -1) parts.push('-x^3');
    else parts.push(`${a}x^3`);
  }

  if (b !== 0) {
    const abs = Math.abs(b);
    const sign = b > 0 && parts.length > 0 ? ' + ' : b < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    const coeff = abs === 1 ? '' : String(abs);
    parts.push(`${sign}${coeff}x^2`);
  }

  if (c !== 0) {
    const abs = Math.abs(c);
    const sign = c > 0 && parts.length > 0 ? ' + ' : c < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    const coeff = abs === 1 ? '' : String(abs);
    parts.push(`${sign}${coeff}x`);
  }

  if (d !== 0 || parts.length === 0) {
    const abs = Math.abs(d);
    const sign = d > 0 && parts.length > 0 ? ' + ' : d < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    parts.push(`${sign}${abs}`);
  }

  return parts.join('');
}

/** Format linear polynomial mx + n. */
function formatLinearPoly(m: number, n: number): string {
  const parts: string[] = [];

  if (m !== 0) {
    if (m === 1) parts.push('x');
    else if (m === -1) parts.push('-x');
    else parts.push(`${m}x`);
  }

  if (n !== 0 || parts.length === 0) {
    const abs = Math.abs(n);
    const sign = n > 0 && parts.length > 0 ? ' + ' : n < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    parts.push(`${sign}${abs}`);
  }

  return parts.join('');
}

/** Format quadratic ax² + bx + c. */
function formatQuadratic(a: number, b: number, c: number): string {
  const parts: string[] = [];

  if (a !== 0) {
    if (a === 1) parts.push('x^2');
    else if (a === -1) parts.push('-x^2');
    else parts.push(`${a}x^2`);
  }

  if (b !== 0) {
    const abs = Math.abs(b);
    const sign = b > 0 && parts.length > 0 ? ' + ' : b < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    const coeff = abs === 1 ? '' : String(abs);
    parts.push(`${sign}${coeff}x`);
  }

  if (c !== 0 || parts.length === 0) {
    const abs = Math.abs(c);
    const sign = c > 0 && parts.length > 0 ? ' + ' : c < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    parts.push(`${sign}${abs}`);
  }

  return parts.join('');
}

// ─── Core math ───

interface CubicParams {
  a: number;  // leading coefficient: 1 or -1
  b: number;  // x² coefficient (divisible by 3)
  c: number;  // x coefficient
  d: number;  // constant
  xw: number; // Wendestelle = -b / (3a)
}

function generateParams(): CubicParams {
  const a = pick([1, -1]);
  const b = pick([-6, -3, 0, 3, 6]);
  const xw = -b / (3 * a);
  const c = pick([-9, -6, -3, 0, 3, 6, 9]);
  const d = pick([0, 1, -1, 2, -2, 4, -4]);
  return { a, b, c, d, xw };
}

function evalF(p: CubicParams, x: number): number {
  return p.a * x * x * x + p.b * x * x + p.c * x + p.d;
}

function evalFPrime(p: CubicParams, x: number): number {
  return 3 * p.a * x * x + 2 * p.b * x + p.c;
}

function evalFDoublePrime(p: CubicParams, x: number): number {
  return 6 * p.a * x + 2 * p.b;
}

function evalFTriplePrime(p: CubicParams): number {
  return 6 * p.a;
}

/**
 * Generate valid cubic params with |y_w| ≤ 50, |tangent intercept| ≤ 50, |slope| ≤ 50.
 */
function generateValidParams(): CubicParams {
  for (let attempt = 0; attempt < 50; attempt++) {
    const p = generateParams();
    const yw = evalF(p, p.xw);
    if (Math.abs(yw) > 50) continue;
    const m = evalFPrime(p, p.xw);
    if (Math.abs(m) > 50) continue;
    const tangentB = yw - m * p.xw;
    if (Math.abs(tangentB) > 50) continue;
    return p;
  }
  // Fallback: f(x) = x³
  return { a: 1, b: 0, c: 0, d: 0, xw: 0 };
}

// ─── MC distractor helpers ───

/** Generate f''(x) MC options: 1 correct + 3 wrong, shuffled. Returns [options, correctIndex]. */
function generateSecondDerivMC(p: CubicParams): [string[], number] {
  const correctStr = `f''(x) = ${formatLinearPoly(6 * p.a, 2 * p.b)}`;

  const distractors: string[] = [];

  // Wrong 1: forgot to multiply exponent (derivative of ax³ → ax² instead of 3ax²)
  distractors.push(`f''(x) = ${formatLinearPoly(2 * p.a, 2 * p.b)}`);

  // Wrong 2: sign error on second term
  distractors.push(`f''(x) = ${formatLinearPoly(6 * p.a, -2 * p.b)}`);

  // Wrong 3: confused f' with f'' (show quadratic — f'(x))
  distractors.push(`f''(x) = ${formatQuadratic(3 * p.a, 2 * p.b, p.c)}`);

  // Remove duplicates with correct answer, replace with fallback
  const unique = distractors.filter(d => d !== correctStr);
  while (unique.length < 3) {
    unique.push(`f''(x) = ${formatLinearPoly(6 * p.a + unique.length + 1, 2 * p.b + 1)}`);
  }

  const options = [correctStr, unique[0], unique[1], unique[2]];
  shuffle(options);
  return [options, options.indexOf(correctStr)];
}

/** Generate tangent line MC options. Returns [options, correctIndex]. */
function generateTangentMC(m: number, xw: number, yw: number): [string[], number] {
  const bCorrect = yw - m * xw;
  const correctStr = `y = ${formatLinearPoly(m, bCorrect)}`;

  const distractors: string[] = [];

  // Wrong 1: forgot f(x_w), only y = mx
  distractors.push(`y = ${formatLinearPoly(m, 0)}`);

  // Wrong 2: used +m·x_w instead of -m·x_w
  distractors.push(`y = ${formatLinearPoly(m, yw + m * xw)}`);

  // Wrong 3: m and b swapped
  if (bCorrect !== 0 && m !== bCorrect) {
    distractors.push(`y = ${formatLinearPoly(bCorrect, m)}`);
  } else {
    // fallback: wrong slope sign
    distractors.push(`y = ${formatLinearPoly(-m, yw - (-m) * xw)}`);
  }

  // Remove duplicates
  const unique = distractors.filter(d => d !== correctStr);
  while (unique.length < 3) {
    unique.push(`y = ${formatLinearPoly(m, bCorrect + unique.length + 1)}`);
  }

  const options = [correctStr, unique[0], unique[1], unique[2]];
  shuffle(options);
  return [options, options.indexOf(correctStr)];
}

// ─── Shared builders ───

function buildDerivatives(p: CubicParams) {
  const { a, b, c } = p;
  const fppStr = formatLinearPoly(6 * a, 2 * b);
  const fTriplePrime = evalFTriplePrime(p);
  return {
    first: {
      latex: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}`,
      fn: (x: number) => evalFPrime(p, x),
    },
    second: {
      latex: `f''(x) = ${fppStr}`,
      fn: (x: number) => evalFDoublePrime(p, x),
    },
    third: {
      latex: `f'''(x) = ${fTriplePrime}`,
      fn: () => fTriplePrime,
    },
  };
}

// ─── Case 1: Wendestellen-Nachweis (geführt) ───

function genD3Guided(): StepByStepExercise {
  const p = generateValidParams();
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const yw = evalF(p, xw);
  const fppStr = formatLinearPoly(6 * a, 2 * b);
  const fTriplePrime = evalFTriplePrime(p);

  const [fppOptions, fppCorrect] = generateSecondDerivMC(p);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendestellen-nachweis',
    function: { latex: fLatex, fn: (x: number) => evalF(p, x) },
    derivatives: buildDerivatives(p),
    steps: [
      {
        instruction: 'Welches ist f\'\'(x)?',
        inputType: 'multiple-choice',
        options: fppOptions,
        correctAnswer: fppCorrect,
        hint: 'Leite f(x) zweimal ab. Potenzregel: Die Ableitung von ax^n ist n \\cdot a \\cdot x^{n-1}.',
        explanation: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}, also f''(x) = ${fppStr}.`,
      },
      {
        instruction: 'Setze f\'\'(x) = 0. Welche Lösung ergibt sich?',
        inputType: 'number-set',
        correctAnswer: [xw],
        hint: `Löse ${fppStr} = 0 nach x auf.`,
        explanation: `${fppStr} = 0 \\Rightarrow x = ${xw}.`,
      },
      {
        instruction: `Ist f'''(${xw}) \\neq 0?`,
        inputType: 'sign-choice',
        options: ['\\neq 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: 0,
        hint: 'Berechne f\'\'\'(x). Für kubische Funktionen ist f\'\'\'(x) eine Konstante.',
        explanation: `f'''(x) = ${fTriplePrime}. Da ${fTriplePrime} \\neq 0, ist x = ${xw} eine Wendestelle.`,
      },
      {
        instruction: `Berechne f(${xw}).`,
        inputType: 'number',
        correctAnswer: yw,
        hint: `Setze x = ${xw} in f(x) = ${formatPolynomial(a, b, c, d)} ein.`,
        explanation: `f(${xw}) = ${yw}.`,
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [xw, yw],
        hint: 'Der Wendepunkt hat die Koordinaten (x_W | f(x_W)).',
        explanation: `W(${xw} | ${yw}).`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: xw, y: yw, label: `W(${xw}|${yw})`, color: '#e74c3c' },
      ],
    },
  };
}

// ─── Case 2: Wendestellen-Nachweis (frei) ───

function genD3Free(): StepByStepExercise {
  const p = generateValidParams();
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const yw = evalF(p, xw);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendestellen-nachweis',
    function: { latex: fLatex, fn: (x: number) => evalF(p, x) },
    derivatives: buildDerivatives(p),
    steps: [
      {
        instruction: 'Bestimme den Wendepunkt von f.',
        inputType: 'coordinate',
        correctAnswer: [xw, yw],
        hint: 'Setze f\'\'(x) = 0, prüfe f\'\'\'(x) \\neq 0, berechne f(x_W).',
        explanation: `f''(x) = ${formatLinearPoly(6 * a, 2 * b)} = 0 \\Rightarrow x_W = ${xw}. f'''(x) = ${evalFTriplePrime(p)} \\neq 0. f(${xw}) = ${yw}. Also W(${xw} | ${yw}).`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: xw, y: yw, label: `W(${xw}|${yw})`, color: '#e74c3c' },
      ],
    },
  };
}

// ─── Case 3: Wendetangente (geführt) ───

function genD5Guided(): StepByStepExercise {
  const p = generateValidParams();
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const yw = evalF(p, xw);
  const m = evalFPrime(p, xw);
  const fppStr = formatLinearPoly(6 * a, 2 * b);
  const tangentB = yw - m * xw;

  const [fppOptions, fppCorrect] = generateSecondDerivMC(p);
  const [tangentOptions, tangentCorrect] = generateTangentMC(m, xw, yw);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendetangente',
    function: { latex: fLatex, fn: (x: number) => evalF(p, x) },
    derivatives: {
      first: {
        latex: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}`,
        fn: (x: number) => evalFPrime(p, x),
      },
      second: {
        latex: `f''(x) = ${fppStr}`,
        fn: (x: number) => evalFDoublePrime(p, x),
      },
    },
    steps: [
      {
        instruction: 'Welches ist f\'\'(x)?',
        inputType: 'multiple-choice',
        options: fppOptions,
        correctAnswer: fppCorrect,
        hint: 'Leite f(x) zweimal ab. Potenzregel: Die Ableitung von ax^n ist n \\cdot a \\cdot x^{n-1}.',
        explanation: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}, also f''(x) = ${fppStr}.`,
      },
      {
        instruction: 'Setze f\'\'(x) = 0. Wo liegt der Wendepunkt (x-Koordinate)?',
        inputType: 'number',
        correctAnswer: xw,
        hint: `Löse ${fppStr} = 0 nach x auf.`,
        explanation: `${fppStr} = 0 \\Rightarrow x_W = ${xw}.`,
      },
      {
        instruction: `Berechne f(${xw}).`,
        inputType: 'number',
        correctAnswer: yw,
        hint: `Setze x = ${xw} in f(x) ein.`,
        explanation: `f(${xw}) = ${yw}.`,
      },
      {
        instruction: `Berechne f'(${xw}) — die Steigung der Wendetangente.`,
        inputType: 'number',
        correctAnswer: m,
        hint: `Setze x = ${xw} in f'(x) = ${formatQuadratic(3 * a, 2 * b, c)} ein.`,
        explanation: `f'(${xw}) = ${m}.`,
      },
      {
        instruction: 'Welche Gleichung hat die Wendetangente?',
        inputType: 'multiple-choice',
        options: tangentOptions,
        correctAnswer: tangentCorrect,
        hint: 'Die Tangentengleichung lautet y = f\'(x_W) \\cdot (x - x_W) + f(x_W).',
        explanation: `y = ${m}(x - ${xw < 0 ? `(${xw})` : xw}) + ${yw} = ${formatLinearPoly(m, tangentB)}.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: xw, y: yw, label: `W(${xw}|${yw})`, color: '#e74c3c' },
      ],
    },
  };
}

// ─── Case 4: Wendetangente (frei) ───

function genD5Free(): StepByStepExercise {
  const p = generateValidParams();
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const yw = evalF(p, xw);
  const m = evalFPrime(p, xw);
  const tangentB = yw - m * xw;

  const [tangentOptions, tangentCorrect] = generateTangentMC(m, xw, yw);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendetangente',
    function: { latex: fLatex, fn: (x: number) => evalF(p, x) },
    derivatives: {
      first: {
        latex: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}`,
        fn: (x: number) => evalFPrime(p, x),
      },
      second: {
        latex: `f''(x) = ${formatLinearPoly(6 * a, 2 * b)}`,
        fn: (x: number) => evalFDoublePrime(p, x),
      },
    },
    steps: [
      {
        instruction: 'Bestimme die Gleichung der Wendetangente.',
        inputType: 'multiple-choice',
        options: tangentOptions,
        correctAnswer: tangentCorrect,
        hint: 'Bestimme x_W über f\'\'(x) = 0, berechne f(x_W) und f\'(x_W), dann y = f\'(x_W)(x - x_W) + f(x_W).',
        explanation: `x_W = ${xw}, f(${xw}) = ${yw}, f'(${xw}) = ${m}. Tangente: y = ${formatLinearPoly(m, tangentB)}.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: xw, y: yw, label: `W(${xw}|${yw})`, color: '#e74c3c' },
      ],
    },
  };
}

// ─── Case 5: Krümmung bestimmen (geführt) ───

function genD2Guided(): StepByStepExercise {
  const p = generateValidParams();
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const fppStr = formatLinearPoly(6 * a, 2 * b);

  const [fppOptions, fppCorrect] = generateSecondDerivMC(p);

  // f''(x) = 6ax + 2b. Wendestelle at xw = -b/(3a).
  // For a > 0: f'' < 0 for x < xw (Rechtskurve), f'' > 0 for x > xw (Linkskurve)
  // For a < 0: f'' > 0 for x < xw (Linkskurve), f'' < 0 for x > xw (Rechtskurve)

  // Build interval options for "Wo ist f''(x) > 0?"
  const intervalLeft = `(-\\infty; ${xw})`;
  const intervalRight = `(${xw}; +\\infty)`;
  const intervalAll = '(-\\infty; +\\infty)';
  const intervalNone = 'Nirgends';

  // Where is f''(x) > 0?
  // 6a > 0 (a=1): f'' > 0 for x > xw → right interval
  // 6a < 0 (a=-1): f'' > 0 for x < xw → left interval
  const fppPositiveInterval = a > 0 ? intervalRight : intervalLeft;
  const fppPositiveOptions = shuffle([intervalLeft, intervalRight, intervalAll, intervalNone]);
  const fppPositiveCorrect = fppPositiveOptions.indexOf(fppPositiveInterval);

  // Linkskurve where f'' > 0, Rechtskurve where f'' < 0
  // Build correct assignment
  const linkskurveInterval = fppPositiveInterval; // same as f'' > 0
  const rechtskurveInterval = a > 0 ? intervalLeft : intervalRight;

  const kruemmungOptions = [
    `Linkskurve auf ${linkskurveInterval}, Rechtskurve auf ${rechtskurveInterval}`,
    `Rechtskurve auf ${linkskurveInterval}, Linkskurve auf ${rechtskurveInterval}`,
    `Überall Linkskurve`,
    `Überall Rechtskurve`,
  ];
  shuffle(kruemmungOptions);
  const kruemmungCorrectStr = `Linkskurve auf ${linkskurveInterval}, Rechtskurve auf ${rechtskurveInterval}`;
  const kruemmungCorrect = kruemmungOptions.indexOf(kruemmungCorrectStr);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'kruemmung-bestimmen',
    function: { latex: fLatex, fn: (x: number) => evalF(p, x) },
    derivatives: {
      first: {
        latex: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}`,
        fn: (x: number) => evalFPrime(p, x),
      },
      second: {
        latex: `f''(x) = ${fppStr}`,
        fn: (x: number) => evalFDoublePrime(p, x),
      },
    },
    steps: [
      {
        instruction: 'Welches ist f\'\'(x)?',
        inputType: 'multiple-choice',
        options: fppOptions,
        correctAnswer: fppCorrect,
        hint: 'Leite f(x) zweimal ab. Potenzregel: Die Ableitung von ax^n ist n \\cdot a \\cdot x^{n-1}.',
        explanation: `f'(x) = ${formatQuadratic(3 * a, 2 * b, c)}, also f''(x) = ${fppStr}.`,
      },
      {
        instruction: 'Auf welchem Intervall ist f\'\'(x) > 0?',
        inputType: 'multiple-choice',
        options: fppPositiveOptions,
        correctAnswer: fppPositiveCorrect,
        hint: `Löse ${fppStr} > 0 nach x auf.`,
        explanation: `${fppStr} > 0 \\Rightarrow ${a > 0 ? `x > ${xw}` : `x < ${xw}`}, also auf ${fppPositiveInterval}.`,
      },
      {
        instruction: 'Wo ist der Graph eine Linkskurve, wo eine Rechtskurve?',
        inputType: 'multiple-choice',
        options: kruemmungOptions,
        correctAnswer: kruemmungCorrect,
        hint: 'f\'\'(x) > 0 \\Rightarrow Linkskurve, f\'\'(x) < 0 \\Rightarrow Rechtskurve.',
        explanation: `f''(x) > 0 auf ${linkskurveInterval} \\Rightarrow Linkskurve. f''(x) < 0 auf ${rechtskurveInterval} \\Rightarrow Rechtskurve.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: xw, y: evalF(p, xw), label: `Wechsel bei x=${xw}`, color: '#3498db' },
      ],
    },
  };
}

// ─── Case 6: Krümmung bestimmen (frei) ───

function genD2Free(): StepByStepExercise {
  const p = generateValidParams();
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const fppStr = formatLinearPoly(6 * a, 2 * b);

  const intervalLeft = `(-\\infty; ${xw})`;
  const intervalRight = `(${xw}; +\\infty)`;

  const linkskurveInterval = a > 0 ? intervalRight : intervalLeft;
  const rechtskurveInterval = a > 0 ? intervalLeft : intervalRight;

  const kruemmungOptions = [
    `Linkskurve auf ${linkskurveInterval}, Rechtskurve auf ${rechtskurveInterval}`,
    `Rechtskurve auf ${linkskurveInterval}, Linkskurve auf ${rechtskurveInterval}`,
    `Überall Linkskurve`,
    `Überall Rechtskurve`,
  ];
  shuffle(kruemmungOptions);
  const kruemmungCorrectStr = `Linkskurve auf ${linkskurveInterval}, Rechtskurve auf ${rechtskurveInterval}`;
  const kruemmungCorrect = kruemmungOptions.indexOf(kruemmungCorrectStr);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'kruemmung-bestimmen',
    function: { latex: fLatex, fn: (x: number) => evalF(p, x) },
    derivatives: {
      second: {
        latex: `f''(x) = ${fppStr}`,
        fn: (x: number) => evalFDoublePrime(p, x),
      },
    },
    steps: [
      {
        instruction: 'Bestimme die Krümmungsintervalle von f.',
        inputType: 'multiple-choice',
        options: kruemmungOptions,
        correctAnswer: kruemmungCorrect,
        hint: 'Berechne f\'\'(x), finde die Nullstelle, bestimme das Vorzeichen auf beiden Seiten. f\'\' > 0 = Linkskurve.',
        explanation: `f''(x) = ${fppStr}. Nullstelle bei x = ${xw}. Linkskurve auf ${linkskurveInterval}, Rechtskurve auf ${rechtskurveInterval}.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: xw, y: evalF(p, xw), label: `Wechsel bei x=${xw}`, color: '#3498db' },
      ],
    },
  };
}

// ─── Public API ───

export const WENDESTELLEN_STEP_CASES: CaseDefinition[] = [
  { id: 'd3-guided', label: 'Wendestellen-Nachweis (geführt)', mode: 'guided', generate: genD3Guided },
  { id: 'd3-free', label: 'Wendestellen-Nachweis (frei)', mode: 'free', generate: genD3Free },
  { id: 'd5-guided', label: 'Wendetangente (geführt)', mode: 'guided', generate: genD5Guided },
  { id: 'd5-free', label: 'Wendetangente (frei)', mode: 'free', generate: genD5Free },
  { id: 'd2-guided', label: 'Krümmung bestimmen (geführt)', mode: 'guided', generate: genD2Guided },
  { id: 'd2-free', label: 'Krümmung bestimmen (frei)', mode: 'free', generate: genD2Free },
];

export const wendestellenGenerator: ExerciseGenerator = {
  generate(): StepByStepExercise {
    const caseIdx = Math.floor(Math.random() * WENDESTELLEN_STEP_CASES.length);
    return WENDESTELLEN_STEP_CASES[caseIdx].generate() as StepByStepExercise;
  },
};
