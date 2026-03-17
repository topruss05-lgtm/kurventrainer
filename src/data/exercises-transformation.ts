import type { TransformationReasoningExercise } from '../types/exercise.js';

export const transformationExercises: TransformationReasoningExercise[] = [
  // ─── B4: Transformation and extrema (extremstellen, K3) ───
  {
    id: 'trans-b4-01',
    type: 'transformation-reasoning',
    module: 'extremstellen',
    competency: 'K3',
    function: { latex: 'f(x) = -x² + 4x', fn: (x) => -(x ** 2) + 4 * x },
    originalInfo: 'f hat einen Hochpunkt bei H(2 | 4).',
    transformation: 'g(x) = f(x - 3) + 1',
    question: 'Wo hat g einen Hochpunkt?',
    inputType: 'coordinates',
    correctAnswer: { x: 5, y: 5 },
    explanation:
      'Die Transformation x → x − 3 verschiebt den Graphen um 3 nach rechts, das + 1 verschiebt ihn um 1 nach oben. Der Hochpunkt wandert von (2 | 4) nach (2 + 3 | 4 + 1) = (5 | 5).',
  },
  {
    id: 'trans-b4-02',
    type: 'transformation-reasoning',
    module: 'extremstellen',
    competency: 'K3',
    function: { latex: 'f(x) = x² - 6x + 8', fn: (x) => x ** 2 - 6 * x + 8 },
    originalInfo: 'f hat einen Tiefpunkt bei T(3 | -1).',
    transformation: 'g(x) = f(x + 2) - 3',
    question: 'Wo hat g einen Tiefpunkt?',
    inputType: 'coordinates',
    correctAnswer: { x: 1, y: -4 },
    explanation:
      'Die Transformation x → x + 2 verschiebt den Graphen um 2 nach links, das − 3 verschiebt ihn um 3 nach unten. Der Tiefpunkt wandert von (3 | −1) nach (3 − 2 | −1 − 3) = (1 | −4).',
  },

  // ─── B7: Symmetry argument (extremstellen, K3) ───
  {
    id: 'trans-b7-01',
    type: 'transformation-reasoning',
    module: 'extremstellen',
    competency: 'K3',
    function: { latex: 'f(x) = x⁴ - 18x² + 5', fn: (x) => x ** 4 - 18 * x ** 2 + 5 },
    originalInfo: 'f ist achsensymmetrisch zur y-Achse, denn f(−x) = f(x). f hat bei x = 3 ein lokales Minimum mit f(3) = −76.',
    transformation: 'Die Achsensymmetrie f(−x) = f(x) wird ausgenutzt.',
    question: 'Was folgt für x = −3?',
    inputType: 'multiple-choice',
    correctAnswer: 0,
    options: [
      'f hat bei x = −3 ebenfalls ein lokales Minimum mit f(−3) = −76.',
      'f hat bei x = −3 ein lokales Maximum mit f(−3) = −76.',
      'f hat bei x = −3 eine Wendestelle.',
      'Über x = −3 kann man nichts aussagen.',
    ],
    correctIndex: 0,
    explanation:
      'Wegen f(−x) = f(x) ist der Graph spiegelsymmetrisch zur y-Achse. Ein lokales Minimum bei x = 3 muss daher auch bei x = −3 vorliegen, mit demselben Funktionswert f(−3) = f(3) = −76. Art und Wert des Extremums bleiben bei Achsensymmetrie erhalten.',
  },
  {
    id: 'trans-b7-02',
    type: 'transformation-reasoning',
    module: 'extremstellen',
    competency: 'K3',
    function: { latex: 'f(x) = x⁴ - 8x² + 16', fn: (x) => x ** 4 - 8 * x ** 2 + 16 },
    originalInfo: 'f ist achsensymmetrisch zur y-Achse, denn f(−x) = f(x). f hat bei x = 2 ein lokales Minimum mit f(2) = 0.',
    transformation: 'Die Achsensymmetrie f(−x) = f(x) wird ausgenutzt.',
    question: 'Was folgt für x = −2?',
    inputType: 'multiple-choice',
    correctAnswer: 1,
    options: [
      'f hat bei x = −2 ein lokales Maximum mit f(−2) = 0.',
      'f hat bei x = −2 ebenfalls ein lokales Minimum mit f(−2) = 0.',
      'f hat bei x = −2 eine Nullstelle, aber kein Extremum.',
      'f(−2) = 0, aber über die Art der Stelle kann man nichts sagen.',
    ],
    correctIndex: 1,
    explanation:
      'Wegen der Achsensymmetrie gilt: Wenn f bei x = 2 ein lokales Minimum hat, dann auch bei x = −2 — mit demselben Funktionswert f(−2) = f(2) = 0. Die Art des Extremums (Minimum) wird durch die Symmetrie gespiegelt, bleibt aber ein Minimum.',
  },

  // ─── E1: Basic function + shift (kurvendiskussion, K1) ───
  {
    id: 'trans-e1-01',
    type: 'transformation-reasoning',
    module: 'kurvendiskussion',
    competency: 'K1',
    function: { latex: 'f(x) = (x - 2)³ + 1', fn: (x) => (x - 2) ** 3 + 1 },
    originalInfo: 'Die Grundfunktion g(x) = x³ hat eine Wendestelle bei (0 | 0).',
    transformation: 'f(x) = (x − 2)³ + 1 entsteht aus g durch Verschiebung um 2 nach rechts und 1 nach oben.',
    question: 'Wo liegt der Wendepunkt von f?',
    inputType: 'coordinates',
    correctAnswer: { x: 2, y: 1 },
    explanation:
      'g(x) = x³ hat den Wendepunkt bei (0 | 0). Durch die Verschiebung x → x − 2 wandert er 2 Einheiten nach rechts, durch das + 1 eine Einheit nach oben. Der Wendepunkt von f liegt also bei (2 | 1).',
  },
  {
    id: 'trans-e1-02',
    type: 'transformation-reasoning',
    module: 'kurvendiskussion',
    competency: 'K1',
    function: { latex: 'f(x) = (x + 1)³ - 4', fn: (x) => (x + 1) ** 3 - 4 },
    originalInfo: 'Die Grundfunktion g(x) = x³ hat eine Wendestelle bei (0 | 0).',
    transformation: 'f(x) = (x + 1)³ − 4 entsteht aus g durch Verschiebung um 1 nach links und 4 nach unten.',
    question: 'Wo liegt der Wendepunkt von f?',
    inputType: 'coordinates',
    correctAnswer: { x: -1, y: -4 },
    explanation:
      'g(x) = x³ hat den Wendepunkt bei (0 | 0). Durch x → x + 1 verschiebt sich der Graph 1 Einheit nach links, durch das − 4 vier Einheiten nach unten. Der Wendepunkt von f liegt bei (−1 | −4).',
  },
];
