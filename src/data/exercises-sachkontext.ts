import type { ContextInterpretationExercise, Exercise } from '../types/exercise.js';

// ─── F1: interpret – Mathematische Aussage → Alltagsbedeutung ───

const f1Interpret: ContextInterpretationExercise[] = [
  {
    id: 'sach-f1-01',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'K(t) = -t^2 + 6t', fn: (t) => -(t**2) + 6*t },
    subType: 'interpret',
    contextTitle: 'Medikamenten-Konzentration',
    contextDescription: 'Die Konzentration eines Medikaments im Blut wird durch K(t) = -t² + 6t beschrieben (t in Stunden, K in mg/l).',
    question: 'K(t) hat bei t = 3 einen Hochpunkt H(3|9). Was bedeutet das im Sachzusammenhang?',
    options: [
      'Nach 3 Stunden erreicht die Konzentration ihr Maximum von 9 mg/l.',
      'Nach 9 Stunden ist die Konzentration bei 3 mg/l.',
      'Die Konzentration steigt 3 Stunden lang um 9 mg/l pro Stunde.',
      'Nach 3 Stunden ist das Medikament vollständig abgebaut.',
    ],
    correctIndex: 0,
    explanation: 'Ein Hochpunkt H(3|9) bedeutet: Zum Zeitpunkt t = 3 (nach 3 Stunden) hat K den größten Wert, nämlich 9 mg/l. Das ist die maximale Konzentration.',
    highlightPoints: [{ x: 3, y: 9, label: 'H(3|9)' }],
  },
  {
    id: 'sach-f1-02',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'G(x) = -x^3 + 12x^2 - 36x', fn: (x) => -(x**3) + 12*(x**2) - 36*x },
    subType: 'interpret',
    contextTitle: 'Gewinnfunktion eines Unternehmens',
    contextDescription: 'Der Gewinn G(x) eines Unternehmens hängt von der produzierten Stückzahl x (in Tausend) ab.',
    question: 'G\'(x) = 0 bei x = 2 und G\'\'(2) < 0. Was bedeutet das?',
    options: [
      'Bei 2000 Stück macht das Unternehmen keinen Gewinn.',
      'Bei 2000 Stück ist der Gewinn maximal.',
      'Bei 2000 Stück steigt der Gewinn am schnellsten.',
      'Bei 2000 Stück ändert sich die Gewinnentwicklung.',
    ],
    correctIndex: 1,
    explanation: 'G\'(x) = 0 und G\'\'(x) < 0 bedeutet: Bei x = 2 liegt ein Maximum vor. Also ist der Gewinn bei 2000 Stück am größten.',
    highlightPoints: [{ x: 2, y: -(2**3) + 12*4 - 72, label: 'Maximum' }],
  },
];

// ─── F2: context-to-sketch – Textbeschreibung → passender Graph ───

const f2ContextToSketch: ContextInterpretationExercise[] = [
  {
    id: 'sach-f2-01',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'T(t) = -0{,}5t^2 + 7t + 5', fn: (t) => -0.5*(t**2) + 7*t + 5 },
    subType: 'context-to-sketch',
    contextTitle: 'Tagestemperatur',
    contextDescription: 'Die Temperatur steigt am Morgen an, erreicht gegen 14 Uhr ein Maximum und fällt dann bis zum Abend wieder ab.',
    contextGraph: { latex: 'T(t) = -0{,}5t^2 + 7t + 5', fn: (t) => -0.5*(t**2) + 7*t + 5 },
    question: 'Welche Beschreibung passt zum Temperaturverlauf?',
    options: [
      'Nach oben offene Parabel mit einem Minimum in der Mitte des Tages.',
      'Nach unten offene Parabel mit einem Maximum in der Mitte des Tages.',
      'Konstant steigende Gerade über den ganzen Tag.',
      'S-förmige Kurve, die erst fällt, dann steigt und wieder fällt.',
    ],
    correctIndex: 1,
    explanation: 'Die Temperatur steigt erst und fällt dann — das ist eine nach unten offene Parabel mit einem Hochpunkt (Maximum) in der Mitte.',
  },
  {
    id: 'sach-f2-02',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'h(t) = 0{,}1t^3 - 1{,}5t^2 + 6t', fn: (t) => 0.1*(t**3) - 1.5*(t**2) + 6*t },
    subType: 'context-to-sketch',
    contextTitle: 'Füllhöhe eines Schwimmbeckens',
    contextDescription: 'Ein Schwimmbecken wird befüllt. Anfangs fließt viel Wasser hinein, dann wird der Zufluss gedrosselt, und gegen Ende wird er wieder erhöht.',
    contextGraph: { latex: 'h(t) = 0{,}1t^3 - 1{,}5t^2 + 6t', fn: (t) => 0.1*(t**3) - 1.5*(t**2) + 6*t },
    question: 'Welche Beschreibung passt zum Graphen der Füllhöhe h(t)?',
    options: [
      'Die Kurve steigt gleichmäßig (linear) an.',
      'Die Kurve steigt erst steil, dann flacher, dann wieder steiler — immer steigend, aber mit wechselnder Krümmung.',
      'Die Kurve steigt erst und fällt dann wieder auf null.',
      'Die Kurve ist eine nach unten offene Parabel.',
    ],
    correctIndex: 1,
    explanation: 'Die Füllhöhe steigt durchgehend (das Becken wird ja befüllt), aber die Geschwindigkeit ändert sich: erst schnell, dann langsam, dann wieder schnell. Das ergibt eine Kurve mit Wendepunkt — wechselnde Krümmung.',
  },
];

// ─── F3: formalize – Alltagsaussage → mathematischer Ausdruck ───

const f3Formalize: ContextInterpretationExercise[] = [
  {
    id: 'sach-f3-01',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'G(x) = -2x^2 + 200x - 3000', fn: (x) => -2*(x**2) + 200*x - 3000 },
    subType: 'formalize',
    contextTitle: 'Gewinnfunktion',
    contextDescription: 'Der Gewinn G(x) hängt von der Stückzahl x ab. Ein Betriebswirt sagt: „Bei 50 Stück ist der Gewinn am höchsten."',
    question: 'Welcher mathematische Ausdruck beschreibt diese Aussage?',
    options: [
      'G\'(50) = 0 und G\'\'(50) < 0',
      'G(50) = 0',
      'G\'(50) > 0',
      'G\'\'(50) = 0',
    ],
    correctIndex: 0,
    explanation: '„Gewinn am höchsten" bedeutet Maximum. Das Kriterium für ein Maximum ist: G\'(x₀) = 0 (notwendige Bedingung) und G\'\'(x₀) < 0 (hinreichende Bedingung).',
  },
  {
    id: 'sach-f3-02',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'v(t) = t^3 - 9t^2 + 24t', fn: (t) => t**3 - 9*(t**2) + 24*t },
    subType: 'formalize',
    contextTitle: 'Geschwindigkeit eines Fahrzeugs',
    contextDescription: 'Die Geschwindigkeit v(t) eines Fahrzeugs wird aufgezeichnet. Der Fahrlehrer sagt: „Bei t = 3 ändert sich das Beschleunigungsverhalten."',
    question: 'Welcher mathematische Ausdruck beschreibt diese Aussage?',
    options: [
      'v(3) = 0',
      'v\'(3) = 0',
      'v\'\'(3) = 0 mit VZW von v\'\'',
      'v\'(3) = Maximum',
    ],
    correctIndex: 2,
    explanation: '„Änderung des Beschleunigungsverhaltens" bedeutet: Die Beschleunigung (= v\') ändert ihr Verhalten, d.h. die Krümmung von v wechselt. Das ist ein Wendepunkt: v\'\'(3) = 0 mit Vorzeichenwechsel von v\'\'.',
  },
];

// ─── F4: sketch-to-context – Graph mit Markierungen → Kontext interpretieren ───

const f4SketchToContext: ContextInterpretationExercise[] = [
  {
    id: 'sach-f4-01',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'M(t) = -0{,}5t^3 + 6t^2 + 10', fn: (t) => -0.5*(t**3) + 6*(t**2) + 10 },
    subType: 'sketch-to-context',
    contextTitle: 'Mitgliederzahlen eines Vereins',
    contextDescription: 'M(t) beschreibt die Mitgliederzahl eines Sportvereins (t in Jahren seit Gründung). Im Graphen ist ein Wendepunkt bei t = 4 markiert.',
    contextGraph: { latex: 'M(t) = -0{,}5t^3 + 6t^2 + 10', fn: (t) => -0.5*(t**3) + 6*(t**2) + 10 },
    question: 'Was bedeutet der Wendepunkt bei t = 4 im Sachzusammenhang?',
    options: [
      'Nach 4 Jahren hat der Verein die meisten Mitglieder.',
      'Nach 4 Jahren wächst der Verein am schnellsten — danach nimmt das Wachstum ab.',
      'Nach 4 Jahren hat der Verein keine neuen Mitglieder mehr.',
      'Nach 4 Jahren verliert der Verein erstmals Mitglieder.',
    ],
    correctIndex: 1,
    explanation: 'Ein Wendepunkt bedeutet: Die Steigung (= das Wachstum) ist hier maximal. Ab t = 4 steigen die Zahlen zwar weiter, aber immer langsamer. Das ist KEIN Extrempunkt — der Verein wächst weiter, nur nicht mehr so schnell.',
    highlightPoints: [{ x: 4, y: -0.5*64 + 6*16 + 10, label: 'WP' }],
  },
  {
    id: 'sach-f4-02',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K4',
    function: { latex: 'v(t) = -t^2 + 8t', fn: (t) => -(t**2) + 8*t },
    subType: 'sketch-to-context',
    contextTitle: 'Geschwindigkeit eines Fahrzeugs',
    contextDescription: 'v(t) beschreibt die Geschwindigkeit (in m/s) eines Fahrzeugs. Im Graphen ist der Hochpunkt bei t = 4 markiert.',
    contextGraph: { latex: 'v(t) = -t^2 + 8t', fn: (t) => -(t**2) + 8*t },
    question: 'Was bedeutet der Hochpunkt bei t = 4 für die Fahrt?',
    options: [
      'Nach 4 Sekunden beschleunigt das Fahrzeug am stärksten.',
      'Nach 4 Sekunden hat das Fahrzeug die weiteste Strecke zurückgelegt.',
      'Nach 4 Sekunden erreicht das Fahrzeug seine Höchstgeschwindigkeit von 16 m/s.',
      'Nach 4 Sekunden hält das Fahrzeug an.',
    ],
    correctIndex: 2,
    explanation: 'Der Hochpunkt H(4|16) bedeutet: Bei t = 4 ist v maximal = 16 m/s. Das ist die Höchstgeschwindigkeit. Danach wird das Fahrzeug langsamer (v sinkt).',
    highlightPoints: [{ x: 4, y: 16, label: 'H(4|16)' }],
  },
];

// ─── F5: Zuordnungsaufgaben (als MC-interpret/formalize) ───

const f5Match: ContextInterpretationExercise[] = [
  {
    id: 'sach-f5-01',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K3',
    function: { latex: 'K(t) = -t^2 + 10t', fn: (t) => -(t**2) + 10*t },
    subType: 'interpret',
    contextTitle: 'Medikamenten-Konzentration',
    contextDescription: 'K(t) beschreibt die Konzentration eines Medikaments im Blut (t in Stunden, K in mg/l). Es gilt: K\'(t) > 0 für 0 < t < 5.',
    question: 'Was bedeutet K\'(t) > 0 für 0 < t < 5 im Sachzusammenhang?',
    options: [
      'In den ersten 5 Stunden steigt die Konzentration.',
      'In den ersten 5 Stunden ist die Konzentration positiv.',
      'Nach 5 Stunden ist die Konzentration null.',
      'Die Konzentration beträgt in den ersten 5 Stunden mehr als 5 mg/l.',
    ],
    correctIndex: 0,
    explanation: 'K\'(t) > 0 bedeutet, dass K steigt — die Ableitung gibt die Änderungsrate an. Wenn K\' positiv ist, nimmt die Konzentration zu. K\' > 0 sagt nichts über den Wert von K selbst.',
  },
  {
    id: 'sach-f5-02',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K3',
    function: { latex: 'T(t) = -0{,}5t^2 + 7t + 5', fn: (t) => -0.5*(t**2) + 7*t + 5 },
    subType: 'formalize',
    contextTitle: 'Tagestemperatur',
    contextDescription: 'T(t) beschreibt die Temperatur im Tagesverlauf (t in Stunden ab 6 Uhr). Jemand sagt: „Am Nachmittag sinkt die Temperatur."',
    question: 'Welcher Ausdruck beschreibt „die Temperatur sinkt am Nachmittag" (t > 7)?',
    options: [
      'T(t) < 0 für t > 7',
      'T\'(t) < 0 für t > 7',
      'T\'\'(t) < 0 für t > 7',
      'T(t) = 0 für t > 7',
    ],
    correctIndex: 1,
    explanation: '„Sinkt" bedeutet: Die Funktion fällt. Das erkennt man an einer negativen Ableitung: T\'(t) < 0. Nicht verwechseln mit T(t) < 0 (Temperatur wäre negativ) oder T\'\'(t) < 0 (Krümmung).',
  },
];

// ─── F7: interpret – Extremstelle vs. Wendestelle (Trendwende) ───

const f7Trendwende: ContextInterpretationExercise[] = [
  {
    id: 'sach-f7-01',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K3',
    function: { latex: 'M(t) = -0{,}2t^3 + 3t^2 + 50', fn: (t) => -0.2*(t**3) + 3*(t**2) + 50 },
    subType: 'interpret',
    contextTitle: 'Mitgliederzahlen eines Vereins',
    contextDescription: 'Die Mitgliederzahl M(t) eines Vereins wächst seit der Gründung. Ein Vorstandsmitglied sagt: „Die Mitgliederzahlen steigen zwar weiter, aber immer langsamer."',
    question: 'Welcher besondere Punkt liegt hier vor?',
    options: [
      'Hochpunkt (Maximum) — die Mitgliederzahl hat ihren höchsten Wert erreicht.',
      'Tiefpunkt (Minimum) — die Mitgliederzahl ist am niedrigsten.',
      'Wendepunkt — die Wachstumsgeschwindigkeit nimmt ab, aber M steigt noch.',
      'Nullstelle — der Verein hat keine Mitglieder mehr.',
    ],
    correctIndex: 2,
    explanation: '„Steigt weiter, aber langsamer" — Die Funktion steigt noch (kein Extrempunkt!), aber die Steigung nimmt ab. Das ist ein Wendepunkt: M\'\' wechselt das Vorzeichen, die Wachstumsrate geht zurück. Typischer Schülerfehler: Das mit einem Maximum verwechseln.',
  },
  {
    id: 'sach-f7-02',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K3',
    function: { latex: 'h(t) = -t^3 + 12t^2', fn: (t) => -(t**3) + 12*(t**2) },
    subType: 'interpret',
    contextTitle: 'Füllhöhe eines Schwimmbeckens',
    contextDescription: 'Ein Becken wird befüllt. Die Füllhöhe h(t) steigt zunächst immer schneller, dann ab einem gewissen Zeitpunkt immer langsamer, bis das Becken voll ist.',
    question: 'Der Zeitpunkt, ab dem das Wasser langsamer steigt, ist ein ...',
    options: [
      'Hochpunkt — das Becken ist voll.',
      'Wendepunkt — die Füllgeschwindigkeit nimmt ab diesem Moment ab.',
      'Tiefpunkt — der Wasserstand ist am niedrigsten.',
      'Nullstelle — das Becken ist leer.',
    ],
    correctIndex: 1,
    explanation: 'Das Wasser steigt weiter (die Funktion ist nicht am Maximum). Aber die Geschwindigkeit ändert sich: vorher wurde es immer schneller, jetzt wird es langsamer. Das ist genau die Definition eines Wendepunkts — der Punkt, an dem sich das Krümmungsverhalten ändert.',
  },
  {
    id: 'sach-f7-03',
    type: 'context-interpretation',
    module: 'sachkontext',
    competency: 'K3',
    function: { latex: 'G(x) = -x^3 + 15x^2 - 48x', fn: (x) => -(x**3) + 15*(x**2) - 48*x },
    subType: 'interpret',
    contextTitle: 'Gewinnfunktion',
    contextDescription: 'Der Gewinn G(x) eines Unternehmens sinkt zunächst stark, dann immer weniger stark, bis er schließlich wieder steigt.',
    question: 'Der Punkt, ab dem der Gewinn nicht mehr so stark sinkt, ist ein ...',
    options: [
      'Tiefpunkt — der Gewinn ist hier am kleinsten.',
      'Wendepunkt — die Verlustrate ändert sich, aber der Gewinn sinkt noch weiter.',
      'Hochpunkt — der Gewinn ist am größten.',
      'Sattelpunkt — der Gewinn stagniert dauerhaft.',
    ],
    correctIndex: 1,
    explanation: 'Der Gewinn sinkt weiter (also kein Tiefpunkt!), aber die Geschwindigkeit des Sinkens nimmt ab. Das ist ein Wendepunkt: Die Krümmung wechselt. Erst danach kommt der eigentliche Tiefpunkt, wenn der Gewinn nicht mehr sinkt.',
    highlightPoints: [{ x: 5, y: -125 + 375 - 240, label: 'WP' }],
  },
];

export const sachkontextExercises: Exercise[] = [
  ...f1Interpret,
  ...f2ContextToSketch,
  ...f3Formalize,
  ...f4SketchToContext,
  ...f5Match,
  ...f7Trendwende,
];
