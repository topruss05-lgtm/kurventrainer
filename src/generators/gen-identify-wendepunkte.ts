import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { IdentifyPointsExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return 'gen-idwp-' + Math.random().toString(36).slice(2, 9);
}

// ─── Case 1: Wendepunkt ablesen (kubisch, 1 WP) ───
// f(x) = a(x - h)³ + m(x - h) + k  shifted cubic with WP at (h, k)
// f''(x) = 6a(x - h), zero at x = h → WP

function genWPCubic(): IdentifyPointsExercise {
  const a = pick([1, -1]);
  const h = pick([-3, -2, -1, 0, 1, 2, 3]);
  const m = pick([-3, -1, 0, 1, 3]); // linear coefficient (slope at WP)
  const k = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);

  // f(x) = a(x-h)³ + m(x-h) + k
  const fn = (x: number) => a * (x - h) ** 3 + m * (x - h) + k;
  // WP at (h, k) since f''(x) = 6a(x-h), f''(h) = 0, f'''(h) = 6a ≠ 0

  // Verify |y| ≤ 50 at WP: |k| ≤ 4, always fine

  const aStr = a === 1 ? '' : '-';
  const variable = h === 0 ? 'x' : h > 0 ? `(x - ${h})` : `(x + ${-h})`;
  let latex = `f(x) = ${aStr}${variable}^3`;
  if (m !== 0) {
    if (m > 0) {
      latex += ` + ${m === 1 ? '' : m}${variable}`;
    } else {
      latex += ` - ${Math.abs(m) === 1 ? '' : Math.abs(m)}${variable}`;
    }
  }
  if (k > 0) latex += ` + ${k}`;
  else if (k < 0) latex += ` - ${-k}`;

  return {
    id: uid(),
    type: 'identify-points',
    module: 'wendestellen',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'wendestellen',
    prompt: 'Markiere alle Wendestellen im Graph.',
    targets: [{ x: h, y: k }],
    feedbackExplanation: `Der Wendepunkt liegt bei W(${h} | ${k}). Hier wechselt die Krümmung des Graphen.`,
  };
}

// ─── Case 2: Wendepunkte ablesen (Grad 4, 2 WPs) ───
// f(x) = x⁴ + ax² + bx
// f''(x) = 12x² + 2a
// f'' = 0 at x = ±√(-a/6). For real WPs: a < 0.
// a = -6  → WPs at x = ±1, f''(±1) = 12 - 12 = 0 ✓
// a = -24 → WPs at x = ±2, f''(±2) = 48 - 48 = 0 ✓

function genWPQuartic(): IdentifyPointsExercise {
  const aVal = pick([-6, -24]); // a in f(x) = x⁴ + ax²
  const bVal = pick([-2, -1, 0, 1, 2]); // linear term for variety
  const wpX = Math.sqrt(-aVal / 6); // 1 or 2

  // f(x) = x⁴ + a·x² + b·x
  const fn = (x: number) => x ** 4 + aVal * x ** 2 + bVal * x;

  const yWP1 = fn(wpX);
  const yWP2 = fn(-wpX);

  // Verify |y| ≤ 50
  // a=-6, wpX=1: f(1) = 1 - 6 + b = -5 + b, f(-1) = 1 - 6 - b = -5 - b → fine
  // a=-24, wpX=2: f(2) = 16 - 96 + 2b = -80 + 2b → |y| > 50!
  // So for a=-24 we need to adjust. Let's use f(x) = x⁴ + ax² (no linear term)
  // f(2) = 16 - 96 = -80 → still too big.
  // Better approach: use f(x) = x⁴/4 + ax²/2 to scale down
  // Actually, let's just use a = -6 always and vary other params.
  // Or use a different parametrization for 2 WPs.

  // Safer: f(x) = x⁴ - 6x² + cx, WPs at ±1
  // f(1) = 1 - 6 + c = -5 + c
  // f(-1) = 1 - 6 - c = -5 - c
  // With |c| ≤ 4: max |y| = 9 → fine

  if (Math.abs(yWP1) > 50 || Math.abs(yWP2) > 50) {
    // Fallback to a = -6
    const c = pick([-3, -2, -1, 0, 1, 2, 3]);
    const fnSafe = (x: number) => x ** 4 - 6 * x ** 2 + c * x;
    const y1 = fnSafe(1);
    const y2 = fnSafe(-1);

    let latex = 'f(x) = x^{4} - 6x^{2}';
    if (c > 0) latex += ` + ${c === 1 ? '' : c}x`;
    else if (c < 0) latex += ` - ${Math.abs(c) === 1 ? '' : Math.abs(c)}x`;

    return {
      id: uid(),
      type: 'identify-points',
      module: 'wendestellen',
      competency: 'K1',
      function: { latex, fn: fnSafe },
      targetType: 'wendestellen',
      prompt: 'Markiere alle Wendestellen im Graph.',
      targets: [
        { x: -1, y: y2 },
        { x: 1, y: y1 },
      ],
      feedbackExplanation: `Wendepunkte bei W₁(${-1} | ${y2}) und W₂(${1} | ${y1}). f''(x) = 12x² - 12 = 0 ergibt x = ±1.`,
    };
  }

  // Build LaTeX
  let latex = 'f(x) = x^{4}';
  if (aVal === -6) latex += ' - 6x^{2}';
  else if (aVal === -24) latex += ' - 24x^{2}';
  if (bVal > 0) latex += ` + ${bVal === 1 ? '' : bVal}x`;
  else if (bVal < 0) latex += ` - ${Math.abs(bVal) === 1 ? '' : Math.abs(bVal)}x`;

  return {
    id: uid(),
    type: 'identify-points',
    module: 'wendestellen',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'wendestellen',
    prompt: 'Markiere alle Wendestellen im Graph.',
    targets: [
      { x: -wpX, y: yWP2 },
      { x: wpX, y: yWP1 },
    ],
    feedbackExplanation: `Wendepunkte bei W₁(${-wpX} | ${yWP2}) und W₂(${wpX} | ${yWP1}). f''(x) = 12x² + ${2 * aVal} = 0 ergibt x = ±${wpX}.`,
  };
}

// ─── Case 3: Krümmungswechsel erkennen (kubisch, alternative Formulierung) ───

function genWPKruemmung(): IdentifyPointsExercise {
  const a = pick([1, -1]);
  const h = pick([-3, -2, -1, 0, 1, 2, 3]);
  const c = pick([-2, -1, 0, 1, 2]);
  const k = pick([-3, -2, -1, 0, 1, 2, 3]);

  const fn = (x: number) => a * (x - h) ** 3 + c * (x - h) + k;

  const aStr = a === 1 ? '' : '-';
  const variable = h === 0 ? 'x' : h > 0 ? `(x - ${h})` : `(x + ${-h})`;
  let latex = `f(x) = ${aStr}${variable}^3`;
  if (c !== 0) {
    if (c > 0) {
      latex += ` + ${c === 1 ? '' : c}${variable}`;
    } else {
      latex += ` - ${Math.abs(c) === 1 ? '' : Math.abs(c)}${variable}`;
    }
  }
  if (k > 0) latex += ` + ${k}`;
  else if (k < 0) latex += ` - ${-k}`;

  const kruemmungLinks = a > 0 ? 'Rechtskurve' : 'Linkskurve';
  const kruemmungRechts = a > 0 ? 'Linkskurve' : 'Rechtskurve';

  return {
    id: uid(),
    type: 'identify-points',
    module: 'wendestellen',
    competency: 'K1',
    function: { latex, fn },
    targetType: 'wendestellen',
    prompt: 'Markiere die Stelle, an der sich die Krümmung des Graphen ändert.',
    targets: [{ x: h, y: k }],
    feedbackExplanation: `Der Krümmungswechsel findet bei W(${h} | ${k}) statt. Links davon: ${kruemmungLinks}, rechts davon: ${kruemmungRechts}.`,
  };
}

// ─── Public API ───

export const WENDEPUNKTE_IDENTIFY_CASES: CaseDefinition[] = [
  { id: 'wp-cubic', label: 'Wendepunkt ablesen (kubisch)', generate: genWPCubic },
  { id: 'wp-quartic', label: 'Wendepunkte ablesen (Grad 4)', generate: genWPQuartic },
  { id: 'wp-kruemmung', label: 'Krümmungswechsel erkennen', generate: genWPKruemmung },
];

export const wendepunkteIdentifyGenerator: ExerciseGenerator = {
  generate(): IdentifyPointsExercise {
    const caseIdx = Math.floor(Math.random() * WENDEPUNKTE_IDENTIFY_CASES.length);
    return WENDEPUNKTE_IDENTIFY_CASES[caseIdx].generate() as IdentifyPointsExercise;
  },
};
