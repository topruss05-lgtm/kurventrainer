import type { StepByStepExercise, TrueFalseExercise, ContextInterpretationExercise, Exercise } from '../types/exercise.js';

// ════════════════════════════════════════════════════════════
// B3 — Waagerechte Tangente nachweisen (step-by-step, extremstellen, K2)
// ════════════════════════════════════════════════════════════

const b3Exercises: StepByStepExercise[] = [
  // ── B3-01: f(x) = x³ − 3x  bei x₀ = 1 ──
  {
    id: 'rem-b3-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'waagerechte-tangente',
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
        hint: 'Leite jeden Summanden einzeln ab: (xⁿ)\' = n·xⁿ⁻¹.',
        explanation: "f'(x) = 3x² − 3. Die Ableitung von x³ ist 3x², die von −3x ist −3.",
      },
      {
        instruction: "Berechne f'(1).",
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: "Setze x = 1 in f'(x) = 3x² − 3 ein.",
        explanation: "f'(1) = 3·1² − 3 = 3 − 3 = 0.",
      },
      {
        instruction: "Was bedeutet f'(1) = 0 geometrisch?",
        inputType: 'multiple-choice',
        options: [
          'Die Tangente an den Graphen bei x = 1 ist waagerecht',
          'f hat bei x = 1 eine Nullstelle',
          'f hat bei x = 1 einen Wendepunkt',
        ],
        correctAnswer: 'Die Tangente an den Graphen bei x = 1 ist waagerecht',
        hint: "f'(x₀) gibt die Steigung der Tangente bei x₀ an. Steigung 0 heißt …?",
        explanation: "f'(x₀) = 0 bedeutet, dass die Steigung der Tangente bei x₀ gleich null ist — die Tangente ist waagerecht.",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1, y: -2, label: 'waagerechte Tangente', color: '#3498db' },
      ],
    },
  },

  // ── B3-02: f(x) = x² − 4x + 3  bei x₀ = 2 ──
  {
    id: 'rem-b3-02',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K2',
    procedure: 'waagerechte-tangente',
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
        instruction: "Berechne f'(2).",
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: "Setze x = 2 in f'(x) = 2x − 4 ein.",
        explanation: "f'(2) = 2·2 − 4 = 4 − 4 = 0.",
      },
      {
        instruction: "Was bedeutet f'(2) = 0 geometrisch?",
        inputType: 'multiple-choice',
        options: [
          'Die Tangente an den Graphen bei x = 2 ist waagerecht',
          'f hat bei x = 2 eine Nullstelle',
          'f hat bei x = 2 einen Wendepunkt',
        ],
        correctAnswer: 'Die Tangente an den Graphen bei x = 2 ist waagerecht',
        hint: "f'(x₀) gibt die Steigung der Tangente bei x₀ an. Steigung 0 heißt …?",
        explanation: "f'(x₀) = 0 bedeutet, dass die Tangente bei x₀ waagerecht verläuft. Hier liegt bei x = 2 der Tiefpunkt der Parabel.",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 2, y: -1, label: 'waagerechte Tangente', color: '#3498db' },
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════
// C3 — Kombination beider Kriterien (step-by-step, extremstellen, K3)
// ════════════════════════════════════════════════════════════
// f(x) = x⁴ − 4x³
// f'(x) = 4x³ − 12x²  →  f'=0: x=0, x=3
// f''(x) = 12x² − 24x
// f''(0) = 0  → VZW nötig
// f''(3) = 12·9 − 24·3 = 108 − 72 = 36  ... wait, let me recalculate
// f''(3) = 12·9 − 24·3 = 108 − 72 = 36? No:
// f''(x) = 12x² − 24x → f''(3) = 12·9 − 24·3 = 108 − 72 = 36
// But the spec says f''(3) = 18. Let me check with a different f''.
// Actually: f(x) = x⁴ − 4x³ → f'(x) = 4x³ − 12x² → f''(x) = 12x² − 24x
// f''(3) = 12·9 − 72 = 108 − 72 = 36, NOT 18.
// The spec value of 18 appears incorrect. The correct value is 36.
// We use the mathematically correct value: f''(3) = 36.

const c3Exercises: StepByStepExercise[] = [
  {
    id: 'rem-c3-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K3',
    procedure: 'kombination-kriterien',
    function: { latex: 'f(x) = x^4 - 4x^3', fn: (x) => x ** 4 - 4 * x ** 3 },
    derivatives: {
      first:  { latex: "f'(x) = 4x^3 - 12x^2",  fn: (x) => 4 * x ** 3 - 12 * x ** 2 },
      second: { latex: "f''(x) = 12x^2 - 24x",   fn: (x) => 12 * x ** 2 - 24 * x },
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
        instruction: "Berechne f''(0).",
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: "f''(x) = 12x² − 24x. Setze x = 0 ein.",
        explanation: "f''(0) = 12·0² − 24·0 = 0.",
      },
      {
        instruction: "f''(0) = 0 — das 2.-Ableitungskriterium versagt. Welches Kriterium nutzen wir stattdessen?",
        inputType: 'multiple-choice',
        options: [
          'VZW-Kriterium (Vorzeichenwechsel von f\')',
          '3. Ableitung prüfen',
          "f''' prüfen",
        ],
        correctAnswer: 'VZW-Kriterium (Vorzeichenwechsel von f\')',
        hint: "Wenn f''(x₀) = 0 ist, hilft das VZW-Kriterium: Prüfe, ob f' bei x₀ das Vorzeichen wechselt.",
        explanation: "Bei f''(x₀) = 0 kann das 2.-Ableitungskriterium keine Aussage treffen. Stattdessen prüfen wir, ob f' bei x₀ einen Vorzeichenwechsel hat.",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) links von x = 0 (z.\u202FB. bei x = −1).",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f'(−1) = 4·(−1)³ − 12·(−1)² = −4 − 12.",
        explanation: "f'(−1) = −4 − 12 = −16 < 0.",
      },
      {
        instruction: "Prüfe das Vorzeichen von f'(x) rechts von x = 0 (z.\u202FB. bei x = 1).",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f'(1) = 4·1 − 12·1 = 4 − 12.",
        explanation: "f'(1) = 4 − 12 = −8 < 0.",
      },
      {
        instruction: 'Kein Vorzeichenwechsel bei x = 0. Welche Art liegt vor?',
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt'],
        correctAnswer: 'Sattelpunkt',
        hint: 'Kein VZW bedeutet: weder Maximum noch Minimum.',
        explanation: "f' wechselt bei x = 0 das Vorzeichen nicht (bleibt negativ) ⟹ Sattelpunkt (Terrassenpunkt).",
      },
      {
        instruction: "Berechne f''(3).",
        inputType: 'number',
        correctAnswer: 36,
        tolerance: 0.01,
        hint: "f''(x) = 12x² − 24x. Setze x = 3 ein: 12·9 − 24·3.",
        explanation: "f''(3) = 12·9 − 24·3 = 108 − 72 = 36.",
      },
      {
        instruction: "f''(3) = 36 > 0 — welche Art hat die Stelle x = 3?",
        inputType: 'multiple-choice',
        options: ['Maximum', 'Minimum', 'Sattelpunkt'],
        correctAnswer: 'Minimum',
        hint: "f''(x₀) > 0 bedeutet Linkskurve — also ein Minimum.",
        explanation: "f''(3) = 36 > 0 ⟹ Tiefpunkt (Minimum) bei x = 3. f(3) = 81 − 108 = −27 ⟹ T(3 | −27).",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0,   label: 'S(0|0)',    color: '#f39c12' },
        { x: 3, y: -27,  label: 'T(3|−27)',  color: '#2ecc71' },
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════
// C6 — Parameterfunktion untersuchen (step-by-step, extremstellen, K4)
// ════════════════════════════════════════════════════════════
// f_a(x) = x³ − a·x, mit a = 3 → f(x) = x³ − 3x
// f'(x) = 3x² − 3, f'=0 ⟹ x = ±1
// Allgemein: f'(x) = 3x² − a = 0 ⟹ x = ±√(a/3), existiert für alle a > 0.

const c6Exercises: StepByStepExercise[] = [
  {
    id: 'rem-c6-01',
    type: 'step-by-step',
    module: 'extremstellen',
    competency: 'K4',
    procedure: 'parameterfunktion',
    function: { latex: 'f_a(x) = x^3 - a \\cdot x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first: { latex: "f'(x) = 3x^2 - a", fn: (x) => 3 * x ** 2 - 3 },
    },
    steps: [
      {
        instruction: "Für a = 3: Berechne f'(x).",
        inputType: 'multiple-choice',
        options: [
          "f'(x) = 3x^2 - 3",
          "f'(x) = 3x^2 - 1",
          "f'(x) = x^2 - 3",
          "f'(x) = 3x^2",
        ],
        correctAnswer: "f'(x) = 3x^2 - 3",
        hint: 'f_a(x) = x³ − a·x. Setze a = 3 ein und leite ab.',
        explanation: "f(x) = x³ − 3x ⟹ f'(x) = 3x² − 3.",
      },
      {
        instruction: "Setze f'(x) = 0. Welche x-Werte sind Lösungen?",
        inputType: 'number-set',
        correctAnswer: [-1, 1],
        tolerance: 0.01,
        hint: '3x² − 3 = 0 ⟹ x² = 1.',
        explanation: '3x² − 3 = 0 ⟹ x² = 1 ⟹ x = −1 oder x = 1.',
      },
      {
        instruction: 'Für welche Werte von a > 0 hat f_a Extremstellen?',
        inputType: 'multiple-choice',
        options: [
          'Für alle a > 0',
          'Nur für a > 1',
          'Für a ≥ 0',
          'Nie',
        ],
        correctAnswer: 'Für alle a > 0',
        hint: "Allgemein: f'(x) = 3x² − a = 0 ⟹ x² = a/3. Wann hat diese Gleichung Lösungen?",
        explanation: "f'(x) = 3x² − a = 0 hat Lösungen x = ±√(a/3) genau dann, wenn a/3 > 0, also für alle a > 0. Jede positive Wahl von a liefert zwei Extremstellenkandidaten.",
      },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// A4 — streng monoton vs. monoton (true-false, monotonie, K1)
// ════════════════════════════════════════════════════════════

const a4Exercises: TrueFalseExercise[] = [
  {
    id: 'rem-a4-01',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3', fn: (x) => x ** 3 },
    statement: "Wenn f'(x₀) = 0 gilt, dann ist f an der Stelle x₀ nicht streng monoton.",
    correct: false,
    reasonOptions: [
      "Gegenbeispiel: f(x) = x³ hat f'(0) = 0, ist aber streng monoton steigend auf ganz ℝ",
      "f'(x₀) = 0 bedeutet immer, dass f dort die Monotonie wechselt",
      "Eine Funktion kann an einer Stelle nicht gleichzeitig f'(x₀) = 0 und streng monoton sein",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Die Aussage ist falsch. Gegenbeispiel: f(x) = x³ hat f'(0) = 3·0² = 0, aber f ist auf ganz ℝ streng monoton steigend. Eine einzelne Stelle mit f'(x₀) = 0 verhindert strenge Monotonie nicht, solange f' nicht auf einem ganzen Intervall null wird.",
    highlightX: 0,
  },
];

// ════════════════════════════════════════════════════════════
// D4 — VZW-Kriterium für Wendestellen (step-by-step, wendestellen, K3)
// ════════════════════════════════════════════════════════════
// f(x) = x⁵
// f'(x)  = 5x⁴
// f''(x) = 20x³  →  f''=0 bei x=0
// f'''(x) = 60x²  →  f'''(0) = 0  →  keine Aussage
// VZW von f'': f''(−1) = −20 < 0, f''(1) = 20 > 0 → VZW von − nach + → Wendestelle

const d4Exercises: StepByStepExercise[] = [
  {
    id: 'rem-d4-01',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K3',
    procedure: 'wendestelle-vzw',
    function: { latex: 'f(x) = x^5', fn: (x) => x ** 5 },
    derivatives: {
      first:  { latex: "f'(x) = 5x^4",   fn: (x) => 5 * x ** 4 },
      second: { latex: "f''(x) = 20x^3",  fn: (x) => 20 * x ** 3 },
      third:  { latex: "f'''(x) = 60x^2", fn: (x) => 60 * x ** 2 },
    },
    steps: [
      {
        instruction: "Welches ist f''(x)?",
        inputType: 'multiple-choice',
        options: [
          "f''(x) = 20x^3",
          "f''(x) = 20x^2",
          "f''(x) = 5x^3",
          "f''(x) = 60x^3",
        ],
        correctAnswer: "f''(x) = 20x^3",
        hint: "f'(x) = 5x⁴. Leite nochmals ab: (5x⁴)' = 20x³.",
        explanation: "f''(x) = 20x³.",
      },
      {
        instruction: "Setze f''(x) = 0. Welcher x-Wert ist Lösung?",
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: '20x³ = 0 ⟹ x = ?',
        explanation: '20x³ = 0 hat die einzige Lösung x = 0.',
      },
      {
        instruction: "Berechne f'''(0).",
        inputType: 'number',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: "f'''(x) = 60x². Setze x = 0 ein.",
        explanation: "f'''(0) = 60·0² = 0.",
      },
      {
        instruction: "f'''(0) = 0 — keine Aussage möglich! Prüfe den VZW von f''. Vorzeichen von f''(x) links von 0 (z.\u202FB. bei x = −1)?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '< 0',
        hint: "f''(−1) = 20·(−1)³ = ?",
        explanation: "f''(−1) = 20·(−1) = −20 < 0.",
      },
      {
        instruction: "Vorzeichen von f''(x) rechts von 0 (z.\u202FB. bei x = 1)?",
        inputType: 'sign-choice',
        options: ['> 0', '< 0', '= 0'],
        correctAnswer: '> 0',
        hint: "f''(1) = 20·1³ = ?",
        explanation: "f''(1) = 20 > 0.",
      },
      {
        instruction: 'VZW von − nach +. Was liegt bei x = 0 vor?',
        inputType: 'multiple-choice',
        options: ['Wendestelle', 'keine Wendestelle', 'Sattelpunkt'],
        correctAnswer: 'Wendestelle',
        hint: "f'' wechselt das Vorzeichen bei x = 0 — das ist das entscheidende Kriterium.",
        explanation: "f'' wechselt bei x = 0 von negativ nach positiv ⟹ Krümmungswechsel ⟹ Wendestelle. Da f'(0) = 0, ist es sogar ein Sattelpunkt (Wendepunkt mit waagerechter Tangente), aber die Frage ist nur nach Wendestelle.",
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 0, y: 0, label: 'W(0|0)', color: '#9b59b6' },
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════
// D9 — Wendepunkt + Dreiecksfläche (step-by-step, wendestellen, K4)
// ════════════════════════════════════════════════════════════
// f(x) = x³ − 3x² + 4
// f'(x)  = 3x² − 6x
// f''(x) = 6x − 6  →  f''=0 bei x=1
// f(1) = 1 − 3 + 4 = 2  →  W(1|2)
// f'(1) = 3 − 6 = −3  →  Wendetangente: y = −3(x−1) + 2 = −3x + 5
// Nullstelle der Tangente: −3x + 5 = 0 ⟹ x = 5/3
// y-Achsenabschnitt: x=0 ⟹ y = 5
// Dreieck: A = ½ · (5/3) · 5 = 25/6 ≈ 4.1667

const d9Exercises: StepByStepExercise[] = [
  {
    id: 'rem-d9-01',
    type: 'step-by-step',
    module: 'wendestellen',
    competency: 'K4',
    procedure: 'wendepunkt-dreiecksflaeche',
    function: { latex: 'f(x) = x^3 - 3x^2 + 4', fn: (x) => x ** 3 - 3 * x ** 2 + 4 },
    derivatives: {
      first:  { latex: "f'(x) = 3x^2 - 6x",  fn: (x) => 3 * x ** 2 - 6 * x },
      second: { latex: "f''(x) = 6x - 6",     fn: (x) => 6 * x - 6 },
    },
    steps: [
      {
        instruction: 'Der Wendepunkt ist W(1|2) und die Wendetangente ist y = −3x + 5. Berechne die Nullstelle der Wendetangente (y = 0).',
        inputType: 'number',
        correctAnswer: 5 / 3,
        tolerance: 0.05,
        hint: 'Setze y = 0: −3x + 5 = 0 ⟹ x = 5/3.',
        explanation: '−3x + 5 = 0 ⟹ 3x = 5 ⟹ x = 5/3 ≈ 1,667. Die Tangente schneidet die x-Achse bei (5/3 | 0).',
      },
      {
        instruction: 'Berechne den y-Achsenabschnitt der Wendetangente (x = 0).',
        inputType: 'number',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Setze x = 0 in y = −3x + 5 ein.',
        explanation: 'y(0) = −3·0 + 5 = 5. Die Tangente schneidet die y-Achse bei (0 | 5).',
      },
      {
        instruction: 'Die Wendetangente schneidet die x-Achse bei (5/3 | 0) und die y-Achse bei (0 | 5). Berechne die Fläche des Dreiecks zwischen der Tangente und den Koordinatenachsen.',
        inputType: 'number',
        correctAnswer: 25 / 6,
        tolerance: 0.05,
        hint: 'A = ½ · Grundseite · Höhe = ½ · (5/3) · 5.',
        explanation: 'A = ½ · (5/3) · 5 = 25/6 ≈ 4,17 FE. Das Dreieck hat die Grundseite 5/3 auf der x-Achse und die Höhe 5 auf der y-Achse.',
      },
    ],
    verificationGraph: {
      highlights: [
        { x: 1,     y: 2, label: 'W(1|2)',     color: '#9b59b6' },
        { x: 5 / 3, y: 0, label: '(5/3|0)',     color: '#e67e22' },
        { x: 0,     y: 5, label: '(0|5)',        color: '#e67e22' },
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════
// E6 — Eigenschaften zuordnen (context-interpretation als MC, kurvendiskussion, K3)
// ════════════════════════════════════════════════════════════

const e6Exercises: ContextInterpretationExercise[] = [
  {
    id: 'rem-e6-01',
    type: 'context-interpretation',
    module: 'kurvendiskussion',
    competency: 'K3',
    subType: 'interpret',
    contextTitle: 'Eigenschaften zuordnen',
    contextDescription: 'Gegeben sind zwei Funktionen: g(x) = x⁴ − 2x² (achsensymmetrisch, zwei Tiefpunkte) und h(x) = x³ − 3x (punktsymmetrisch, ein Hoch- und ein Tiefpunkt).',
    function: { latex: 'g(x) = x^4 - 2x^2', fn: (x) => x ** 4 - 2 * x ** 2 },
    question: 'Welche Eigenschaft gehört zu g(x) = x⁴ − 2x²?',
    options: [
      'Achsensymmetrisch zur y-Achse mit zwei Tiefpunkten',
      'Punktsymmetrisch zum Ursprung mit einem Hochpunkt',
      'Achsensymmetrisch zur y-Achse mit einem Tiefpunkt',
      'Keine Symmetrie, drei Extremstellen',
    ],
    correctIndex: 0,
    explanation: 'g(x) = x⁴ − 2x² enthält nur gerade Potenzen (x⁴ und x²), ist also achsensymmetrisch zur y-Achse. g\'(x) = 4x³ − 4x = 4x(x²−1) = 0 hat Lösungen x = −1, 0, 1. g\'\'(±1) = 8 > 0 ⟹ Tiefpunkte bei x = ±1, und g\'\'(0) = −4 < 0 ⟹ Hochpunkt bei x = 0.',
    highlightPoints: [
      { x: -1, y: -1, label: 'T(−1|−1)' },
      { x: 0,  y: 0,  label: 'H(0|0)' },
      { x: 1,  y: -1, label: 'T(1|−1)' },
    ],
  },
  {
    id: 'rem-e6-02',
    type: 'context-interpretation',
    module: 'kurvendiskussion',
    competency: 'K3',
    subType: 'interpret',
    contextTitle: 'Eigenschaften zuordnen',
    contextDescription: 'Gegeben sind zwei Funktionen: g(x) = x⁴ − 2x² (achsensymmetrisch, zwei Tiefpunkte) und h(x) = x³ − 3x (punktsymmetrisch, ein Hoch- und ein Tiefpunkt).',
    function: { latex: 'h(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    question: 'Welche Eigenschaft gehört zu h(x) = x³ − 3x?',
    options: [
      'Achsensymmetrisch zur y-Achse mit zwei Tiefpunkten',
      'Punktsymmetrisch zum Ursprung mit einem Hoch- und einem Tiefpunkt',
      'Punktsymmetrisch zum Ursprung mit einem Sattelpunkt',
      'Keine Symmetrie, ein Wendepunkt',
    ],
    correctIndex: 1,
    explanation: 'h(x) = x³ − 3x enthält nur ungerade Potenzen (x³ und x¹), ist also punktsymmetrisch zum Ursprung. h\'(x) = 3x² − 3 = 0 ⟹ x = ±1. h\'\'(−1) = −6 < 0 ⟹ Hochpunkt, h\'\'(1) = 6 > 0 ⟹ Tiefpunkt.',
    highlightPoints: [
      { x: -1, y: 2,  label: 'H(−1|2)' },
      { x: 1,  y: -2, label: 'T(1|−2)' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// C9 — Beispielfunktion konstruieren (criteria-quiz, extremstellen, K5)
// ════════════════════════════════════════════════════════════
// f(x) = -(x-2)² + 1: f'(x) = -2(x-2), f'(2)=0, f''(x) = -2 < 0 → Maximum bei x=2, kein Minimum.
// f(x) = (x-2)² + 1: Minimum bei x=2 → falsch
// f(x) = x³ - 6x: f'=3x²-6=0 → x=±√2, hat Max und Min → falsch
// f(x) = -x⁴ + 4x²: f'=-4x³+8x=0 → x=0,±√2, hat Max bei x=±√2 und Min bei x=0 → falsch

import type { CriteriaQuizExercise } from '../types/exercise.js';

const c9Exercises: CriteriaQuizExercise[] = [
  {
    id: 'rem-c9-01',
    type: 'criteria-quiz',
    module: 'extremstellen',
    competency: 'K5',
    question: 'Welche der folgenden Funktionen hat genau ein Maximum bei x = 2 und kein Minimum?',
    options: [
      'f(x) = -(x-2)² + 1',
      'f(x) = (x-2)² + 1',
      'f(x) = x³ - 6x',
      'f(x) = -x⁴ + 4x²',
    ],
    correctIndex: 0,
    explanation: "f(x) = −(x−2)² + 1 ist eine nach unten geöffnete Parabel mit Scheitelpunkt (2|1). f'(x) = −2(x−2) = 0 ⟹ x = 2, f''(x) = −2 < 0 ⟹ Maximum. Da die Parabel nach unten geöffnet ist, gibt es kein Minimum.",
    visualExample: {
      function: { latex: 'f(x) = -(x-2)^2 + 1', fn: (x) => -((x - 2) ** 2) + 1 },
      highlightX: 2,
      description: 'Maximum bei x = 2, kein Minimum',
    },
  },
];

// ════════════════════════════════════════════════════════════
// C10 — Allgemeiner Beweis (true-false, extremstellen, K5)
// ════════════════════════════════════════════════════════════

const c10Exercises: TrueFalseExercise[] = [
  {
    id: 'rem-c10-01',
    type: 'true-false',
    module: 'extremstellen',
    competency: 'K5',
    function: { latex: 'f(x) = x^4', fn: (x) => x ** 4 },
    statement: 'Jede ganzrationale Funktion vom Grad 4 mit positivem Leitkoeffizienten hat mindestens ein Minimum.',
    correct: true,
    reasonOptions: [
      'Für x → ±∞ geht f(x) → +∞, also muss f irgendwo ein globales Minimum annehmen',
      'Grad-4-Funktionen haben immer genau zwei Minima',
      'Der positive Leitkoeffizient bedeutet, dass f überall steigt',
    ],
    correctReasonIndex: 0,
    feedbackExplanation: 'Die Aussage ist wahr. Eine ganzrationale Funktion vom Grad 4 mit positivem Leitkoeffizienten strebt für x → +∞ und x → −∞ gegen +∞. Da f stetig ist und nach unten beschränkt sein muss (f nimmt irgendwo einen kleinsten Wert an), besitzt f mindestens ein globales Minimum.',
  },
];

// ════════════════════════════════════════════════════════════
// Export
// ════════════════════════════════════════════════════════════

export const remainingExercises: Exercise[] = [
  ...b3Exercises,
  ...c3Exercises,
  ...c6Exercises,
  ...a4Exercises,
  ...d4Exercises,
  ...d9Exercises,
  ...e6Exercises,
  ...c9Exercises,
  ...c10Exercises,
];
