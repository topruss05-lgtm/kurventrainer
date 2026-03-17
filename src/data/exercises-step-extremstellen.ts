import type { StepByStepExercise } from '../types/exercise.js';

// ────────────────────────────────────────────────────────────
// C1 — Extremstellen-Nachweis mit 2. Ableitung (KERN)
// ────────────────────────────────────────────────────────────

const c1Exercises: StepByStepExercise[] = [
  // ── C1-01: f(x) = x³ − 3x ──
  {
    id: 'ext-step-c1-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-nachweis',
    function: { latex: 'f(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 3",  fn: (x) => 3 * x ** 2 - 3 },
      second: { latex: "f''(x) = 6x",        fn: (x) => 6 * x },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 - 3",
          "f'(x) = 3x^2 + 3",
          "f'(x) = x^2 - 3",
          "f'(x) = 3x - 3",
        ],
        correctAnswer: "f'(x) = 3x^2 - 3",
        hint: 'Leite jeden Summanden einzeln ab: (xⁿ)\' = n·xⁿ⁻¹.',
        explanation: "f'(x) = 3x² − 3. Die Ableitung von x³ ist 3x², die von −3x ist −3.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [-1, 1],
        tolerance: 0.01,
        hint: 'Löse 3x² − 3 = 0 ⟹ x² = 1.',
        explanation: '3x² − 3 = 0 ⟹ x² = 1 ⟹ x = −1 oder x = 1.',
      },
      {
        instruction: "Berechne f''(−1). Ist f''(−1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(x) = 6x. Setze x = −1 ein.",
        explanation: "f''(−1) = 6·(−1) = −6 < 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = −1?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt', 'Keine Aussage möglich'],
        correctAnswer: 'Maximum',
        hint: "f''(x₀) < 0 bedeutet Rechtskurve — also ein Maximum.",
        explanation: "f''(−1) = −6 < 0 ⟹ Hochpunkt (Maximum) bei x = −1.",
      },
      {
        instruction: "Berechne f''(1). Ist f''(1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(x) = 6x. Setze x = 1 ein.",
        explanation: "f''(1) = 6·1 = 6 > 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 1?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt', 'Keine Aussage möglich'],
        correctAnswer: 'Minimum',
        hint: "f''(x₀) > 0 bedeutet Linkskurve — also ein Minimum.",
        explanation: "f''(1) = 6 > 0 ⟹ Tiefpunkt (Minimum) bei x = 1.",
      },
      {
        instruction: 'Berechne die y-Koordinate f(−1).',
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(−1) = (−1)³ − 3·(−1).',
        explanation: 'f(−1) = −1 + 3 = 2. Der Hochpunkt ist H(−1 | 2).',
      },
      {
        instruction: 'Berechne die y-Koordinate f(1).',
        inputType: 'number',
        correctAnswer: -2,
        tolerance: 0.01,
        hint: 'f(1) = 1³ − 3·1.',
        explanation: 'f(1) = 1 − 3 = −2. Der Tiefpunkt ist T(1 | −2).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 2,  label: 'H(−1|2)',  color: '#e74c3c' },
        { x: 1,  y: -2, label: 'T(1|−2)',   color: '#2ecc71' },
      ],
    },
  },

  // ── C1-02: f(x) = x³ − 6x² + 9x ──
  {
    id: 'ext-step-c1-02',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-nachweis',
    function: { latex: 'f(x) = x^3 - 6x^2 + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12x + 9",  fn: (x) => 3 * x ** 2 - 12 * x + 9 },
      second: { latex: "f''(x) = 6x - 12",          fn: (x) => 6 * x - 12 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 - 12x + 9",
          "f'(x) = 3x^2 - 12x",
          "f'(x) = x^2 - 6x + 9",
          "f'(x) = 3x^2 - 6x + 9",
        ],
        correctAnswer: "f'(x) = 3x^2 - 12x + 9",
        hint: 'Leite jeden Summanden ab: (x³)\' = 3x², (−6x²)\' = −12x, (9x)\' = 9.',
        explanation: "f'(x) = 3x² − 12x + 9.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [1, 3],
        tolerance: 0.01,
        hint: 'Teile durch 3: x² − 4x + 3 = 0. Faktorisiere oder nutze die p-q-Formel.',
        explanation: '3x² − 12x + 9 = 0 ⟹ x² − 4x + 3 = 0 ⟹ (x−1)(x−3) = 0 ⟹ x = 1 oder x = 3.',
      },
      {
        instruction: "Berechne f''(1). Ist f''(1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(x) = 6x − 12. Setze x = 1 ein.",
        explanation: "f''(1) = 6 − 12 = −6 < 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 1?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt', 'Keine Aussage möglich'],
        correctAnswer: 'Maximum',
        hint: "f''(x₀) < 0 ⟹ Maximum.",
        explanation: "f''(1) < 0 ⟹ Hochpunkt bei x = 1.",
      },
      {
        instruction: "Berechne f''(3). Ist f''(3) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(x) = 6x − 12. Setze x = 3 ein.",
        explanation: "f''(3) = 18 − 12 = 6 > 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 3?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt', 'Keine Aussage möglich'],
        correctAnswer: 'Minimum',
        hint: "f''(x₀) > 0 ⟹ Minimum.",
        explanation: "f''(3) = 6 > 0 ⟹ Tiefpunkt bei x = 3.",
      },
      {
        instruction: 'Berechne die y-Koordinate f(1).',
        inputType: 'number',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'f(1) = 1 − 6 + 9.',
        explanation: 'f(1) = 1 − 6 + 9 = 4. Der Hochpunkt ist H(1 | 4).',
      },
      {
        instruction: 'Berechne die y-Koordinate f(3).',
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'f(3) = 27 − 54 + 27.',
        explanation: 'f(3) = 27 − 54 + 27 = 0. Der Tiefpunkt ist T(3 | 0).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: 4, label: 'H(1|4)', color: '#e74c3c' },
        { x: 3, y: 0, label: 'T(3|0)', color: '#2ecc71' },
      ],
    },
  },

  // ── C1-03: f(x) = −x³ + 3x ──
  {
    id: 'ext-step-c1-03',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-nachweis',
    function: { latex: 'f(x) = -x^3 + 3x', fn: (x) => -(x ** 3) + 3 * x },
    derivatives: {
      first:  { latex: "f'(x) = -3x^2 + 3",  fn: (x) => -3 * x ** 2 + 3 },
      second: { latex: "f''(x) = -6x",        fn: (x) => -6 * x },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = -3x^2 + 3",
          "f'(x) = -3x^2 - 3",
          "f'(x) = 3x^2 + 3",
          "f'(x) = -x^2 + 3",
        ],
        correctAnswer: "f'(x) = -3x^2 + 3",
        hint: 'Ableitung von −x³ ist −3x².',
        explanation: "f'(x) = −3x² + 3.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [-1, 1],
        tolerance: 0.01,
        hint: '−3x² + 3 = 0 ⟹ x² = 1.',
        explanation: '−3x² + 3 = 0 ⟹ x² = 1 ⟹ x = −1 oder x = 1.',
      },
      {
        instruction: "Berechne f''(−1). Ist f''(−1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(x) = −6x. Setze x = −1 ein.",
        explanation: "f''(−1) = −6·(−1) = 6 > 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = −1?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt', 'Keine Aussage möglich'],
        correctAnswer: 'Minimum',
        hint: "f''(x₀) > 0 ⟹ Minimum.",
        explanation: "f''(−1) = 6 > 0 ⟹ Tiefpunkt bei x = −1.",
      },
      {
        instruction: "Berechne f''(1). Ist f''(1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(x) = −6x. Setze x = 1 ein.",
        explanation: "f''(1) = −6 < 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 1?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt', 'Keine Aussage möglich'],
        correctAnswer: 'Maximum',
        hint: "f''(x₀) < 0 ⟹ Maximum.",
        explanation: "f''(1) = −6 < 0 ⟹ Hochpunkt bei x = 1.",
      },
      {
        instruction: 'Berechne die y-Koordinate f(−1).',
        inputType: 'number',
        correctAnswer: -2,
        tolerance: 0.01,
        hint: 'f(−1) = −(−1)³ + 3·(−1) = 1 − 3.',
        explanation: 'f(−1) = 1 − 3 = −2. Der Tiefpunkt ist T(−1 | −2).',
      },
      {
        instruction: 'Berechne die y-Koordinate f(1).',
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(1) = −1 + 3.',
        explanation: 'f(1) = −1 + 3 = 2. Der Hochpunkt ist H(1 | 2).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: -2, label: 'T(−1|−2)', color: '#2ecc71' },
        { x: 1,  y: 2,  label: 'H(1|2)',    color: '#e74c3c' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// C1 semi — Extremstellen-Nachweis, semi-guided (K2, 2-3 Schritte)
// ────────────────────────────────────────────────────────────

const c1SemiExercises: StepByStepExercise[] = [
  // ── C1-04: f(x) = x³ − 12x (semi-guided) ──
  {
    id: 'ext-step-c1-04',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-nachweis',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12",  fn: (x) => 3 * x ** 2 - 12 },
      second: { latex: "f''(x) = 6x",          fn: (x) => 6 * x },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 - 12",
          "f'(x) = 3x^2 + 12",
          "f'(x) = x^2 - 12",
          "f'(x) = 3x - 12",
        ],
        correctAnswer: "f'(x) = 3x^2 - 12",
        hint: 'Leite jeden Summanden einzeln ab: (xⁿ)\' = n·xⁿ⁻¹.',
        explanation: "f'(x) = 3x² − 12.",
      },
      {
        instruction: 'Bestimme alle Extrempunkte. Gib den Hochpunkt an.',
        inputType: 'coordinate',
        correctAnswer: [-2, 16],
        tolerance: 0.1,
        hint: "f'(x) = 0 lösen, dann f'' prüfen, dann y-Wert berechnen.",
        explanation: "f'(x) = 3x²−12 = 0 → x = ±2. f''(−2) = −12 < 0 → HP. f(−2) = −8+24 = 16.",
      },
      {
        instruction: 'Gib den Tiefpunkt an.',
        inputType: 'coordinate',
        correctAnswer: [2, -16],
        tolerance: 0.1,
        hint: "f''(2) = 12 > 0 → Minimum.",
        explanation: "f''(2) = 12 > 0 → TP. f(2) = 8−24 = −16.",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -2, y: 16,  label: 'H(−2|16)',  color: '#e74c3c' },
        { x: 2,  y: -16, label: 'T(2|−16)',   color: '#2ecc71' },
      ],
    },
  },

  // ── C1-05: f(x) = x³ + 3x² − 9x + 5 (semi-guided) ──
  {
    id: 'ext-step-c1-05',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-nachweis',
    function: { latex: 'f(x) = x^3 + 3x^2 - 9x + 5', fn: (x) => x ** 3 + 3 * x ** 2 - 9 * x + 5 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 + 6x - 9",  fn: (x) => 3 * x ** 2 + 6 * x - 9 },
      second: { latex: "f''(x) = 6x + 6",          fn: (x) => 6 * x + 6 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 + 6x - 9",
          "f'(x) = 3x^2 + 3x - 9",
          "f'(x) = x^2 + 3x - 9",
          "f'(x) = 3x^2 + 6x + 5",
        ],
        correctAnswer: "f'(x) = 3x^2 + 6x - 9",
        hint: 'Leite jeden Summanden ab. Beachte: (5)\' = 0.',
        explanation: "f'(x) = 3x² + 6x − 9.",
      },
      {
        instruction: 'Bestimme den Hochpunkt.',
        inputType: 'coordinate',
        correctAnswer: [-3, 32],
        tolerance: 0.1,
        hint: "f'=0 → 3(x²+2x−3)=0 → x=−3 oder x=1. f''(−3)=−12<0 → HP.",
        explanation: "f(−3) = −27+27+27+5 = 32. HP(−3|32).",
      },
      {
        instruction: 'Bestimme den Tiefpunkt.',
        inputType: 'coordinate',
        correctAnswer: [1, 0],
        tolerance: 0.1,
        hint: "f''(1)=12>0 → TP.",
        explanation: "f(1) = 1+3−9+5 = 0. TP(1|0).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -3, y: 32, label: 'H(−3|32)', color: '#e74c3c' },
        { x: 1,  y: 0,  label: 'T(1|0)',    color: '#2ecc71' },
      ],
    },
  },

  // ── C1-06: f(x) = −x³ + 12x (semi-guided) ──
  {
    id: 'ext-step-c1-06',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-nachweis',
    function: { latex: 'f(x) = -x^3 + 12x', fn: (x) => -(x ** 3) + 12 * x },
    derivatives: {
      first:  { latex: "f'(x) = -3x^2 + 12",  fn: (x) => -3 * x ** 2 + 12 },
      second: { latex: "f''(x) = -6x",          fn: (x) => -6 * x },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = -3x^2 + 12",
          "f'(x) = -3x^2 - 12",
          "f'(x) = 3x^2 + 12",
          "f'(x) = -x^2 + 12",
        ],
        correctAnswer: "f'(x) = -3x^2 + 12",
        hint: 'Ableitung von −x³ ist −3x².',
        explanation: "f'(x) = −3x² + 12.",
      },
      {
        instruction: 'Bestimme den Tiefpunkt.',
        inputType: 'coordinate',
        correctAnswer: [-2, -16],
        tolerance: 0.1,
        hint: "f'=0 → x=±2. f''(−2)=12>0 → Min. f(−2)=8−24=−16.",
        explanation: "TP(−2|−16).",
      },
      {
        instruction: 'Bestimme den Hochpunkt.',
        inputType: 'coordinate',
        correctAnswer: [2, 16],
        tolerance: 0.1,
        hint: "f''(2)=−12<0 → Max. f(2)=−8+24=16.",
        explanation: "HP(2|16).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -2, y: -16, label: 'T(−2|−16)', color: '#2ecc71' },
        { x: 2,  y: 16,  label: 'H(2|16)',    color: '#e74c3c' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// C1 independent — Extremstellen eigenständig (K3, 1 Schritt)
// ────────────────────────────────────────────────────────────

const c1IndependentExercises: StepByStepExercise[] = [
  // ── C1-07: f(x) = x³ − 3x (eigenständig) ──
  {
    id: 'ext-step-c1-07',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K3',
    procedure: 'extremstellen-eigenstaendig',
    function: { latex: 'f(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 3",  fn: (x) => 3 * x ** 2 - 3 },
      second: { latex: "f''(x) = 6x",        fn: (x) => 6 * x },
    },
    steps: [
      {
        instruction: 'Bestimme den Hochpunkt von f.',
        inputType: 'coordinate',
        correctAnswer: [-1, 2],
        tolerance: 0.01,
        hint: "Algorithmus: f' bilden → f'=0 → f'' prüfen → y-Wert.",
        explanation: "f'=3x²−3=0 → x=±1. f''(−1)=−6<0 → HP(−1|2).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 2,  label: 'H(−1|2)',  color: '#e74c3c' },
        { x: 1,  y: -2, label: 'T(1|−2)',   color: '#2ecc71' },
      ],
    },
  },

  // ── C1-08: f(x) = x³ − 6x² + 9x (eigenständig) ──
  {
    id: 'ext-step-c1-08',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K3',
    procedure: 'extremstellen-eigenstaendig',
    function: { latex: 'f(x) = x^3 - 6x^2 + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12x + 9",  fn: (x) => 3 * x ** 2 - 12 * x + 9 },
      second: { latex: "f''(x) = 6x - 12",          fn: (x) => 6 * x - 12 },
    },
    steps: [
      {
        instruction: 'Bestimme den Tiefpunkt von f.',
        inputType: 'coordinate',
        correctAnswer: [3, 0],
        tolerance: 0.01,
        hint: "f' bilden, Nullstellen finden, f'' prüfen, y-Wert berechnen.",
        explanation: "f'=3x²−12x+9=0 → x=1,3. f''(3)=6>0 → TP(3|0).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: 4, label: 'H(1|4)', color: '#e74c3c' },
        { x: 3, y: 0, label: 'T(3|0)', color: '#2ecc71' },
      ],
    },
  },

  // ── C1-09: f(x) = x³ + 3x² − 9x + 5 (eigenständig) ──
  {
    id: 'ext-step-c1-09',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K3',
    procedure: 'extremstellen-eigenstaendig',
    function: { latex: 'f(x) = x^3 + 3x^2 - 9x + 5', fn: (x) => x ** 3 + 3 * x ** 2 - 9 * x + 5 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 + 6x - 9",  fn: (x) => 3 * x ** 2 + 6 * x - 9 },
      second: { latex: "f''(x) = 6x + 6",          fn: (x) => 6 * x + 6 },
    },
    steps: [
      {
        instruction: 'Bestimme den Hochpunkt von f.',
        inputType: 'coordinate',
        correctAnswer: [-3, 32],
        tolerance: 0.1,
        hint: "Standardverfahren: Ableiten, Nullstellen, Kriterium, Koordinaten.",
        explanation: "f'=3x²+6x−9=0 → x=−3,1. f''(−3)=−12<0 → HP(−3|32).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -3, y: 32, label: 'H(−3|32)', color: '#e74c3c' },
        { x: 1,  y: 0,  label: 'T(1|0)',    color: '#2ecc71' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// C2 — VZW-Kriterium anwenden (KERN)
// ────────────────────────────────────────────────────────────

const c2Exercises: StepByStepExercise[] = [
  // ── C2-01: f(x) = x⁴ − 4x³  (Sattelpunkt bei x=0) ──
  {
    id: 'ext-step-c2-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-vzw',
    function: { latex: 'f(x) = x^4 - 4x^3', fn: (x) => x ** 4 - 4 * x ** 3 },
    derivatives: {
      first:  { latex: "f'(x) = 4x^3 - 12x^2", fn: (x) => 4 * x ** 3 - 12 * x ** 2 },
      second: { latex: "f''(x) = 12x^2 - 24x",  fn: (x) => 12 * x ** 2 - 24 * x },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 4x^3 - 12x^2",
          "f'(x) = 4x^3 - 4x^2",
          "f'(x) = 3x^3 - 12x^2",
          "f'(x) = 4x^2 - 12x",
        ],
        correctAnswer: "f'(x) = 4x^3 - 12x^2",
        hint: '(x⁴)\' = 4x³ und (−4x³)\' = −12x².',
        explanation: "f'(x) = 4x³ − 12x².",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [0, 3],
        tolerance: 0.01,
        hint: 'Klammere aus: 4x²(x − 3) = 0.',
        explanation: '4x³ − 12x² = 4x²(x − 3) = 0 ⟹ x = 0 oder x = 3.',
      },
      {
        instruction: "Hinweis: f''(0) = 0, daher brauchen wir das VZW-Kriterium bei x = 0.\nPrüfe das Vorzeichen von f'(x) links von x = 0 (z.\u202FB. bei x = −1).",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "Berechne f'(−1) = 4·(−1)³ − 12·(−1)².",
        explanation: "f'(−1) = −4 − 12 = −16 < 0.",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) rechts von x = 0 (z.\u202FB. bei x = 1).",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "Berechne f'(1) = 4·1 − 12·1.",
        explanation: "f'(1) = 4 − 12 = −8 < 0.",
      },
      {
        instruction: 'Links negativ, rechts negativ — kein Vorzeichenwechsel. Welche Art hat die Stelle x = 0?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt'],
        correctAnswer: 'Sattelpunkt',
        hint: 'Kein Vorzeichenwechsel bedeutet weder Maximum noch Minimum.',
        explanation: "f' wechselt das Vorzeichen bei x = 0 nicht ⟹ Sattelpunkt (Terrassenpunkt).",
      },
      {
        instruction: 'Berechne f(0).',
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'f(0) = 0⁴ − 4·0³.',
        explanation: 'f(0) = 0. Der Sattelpunkt ist S(0 | 0).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0,   label: 'S(0|0)',     color: '#f39c12' },
        { x: 3, y: -27,  label: 'T(3|−27)',   color: '#2ecc71' },
      ],
    },
  },

  // ── C2-02: f(x) = x⁴  (Minimum bei x=0 nur per VZW) ──
  {
    id: 'ext-step-c2-02',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-vzw',
    function: { latex: 'f(x) = x^4', fn: (x) => x ** 4 },
    derivatives: {
      first:  { latex: "f'(x) = 4x^3",   fn: (x) => 4 * x ** 3 },
      second: { latex: "f''(x) = 12x^2",  fn: (x) => 12 * x ** 2 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 4x^3",
          "f'(x) = 4x^2",
          "f'(x) = 3x^4",
          "f'(x) = x^3",
        ],
        correctAnswer: "f'(x) = 4x^3",
        hint: '(x⁴)\' = 4x³.',
        explanation: "f'(x) = 4x³.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [0],
        tolerance: 0.01,
        hint: '4x³ = 0 ⟹ x = 0.',
        explanation: '4x³ = 0 hat nur die Lösung x = 0.',
      },
      {
        instruction: "Hinweis: f''(0) = 12·0² = 0, daher brauchen wir das VZW-Kriterium.\nPrüfe das Vorzeichen von f'(x) links von x = 0 (z.\u202FB. bei x = −1).",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f'(−1) = 4·(−1)³.",
        explanation: "f'(−1) = −4 < 0.",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) rechts von x = 0 (z.\u202FB. bei x = 1).",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f'(1) = 4·1³.",
        explanation: "f'(1) = 4 > 0.",
      },
      {
        instruction: 'Links negativ, rechts positiv — Vorzeichenwechsel von − nach +. Welche Art hat die Stelle x = 0?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt'],
        correctAnswer: 'Minimum',
        hint: 'VZW von − nach + bedeutet: f fällt erst, dann steigt f ⟹ Tiefpunkt.',
        explanation: "f' wechselt von negativ zu positiv ⟹ Minimum bei x = 0.",
      },
      {
        instruction: 'Berechne f(0).',
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'f(0) = 0⁴.',
        explanation: 'f(0) = 0. Der Tiefpunkt ist T(0 | 0).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0, label: 'T(0|0)', color: '#2ecc71' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// B2 — Mögliche Extremstellen berechnen (f'(x) = 0 lösen)
// ────────────────────────────────────────────────────────────

const b2Exercises: StepByStepExercise[] = [
  // ── B2-01: f(x) = x² − 4x + 3 ──
  {
    id: 'ext-step-b2-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-kandidaten',
    function: { latex: 'f(x) = x^2 - 4x + 3', fn: (x) => x ** 2 - 4 * x + 3 },
    derivatives: {
      first: { latex: "f'(x) = 2x - 4", fn: (x) => 2 * x - 4 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 2x - 4",
          "f'(x) = 2x + 4",
          "f'(x) = x - 4",
          "f'(x) = 2x - 3",
        ],
        correctAnswer: "f'(x) = 2x - 4",
        hint: '(x²)\' = 2x, (−4x)\' = −4, (3)\' = 0.',
        explanation: "f'(x) = 2x − 4.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [2],
        tolerance: 0.01,
        hint: '2x − 4 = 0 ⟹ x = ?',
        explanation: '2x − 4 = 0 ⟹ x = 2. Es gibt eine mögliche Extremstelle bei x = 2.',
      },
    ],
  },

  // ── B2-02: f(x) = x³ + 3x² − 9x + 5 ──
  {
    id: 'ext-step-b2-02',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-kandidaten',
    function: { latex: 'f(x) = x^3 + 3x^2 - 9x + 5', fn: (x) => x ** 3 + 3 * x ** 2 - 9 * x + 5 },
    derivatives: {
      first: { latex: "f'(x) = 3x^2 + 6x - 9", fn: (x) => 3 * x ** 2 + 6 * x - 9 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 + 6x - 9",
          "f'(x) = 3x^2 + 3x - 9",
          "f'(x) = x^2 + 3x - 9",
          "f'(x) = 3x^2 + 6x + 5",
        ],
        correctAnswer: "f'(x) = 3x^2 + 6x - 9",
        hint: 'Leite jeden Summanden ab. Beachte: (5)\' = 0.',
        explanation: "f'(x) = 3x² + 6x − 9.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [-3, 1],
        tolerance: 0.01,
        hint: 'Teile durch 3: x² + 2x − 3 = 0. Nutze die p-q-Formel oder faktorisiere.',
        explanation: 'x² + 2x − 3 = 0 ⟹ (x + 3)(x − 1) = 0 ⟹ x = −3 oder x = 1.',
      },
    ],
  },

  // ── B2-03: f(x) = x³ − 12x ──
  {
    id: 'ext-step-b2-03',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'extremstellen-kandidaten',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    derivatives: {
      first: { latex: "f'(x) = 3x^2 - 12", fn: (x) => 3 * x ** 2 - 12 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 - 12",
          "f'(x) = 3x^2 + 12",
          "f'(x) = x^2 - 12",
          "f'(x) = 3x - 12",
        ],
        correctAnswer: "f'(x) = 3x^2 - 12",
        hint: '(x³)\' = 3x², (−12x)\' = −12.',
        explanation: "f'(x) = 3x² − 12.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [-2, 2],
        tolerance: 0.01,
        hint: '3x² − 12 = 0 ⟹ x² = 4.',
        explanation: '3x² = 12 ⟹ x² = 4 ⟹ x = −2 oder x = 2.',
      },
    ],
  },
];

export const stepExtremstellenExercises: StepByStepExercise[] = [
  ...c1Exercises,
  ...c1SemiExercises,
  ...c1IndependentExercises,
  ...c2Exercises,
  ...b2Exercises,
];
