// ═══════════════════════════════════════════════════════════════════
// Klausur-Quiz: Frage-Templates
//
// Jedes Template hat eine generate()-Funktion die eine zufällige
// Variante der Frage erzeugt. So entsteht aus ~20 Templates
// quasi-unendliche Vielfalt.
//
// Kategorien:
//   kriterien  — "Was liegt vor?" Bedingungen abrufen
//   verfahren  — "Was ist der nächste Schritt?" Rezepte kennen
//   graph      — "Am Graph von f' ablesen..." Zusammenhänge
//   fallen     — Typische Klausurfallen vermeiden
// ═══════════════════════════════════════════════════════════════════

export type QuizQuestion = McQuestion | FlashcardQuestion;

export interface McQuestion {
  type: 'mc';
  templateId: string;
  category: 'kriterien' | 'verfahren' | 'graph' | 'fallen';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FlashcardQuestion {
  type: 'flashcard';
  templateId: string;
  category: 'kriterien' | 'verfahren' | 'graph' | 'fallen';
  question: string;
  /** The full answer/recipe revealed on tap */
  reveal: string;
}

export interface QuestionTemplate {
  id: string;
  category: QuizQuestion['category'];
  generate(): QuizQuestion;
}

// ── Helpers ──────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Build an MC question with shuffled options */
function buildMc(
  base: { templateId: string; category: McQuestion['category']; question: string; correct: string; wrong: string[]; explanation: string },
): McQuestion {
  const allOptions = [base.correct, ...base.wrong];
  const shuffled = shuffle(allOptions);
  return {
    type: 'mc',
    templateId: base.templateId,
    category: base.category,
    question: base.question,
    options: shuffled,
    correctIndex: shuffled.indexOf(base.correct),
    explanation: base.explanation,
  };
}

/** Build a flashcard question (self-assessment) */
function buildFlashcard(
  base: { templateId: string; category: FlashcardQuestion['category']; question: string; reveal: string },
): FlashcardQuestion {
  return { type: 'flashcard', ...base };
}

// ═══════════════════════════════════════════════════════════════════
// KATEGORIE: Kriterien — Bedingungen abrufen
// ═══════════════════════════════════════════════════════════════════

const critHpTp: QuestionTemplate = {
  id: 'crit-hp-tp',
  category: 'kriterien',
  generate() {
    const isNeg = Math.random() > 0.5;
    const sign = isNeg ? '<' : '>';
    const answer = isNeg ? 'Lokales Maximum (Hochpunkt)' : 'Lokales Minimum (Tiefpunkt)';
    return buildMc({
      templateId: 'crit-hp-tp',
      category: 'kriterien',
      question: `f\u2032(x\u2080) = 0 und f\u2033(x\u2080) ${sign} 0.\nWas hat f bei x\u2080?`,
      correct: answer,
      wrong: [
        isNeg ? 'Lokales Minimum (Tiefpunkt)' : 'Lokales Maximum (Hochpunkt)',
        'Wendestelle',
        'Sattelpunkt',
      ],
      explanation: `f\u2032(x\u2080) = 0 und f\u2033(x\u2080) ${sign} 0 \u2192 ${answer}.\nf\u2032 = 0: mögliche Extremstelle (Kandidat).\nf\u2033 ${sign} 0: bestätigt ${answer}.\nKurzregel: f\u2033 < 0 \u2192 Hochpunkt, f\u2033 > 0 \u2192 Tiefpunkt.`,
    });
  },
};

const critNotwendigExtrem: QuestionTemplate = {
  id: 'crit-notw-ext',
  category: 'kriterien',
  generate() {
    return buildMc({
      templateId: 'crit-notw-ext',
      category: 'kriterien',
      question: 'Was ist die notwendige Bedingung für eine Extremstelle bei x\u2080?',
      correct: 'f\u2032(x\u2080) = 0',
      wrong: ['f\u2033(x\u2080) = 0', 'f(x\u2080) = 0', 'f\u2032\u2032\u2032(x\u2080) = 0'],
      explanation: 'Notwendige Bedingung Extremstelle: f\u2032(x\u2080) = 0.\nDamit findet man alle Kandidaten für Extremstellen.\nAber: f\u2032 = 0 allein garantiert kein Extremum \u2014 es könnte auch ein Sattelpunkt sein (z.B. bei f(x) = x\u00b3).\nDeshalb muss man x\u2080 zusätzlich in f\u2033 einsetzen oder das VZW-Kriterium anwenden.',
    });
  },
};

const critNotwendigWende: QuestionTemplate = {
  id: 'crit-notw-wend',
  category: 'kriterien',
  generate() {
    return buildMc({
      templateId: 'crit-notw-wend',
      category: 'kriterien',
      question: 'Was ist die notwendige Bedingung für eine Wendestelle bei x\u2080?',
      correct: 'f\u2033(x\u2080) = 0',
      wrong: ['f\u2032(x\u2080) = 0', 'f(x\u2080) = 0', 'f\u2032\u2032\u2032(x\u2080) = 0'],
      explanation: 'Notwendige Bedingung Wendestelle: f\u2033(x\u2080) = 0.\nDort könnte die Krümmung wechseln (links \u2194 rechts).\nAber: f\u2033 = 0 allein reicht nicht \u2014 man braucht zusätzlich f\u2032\u2032\u2032(x\u2080) \u2260 0 oder einen VZW von f\u2033.\nNicht verwechseln: Extremstelle \u2192 f\u2032 = 0, Wendestelle \u2192 f\u2033 = 0.',
    });
  },
};

const critHinreichendWende: QuestionTemplate = {
  id: 'crit-hinr-wend',
  category: 'kriterien',
  generate() {
    return buildMc({
      templateId: 'crit-hinr-wend',
      category: 'kriterien',
      question: 'Was ist die hinreichende Bedingung für eine Wendestelle bei x\u2080?',
      correct: 'f\u2033(x\u2080) = 0 und f\u2032\u2032\u2032(x\u2080) \u2260 0',
      wrong: [
        'f\u2032(x\u2080) = 0 und f\u2033(x\u2080) \u2260 0',
        'f\u2033(x\u2080) = 0 und f\u2032(x\u2080) = 0',
        'f\u2033(x\u2080) \u2260 0',
      ],
      explanation: 'Hinreichende Bedingung Wendestelle: f\u2033(x\u2080) = 0 und f\u2032\u2032\u2032(x\u2080) \u2260 0.\nDas stellt sicher, dass f\u2033 bei x\u2080 tatsächlich das Vorzeichen wechselt.\nAlternativ kann man den VZW von f\u2033 direkt prüfen \u2014 das funktioniert auch wenn f\u2032\u2032\u2032(x\u2080) = 0 ist.',
    });
  },
};

const critVzwExtrem: QuestionTemplate = {
  id: 'crit-vzw-ext',
  category: 'kriterien',
  generate() {
    const plusToMinus = Math.random() > 0.5;
    const vzw = plusToMinus ? 'von + nach \u2212' : 'von \u2212 nach +';
    const answer = plusToMinus ? 'Lokales Maximum (Hochpunkt)' : 'Lokales Minimum (Tiefpunkt)';
    const reason = plusToMinus
      ? 'f steigt vorher (f\u2032 > 0) und fällt danach (f\u2032 < 0)'
      : 'f fällt vorher (f\u2032 < 0) und steigt danach (f\u2032 > 0)';
    return buildMc({
      templateId: 'crit-vzw-ext',
      category: 'kriterien',
      question: `f\u2032 hat bei x\u2080 einen Vorzeichenwechsel ${vzw}.\nWas hat f bei x\u2080?`,
      correct: answer,
      wrong: [
        plusToMinus ? 'Lokales Minimum (Tiefpunkt)' : 'Lokales Maximum (Hochpunkt)',
        'Wendestelle',
        'Sattelpunkt',
      ],
      explanation: `VZW von f\u2032 ${vzw}: ${reason}.\nAlso: ${answer}.\nDas VZW-Kriterium ist die Alternative zum Einsetzen in f\u2033. Es funktioniert immer \u2014 auch wenn f\u2033(x\u2080) = 0 ist.`,
    });
  },
};

const critMonotonie: QuestionTemplate = {
  id: 'crit-mono',
  category: 'kriterien',
  generate() {
    const positive = Math.random() > 0.5;
    const sign = positive ? '>' : '<';
    const answer = positive ? 'f ist streng monoton wachsend' : 'f ist streng monoton fallend';
    return buildMc({
      templateId: 'crit-mono',
      category: 'kriterien',
      question: `f\u2032(x) ${sign} 0 für alle x in einem Intervall.\nWas gilt für f in diesem Intervall?`,
      correct: answer,
      wrong: [
        positive ? 'f ist streng monoton fallend' : 'f ist streng monoton wachsend',
        positive ? 'f ist linksgekrümmt' : 'f ist rechtsgekrümmt',
        'f hat dort eine Extremstelle',
      ],
      explanation: `f\u2032(x) ${sign} 0 \u2192 ${answer}.\nf\u2032 gibt die Steigung an. ${positive ? 'Positive' : 'Negative'} Steigung = Graph geht ${positive ? 'bergauf' : 'bergab'}.\nNicht verwechseln: f\u2032 \u2192 Steigung/Monotonie, f\u2033 \u2192 Krümmung.`,
    });
  },
};

const critKruemmung: QuestionTemplate = {
  id: 'crit-kruemm',
  category: 'kriterien',
  generate() {
    const positive = Math.random() > 0.5;
    const sign = positive ? '>' : '<';
    const answer = positive
      ? 'Linksgekrümmt (nach oben offen)'
      : 'Rechtsgekrümmt (nach unten offen)';
    return buildMc({
      templateId: 'crit-kruemm',
      category: 'kriterien',
      question: `f\u2033(x) ${sign} 0 in einem Intervall.\nWie ist der Graph dort gekrümmt?`,
      correct: answer,
      wrong: [
        positive
          ? 'Rechtsgekrümmt (nach unten offen)'
          : 'Linksgekrümmt (nach oben offen)',
        'Der Graph steigt',
        'Keine Krümmung',
      ],
      explanation: `f\u2033(x) ${sign} 0 \u2192 ${answer}.\nf\u2033 gibt an, wie sich die Steigung verändert. ${positive ? 'f\u2033 > 0: Steigung nimmt zu \u2192 Graph krümmt sich nach oben' : 'f\u2033 < 0: Steigung nimmt ab \u2192 Graph krümmt sich nach unten'}.\nNicht verwechseln: f\u2032 \u2192 Steigung/Monotonie, f\u2033 \u2192 Krümmung.`,
    });
  },
};

const critSattelpunkt: QuestionTemplate = {
  id: 'crit-sattel',
  category: 'kriterien',
  generate() {
    return buildMc({
      templateId: 'crit-sattel',
      category: 'kriterien',
      question: 'f\u2032(x\u2080) = 0, aber f\u2032 hat bei x\u2080 keinen Vorzeichenwechsel.\nWas liegt bei x\u2080 vor?',
      correct: 'Sattelpunkt \u2014 waagerechte Tangente, aber kein Extremum',
      wrong: [
        'Lokales Maximum',
        'Lokales Minimum',
        'Wendestelle ohne waagerechte Tangente',
      ],
      explanation: 'f\u2032(x\u2080) = 0 ohne VZW \u2192 Sattelpunkt.\nDie Tangente ist waagerecht, aber f wechselt nicht von steigend zu fallend (oder umgekehrt). Die Funktion geht in dieselbe Richtung weiter.\nBeispiel: f(x) = x\u00b3 bei x = 0.',
    });
  },
};

const critHinreichendExtrem: QuestionTemplate = {
  id: 'crit-hinr-ext',
  category: 'kriterien',
  generate() {
    const isMax = Math.random() > 0.5;
    const type = isMax ? 'lokales Maximum (Hochpunkt)' : 'lokales Minimum (Tiefpunkt)';
    const sign = isMax ? '< 0' : '> 0';
    const answer = `f\u2032(x\u2080) = 0 und f\u2033(x\u2080) ${sign}`;
    return buildMc({
      templateId: 'crit-hinr-ext',
      category: 'kriterien',
      question: `Was ist die hinreichende Bedingung für ein ${type} bei x\u2080?`,
      correct: answer,
      wrong: [
        `f\u2032(x\u2080) = 0 und f\u2033(x\u2080) ${isMax ? '> 0' : '< 0'}`,
        'f\u2032(x\u2080) = 0',
        `f\u2033(x\u2080) = 0 und f\u2032\u2032\u2032(x\u2080) ${sign}`,
      ],
      explanation: `Hinreichende Bedingung ${type}: f\u2032(x\u2080) = 0 und f\u2033(x\u2080) ${sign}.\nf\u2032 = 0: mögliche Extremstelle (Kandidat).\nf\u2033 ${sign}: bestätigt ${type}.\nOhne x\u2080 in f\u2033 einzusetzen weiß man nicht, ob HP, TP oder Sattelpunkt.\nKurzregel: f\u2033 < 0 \u2192 Hochpunkt, f\u2033 > 0 \u2192 Tiefpunkt.`,
    });
  },
};

const critVzwWende: QuestionTemplate = {
  id: 'crit-vzw-wend',
  category: 'kriterien',
  generate() {
    const plusToMinus = Math.random() > 0.5;
    const vzw = plusToMinus ? 'von + nach \u2212' : 'von \u2212 nach +';
    const kruemmung = plusToMinus
      ? 'Linkskurve \u2192 Rechtskurve'
      : 'Rechtskurve \u2192 Linkskurve';
    return buildMc({
      templateId: 'crit-vzw-wend',
      category: 'kriterien',
      question: `f\u2033 hat bei x\u2080 einen Vorzeichenwechsel ${vzw}.\nWas hat f bei x\u2080?`,
      correct: `Eine Wendestelle \u2014 Krümmungswechsel (${kruemmung})`,
      wrong: [
        'Ein lokales Maximum',
        'Ein lokales Minimum',
        'Einen Sattelpunkt',
      ],
      explanation: `VZW von f\u2033 ${vzw} \u2192 Wendestelle (${kruemmung}).\nDie Krümmungsrichtung ändert sich bei x\u2080. Das ist die Definition einer Wendestelle.\nNicht verwechseln: VZW von f\u2032 \u2192 Extremstelle, VZW von f\u2033 \u2192 Wendestelle.`,
    });
  },
};

const critVerhaltenUnendlich: QuestionTemplate = {
  id: 'crit-unendlich',
  category: 'kriterien',
  generate() {
    const variants = [
      {
        question: 'f(x) = 2x\u00b3 \u2212 5x + 1.\nWie verhält sich f für x \u2192 +\u221e und x \u2192 \u2212\u221e?',
        correct: 'f \u2192 +\u221e für x \u2192 +\u221e, f \u2192 \u2212\u221e für x \u2192 \u2212\u221e',
        wrong: [
          'f \u2192 +\u221e für x \u2192 \u00b1\u221e',
          'f \u2192 \u2212\u221e für x \u2192 +\u221e, f \u2192 +\u221e für x \u2192 \u2212\u221e',
          'f \u2192 0 für x \u2192 \u00b1\u221e',
        ],
        explanation: 'Höchster Term: 2x\u00b3. Ungerade Potenz, positiver Koeffizient:\n\u2022 x \u2192 +\u221e: f \u2192 +\u221e\n\u2022 x \u2192 \u2212\u221e: f \u2192 \u2212\u221e\n\nRegel: Bei ungeradem Grad gehen die Enden in verschiedene Richtungen.',
      },
      {
        question: 'f(x) = \u2212x\u2074 + 3x\u00b2.\nWie verhält sich f für x \u2192 \u00b1\u221e?',
        correct: 'f \u2192 \u2212\u221e für x \u2192 +\u221e und x \u2192 \u2212\u221e',
        wrong: [
          'f \u2192 +\u221e für x \u2192 \u00b1\u221e',
          'f \u2192 +\u221e für x \u2192 +\u221e, f \u2192 \u2212\u221e für x \u2192 \u2212\u221e',
          'f \u2192 0 für x \u2192 \u00b1\u221e',
        ],
        explanation: 'Höchster Term: \u2212x\u2074. Gerade Potenz, negativer Koeffizient:\n\u2022 x \u2192 \u00b1\u221e: f \u2192 \u2212\u221e\n\nRegel: Bei geradem Grad gehen beide Enden in die gleiche Richtung. Negatives Vorzeichen \u2192 nach unten.',
      },
      {
        question: 'f(x) = x\u2074 \u2212 2x\u00b2 + 1.\nWie verhält sich f für x \u2192 \u00b1\u221e?',
        correct: 'f \u2192 +\u221e für x \u2192 +\u221e und x \u2192 \u2212\u221e',
        wrong: [
          'f \u2192 \u2212\u221e für x \u2192 \u00b1\u221e',
          'f \u2192 +\u221e für x \u2192 +\u221e, f \u2192 \u2212\u221e für x \u2192 \u2212\u221e',
          'f \u2192 1 für x \u2192 \u00b1\u221e',
        ],
        explanation: 'Höchster Term: x\u2074. Gerade Potenz, positiver Koeffizient:\n\u2022 x \u2192 \u00b1\u221e: f \u2192 +\u221e\n\nRegel: Bei geradem Grad gehen beide Enden in die gleiche Richtung. Positives Vorzeichen \u2192 nach oben.',
      },
    ];
    const v = pick(variants);
    return buildMc({
      templateId: 'crit-unendlich',
      category: 'kriterien',
      question: v.question,
      correct: v.correct,
      wrong: v.wrong,
      explanation: v.explanation,
    });
  },
};

const critSymmetrie: QuestionTemplate = {
  id: 'crit-symmetrie',
  category: 'kriterien',
  generate() {
    const variants = [
      {
        question: 'f(x) = x\u2074 \u2212 3x\u00b2 + 2.\nWelche Symmetrie hat der Graph?',
        correct: 'Achsensymmetrisch zur y-Achse \u2014 nur gerade Exponenten',
        wrong: [
          'Punktsymmetrisch zum Ursprung',
          'Keine Symmetrie',
          'Achsensymmetrisch zur x-Achse',
        ],
        explanation: 'x\u2074, x\u00b2 und die Konstante 2 (= 2\u00b7x\u2070) \u2014 alles gerade Exponenten.\nRegel: Nur gerade Exponenten \u2192 achsensymmetrisch zur y-Achse (f(\u2212x) = f(x)).',
      },
      {
        question: 'f(x) = x\u00b3 \u2212 4x.\nWelche Symmetrie hat der Graph?',
        correct: 'Punktsymmetrisch zum Ursprung \u2014 nur ungerade Exponenten',
        wrong: [
          'Achsensymmetrisch zur y-Achse',
          'Keine Symmetrie',
          'Achsensymmetrisch zur x-Achse',
        ],
        explanation: 'x\u00b3 und x (= x\u00b9) \u2014 alles ungerade Exponenten.\nRegel: Nur ungerade Exponenten \u2192 punktsymmetrisch zum Ursprung (f(\u2212x) = \u2212f(x)).',
      },
      {
        question: 'f(x) = x\u00b3 + x\u00b2.\nWelche Symmetrie hat der Graph?',
        correct: 'Keine Symmetrie \u2014 gemischte gerade und ungerade Exponenten',
        wrong: [
          'Achsensymmetrisch zur y-Achse',
          'Punktsymmetrisch zum Ursprung',
          'Achsensymmetrisch zur x-Achse',
        ],
        explanation: 'x\u00b3 (ungerade) und x\u00b2 (gerade) \u2014 gemischte Exponenten.\nRegel: Gemischte Exponenten \u2192 keine Symmetrie.',
      },
    ];
    const v = pick(variants);
    return buildMc({
      templateId: 'crit-symmetrie',
      category: 'kriterien',
      question: v.question,
      correct: v.correct,
      wrong: v.wrong,
      explanation: v.explanation,
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// KATEGORIE: Verfahren — Flashcards (Selbsteinschätzung)
//
// Schüler sieht die Frage, denkt nach, deckt die Antwort auf,
// und bewertet sich selbst: "Wusste ich" / "Wusste ich nicht".
// ═══════════════════════════════════════════════════════════════════

const procExtrem: QuestionTemplate = {
  id: 'proc-extrem',
  category: 'verfahren',
  generate: () => buildFlashcard({
    templateId: 'proc-extrem',
    category: 'verfahren',
    question: 'Wie bestimmst du die Extremstellen einer Funktion f?',
    reveal:
      '1.  f\u2032(x) bilden\n' +
      '2.  f\u2032(x) = 0 setzen und nach x auflösen\n' +
      '3.  f\u2033(x) bilden\n' +
      '4.  Kandidaten in f\u2033 einsetzen:\n' +
      '       f\u2033(x\u2080) < 0 \u2192 Hochpunkt\n' +
      '       f\u2033(x\u2080) > 0 \u2192 Tiefpunkt\n' +
      '5.  y-Wert berechnen: f(x\u2080)',
  }),
};

const procWende: QuestionTemplate = {
  id: 'proc-wende',
  category: 'verfahren',
  generate: () => buildFlashcard({
    templateId: 'proc-wende',
    category: 'verfahren',
    question: 'Wie bestimmst du die Wendestellen einer Funktion f?',
    reveal:
      '1.  f\u2033(x) bilden\n' +
      '2.  f\u2033(x) = 0 setzen und nach x auflösen\n' +
      '3.  f\u2032\u2032\u2032(x) bilden\n' +
      '4.  Kandidaten in f\u2032\u2032\u2032 einsetzen:\n' +
      '       f\u2032\u2032\u2032(x\u2080) \u2260 0 \u2192 Wendestelle\n' +
      '5.  y-Wert berechnen: f(x\u2080)',
  }),
};

const procMono: QuestionTemplate = {
  id: 'proc-mono',
  category: 'verfahren',
  generate: () => buildFlashcard({
    templateId: 'proc-mono',
    category: 'verfahren',
    question: 'Wie untersuchst du eine Funktion f auf Monotonie?',
    reveal:
      '1.  f\u2032(x) bilden\n' +
      '2.  f\u2032(x) = 0 setzen \u2192 Nullstellen\n' +
      '3.  Vorzeichen von f\u2032 in den Intervallen prüfen (Testwerte einsetzen)\n' +
      '4.  Ablesen:\n' +
      '       f\u2032 > 0 \u2192 f steigt\n' +
      '       f\u2032 < 0 \u2192 f fällt',
  }),
};

const procFZZVersagt: QuestionTemplate = {
  id: 'proc-fzz-versagt',
  category: 'verfahren',
  generate: () => buildFlashcard({
    templateId: 'proc-fzz-versagt',
    category: 'verfahren',
    question: 'f\u2032(x\u2080) = 0 und f\u2033(x\u2080) = 0.\nf\u2033(x\u2080) = 0 liefert keine Aussage. Was machst du?',
    reveal:
      'VZW-Kriterium von f\u2032 anwenden:\n\n' +
      'Vorzeichen von f\u2032 links und rechts von x\u2080 prüfen (Testwerte einsetzen).\n' +
      '\u2022 f\u2032 wechselt + \u2192 \u2212 : Hochpunkt\n' +
      '\u2022 f\u2032 wechselt \u2212 \u2192 + : Tiefpunkt\n' +
      '\u2022 kein VZW: Sattelpunkt',
  }),
};

const procWelchesVerfahren: QuestionTemplate = {
  id: 'proc-welches',
  category: 'verfahren',
  generate() {
    const tasks = [
      {
        aufgabe: 'Bestimme die lokalen Extremstellen von f.',
        answer: 'f\u2032(x) = 0 lösen, dann Kandidaten in f\u2033 einsetzen',
        firstStep: 'f\u2032(x) bilden',
      },
      {
        aufgabe: 'Bestimme die Wendepunkte von f.',
        answer: 'f\u2033(x) = 0 lösen, dann Kandidaten in f\u2032\u2032\u2032 einsetzen',
        firstStep: 'f\u2033(x) bilden',
      },
      {
        aufgabe: 'Untersuche f auf Monotonie.',
        answer: 'f\u2032(x) bilden, Nullstellen, Vorzeichen in den Intervallen prüfen',
        firstStep: 'f\u2032(x) bilden',
      },
      {
        aufgabe: 'Bestimme die Intervalle, in denen f linksgekrümmt ist.',
        answer: 'f\u2033(x) bilden, Nullstellen, Vorzeichen prüfen',
        firstStep: 'f\u2033(x) bilden',
      },
    ];
    const task = pick(tasks);
    const wrongPool = tasks.filter(t => t !== task).map(t => t.answer);
    return buildMc({
      templateId: 'proc-welches',
      category: 'verfahren',
      question: `Die Aufgabe lautet:\n\u201e${task.aufgabe}\u201c\n\nWelches Verfahren brauchst du?`,
      correct: task.answer,
      wrong: shuffle(wrongPool).slice(0, 3),
      explanation: `Bei \u201e${task.aufgabe}\u201c brauchst du: ${task.answer}.\nErster Schritt: ${task.firstStep}.`,
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// KATEGORIE: Graph von f' ablesen
// ═══════════════════════════════════════════════════════════════════

const graphFStrichLage: QuestionTemplate = {
  id: 'graph-fstrich-lage',
  category: 'graph',
  generate() {
    const above = Math.random() > 0.5;
    const position = above ? 'oberhalb' : 'unterhalb';
    const answer = above ? 'f ist dort streng monoton wachsend' : 'f ist dort streng monoton fallend';
    return buildMc({
      templateId: 'graph-fstrich-lage',
      category: 'graph',
      question: `Der Graph von f\u2032 liegt in einem Intervall vollständig ${position} der x-Achse.\nWas gilt für f in diesem Intervall?`,
      correct: answer,
      wrong: [
        above ? 'f ist dort streng monoton fallend' : 'f ist dort streng monoton wachsend',
        'f hat dort eine Extremstelle',
        above ? 'f ist dort linksgekrümmt' : 'f ist dort rechtsgekrümmt',
      ],
      explanation: `Graph von f\u2032 ${position} der x-Achse \u2192 f\u2032 ${above ? '> 0' : '< 0'} \u2192 ${answer}.\nWas f\u2032 über der x-Achse macht, sagt dir, ob f steigt oder fällt.\nf\u2032 oberhalb \u2192 f steigt. f\u2032 unterhalb \u2192 f fällt.`,
    });
  },
};

const graphFStrichNullstelle: QuestionTemplate = {
  id: 'graph-fstrich-null',
  category: 'graph',
  generate() {
    const withVzw = Math.random() > 0.3; // 70% mit VZW (häufiger in Klausur)
    if (withVzw) {
      const plusToMinus = Math.random() > 0.5;
      const vzw = plusToMinus ? 'von oben nach unten' : 'von unten nach oben';
      const answer = plusToMinus
        ? 'f hat dort ein lokales Maximum (Hochpunkt)'
        : 'f hat dort ein lokales Minimum (Tiefpunkt)';
      return buildMc({
        templateId: 'graph-fstrich-null',
        category: 'graph',
        question: `Der Graph von f\u2032 schneidet die x-Achse bei x\u2080 ${vzw}.\nWas hat f bei x\u2080?`,
        correct: answer,
        wrong: [
          plusToMinus
            ? 'f hat dort ein lokales Minimum (Tiefpunkt)'
            : 'f hat dort ein lokales Maximum (Hochpunkt)',
          'f hat dort eine Wendestelle',
          'f hat dort eine Nullstelle',
        ],
        explanation: `f\u2032 schneidet die x-Achse ${vzw} = f\u2032 hat einen VZW ${plusToMinus ? 'von + nach \u2212' : 'von \u2212 nach +'}.\nVZW von f\u2032 bedeutet immer: Extremstelle von f.\n${plusToMinus ? '+ nach \u2212: f wechselt von steigend zu fallend \u2192 Hochpunkt.' : '\u2212 nach +: f wechselt von fallend zu steigend \u2192 Tiefpunkt.'}`,
      });
    }
    return buildMc({
      templateId: 'graph-fstrich-null',
      category: 'graph',
      question: 'Der Graph von f\u2032 berührt die x-Achse bei x\u2080, schneidet sie aber nicht (kein VZW).\nWas hat f bei x\u2080?',
      correct: 'Einen Sattelpunkt \u2014 waagerechte Tangente, aber kein Extremum',
      wrong: [
        'Ein lokales Maximum',
        'Ein lokales Minimum',
        'Eine Wendestelle',
      ],
      explanation: 'f\u2032 berührt die x-Achse, aber wechselt nicht die Seite \u2192 kein VZW \u2192 kein Extremum.\nf hat dort eine waagerechte Tangente, geht aber in dieselbe Richtung weiter \u2192 Sattelpunkt.\nBeispiel: f(x) = x\u00b3 bei x = 0.',
    });
  },
};

const graphFStrichExtremum: QuestionTemplate = {
  id: 'graph-fstrich-extr',
  category: 'graph',
  generate() {
    return buildMc({
      templateId: 'graph-fstrich-extr',
      category: 'graph',
      question: 'Der Graph von f\u2032 hat bei x\u2080 ein lokales Extremum.\nWas hat f bei x\u2080?',
      correct: 'Eine Wendestelle',
      wrong: [
        'Eine Extremstelle',
        'Einen Sattelpunkt',
        'Eine Nullstelle',
      ],
      explanation: 'Extremum von f\u2032 bei x\u2080 \u2192 f\u2033(x\u2080) = 0 mit VZW \u2192 Wendestelle von f.\nLogik: Wenn f\u2032 ein Extremum hat, wechselt f\u2033 das Vorzeichen \u2014 und VZW von f\u2033 bedeutet Wendestelle.\nKurzregel: Extremstelle von f\u2032 = Wendestelle von f.',
    });
  },
};

const graphFStrichSteigt: QuestionTemplate = {
  id: 'graph-fstrich-steigt',
  category: 'graph',
  generate() {
    const steigt = Math.random() > 0.5;
    const answer = steigt
      ? 'f ist dort linksgekrümmt (nach oben offen)'
      : 'f ist dort rechtsgekrümmt (nach unten offen)';
    return buildMc({
      templateId: 'graph-fstrich-steigt',
      category: 'graph',
      question: `Der Graph von f\u2032 ${steigt ? 'steigt' : 'fällt'} in einem Intervall.\nWas gilt für f in diesem Intervall?`,
      correct: answer,
      wrong: [
        steigt
          ? 'f ist dort rechtsgekrümmt (nach unten offen)'
          : 'f ist dort linksgekrümmt (nach oben offen)',
        steigt ? 'f ist dort monoton wachsend' : 'f ist dort monoton fallend',
        'f hat dort eine Wendestelle',
      ],
      explanation: `f\u2032 ${steigt ? 'steigt' : 'fällt'} \u2192 f\u2033 ${steigt ? '> 0' : '< 0'} \u2192 ${answer}.\nDas Steigungsverhalten von f\u2032 verrät die Krümmung von f:\n\u2022 f\u2032 steigt \u2192 f ist linksgekrümmt (nach oben offen)\n\u2022 f\u2032 fällt \u2192 f ist rechtsgekrümmt (nach unten offen)\nAchtung: Ob f\u2032 steigt oder fällt ist etwas anderes als ob f\u2032 positiv oder negativ ist. Positiv/negativ \u2192 Monotonie von f.`,
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// KATEGORIE: Typische Fallen
// ═══════════════════════════════════════════════════════════════════

const falleNotwendigNichtHinreichend: QuestionTemplate = {
  id: 'falle-notw-hinr',
  category: 'fallen',
  generate() {
    const isExtrem = Math.random() > 0.5;
    if (isExtrem) {
      return buildMc({
        templateId: 'falle-notw-hinr',
        category: 'fallen',
        question: 'f\u2032(x\u2080) = 0. Kann man sicher sagen, dass f bei x\u2080 eine Extremstelle hat?',
        correct: 'Nein \u2014 f\u2032 = 0 ist nur notwendig, nicht hinreichend. Es könnte ein Sattelpunkt sein.',
        wrong: [
          'Ja \u2014 f\u2032 = 0 reicht für eine Extremstelle',
          'Ja \u2014 waagerechte Tangente bedeutet immer Extremum',
          'Nein \u2014 man braucht zusätzlich f(x\u2080) = 0',
        ],
        explanation: 'f\u2032(x\u2080) = 0 ist nur notwendig, nicht hinreichend.\nGegenbeispiel: f(x) = x\u00b3 hat f\u2032(0) = 0, aber x = 0 ist ein Sattelpunkt, kein Extremum.\nFür den Nachweis braucht man zusätzlich: f\u2033(x\u2080) \u2260 0 oder VZW von f\u2032.',
      });
    }
    return buildMc({
      templateId: 'falle-notw-hinr',
      category: 'fallen',
      question: 'f\u2033(x\u2080) = 0. Kann man sicher sagen, dass f bei x\u2080 eine Wendestelle hat?',
      correct: 'Nein \u2014 f\u2033 = 0 ist nur notwendig. Man braucht zusätzlich f\u2032\u2032\u2032(x\u2080) \u2260 0 oder VZW von f\u2033.',
      wrong: [
        'Ja \u2014 f\u2033 = 0 reicht für eine Wendestelle',
        'Ja \u2014 Krümmung null bedeutet immer Wendestelle',
        'Nein \u2014 man braucht zusätzlich f\u2032(x\u2080) = 0',
      ],
      explanation: 'f\u2033(x\u2080) = 0 ist nur notwendig, nicht hinreichend.\nGegenbeispiel: f(x) = x\u2074 hat f\u2033(0) = 0, aber keine Wendestelle \u2014 f\u2033(x) = 12x\u00b2 ist links und rechts von 0 positiv, kein VZW.\nFür den Nachweis braucht man zusätzlich: f\u2032\u2032\u2032(x\u2080) \u2260 0 oder VZW von f\u2033.',
    });
  },
};

const falleFStrichZweiNull: QuestionTemplate = {
  id: 'falle-fzz-null',
  category: 'fallen',
  generate() {
    return buildMc({
      templateId: 'falle-fzz-null',
      category: 'fallen',
      question: 'f\u2032(x\u2080) = 0 und f\u2033(x\u2080) = 0.\nWas kannst du sagen?',
      correct: 'Keine sichere Aussage \u2014 f\u2033(x\u2080) = 0 liefert keine Aussage. Man muss den VZW von f\u2032 prüfen.',
      wrong: [
        'Es liegt ein Sattelpunkt vor',
        'Es liegt ein Hochpunkt vor',
        'Es liegt eine Wendestelle vor',
      ],
      explanation: 'f\u2032(x\u2080) = 0 und f\u2033(x\u2080) = 0: f\u2033(x\u2080) = 0 liefert keine Aussage über die Art.\nIn diesem Fall muss man auf das VZW-Kriterium von f\u2032 ausweichen: Testwerte links und rechts von x\u2080 in f\u2032 einsetzen und prüfen, ob sich das Vorzeichen ändert.\nVZW vorhanden \u2192 Extremum. Kein VZW \u2192 Sattelpunkt.',
    });
  },
};

const falleWendeUndSattel: QuestionTemplate = {
  id: 'falle-wende-sattel',
  category: 'fallen',
  generate() {
    return buildMc({
      templateId: 'falle-wende-sattel',
      category: 'fallen',
      question: 'Kann eine Wendestelle gleichzeitig ein Sattelpunkt sein?',
      correct: 'Ja \u2014 z.\u202FB. bei f(x) = x\u00b3: bei x = 0 ist f\u2032 = 0 (Sattelpunkt) und f\u2033 hat VZW (Wendestelle)',
      wrong: [
        'Nein \u2014 Wendestellen und Sattelpunkte schließen sich gegenseitig aus',
        'Nur bei Funktionen geraden Grades',
        'Ja, aber nur wenn f\u2032\u2032\u2032(x\u2080) = 0',
      ],
      explanation: 'Ja \u2014 bei f(x) = x\u00b3 ist x = 0 beides gleichzeitig:\n\u2022 Sattelpunkt: f\u2032(0) = 0, aber f\u2032 wechselt das Vorzeichen nicht (bleibt \u2265 0)\n\u2022 Wendestelle: f\u2033(0) = 0 und f\u2033 hat einen VZW (Krümmungswechsel)\nSattelpunkt und Wendestelle sind verschiedene Eigenschaften, die sich nicht ausschließen.',
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// Alle Templates exportieren
// ═══════════════════════════════════════════════════════════════════

export const ALL_TEMPLATES: QuestionTemplate[] = [
  // Kriterien (12)
  critHpTp,
  critNotwendigExtrem,
  critNotwendigWende,
  critHinreichendExtrem,
  critHinreichendWende,
  critVzwExtrem,
  critVzwWende,
  critMonotonie,
  critKruemmung,
  critSattelpunkt,
  critVerhaltenUnendlich,
  critSymmetrie,
  // Verfahren — Flashcards (4) + MC (1)
  procExtrem,
  procWende,
  procMono,
  procFZZVersagt,
  procWelchesVerfahren,
  // Graph ablesen (4)
  graphFStrichLage,
  graphFStrichNullstelle,
  graphFStrichExtremum,
  graphFStrichSteigt,
  // Fallen (3)
  falleNotwendigNichtHinreichend,
  falleFStrichZweiNull,
  falleWendeUndSattel,
];

export const TEMPLATE_IDS = ALL_TEMPLATES.map(t => t.id);
