import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { GraphAssignmentExercise } from '../types/exercise.js';

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
 * coeffs = [a_n, ..., a_0] for degrees n, n-1, ..., 0 (length determines highest degree).
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

/** Evaluate polynomial with coeffs [a_n, ..., a_0] at x (Horner). */
function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

function uid(): string {
  return `ga-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Graph builders ───

function buildGraphs(
  fCoeffs: number[],
  fPrimeCoeffs: number[],
  fDoublePrimeCoeffs: number[],
  fLatex: string,
  fPrimeLatex: string,
  fDoublePrimeLatex: string,
): GraphAssignmentExercise['graphs'] {
  const graphs: GraphAssignmentExercise['graphs'] = [
    {
      id: 'g1',
      function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
      correctLabel: 'f',
    },
    {
      id: 'g2',
      function: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      correctLabel: "f'",
    },
    {
      id: 'g3',
      function: { latex: fDoublePrimeLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
      correctLabel: "f''",
    },
  ];

  shuffle(graphs);
  return graphs;
}

// ─── Case 1: Quadratic (Grad 2) ───

function genQuadratic(): GraphAssignmentExercise {
  // f(x) = ax^2 + bx + c
  const a = pick([1, -1]);
  const b = pick([-4, -2, 0, 2, 4]);
  const c = pick([-3, -1, 0, 1, 3]);

  const fCoeffs = [a, b, c];
  const fPrimeCoeffs = [2 * a, b];
  const fDoublePrimeCoeffs = [2 * a];

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;
  const fPrimeLatex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;
  const fDoublePrimeLatex = `f''(x) = ${formatPolynomial(fDoublePrimeCoeffs)}`;

  const graphs = buildGraphs(
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    fLatex, fPrimeLatex, fDoublePrimeLatex,
  );

  return {
    id: uid(),
    module: 'zusammenhang',
    competency: 'K1',
    type: 'graph-assignment',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDoublePrimeLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    graphs,
  };
}

// ─── Case 2: Cubic (Grad 3) ───

function genCubic(): GraphAssignmentExercise {
  // f(x) = x^3 + bx^2 + cx + d
  const b = pick([-3, 0, 3]);
  const c = pick([-9, -3, 0, 3, 9]);
  const d = pick([-2, -1, 0, 1, 2]);

  const fCoeffs = [1, b, c, d];
  const fPrimeCoeffs = [3, 2 * b, c];
  const fDoublePrimeCoeffs = [6, 2 * b];

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;
  const fPrimeLatex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;
  const fDoublePrimeLatex = `f''(x) = ${formatPolynomial(fDoublePrimeCoeffs)}`;

  const graphs = buildGraphs(
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    fLatex, fPrimeLatex, fDoublePrimeLatex,
  );

  return {
    id: uid(),
    module: 'zusammenhang',
    competency: 'K1',
    type: 'graph-assignment',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDoublePrimeLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    graphs,
  };
}

// ─── Case 3: Quartic (Grad 4) ───

function genQuartic(): GraphAssignmentExercise {
  // f(x) = x^4 + ax^2 (symmetric)
  const a = pick([-8, -2, 2, 8]);

  const fCoeffs = [1, 0, a, 0, 0];
  const fPrimeCoeffs = [4, 0, 2 * a, 0];
  const fDoublePrimeCoeffs = [12, 0, 2 * a];

  const fLatex = `f(x) = ${formatPolynomial(fCoeffs)}`;
  const fPrimeLatex = `f'(x) = ${formatPolynomial(fPrimeCoeffs)}`;
  const fDoublePrimeLatex = `f''(x) = ${formatPolynomial(fDoublePrimeCoeffs)}`;

  const graphs = buildGraphs(
    fCoeffs, fPrimeCoeffs, fDoublePrimeCoeffs,
    fLatex, fPrimeLatex, fDoublePrimeLatex,
  );

  return {
    id: uid(),
    module: 'zusammenhang',
    competency: 'K1',
    type: 'graph-assignment',
    function: { latex: fLatex, fn: (x: number) => evalPoly(fCoeffs, x) },
    derivatives: {
      first: { latex: fPrimeLatex, fn: (x: number) => evalPoly(fPrimeCoeffs, x) },
      second: { latex: fDoublePrimeLatex, fn: (x: number) => evalPoly(fDoublePrimeCoeffs, x) },
    },
    graphs,
  };
}

// ─── Public API ───

export const GRAPH_ASSIGNMENT_CASES: CaseDefinition[] = [
  { id: 'ga-quadratic', label: "f/f'/f'' zuordnen (Grad 2)", generate: genQuadratic },
  { id: 'ga-cubic', label: "f/f'/f'' zuordnen (Grad 3)", generate: genCubic },
  { id: 'ga-quartic', label: "f/f'/f'' zuordnen (Grad 4)", generate: genQuartic },
];

export const graphAssignmentGenerator: ExerciseGenerator = {
  generate(): GraphAssignmentExercise {
    const caseIdx = Math.floor(Math.random() * GRAPH_ASSIGNMENT_CASES.length);
    return GRAPH_ASSIGNMENT_CASES[caseIdx].generate() as GraphAssignmentExercise;
  },
};
