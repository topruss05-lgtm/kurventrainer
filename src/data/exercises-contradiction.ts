import type { ContradictionArgumentExercise } from '../types/exercise.js';

export const contradictionExercises: ContradictionArgumentExercise[] = [
  // ─── E5: Show graph does NOT belong to function (kurvendiskussion, K5) ───
  {
    id: 'contra-e5-01',
    type: 'contradiction-argument',
    module: 'kurvendiskussion',
    competency: 'K5',
    function: { latex: 'f(x) = x³ - 3x', fn: (x) => x ** 3 - 3 * x },
    derivatives: {
      first: { latex: "f'(x) = 3x² - 3", fn: (x) => 3 * x ** 2 - 3 },
      second: { latex: "f''(x) = 6x", fn: (x) => 6 * x },
    },
    shownGraph: { latex: 'g(x) = -x³ + 4x', fn: (x) => -(x ** 3) + 4 * x },
    claimedFunctionLatex: 'f(x) = x³ - 3x',
    prompt:
      'Der abgebildete Graph soll zur Funktion f(x) = x³ − 3x gehören. Wähle 3 gültige Argumente, die zeigen, dass der Graph NICHT zu f passt.',
    arguments: [
      {
        text: 'f(0) = 0 und der Graph geht durch den Ursprung — das stimmt zwar überein, widerlegt aber nichts.',
        isValid: false,
        explanation: 'Beide Funktionen haben f(0) = 0, das ist kein Widerspruch.',
      },
      {
        text: "f'(x) = 3x² − 3 = 0 bei x = ±1, also hat f Extrema bei x = −1 und x = 1. Der gezeigte Graph hat seine Extrema an anderen Stellen.",
        isValid: true,
        explanation: 'Die Extremstellen von f liegen bei x = ±1, der Graph zeigt aber Extrema bei anderen x-Werten.',
      },
      {
        text: 'Für x → ∞ gilt f(x) → ∞ (positiver Leitkoeffizient). Der gezeigte Graph fällt aber für x → ∞.',
        isValid: true,
        explanation: 'x³ − 3x hat positiven Leitkoeffizienten, also f(x) → ∞ für x → ∞. Der Graph zeigt das Gegenteil.',
      },
      {
        text: 'f ist punktsymmetrisch zum Ursprung, weil f(−x) = −f(x). Das sieht man auch am Graph.',
        isValid: false,
        explanation: 'Beide Funktionen sind punktsymmetrisch — das ist kein Widerspruch.',
      },
      {
        text: 'f(1) = 1 − 3 = −2. Am gezeigten Graph liest man aber bei x = 1 einen positiven y-Wert ab.',
        isValid: true,
        explanation: 'Der gezeigte Graph hat bei x = 1 den Wert g(1) = −1 + 4 = 3, aber f(1) = −2. Das ist ein Widerspruch.',
      },
      {
        text: "f''(x) = 6x, also ist die Wendestelle bei x = 0. Der Graph hat seine Wendestelle auch bei x = 0.",
        isValid: false,
        explanation: 'Beide Funktionen haben die Wendestelle bei x = 0 — kein Widerspruch.',
      },
      {
        text: 'f hat Nullstellen bei x = 0, x = √3 ≈ 1,73 und x = −√3 ≈ −1,73. Der Graph schneidet die x-Achse aber an anderen Stellen.',
        isValid: true,
        explanation: 'Die Nullstellen von f (bei 0, ±√3) stimmen nicht mit denen des Graphen (0, ±2) überein.',
      },
      {
        text: 'f(−1) = −1 + 3 = 2, also hat f bei x = −1 ein lokales Maximum mit dem Wert 2. Am Graph liest man einen anderen Maximalwert ab.',
        isValid: true,
        explanation: 'f hat bei x = −1 den Wert 2, der Graph zeigt dort einen anderen Funktionswert.',
      },
    ],
    requiredCorrectCount: 3,
    feedbackExplanation:
      'Der gezeigte Graph gehört zu g(x) = −x³ + 4x. Die Hauptunterschiede zu f(x) = x³ − 3x: (1) Das Endverhalten ist gespiegelt (negativer statt positiver Leitkoeffizient). (2) Die Extremstellen liegen an anderen x-Werten. (3) Die Funktionswerte stimmen nicht überein, z.B. f(1) = −2 vs. g(1) = 3.',
  },
  {
    id: 'contra-e5-02',
    type: 'contradiction-argument',
    module: 'kurvendiskussion',
    competency: 'K5',
    function: { latex: 'f(x) = x² - 4', fn: (x) => x ** 2 - 4 },
    derivatives: {
      first: { latex: "f'(x) = 2x", fn: (x) => 2 * x },
      second: { latex: "f''(x) = 2", fn: (_x) => 2 },
    },
    shownGraph: { latex: 'g(x) = -x² + 4', fn: (x) => -(x ** 2) + 4 },
    claimedFunctionLatex: 'f(x) = x² - 4',
    prompt:
      'Der abgebildete Graph soll zur Funktion f(x) = x² − 4 gehören. Wähle 3 gültige Argumente, die zeigen, dass der Graph NICHT zu f passt.',
    arguments: [
      {
        text: 'f hat Nullstellen bei x = −2 und x = 2. Der Graph schneidet die x-Achse ebenfalls bei ±2.',
        isValid: false,
        explanation: 'Beide Funktionen haben die gleichen Nullstellen — das ist kein Widerspruch.',
      },
      {
        text: 'f(0) = −4, also liegt der y-Achsenabschnitt bei −4. Am Graph liest man aber f(0) = 4 ab.',
        isValid: true,
        explanation: 'f(0) = 0 − 4 = −4, der Graph zeigt aber den Wert +4 bei x = 0.',
      },
      {
        text: "f''(x) = 2 > 0 für alle x, also ist f überall linksgekrümmt (nach oben offen). Der Graph ist aber rechtsgekrümmt (nach unten offen).",
        isValid: true,
        explanation: 'f ist überall konvex (nach oben offen), der gezeigte Graph ist konkav (nach unten offen).',
      },
      {
        text: "f'(x) = 2x = 0 bei x = 0, dort hat f ein Minimum. Der Graph zeigt aber bei x = 0 ein Maximum.",
        isValid: true,
        explanation: 'f hat bei x = 0 ein Minimum (Tiefpunkt), der Graph zeigt ein Maximum (Hochpunkt).',
      },
      {
        text: 'f ist achsensymmetrisch zur y-Achse, weil f(−x) = f(x). Der Graph ist auch achsensymmetrisch.',
        isValid: false,
        explanation: 'Beide Funktionen sind achsensymmetrisch — kein Widerspruch.',
      },
      {
        text: 'Für x → ∞ gilt f(x) → ∞. Der Graph fällt aber für große x-Werte.',
        isValid: true,
        explanation: 'f(x) = x² − 4 wächst für x → ∞, der Graph (nach unten offene Parabel) fällt.',
      },
      {
        text: 'f(1) = 1 − 4 = −3. Am Graph ist der Wert bei x = 1 aber positiv (ungefähr 3).',
        isValid: true,
        explanation: 'f(1) = −3, der Graph zeigt g(1) = −1 + 4 = 3. Deutlicher Widerspruch.',
      },
      {
        text: 'f ist eine Parabel, und der Graph zeigt auch eine Parabel.',
        isValid: false,
        explanation: 'Dass beides Parabeln sind, ist kein Widerspruch — die Frage ist, welche Parabel.',
      },
    ],
    requiredCorrectCount: 3,
    feedbackExplanation:
      'Der gezeigte Graph gehört zu g(x) = −x² + 4, der Spiegelung von f an der x-Achse. Hauptwidersprüche: (1) Der y-Achsenabschnitt ist +4 statt −4. (2) Der Graph ist nach unten offen (Hochpunkt), f ist aber nach oben offen (Tiefpunkt). (3) Das Endverhalten ist falsch: f → ∞, Graph → −∞.',
  },

  // ─── D10: Proof about inflection points (wendestellen, K5) ───
  {
    id: 'contra-d10-01',
    type: 'contradiction-argument',
    module: 'wendestellen',
    competency: 'K5',
    function: { latex: 'f(x) = x³ + bx² + cx + d', fn: (x) => x ** 3 + x ** 2 - x + 1 },
    derivatives: {
      first: { latex: "f'(x) = 3x² + 2bx + c", fn: (x) => 3 * x ** 2 + 2 * x - 1 },
      second: { latex: "f''(x) = 6x + 2b", fn: (x) => 6 * x + 2 },
    },
    shownGraph: { latex: 'f(x) = x³ + x² - x + 1', fn: (x) => x ** 3 + x ** 2 - x + 1 },
    claimedFunctionLatex: 'f(x) = ax³ + bx² + cx + d \\text{ mit } a \\neq 0',
    prompt:
      'Zeige: Jede ganzrationale Funktion dritten Grades f(x) = ax³ + bx² + cx + d (a ≠ 0) hat genau eine Wendestelle. Wähle 3 Argumente, die zusammen den Beweis bilden.',
    arguments: [
      {
        text: "f''(x) = 6ax + 2b ist eine lineare Funktion (Gerade) mit Steigung 6a ≠ 0.",
        isValid: true,
        explanation: 'Die zweite Ableitung ist linear und nicht konstant, weil a ≠ 0.',
      },
      {
        text: "Eine lineare Funktion f''(x) = 6ax + 2b hat genau eine Nullstelle: x = −b/(3a).",
        isValid: true,
        explanation: 'Die notwendige Bedingung f\'\'(x) = 0 hat genau eine Lösung.',
      },
      {
        text: "f'''(x) = 6a ≠ 0, also wechselt f'' bei x = −b/(3a) das Vorzeichen (VZW liegt vor).",
        isValid: true,
        explanation: 'Da f\'\'\'(x) = 6a ≠ 0, hat f\'\' bei der Nullstelle einen Vorzeichenwechsel — hinreichende Bedingung für eine Wendestelle.',
      },
      {
        text: 'Jede kubische Funktion hat einen S-förmigen Graphen, also muss es eine Wendestelle geben.',
        isValid: false,
        explanation: 'Das ist eine anschauliche Beobachtung, aber kein mathematischer Beweis.',
      },
      {
        text: 'Da f eine Polynomfunktion ist, ist f überall stetig und differenzierbar.',
        isValid: false,
        explanation: 'Das ist zwar korrekt, aber reicht allein nicht als Argument für genau eine Wendestelle.',
      },
      {
        text: "f'(x) = 3ax² + 2bx + c hat maximal zwei Nullstellen, also hat f maximal zwei Extremstellen.",
        isValid: false,
        explanation: 'Das betrifft die Extremstellen, nicht die Wendestellen.',
      },
    ],
    requiredCorrectCount: 3,
    feedbackExplanation:
      'Der Beweis verläuft in drei Schritten: (1) f\'\'(x) = 6ax + 2b ist eine Gerade mit Steigung 6a ≠ 0. (2) Diese Gerade hat genau eine Nullstelle bei x = −b/(3a). (3) f\'\'\'(x) = 6a ≠ 0 garantiert einen Vorzeichenwechsel von f\'\' — die hinreichende Bedingung für eine Wendestelle ist erfüllt. Also hat jede kubische Funktion genau eine Wendestelle.',
  },
];
