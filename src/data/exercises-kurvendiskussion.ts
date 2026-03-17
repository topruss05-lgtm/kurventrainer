import type { StepByStepExercise } from '../types/exercise.js';

// ────────────────────────────────────────────────────────────
// E3 — Vollständige Kurvendiskussion (KERN)
// ────────────────────────────────────────────────────────────

const e3Exercises: StepByStepExercise[] = [
  // ── E3-01: f(x) = x³ − 3x  (punktsymmetrisch) ──
  // HP(−1|2), TP(1|−2), W(0|0)
  {
    id: 'kd-step-e3-01',
    type: 'step-by-step',
    module: 'kurvendiskussion',
    competency: 'K4',
    procedure: 'kurvendiskussion',
    function: { latex: 'f(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 3",  fn: (x) => 3 * x ** 2 - 3 },
      second: { latex: "f''(x) = 6x",        fn: (x) => 6 * x },
      third:  { latex: "f'''(x) = 6",        fn: () => 6 },
    },
    steps: [
      {
        instruction: 'Hat f eine Symmetrie?',
        inputType: 'multiple-choice',
        options: ['achsensymmetrisch zur y-Achse', 'punktsymmetrisch zum Ursprung', 'keine Symmetrie'],
        correctAnswer: 'punktsymmetrisch zum Ursprung',
        hint: 'Prüfe: Enthält f nur ungerade Potenzen von x? Dann ist f punktsymmetrisch.',
        explanation: 'f(x) = x³ − 3x enthält nur ungerade Potenzen (x³ und x¹). Also ist f punktsymmetrisch zum Ursprung: f(−x) = −f(x).',
      },
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
        explanation: "f'(x) = 3x² − 3.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Nullstellen?",
        inputType: 'number-set',
        correctAnswer: [-1, 1],
        tolerance: 0.01,
        hint: '3x² − 3 = 0 ⟹ x² = 1.',
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
        options: ['Hochpunkt (Maximum)', 'Tiefpunkt (Minimum)', 'Sattelpunkt'],
        correctAnswer: 'Hochpunkt (Maximum)',
        hint: "f''(x₀) < 0 bedeutet Rechtskurve — also ein Maximum.",
        explanation: "f''(−1) = −6 < 0 ⟹ Hochpunkt bei x = −1. f(−1) = 2 ⟹ H(−1 | 2).",
      },
      {
        instruction: "Berechne f''(1). Ist f''(1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(x) = 6x. Setze x = 1 ein.",
        explanation: "f''(1) = 6 > 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 1?',
        inputType: 'multiple-choice',
        options: ['Hochpunkt (Maximum)', 'Tiefpunkt (Minimum)', 'Sattelpunkt'],
        correctAnswer: 'Tiefpunkt (Minimum)',
        hint: "f''(x₀) > 0 bedeutet Linkskurve — also ein Minimum.",
        explanation: "f''(1) = 6 > 0 ⟹ Tiefpunkt bei x = 1. f(1) = −2 ⟹ T(1 | −2).",
      },
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x",
          "f''(x) = 6x - 3",
          "f''(x) = 6",
          "f''(x) = 3x",
        ],
        correctAnswer: "f''(x) = 6x",
        hint: "Leite f'(x) = 3x² − 3 nochmal ab.",
        explanation: "f''(x) = 6x.",
      },
      {
        instruction: "Setze f''(x) = 0. Welche x-Werte sind Wendestellen-Kandidaten?",
        inputType: 'number-set',
        correctAnswer: [0],
        tolerance: 0.01,
        hint: '6x = 0 ⟹ x = ?',
        explanation: '6x = 0 ⟹ x = 0.',
      },
      {
        instruction: "Berechne f'''(0). Ist f'''(0) ≠ 0?",
        inputType: 'sign-choice',
        options: ['≠ 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: '≠ 0 (Wendestelle bestätigt)',
        hint: "f'''(x) = 6 ist eine Konstante.",
        explanation: "f'''(0) = 6 ≠ 0 ⟹ Bei x = 0 liegt eine Wendestelle.",
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [0, 0],
        tolerance: 0.01,
        hint: 'f(0) = 0³ − 3·0 = 0.',
        explanation: 'f(0) = 0. Der Wendepunkt ist W(0 | 0).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 2,  label: 'H(−1|2)',  color: '#e74c3c' },
        { x: 1,  y: -2, label: 'T(1|−2)',   color: '#2ecc71' },
        { x: 0,  y: 0,  label: 'W(0|0)',    color: '#9b59b6' },
      ],
    },
  },

  // ── E3-02: f(x) = x³ − 12x  (punktsymmetrisch) ──
  // HP(−2|16), TP(2|−16), W(0|0)
  {
    id: 'kd-step-e3-02',
    type: 'step-by-step',
    module: 'kurvendiskussion',
    competency: 'K4',
    procedure: 'kurvendiskussion',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12",  fn: (x) => 3 * x ** 2 - 12 },
      second: { latex: "f''(x) = 6x",         fn: (x) => 6 * x },
      third:  { latex: "f'''(x) = 6",         fn: () => 6 },
    },
    steps: [
      {
        instruction: 'Hat f eine Symmetrie?',
        inputType: 'multiple-choice',
        options: ['achsensymmetrisch zur y-Achse', 'punktsymmetrisch zum Ursprung', 'keine Symmetrie'],
        correctAnswer: 'punktsymmetrisch zum Ursprung',
        hint: 'f enthält nur ungerade Potenzen: x³ und x¹.',
        explanation: 'f(x) = x³ − 12x enthält nur ungerade Potenzen. Es gilt f(−x) = −f(x), also punktsymmetrisch zum Ursprung.',
      },
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
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Nullstellen?",
        inputType: 'number-set',
        correctAnswer: [-2, 2],
        tolerance: 0.01,
        hint: '3x² − 12 = 0 ⟹ x² = 4.',
        explanation: '3x² − 12 = 0 ⟹ x² = 4 ⟹ x = −2 oder x = 2.',
      },
      {
        instruction: "Berechne f''(−2). Ist f''(−2) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(x) = 6x. Setze x = −2 ein.",
        explanation: "f''(−2) = 6·(−2) = −12 < 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = −2?',
        inputType: 'multiple-choice',
        options: ['Hochpunkt (Maximum)', 'Tiefpunkt (Minimum)', 'Sattelpunkt'],
        correctAnswer: 'Hochpunkt (Maximum)',
        hint: "f''(x₀) < 0 ⟹ Maximum.",
        explanation: "f''(−2) < 0 ⟹ Hochpunkt. f(−2) = (−8) − (−24) = 16 ⟹ H(−2 | 16).",
      },
      {
        instruction: "Berechne f''(2). Ist f''(2) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(x) = 6x. Setze x = 2 ein.",
        explanation: "f''(2) = 12 > 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 2?',
        inputType: 'multiple-choice',
        options: ['Hochpunkt (Maximum)', 'Tiefpunkt (Minimum)', 'Sattelpunkt'],
        correctAnswer: 'Tiefpunkt (Minimum)',
        hint: "f''(x₀) > 0 ⟹ Minimum.",
        explanation: "f''(2) = 12 > 0 ⟹ Tiefpunkt. f(2) = 8 − 24 = −16 ⟹ T(2 | −16).",
      },
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
        instruction: "Setze f''(x) = 0. Welche x-Werte sind Wendestellen-Kandidaten?",
        inputType: 'number-set',
        correctAnswer: [0],
        tolerance: 0.01,
        hint: '6x = 0.',
        explanation: '6x = 0 ⟹ x = 0.',
      },
      {
        instruction: "Berechne f'''(0). Ist f'''(0) ≠ 0?",
        inputType: 'sign-choice',
        options: ['≠ 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: '≠ 0 (Wendestelle bestätigt)',
        hint: "f'''(x) = 6.",
        explanation: "f'''(0) = 6 ≠ 0 ⟹ Wendestelle bei x = 0.",
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [0, 0],
        tolerance: 0.01,
        hint: 'f(0) = 0.',
        explanation: 'f(0) = 0. Der Wendepunkt ist W(0 | 0).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -2, y: 16,  label: 'H(−2|16)',  color: '#e74c3c' },
        { x: 2,  y: -16, label: 'T(2|−16)',   color: '#2ecc71' },
        { x: 0,  y: 0,   label: 'W(0|0)',     color: '#9b59b6' },
      ],
    },
  },

  // ── E3-03: f(x) = −x³ + 6x² − 9x + 2  (keine Symmetrie) ──
  // TP(1|−2), HP(3|2), W(2|0)
  {
    id: 'kd-step-e3-03',
    type: 'step-by-step',
    module: 'kurvendiskussion',
    competency: 'K4',
    procedure: 'kurvendiskussion',
    function: { latex: 'f(x) = -x^3 + 6x^2 - 9x + 2', fn: (x) => -(x ** 3) + 6 * x ** 2 - 9 * x + 2 },
    derivatives: {
      first:  { latex: "f'(x) = -3x^2 + 12x - 9",  fn: (x) => -3 * x ** 2 + 12 * x - 9 },
      second: { latex: "f''(x) = -6x + 12",          fn: (x) => -6 * x + 12 },
      third:  { latex: "f'''(x) = -6",               fn: () => -6 },
    },
    steps: [
      {
        instruction: 'Hat f eine Symmetrie?',
        inputType: 'multiple-choice',
        options: ['achsensymmetrisch zur y-Achse', 'punktsymmetrisch zum Ursprung', 'keine Symmetrie'],
        correctAnswer: 'keine Symmetrie',
        hint: 'Enthält f sowohl gerade als auch ungerade Potenzen, plus eine Konstante? Dann liegt i.\u202Fd.\u202FR. keine Symmetrie vor.',
        explanation: 'f enthält x³ (ungerade), x² (gerade), x (ungerade) und eine Konstante. Es gilt weder f(−x) = f(x) noch f(−x) = −f(x). Keine Symmetrie.',
      },
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = -3x^2 + 12x - 9",
          "f'(x) = -3x^2 + 12x + 9",
          "f'(x) = -3x^2 + 6x - 9",
          "f'(x) = -x^2 + 12x - 9",
        ],
        correctAnswer: "f'(x) = -3x^2 + 12x - 9",
        hint: '(−x³)\' = −3x², (6x²)\' = 12x, (−9x)\' = −9, (2)\' = 0.',
        explanation: "f'(x) = −3x² + 12x − 9.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Nullstellen?",
        inputType: 'number-set',
        correctAnswer: [1, 3],
        tolerance: 0.01,
        hint: 'Teile durch −3: x² − 4x + 3 = 0. Faktorisiere: (x−1)(x−3) = 0.',
        explanation: '−3x² + 12x − 9 = 0 ⟹ x² − 4x + 3 = 0 ⟹ (x−1)(x−3) = 0 ⟹ x = 1 oder x = 3.',
      },
      {
        instruction: "Berechne f''(1). Ist f''(1) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(x) = −6x + 12. Setze x = 1 ein.",
        explanation: "f''(1) = −6 + 12 = 6 > 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 1?',
        inputType: 'multiple-choice',
        options: ['Hochpunkt (Maximum)', 'Tiefpunkt (Minimum)', 'Sattelpunkt'],
        correctAnswer: 'Tiefpunkt (Minimum)',
        hint: "f''(x₀) > 0 ⟹ Minimum.",
        explanation: "f''(1) = 6 > 0 ⟹ Tiefpunkt. f(1) = −1 + 6 − 9 + 2 = −2 ⟹ T(1 | −2).",
      },
      {
        instruction: "Berechne f''(3). Ist f''(3) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(x) = −6x + 12. Setze x = 3 ein.",
        explanation: "f''(3) = −18 + 12 = −6 < 0.",
      },
      {
        instruction: 'Welche Art hat die Stelle x = 3?',
        inputType: 'multiple-choice',
        options: ['Hochpunkt (Maximum)', 'Tiefpunkt (Minimum)', 'Sattelpunkt'],
        correctAnswer: 'Hochpunkt (Maximum)',
        hint: "f''(x₀) < 0 ⟹ Maximum.",
        explanation: "f''(3) = −6 < 0 ⟹ Hochpunkt. f(3) = −27 + 54 − 27 + 2 = 2 ⟹ H(3 | 2).",
      },
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = -6x + 12",
          "f''(x) = -6x - 12",
          "f''(x) = -3x + 12",
          "f''(x) = -6x + 9",
        ],
        correctAnswer: "f''(x) = -6x + 12",
        hint: "Leite f'(x) = −3x² + 12x − 9 ab.",
        explanation: "f''(x) = −6x + 12.",
      },
      {
        instruction: "Setze f''(x) = 0. Welche x-Werte sind Wendestellen-Kandidaten?",
        inputType: 'number-set',
        correctAnswer: [2],
        tolerance: 0.01,
        hint: '−6x + 12 = 0 ⟹ x = ?',
        explanation: '−6x + 12 = 0 ⟹ x = 2.',
      },
      {
        instruction: "Berechne f'''(2). Ist f'''(2) ≠ 0?",
        inputType: 'sign-choice',
        options: ['≠ 0 (Wendestelle bestätigt)', '= 0 (keine Aussage)'],
        correctAnswer: '≠ 0 (Wendestelle bestätigt)',
        hint: "f'''(x) = −6.",
        explanation: "f'''(2) = −6 ≠ 0 ⟹ Wendestelle bei x = 2.",
      },
      {
        instruction: 'Gib die Koordinaten des Wendepunkts an.',
        inputType: 'coordinate',
        correctAnswer: [2, 0],
        tolerance: 0.01,
        hint: 'f(2) = −8 + 24 − 18 + 2.',
        explanation: 'f(2) = −8 + 24 − 18 + 2 = 0. Der Wendepunkt ist W(2 | 0).',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: -2, label: 'T(1|−2)',  color: '#2ecc71' },
        { x: 3, y: 2,  label: 'H(3|2)',   color: '#e74c3c' },
        { x: 2, y: 0,  label: 'W(2|0)',   color: '#9b59b6' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// A2 — Monotonie rechnerisch
// ────────────────────────────────────────────────────────────

const a2Exercises: StepByStepExercise[] = [
  // ── A2-01: f(x) = x³ − 3x ──
  // steigend auf (−∞,−1) und (1,∞), fallend auf (−1,1)
  {
    id: 'mon-step-a2-01',
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K2',
    procedure: 'monotonie',
    function: { latex: 'f(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first: { latex: "f'(x) = 3x^2 - 3", fn: (x) => 3 * x ** 2 - 3 },
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
        hint: '(x³)\' = 3x², (−3x)\' = −3.',
        explanation: "f'(x) = 3x² − 3.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Nullstellen?",
        inputType: 'number-set',
        correctAnswer: [-1, 1],
        tolerance: 0.01,
        hint: '3x² − 3 = 0 ⟹ x² = 1.',
        explanation: '3x² − 3 = 0 ⟹ x² = 1 ⟹ x = −1 oder x = 1.',
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) im Intervall (−∞, −1), z.\u202FB. bei x = −2.",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f'(−2) = 3·4 − 3 = 9.",
        explanation: "f'(−2) = 12 − 3 = 9 > 0 ⟹ f ist steigend auf (−∞, −1).",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) im Intervall (−1, 1), z.\u202FB. bei x = 0.",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f'(0) = 3·0 − 3 = −3.",
        explanation: "f'(0) = −3 < 0 ⟹ f ist fallend auf (−1, 1).",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) im Intervall (1, ∞), z.\u202FB. bei x = 2.",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f'(2) = 3·4 − 3 = 9.",
        explanation: "f'(2) = 12 − 3 = 9 > 0 ⟹ f ist steigend auf (1, ∞).",
      },
      {
        instruction: 'In welchen Intervallen ist f streng monoton steigend?',
        inputType: 'multiple-choice',
        options: [
          '(−∞, −1) und (1, ∞)',
          '(−1, 1)',
          '(−∞, 1)',
          '(−∞, ∞)',
        ],
        correctAnswer: '(−∞, −1) und (1, ∞)',
        hint: "Wo ist f'(x) > 0?",
        explanation: "f'(x) > 0 für x < −1 und x > 1 ⟹ f ist streng monoton steigend auf (−∞, −1) und (1, ∞).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -1, y: 2,  label: 'HP(−1|2)',  color: '#e74c3c' },
        { x: 1,  y: -2, label: 'TP(1|−2)',   color: '#2ecc71' },
      ],
    },
  },

  // ── A2-02: f(x) = x³ − 12x ──
  // steigend auf (−∞,−2) und (2,∞), fallend auf (−2,2)
  {
    id: 'mon-step-a2-02',
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K2',
    procedure: 'monotonie',
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
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Nullstellen?",
        inputType: 'number-set',
        correctAnswer: [-2, 2],
        tolerance: 0.01,
        hint: '3x² − 12 = 0 ⟹ x² = 4.',
        explanation: '3x² − 12 = 0 ⟹ x² = 4 ⟹ x = −2 oder x = 2.',
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) im Intervall (−∞, −2), z.\u202FB. bei x = −3.",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f'(−3) = 3·9 − 12 = 15.",
        explanation: "f'(−3) = 27 − 12 = 15 > 0 ⟹ f ist steigend auf (−∞, −2).",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) im Intervall (−2, 2), z.\u202FB. bei x = 0.",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f'(0) = −12.",
        explanation: "f'(0) = −12 < 0 ⟹ f ist fallend auf (−2, 2).",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) im Intervall (2, ∞), z.\u202FB. bei x = 3.",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f'(3) = 27 − 12 = 15.",
        explanation: "f'(3) = 27 − 12 = 15 > 0 ⟹ f ist steigend auf (2, ∞).",
      },
      {
        instruction: 'In welchen Intervallen ist f streng monoton fallend?',
        inputType: 'multiple-choice',
        options: [
          '(−2, 2)',
          '(−∞, −2) und (2, ∞)',
          '(−∞, 2)',
          '(0, ∞)',
        ],
        correctAnswer: '(−2, 2)',
        hint: "Wo ist f'(x) < 0?",
        explanation: "f'(x) < 0 für −2 < x < 2 ⟹ f ist streng monoton fallend auf (−2, 2).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: -2, y: 16,  label: 'HP(−2|16)', color: '#e74c3c' },
        { x: 2,  y: -16, label: 'TP(2|−16)', color: '#2ecc71' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// A3 — Monotonie auf Intervall zeigen
// ────────────────────────────────────────────────────────────

const a3Exercises: StepByStepExercise[] = [
  // ── A3-01: f(x) = x² − 4x + 5 auf [3, 5] ──
  {
    id: 'mon-step-a3-01',
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K2',
    procedure: 'monotonie-intervall',
    function: { latex: 'f(x) = x^2 - 4x + 5', fn: (x) => x ** 2 - 4 * x + 5 },
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
          "f'(x) = 2x - 5",
        ],
        correctAnswer: "f'(x) = 2x - 4",
        hint: '(x²)\' = 2x, (−4x)\' = −4, (5)\' = 0.',
        explanation: "f'(x) = 2x − 4.",
      },
      {
        instruction: "Berechne f'(3) — den kleinsten Wert von f' auf dem Intervall [3, 5].",
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: "f'(3) = 2·3 − 4.",
        explanation: "f'(3) = 6 − 4 = 2.",
      },
      {
        instruction: "Ist f'(x) > 0 für alle x ∈ [3, 5]?",
        inputType: 'multiple-choice',
        options: [
          "Ja, denn f'(x) = 2x − 4 ≥ 2 > 0 für x ≥ 3",
          "Nein, f' hat eine Nullstelle im Intervall",
          "Nein, f' ist negativ auf dem Intervall",
        ],
        correctAnswer: "Ja, denn f'(x) = 2x − 4 ≥ 2 > 0 für x ≥ 3",
        hint: "f' ist eine steigende Gerade. Der kleinste Wert auf [3,5] ist f'(3) = 2 > 0.",
        explanation: "Da f'(x) = 2x − 4 und f'(3) = 2 > 0 und f' steigend ist, gilt f'(x) > 0 für alle x ∈ [3, 5].",
      },
      {
        instruction: 'Was folgt daraus für f auf [3, 5]?',
        inputType: 'multiple-choice',
        options: [
          'f ist streng monoton steigend auf [3, 5]',
          'f ist streng monoton fallend auf [3, 5]',
          'f hat ein Extremum auf [3, 5]',
        ],
        correctAnswer: 'f ist streng monoton steigend auf [3, 5]',
        hint: "f'(x) > 0 auf dem gesamten Intervall ⟹ ?",
        explanation: "f'(x) > 0 für alle x ∈ [3, 5] ⟹ f ist streng monoton steigend auf [3, 5].",
      },
    ],
  },

  // ── A3-02: f(x) = −x² + 6x − 7 auf [4, 6] ──
  {
    id: 'mon-step-a3-02',
    type: 'step-by-step',
    module: 'monotonie',
    competency: 'K2',
    procedure: 'monotonie-intervall',
    function: { latex: 'f(x) = -x^2 + 6x - 7', fn: (x) => -(x ** 2) + 6 * x - 7 },
    derivatives: {
      first: { latex: "f'(x) = -2x + 6", fn: (x) => -2 * x + 6 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = -2x + 6",
          "f'(x) = -2x - 6",
          "f'(x) = 2x + 6",
          "f'(x) = -x + 6",
        ],
        correctAnswer: "f'(x) = -2x + 6",
        hint: '(−x²)\' = −2x, (6x)\' = 6, (−7)\' = 0.',
        explanation: "f'(x) = −2x + 6.",
      },
      {
        instruction: "Berechne f'(4) — den größten Wert von f' auf dem Intervall [4, 6].",
        inputType: 'number',
        correctAnswer: -2,
        tolerance: 0.01,
        hint: "f'(4) = −2·4 + 6.",
        explanation: "f'(4) = −8 + 6 = −2.",
      },
      {
        instruction: "Ist f'(x) < 0 für alle x ∈ [4, 6]?",
        inputType: 'multiple-choice',
        options: [
          "Ja, denn f'(x) = −2x + 6 ≤ −2 < 0 für x ≥ 4",
          "Nein, f' hat eine Nullstelle im Intervall",
          "Nein, f' ist positiv auf dem Intervall",
        ],
        correctAnswer: "Ja, denn f'(x) = −2x + 6 ≤ −2 < 0 für x ≥ 4",
        hint: "f' ist eine fallende Gerade. Der größte Wert auf [4,6] ist f'(4) = −2 < 0.",
        explanation: "Da f'(4) = −2 < 0 und f' fallend ist, gilt f'(x) < 0 für alle x ∈ [4, 6].",
      },
      {
        instruction: 'Was folgt daraus für f auf [4, 6]?',
        inputType: 'multiple-choice',
        options: [
          'f ist streng monoton fallend auf [4, 6]',
          'f ist streng monoton steigend auf [4, 6]',
          'f hat ein Extremum auf [4, 6]',
        ],
        correctAnswer: 'f ist streng monoton fallend auf [4, 6]',
        hint: "f'(x) < 0 auf dem gesamten Intervall ⟹ ?",
        explanation: "f'(x) < 0 für alle x ∈ [4, 6] ⟹ f ist streng monoton fallend auf [4, 6].",
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// C7 — Keine Extremstelle zeigen
// ────────────────────────────────────────────────────────────

const c7Exercises: StepByStepExercise[] = [
  // ── C7-01: f(x) = x³ + x ──
  // f' = 3x² + 1 > 0 für alle x ⟹ keine Extremstelle
  {
    id: 'ext-step-c7-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K3',
    procedure: 'keine-extremstelle',
    function: { latex: 'f(x) = x^3 + x', fn: (x) => x ** 3 + x },
    derivatives: {
      first: { latex: "f'(x) = 3x^2 + 1", fn: (x) => 3 * x ** 2 + 1 },
    },
    steps: [
      {
        instruction: "Welches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 + 1",
          "f'(x) = 3x^2 - 1",
          "f'(x) = x^2 + 1",
          "f'(x) = 3x + 1",
        ],
        correctAnswer: "f'(x) = 3x^2 + 1",
        hint: '(x³)\' = 3x², (x)\' = 1.',
        explanation: "f'(x) = 3x² + 1.",
      },
      {
        instruction: "Versuche f'(x) = 0 zu lösen. Hat die Gleichung 3x² + 1 = 0 reelle Lösungen?",
        inputType: 'multiple-choice',
        options: [
          'Nein, denn 3x² + 1 > 0 für alle x ∈ ℝ',
          'Ja, x = 0',
          'Ja, x = ±1',
        ],
        correctAnswer: 'Nein, denn 3x² + 1 > 0 für alle x ∈ ℝ',
        hint: '3x² ≥ 0 für alle x. Was passiert, wenn man 1 addiert?',
        explanation: '3x² ≥ 0 für alle x ∈ ℝ, also ist 3x² + 1 ≥ 1 > 0. Die Gleichung hat keine reelle Lösung.',
      },
      {
        instruction: "Was bedeutet das für die Extremstellen von f?",
        inputType: 'multiple-choice',
        options: [
          'f hat keine Extremstellen, da f\' keine Nullstellen hat',
          'f hat genau eine Extremstelle',
          'f hat unendlich viele Extremstellen',
        ],
        correctAnswer: 'f hat keine Extremstellen, da f\' keine Nullstellen hat',
        hint: 'Notwendige Bedingung für eine Extremstelle: f\'(x₀) = 0.',
        explanation: "Da f'(x) = 3x² + 1 > 0 für alle x, hat f' keine Nullstellen. Die notwendige Bedingung f'(x₀) = 0 wird nie erfüllt. f hat keine Extremstellen.",
      },
      {
        instruction: 'Was kannst du über die Monotonie von f aussagen?',
        inputType: 'multiple-choice',
        options: [
          'f ist streng monoton steigend auf ganz ℝ',
          'f ist streng monoton fallend auf ganz ℝ',
          'f ist weder steigend noch fallend',
        ],
        correctAnswer: 'f ist streng monoton steigend auf ganz ℝ',
        hint: "f'(x) > 0 für alle x ⟹ ?",
        explanation: "f'(x) > 0 für alle x ∈ ℝ ⟹ f ist streng monoton steigend auf ganz ℝ.",
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// D2 — Krümmung rechnerisch
// ────────────────────────────────────────────────────────────

const d2Exercises: StepByStepExercise[] = [
  // ── D2-01: f(x) = x³ − 3x ──
  // f'' = 6x; rechtsgekrümmt für x < 0, linksgekrümmt für x > 0
  {
    id: 'wst-step-d2-01',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'kruemmung',
    function: { latex: 'f(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 3",  fn: (x) => 3 * x ** 2 - 3 },
      second: { latex: "f''(x) = 6x",        fn: (x) => 6 * x },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 6x",
          "f''(x) = 6x - 3",
          "f''(x) = 3x",
          "f''(x) = 6",
        ],
        correctAnswer: "f''(x) = 6x",
        hint: "Bilde zuerst f'(x) = 3x² − 3, dann leite nochmal ab.",
        explanation: "f'(x) = 3x² − 3 ⟹ f''(x) = 6x.",
      },
      {
        instruction: "Wo ist f''(x) = 0?",
        inputType: 'number-set',
        correctAnswer: [0],
        tolerance: 0.01,
        hint: '6x = 0 ⟹ x = ?',
        explanation: 'f\'\'(x) = 0 bei x = 0. Hier wechselt möglicherweise die Krümmung.',
      },
      {
        instruction: "Prüfe das Vorzeichen von f''(x) für x < 0, z.\u202FB. bei x = −1.",
        inputType: 'sign-choice',
        options: ['> 0 (linksgekrümmt)', '< 0 (rechtsgekrümmt)'],
        correctAnswer: '< 0 (rechtsgekrümmt)',
        hint: "f''(−1) = 6·(−1) = −6.",
        explanation: "f''(−1) = −6 < 0 ⟹ f ist rechtsgekrümmt (konvex) für x < 0.",
      },
      {
        instruction: "Prüfe das Vorzeichen von f''(x) für x > 0, z.\u202FB. bei x = 1.",
        inputType: 'sign-choice',
        options: ['> 0 (linksgekrümmt)', '< 0 (rechtsgekrümmt)'],
        correctAnswer: '> 0 (linksgekrümmt)',
        hint: "f''(1) = 6.",
        explanation: "f''(1) = 6 > 0 ⟹ f ist linksgekrümmt (konkav) für x > 0.",
      },
      {
        instruction: 'Welche Aussage über die Krümmung ist korrekt?',
        inputType: 'multiple-choice',
        options: [
          'Rechtsgekrümmt auf (−∞, 0), linksgekrümmt auf (0, ∞)',
          'Linksgekrümmt auf (−∞, 0), rechtsgekrümmt auf (0, ∞)',
          'Überall linksgekrümmt',
          'Überall rechtsgekrümmt',
        ],
        correctAnswer: 'Rechtsgekrümmt auf (−∞, 0), linksgekrümmt auf (0, ∞)',
        hint: 'Fasse die Vorzeichen von f\'\' zusammen.',
        explanation: "f''(x) < 0 für x < 0 (rechtsgekrümmt) und f''(x) > 0 für x > 0 (linksgekrümmt). Bei x = 0 wechselt die Krümmung (Wendestelle).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0, label: 'W(0|0)', color: '#9b59b6' },
      ],
    },
  },

  // ── D2-02: f(x) = x³ − 6x² + 9x ──
  // f'' = 6x − 12; rechtsgekrümmt für x < 2, linksgekrümmt für x > 2
  {
    id: 'wst-step-d2-02',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K2',
    procedure: 'kruemmung',
    function: { latex: 'f(x) = x^3 - 6x^2 + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 12x + 9",  fn: (x) => 3 * x ** 2 - 12 * x + 9 },
      second: { latex: "f''(x) = 6x - 12",          fn: (x) => 6 * x - 12 },
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
        hint: "f'(x) = 3x² − 12x + 9. Leite nochmal ab.",
        explanation: "f''(x) = 6x − 12.",
      },
      {
        instruction: "Wo ist f''(x) = 0?",
        inputType: 'number-set',
        correctAnswer: [2],
        tolerance: 0.01,
        hint: '6x − 12 = 0 ⟹ x = ?',
        explanation: 'f\'\'(x) = 0 bei x = 2.',
      },
      {
        instruction: "Prüfe das Vorzeichen von f''(x) für x < 2, z.\u202FB. bei x = 0.",
        inputType: 'sign-choice',
        options: ['> 0 (linksgekrümmt)', '< 0 (rechtsgekrümmt)'],
        correctAnswer: '< 0 (rechtsgekrümmt)',
        hint: "f''(0) = 6·0 − 12 = −12.",
        explanation: "f''(0) = −12 < 0 ⟹ f ist rechtsgekrümmt für x < 2.",
      },
      {
        instruction: "Prüfe das Vorzeichen von f''(x) für x > 2, z.\u202FB. bei x = 3.",
        inputType: 'sign-choice',
        options: ['> 0 (linksgekrümmt)', '< 0 (rechtsgekrümmt)'],
        correctAnswer: '> 0 (linksgekrümmt)',
        hint: "f''(3) = 18 − 12 = 6.",
        explanation: "f''(3) = 6 > 0 ⟹ f ist linksgekrümmt für x > 2.",
      },
      {
        instruction: 'Welche Aussage über die Krümmung ist korrekt?',
        inputType: 'multiple-choice',
        options: [
          'Rechtsgekrümmt auf (−∞, 2), linksgekrümmt auf (2, ∞)',
          'Linksgekrümmt auf (−∞, 2), rechtsgekrümmt auf (2, ∞)',
          'Überall linksgekrümmt',
          'Überall rechtsgekrümmt',
        ],
        correctAnswer: 'Rechtsgekrümmt auf (−∞, 2), linksgekrümmt auf (2, ∞)',
        hint: 'Fasse die Vorzeichen von f\'\' zusammen.',
        explanation: "f''(x) < 0 für x < 2 (rechtsgekrümmt) und f''(x) > 0 für x > 2 (linksgekrümmt). Bei x = 2 liegt eine Wendestelle.",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 2, y: 2, label: 'W(2|2)', color: '#9b59b6' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// F6 — Optimierung auf Intervall (Sachkontext)
// ────────────────────────────────────────────────────────────

const f6Exercises: StepByStepExercise[] = [
  // ── F6-01: Ballwurf — f(t) = −t² + 6t + 2 auf [0, 7] ──
  // f'=−2t+6=0 → t=3, f''=−2<0 → Max
  // f(0)=2, f(3)=11, f(7)=−5
  // Maximum bei t=3 mit f(3)=11
  {
    id: 'sach-step-f6-01',
    type: 'step-by-step',
    module: 'sachkontext',
    competency: 'K4',
    procedure: 'optimierung-intervall',
    function: { latex: 'f(t) = -t^2 + 6t + 2', fn: (t) => -(t ** 2) + 6 * t + 2 },
    derivatives: {
      first:  { latex: "f'(t) = -2t + 6",  fn: (t) => -2 * t + 6 },
      second: { latex: "f''(t) = -2",       fn: () => -2 },
    },
    steps: [
      {
        instruction: "Ein Ball wird geworfen. Die Höhe (in Metern) wird durch f(t) = −t² + 6t + 2 beschrieben, t ∈ [0, 7].\nWelches ist f'(t)?",
        inputType: 'multiple-choice',
        options: [
          "f'(t) = -2t + 6",
          "f'(t) = -2t - 6",
          "f'(t) = 2t + 6",
          "f'(t) = -t + 6",
        ],
        correctAnswer: "f'(t) = -2t + 6",
        hint: '(−t²)\' = −2t, (6t)\' = 6, (2)\' = 0.',
        explanation: "f'(t) = −2t + 6.",
      },
      {
        instruction: "Setze f'(t) = 0. Bei welchem t-Wert?",
        inputType: 'number',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: '−2t + 6 = 0 ⟹ t = ?',
        explanation: '−2t + 6 = 0 ⟹ t = 3.',
      },
      {
        instruction: "Berechne f''(t). Ist f''(3) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(t) = −2 für alle t.",
        explanation: "f''(t) = −2 < 0 ⟹ bei t = 3 liegt ein Maximum.",
      },
      {
        instruction: "Berechne die Randwerte: f(0) und f(7). Gib f(0) an.",
        inputType: 'number',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'f(0) = −0 + 0 + 2.',
        explanation: 'f(0) = 2.',
      },
      {
        instruction: "Gib f(7) an.",
        inputType: 'number',
        correctAnswer: -5,
        tolerance: 0.01,
        hint: 'f(7) = −49 + 42 + 2.',
        explanation: 'f(7) = −49 + 42 + 2 = −5.',
      },
      {
        instruction: 'Vergleiche f(0) = 2, f(3) = 11 und f(7) = −5. Wo liegt das globale Maximum auf [0, 7]?',
        inputType: 'multiple-choice',
        options: [
          'Bei t = 3 mit f(3) = 11',
          'Bei t = 0 mit f(0) = 2',
          'Bei t = 7 mit f(7) = −5',
        ],
        correctAnswer: 'Bei t = 3 mit f(3) = 11',
        hint: 'Der größte Wert unter f(0), f(3), f(7) ist das globale Maximum.',
        explanation: 'f(3) = −9 + 18 + 2 = 11 ist der größte Wert. Das globale Maximum liegt bei t = 3.',
      },
      {
        instruction: 'Was bedeutet das im Kontext?',
        inputType: 'multiple-choice',
        options: [
          'Der Ball erreicht seine maximale Höhe von 11 m nach 3 Sekunden',
          'Der Ball erreicht seine maximale Höhe von 3 m nach 11 Sekunden',
          'Der Ball fällt nach 3 Sekunden auf den Boden',
        ],
        correctAnswer: 'Der Ball erreicht seine maximale Höhe von 11 m nach 3 Sekunden',
        hint: 'f(t) gibt die Höhe an, t die Zeit.',
        explanation: 'Der Ball erreicht nach t = 3 Sekunden seine maximale Höhe von f(3) = 11 Metern.',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 3, y: 11, label: 'Max(3|11)', color: '#e74c3c' },
        { x: 0, y: 2,  label: 'f(0)=2',    color: '#95a5a6' },
        { x: 7, y: -5, label: 'f(7)=−5',   color: '#95a5a6' },
      ],
    },
  },

  // ── F6-02: Gewinn — f(x) = −2x² + 24x − 50 auf [1, 10] ──
  // f'=−4x+24=0 → x=6, f''=−4<0 → Max
  // f(1)=−28, f(6)=22, f(10)=−10
  // Maximum bei x=6 mit f(6)=22
  {
    id: 'sach-step-f6-02',
    type: 'step-by-step',
    module: 'sachkontext',
    competency: 'K4',
    procedure: 'optimierung-intervall',
    function: { latex: 'f(x) = -2x^2 + 24x - 50', fn: (x) => -2 * x ** 2 + 24 * x - 50 },
    derivatives: {
      first:  { latex: "f'(x) = -4x + 24",  fn: (x) => -4 * x + 24 },
      second: { latex: "f''(x) = -4",        fn: () => -4 },
    },
    steps: [
      {
        instruction: "Ein Unternehmen modelliert seinen Gewinn (in Tausend Euro) durch f(x) = −2x² + 24x − 50, wobei x die Produktionsmenge (in Tausend Stück) auf [1, 10] ist.\nWelches ist f'(x)?",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = -4x + 24",
          "f'(x) = -4x - 24",
          "f'(x) = -2x + 24",
          "f'(x) = -4x + 50",
        ],
        correctAnswer: "f'(x) = -4x + 24",
        hint: '(−2x²)\' = −4x, (24x)\' = 24, (−50)\' = 0.',
        explanation: "f'(x) = −4x + 24.",
      },
      {
        instruction: "Setze f'(x) = 0. Bei welchem x-Wert?",
        inputType: 'number',
        correctAnswer: 6,
        tolerance: 0.01,
        hint: '−4x + 24 = 0 ⟹ x = ?',
        explanation: '−4x + 24 = 0 ⟹ x = 6.',
      },
      {
        instruction: "Berechne f''(x). Ist f''(6) > 0, < 0 oder = 0?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(x) = −4 für alle x.",
        explanation: "f''(x) = −4 < 0 ⟹ bei x = 6 liegt ein Maximum.",
      },
      {
        instruction: "Berechne den Randwert f(1).",
        inputType: 'number',
        correctAnswer: -28,
        tolerance: 0.01,
        hint: 'f(1) = −2·1 + 24·1 − 50.',
        explanation: 'f(1) = −2 + 24 − 50 = −28.',
      },
      {
        instruction: "Berechne den Randwert f(10).",
        inputType: 'number',
        correctAnswer: -10,
        tolerance: 0.01,
        hint: 'f(10) = −2·100 + 24·10 − 50.',
        explanation: 'f(10) = −200 + 240 − 50 = −10.',
      },
      {
        instruction: 'Vergleiche f(1) = −28, f(6) = 22 und f(10) = −10. Wo liegt das globale Maximum auf [1, 10]?',
        inputType: 'multiple-choice',
        options: [
          'Bei x = 6 mit f(6) = 22',
          'Bei x = 1 mit f(1) = −28',
          'Bei x = 10 mit f(10) = −10',
        ],
        correctAnswer: 'Bei x = 6 mit f(6) = 22',
        hint: 'Der größte Wert ist das globale Maximum.',
        explanation: 'f(6) = −72 + 144 − 50 = 22 ist der größte Wert. Maximum bei x = 6.',
      },
      {
        instruction: 'Was bedeutet das im Kontext?',
        inputType: 'multiple-choice',
        options: [
          'Der maximale Gewinn von 22.000 € wird bei einer Produktion von 6.000 Stück erreicht',
          'Der maximale Gewinn von 6.000 € wird bei einer Produktion von 22.000 Stück erreicht',
          'Bei 10.000 Stück ist der Gewinn am höchsten',
        ],
        correctAnswer: 'Der maximale Gewinn von 22.000 € wird bei einer Produktion von 6.000 Stück erreicht',
        hint: 'x ist in Tausend Stück, f(x) in Tausend Euro.',
        explanation: 'Bei x = 6 (also 6.000 Stück) wird der maximale Gewinn von f(6) = 22 (also 22.000 €) erzielt.',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 6,  y: 22,  label: 'Max(6|22)',   color: '#e74c3c' },
        { x: 1,  y: -28, label: 'f(1)=−28',    color: '#95a5a6' },
        { x: 10, y: -10, label: 'f(10)=−10',   color: '#95a5a6' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────
// Export
// ────────────────────────────────────────────────────────────

export const kurvendiskussionExercises: StepByStepExercise[] = [
  ...e3Exercises,
  ...a2Exercises,
  ...a3Exercises,
  ...c7Exercises,
  ...d2Exercises,
  ...f6Exercises,
];
