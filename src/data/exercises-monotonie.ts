import type { TrueFalseExercise, ReverseInferenceExercise } from '../types/exercise.js';
import type { Exercise } from '../types/exercise.js';


// identify-points Aufgaben: vom Generator erzeugt (src/generators/gen-monotonie-intervals.ts)


// ─── Schlussfolgerungs-Trainer: Logische Aussagen \u00fcber Monotonie bewerten ───
// Jede Aufgabe testet eine andere logische Struktur — kein Pattern-Matching möglich.
// Bildungsplan BW (21): „den Monotoniesatz erläutern und dessen Nichtumkehrbarkeit begründen"

const trueFalseExercises: TrueFalseExercise[] = [

  // ── Kategorie A: Nichtumkehrbarkeit des Monotoniesatzes (5 Aufgaben) ──

  {
    // A1: Hinrichtung — der Monotoniesatz in korrekter Richtung
    id: 'mono-tf-01',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^2 - 2x', fn: (x) => x ** 2 - 2 * x },
    statement: "Es gilt f'(x) = 2x − 2. Für alle x > 1 ist f'(x) > 0. Also ist f auf (1, ∞) streng monoton steigend.",
    correct: true,
    reasonOptions: [
      "Korrekt: Der Monotoniesatz sagt genau das — f'(x) > 0 auf einem Intervall bedeutet, dass f dort streng monoton steigend ist",
      "Falsch: Man müsste zusätzlich f''(x) prüfen, um Monotonie nachzuweisen",
      "Korrekt, aber nur weil f eine Parabel ist — bei anderen Funktionen gilt das nicht",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Richtig! Das ist eine direkte Anwendung des Monotoniesatzes: f'(x) > 0 für alle x in einem Intervall ⟹ f ist dort streng monoton steigend. Die zweite Ableitung wird dafür NICHT benötigt.",
    highlightX: 2,
  },
  {
    // A2: Rückrichtung — die Umkehrung des Monotoniesatzes gilt NICHT
    id: 'mono-tf-02',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3', fn: (x) => x ** 3 },
    statement: "f(x) = x\u00b3 ist auf ganz \u211d streng monoton steigend. Also gilt f'(x) > 0 f\u00fcr alle x \u2208 \u211d.",
    correct: false,
    reasonOptions: [
      "Falsch: Die Umkehrung des Monotoniesatzes gilt nicht — f'(0) = 0, aber f ist trotzdem streng monoton steigend",
      "Richtig: Streng monoton steigend bedeutet per Definition, dass f' überall positiv ist",
      "Falsch: f'(x) = 3x² ist nie negativ, also muss f' > 0 für alle x gelten",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Die Umkehrung des Monotoniesatzes gilt NICHT! Der Satz sagt: f' > 0 ⟹ f streng monoton steigend. Daraus folgt NICHT: f streng monoton steigend ⟹ f' > 0. Gegenbeispiel: f(x) = x³ ist streng monoton steigend (x₁ < x₂ ⟹ x₁³ < x₂³), aber f'(0) = 3·0² = 0.",
    highlightX: 0,
  },
  {
    // A3: Waagerechte Tangente schließt strenge Monotonie NICHT aus
    id: 'mono-tf-03',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^5', fn: (x) => x ** 5 },
    statement: "f(x) = x\u2075 hat bei x = 0 eine waagerechte Tangente (f'(0) = 0). Also ist f auf (\u22121, 1) nicht streng monoton steigend.",
    correct: false,
    reasonOptions: [
      "Falsch: f ist auf ganz ℝ streng monoton steigend — eine einzelne Stelle mit f' = 0 verhindert das nicht",
      "Richtig: Wo die Tangente waagerecht ist, steigt f nicht — also keine strenge Monotonie",
      "Falsch: f'(0) = 0 bedeutet, dass f bei x = 0 ein Extremum hat",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Falsch! f(x) = x⁵ ist auf ganz ℝ streng monoton steigend: Für x₁ < x₂ gilt immer x₁⁵ < x₂⁵. Die waagerechte Tangente bei x = 0 ändert daran nichts — eine einzelne Stelle mit f'(x₀) = 0 verhindert strenge Monotonie nicht.",
    highlightX: 0,
  },
  {
    // A4: f' ≥ 0 mit isolierter Nullstelle → trotzdem STRENG monoton
    id: 'mono-tf-04',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3 - 3x^2 + 3x', fn: (x) => x ** 3 - 3 * x ** 2 + 3 * x },
    statement: "f'(x) = 3(x \u2212 1)\u00b2 ist \u00fcberall \u2265 0, aber f'(1) = 0. Also ist f auf \u211d nur monoton steigend, nicht streng monoton steigend.",
    correct: false,
    reasonOptions: [
      "Falsch: f ist sogar streng monoton steigend — f' = 0 nur an der isolierten Stelle x = 1, nicht auf einem ganzen Intervall",
      "Richtig: Wo f' = 0 ist, steigt f nicht, also kann f nicht streng monoton sein",
      "Falsch: f' ≥ 0 bedeutet automatisch streng monoton steigend",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Falsch! f ist auf ganz ℝ streng monoton steigend. Entscheidend: f'(x) = 3(x−1)² ist nur an der einzelnen Stelle x = 1 null, nicht auf einem ganzen Intervall. Solange f' nur an isolierten Stellen null wird und sonst positiv ist, bleibt f streng monoton steigend.",
    highlightX: 1,
  },
  {
    // A5: Konstante Funktion — monoton steigend UND fallend (Definition!)
    id: 'mono-tf-05',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = 3', fn: () => 3 },
    statement: "Die konstante Funktion f(x) = 3 ist sowohl monoton steigend als auch monoton fallend.",
    correct: true,
    reasonOptions: [
      "Richtig: Für x₁ < x₂ gilt f(x₁) ≤ f(x₂) und f(x₁) ≥ f(x₂) — beides durch Gleichheit erfüllt",
      "Falsch: Eine Funktion kann nicht gleichzeitig steigend und fallend sein",
      "Richtig: f'(x) = 0, und 0 ist sowohl ≥ 0 als auch ≤ 0",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Richtig! Die Definition verlangt nur ≤ (bzw. ≥), und Gleichheit erfüllt beides. Eine konstante Funktion ist monoton steigend UND monoton fallend — aber NICHT streng monoton. Das zeigt, wie wichtig der Unterschied zwischen ≤ und < ist.",
  },

  // ── Kategorie B: Typische Fehlschlüsse (4 Aufgaben) ──

  {
    // B1: Endwerte sagen NICHTS über den Verlauf dazwischen
    id: 'mono-tf-06',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3 - 6x', fn: (x) => x ** 3 - 6 * x },
    statement: "f(0) = 0 und f(3) = 9, also f(0) < f(3). Daraus folgt: f ist auf [0, 3] streng monoton steigend.",
    correct: false,
    reasonOptions: [
      "Falsch: f(a) < f(b) heißt nicht, dass f dazwischen steigt — f könnte zwischendurch fallen und wieder steigen",
      "Richtig: Wenn der Endwert größer als der Anfangswert ist, muss f dazwischen gestiegen sein",
      "Falsch: Man müsste zusätzlich prüfen, ob f(0) > 0 gilt",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: 'Falsch! f\u2019(x) = 3x\u00b2 \u2212 6. Im Intervall [0, \u221a2] ist f\u2019(x) < 0 \u2014 f f\u00e4llt dort erst! f(0) = 0, f(\u221a2) \u2248 \u22125,66, dann steigt f wieder auf f(3) = 9. Nur weil Start- und Endwert passen, hei\u00dft das nicht, dass f dazwischen monoton steigt.',
    highlightX: 1.41,
  },
  {
    // B2: Nullstelle von f' bedeutet NICHT automatisch Monotoniewechsel (Doppel-NS)
    id: 'mono-tf-07',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^4 - 4x^3', fn: (x) => x ** 4 - 4 * x ** 3 },
    statement: "f'(x) = 4x\u00b2(x \u2212 3) hat bei x = 0 eine Nullstelle. Also \u00e4ndert f bei x = 0 das Monotonieverhalten.",
    correct: false,
    reasonOptions: [
      "Falsch: f' berührt bei x = 0 nur die x-Achse (Doppel-Nullstelle) ohne Vorzeichenwechsel — f bleibt fallend",
      "Richtig: Jede Nullstelle von f' bedeutet, dass f die Richtung wechselt",
      "Falsch: f hat bei x = 0 ein Minimum, wechselt also von fallend zu steigend",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Falsch! Bei x = 0 hat f' eine Doppel-Nullstelle: f'(x) = 4x²(x−3). Links und rechts von x = 0 ist f' negativ (f'(−1) = −16, f'(1) = −8). Kein Vorzeichenwechsel → kein Monotoniewechsel. Nur bei x = 3 schneidet f' die x-Achse mit VZW von − nach + → dort ändert f die Richtung.",
    highlightX: 0,
  },
  {
    // B3: Vereinigung angrenzender smw-Intervalle funktioniert (überrascht Schüler)
    id: 'mono-tf-08',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3 - 3x^2 + 3x', fn: (x) => x ** 3 - 3 * x ** 2 + 3 * x },
    statement: "f ist auf (\u2212\u221e, 1] streng monoton steigend und auf [1, \u221e) streng monoton steigend. Also ist f auf ganz \u211d streng monoton steigend.",
    correct: true,
    reasonOptions: [
      "Richtig: Wenn f auf zwei aneinander grenzenden Intervallen streng monoton steigend ist, dann auch auf der Vereinigung",
      "Falsch: Man müsste zusätzlich prüfen, dass f'(1) > 0 gilt — aber f'(1) = 0",
      "Richtig, aber nur weil f(x) = x³ − 3x² + 3x ein Spezialfall ist",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Richtig! Streng monoton steigend heißt: x₁ < x₂ ⟹ f(x₁) < f(x₂). Wenn das auf (−∞, 1] und auf [1, ∞) gilt, dann auch auf ganz ℝ. Dafür ist f'(1) = 0 kein Hindernis — f'(1) = 0 sagt nur, dass die Tangente dort waagerecht ist, nicht dass f aufhört zu steigen.",
    highlightX: 1,
  },
  {
    // B4: Einzelne Randstelle mit f'=0 verhindert strenge Monotonie NICHT
    id: 'mono-tf-09',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^2', fn: (x) => x ** 2 },
    statement: "f'(x) = 2x ist auf (0, 3) positiv, aber f'(0) = 0. Also ist f auf [0, 3] nicht streng monoton steigend.",
    correct: false,
    reasonOptions: [
      "Falsch: f ist auf [0, 3] streng monoton steigend — für 0 ≤ x₁ < x₂ ≤ 3 gilt immer x₁² < x₂²",
      "Richtig: Da f'(0) = 0, ist f an der Stelle x = 0 nicht steigend, also insgesamt nicht streng monoton",
      "Falsch: f'(0) = 0 bedeutet, dass f bei x = 0 ein Minimum hat, aber trotzdem streng monoton fällt",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Falsch! Prüfe die Definition direkt: Für 0 ≤ x₁ < x₂ ≤ 3 gilt x₁² < x₂² — also ist f streng monoton steigend auf [0, 3]. Dass f'(0) = 0 ist, bedeutet nur, dass die Tangente dort waagerecht ist — die Funktion steigt trotzdem sofort danach weiter.",
    highlightX: 0,
  },

  // ── Kategorie C: Punkt vs. Intervall (3 Aufgaben) ──

  {
    // C1: Von einem einzelnen f'-Wert kann man NICHT auf ein großes Intervall schließen
    id: 'mono-tf-10',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3 - 12x', fn: (x) => x ** 3 - 12 * x },
    statement: "f'(3) = 3\u00b79 \u2212 12 = 15 > 0. Also ist f auf (0, \u221e) streng monoton steigend.",
    correct: false,
    reasonOptions: [
      "Falsch: f'(3) > 0 sagt nur etwas über die Stelle x = 3 — für Monotonie auf (0, ∞) müsste f' dort überall positiv sein",
      "Richtig: Wenn f' an einer Stelle positiv ist, steigt f auf dem ganzen Intervall rechts davon",
      "Falsch: Man müsste f'(0) prüfen, und f'(0) = −12 < 0 — also fällt f bei x = 0",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Falsch! f'(3) > 0 sagt nur: f steigt an der Stelle x = 3. Für Monotonie auf (0, ∞) müsste f'(x) > 0 für ALLE x > 0 gelten. Aber f'(1) = 3 − 12 = −9 < 0 — f fällt also bei x = 1! Der Monotoniesatz verlangt f' > 0 auf dem ganzen Intervall, nicht nur an einer Stelle.",
    highlightX: 3,
  },
  {
    // C2: smw auf einem Intervall gilt nicht automatisch auf einem größeren
    id: 'mono-tf-11',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^3 - 3x', fn: (x) => x ** 3 - 3 * x },
    statement: "f ist auf (−∞, −1) streng monoton steigend. Daraus folgt, dass f auch auf (−∞, 0) streng monoton steigend ist.",
    correct: false,
    reasonOptions: [
      "Falsch: f ist auf (−∞, −1) steigend, aber auf (−1, 0) fallend — das größere Intervall enthält einen Bereich, in dem f fällt",
      "Richtig: Wenn f auf (−∞, −1) steigt, dann steigt f auch weiter bis x = 0",
      "Falsch: f hat bei x = −1 eine Wendestelle, deshalb gilt die Aussage nicht",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Falsch! f'(x) = 3x² − 3. Auf (−∞, −1) ist f' > 0 (f steigt), aber auf (−1, 0) ist f' < 0 (f fällt). Bei x = −1 hat f einen Hochpunkt. Man darf Monotonie-Aussagen nicht einfach auf größere Intervalle übertragen — man muss f' auf dem gesamten Intervall prüfen.",
    highlightX: -1,
  },
  {
    // C3: f' > 0 auf offenem Intervall → smw auf dem abgeschlossenen (korrekt!)
    id: 'mono-tf-12',
    type: 'true-false',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f(x) = x^2 - 4x + 5', fn: (x) => x ** 2 - 4 * x + 5 },
    statement: "f'(x) = 2x − 4 > 0 für alle x ∈ (2, 5). Also ist f auf [2, 5] streng monoton steigend.",
    correct: true,
    reasonOptions: [
      "Richtig: f' > 0 auf dem offenen Intervall (2, 5) reicht für strenge Monotonie auf dem abgeschlossenen [2, 5]",
      "Falsch: f'(2) = 0, also ist f bei x = 2 nicht steigend — man bräuchte f' > 0 auch an den Rändern",
      "Richtig, aber nur weil f eine Parabel ist",
    ],
    correctReasonIndex: 0,
    feedbackExplanation: "Richtig! Für strenge Monotonie auf [2, 5] genügt f' > 0 auf dem offenen Intervall (2, 5). Dass f'(2) = 0 ist, spielt keine Rolle — prüfe die Definition: Für 2 ≤ x₁ < x₂ ≤ 5 gilt f(x₁) < f(x₂). Das einzelne f'(2) = 0 am Rand ändert daran nichts.",
    highlightX: 3,
  },
];

const reverseExercises: ReverseInferenceExercise[] = [
  {
    id: 'mono-rev-01',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = 2x - 2', fn: (x) => 2*x - 2 },
    derivatives: { first: { latex: 'f\'(x) = 2x - 2', fn: (x) => 2*x - 2 } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchem Bereich ist f streng monoton wachsend?',
    targets: [{ x: 1, type: 'Grenze', reason: 'Hier schneidet f\' die x-Achse. Rechts davon liegt f\' über der x-Achse → f steigt.' }],
    feedbackExplanation: 'Am Graph von f\' siehst du: Rechts von x = 1 liegt die Gerade oberhalb der x-Achse — dort ist f\' positiv, also steigt f. Links von x = 1 liegt f\' unterhalb → f fällt dort.',
  },
  {
    id: 'mono-rev-02',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = -2x + 4', fn: (x) => -2*x + 4 },
    derivatives: { first: { latex: 'f\'(x) = -2x + 4', fn: (x) => -2*x + 4 } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchem Bereich ist f streng monoton wachsend?',
    targets: [{ x: 2, type: 'Grenze', reason: 'f\' schneidet die x-Achse bei x = 2. Links davon ist f\' positiv → f steigt.' }],
    feedbackExplanation: 'Am Graph von f\' siehst du: Links von x = 2 liegt die Gerade oberhalb der x-Achse — dort ist f\' positiv, also steigt f.',
  },
  {
    id: 'mono-rev-03',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = 2x - 6', fn: (x) => 2*x - 6 },
    derivatives: { first: { latex: 'f\'(x) = 2x - 6', fn: (x) => 2*x - 6 } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchem Bereich ist f streng monoton fallend?',
    targets: [{ x: 3, type: 'Grenze', reason: 'f\' schneidet die x-Achse bei x = 3. Links davon ist f\' negativ → f fällt.' }],
    feedbackExplanation: 'Am Graph von f\' siehst du: Links von x = 3 liegt die Gerade unterhalb der x-Achse — dort ist f\' negativ, also fällt f.',
  },
  {
    id: 'mono-rev-04',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = 3x² - 12', fn: (x) => 3*x**2 - 12 },
    derivatives: { first: { latex: 'f\'(x) = 3x² - 12', fn: (x) => 3*x**2 - 12 } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchen Bereichen ist f streng monoton wachsend?',
    targets: [
      { x: -2, type: 'Grenze', reason: 'f\' schneidet die x-Achse bei x = −2. Links davon ist f\' > 0 → f steigt.' },
      { x: 2, type: 'Grenze', reason: 'f\' schneidet bei x = 2. Rechts davon ist f\' > 0 → f steigt.' },
    ],
    feedbackExplanation: 'Am Graph von f\' siehst du: Die Parabel liegt oberhalb der x-Achse für x < −2 und x > 2 — in diesen Bereichen steigt f.',
  },
  {
    id: 'mono-rev-05',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = 3x² - 6x', fn: (x) => 3*x**2 - 6*x },
    derivatives: { first: { latex: 'f\'(x) = 3x² - 6x', fn: (x) => 3*x**2 - 6*x } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchen Bereichen ist f streng monoton wachsend?',
    targets: [
      { x: 0, type: 'Grenze', reason: 'f\' = 0 bei x = 0, links davon f\' > 0 → f steigt.' },
      { x: 2, type: 'Grenze', reason: 'f\' = 0 bei x = 2, rechts davon f\' > 0 → f steigt.' },
    ],
    feedbackExplanation: 'Am Graph von f\' siehst du: Die Parabel liegt oberhalb der x-Achse für x < 0 und x > 2 — dort steigt f.',
  },
  {
    id: 'mono-rev-06',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = -3x² + 3', fn: (x) => -3*x**2 + 3 },
    derivatives: { first: { latex: 'f\'(x) = -3x² + 3', fn: (x) => -3*x**2 + 3 } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchem Bereich ist f streng monoton wachsend?',
    targets: [
      { x: -1, type: 'Grenze', reason: 'f\' = 0 bei x = −1.' },
      { x: 1, type: 'Grenze', reason: 'f\' = 0 bei x = 1. Zwischen −1 und 1 ist f\' > 0 → f steigt.' },
    ],
    feedbackExplanation: 'Am Graph von f\' siehst du: Die nach unten offene Parabel liegt zwischen x = −1 und x = 1 oberhalb der x-Achse — nur dort steigt f.',
  },
  {
    id: 'mono-rev-07',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = 4x³ - 4x', fn: (x) => 4*x**3 - 4*x },
    derivatives: { first: { latex: 'f\'(x) = 4x³ - 4x', fn: (x) => 4*x**3 - 4*x } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchen Bereichen ist f streng monoton wachsend?',
    targets: [
      { x: -1, type: 'Grenze', reason: 'f\' = 0 bei x = −1. Links: f\' < 0, rechts (bis 0): f\' > 0.' },
      { x: 0, type: 'Grenze', reason: 'f\' = 0 bei x = 0.' },
      { x: 1, type: 'Grenze', reason: 'f\' = 0 bei x = 1. Rechts davon f\' > 0.' },
    ],
    feedbackExplanation: 'Am Graph von f\' siehst du drei Nullstellen bei x = −1, 0 und 1. f steigt dort, wo f\' oberhalb der x-Achse liegt: zwischen −1 und 0 sowie rechts von 1.',
  },
  {
    id: 'mono-rev-08',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = -4x³ + 16x', fn: (x) => -4*x**3 + 16*x },
    derivatives: { first: { latex: 'f\'(x) = -4x³ + 16x', fn: (x) => -4*x**3 + 16*x } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchen Bereichen steigt f?',
    targets: [
      { x: -2, type: 'Grenze', reason: 'f\' = 0 bei x = −2.' },
      { x: 0, type: 'Grenze', reason: 'f\' = 0 bei x = 0.' },
      { x: 2, type: 'Grenze', reason: 'f\' = 0 bei x = 2.' },
    ],
    feedbackExplanation: 'Am Graph von f\' siehst du drei Nullstellen bei x = −2, 0 und 2. f steigt, wo f\' positiv ist: für x < −2 und zwischen x = 0 und x = 2.',
  },
  {
    id: 'mono-rev-09',
    type: 'reverse-inference',
    module: 'monotonie',
    competency: 'K1',
    function: { latex: 'f\'(x) = 4x²(x - 3)', fn: (x) => 4*x**2*(x - 3) },
    derivatives: { first: { latex: 'f\'(x) = 4x²(x - 3)', fn: (x) => 4*x**2*(x - 3) } },
    givenGraph: "f'",
    prompt: 'Der Graph zeigt f\'. In welchem Bereich ist f streng monoton wachsend?',
    targets: [{ x: 3, type: 'Grenze', reason: 'f\' = 0 bei x = 3. Rechts davon ist f\' > 0 → f steigt. Bei x = 0 berührt f\' nur die x-Achse (kein VZW).' }],
    feedbackExplanation: 'Am Graph von f\' siehst du: f\' berührt die x-Achse bei x = 0, wechselt dort aber NICHT das Vorzeichen — f ändert dort nicht die Richtung (Sattelpunkt). Erst bei x = 3 schneidet f\' die x-Achse mit VZW von − nach + → rechts von 3 steigt f.',
  },
];

export const monotoneExercises: Exercise[] = [
  ...trueFalseExercises,
  ...reverseExercises,
];
