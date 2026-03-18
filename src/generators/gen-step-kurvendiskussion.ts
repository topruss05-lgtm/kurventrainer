import type { StepByStepExercise } from '../types/exercise.js';
import type { CaseDefinition, ExerciseGenerator } from './types.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function uid(): string {
  return 'gen-kd-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Format polynomial coeffs [a, b, c, d] for degrees 3, 2, 1, 0 as LaTeX.
 */
function formatPolynomial(coeffs: number[]): string {
  const degrees = coeffs.length === 4 ? [3, 2, 1, 0] : coeffs.length === 3 ? [2, 1, 0] : [1, 0];
  const parts: string[] = [];

  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const deg = degrees[i];
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

function formatFx(coeffs: number[]): string {
  return `f(x) = ${formatPolynomial(coeffs)}`;
}

function formatFPrime(coeffs: number[]): string {
  return `f'(x) = ${formatPolynomial(coeffs)}`;
}

function formatFDoublePrime(coeffs: number[]): string {
  return `f''(x) = ${formatPolynomial(coeffs)}`;
}

function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

// ─── Function type definitions ───

type SymmetryType = 'punkt' | 'achsen' | 'keine';

interface KDData {
  fCoeffs: number[];           // [a, b, c, d]
  fPrimeCoeffs: number[];      // [3a, 2b, c]
  fDoublePrimeCoeffs: number[];// [6a, 2b]
  x1: number;                  // left extremum
  x2: number;                  // right extremum
  y1: number;
  y2: number;
  xw: number;                  // Wendestelle
  yw: number;
  symmetry: SymmetryType;
  fLatex: string;
  fPrimeLatex: string;
  fDoublePrimeLatex: string;
}

// ─── Type 1: Punktsymmetrisch f(x) = ax³ + bx ───

function generatePunktsymmetrisch(): KDData | null {
  // f(x) = ax³ + cx with a in {1, -1} and c chosen for integer extrema
  // f'(x) = 3ax² + c = 0 → x² = -c/(3a) → need -c/(3a) > 0 and perfect square
  const a = pick([1, -1]);
  const k = pick([1, 2, 3]); // x-values of extrema: ±k
  // -c/(3a) = k² → c = -3a·k²
  const c = -3 * a * k * k;
  const fCoeffs = [a, 0, c, 0];

  const x1 = -k; // for a=1: HP at -k, TP at +k
  const x2 = k;

  const fPrimeCoeffs = [3 * a, 0, c];
  const fDoublePrimeCoeffs = [6 * a, 0];

  const y1 = evalPoly(fCoeffs, x1);
  const y2 = evalPoly(fCoeffs, x2);
  const xw = 0; // Wendestelle always at 0 for punktsymmetrisch
  const yw = 0;

  if (Math.abs(y1) > 50 || Math.abs(y2) > 50) return null;

  return {
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    x1, x2, y1, y2, xw, yw,
    symmetry: 'punkt',
    fLatex: formatFx(fCoeffs),
    fPrimeLatex: formatFPrime(fPrimeCoeffs),
    fDoublePrimeLatex: formatFDoublePrime(fDoublePrimeCoeffs),
  };
}

// ─── Type 2: Keine Symmetrie f(x) = x³ + bx² + cx + d ───

function generateKeineSymmetrie(): KDData | null {
  // Same approach as gen-extremstellen: pick x1, x2 same parity
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

  // Ensure this is NOT punktsymmetrisch (x1 + x2 != 0)
  // Actually we just need b != 0 for keine Symmetrie
  const s = x1 + x2;
  if (s === 0) return null; // skip, would be punkt-like

  const p = x1 * x2;
  const fPrimeCoeffs = [3, -3 * s, 3 * p];

  const a = 1;
  const b = -(3 * s) / 2;
  const cCoeff = 3 * p;
  const d = pick([0, 1, -1, 2, -2]);
  const fCoeffs = [a, b, cCoeff, d];

  const fDoublePrimeCoeffs = [6, -3 * s]; // 6x - 3s

  const y1 = evalPoly(fCoeffs, x1);
  const y2 = evalPoly(fCoeffs, x2);
  const xw = s / 2; // Wendestelle = (x1+x2)/2
  const yw = evalPoly(fCoeffs, xw);

  if (Math.abs(y1) > 50 || Math.abs(y2) > 50 || Math.abs(yw) > 50) return null;

  return {
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    x1, x2, y1, y2, xw, yw,
    symmetry: 'keine',
    fLatex: formatFx(fCoeffs),
    fPrimeLatex: formatFPrime(fPrimeCoeffs),
    fDoublePrimeLatex: formatFDoublePrime(fDoublePrimeCoeffs),
  };
}

function generateKDData(): KDData {
  for (let i = 0; i < 50; i++) {
    // 50% chance for each type
    const gen = Math.random() < 0.5 ? generatePunktsymmetrisch : generateKeineSymmetrie;
    const data = gen();
    if (data) return data;
  }
  // Fallback: f(x) = x³ - 3x (punktsymmetrisch)
  return {
    fCoeffs: [1, 0, -3, 0],
    fPrimeCoeffs: [3, 0, -3],
    fDoublePrimeCoeffs: [6, 0],
    x1: -1, x2: 1,
    y1: 2, y2: -2,
    xw: 0, yw: 0,
    symmetry: 'punkt',
    fLatex: formatFx([1, 0, -3, 0]),
    fPrimeLatex: formatFPrime([3, 0, -3]),
    fDoublePrimeLatex: formatFDoublePrime([6, 0]),
  };
}

// ─── MC distractor generation ───

function generateFPrimeDistractors(fCoeffs: number[], correctCoeffs: number[]): string[] {
  const [a, b, c, _d] = fCoeffs;
  const distractorSet = new Set<string>();
  const correct = formatPolynomial(correctCoeffs);

  // Forgot to multiply by exponent
  const d1 = formatPolynomial([a, b, c]);
  if (d1 !== correct) distractorSet.add(d1);

  // Wrong sign on middle term
  const d2 = formatPolynomial([correctCoeffs[0], -correctCoeffs[1], correctCoeffs[2]]);
  if (d2 !== correct) distractorSet.add(d2);

  // Wrong power rule
  const d3 = formatPolynomial([4 * a, 3 * b, 2 * c]);
  if (d3 !== correct) distractorSet.add(d3);

  // Include constant
  const d4 = formatPolynomial([correctCoeffs[0], correctCoeffs[1], correctCoeffs[2], _d]);
  if (d4 !== correct) distractorSet.add(d4);

  const result = Array.from(distractorSet).slice(0, 3);

  while (result.length < 3) {
    const tweak = correctCoeffs.map(c => c + pick([-2, -1, 1, 2]));
    const tweaked = formatPolynomial(tweak);
    if (tweaked !== correct && !result.includes(tweaked)) {
      result.push(tweaked);
    }
  }

  return result.slice(0, 3);
}

function generateFDoublePrimeDistractors(correctCoeffs: number[], fPrimeCoeffs: number[]): string[] {
  const correct = formatPolynomial(correctCoeffs);
  const distractorSet = new Set<string>();

  // Wrong: forgot to multiply exponent (2ax instead of 6ax)
  distractorSet.add(formatPolynomial([correctCoeffs[0] / 3, correctCoeffs[1]]));

  // Wrong sign
  distractorSet.add(formatPolynomial([correctCoeffs[0], -correctCoeffs[1]]));

  // Confused: show f' as f''
  distractorSet.add(formatPolynomial(fPrimeCoeffs));

  const result = Array.from(distractorSet).filter(d => d !== correct).slice(0, 3);

  while (result.length < 3) {
    const tweak = correctCoeffs.map(c => c + pick([-2, -1, 1, 2]));
    const tweaked = formatPolynomial(tweak);
    if (tweaked !== correct && !result.includes(tweaked)) {
      result.push(tweaked);
    }
  }

  return result.slice(0, 3);
}

// ─── E3 Guided: Full Kurvendiskussion ───

function genE3Guided(): StepByStepExercise {
  const data = generateKDData();
  const {
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    x1, x2, y1, y2, xw, yw,
    symmetry, fLatex, fPrimeLatex, fDoublePrimeLatex,
  } = data;

  // For a > 0: x1 is HP (f'' < 0), x2 is TP (f'' > 0)
  // For a < 0: x1 is TP (f'' > 0), x2 is HP (f'' < 0)
  const fDDx1 = evalPoly(fDoublePrimeCoeffs, x1);
  const fDDx2 = evalPoly(fDoublePrimeCoeffs, x2);
  const x1IsMax = fDDx1 < 0;
  const x2IsMax = fDDx2 < 0;

  // Symmetry MC
  const symmetryOptions = ['Punktsymmetrie zum Ursprung', 'Achsensymmetrie zur y-Achse', 'Keine Symmetrie'];
  const correctSymIdx = symmetry === 'punkt' ? 0 : symmetry === 'achsen' ? 1 : 2;
  const symObjs = symmetryOptions.map((opt, i) => ({ text: opt, idx: i }));
  shuffle(symObjs);
  const shuffledSym = symObjs.map(o => o.text);
  const correctSymIndex = symObjs.findIndex(o => o.idx === correctSymIdx);

  const symmetryExplanation = symmetry === 'punkt'
    ? `f(-x) = -f(x) für alle x, also ist f punktsymmetrisch zum Ursprung.`
    : `Die Funktion hat keine besondere Symmetrie, da f(-x) \\neq f(x) und f(-x) \\neq -f(x).`;

  // f'(x) MC
  const correctFPrime = formatPolynomial(fPrimeCoeffs);
  const fPrimeDistractors = generateFPrimeDistractors(fCoeffs, fPrimeCoeffs);
  const fPrimeOptions = [correctFPrime, ...fPrimeDistractors];
  const fpObjs = fPrimeOptions.map((opt, i) => ({ text: opt, idx: i }));
  shuffle(fpObjs);
  const shuffledFP = fpObjs.map(o => o.text);
  const correctFPIndex = fpObjs.findIndex(o => o.idx === 0);

  // f''(x) MC
  const correctFDD = formatPolynomial(fDoublePrimeCoeffs);
  const fDDDistractors = generateFDoublePrimeDistractors(fDoublePrimeCoeffs, fPrimeCoeffs);
  const fDDOptions = [correctFDD, ...fDDDistractors];
  const fddObjs = fDDOptions.map((opt, i) => ({ text: opt, idx: i }));
  shuffle(fddObjs);
  const shuffledFDD = fddObjs.map(o => o.text);
  const correctFDDIndex = fddObjs.findIndex(o => o.idx === 0);

  // Art MC options
  const artOptions = ['Maximum (Hochpunkt)', 'Minimum (Tiefpunkt)', 'Wendepunkt', 'Sattelpunkt'];
  const correctArtX1 = x1IsMax ? 0 : 1;
  const correctArtX2 = x2IsMax ? 0 : 1;

  const steps: StepByStepExercise['steps'] = [
    // Step 1: Symmetrie
    {
      instruction: `Gegeben ist \\(${fLatex}\\). Untersuche zunächst die Symmetrie. Welche Symmetrie liegt vor?`,
      inputType: 'multiple-choice',
      options: shuffledSym,
      correctAnswer: correctSymIndex,
      hint: 'Berechne f(-x). Ist f(-x) = f(x)? Dann Achsensymmetrie. Ist f(-x) = -f(x)? Dann Punktsymmetrie.',
      explanation: symmetryExplanation,
    },
    // Step 2: f'(x)
    {
      instruction: `Bestimme \\(f'(x)\\).`,
      inputType: 'multiple-choice',
      options: shuffledFP.map(s => `\\(${s}\\)`),
      correctAnswer: correctFPIndex,
      hint: 'Leite jeden Term einzeln ab: Potenzregel (xⁿ)\' = n·xⁿ⁻¹.',
      explanation: `\\(${fPrimeLatex}\\).`,
    },
    // Step 3: f'(x) = 0
    {
      instruction: `Setze \\(f'(x) = 0\\). Welche Nullstellen hat \\(f'\\)?`,
      inputType: 'number-set',
      correctAnswer: [x1, x2],
      hint: `\\(${correctFPrime} = 0\\). Löse die quadratische Gleichung.`,
      explanation: `\\(f'(x) = 0\\) ergibt \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\).`,
    },
    // Step 4: f''(x1) Vorzeichen
    {
      instruction: `Berechne \\(f''(${x1})\\). Ist der Wert positiv, negativ oder null?`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0', '= 0'],
      correctAnswer: fDDx1 > 0 ? '> 0' : fDDx1 < 0 ? '< 0' : '= 0',
      hint: `\\(${fDoublePrimeLatex}\\). Setze \\(x = ${x1}\\) ein.`,
      explanation: `\\(f''(${x1}) = ${fDDx1}\\).`,
    },
    // Step 5: Art x1
    {
      instruction: `Welche Art hat die Stelle \\(x = ${x1}\\)?`,
      inputType: 'multiple-choice',
      options: artOptions,
      correctAnswer: correctArtX1,
      hint: `\\(f''(${x1}) ${fDDx1 < 0 ? '< 0' : '> 0'}\\). Was bedeutet das?`,
      explanation: x1IsMax
        ? `Da \\(f''(${x1}) = ${fDDx1} < 0\\), liegt ein lokales Maximum (Hochpunkt) bei \\(H(${x1} \\mid ${y1})\\) vor.`
        : `Da \\(f''(${x1}) = ${fDDx1} > 0\\), liegt ein lokales Minimum (Tiefpunkt) bei \\(T(${x1} \\mid ${y1})\\) vor.`,
    },
    // Step 6: f''(x2) Vorzeichen
    {
      instruction: `Berechne \\(f''(${x2})\\). Ist der Wert positiv, negativ oder null?`,
      inputType: 'sign-choice',
      options: ['> 0', '< 0', '= 0'],
      correctAnswer: fDDx2 > 0 ? '> 0' : fDDx2 < 0 ? '< 0' : '= 0',
      hint: `\\(${fDoublePrimeLatex}\\). Setze \\(x = ${x2}\\) ein.`,
      explanation: `\\(f''(${x2}) = ${fDDx2}\\).`,
    },
    // Step 7: Art x2
    {
      instruction: `Welche Art hat die Stelle \\(x = ${x2}\\)?`,
      inputType: 'multiple-choice',
      options: artOptions,
      correctAnswer: correctArtX2,
      hint: `\\(f''(${x2}) ${fDDx2 < 0 ? '< 0' : '> 0'}\\). Was bedeutet das?`,
      explanation: x2IsMax
        ? `Da \\(f''(${x2}) = ${fDDx2} < 0\\), liegt ein lokales Maximum (Hochpunkt) bei \\(H(${x2} \\mid ${y2})\\) vor.`
        : `Da \\(f''(${x2}) = ${fDDx2} > 0\\), liegt ein lokales Minimum (Tiefpunkt) bei \\(T(${x2} \\mid ${y2})\\) vor.`,
    },
    // Step 8: f''(x) bestimmen
    {
      instruction: `Bestimme \\(f''(x)\\) für die Wendepunktberechnung.`,
      inputType: 'multiple-choice',
      options: shuffledFDD.map(s => `\\(f''(x) = ${s}\\)`),
      correctAnswer: correctFDDIndex,
      hint: 'Leite f\'(x) noch einmal ab.',
      explanation: `\\(${fDoublePrimeLatex}\\).`,
    },
    // Step 9: f''(x) = 0 → Wendestelle
    {
      instruction: `Setze \\(f''(x) = 0\\). Wo liegt die Wendestelle?`,
      inputType: 'number',
      correctAnswer: xw,
      hint: `Löse \\(${correctFDD} = 0\\) nach \\(x\\) auf.`,
      explanation: `\\(f''(x) = 0 \\Rightarrow x_W = ${xw}\\).`,
    },
    // Step 10: Wendepunkt-Koordinaten
    {
      instruction: `Berechne den Wendepunkt \\(W(x_W \\mid f(x_W))\\).`,
      inputType: 'coordinate',
      correctAnswer: [xw, yw],
      hint: `Setze \\(x = ${xw}\\) in \\(f(x)\\) ein, um \\(y_W\\) zu berechnen.`,
      explanation: `\\(f(${xw}) = ${yw}\\). Der Wendepunkt ist \\(W(${xw} \\mid ${yw})\\).`,
    },
  ];

  // Build highlight points
  const highlights: Array<{ x: number; y: number; label: string; color?: string }> = [];
  if (x1IsMax) {
    highlights.push({ x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' });
  } else {
    highlights.push({ x: x1, y: y1, label: `TP(${x1}|${y1})`, color: '#2ecc71' });
  }
  if (x2IsMax) {
    highlights.push({ x: x2, y: y2, label: `HP(${x2}|${y2})`, color: '#e74c3c' });
  } else {
    highlights.push({ x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' });
  }
  highlights.push({ x: xw, y: yw, label: `W(${xw}|${yw})`, color: '#3498db' });

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'kurvendiskussion',
    competency: 'K5',
    procedure: 'kurvendiskussion',
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
        latex: fDoublePrimeLatex,
        fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x),
      },
    },
    steps,
    verificationGraph: { highlights },
  };
}

// ─── E3 Free: Kurvendiskussion (nur Endergebnis) ───

function genE3Free(): StepByStepExercise {
  const data = generateKDData();
  const {
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    x1, x2, y1, y2, xw, yw,
    symmetry, fLatex, fPrimeLatex, fDoublePrimeLatex,
  } = data;

  const fDDx1 = evalPoly(fDoublePrimeCoeffs, x1);
  const x1IsMax = fDDx1 < 0;

  const hpLabel = x1IsMax ? `HP(${x1}|${y1})` : `HP(${x2}|${y2})`;
  const tpLabel = x1IsMax ? `TP(${x2}|${y2})` : `TP(${x1}|${y1})`;

  const highlights: Array<{ x: number; y: number; label: string; color?: string }> = [];
  if (x1IsMax) {
    highlights.push({ x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' });
    highlights.push({ x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' });
  } else {
    highlights.push({ x: x1, y: y1, label: `TP(${x1}|${y1})`, color: '#2ecc71' });
    highlights.push({ x: x2, y: y2, label: `HP(${x2}|${y2})`, color: '#e74c3c' });
  }
  highlights.push({ x: xw, y: yw, label: `W(${xw}|${yw})`, color: '#3498db' });

  const symText = symmetry === 'punkt' ? 'punktsymmetrisch zum Ursprung' : 'keine besondere Symmetrie';

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'kurvendiskussion',
    competency: 'K5',
    procedure: 'kurvendiskussion',
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
        latex: fDoublePrimeLatex,
        fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x),
      },
    },
    steps: [
      {
        instruction: `Führe eine vollständige Kurvendiskussion von \\(${fLatex}\\) durch. Gib die Koordinaten des Wendepunkts an.`,
        inputType: 'coordinate',
        correctAnswer: [xw, yw],
        hint: 'Bestimme Symmetrie, f\' und f\'\' und deren Nullstellen. Klassifiziere die Extremstellen und berechne den Wendepunkt.',
        explanation: `Symmetrie: ${symText}. \\(${fPrimeLatex}\\), Nullstellen bei \\(x = ${x1}\\) und \\(x = ${x2}\\). ${hpLabel}, ${tpLabel}. \\(${fDoublePrimeLatex}\\), Wendepunkt \\(W(${xw} \\mid ${yw})\\).`,
      },
    ],
    verificationGraph: { highlights },
  };
}

// ─── Public API ───

export const KURVENDISKUSSION_STEP_CASES: CaseDefinition[] = [
  { id: 'e3-guided', label: 'Kurvendiskussion (geführt)', mode: 'guided', generate: genE3Guided },
  { id: 'e3-free', label: 'Kurvendiskussion (frei)', mode: 'free', generate: genE3Free },
];

export const kurvendiskussionStepGenerator: ExerciseGenerator = {
  generate(): StepByStepExercise {
    const caseIdx = Math.floor(Math.random() * KURVENDISKUSSION_STEP_CASES.length);
    return KURVENDISKUSSION_STEP_CASES[caseIdx].generate() as StepByStepExercise;
  },
};
