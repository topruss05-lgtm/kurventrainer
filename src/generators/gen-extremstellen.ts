import type { StepByStepExercise } from '../types/exercise.js';
import type { CaseDefinition, ExerciseGenerator } from './types.js';

// ─── Helpers ───

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle an array in place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format a polynomial as clean LaTeX.
 * coeffs = [a, b, c, d] for degrees 3, 2, 1, 0 (length determines highest degree).
 */
function formatPolynomial(coeffs: number[]): string {
  const startDeg = coeffs.length - 1;
  const parts: string[] = [];

  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const deg = startDeg - i;
    if (c === 0) continue;

    let term = '';

    // Sign handling
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

/** Format with "f(x) = ..." */
function formatFx(coeffs: number[]): string {
  return `f(x) = ${formatPolynomial(coeffs)}`;
}

/** Format with "f'(x) = ..." */
function formatFPrime(coeffs: number[]): string {
  return `f'(x) = ${formatPolynomial(coeffs)}`;
}

/** Format with "f''(x) = ..." */
function formatFDoublePrime(coeffs: number[]): string {
  return `f''(x) = ${formatPolynomial(coeffs)}`;
}

/** Evaluate polynomial with coeffs [a_n, ..., a_0] at x (Horner). */
function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

function uid(): string {
  return `ext-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Generate 3 plausible but wrong f'(x) distractors for a cubic f.
 * fCoeffs = [a, b, c, d], correctCoeffs = [3a, 2b, c].
 */
function generateFPrimeDistractors(fCoeffs: number[], correctCoeffs: number[]): string[] {
  const [a, b, c, _d] = fCoeffs;
  const distractorSet = new Set<string>();
  const correct = formatPolynomial(correctCoeffs);

  // Distractor 1: Forgot to multiply by exponent (just reduce power)
  const d1 = formatPolynomial([a, b, c]);
  if (d1 !== correct) distractorSet.add(d1);

  // Distractor 2: Wrong sign on middle term
  const d2 = formatPolynomial([correctCoeffs[0], -correctCoeffs[1], correctCoeffs[2]]);
  if (d2 !== correct) distractorSet.add(d2);

  // Distractor 3: Used wrong power rule (multiply by n+1 instead of n)
  const d3 = formatPolynomial([4 * a, 3 * b, 2 * c]);
  if (d3 !== correct) distractorSet.add(d3);

  // Distractor 4: Swapped derivative coefficients
  const d4 = formatPolynomial([correctCoeffs[2], correctCoeffs[1], correctCoeffs[0]]);
  if (d4 !== correct) distractorSet.add(d4);

  // Distractor 5: Off-by-one on constant term (include constant)
  const d5 = formatPolynomial([correctCoeffs[0], correctCoeffs[1], correctCoeffs[2], _d]);
  if (d5 !== correct) distractorSet.add(d5);

  const result = Array.from(distractorSet).slice(0, 3);

  // If we still don't have enough, add generic ones
  while (result.length < 3) {
    const tweak = correctCoeffs.map(c => c + pick([-2, -1, 1, 2]));
    const tweaked = formatPolynomial(tweak);
    if (tweaked !== correct && !result.includes(tweaked)) {
      result.push(tweaked);
    }
  }

  return result.slice(0, 3);
}

/**
 * Generate 3 plausible but wrong f'(x) distractors for a quartic f(x) = x⁴ + ax³.
 * fCoeffs = [1, a, 0, 0, 0], correctCoeffs = [4, 3a, 0, 0].
 */
function generateFPrimeDistractorsQuartic(a: number, correctCoeffs: number[]): string[] {
  const correct = formatPolynomial(correctCoeffs);
  const distractorSet = new Set<string>();

  // Forgot to multiply by exponent
  const d1 = formatPolynomial([1, a, 0, 0]);
  if (d1 !== correct) distractorSet.add(d1);

  // Wrong sign on second term
  const d2 = formatPolynomial([4, -3 * a, 0, 0]);
  if (d2 !== correct) distractorSet.add(d2);

  // Multiply by n+1 instead of n
  const d3 = formatPolynomial([5, 4 * a, 0, 0]);
  if (d3 !== correct) distractorSet.add(d3);

  // Off by one on exponent coefficients
  const d4 = formatPolynomial([3, 2 * a, 0, 0]);
  if (d4 !== correct) distractorSet.add(d4);

  const result = Array.from(distractorSet).slice(0, 3);

  while (result.length < 3) {
    const tweak = [4 + pick([-1, 1]), 3 * a + pick([-2, -1, 1, 2]), 0, 0];
    const tweaked = formatPolynomial(tweak);
    if (tweaked !== correct && !result.includes(tweaked)) {
      result.push(tweaked);
    }
  }

  return result.slice(0, 3);
}

// ─── Shared: Build MC options from correct + distractors ───

function buildMCOptions(correctLatex: string, distractors: string[]): { options: string[]; correctIndex: number } {
  const all = [correctLatex, ...distractors];
  const tagged = all.map((text, i) => ({ text, orig: i }));
  shuffle(tagged);
  return {
    options: tagged.map(o => `\\(${o.text}\\)`),
    correctIndex: tagged.findIndex(o => o.orig === 0),
  };
}

// ─── Cubic polynomial generation (shared for c1 and b2) ───

interface CubicData {
  x1: number;
  x2: number;
  fCoeffs: number[];       // [a, b, c, d] for degree 3
  fPrimeCoeffs: number[];  // [3a, 2b, c] for degree 2
  fDoublePrimeCoeffs: number[]; // [6a, 2b] for degree 1
  y1: number;
  y2: number;
  fDDx1: number;
  fDDx2: number;
}

function generateCubicData(): CubicData {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick x1, x2 with same parity so (x1+x2) is even → integer coefficients
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

    // f'(x) = 3(x - x1)(x - x2) = 3x² - 3(x1+x2)x + 3·x1·x2
    const s = x1 + x2;
    const p = x1 * x2;
    const fPrimeCoeffs = [3, -3 * s, 3 * p];

    // Integrate: f(x) = x³ - (3s/2)x² + 3p·x + d
    const a = 1;
    const b = -(3 * s) / 2;
    const cCoeff = 3 * p;
    const d = pick([0, 1, -1, 2, -2]);
    const fCoeffs = [a, b, cCoeff, d];

    // f''(x) = 6x - 3s
    const fDoublePrimeCoeffs = [6, -3 * s];

    const fDDx1 = 3 * (x1 - x2); // negative → HP
    const fDDx2 = 3 * (x2 - x1); // positive → TP

    const y1 = evalPoly(fCoeffs, x1);
    const y2 = evalPoly(fCoeffs, x2);

    if (Math.abs(y1) > 50 || Math.abs(y2) > 50) continue;

    return { x1, x2, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs, y1, y2, fDDx1, fDDx2 };
  }

  throw new Error('gen-extremstellen: Konnte keine gültige kubische Funktion erzeugen.');
}

// ─── Case c1: Extremstellen-Nachweis (guided) ───

function genC1Guided(): StepByStepExercise {
  const data = generateCubicData();
  const { x1, x2, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs, y1, y2, fDDx1, fDDx2 } = data;

  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);
  const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);

  const correctFPrime = formatPolynomial(fPrimeCoeffs);
  const distractors = generateFPrimeDistractors(fCoeffs, fPrimeCoeffs);
  const mc = buildMCOptions(correctFPrime, distractors);

  const steps: StepByStepExercise['steps'] = [
    {
      instruction: `Gegeben ist \\(${fLatex}\\). Welches ist \\(f'(x)\\)?`,
      inputType: 'multiple-choice',
      options: mc.options,
      correctAnswer: mc.correctIndex,
      hint: 'Leite jeden Term einzeln ab: Die Potenzregel lautet (xⁿ)\' = n·xⁿ⁻¹.',
      explanation: `Die Ableitung ist \\(${fPrimeLatex}\\). Potenzregel anwenden: x³ → 3x², dann jeden Koeffizienten mitnehmen.`,
    },
    {
      instruction: `Setze \\(f'(x) = 0\\). Welche x-Werte sind Lösungen?`,
      inputType: 'number-set',
      correctAnswer: [x1, x2],
      hint: `\\(f'(x) = ${correctFPrime}\\). Setze gleich 0 und löse die quadratische Gleichung.`,
      explanation: `\\(f'(x) = 3(x - ${x1 >= 0 ? x1 : `(${x1})`})(x - ${x2 >= 0 ? x2 : `(${x2})`}) = 0\\) ergibt \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\).`,
    },
    {
      instruction: `Berechne \\(f''(${x1})\\). Ist \\(f''(${x1}) > 0\\), \\(< 0\\) oder \\(= 0\\)?`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0', '= 0'],
      correctAnswer: '< 0',
      hint: `\\(${fDDLatex}\\). Setze \\(x = ${x1}\\) ein.`,
      explanation: `\\(f''(${x1}) = ${fDDx1}\\). Da \\(${fDDx1} < 0\\), ist die Stelle ein Hochpunkt.`,
    },
    {
      instruction: `Welche Art hat die Stelle \\(x = ${x1}\\)?`,
      inputType: 'multiple-choice',
      options: ['Maximum', 'Minimum', 'Wendepunkt', 'Sattelpunkt'],
      correctAnswer: 0,
      hint: `\\(f''(${x1}) < 0\\) bedeutet Linkskurve → Hochpunkt.`,
      explanation: `Da \\(f''(${x1}) = ${fDDx1} < 0\\), liegt an \\(x = ${x1}\\) ein lokales Maximum (Hochpunkt) vor.`,
    },
    {
      instruction: `Berechne die y-Koordinate \\(f(${x1})\\).`,
      inputType: 'number',
      correctAnswer: y1,
      hint: `Setze \\(x = ${x1}\\) in \\(${fLatex}\\) ein.`,
      explanation: `\\(f(${x1}) = ${y1}\\). Der Hochpunkt ist \\(H(${x1} \\mid ${y1})\\).`,
    },
    {
      instruction: `Berechne \\(f''(${x2})\\). Ist \\(f''(${x2}) > 0\\), \\(< 0\\) oder \\(= 0\\)?`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0', '= 0'],
      correctAnswer: '> 0',
      hint: `\\(${fDDLatex}\\). Setze \\(x = ${x2}\\) ein.`,
      explanation: `\\(f''(${x2}) = ${fDDx2}\\). Da \\(${fDDx2} > 0\\), ist die Stelle ein Tiefpunkt.`,
    },
    {
      instruction: `Welche Art hat die Stelle \\(x = ${x2}\\)?`,
      inputType: 'multiple-choice',
      options: ['Maximum', 'Minimum', 'Wendepunkt', 'Sattelpunkt'],
      correctAnswer: 1,
      hint: `\\(f''(${x2}) > 0\\) bedeutet Rechtskurve → Tiefpunkt.`,
      explanation: `Da \\(f''(${x2}) = ${fDDx2} > 0\\), liegt an \\(x = ${x2}\\) ein lokales Minimum (Tiefpunkt) vor.`,
    },
    {
      instruction: `Berechne die y-Koordinate \\(f(${x2})\\).`,
      inputType: 'number',
      correctAnswer: y2,
      hint: `Setze \\(x = ${x2}\\) in \\(${fLatex}\\) ein.`,
      explanation: `\\(f(${x2}) = ${y2}\\). Der Tiefpunkt ist \\(T(${x2} \\mid ${y2})\\).`,
    },
  ];

  return {
    id: uid(),
    module: 'extremstellen',
    competency: 'K1',
    type: 'step-by-step',
    procedure: 'extremstellen-nachweis',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDDLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    steps,
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Case c1-free: Extremstellen-Nachweis (frei) ───

function genC1Free(): StepByStepExercise {
  const data = generateCubicData();
  const { x1, x2, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs, y1, y2 } = data;

  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);
  const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);

  // Free mode: minimal steps — just ask for the extremum coordinates
  const steps: StepByStepExercise['steps'] = [
    {
      instruction: `Bestimme die Koordinaten des Hochpunkts.`,
      inputType: 'coordinate',
      correctAnswer: [x1, y1],
      hint: `Berechne f'(x), setze f'(x) = 0, prüfe mit f''(x) und berechne f(x₀).`,
      explanation: `HP(${x1} \\mid ${y1}): f'(${x1}) = 0 und f''(${x1}) < 0.`,
    },
    {
      instruction: `Bestimme die Koordinaten des Tiefpunkts.`,
      inputType: 'coordinate',
      correctAnswer: [x2, y2],
      hint: `Berechne f'(x), setze f'(x) = 0, prüfe mit f''(x) und berechne f(x₀).`,
      explanation: `TP(${x2} \\mid ${y2}): f'(${x2}) = 0 und f''(${x2}) > 0.`,
    },
  ];

  return {
    id: uid(),
    module: 'extremstellen',
    competency: 'K1',
    type: 'step-by-step',
    procedure: 'extremstellen-nachweis',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDDLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    steps,
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Quartic data for VZW cases (c2) ───

interface QuarticVZWData {
  a: number;           // coefficient: f(x) = x⁴ + ax³
  xE: number;          // real extremum x-value
  yE: number;          // f(xE)
  fCoeffs: number[];   // [1, a, 0, 0, 0]
  fPrimeCoeffs: number[];  // [4, 3a, 0, 0]
  fDoublePrimeCoeffs: number[]; // [12, 6a, 0]
}

function generateQuarticVZWData(): QuarticVZWData {
  // f(x) = x⁴ + ax³, a ∈ {-4, 4}
  // f'(x) = 4x³ + 3ax² = x²(4x + 3a)
  // Nullstellen von f': x = 0 (doppelt) und x = -3a/4
  // f''(x) = 12x² + 6ax
  // f''(0) = 0 → VZW nötig bei x = 0
  // f''(-3a/4) = 12·(9a²/16) + 6a·(-3a/4) = 27a²/4 - 18a²/4 = 9a²/4 > 0 → TP
  const a = pick([-4, 4]);
  const xE = -3 * a / 4; // = 3 or -3
  const fCoeffs = [1, a, 0, 0, 0];
  const yE = evalPoly(fCoeffs, xE);
  const fPrimeCoeffs = [4, 3 * a, 0, 0];
  const fDoublePrimeCoeffs = [12, 6 * a, 0];

  return { a, xE, yE, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs };
}

// ─── Case c2: VZW-Kriterium (guided) ───

function genC2Guided(): StepByStepExercise {
  const { a, xE, yE, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs } = generateQuarticVZWData();

  // f(x) = x⁴ + ax³
  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);
  const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);

  const correctFPrime = formatPolynomial(fPrimeCoeffs);
  const distractors = generateFPrimeDistractorsQuartic(a, fPrimeCoeffs);
  const mc = buildMCOptions(correctFPrime, distractors);

  // y-value at x=0 (Sattelpunkt)
  const y0 = evalPoly(fCoeffs, 0); // = 0

  // VZW at x=0: check sign of f'(x) left and right of 0
  // f'(x) = x²(4x + 3a)
  // For small ε > 0: f'(-ε) = ε²(-4ε + 3a) ≈ ε²·3a → sign = sign(a)
  // For small ε > 0: f'(+ε) = ε²(4ε + 3a) ≈ ε²·3a → sign = sign(a)
  // Same sign! → kein VZW → Sattelpunkt bei x=0
  const signLeft0 = a > 0 ? '> 0' : '< 0';
  const signRight0 = a > 0 ? '> 0' : '< 0';

  // The real extremum is at xE = -3a/4
  // f''(xE) = 9a²/4 > 0 → always TP
  const fDDxE = 9 * a * a / 4;

  const steps: StepByStepExercise['steps'] = [
    {
      instruction: `Gegeben ist \\(${fLatex}\\). Welches ist \\(f'(x)\\)?`,
      inputType: 'multiple-choice',
      options: mc.options,
      correctAnswer: mc.correctIndex,
      hint: 'Leite jeden Term einzeln ab: Die Potenzregel lautet (xⁿ)\' = n·xⁿ⁻¹.',
      explanation: `Die Ableitung ist \\(${fPrimeLatex}\\).`,
    },
    {
      instruction: `Setze \\(f'(x) = 0\\). Welche x-Werte sind Lösungen?`,
      inputType: 'number-set',
      correctAnswer: [0, xE].sort((u, v) => u - v),
      hint: `\\(f'(x) = ${correctFPrime}\\). Klammere x² aus.`,
      explanation: `\\(f'(x) = x^{2}(4x ${3 * a > 0 ? '+' : '-'} ${Math.abs(3 * a)}) = 0\\) ergibt \\(x_1 = 0\\) und \\(x_2 = ${xE}\\).`,
    },
    {
      instruction: `Berechne \\(f''(0)\\). Ist \\(f''(0) > 0\\), \\(< 0\\) oder \\(= 0\\)?`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0', '= 0'],
      correctAnswer: '= 0',
      hint: `\\(${fDDLatex}\\). Setze \\(x = 0\\) ein.`,
      explanation: `\\(f''(0) = 0\\). Das Kriterium mit f'' ist nicht anwendbar — ein Vorzeichenwechsel (VZW) von f' muss geprüft werden.`,
    },
    {
      instruction: `Ist \\(f'(x)\\) links von \\(x = 0\\) positiv oder negativ? (Setze z.B. \\(x = -0{,}1\\) ein.)`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0'],
      correctAnswer: signLeft0,
      hint: `\\(f'(x) = x^{2}(4x ${3 * a > 0 ? '+' : '-'} ${Math.abs(3 * a)})\\). Bei \\(x = -0{,}1\\): \\(x^2 > 0\\), und \\(4 \\cdot (-0{,}1) ${3 * a > 0 ? '+' : '-'} ${Math.abs(3 * a)}\\) hat welches Vorzeichen?`,
      explanation: `Für \\(x\\) nahe 0 (links): \\(x^2 > 0\\) und \\(4x + ${3 * a} \\approx ${3 * a}\\), also \\(f'(x) ${signLeft0}\\).`,
    },
    {
      instruction: `Ist \\(f'(x)\\) rechts von \\(x = 0\\) positiv oder negativ? (Setze z.B. \\(x = 0{,}1\\) ein.)`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0'],
      correctAnswer: signRight0,
      hint: `\\(f'(x) = x^{2}(4x ${3 * a > 0 ? '+' : '-'} ${Math.abs(3 * a)})\\). Bei \\(x = 0{,}1\\): \\(x^2 > 0\\), und \\(4 \\cdot 0{,}1 ${3 * a > 0 ? '+' : '-'} ${Math.abs(3 * a)}\\) hat welches Vorzeichen?`,
      explanation: `Für \\(x\\) nahe 0 (rechts): \\(x^2 > 0\\) und \\(4x + ${3 * a} \\approx ${3 * a}\\), also \\(f'(x) ${signRight0}\\). Kein Vorzeichenwechsel → Sattelpunkt!`,
    },
    {
      instruction: `Welche Art hat die Stelle \\(x = 0\\)?`,
      inputType: 'multiple-choice',
      options: ['Maximum', 'Minimum', 'Sattelpunkt'],
      correctAnswer: 2, // Sattelpunkt
      hint: `f' wechselt bei \\(x = 0\\) nicht das Vorzeichen.`,
      explanation: `Da f' bei \\(x = 0\\) keinen Vorzeichenwechsel hat, liegt ein Sattelpunkt vor: \\(S(0 \\mid ${y0})\\).`,
    },
    {
      instruction: `Berechne die y-Koordinate \\(f(${xE})\\). (Der Extrempunkt.)`,
      inputType: 'number',
      correctAnswer: yE,
      hint: `Setze \\(x = ${xE}\\) in \\(${fLatex}\\) ein.`,
      explanation: `\\(f(${xE}) = ${yE}\\). Da \\(f''(${xE}) = ${fDDxE} > 0\\), ist \\(T(${xE} \\mid ${yE})\\) ein Tiefpunkt.`,
    },
  ];

  return {
    id: uid(),
    module: 'extremstellen',
    competency: 'K1',
    type: 'step-by-step',
    procedure: 'vzw-kriterium',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDDLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    steps,
    verificationGraph: {
      highlights: [
        { x: 0, y: y0, label: `S(0|${y0})`, color: '#f39c12' },
        { x: xE, y: yE, label: `TP(${xE}|${yE})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Case c2-free: VZW-Kriterium (frei) ───

function genC2Free(): StepByStepExercise {
  const { xE, yE, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs } = generateQuarticVZWData();

  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);
  const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);
  const y0 = evalPoly(fCoeffs, 0);

  const steps: StepByStepExercise['steps'] = [
    {
      instruction: `Bestimme alle Extrempunkte und Sattelpunkte. Gib die Koordinaten des Sattelpunkts an.`,
      inputType: 'coordinate',
      correctAnswer: [0, y0],
      hint: `Berechne f'(x), setze f'(x) = 0. Prüfe mit f''(x) und ggf. VZW.`,
      explanation: `S(0 \\mid ${y0}): f'(0) = 0, f''(0) = 0, kein VZW → Sattelpunkt.`,
    },
    {
      instruction: `Bestimme die Koordinaten des Tiefpunkts.`,
      inputType: 'coordinate',
      correctAnswer: [xE, yE],
      hint: `Zweite Nullstelle von f'(x) finden und mit f''(x) klassifizieren.`,
      explanation: `TP(${xE} \\mid ${yE}): f'(${xE}) = 0 und f''(${xE}) > 0.`,
    },
  ];

  return {
    id: uid(),
    module: 'extremstellen',
    competency: 'K1',
    type: 'step-by-step',
    procedure: 'vzw-kriterium',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDDLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    steps,
    verificationGraph: {
      highlights: [
        { x: 0, y: y0, label: `S(0|${y0})`, color: '#f39c12' },
        { x: xE, y: yE, label: `TP(${xE}|${yE})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Case b2: Kandidaten finden (guided) ───

function genB2Guided(): StepByStepExercise {
  const data = generateCubicData();
  const { x1, x2, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs, y1, y2 } = data;

  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);
  const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);

  const correctFPrime = formatPolynomial(fPrimeCoeffs);
  const distractors = generateFPrimeDistractors(fCoeffs, fPrimeCoeffs);
  const mc = buildMCOptions(correctFPrime, distractors);

  // Only 2 steps: find f'(x) and solve f'(x) = 0
  const steps: StepByStepExercise['steps'] = [
    {
      instruction: `Gegeben ist \\(${fLatex}\\). Welches ist \\(f'(x)\\)?`,
      inputType: 'multiple-choice',
      options: mc.options,
      correctAnswer: mc.correctIndex,
      hint: 'Leite jeden Term einzeln ab: Die Potenzregel lautet (xⁿ)\' = n·xⁿ⁻¹.',
      explanation: `Die Ableitung ist \\(${fPrimeLatex}\\). Potenzregel anwenden: x³ → 3x², dann jeden Koeffizienten mitnehmen.`,
    },
    {
      instruction: `Setze \\(f'(x) = 0\\). Welche x-Werte sind Lösungen?`,
      inputType: 'number-set',
      correctAnswer: [x1, x2],
      hint: `\\(f'(x) = ${correctFPrime}\\). Setze gleich 0 und löse die quadratische Gleichung.`,
      explanation: `\\(f'(x) = 3(x - ${x1 >= 0 ? x1 : `(${x1})`})(x - ${x2 >= 0 ? x2 : `(${x2})`}) = 0\\) ergibt \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\).`,
    },
  ];

  return {
    id: uid(),
    module: 'extremstellen',
    competency: 'K1',
    type: 'step-by-step',
    procedure: 'kandidaten-finden',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDDLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    steps,
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Case b2-free: Kandidaten finden (frei) ───

function genB2Free(): StepByStepExercise {
  const data = generateCubicData();
  const { x1, x2, fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs, y1, y2 } = data;

  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);
  const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);

  const steps: StepByStepExercise['steps'] = [
    {
      instruction: `Bestimme die Kandidaten für Extremstellen (Nullstellen von f').`,
      inputType: 'number-set',
      correctAnswer: [x1, x2],
      hint: `Berechne f'(x) und löse f'(x) = 0.`,
      explanation: `f'(x) = 0 ergibt \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\).`,
    },
  ];

  return {
    id: uid(),
    module: 'extremstellen',
    competency: 'K1',
    type: 'step-by-step',
    procedure: 'kandidaten-finden',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDDLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    steps,
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Public API ───

export const EXTREMSTELLEN_STEP_CASES: CaseDefinition[] = [
  { id: 'c1-guided', label: 'Extremstellen-Nachweis (geführt)', mode: 'guided', generate: genC1Guided },
  { id: 'c1-free', label: 'Extremstellen-Nachweis (frei)', mode: 'free', generate: genC1Free },
  { id: 'c2-guided', label: 'VZW-Kriterium (geführt)', mode: 'guided', generate: genC2Guided },
  { id: 'c2-free', label: 'VZW-Kriterium (frei)', mode: 'free', generate: genC2Free },
  { id: 'b2-guided', label: 'Kandidaten finden (geführt)', mode: 'guided', generate: genB2Guided },
  { id: 'b2-free', label: 'Kandidaten finden (frei)', mode: 'free', generate: genB2Free },
];

export const extremstellenGenerator: ExerciseGenerator = {
  generate(): StepByStepExercise {
    const caseIdx = Math.floor(Math.random() * EXTREMSTELLEN_STEP_CASES.length);
    return EXTREMSTELLEN_STEP_CASES[caseIdx].generate() as StepByStepExercise;
  },
};
