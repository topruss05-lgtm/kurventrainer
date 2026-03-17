import type { GraphSketchExercise } from '../types/exercise.js';

export const graphSketchExercises: GraphSketchExercise[] = [
  // ─── A6: Graph from monotonicity conditions (monotonie, K3) ───
  {
    id: 'gs-a6-01',
    type: 'graph-sketch',
    module: 'monotonie',
    competency: 'K3',
    function: { latex: 'f(x) = -x² + 4x', fn: (x) => -(x ** 2) + 4 * x },
    conditions: [
      'f ist auf (-\\infty;\\, 2) streng monoton steigend',
      'f ist auf (2;\\, \\infty) streng monoton fallend',
      'f hat bei x = 2 einen Hochpunkt',
    ],
    graphOptions: [
      {
        id: 'gs-a6-01-a',
        function: { latex: 'f(x) = -x² + 4x', fn: (x) => -(x ** 2) + 4 * x },
        isCorrect: true,
      },
      {
        id: 'gs-a6-01-b',
        function: { latex: 'g(x) = x² - 4x', fn: (x) => x ** 2 - 4 * x },
        isCorrect: false,
      },
      {
        id: 'gs-a6-01-c',
        function: { latex: 'h(x) = -x² + 4x - 6', fn: (x) => -(x ** 2) + 4 * x - 6 },
        isCorrect: false,
      },
      {
        id: 'gs-a6-01-d',
        function: { latex: 'k(x) = -(x - 4)²', fn: (x) => -((x - 4) ** 2) },
        isCorrect: false,
      },
    ],
    explanation:
      'Die Funktion muss links von x = 2 steigen und rechts von x = 2 fallen — das ist eine nach unten geöffnete Parabel mit Scheitelpunkt bei x = 2. Die reflektierte Parabel (nach oben offen) hat bei x = 2 ein Minimum, nicht ein Maximum. Die verschobenen Varianten haben den Hochpunkt an der falschen Stelle oder auf der falschen Höhe.',
  },
  {
    id: 'gs-a6-02',
    type: 'graph-sketch',
    module: 'monotonie',
    competency: 'K3',
    function: { latex: 'f(x) = x³ - 3x', fn: (x) => x ** 3 - 3 * x },
    conditions: [
      'f ist auf (-\\infty;\\, -1) streng monoton steigend',
      'f ist auf (-1;\\, 1) streng monoton fallend',
      'f ist auf (1;\\, \\infty) streng monoton steigend',
    ],
    graphOptions: [
      {
        id: 'gs-a6-02-a',
        function: { latex: 'g(x) = -x³ + 3x', fn: (x) => -(x ** 3) + 3 * x },
        isCorrect: false,
      },
      {
        id: 'gs-a6-02-b',
        function: { latex: 'f(x) = x³ - 3x', fn: (x) => x ** 3 - 3 * x },
        isCorrect: true,
      },
      {
        id: 'gs-a6-02-c',
        function: { latex: 'h(x) = x³ - 3x²', fn: (x) => x ** 3 - 3 * x ** 2 },
        isCorrect: false,
      },
      {
        id: 'gs-a6-02-d',
        function: { latex: 'k(x) = x³', fn: (x) => x ** 3 },
        isCorrect: false,
      },
    ],
    explanation:
      'Gesucht ist eine Funktion, die bei x = −1 ein lokales Maximum und bei x = 1 ein lokales Minimum hat. f(x) = x³ − 3x erfüllt das: f\'(x) = 3x² − 3 = 0 bei x = ±1. Die gespiegelte Version −x³ + 3x hat das Monotonieverhalten genau umgekehrt. x³ − 3x² hat Extrema bei x = 0 und x = 2. x³ hat keine Extrema.',
  },

  // ─── E2: Nullstellen + Endverhalten → Sketch (kurvendiskussion, K3) ───
  {
    id: 'gs-e2-01',
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K3',
    function: { latex: 'f(x) = x(x + 2)(x - 3)', fn: (x) => x * (x + 2) * (x - 3) },
    conditions: [
      'f hat Nullstellen bei x = -2,\\, x = 0 und x = 3',
      'Für x \\to \\infty gilt f(x) \\to \\infty',
      'Für x \\to -\\infty gilt f(x) \\to -\\infty',
    ],
    graphOptions: [
      {
        id: 'gs-e2-01-a',
        function: { latex: 'g(x) = -x(x + 2)(x - 3)', fn: (x) => -x * (x + 2) * (x - 3) },
        isCorrect: false,
      },
      {
        id: 'gs-e2-01-b',
        function: { latex: 'h(x) = x(x - 2)(x + 3)', fn: (x) => x * (x - 2) * (x + 3) },
        isCorrect: false,
      },
      {
        id: 'gs-e2-01-c',
        function: { latex: 'f(x) = x(x + 2)(x - 3)', fn: (x) => x * (x + 2) * (x - 3) },
        isCorrect: true,
      },
      {
        id: 'gs-e2-01-d',
        function: { latex: 'k(x) = (x + 2)(x - 3)', fn: (x) => (x + 2) * (x - 3) },
        isCorrect: false,
      },
    ],
    explanation:
      'Die Nullstellen bei x = −2, 0, 3 und das Endverhalten (positiver Leitkoeffizient bei Grad 3) passen nur zu f(x) = x(x+2)(x−3). Die gespiegelte Version hat das umgekehrte Endverhalten. h hat falsche Nullstellen (bei x = −3, 0, 2). k ist nur Grad 2 und hat nur zwei Nullstellen.',
  },
  {
    id: 'gs-e2-02',
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K3',
    function: { latex: 'f(x) = (x + 1)(x - 1)(x - 4)', fn: (x) => (x + 1) * (x - 1) * (x - 4) },
    conditions: [
      'f hat Nullstellen bei x = -1,\\, x = 1 und x = 4',
      'Für x \\to \\infty gilt f(x) \\to \\infty',
      'Für x \\to -\\infty gilt f(x) \\to -\\infty',
    ],
    graphOptions: [
      {
        id: 'gs-e2-02-a',
        function: { latex: 'f(x) = (x + 1)(x - 1)(x - 4)', fn: (x) => (x + 1) * (x - 1) * (x - 4) },
        isCorrect: true,
      },
      {
        id: 'gs-e2-02-b',
        function: { latex: 'g(x) = -(x + 1)(x - 1)(x - 4)', fn: (x) => -((x + 1) * (x - 1) * (x - 4)) },
        isCorrect: false,
      },
      {
        id: 'gs-e2-02-c',
        function: { latex: 'h(x) = (x + 1)²(x - 4)', fn: (x) => (x + 1) ** 2 * (x - 4) },
        isCorrect: false,
      },
      {
        id: 'gs-e2-02-d',
        function: { latex: 'k(x) = (x - 1)(x + 4)(x + 1)', fn: (x) => (x - 1) * (x + 4) * (x + 1) },
        isCorrect: false,
      },
    ],
    explanation:
      'Nullstellen bei x = −1, 1, 4 mit positivem Leitkoeffizienten. Die gespiegelte Version hat das falsche Endverhalten. h hat bei x = −1 eine doppelte Nullstelle (der Graph berührt dort die x-Achse, statt sie zu schneiden). k hat eine Nullstelle bei x = −4 statt x = 4.',
  },

  // ─── E7: From derivative info to graph (kurvendiskussion, K4) ───
  {
    id: 'gs-e7-01',
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K4',
    function: { latex: 'f(x) = -x² + 4x + 1', fn: (x) => -(x ** 2) + 4 * x + 1 },
    conditions: [
      "f'(2) = 0",
      "f''(2) < 0 \\text{ (Hochpunkt)}",
      'f(2) = 5',
      'f(0) = 1',
    ],
    graphOptions: [
      {
        id: 'gs-e7-01-a',
        function: { latex: 'g(x) = x² - 4x + 1', fn: (x) => x ** 2 - 4 * x + 1 },
        isCorrect: false,
      },
      {
        id: 'gs-e7-01-b',
        function: { latex: 'f(x) = -x² + 4x + 1', fn: (x) => -(x ** 2) + 4 * x + 1 },
        isCorrect: true,
      },
      {
        id: 'gs-e7-01-c',
        function: { latex: 'h(x) = -x² + 4x - 3', fn: (x) => -(x ** 2) + 4 * x - 3 },
        isCorrect: false,
      },
      {
        id: 'gs-e7-01-d',
        function: { latex: 'k(x) = -(x - 2)² + 3', fn: (x) => -((x - 2) ** 2) + 3 },
        isCorrect: false,
      },
    ],
    explanation:
      'f\'(2) = 0 und f\'\'(2) < 0 bedeuten Hochpunkt bei x = 2. f(2) = 5 gibt den y-Wert des Hochpunkts. f(0) = 1 fixiert den y-Achsenabschnitt. Nur f(x) = −x² + 4x + 1 erfüllt alle Bedingungen: f(2) = −4 + 8 + 1 = 5 und f(0) = 1. Die reflektierte Version hat ein Minimum. h hat f(0) = −3. k hat f(2) = 3, nicht 5.',
  },
  {
    id: 'gs-e7-02',
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K4',
    function: { latex: 'f(x) = x³ - 3x + 2', fn: (x) => x ** 3 - 3 * x + 2 },
    conditions: [
      "f'(-1) = 0 \\text{ und } f'(1) = 0",
      "f''(-1) < 0 \\text{ (Hochpunkt bei } x = -1\\text{)}",
      "f''(1) > 0 \\text{ (Tiefpunkt bei } x = 1\\text{)}",
      'f(-1) = 4 \\text{ und } f(1) = 0',
    ],
    graphOptions: [
      {
        id: 'gs-e7-02-a',
        function: { latex: 'f(x) = x³ - 3x + 2', fn: (x) => x ** 3 - 3 * x + 2 },
        isCorrect: true,
      },
      {
        id: 'gs-e7-02-b',
        function: { latex: 'g(x) = -x³ + 3x + 2', fn: (x) => -(x ** 3) + 3 * x + 2 },
        isCorrect: false,
      },
      {
        id: 'gs-e7-02-c',
        function: { latex: 'h(x) = x³ - 3x', fn: (x) => x ** 3 - 3 * x },
        isCorrect: false,
      },
      {
        id: 'gs-e7-02-d',
        function: { latex: 'k(x) = x³ - 3x - 2', fn: (x) => x ** 3 - 3 * x - 2 },
        isCorrect: false,
      },
    ],
    explanation:
      'f\'(x) = 3x² − 3 = 0 bei x = ±1. f\'\'(x) = 6x, also f\'\'(−1) = −6 < 0 (Hochpunkt) und f\'\'(1) = 6 > 0 (Tiefpunkt). f(−1) = −1 + 3 + 2 = 4 und f(1) = 1 − 3 + 2 = 0. Die gespiegelte Version hat Hoch- und Tiefpunkt vertauscht. h hat f(−1) = 2 und f(1) = −2. k hat f(1) = −4.',
  },

  // ─── E8: Find function term for graph (kurvendiskussion, K4) ───
  {
    id: 'gs-e8-01',
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K4',
    function: { latex: 'f(x) = x² - 4x + 3', fn: (x) => x ** 2 - 4 * x + 3 },
    conditions: [
      'f hat Nullstellen bei x = 1 und x = 3',
      'f hat einen Tiefpunkt bei (2 | -1)',
      'f(0) = 3',
      'Welcher Funktionsterm passt?',
    ],
    graphOptions: [
      {
        id: 'gs-e8-01-a',
        function: { latex: 'g(x) = x² - 4x + 4', fn: (x) => x ** 2 - 4 * x + 4 },
        isCorrect: false,
      },
      {
        id: 'gs-e8-01-b',
        function: { latex: 'h(x) = x² - 2x - 3', fn: (x) => x ** 2 - 2 * x - 3 },
        isCorrect: false,
      },
      {
        id: 'gs-e8-01-c',
        function: { latex: 'f(x) = x² - 4x + 3', fn: (x) => x ** 2 - 4 * x + 3 },
        isCorrect: true,
      },
      {
        id: 'gs-e8-01-d',
        function: { latex: 'k(x) = -x² + 4x - 3', fn: (x) => -(x ** 2) + 4 * x - 3 },
        isCorrect: false,
      },
    ],
    explanation:
      'Nullstellen bei x = 1 und x = 3 ergeben f(x) = (x−1)(x−3) = x² − 4x + 3. Tiefpunkt bei (2|−1): f(2) = 4 − 8 + 3 = −1. x² − 4x + 4 = (x−2)² hat nur eine Nullstelle. x² − 2x − 3 hat Nullstellen bei −1 und 3. −x² + 4x − 3 hat einen Hochpunkt statt eines Tiefpunkts.',
  },
  {
    id: 'gs-e8-02',
    type: 'graph-sketch',
    module: 'kurvendiskussion',
    competency: 'K4',
    function: { latex: 'f(x) = x³ - 6x² + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
    conditions: [
      'f hat Nullstellen bei x = 0 und x = 3 (doppelt)',
      'f hat einen Hochpunkt bei (1 | 4)',
      'Für x \\to \\infty gilt f(x) \\to \\infty',
      'Welcher Funktionsterm passt?',
    ],
    graphOptions: [
      {
        id: 'gs-e8-02-a',
        function: { latex: 'g(x) = x³ - 9x', fn: (x) => x ** 3 - 9 * x },
        isCorrect: false,
      },
      {
        id: 'gs-e8-02-b',
        function: { latex: 'f(x) = x³ - 6x² + 9x', fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x },
        isCorrect: true,
      },
      {
        id: 'gs-e8-02-c',
        function: { latex: 'h(x) = -x³ + 6x² - 9x', fn: (x) => -(x ** 3) + 6 * x ** 2 - 9 * x },
        isCorrect: false,
      },
      {
        id: 'gs-e8-02-d',
        function: { latex: 'k(x) = x³ - 6x² + 12x - 8', fn: (x) => x ** 3 - 6 * x ** 2 + 12 * x - 8 },
        isCorrect: false,
      },
    ],
    explanation:
      'Nullstellen bei x = 0 (einfach) und x = 3 (doppelt): f(x) = x(x−3)² = x³ − 6x² + 9x. f(1) = 1 − 6 + 9 = 4. Die gespiegelte Version hat das falsche Endverhalten. g = x³ − 9x hat andere Nullstellen (0, ±3). k = (x−2)³ hat eine dreifache Nullstelle bei x = 2.',
  },
];
