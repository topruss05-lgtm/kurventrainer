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
  return 'gen-smono-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Format polynomial coeffs [a, b, c, d] for degrees 3, 2, 1, 0 as LaTeX.
 */
function formatPolynomial(coeffs: number[]): string {
  const maxDeg = coeffs.length - 1;
  const parts: string[] = [];

  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const deg = maxDeg - i;
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

function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result = result * x + coeffs[i];
  }
  return result;
}

// ─── Cubic generation (same approach as gen-monotonie-intervals / gen-extremstellen) ───

interface CubicData {
  fCoeffs: number[];       // [a, b, c, d]
  fPrimeCoeffs: number[];  // [3a, 2b, c] (quadratic)
  x1: number;              // left extremum (HP for a>0)
  x2: number;              // right extremum (TP for a>0)
  y1: number;
  y2: number;
  fLatex: string;
  fPrimeLatex: string;
}

function generateCubic(): CubicData | null {
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

  // f(x) = x³ - (3s/2)x² + 3p·x + d
  const a = 1;
  const b = -(3 * s) / 2;
  const cCoeff = 3 * p;
  const d = pick([0, 1, -1, 2, -2]);
  const fCoeffs = [a, b, cCoeff, d];

  const y1 = evalPoly(fCoeffs, x1);
  const y2 = evalPoly(fCoeffs, x2);

  if (Math.abs(y1) > 50 || Math.abs(y2) > 50) return null;

  const fLatex = formatFx(fCoeffs);
  const fPrimeLatex = formatFPrime(fPrimeCoeffs);

  return { fCoeffs, fPrimeCoeffs, x1, x2, y1, y2, fLatex, fPrimeLatex };
}

function generateCubicRetry(): CubicData {
  for (let i = 0; i < 50; i++) {
    const data = generateCubic();
    if (data) return data;
  }
  // Fallback: f(x) = x³ - 3x, x1=-1 (HP), x2=1 (TP)
  return {
    fCoeffs: [1, 0, -3, 0],
    fPrimeCoeffs: [3, 0, -3],
    x1: -1, x2: 1,
    y1: 2, y2: -2,
    fLatex: formatFx([1, 0, -3, 0]),
    fPrimeLatex: formatFPrime([3, 0, -3]),
  };
}

// ─── f' MC distractor generation ───

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

  // Wrong power rule (n+1 instead of n)
  const d3 = formatPolynomial([4 * a, 3 * b, 2 * c]);
  if (d3 !== correct) distractorSet.add(d3);

  // Include constant (forgot that constants vanish)
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

// ─── Case A2: Monotonie rechnerisch ───

function genA2Guided(): StepByStepExercise {
  const data = generateCubicRetry();
  const { fCoeffs, fPrimeCoeffs, x1, x2, y1, y2, fLatex, fPrimeLatex } = data;

  // MC for f'
  const correctFPrime = formatPolynomial(fPrimeCoeffs);
  const distractors = generateFPrimeDistractors(fCoeffs, fPrimeCoeffs);
  const fPrimeOptions = [correctFPrime, ...distractors];
  const optionObjects = fPrimeOptions.map((opt, i) => ({ text: opt, idx: i }));
  shuffle(optionObjects);
  const shuffledOptions = optionObjects.map(o => o.text);
  const correctFPrimeIndex = optionObjects.findIndex(o => o.idx === 0);

  // Test points for VZ check
  const testLeft = x1 - 1;
  const testMid = Math.round((x1 + x2) / 2);
  const testRight = x2 + 1;

  const fPrimeLeft = evalPoly(fPrimeCoeffs, testLeft);
  const fPrimeMid = evalPoly(fPrimeCoeffs, testMid);
  const fPrimeRight = evalPoly(fPrimeCoeffs, testRight);

  // For f(x) with leading coeff 1: f' > 0 left of x1, f' < 0 between, f' > 0 right of x2
  const signLeft = fPrimeLeft > 0 ? '> 0' : '< 0';
  const signMid = fPrimeMid > 0 ? '> 0' : '< 0';
  const signRight = fPrimeRight > 0 ? '> 0' : '< 0';

  // Monotonie intervals MC — Klartext mit Unicode
  const correctMonotonie = `smw auf (\u2212\u221e; ${x1}) und (${x2}; +\u221e), smf auf (${x1}; ${x2})`;
  const wrongMono1 = `smf auf (\u2212\u221e; ${x1}) und (${x2}; +\u221e), smw auf (${x1}; ${x2})`;
  const wrongMono2 = `smw auf (\u2212\u221e; ${x2}), smf auf (${x2}; +\u221e)`;
  const wrongMono3 = `smw auf (${x1}; ${x2}), smf sonst`;

  const monoOptions = [correctMonotonie, wrongMono1, wrongMono2, wrongMono3];
  const monoObjs = monoOptions.map((opt, i) => ({ text: opt, idx: i }));
  shuffle(monoObjs);
  const shuffledMono = monoObjs.map(o => o.text);
  const correctMonoIndex = monoObjs.findIndex(o => o.idx === 0);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K3',
    procedure: 'monotonie',
    function: {
      latex: fLatex,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    derivatives: {
      first: {
        latex: fPrimeLatex,
        fn: (x: number) => evalPoly(fPrimeCoeffs, x),
      },
    },
    steps: [
      {
        instruction: `Bestimme \\(f'(x)\\).`,
        inputType: 'multiple-choice',
        options: shuffledOptions.map(s => s),
        correctAnswer: correctFPrimeIndex,
        hint: 'Leite jeden Term einzeln ab: Potenzregel (xⁿ)\u2032 = n\u00b7xⁿ⁻\u00b9.',
        explanation: `Die Ableitung ist \\(${fPrimeLatex}\\).`,
      },
      {
        instruction: `Setze \\(f'(x) = 0\\). Welche x-Werte sind Nullstellen von \\(f'\\)?`,
        inputType: 'number-set',
        correctAnswer: [x1, x2],
        hint: `\\(f'(x) = ${correctFPrime}\\). Setze gleich 0 und löse die quadratische Gleichung.`,
        explanation: `\\(f'(x) = 0\\) ergibt \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\).`,
      },
      {
        instruction: `Welches Vorzeichen hat \\(f'(${testLeft})\\), also links von \\(x_1 = ${x1}\\)?`,
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: signLeft,
        hint: `Setze \\(x = ${testLeft}\\) in \\(f'(x)\\) ein.`,
        explanation: `\\(f'(${testLeft}) = ${fPrimeLeft}\\), also \\(f'(${testLeft}) ${signLeft}\\).`,
      },
      {
        instruction: `Welches Vorzeichen hat \\(f'\\) zwischen \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\)? (z.B. bei \\(x = ${testMid}\\))`,
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: signMid,
        hint: `Setze \\(x = ${testMid}\\) in \\(f'(x)\\) ein.`,
        explanation: `\\(f'(${testMid}) = ${fPrimeMid}\\), also \\(f'(${testMid}) ${signMid}\\).`,
      },
      {
        instruction: `Welches Vorzeichen hat \\(f'(${testRight})\\), also rechts von \\(x_2 = ${x2}\\)?`,
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: signRight,
        hint: `Setze \\(x = ${testRight}\\) in \\(f'(x)\\) ein.`,
        explanation: `\\(f'(${testRight}) = ${fPrimeRight}\\), also \\(f'(${testRight}) ${signRight}\\).`,
      },
      {
        instruction: `In welchen Intervallen ist \\(f\\) streng monoton wachsend (smw) bzw. fallend (smf)?`,
        inputType: 'multiple-choice',
        options: shuffledMono.map(s => s),
        correctAnswer: correctMonoIndex,
        hint: `Wo \\(f' > 0\\) ist, steigt \\(f\\) (smw). Wo \\(f' < 0\\), fällt \\(f\\) (smf).`,
        explanation: `Da \\(f' > 0\\) auf \\((-\\infty;\\, ${x1})\\) und \\((${x2};\\, +\\infty)\\), ist \\(f\\) dort smw. Auf \\((${x1};\\, ${x2})\\) ist \\(f' < 0\\), also \\(f\\) smf.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

function genA2Free(): StepByStepExercise {
  const data = generateCubicRetry();
  const { fCoeffs, fPrimeCoeffs, x1, x2, y1, y2, fLatex, fPrimeLatex } = data;

  // Monotonie-Intervalle MC (wie im geführten Modus)
  const correctMonotonie = `smw auf (\u2212\u221e; ${x1}) und (${x2}; +\u221e), smf auf (${x1}; ${x2})`;
  const wrongMono1 = `smf auf (\u2212\u221e; ${x1}) und (${x2}; +\u221e), smw auf (${x1}; ${x2})`;
  const wrongMono2 = `smw auf (\u2212\u221e; ${x2}), smf auf (${x2}; +\u221e)`;
  const wrongMono3 = `smw auf (${x1}; ${x2}), smf sonst`;
  const monoOptions = [correctMonotonie, wrongMono1, wrongMono2, wrongMono3];
  const monoObjs = monoOptions.map((opt, i) => ({ text: opt, idx: i }));
  shuffle(monoObjs);
  const shuffledMono = monoObjs.map(o => o.text);
  const correctMonoIndex = monoObjs.findIndex(o => o.idx === 0);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K3',
    procedure: 'monotonie',
    function: {
      latex: fLatex,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    derivatives: {
      first: {
        latex: fPrimeLatex,
        fn: (x: number) => evalPoly(fPrimeCoeffs, x),
      },
    },
    steps: [
      {
        instruction: `Berechne \\(f'(x)\\) und bestimme die Nullstellen.`,
        inputType: 'number-set',
        correctAnswer: [x1, x2],
        hint: `Bilde f'(x) mit der Potenzregel, setze f'(x) = 0 und löse die quadratische Gleichung.`,
        explanation: `\\(${fPrimeLatex}\\). Nullstellen: \\(x_1 = ${x1}\\), \\(x_2 = ${x2}\\).`,
      },
      {
        instruction: `In welchen Intervallen ist f streng monoton wachsend (smw) bzw. fallend (smf)?`,
        inputType: 'multiple-choice',
        options: shuffledMono,
        correctAnswer: correctMonoIndex,
        hint: `Prüfe das Vorzeichen von \\(f'\\) in jedem Intervall: \\(f' > 0 \\Rightarrow\\) smw, \\(f' < 0 \\Rightarrow\\) smf.`,
        explanation: `Da \\(f' > 0\\) auf \\((-\\infty;\\, ${x1})\\) und \\((${x2};\\, +\\infty)\\), ist f dort smw. Auf \\((${x1};\\, ${x2})\\) ist \\(f' < 0\\), also f smf.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Case A3: Monotonie auf Intervall ───

function genA3Guided(): StepByStepExercise {
  const data = generateCubicRetry();
  const { fCoeffs, fPrimeCoeffs, x1, x2, y1, y2, fLatex, fPrimeLatex } = data;

  // Pick one of the three monotonicity intervals
  type IntervalInfo = { a: number | string; b: number | string; testX: number; isSmw: boolean };
  const intervals: IntervalInfo[] = [
    { a: '-\\infty', b: x1, testX: x1 - 2, isSmw: true },
    { a: x1, b: x2, testX: Math.round((x1 + x2) / 2), isSmw: false },
    { a: x2, b: '+\\infty', testX: x2 + 2, isSmw: true },
  ];
  const chosen = pick(intervals);

  const intervalLabel = `(${chosen.a};\\, ${chosen.b})`;
  const testVal = chosen.testX;
  const fPrimeAtTest = evalPoly(fPrimeCoeffs, testVal);
  const signWord = fPrimeAtTest > 0 ? 'positiv' : 'negativ';
  const monoResult = chosen.isSmw ? 'streng monoton wachsend (smw)' : 'streng monoton fallend (smf)';

  // MC for f'
  const correctFPrime = formatPolynomial(fPrimeCoeffs);
  const fpDistr = generateFPrimeDistractors(fCoeffs, fPrimeCoeffs);
  const fpOpts = [correctFPrime, ...fpDistr].map((t, i) => ({ t, i }));
  shuffle(fpOpts);
  const correctFPrimeIdx = fpOpts.findIndex(o => o.i === 0);

  // MC for f'(testVal) — Testwert berechnen
  const wrongVals = new Set<number>();
  wrongVals.add(fPrimeAtTest + pick([2, 3, -2, -3]));
  wrongVals.add(-fPrimeAtTest);
  wrongVals.add(evalPoly(fCoeffs, testVal)); // f(testVal) statt f'(testVal) — typischer Fehler
  wrongVals.delete(fPrimeAtTest);
  const testDistractors = [...wrongVals].slice(0, 3);
  while (testDistractors.length < 3) testDistractors.push(fPrimeAtTest + pick([1, -1, 4, -4]));
  const testOpts = [fPrimeAtTest, ...testDistractors].map((v, i) => ({ v, i }));
  shuffle(testOpts);
  const correctTestIdx = testOpts.findIndex(o => o.i === 0);

  // MC: Nullstellen im Intervall?
  const nsQuestion = `Liegen die Nullstellen \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\) von \\(f'\\) im Intervall \\(${intervalLabel}\\)?`;
  const correctNsAnswer = 0; // "Nein" ist immer korrekt (offenes Intervall!)
  const nsOpts = ['Nein — also hat f\u2019 im Intervall konstantes Vorzeichen', 'Ja — f\u2019 wechselt dort das Vorzeichen'];

  // MC for final conclusion
  const monoOpts = [
    monoResult,
    chosen.isSmw ? 'streng monoton fallend (smf)' : 'streng monoton wachsend (smw)',
  ].map((t, i) => ({ t, i }));
  shuffle(monoOpts);
  const correctMonoIdx = monoOpts.findIndex(o => o.i === 0);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K3',
    procedure: 'monotonie-intervall',
    task: `Zeige, dass f auf \\(${intervalLabel}\\) ${monoResult} ist.`,
    function: {
      latex: fLatex,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    derivatives: {
      first: {
        latex: fPrimeLatex,
        fn: (x: number) => evalPoly(fPrimeCoeffs, x),
      },
    },
    steps: [
      {
        instruction: `Bestimme \\(f'(x)\\).`,
        inputType: 'multiple-choice',
        options: fpOpts.map(o => o.t),
        correctAnswer: correctFPrimeIdx,
        hint: 'Leite jeden Term einzeln ab: Potenzregel (x\u207F)\u2032 = n\u00B7x\u207F\u207B\u00B9.',
        explanation: `Die Ableitung ist \\(${fPrimeLatex}\\).`,
      },
      {
        instruction: `Setze \\(f'(x) = 0\\). Die Nullstellen sind \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\). ${nsQuestion}`,
        inputType: 'multiple-choice',
        options: nsOpts,
        correctAnswer: correctNsAnswer,
        hint: `Prüfe: Liegt \\(${x1}\\) oder \\(${x2}\\) im offenen Intervall \\(${intervalLabel}\\)?`,
        explanation: `Die Nullstellen \\(x_1 = ${x1}\\) und \\(x_2 = ${x2}\\) liegen nicht im Intervall \\(${intervalLabel}\\). Also hat \\(f'\\) dort keine Nullstelle und behält ein konstantes Vorzeichen.`,
      },
      {
        instruction: `Berechne \\(f'(${testVal})\\) als Testwert.`,
        inputType: 'multiple-choice',
        options: testOpts.map(o => String(o.v)),
        correctAnswer: correctTestIdx,
        hint: `Setze \\(x = ${testVal}\\) in \\(f'(x) = ${correctFPrime}\\) ein.`,
        explanation: `\\(f'(${testVal}) = ${fPrimeAtTest}\\).`,
      },
      {
        instruction: `\\(f'(${testVal}) = ${fPrimeAtTest}\\) und \\(f'\\) hat keine Nullstelle im Intervall. Also ist f dort...`,
        inputType: 'multiple-choice',
        options: monoOpts.map(o => o.t),
        correctAnswer: correctMonoIdx,
        hint: `\\(f'\\) ist im ganzen Intervall ${signWord}. \\(f' > 0 \\Rightarrow\\) smw, \\(f' < 0 \\Rightarrow\\) smf.`,
        explanation: `\\(f'(${testVal}) = ${fPrimeAtTest}\\) ist ${signWord}. Da \\(f'\\) im Intervall keine Nullstelle hat, ist \\(f'\\) dort überall ${signWord} \\(\\Rightarrow\\) f ist ${monoResult}.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

function genA3Free(): StepByStepExercise {
  const data = generateCubicRetry();
  const { fCoeffs, fPrimeCoeffs, x1, x2, y1, y2, fLatex, fPrimeLatex } = data;

  // Pick an interval
  type IntervalInfo = { a: number | string; b: number | string; testX: number; isSmw: boolean };
  const intervals: IntervalInfo[] = [
    { a: '-\\infty', b: x1, testX: x1 - 2, isSmw: true },
    { a: x1, b: x2, testX: Math.round((x1 + x2) / 2), isSmw: false },
    { a: x2, b: '+\\infty', testX: x2 + 2, isSmw: true },
  ];
  const chosen = pick(intervals);
  const intervalLabel = `[${chosen.a};\\, ${chosen.b}]`;
  const monoResult = chosen.isSmw ? 'smw' : 'smf';
  const testVal = chosen.testX;
  const fPrimeAtTest = evalPoly(fPrimeCoeffs, testVal);

  return {
    id: uid(),
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K3',
    procedure: 'monotonie-intervall',
    task: `Zeige, dass f auf \\(${intervalLabel}\\) ${monoResult} ist.`,
    function: {
      latex: fLatex,
      fn: (x: number) => evalPoly(fCoeffs, x),
    },
    derivatives: {
      first: {
        latex: fPrimeLatex,
        fn: (x: number) => evalPoly(fPrimeCoeffs, x),
      },
    },
    steps: [
      {
        instruction: `Bestimme die Nullstellen von \\(f'\\).`,
        inputType: 'number-set',
        correctAnswer: [x1, x2],
        hint: `Bilde \\(f'(x)\\) mit der Potenzregel, setze \\(f'(x) = 0\\) und löse die quadratische Gleichung.`,
        explanation: `\\(${fPrimeLatex}\\). Nullstellen: \\(x_1 = ${x1}\\), \\(x_2 = ${x2}\\). Beide liegen nicht im Intervall \\(${intervalLabel}\\), also hat \\(f'\\) dort konstantes Vorzeichen.`,
      },
      {
        instruction: `Berechne \\(f'(${testVal})\\) als Testwert im Intervall.`,
        inputType: 'number',
        correctAnswer: fPrimeAtTest,
        hint: `Setze \\(x = ${testVal}\\) in \\(f'(x)\\) ein.`,
        explanation: `\\(f'(${testVal}) = ${fPrimeAtTest}\\).`,
      },
      {
        instruction: `\\(f'\\) hat keine Nullstelle im Intervall und \\(f'(${testVal}) = ${fPrimeAtTest}\\). Also ist f dort...`,
        inputType: 'multiple-choice',
        options: [
          `${monoResult === 'smw' ? 'streng monoton wachsend (smw)' : 'streng monoton fallend (smf)'}`,
          `${monoResult === 'smw' ? 'streng monoton fallend (smf)' : 'streng monoton wachsend (smw)'}`,
        ],
        correctAnswer: 0,
        hint: `\\(f'\\) ist im ganzen Intervall ${fPrimeAtTest > 0 ? 'positiv' : 'negativ'}. \\(f' > 0 \\Rightarrow\\) smw, \\(f' < 0 \\Rightarrow\\) smf.`,
        explanation: `\\(f'(${testVal}) = ${fPrimeAtTest} ${fPrimeAtTest > 0 ? '> 0' : '< 0'}\\). Da \\(f'\\) im Intervall keine Nullstelle hat, ist \\(f'\\) dort überall ${fPrimeAtTest > 0 ? 'positiv' : 'negativ'} \\(\\Rightarrow\\) f ist ${monoResult}.`,
      },
    ],
    verificationGraph: {
      highlights: [
        { x: x1, y: y1, label: `HP(${x1}|${y1})`, color: '#e74c3c' },
        { x: x2, y: y2, label: `TP(${x2}|${y2})`, color: '#2ecc71' },
      ],
    },
  };
}

// ─── Public API ───

export const MONOTONIE_STEP_CASES: CaseDefinition[] = [
  { id: 'a2-guided', label: 'Monotonie rechnerisch (geführt)', mode: 'guided', generate: genA2Guided },
  { id: 'a2-free', label: 'Monotonie rechnerisch (frei)', mode: 'free', generate: genA2Free },
  { id: 'a3-guided', label: 'Monotonie auf Intervall (geführt)', mode: 'guided', generate: genA3Guided },
  { id: 'a3-free', label: 'Monotonie auf Intervall (frei)', mode: 'free', generate: genA3Free },
];

export const monotonieStepGenerator: ExerciseGenerator = {
  generate(): StepByStepExercise {
    const caseIdx = Math.floor(Math.random() * MONOTONIE_STEP_CASES.length);
    return MONOTONIE_STEP_CASES[caseIdx].generate() as StepByStepExercise;
  },
};
