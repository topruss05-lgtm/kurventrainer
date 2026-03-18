import type { StepByStepExercise } from '../types/exercise.js';
import type { ExerciseGenerator } from './types.js';

// ─── Helpers ───

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(): string {
  return 'gen-wende-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Format a polynomial f(x) = ax³ + bx² + cx + d as LaTeX.
 * Handles signs, coefficients of ±1, and zero terms cleanly.
 */
function formatPolynomial(a: number, b: number, c: number, d: number): string {
  const parts: string[] = [];

  // x³ term
  if (a !== 0) {
    if (a === 1) parts.push('x^3');
    else if (a === -1) parts.push('-x^3');
    else parts.push(`${a}x^3`);
  }

  // x² term
  if (b !== 0) {
    const abs = Math.abs(b);
    const sign = b > 0 && parts.length > 0 ? ' + ' : b < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    const coeff = abs === 1 ? '' : String(abs);
    parts.push(`${sign}${coeff}x^2`);
  }

  // x term
  if (c !== 0) {
    const abs = Math.abs(c);
    const sign = c > 0 && parts.length > 0 ? ' + ' : c < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    const coeff = abs === 1 ? '' : String(abs);
    parts.push(`${sign}${coeff}x`);
  }

  // constant term
  if (d !== 0 || parts.length === 0) {
    const abs = Math.abs(d);
    const sign = d > 0 && parts.length > 0 ? ' + ' : d < 0 ? (parts.length > 0 ? ' - ' : '-') : '';
    parts.push(`${sign}${abs}`);
  }

  return parts.join('');
}

/**
 * Format a polynomial string for a derivative (e.g. "6x + 4" or "-6x - 12").
 */
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

function formatQuadraticDirect(a: number, b: number, c: number): string {
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

/** Shuffle an array in place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Core math ───

interface CubicParams {
  a: number; // leading coefficient: 1 or -1
  b: number; // x² coefficient
  c: number; // x coefficient
  d: number; // constant
  xw: number; // Wendestelle
}

function generateParams(): CubicParams {
  const a = randomFrom([1, -1]);

  // b must be divisible by 3 for integer Wendestelle
  const bChoices = [-6, -3, 0, 3, 6];
  const b = randomFrom(bChoices);

  // Wendestelle: x_w = -b / (3a)
  const xw = -b / (3 * a);

  const cChoices = [-9, -6, -3, 0, 3, 6, 9];
  const c = randomFrom(cChoices);

  const dChoices = [0, 1, -1, 2, -2, 4, -4];
  const d = randomFrom(dChoices);

  return { a, b, c, d, xw };
}

function evalF(p: CubicParams, x: number): number {
  return p.a * x * x * x + p.b * x * x + p.c * x + p.d;
}

function evalFPrime(p: CubicParams, x: number): number {
  // f'(x) = 3ax² + 2bx + c
  return 3 * p.a * x * x + 2 * p.b * x + p.c;
}

function evalFDoublePrime(p: CubicParams, x: number): number {
  // f''(x) = 6ax + 2b
  return 6 * p.a * x + 2 * p.b;
}

function evalFTriplePrime(p: CubicParams): number {
  // f'''(x) = 6a (constant)
  return 6 * p.a;
}

// ─── MC distractor helpers ───

/**
 * Generate 3 wrong f''(x) options and 1 correct, shuffled.
 * Returns [options, correctIndex].
 */
function generateSecondDerivMC(p: CubicParams): [string[], number] {
  // Correct: f''(x) = 6ax + 2b
  const correctStr = `f''(x) = ${formatLinearPoly(6 * p.a, 2 * p.b)}`;

  const distractors: string[] = [];

  // Wrong 1: forgot to multiply exponent (derivative of ax³ → ax² instead of 3ax²)
  // gives f'' = 2ax + 2b (wrong first coeff)
  distractors.push(`f''(x) = ${formatLinearPoly(2 * p.a, 2 * p.b)}`);

  // Wrong 2: sign error on second term
  distractors.push(`f''(x) = ${formatLinearPoly(6 * p.a, -2 * p.b)}`);

  // Wrong 3: confused f' with f'' (show quadratic — f'(x))
  distractors.push(`f''(x) = ${formatQuadraticDirect(3 * p.a, 2 * p.b, p.c)}`);

  // Remove duplicates with correct answer, replace with fallback
  const unique = distractors.filter(d => d !== correctStr);
  while (unique.length < 3) {
    unique.push(`f''(x) = ${formatLinearPoly(6 * p.a + unique.length + 1, 2 * p.b + 1)}`);
  }

  const options = [correctStr, unique[0], unique[1], unique[2]];
  shuffle(options);
  const correctIndex = options.indexOf(correctStr);

  return [options, correctIndex];
}

/**
 * Generate tangent line MC options.
 * Tangent at Wendepunkt: y = m(x - x_w) + y_w = mx + (y_w - m·x_w)
 */
function generateTangentMC(m: number, xw: number, yw: number): [string[], number] {
  const bCorrect = yw - m * xw;
  const correctStr = `y = ${formatLinearPoly(m, bCorrect)}`;

  const distractors: string[] = [];

  // Wrong 1: forgot f(x_w), only y = m·x
  distractors.push(`y = ${formatLinearPoly(m, 0)}`);

  // Wrong 2: used +m·x_w instead of -m·x_w
  const bWrong2 = yw + m * xw;
  distractors.push(`y = ${formatLinearPoly(m, bWrong2)}`);

  // Wrong 3: wrong slope sign
  const bWrong3 = yw - (-m) * xw;
  distractors.push(`y = ${formatLinearPoly(-m, bWrong3)}`);

  // Remove duplicates
  const unique = distractors.filter(d => d !== correctStr);
  while (unique.length < 3) {
    unique.push(`y = ${formatLinearPoly(m, bCorrect + unique.length + 1)}`);
  }

  const options = [correctStr, unique[0], unique[1], unique[2]];
  shuffle(options);
  const correctIndex = options.indexOf(correctStr);

  return [options, correctIndex];
}

// ─── Exercise builders ───

function buildType1(p: CubicParams): StepByStepExercise {
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const fn = (x: number) => evalF(p, x);
  const yw = evalF(p, xw);

  // f''(x) MC
  const [fppOptions, fppCorrect] = generateSecondDerivMC(p);

  // f''(x) correct string for hints/explanations
  const fppStr = formatLinearPoly(6 * a, 2 * b);
  const fTriplePrime = evalFTriplePrime(p);

  return {
    id: randomId(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendestellen-nachweis',
    function: { latex: fLatex, fn },
    derivatives: {
      first: {
        latex: `f'(x) = ${formatQuadraticDirect(3 * a, 2 * b, c)}`,
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
    },
    steps: [
      {
        instruction: 'Welches ist f\'\'(x)?',
        inputType: 'multiple-choice',
        options: fppOptions,
        correctAnswer: fppCorrect,
        hint: 'Leite f(x) zweimal ab. Potenzregel: Die Ableitung von ax^n ist n \\cdot a \\cdot x^{n-1}.',
        explanation: `f'(x) = ${formatQuadraticDirect(3 * a, 2 * b, c)}, also f''(x) = ${fppStr}.`,
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
        hint: `Berechne f'''(x). Für kubische Funktionen ist f'''(x) eine Konstante.`,
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
        hint: `Der Wendepunkt hat die Koordinaten (x_W | f(x_W)).`,
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

function buildType2(p: CubicParams): StepByStepExercise {
  const { a, b, c, d, xw } = p;

  const fLatex = `f(x) = ${formatPolynomial(a, b, c, d)}`;
  const fn = (x: number) => evalF(p, x);
  const yw = evalF(p, xw);
  const m = evalFPrime(p, xw); // slope of tangent at Wendepunkt

  // f''(x) MC
  const [fppOptions, fppCorrect] = generateSecondDerivMC(p);
  const fppStr = formatLinearPoly(6 * a, 2 * b);

  // Tangent: y = m(x - xw) + yw = mx + (yw - m*xw)
  const tangentB = yw - m * xw;
  const [tangentOptions, tangentCorrect] = generateTangentMC(m, xw, yw);

  return {
    id: randomId(),
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendetangente',
    function: { latex: fLatex, fn },
    derivatives: {
      first: {
        latex: `f'(x) = ${formatQuadraticDirect(3 * a, 2 * b, c)}`,
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
        explanation: `f'(x) = ${formatQuadraticDirect(3 * a, 2 * b, c)}, also f''(x) = ${fppStr}.`,
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
        hint: `Setze x = ${xw} in f'(x) = ${formatQuadraticDirect(3 * a, 2 * b, c)} ein.`,
        explanation: `f'(${xw}) = ${m}.`,
      },
      {
        instruction: 'Welche Gleichung hat die Wendetangente?',
        inputType: 'multiple-choice',
        options: tangentOptions,
        correctAnswer: tangentCorrect,
        hint: `Die Tangentengleichung lautet y = f'(x_W) \\cdot (x - x_W) + f(x_W).`,
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

// ─── Generator ───

function generate(): StepByStepExercise {
  // Retry until y-values are reasonable
  for (let attempt = 0; attempt < 50; attempt++) {
    const p = generateParams();
    const yw = evalF(p, p.xw);

    // Check |y_w| ≤ 50
    if (Math.abs(yw) > 50) continue;

    // For Type 2, also check tangent y-intercept
    const m = evalFPrime(p, p.xw);
    const tangentB = yw - m * p.xw;
    if (Math.abs(tangentB) > 50) continue;
    if (Math.abs(m) > 50) continue;

    const type = randomFrom([1, 2]);
    return type === 1 ? buildType1(p) : buildType2(p);
  }

  // Fallback: simple case f(x) = x³
  const fallback: CubicParams = { a: 1, b: 0, c: 0, d: 0, xw: 0 };
  return buildType1(fallback);
}

export const wendestellenGenerator: ExerciseGenerator = { generate };
