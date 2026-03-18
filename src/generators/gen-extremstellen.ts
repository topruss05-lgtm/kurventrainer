import type { StepByStepExercise } from '../types/exercise.js';
import type { ExerciseGenerator } from './types.js';

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
 * Format a polynomial ax³ + bx² + cx + d as clean LaTeX.
 * coeffs = [a, b, c, d] for degrees 3, 2, 1, 0.
 */
function formatPolynomial(coeffs: number[]): string {
  const degrees = [3, 2, 1, 0];
  const parts: string[] = [];

  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const deg = degrees[i];
    if (c === 0) continue;

    let term = '';

    // Sign handling
    if (parts.length === 0) {
      // First term: leading minus if negative, no plus
      if (c < 0) term += '-';
    } else {
      term += c > 0 ? ' + ' : ' - ';
    }

    const absC = Math.abs(c);

    if (deg === 0) {
      // Constant term
      term += `${absC}`;
    } else if (absC === 1) {
      // Coefficient 1 or -1: omit the "1"
      term += deg === 1 ? 'x' : `x^{${deg}}`;
    } else {
      term += deg === 1 ? `${absC}x` : `${absC}x^{${deg}}`;
    }

    parts.push(term);
  }

  return parts.length === 0 ? '0' : parts.join('');
}

/** Format a polynomial for display with "f(x) = ..." */
function formatFx(coeffs: number[]): string {
  return `f(x) = ${formatPolynomial(coeffs)}`;
}

/** Format a polynomial for display with "f'(x) = ..." */
function formatFPrime(coeffs: number[]): string {
  return `f'(x) = ${formatPolynomial(coeffs)}`;
}

/** Format a polynomial for display with "f''(x) = ..." */
function formatFDoublePrime(coeffs: number[]): string {
  return `f''(x) = ${formatPolynomial(coeffs)}`;
}

/** Evaluate polynomial with coeffs [a, b, c, d] at x. */
function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

// ─── Generator ───

function generateExercise(): StepByStepExercise {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Step 1: Pick x1, x2 with same parity so (x1+x2) is even
    const evens = [-4, -2, 0, 2, 4];
    const odds = [-3, -1, 1, 3];
    const pool = Math.random() < 0.5 ? evens : odds;

    // Pick two distinct values
    let idx1 = Math.floor(Math.random() * pool.length);
    let idx2 = Math.floor(Math.random() * pool.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * pool.length);
    }

    let x1 = pool[idx1];
    let x2 = pool[idx2];
    if (x1 > x2) [x1, x2] = [x2, x1]; // ensure x1 < x2

    // Step 2: Build f'(x) = 3(x - x1)(x - x2) = 3x² - 3(x1+x2)x + 3·x1·x2
    const s = x1 + x2;   // sum
    const p = x1 * x2;   // product
    // f'(x) coefficients: [3, -3s, 3p]
    const fPrimeCoeffs = [3, -3 * s, 3 * p];

    // Step 3: Integrate to get f(x) = x³ - (3s/2)x² + 3p·x + c
    // Since s is even (same parity), 3s/2 is an integer (s even → s/2 integer → 3s/2 integer)
    const a = 1;
    const b = -(3 * s) / 2;
    const cCoeff = 3 * p;
    const d = pick([0, 1, -1, 2, -2]);
    const fCoeffs = [a, b, cCoeff, d];

    // Step 4: f''(x) = 6x - 3s
    const fDoublePrimeCoeffs = [6, -3 * s];

    // Step 5-6: Evaluate f'' at extrema
    // f''(x1) = 6·x1 - 3s = 6x1 - 3(x1+x2) = 3(x1 - x2) < 0 since x1 < x2 → HP
    // f''(x2) = 6·x2 - 3s = 6x2 - 3(x1+x2) = 3(x2 - x1) > 0 → TP
    const fDDx1 = 3 * (x1 - x2); // negative
    const fDDx2 = 3 * (x2 - x1); // positive

    // Step 7: Compute y-values
    const y1 = evalPoly(fCoeffs, x1);
    const y2 = evalPoly(fCoeffs, x2);

    // Constraint: |y| ≤ 50
    if (Math.abs(y1) > 50 || Math.abs(y2) > 50) continue;

    // Build the exercise
    const fLatex = formatFx(fCoeffs);
    const fPrimeLatex = formatFPrime(fPrimeCoeffs);
    const fDDLatex = formatFDoublePrime(fDoublePrimeCoeffs);

    // MC distractors for f'(x)
    const correctFPrime = formatPolynomial(fPrimeCoeffs);
    const distractors = generateFPrimeDistractors(fCoeffs, fPrimeCoeffs);

    // Build MC options: correct + 3 distractors, shuffled
    const fPrimeOptions = [correctFPrime, ...distractors];
    const optionObjects = fPrimeOptions.map((opt, i) => ({ text: opt, originalIndex: i }));
    shuffle(optionObjects);
    const shuffledOptions = optionObjects.map(o => o.text);
    const correctOptionIndex = optionObjects.findIndex(o => o.originalIndex === 0);

    // Build steps
    const steps: StepByStepExercise['steps'] = [
      {
        instruction: `Gegeben ist \\(${fLatex}\\). Welches ist \\(f'(x)\\)?`,
        inputType: 'multiple-choice',
        options: shuffledOptions.map(s => `\\(${s}\\)`),
        correctAnswer: correctOptionIndex,
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
        correctAnswer: 0, // Maximum
        hint: `\\(f''(${x1}) < 0\\) bedeutet Linkskurve → Hochpunkt.`,
        explanation: `Da \\(f''(${x1}) = ${fDDx1} < 0\\), liegt an \\(x = ${x1}\\) ein lokales Maximum (Hochpunkt) vor.`,
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
        correctAnswer: 1, // Minimum
        hint: `\\(f''(${x2}) > 0\\) bedeutet Rechtskurve → Tiefpunkt.`,
        explanation: `Da \\(f''(${x2}) = ${fDDx2} > 0\\), liegt an \\(x = ${x2}\\) ein lokales Minimum (Tiefpunkt) vor.`,
      },
      {
        instruction: `Berechne die y-Koordinate \\(f(${x1})\\).`,
        inputType: 'number',
        correctAnswer: y1,
        hint: `Setze \\(x = ${x1}\\) in \\(${fLatex}\\) ein.`,
        explanation: `\\(f(${x1}) = ${y1}\\). Der Hochpunkt ist \\(H(${x1} \\mid ${y1})\\).`,
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
      id: `ext-step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      module: 'extremstellen',
      competency: 'K3',
      type: 'step-by-step',
      procedure: 'Extremstellen-Nachweis',
      function: {
        latex: fLatex,
        fn: (x: number) => evalPoly(fCoeffs, x),
      },
      derivatives: {
        first: {
          latex: fPrimeLatex,
          fn: (x: number) => evalPoly(fPrimeCoeffs, x),
        },
        second: {
          latex: fDDLatex,
          fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x),
        },
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

  // Fallback: should rarely happen, use a known-good example
  // f(x) = x³ - 3x² + 1, x1=0 (HP), x2=2 (TP)
  throw new Error('gen-extremstellen: Konnte keine gültige Aufgabe erzeugen nach 10 Versuchen.');
}

/**
 * Generate 3 plausible but wrong f'(x) distractors.
 */
function generateFPrimeDistractors(fCoeffs: number[], correctCoeffs: number[]): string[] {
  const [a, b, c, _d] = fCoeffs;
  const distractorSet = new Set<string>();
  const correct = formatPolynomial(correctCoeffs);

  // Distractor 1: Forgot to multiply by exponent (just reduce power)
  // x³ → x², bx² → bx, cx → c  (wrong: missing factor from power rule)
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

  // Pick up to 3
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

export const extremstellenGenerator: ExerciseGenerator = {
  generate: generateExercise,
};
