import type { IdentifyPointsExercise, MonotonicityInterval } from '../types/exercise.js';
import type { ExerciseGenerator } from './types.js';

// ─── Helpers ───

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(): string {
  return 'gen-mono-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Format a cubic term like "x³", "-x³", "2x³", etc.
 * `coeff` is the numeric coefficient, `variable` is e.g. "x" or "(x-2)".
 */
function formatCubicTerm(coeff: number, variable: string): string {
  if (coeff === 0) return '0';
  const cube = variable === 'x' ? 'x^3' : `${variable}^3`;
  if (coeff === 1) return cube;
  if (coeff === -1) return `-${cube}`;
  return `${coeff}${cube}`;
}

/**
 * Format a linear term like "+3x", "-3x", "+x", "-x", "".
 * `coeff` is the numeric coefficient, `variable` is e.g. "x" or "(x-2)".
 * Returns a string that starts with "+" or "-" (suitable to append after cubic term).
 */
function formatLinearTerm(coeff: number, variable: string): string {
  if (coeff === 0) return '';
  const abs = Math.abs(coeff);
  const sign = coeff > 0 ? ' + ' : ' - ';
  const numPart = abs === 1 ? '' : String(abs);
  return `${sign}${numPart}${variable}`;
}

/**
 * Build a clean LaTeX representation of f(x) = sign·(x-d)³ + b·(x-d).
 */
function buildLatex(sign: 1 | -1, b: number, d: number): string {
  const variable = d === 0 ? 'x' : d > 0 ? `(x - ${d})` : `(x + ${-d})`;
  const cubicPart = formatCubicTerm(sign, variable);
  const linearPart = formatLinearTerm(b, variable);
  return `f(x) = ${cubicPart}${linearPart}`;
}

/**
 * Build the JS function for f(x) = sign·(x-d)³ + b·(x-d).
 */
function buildFn(sign: 1 | -1, b: number, d: number): (x: number) => number {
  return (x: number) => {
    const u = x - d;
    return sign * u * u * u + b * u;
  };
}

// ─── Generator ───

function generate(): IdentifyPointsExercise {
  // 1. Random sign for the leading coefficient
  const sign = randomFrom([1, -1]) as 1 | -1;

  // 2. Pick k so extrema of the base function are at u = ±k
  const k = randomFrom([1, 2, 3, 4]);

  // 3. Compute b such that f'(u) = 3·sign·u² + b = 0 at u = ±k
  //    => b = -3·sign·k²
  const b = -3 * sign * k * k;

  // 4. Pick variant: shifted (d != 0) or centered (d = 0)
  const d = randomFrom([0, 0, 0, 1, 2, -1, -2]); // more often centered

  // 5. Extrema in x-coordinates
  const x1 = -k + d; // left extremum
  const x2 = k + d;  // right extremum

  // 6. Compute y-values: f(x) = sign·(x-d)³ + b·(x-d)
  const fn = buildFn(sign, b, d);
  const y1 = fn(x1);
  const y2 = fn(x2);

  // 7. Determine HP/TP
  //    f''(u) = 6·sign·u
  //    At u = -k: f''(-k) = -6·sign·k
  //      sign > 0 => f''(-k) < 0 => HP at x1
  //      sign < 0 => f''(-k) > 0 => TP at x1
  //    At u = +k: f''(+k) = +6·sign·k
  //      sign > 0 => f''(+k) > 0 => TP at x2
  //      sign < 0 => f''(+k) < 0 => HP at x2
  let hpX: number, hpY: number, tpX: number, tpY: number;
  if (sign > 0) {
    hpX = x1; hpY = y1;
    tpX = x2; tpY = y2;
  } else {
    tpX = x1; tpY = y1;
    hpX = x2; hpY = y2;
  }

  // 8. Build correct monotonicity intervals
  //    sign > 0: smw on (-inf, x1), smf on (x1, x2), smw on (x2, +inf)
  //    sign < 0: smf on (-inf, x1), smw on (x1, x2), smf on (x2, +inf)
  const correctIntervals: MonotonicityInterval[] = sign > 0
    ? [
        { from: '-\u221e', to: x1, type: 'smw' },
        { from: x1, to: x2, type: 'smf' },
        { from: x2, to: '+\u221e', type: 'smw' },
      ]
    : [
        { from: '-\u221e', to: x1, type: 'smf' },
        { from: x1, to: x2, type: 'smw' },
        { from: x2, to: '+\u221e', type: 'smf' },
      ];

  // 9. Build LaTeX
  const latex = buildLatex(sign, b, d);

  // 10. Build feedback explanation
  const feedbackExplanation =
    `Die Funktion ${latex.replace('f(x) = ', '')} hat einen Hochpunkt bei ` +
    `HP(${hpX}|${hpY}) und einen Tiefpunkt bei TP(${tpX}|${tpY}). ` +
    (sign > 0
      ? `f ist streng monoton wachsend auf (-\\infty;\\,${x1}) und (${x2};\\,+\\infty), ` +
        `streng monoton fallend auf (${x1};\\,${x2}).`
      : `f ist streng monoton fallend auf (-\\infty;\\,${x1}) und (${x2};\\,+\\infty), ` +
        `streng monoton wachsend auf (${x1};\\,${x2}).`);

  return {
    id: randomId(),
    type: 'identify-points',
    module: 'monotonie',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'monoton-steigend',
    prompt: 'Untersuche f auf Monotonie.',
    targets: [],
    intervalBounds: [x1, x2],
    includeInfinity: true,
    correctIntervals,
    intervalCount: 3,
    feedbackExplanation,
  };
}

export const monotonieIntervalGenerator: ExerciseGenerator = { generate };
