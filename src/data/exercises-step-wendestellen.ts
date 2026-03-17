import type { StepByStepExercise } from '../types/exercise.js';

// ────────────────────────────────────────────────────────────
// D3 — Wendestellen-Nachweis mit 3. Ableitung (KERN)
// ────────────────────────────────────────────────────────────

const d3Exercises: StepByStepExercise[] = [
  // ── D3-01: f(x) = x³ − 3x² + 4 ──
  {
    id: 'wst-step-d3-01',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = x^3 - 3x^2 + 4', fn: (x) => x ** 3 - 3 * x ** 2 + 4 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 6x",  fn: (x) => 3 * x ** 2 - 6 * x },
      second: { latex: "f''(x) = 6x - 6",     fn: (x) => 6 * x - 6 },
      third:  { latex: "f'''(x) = 6",          fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x - 6",
          "f''(x) = 6x + 6",
          "f''(x) = 3x - 6",
          "f''(x) = 6x - 3",
        ],
        correctAnswer: "f''(x) = 6x - 6",
        hint: "Leite f'(x) = 3x² − 6x nochmal ab.",
        explanation: "f''(x) = 6x − 6.",
      },
      {
        instruction: "Setze f''(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [1],
        tolerance: 0.01,
        hint: '6x − 6 = 0 ⟹ x = ?',
        explanation: '6x − 6 = 0 ⟹ x = 1.',
      },
      {
        instruction: "Berechne f'''(1). Ist f'''(1) ≠ 0?",
        inputType: 'sign-choice',
        options: ['≠ 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: '≠ 0 (Wendestelle bestätigt)',
        hint: "f'''(x) = 6 ist eine Konstante.",
        explanation: "f'''(1) = 6 ≠ 0 ⟹ Bei x = 1 liegt eine Wendestelle.",
      },
      {
        instruction: 'Berechne die y-Koordinate f(1).',
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(1) = 1 − 3 + 4.',
        explanation: 'f(1) = 1 − 3 + 4 = 2.',
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [1, 2],
        tolerance: 0.01,
        hint: 'Der Wendepunkt hat die Koordinaten (x_W | f(x_W)).',
        explanation: 'Der Wendepunkt ist W(1 | 2).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: 2, label: 'W(1|2)', color: '#9b59b6' },
      ],
    },
  },

  // ── D3-02: f(x) = x³ − 6x² + 9x ──
  {
    id: 'wst-step-d3-02',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = x^3 - 6x^2 + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12x + 9",  fn: (x) => 3 * x ** 2 - 12 * x + 9 },
      second: { latex: "f''(x) = 6x - 12",          fn: (x) => 6 * x - 12 },
      third:  { latex: "f'''(x) = 6",               fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x - 12",
          "f''(x) = 6x + 12",
          "f''(x) = 3x - 12",
          "f''(x) = 6x - 9",
        ],
        correctAnswer: "f''(x) = 6x - 12",
        hint: "Leite f'(x) = 3x² − 12x + 9 ab.",
        explanation: "f''(x) = 6x − 12.",
      },
      {
        instruction: "Setze f''(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [2],
        tolerance: 0.01,
        hint: '6x − 12 = 0 ⟹ x = ?',
        explanation: '6x − 12 = 0 ⟹ x = 2.',
      },
      {
        instruction: "Berechne f'''(2). Ist f'''(2) ≠ 0?",
        inputType: 'sign-choice',
        options: ['≠ 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: '≠ 0 (Wendestelle bestätigt)',
        hint: "f'''(x) = 6.",
        explanation: "f'''(2) = 6 ≠ 0 ⟹ Bei x = 2 liegt eine Wendestelle.",
      },
      {
        instruction: 'Berechne die y-Koordinate f(2).',
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(2) = 8 − 24 + 18.',
        explanation: 'f(2) = 8 − 24 + 18 = 2.',
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [2, 2],
        tolerance: 0.01,
        hint: 'Der Wendepunkt hat die Koordinaten (x_W | f(x_W)).',
        explanation: 'Der Wendepunkt ist W(2 | 2).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 2, y: 2, label: 'W(2|2)', color: '#9b59b6' },
      ],
    },
  },

  // ── D3-03: f(x) = x³ + 3x² − 9x + 5 ──
  {
    id: 'wst-step-d3-03',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = x^3 + 3x^2 - 9x + 5', fn: (x) => x ** 3 + 3 * x ** 2 - 9 * x + 5 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 + 6x - 9",  fn: (x) => 3 * x ** 2 + 6 * x - 9 },
      second: { latex: "f''(x) = 6x + 6",          fn: (x) => 6 * x + 6 },
      third:  { latex: "f'''(x) = 6",              fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x + 6",
          "f''(x) = 6x - 6",
          "f''(x) = 6x + 9",
          "f''(x) = 3x + 6",
        ],
        correctAnswer: "f''(x) = 6x + 6",
        hint: "Leite f'(x) = 3x² + 6x − 9 ab.",
        explanation: "f''(x) = 6x + 6.",
      },
      {
        instruction: "Setze f''(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [-1],
        tolerance: 0.01,
        hint: '6x + 6 = 0 ⟹ x = ?',
        explanation: '6x + 6 = 0 ⟹ x = −1.',
      },
      {
        instruction: "Berechne f'''(−1). Ist f'''(−1) ≠ 0?",
        inputType: 'sign-choice',
        options: ['≠ 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: '≠ 0 (Wendestelle bestätigt)',
        hint: "f'''(x) = 6.",
        explanation: "f'''(−1) = 6 ≠ 0 ⟹ Bei x = −1 liegt eine Wendestelle.",
      },
      {
        instruction: 'Berechne die y-Koordinate f(−1).',
        inputType: 'number',
        correctAnswer: 16,
        tolerance: 0.01,
        hint: 'f(−1) = (−1)³ + 3·(−1)² − 9·(−1) + 5.',
        explanation: 'f(−1) = −1 + 3 + 9 + 5 = 16.',
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [-1, 16],
        tolerance: 0.01,
        hint: 'Der Wendepunkt hat die Koordinaten (x_W | f(x_W)).',
        explanation: 'Der Wendepunkt ist W(−1 | 16).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 16, label: 'W(−1|16)', color: '#9b59b6' },
      ],
    },
  },

  // ── D3-04: f(x) = x³ − 12x — semi-guided (2 steps, K2) ──
  {
    id: 'wst-step-d3-04',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12",  fn: (x) => 3 * x ** 2 - 12 },
      second: { latex: "f''(x) = 6x",         fn: (x) => 6 * x },
      third:  { latex: "f'''(x) = 6",         fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x",
          "f''(x) = 6x - 12",
          "f''(x) = 3x",
          "f''(x) = 6",
        ],
        correctAnswer: "f''(x) = 6x",
        hint: "Leite f'(x) = 3x² − 12 ab.",
        explanation: "f''(x) = 6x.",
      },
      {
        instruction: 'Bestimme den Wendepunkt.',
        inputType: 'coordinate',
        correctAnswer: [0, 0],
        tolerance: 0.01,
        hint: "f''=0 lösen, f'''≠0 prüfen, dann f(x_W) berechnen",
        explanation: "f''=6x=0 → x=0. f'''=6≠0 → WP. f(0)=0. W(0|0)",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0, label: 'W(0|0)', color: '#9b59b6' },
      ],
    },
  },

  // ── D3-05: f(x) = x³ + 3x² − 9x + 5 — semi-guided (2 steps, K2) ──
  {
    id: 'wst-step-d3-05',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = x^3 + 3x^2 - 9x + 5', fn: (x) => x ** 3 + 3 * x ** 2 - 9 * x + 5 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 + 6x - 9",  fn: (x) => 3 * x ** 2 + 6 * x - 9 },
      second: { latex: "f''(x) = 6x + 6",          fn: (x) => 6 * x + 6 },
      third:  { latex: "f'''(x) = 6",              fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x + 6",
          "f''(x) = 6x - 6",
          "f''(x) = 6x + 9",
          "f''(x) = 3x + 6",
        ],
        correctAnswer: "f''(x) = 6x + 6",
        hint: "Leite f'(x) = 3x² + 6x − 9 ab.",
        explanation: "f''(x) = 6x + 6.",
      },
      {
        instruction: 'Bestimme den Wendepunkt.',
        inputType: 'coordinate',
        correctAnswer: [-1, 16],
        tolerance: 0.1,
        hint: "f''=0 → x=-1. f'''=6≠0. f(-1)=-1+3+9+5=16",
        explanation: "W(-1|16)",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 16, label: 'W(−1|16)', color: '#9b59b6' },
      ],
    },
  },

  // ── D3-06: f(x) = x³ − 3x² + 4 — independent (1 step, K3) ──
  {
    id: 'wst-step-d3-06',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = x^3 - 3x^2 + 4', fn: (x) => x ** 3 - 3 * x ** 2 + 4 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 6x",  fn: (x) => 3 * x ** 2 - 6 * x },
      second: { latex: "f''(x) = 6x - 6",     fn: (x) => 6 * x - 6 },
      third:  { latex: "f'''(x) = 6",          fn: () => 6 },
    },
    steps: [
      {
        instruction: 'Bestimme den Wendepunkt von f.',
        inputType: 'coordinate',
        correctAnswer: [1, 2],
        tolerance: 0.01,
        hint: "f'' bilden, f''=0 lösen, f''' prüfen, f(x_W) berechnen",
        explanation: "f''=6x-6=0 → x=1. f'''=6≠0. f(1)=1-3+4=2. W(1|2)",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: 2, label: 'W(1|2)', color: '#9b59b6' },
      ],
    },
  },

  // ── D3-07: f(x) = −x³ + 6x² − 9x + 2 — independent (1 step, K3) ──
  {
    id: 'wst-step-d3-07',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendestellen-nachweis',
    function: { latex: 'f(x) = -x^3 + 6x^2 - 9x + 2', fn: (x) => -(x ** 3) + 6 * x ** 2 - 9 * x + 2 },
    derivatives: {
      first:  { latex: "f'(x) = -3x^2 + 12x - 9",  fn: (x) => -3 * x ** 2 + 12 * x - 9 },
      second: { latex: "f''(x) = -6x + 12",          fn: (x) => -6 * x + 12 },
      third:  { latex: "f'''(x) = -6",               fn: () => -6 },
    },
    steps: [
      {
        instruction: 'Bestimme den Wendepunkt von f.',
        inputType: 'coordinate',
        correctAnswer: [2, 0],
        tolerance: 0.01,
        hint: "f'' bilden, Nullstelle finden, f''' prüfen, y-Wert berechnen",
        explanation: "f''=-6x+12=0 → x=2. f'''=-6≠0. f(2)=-8+24-18+2=0. W(2|0)",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 2, y: 0, label: 'W(2|0)', color: '#9b59b6' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// D5 — Wendetangente berechnen (KERN)
// ────────────────────────────────────────────────────────────

const d5Exercises: StepByStepExercise[] = [
  // ── D5-01: f(x) = x³ − 3x² + 4 ──
  {
    id: 'wst-step-d5-01',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendetangente',
    function: { latex: 'f(x) = x^3 - 3x^2 + 4', fn: (x) => x ** 3 - 3 * x ** 2 + 4 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 6x",  fn: (x) => 3 * x ** 2 - 6 * x },
      second: { latex: "f''(x) = 6x - 6",     fn: (x) => 6 * x - 6 },
      third:  { latex: "f'''(x) = 6",          fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x - 6",
          "f''(x) = 6x + 6",
          "f''(x) = 3x - 6",
          "f''(x) = 6x - 3",
        ],
        correctAnswer: "f''(x) = 6x - 6",
        hint: "Leite f'(x) = 3x² − 6x ab.",
        explanation: "f''(x) = 6x − 6.",
      },
      {
        instruction: "Setze f''(x) = 0. Wo liegt der Wendepunkt?",
        inputType: 'number',
        correctAnswer: 1,
        tolerance: 0.01,
        hint: '6x − 6 = 0.',
        explanation: '6x − 6 = 0 ⟹ x_W = 1.',
      },
      {
        instruction: 'Berechne f(x_W) = f(1) — die y-Koordinate des Wendepunkts.',
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(1) = 1 − 3 + 4.',
        explanation: 'f(1) = 1 − 3 + 4 = 2.',
      },
      {
        instruction: "Berechne f'(x_W) = f'(1) — die Steigung der Wendetangente.",
        inputType: 'number',
        correctAnswer: -3,
        tolerance: 0.01,
        hint: "f'(1) = 3·1² − 6·1.",
        explanation: "f'(1) = 3 − 6 = −3.",
      },
      {
        instruction: "Die Wendetangente hat die Form y = m·(x − x_W) + y_W. Welche Gleichung ist richtig?",
        inputType: 'multiple-choice',
        options: [
          'y = -3x + 5',
          'y = -3x + 2',
          'y = -3x - 1',
          'y = 3x - 1',
        ],
        correctAnswer: 'y = -3x + 5',
        hint: 'y = −3·(x − 1) + 2 = −3x + 3 + 2.',
        explanation: 'y = −3·(x − 1) + 2 = −3x + 3 + 2 = −3x + 5.',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: 2, label: 'W(1|2)', color: '#9b59b6' },
      ],
    },
  },

  // ── D5-02: f(x) = x³ − 6x² + 9x ──
  {
    id: 'wst-step-d5-02',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendetangente',
    function: { latex: 'f(x) = x^3 - 6x^2 + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12x + 9",  fn: (x) => 3 * x ** 2 - 12 * x + 9 },
      second: { latex: "f''(x) = 6x - 12",          fn: (x) => 6 * x - 12 },
      third:  { latex: "f'''(x) = 6",               fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x - 12",
          "f''(x) = 6x + 12",
          "f''(x) = 3x - 12",
          "f''(x) = 6x - 9",
        ],
        correctAnswer: "f''(x) = 6x - 12",
        hint: "Leite f'(x) = 3x² − 12x + 9 ab.",
        explanation: "f''(x) = 6x − 12.",
      },
      {
        instruction: "Setze f''(x) = 0. Wo liegt der Wendepunkt?",
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: '6x − 12 = 0.',
        explanation: '6x − 12 = 0 ⟹ x_W = 2.',
      },
      {
        instruction: 'Berechne f(x_W) = f(2) — die y-Koordinate des Wendepunkts.',
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(2) = 8 − 24 + 18.',
        explanation: 'f(2) = 8 − 24 + 18 = 2.',
      },
      {
        instruction: "Berechne f'(x_W) = f'(2) — die Steigung der Wendetangente.",
        inputType: 'number',
        correctAnswer: -3,
        tolerance: 0.01,
        hint: "f'(2) = 3·4 − 12·2 + 9.",
        explanation: "f'(2) = 12 − 24 + 9 = −3.",
      },
      {
        instruction: "Die Wendetangente hat die Form y = m·(x − x_W) + y_W. Welche Gleichung ist richtig?",
        inputType: 'multiple-choice',
        options: [
          'y = -3x + 8',
          'y = -3x + 2',
          'y = -3x - 4',
          'y = 3x - 4',
        ],
        correctAnswer: 'y = -3x + 8',
        hint: 'y = −3·(x − 2) + 2 = −3x + 6 + 2.',
        explanation: 'y = −3·(x − 2) + 2 = −3x + 6 + 2 = −3x + 8.',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 2, y: 2, label: 'W(2|2)', color: '#9b59b6' },
      ],
    },
  },

  // ── D5-03: f(x) = x³ − 12x ──
  {
    id: 'wst-step-d5-03',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendetangente',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12",  fn: (x) => 3 * x ** 2 - 12 },
      second: { latex: "f''(x) = 6x",         fn: (x) => 6 * x },
      third:  { latex: "f'''(x) = 6",         fn: () => 6 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x",
          "f''(x) = 6x - 12",
          "f''(x) = 3x",
          "f''(x) = 6",
        ],
        correctAnswer: "f''(x) = 6x",
        hint: "Leite f'(x) = 3x² − 12 ab.",
        explanation: "f''(x) = 6x.",
      },
      {
        instruction: "Setze f''(x) = 0. Wo liegt der Wendepunkt?",
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: '6x = 0.',
        explanation: '6x = 0 ⟹ x_W = 0.',
      },
      {
        instruction: 'Berechne f(x_W) = f(0) — die y-Koordinate des Wendepunkts.',
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'f(0) = 0³ − 12·0.',
        explanation: 'f(0) = 0 − 0 = 0.',
      },
      {
        instruction: "Berechne f'(x_W) = f'(0) — die Steigung der Wendetangente.",
        inputType: 'number',
        correctAnswer: -12,
        tolerance: 0.01,
        hint: "f'(0) = 3·0² − 12.",
        explanation: "f'(0) = 0 − 12 = −12.",
      },
      {
        instruction: "Die Wendetangente hat die Form y = m·(x − x_W) + y_W. Welche Gleichung ist richtig?",
        inputType: 'multiple-choice',
        options: [
          'y = -12x',
          'y = -12x + 12',
          'y = 12x',
          'y = -12x - 12',
        ],
        correctAnswer: 'y = -12x',
        hint: 'y = −12·(x − 0) + 0 = −12x.',
        explanation: 'y = −12·(x − 0) + 0 = −12x. Die Wendetangente geht durch den Ursprung.',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0, label: 'W(0|0)', color: '#9b59b6' },
      ],
    },
  },

  // ── D5-04: f(x) = x³ − 12x — semi-guided (3 steps, K2) ──
  {
    id: 'wst-step-d5-04',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendetangente',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12",  fn: (x) => 3 * x ** 2 - 12 },
      second: { latex: "f''(x) = 6x",         fn: (x) => 6 * x },
      third:  { latex: "f'''(x) = 6",         fn: () => 6 },
    },
    steps: [
      {
        instruction: 'Bestimme den Wendepunkt.',
        inputType: 'coordinate',
        correctAnswer: [0, 0],
        tolerance: 0.01,
        hint: "f''=6x=0 → x=0, f(0)=0",
        explanation: "W(0|0)",
      },
      {
        instruction: "Berechne die Steigung der Wendetangente f'(x_W).",
        inputType: 'number',
        correctAnswer: -12,
        tolerance: 0.01,
        hint: "f'(x)=3x²-12, f'(0)=-12",
        explanation: "f'(0)=0-12=-12",
      },
      {
        instruction: 'Welche Gleichung hat die Wendetangente?',
        inputType: 'multiple-choice',
        options: [
          'y = -12x',
          'y = -12x + 12',
          'y = 12x',
          'y = -12x - 12',
        ],
        correctAnswer: 'y = -12x',
        hint: 'y = m·(x − x_W) + y_W einsetzen.',
        explanation: "y = -12·(x-0) + 0 = -12x",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0, label: 'W(0|0)', color: '#9b59b6' },
      ],
    },
  },

  // ── D5-05: f(x) = x³ + 3x² − 9x + 5 — semi-guided (3 steps, K2) ──
  {
    id: 'wst-step-d5-05',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'wendetangente',
    function: { latex: 'f(x) = x^3 + 3x^2 - 9x + 5', fn: (x) => x ** 3 + 3 * x ** 2 - 9 * x + 5 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 + 6x - 9",  fn: (x) => 3 * x ** 2 + 6 * x - 9 },
      second: { latex: "f''(x) = 6x + 6",          fn: (x) => 6 * x + 6 },
      third:  { latex: "f'''(x) = 6",              fn: () => 6 },
    },
    steps: [
      {
        instruction: 'Bestimme den Wendepunkt.',
        inputType: 'coordinate',
        correctAnswer: [-1, 16],
        tolerance: 0.1,
        hint: "f''=6x+6=0 → x=-1, f(-1)=16",
        explanation: "W(-1|16)",
      },
      {
        instruction: "Berechne die Steigung der Wendetangente f'(x_W).",
        inputType: 'number',
        correctAnswer: -12,
        tolerance: 0.01,
        hint: "f'(x)=3x²+6x-9, f'(-1)=3-6-9=-12",
        explanation: "f'(-1)=3·1+6·(-1)-9=3-6-9=-12",
      },
      {
        instruction: 'Welche Gleichung hat die Wendetangente?',
        inputType: 'multiple-choice',
        options: [
          'y = -12x + 4',
          'y = -12x + 16',
          'y = -12x - 12',
          'y = 12x + 4',
        ],
        correctAnswer: 'y = -12x + 4',
        hint: 'y = m·(x − x_W) + y_W einsetzen.',
        explanation: "y = -12·(x-(-1)) + 16 = -12x - 12 + 16 = -12x + 4",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 16, label: 'W(−1|16)', color: '#9b59b6' },
      ],
    },
  },
];

export const stepWendestellenExercises: StepByStepExercise[] = [
  ...d3Exercises,
  ...d5Exercises,
];
