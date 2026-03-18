import type { CaseDefinition, ExerciseGenerator } from './types.js';
import type { TrueFalseExercise } from '../types/exercise.js';

// ─── Helpers ───

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return `tf-mono-${Math.random().toString(36).slice(2, 9)}`;
}

function formatPoly(coeffs: number[]): string {
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
    const abs = Math.abs(c);
    if (deg === 0) term += `${abs}`;
    else if (abs === 1) term += deg === 1 ? 'x' : `x^{${deg}}`;
    else term += deg === 1 ? `${abs}x` : `${abs}x^{${deg}}`;
    parts.push(term);
  }
  return parts.length === 0 ? '0' : parts.join('');
}

function evalPoly(coeffs: number[], x: number): number {
  let r = 0;
  for (const c of coeffs) r = r * x + c;
  return r;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findCorrect(options: string[], keyword: string): number {
  return options.findIndex(r => r.includes(keyword));
}

/** Wraps a LaTeX expression in \(...\) delimiters for renderMixedContent */
function m(latex: string): string {
  return `\\(${latex}\\)`;
}

function makeTF(
  partial: Omit<TrueFalseExercise, 'id' | 'type' | 'module' | 'competency'>,
): TrueFalseExercise {
  return { id: uid(), type: 'true-false', module: 'monotonie', competency: 'K1', ...partial };
}

// ─── Case A1: Monotoniesatz — Hinrichtung (WAHR) ───
// f'(x) > 0 auf einem Intervall ⇒ f dort smw
function genA1(): TrueFalseExercise {
  const b = pick([-6, -4, -2, 2, 4, 6]);
  const c = randInt(-3, 3);
  const fCoeffs = [1, b, c];
  const fPrimeCoeffs = [2, b];
  const ns = -b / 2;
  const a1 = ns;
  const b1 = ns + pick([2, 3, 4]);

  const reasons = shuffle([
    `Der Monotoniesatz sagt: ${m("f'(x) > 0")} auf einem Intervall ⇒ f ist dort streng monoton steigend`,
    `Man müsste zusätzlich ${m("f''(x)")} prüfen, um Monotonie nachzuweisen`,
    'Das gilt nur bei Parabeln, nicht bei allgemeinen Funktionen',
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = ${formatPoly(fPrimeCoeffs)}`, fn: x => evalPoly(fPrimeCoeffs, x) } },
    statement: `${m(`f'(x) = ${formatPoly(fPrimeCoeffs)}`)} ist auf ${m(`(${a1};\\ ${b1})`)} positiv. Also ist f dort streng monoton steigend.`,
    correct: true,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'Monotoniesatz'),
    feedbackExplanation:
      `Der Monotoniesatz besagt: Ist ${m("f'(x) > 0")} auf einem offenen Intervall, so ist f dort streng monoton steigend. ` +
      `Hier ist ${m(`f'(x) = ${formatPoly(fPrimeCoeffs)}`)} mit Nullstelle bei ${m(`x = ${ns}`)}. ` +
      `Auf ${m(`(${a1},\\ ${b1})`)} ist ${m("f'(x)")} tatsächlich positiv, also ist f dort smw. Die zweite Ableitung wird dafür NICHT benötigt.`,
    highlightX: Math.round((a1 + b1) / 2),
  });
}

// ─── Case A2: Nichtumkehrbarkeit (FALSCH) ───
function genA2(): TrueFalseExercise {
  const exp = pick([3, 5]);
  const fLatex = exp === 3 ? 'x^{3}' : 'x^{5}';
  const fPrimeLatex = exp === 3 ? '3x^{2}' : '5x^{4}';

  const reasons = shuffle([
    `Die Umkehrung des Monotoniesatzes gilt nicht: f smw bedeutet NICHT, dass ${m("f'(x) > 0")} für alle x`,
    `f ist smw, also muss ${m("f'(x)")} überall positiv sein`,
    `${m("f'(0) = 0")} widerspricht der Monotonie, also ist f doch nicht smw`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${fLatex}`, fn: x => x ** exp },
    derivatives: { first: { latex: `f'(x) = ${fPrimeLatex}`, fn: x => exp * x ** (exp - 1) } },
    statement: `${m(`f(x) = ${fLatex}`)} ist auf ganz ${m("\\mathbb{R}")} streng monoton steigend. Also gilt ${m("f'(x) > 0")} für alle ${m("x \\in \\mathbb{R}")}.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'Umkehrung'),
    feedbackExplanation:
      `${m(`f(x) = ${fLatex}`)} ist tatsächlich auf ganz ℝ streng monoton steigend. ` +
      `Aber ${m(`f'(x) = ${fPrimeLatex}`)}, und ${m("f'(0) = 0")}. Die Ableitung ist also NICHT überall positiv. ` +
      `Die Umkehrung des Monotoniesatzes gilt nicht: Aus „f smw" folgt NICHT „${m("f' > 0")} überall".`,
    highlightX: 0,
  });
}

// ─── Case A3: Waagerechte Tangente schließt smw NICHT aus (FALSCH) ───
function genA3(): TrueFalseExercise {
  const exp = pick([3, 5]);
  const fLatex = exp === 3 ? 'x^{3}' : 'x^{5}';
  const a = pick([1, 2]);

  const reasons = shuffle([
    `f ist auf ganz ℝ streng monoton steigend — eine einzelne Stelle mit ${m("f' = 0")} verhindert das nicht`,
    `Wo die Tangente waagerecht ist, steigt f nicht — also keine strenge Monotonie`,
    `${m("f'(0) = 0")} bedeutet, dass f bei ${m("x = 0")} ein Extremum hat`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${fLatex}`, fn: x => x ** exp },
    derivatives: { first: { latex: `f'(x) = ${exp}x^{${exp - 1}}`, fn: x => exp * x ** (exp - 1) } },
    statement: `${m(`f(x) = ${fLatex}`)} hat bei ${m("x = 0")} eine waagerechte Tangente (${m("f'(0) = 0")}). Also ist f auf ${m(`(-${a},\\ ${a})`)} nicht streng monoton steigend.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'einzelne Stelle'),
    feedbackExplanation:
      `${m(`f(x) = ${fLatex}`)} ist auf ganz ℝ streng monoton steigend: Für ${m("x_1 < x_2")} gilt immer ${m(`x_1^{${exp}} < x_2^{${exp}}`)}. ` +
      `Die waagerechte Tangente bei ${m("x = 0")} ändert daran nichts — eine einzelne Stelle mit ${m("f'(x_0) = 0")} verhindert strenge Monotonie nicht.`,
    highlightX: 0,
  });
}

// ─── Case A4: f' ≥ 0 mit isolierter Nullstelle → TROTZDEM smw (FALSCH) ───
function genA4(): TrueFalseExercise {
  const k = pick([-2, -1, 0, 1, 2]);
  const d = randInt(-3, 3);
  const fCoeffs = [1, -3 * k, 3 * k * k, -k * k * k + d];
  const kStr = k < 0 ? `(${k})` : `${k}`;

  const reasons = shuffle([
    `f ist sogar streng monoton steigend — ${m("f' = 0")} nur an der isolierten Stelle ${m(`x = ${k}`)}, nicht auf einem ganzen Intervall`,
    `Wo ${m("f' = 0")} ist, steigt f nicht, also kann f nicht streng monoton sein`,
    `${m("f' \\geq 0")} bedeutet automatisch streng monoton steigend`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = 3(x - ${kStr})^{2}`, fn: x => 3 * (x - k) ** 2 } },
    statement: `${m(`f'(x) = 3(x - ${k})^2`)} ist überall ${m("\\geq 0")}, aber ${m(`f'(${k}) = 0`)}. Also ist f auf ${m("\\mathbb{R}")} nur monoton steigend, nicht streng monoton steigend.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'isolierten Stelle'),
    feedbackExplanation:
      `f ist auf ganz ℝ streng monoton steigend. Entscheidend: ${m(`f'(x) = 3(x - ${k})^2`)} ist nur an der einzelnen Stelle ${m(`x = ${k}`)} null, ` +
      `nicht auf einem ganzen Intervall. Solange f' nur an isolierten Stellen null wird und sonst positiv ist, bleibt f streng monoton steigend.`,
    highlightX: k,
  });
}

// ─── Case A5: Konstante Funktion — monoton steigend UND fallend (WAHR) ───
function genA5(): TrueFalseExercise {
  const c = randInt(-5, 5);

  const reasons = shuffle([
    `Für ${m("x_1 < x_2")} gilt ${m("f(x_1) \\leq f(x_2)")} und ${m("f(x_1) \\geq f(x_2)")} — beides durch Gleichheit erfüllt`,
    'Eine Funktion kann nicht gleichzeitig steigend und fallend sein',
    'Eine konstante Funktion ist weder steigend noch fallend, sondern „neutral"',
  ]);

  return makeTF({
    function: { latex: `f(x) = ${c}`, fn: () => c },
    statement: `Die konstante Funktion ${m(`f(x) = ${c}`)} ist sowohl monoton steigend als auch monoton fallend.`,
    correct: true,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'Gleichheit'),
    feedbackExplanation:
      `Die Definition verlangt nur ≤ (bzw. ≥), und Gleichheit erfüllt beides. ` +
      `Eine konstante Funktion ist monoton steigend UND monoton fallend — aber NICHT streng monoton. ` +
      `Das zeigt, wie wichtig der Unterschied zwischen ≤ und < ist.`,
  });
}

// ─── Case B1: Endwerte sagen NICHTS über den Verlauf (FALSCH) ───
function genB1(): TrueFalseExercise {
  // f(x) = x³ - kx, muss so gewählt werden dass f(b) im sichtbaren Bereich bleibt
  // k=3: nsPos=1, b=2 → f(2)=2 ✓   k=6: nsPos≈1.4, b=3 → f(3)=9 ✓
  const k = pick([3, 6]);
  const fCoeffs = [1, 0, -k, 0];
  const nsPos = Math.sqrt(k / 3);
  const b = Math.ceil(nsPos) + 1; // nur +1, damit f(b) nicht zu groß wird
  const fa = 0;
  const fb = b ** 3 - k * b;

  if (fb <= fa) return genB1();

  const reasons = shuffle([
    `${m("f(a) < f(b)")} heißt nicht, dass f dazwischen steigt — f könnte zwischendurch fallen und wieder steigen`,
    'Wenn der Endwert größer als der Anfangswert ist, muss f dazwischen gestiegen sein',
    `Man müsste zusätzlich prüfen, ob ${m("f(0) > 0")} gilt`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = ${formatPoly([3, 0, -k])}`, fn: x => evalPoly([3, 0, -k], x) } },
    statement: `${m(`f(0) = ${fa}`)} und ${m(`f(${b}) = ${fb}`)}, also ${m(`f(0) < f(${b})`)}. Daraus folgt: f ist auf ${m(`[0,\\ ${b}]`)} streng monoton steigend.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'dazwischen'),
    feedbackExplanation:
      `${m(`f'(x) = ${formatPoly([3, 0, -k])}`)}. Im Intervall ${m(`[0,\\ ${nsPos.toFixed(1)}]`)} ist ${m("f'(x) < 0")} — f fällt dort erst! ` +
      `Nur weil Start- und Endwert passen, heißt das nicht, dass f dazwischen monoton steigt.`,
  });
}

// ─── Case B2: Doppel-Nullstelle → kein Monotoniewechsel (FALSCH) ───
function genB2(): TrueFalseExercise {
  const p = pick([2, 3, 4]);
  const a = pick([1, 2, 4]);
  // f' in faktorisierter Form zeigen, damit die Doppel-NS sofort erkennbar ist
  const aStr = a === 1 ? '' : `${a}`;
  const factoredLatex = `${aStr}x^2(x - ${p})`;
  const fPrimeFn = (x: number) => a * x * x * (x - p);

  const reasons = shuffle([
    `f' berührt bei ${m("x = 0")} nur die x-Achse (Doppel-Nullstelle) ohne Vorzeichenwechsel — f bleibt fallend`,
    'Jede Nullstelle von f\' bedeutet, dass f die Richtung wechselt',
    `f hat bei ${m("x = 0")} ein Minimum, wechselt also von fallend zu steigend`,
  ]);

  return makeTF({
    function: { latex: `f'(x) = ${factoredLatex}`, fn: fPrimeFn },
    derivatives: { first: { latex: `f'(x) = ${factoredLatex}`, fn: fPrimeFn } },
    statement: `${m(`f'(x) = ${factoredLatex}`)} hat bei ${m("x = 0")} eine Nullstelle. Also ändert f bei ${m("x = 0")} das Monotonieverhalten.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'Doppel-Nullstelle'),
    feedbackExplanation:
      `Bei ${m("x = 0")} hat f' eine Doppel-Nullstelle: ${m(`f'(x) = ${factoredLatex}`)}. ` +
      `Der Faktor ${m("x^2")} ist immer ${m("\\geq 0")} — er wechselt bei ${m("x = 0")} NICHT das Vorzeichen. ` +
      `Links und rechts von ${m("x = 0")} ist f' negativ (kein VZW). ` +
      `Nur bei ${m(`x = ${p}`)} schneidet f' die x-Achse mit VZW von − nach + → dort ändert f die Richtung.`,
    highlightX: 0,
  });
}

// ─── Case B3: Vereinigung smw-Intervalle (WAHR) ───
function genB3(): TrueFalseExercise {
  const k = pick([-2, -1, 0, 1, 2]);
  const d = randInt(-3, 3);
  const fCoeffs = [1, -3 * k, 3 * k * k, -k * k * k + d];
  const kStr = k < 0 ? `(${k})` : `${k}`;

  const reasons = shuffle([
    'Wenn f auf zwei aneinander grenzenden Intervallen streng monoton steigend ist, dann auch auf der Vereinigung',
    `Man müsste zusätzlich prüfen, dass ${m(`f'(${k}) > 0`)} gilt — aber ${m(`f'(${k}) = 0`)}`,
    `Das gilt nur weil ${m(`f(x) = ${formatPoly(fCoeffs)}`)} ein Spezialfall ist`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = 3(x - ${kStr})^{2}`, fn: x => 3 * (x - k) ** 2 } },
    statement: `f ist auf ${m(`(-\\infty,\\ ${k}]`)} streng monoton steigend und auf ${m(`[${k},\\ \\infty)`)} streng monoton steigend. Also ist f auf ganz ${m("\\mathbb{R}")} streng monoton steigend.`,
    correct: true,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'Vereinigung'),
    feedbackExplanation:
      `Streng monoton steigend heißt: ${m("x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)")}. ` +
      `Wenn das auf ${m(`(-\\infty, ${k}]`)} und auf ${m(`[${k}, \\infty)`)} gilt, dann auch auf ganz ℝ. ` +
      `${m(`f'(${k}) = 0`)} ist kein Hindernis — die Tangente ist dort waagerecht, aber f hört nicht auf zu steigen.`,
    highlightX: k,
  });
}

// ─── Case B4: f'(x₀) > 0 bedeutet NICHT "f hat bei x₀ ein Minimum" (FALSCH) ───
function genB4(): TrueFalseExercise {
  // f(x) = x³ - kx → f'(x) = 3x² - k, f'(x₀) > 0 an einer Stelle
  const k = pick([3, 6]);
  const fCoeffs = [1, 0, -k, 0];
  const fPrimeCoeffs = [3, 0, -k];
  const testX = pick([2, 3]);
  const fPrimeAtTest = 3 * testX * testX - k;

  if (fPrimeAtTest <= 0) return genB4();

  const reasons = shuffle([
    `${m("f'(x_0) > 0")} sagt nur, dass f an der Stelle ${m("x_0")} steigt — über Extrema sagt das nichts aus`,
    `Positives Vorzeichen von f' bedeutet, dass f dort ein lokales Minimum hat`,
    `${m("f'(x_0) > 0")} bedeutet, dass f bei ${m("x_0")} von fallend zu steigend wechselt`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = ${formatPoly(fPrimeCoeffs)}`, fn: x => evalPoly(fPrimeCoeffs, x) } },
    statement: `${m(`f'(${testX}) = ${fPrimeAtTest} > 0`)}. Also hat f bei ${m(`x = ${testX}`)} ein lokales Minimum.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'steigt'),
    feedbackExplanation:
      `${m("f'(x_0) > 0")} bedeutet nur: f steigt an der Stelle ${m("x_0")}. ` +
      `Für ein Minimum bräuchte man ${m("f'(x_0) = 0")} plus einen VZW von f' (von − nach +). ` +
      `Hier ist ${m(`f'(${testX}) = ${fPrimeAtTest} > 0`)} — f steigt bei ${m(`x = ${testX}`)}, es liegt kein Extremum vor.`,
    highlightX: testX,
  });
}

// ─── Case C1: Einzelner f'-Wert → NICHT auf ganzes Intervall schließen (FALSCH) ───
function genC1(): TrueFalseExercise {
  const k = pick([3, 6, 12]);
  const fCoeffs = [1, 0, -k, 0];
  const fPrimeCoeffs = [3, 0, -k];
  const nsPos = Math.sqrt(k / 3);
  const testX = Math.ceil(nsPos) + 1;
  const fPrimeAtTest = 3 * testX * testX - k;

  const reasons = shuffle([
    `${m(`f'(${testX}) > 0`)} sagt nur etwas über die Stelle ${m(`x = ${testX}`)} — für Monotonie auf ${m("(0, \\infty)")} müsste f' dort überall positiv sein`,
    'Wenn f\' an einer Stelle positiv ist, steigt f auf dem ganzen Intervall rechts davon',
    `Man müsste ${m("f'(0)")} prüfen, und ${m(`f'(0) = ${-k} < 0`)} — also fällt f bei ${m("x = 0")}`,
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = ${formatPoly(fPrimeCoeffs)}`, fn: x => evalPoly(fPrimeCoeffs, x) } },
    statement: `${m(`f'(${testX}) = ${fPrimeAtTest} > 0`)}. Also ist f auf ${m("(0,\\ \\infty)")} streng monoton steigend.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'nur etwas über die Stelle'),
    feedbackExplanation:
      `${m(`f'(${testX}) > 0`)} sagt nur: f steigt an der Stelle ${m(`x = ${testX}`)}. ` +
      `Für Monotonie auf ${m("(0, \\infty)")} müsste ${m("f'(x) > 0")} für ALLE ${m("x > 0")} gelten. ` +
      `Aber ${m(`f'(1) = ${3 - k} < 0`)} — f fällt also bei ${m("x = 1")}! ` +
      `Der Monotoniesatz verlangt ${m("f' > 0")} auf dem ganzen Intervall, nicht nur an einer Stelle.`,
    highlightX: testX,
  });
}

// ─── Case C2: smw auf kleinem Intervall → NICHT auf größeres (FALSCH) ───
function genC2(): TrueFalseExercise {
  const k = pick([3, 12]);
  const fCoeffs = [1, 0, -k, 0];
  const fPrimeCoeffs = [3, 0, -k];
  const ns = -Math.sqrt(k / 3);
  const nsRound = Math.round(ns);

  const reasons = shuffle([
    'Monotonie auf einem Teilintervall überträgt sich nicht automatisch auf ein größeres — f könnte danach fallen',
    'Wenn f auf einem Intervall steigt, steigt f auch auf jedem größeren Intervall das den Anfang enthält',
    'Monotonie auf einem Teilintervall überträgt sich immer auf das Gesamtintervall',
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = ${formatPoly(fPrimeCoeffs)}`, fn: x => evalPoly(fPrimeCoeffs, x) } },
    statement: `f ist auf ${m(`(-\\infty,\\ ${nsRound})`)} streng monoton steigend. Daraus folgt, dass f auch auf ${m("(-\\infty,\\ 0)")} streng monoton steigend ist.`,
    correct: false,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'nicht automatisch'),
    feedbackExplanation:
      `Monotonie auf einem Teilintervall sagt nichts über ein größeres Intervall aus. ` +
      `f könnte ab ${m(`x = ${nsRound}`)} die Richtung wechseln und auf ${m(`(${nsRound}, 0)`)} fallen. ` +
      `Man muss f' auf dem gesamten Intervall prüfen, nicht nur auf einem Teil.`,
    highlightX: nsRound,
  });
}

// ─── Case C3: f' > 0 auf offenem Intervall → smw auf abgeschlossenem (WAHR) ───
function genC3(): TrueFalseExercise {
  const k = pick([-1, 0, 1, 2, 3]);
  const b = k + pick([2, 3, 4]);
  const d = randInt(-3, 3);
  const fCoeffs = [1, -2 * k, k * k + d];
  const kStr = k < 0 ? `(${k})` : `${k}`;

  const reasons = shuffle([
    `${m("f' > 0")} auf dem offenen Intervall ${m(`(${k}, ${b})`)} reicht für strenge Monotonie auf dem abgeschlossenen ${m(`[${k}, ${b}]`)}`,
    `${m(`f'(${k}) = 0`)}, also ist f bei ${m(`x = ${k}`)} nicht steigend — man bräuchte ${m("f' > 0")} auch an den Rändern`,
    'Das gilt nur bei Parabeln',
  ]);

  return makeTF({
    function: { latex: `f(x) = ${formatPoly(fCoeffs)}`, fn: x => evalPoly(fCoeffs, x) },
    derivatives: { first: { latex: `f'(x) = 2(x - ${kStr})`, fn: x => 2 * (x - k) } },
    statement: `${m(`f'(x) = 2(x - ${k}) > 0`)} für alle ${m(`x \\in (${k},\\ ${b})`)}. Also ist f auf ${m(`[${k},\\ ${b}]`)} streng monoton steigend.`,
    correct: true,
    reasonOptions: reasons,
    correctReasonIndex: findCorrect(reasons, 'offenen Intervall'),
    feedbackExplanation:
      `Für strenge Monotonie auf ${m(`[${k}, ${b}]`)} genügt ${m("f' > 0")} auf dem offenen Intervall ${m(`(${k}, ${b})`)}. ` +
      `Dass ${m(`f'(${k}) = 0`)} am Rand ist, spielt keine Rolle — ` +
      `prüfe die Definition: Für ${m(`${k} \\leq x_1 < x_2 \\leq ${b}`)} gilt ${m("f(x_1) < f(x_2)")}.`,
    highlightX: Math.round((k + b) / 2),
  });
}

// ─── Public API ───

export const TF_MONOTONIE_CASES: CaseDefinition[] = [
  // Didaktische Reihenfolge: Fundament → Kern → Fehlschlüsse → Subtiles
  { id: 'tf-mono-01', label: 'Monotoniesatz anwenden', generate: genA1 },
  { id: 'tf-mono-02', label: 'f\' > 0 ≠ Minimum', generate: genB4 },
  { id: 'tf-mono-03', label: 'Nichtumkehrbarkeit', generate: genA2 },
  { id: 'tf-mono-04', label: 'Waagerechte Tangente ≠ nicht smw', generate: genA3 },
  { id: 'tf-mono-05', label: 'Einzelner Punkt ≠ ganzes Intervall', generate: genC1 },
  { id: 'tf-mono-06', label: 'Endwerte ≠ Monotonie', generate: genB1 },
  { id: 'tf-mono-07', label: 'Doppel-Nullstelle ≠ VZW', generate: genB2 },
  { id: 'tf-mono-08', label: 'Konstante Funktion', generate: genA5 },
  { id: 'tf-mono-09', label: 'Teilintervall ≠ größeres Intervall', generate: genC2 },
  { id: 'tf-mono-10', label: 'Isolierte Nullstelle von f\'', generate: genA4 },
  { id: 'tf-mono-11', label: 'Vereinigung smw-Intervalle', generate: genB3 },
  { id: 'tf-mono-12', label: 'Offenes → abgeschlossenes Intervall', generate: genC3 },
];

export const tfMonotonieGenerator: ExerciseGenerator = {
  generate(): TrueFalseExercise {
    const c = TF_MONOTONIE_CASES[Math.floor(Math.random() * TF_MONOTONIE_CASES.length)];
    return c.generate() as TrueFalseExercise;
  },
};
