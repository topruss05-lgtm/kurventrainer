import { navigate } from '../router.js';

interface Rule {
  title: string;
  items: string[];
}

interface Section {
  heading: string;
  rules: Rule[];
}

const SECTIONS: Section[] = [
  {
    heading: 'Monotonie',
    rules: [
      {
        title: 'Streng monoton wachsend',
        items: ['f\'(x) > 0 für alle x im Intervall'],
      },
      {
        title: 'Streng monoton fallend',
        items: ['f\'(x) < 0 für alle x im Intervall'],
      },
    ],
  },
  {
    heading: 'Lokale Extremstellen',
    rules: [
      {
        title: 'Notwendige Bedingung',
        items: ['f\'(x\u2080) = 0'],
      },
      {
        title: 'Lokales Maximum (hinreichend)',
        items: [
          'f\'(x\u2080) = 0 und f\'\'(x\u2080) < 0',
          'oder: f\'(x\u2080) = 0 und Vorzeichenwechsel von f\' von + nach \u2212',
        ],
      },
      {
        title: 'Lokales Minimum (hinreichend)',
        items: [
          'f\'(x\u2080) = 0 und f\'\'(x\u2080) > 0',
          'oder: f\'(x\u2080) = 0 und Vorzeichenwechsel von f\' von \u2212 nach +',
        ],
      },
      {
        title: 'Sattelpunkt (kein Extremum)',
        items: [
          'f\'(x\u2080) = 0, aber kein Vorzeichenwechsel von f\'',
          'Beispiel: f(x) = x\u00B3 bei x = 0',
        ],
      },
    ],
  },
  {
    heading: 'Wendestellen & Krümmung',
    rules: [
      {
        title: 'Notwendige Bedingung für Wendestelle',
        items: ['f\'\'(x\u2080) = 0'],
      },
      {
        title: 'Hinreichende Bedingung für Wendestelle',
        items: [
          'f\'\'(x\u2080) = 0 und f\'\'\'(x\u2080) \u2260 0',
          'oder: f\'\'(x\u2080) = 0 und Vorzeichenwechsel von f\'\'',
        ],
      },
      {
        title: 'Linkskurve (konvex)',
        items: ['f\'\'(x) > 0 im Intervall \u2014 Graph krümmt sich nach oben'],
      },
      {
        title: 'Rechtskurve (konkav)',
        items: ['f\'\'(x) < 0 im Intervall \u2014 Graph krümmt sich nach unten'],
      },
    ],
  },
  {
    heading: 'Zusammenhänge f \u2194 f\' \u2194 f\'\'',
    rules: [
      {
        title: 'Nullstelle von f\' \u2192 Extremstelle von f',
        items: ['Wo f\' die x-Achse schneidet (mit VZW), hat f eine Extremstelle'],
      },
      {
        title: 'Extremstelle von f\' \u2192 Wendestelle von f',
        items: ['Wo f\' ein Extremum hat, hat f eine Wendestelle'],
      },
      {
        title: 'Nullstelle von f\'\' \u2192 Wendestelle von f',
        items: ['Wo f\'\' die x-Achse schneidet (mit VZW), hat f eine Wendestelle'],
      },
      {
        title: 'f\' > 0 \u2192 f steigt',
        items: ['Wo der Graph von f\' oberhalb der x-Achse liegt, steigt f'],
      },
      {
        title: 'f\'\' > 0 \u2192 f\' steigt \u2192 f ist linksgekrümmt',
        items: ['Wo f\'\' positiv ist, steigt f\' und f krümmt sich nach oben'],
      },
    ],
  },
];

export function renderCheatsheet(container: HTMLElement): (() => void) | null {
  const backBtn = document.createElement('button');
  backBtn.className = 'back-link mb-4';
  backBtn.textContent = '\u2190 Zurück zur Übersicht';
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  const h1 = document.createElement('h1');
  h1.className = 'text-2xl font-bold mb-6';
  h1.textContent = 'Das Wichtigste';

  const hint = document.createElement('p');
  hint.className = 'text-sm p-3 mb-6 rounded-lg border';
  hint.style.color = 'var(--color-accent-dark)';
  hint.style.backgroundColor = 'var(--color-accent-light)';
  hint.style.borderColor = 'var(--color-accent)';
  hint.textContent = 'Hier findest du alle wichtigen Regeln kompakt zusammengefasst — ideal zum Wiederholen vor der KA.';

  container.append(backBtn, h1, hint);

  SECTIONS.forEach((section, sIndex) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'mb-6 animate-slide-up';
    sectionEl.style.animationDelay = `${sIndex * 60}ms`;

    const heading = document.createElement('h2');
    heading.className = 'text-lg font-semibold mb-3 pb-2 border-b';
    heading.style.color = 'var(--color-primary)';
    heading.style.borderColor = 'var(--color-border)';
    heading.textContent = section.heading;
    sectionEl.appendChild(heading);

    for (const rule of section.rules) {
      const ruleEl = document.createElement('div');
      ruleEl.className = 'card mb-2';
      ruleEl.style.padding = '1rem';

      const title = document.createElement('h3');
      title.className = 'font-medium mb-2 text-base';
      title.textContent = rule.title;

      const list = document.createElement('ul');
      list.className = 'text-sm space-y-1';
      list.style.color = 'var(--color-ink-secondary)';
      for (const item of rule.items) {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.textContent = `\u2022 ${item}`;
        list.appendChild(li);
      }

      ruleEl.append(title, list);
      sectionEl.appendChild(ruleEl);
    }

    container.appendChild(sectionEl);
  });

  return null;
}
