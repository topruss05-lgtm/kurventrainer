import { navigate } from '../router.js';
import { createBoard, destroyBoard } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';

interface Rule {
  title: string;
  items: string[];
}

interface Section {
  heading: string;
  rules: Rule[];
  graph?: (container: HTMLElement) => JXG.Board;
}

// ---------- Graph builders for each section ----------

function buildMonotonieGraph(container: HTMLElement): JXG.Board {
  const f = (x: number) => x**3 - 3*x;
  const board = createBoard(container, { boundingBox: [-3.5, 4, 3.5, -4] });
  plotFunction(board, f);

  // Thick colored overlay where f is increasing (green) / decreasing (red)
  const steps = 100;
  const greenRegions: [number, number][] = [[-3.5, -1], [1, 3.5]];
  const redRegion: [number, number] = [-1, 1];

  for (const [a, b] of greenRegions) {
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = a + (b - a) * i / steps;
      xs.push(x); ys.push(f(x));
    }
    board.create('curve', [xs, ys], {
      strokeWidth: 6, strokeColor: '#2d8a4e', strokeOpacity: 0.25,
      highlight: false, hasInfobox: false,
    });
  }

  {
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = redRegion[0] + (redRegion[1] - redRegion[0]) * i / steps;
      xs.push(x); ys.push(f(x));
    }
    board.create('curve', [xs, ys], {
      strokeWidth: 6, strokeColor: '#c4582a', strokeOpacity: 0.25,
      highlight: false, hasInfobox: false,
    });
  }

  highlightPoint(board, -1, 2, '#2d8a4e', "f' = 0");
  highlightPoint(board, 1, -2, '#c4582a', "f' = 0");

  board.create('text', [-3.2, 3.4, 'f steigt'], {
    fontSize: 13, color: '#2d8a4e', fixed: true, highlight: false,
  });
  board.create('text', [-0.6, 3.4, 'f f\u00e4llt'], {
    fontSize: 13, color: '#c4582a', fixed: true, highlight: false,
  });

  return board;
}

function buildExtremstellenGraph(container: HTMLElement): JXG.Board {
  const f = (x: number) => x**3 - 3*x;
  const board = createBoard(container, { boundingBox: [-3.5, 4.5, 3.5, -4.5] });
  plotFunction(board, f);

  // Horizontal tangent lines at extrema
  board.create('line', [[-1, 2], [0, 2]], {
    straightFirst: true, straightLast: true,
    strokeColor: COLORS.secondary, strokeWidth: 1.5, dash: 2,
    highlight: false, hasInfobox: false,
    point1: { visible: false }, point2: { visible: false },
  });
  board.create('line', [[1, -2], [2, -2]], {
    straightFirst: true, straightLast: true,
    strokeColor: COLORS.secondary, strokeWidth: 1.5, dash: 2,
    highlight: false, hasInfobox: false,
    point1: { visible: false }, point2: { visible: false },
  });

  highlightPoint(board, -1, 2, '#c4582a', 'HP (\u22121|2)');
  highlightPoint(board, 1, -2, '#0d7377', 'TP (1|\u22122)');

  // Direction arrows
  board.create('text', [-2.8, -0.5, '\u2197'], { fontSize: 18, color: '#2d8a4e', fixed: true, highlight: false });
  board.create('text', [-0.15, 0.5, '\u2198'], { fontSize: 18, color: '#c4582a', fixed: true, highlight: false });
  board.create('text', [2.1, -0.5, '\u2197'], { fontSize: 18, color: '#2d8a4e', fixed: true, highlight: false });

  return board;
}

function buildWendestellenGraph(container: HTMLElement): JXG.Board {
  const f = (x: number) => x**3 - 3*x**2 + 2;
  const board = createBoard(container, { boundingBox: [-1.5, 4, 3.5, -3] });
  plotFunction(board, f);

  highlightPoint(board, 1, 0, COLORS.tertiary, 'WP (1|0)');

  // Wendetangente: f'(1) = 3 - 6 = -3, tangent: y = -3(x - 1) + 0
  board.create('functiongraph', [(x: number) => -3 * (x - 1)], {
    strokeColor: COLORS.tertiary, strokeWidth: 1.5, dash: 3,
    highlight: false, hasInfobox: false,
  });

  board.create('text', [-0.8, 2.5, '\u2322 Rechtskurve'], {
    fontSize: 12, color: COLORS.secondary, fixed: true, highlight: false,
  });
  board.create('text', [1.8, -2, '\u2323 Linkskurve'], {
    fontSize: 12, color: COLORS.primary, fixed: true, highlight: false,
  });

  return board;
}

function buildZusammenhangGraph(container: HTMLElement): JXG.Board {
  const f = (x: number) => x**3 - 3*x;
  const f1 = (x: number) => 3*x**2 - 3;
  const f2 = (x: number) => 6*x;
  const board = createBoard(container, { boundingBox: [-3.5, 10, 3.5, -10] });

  plotFunction(board, f, undefined, 0);  // teal
  plotFunction(board, f1, undefined, 1); // terracotta
  plotFunction(board, f2, undefined, 2); // purple

  // Vertical dashed lines at critical x-values
  for (const xv of [-1, 0, 1]) {
    board.create('line', [[xv, -100], [xv, 100]], {
      straightFirst: false, straightLast: false,
      strokeColor: '#8888a4', strokeWidth: 1, dash: 3,
      highlight: false, hasInfobox: false,
      point1: { visible: false }, point2: { visible: false },
    });
  }

  board.create('text', [-2.5, -7.5, "f' = 0 \u2192 Extr."], {
    fontSize: 11, color: COLORS.secondary, fixed: true, highlight: false,
  });
  board.create('text', [1.0, -7.5, "f' = 0 \u2192 Extr."], {
    fontSize: 11, color: COLORS.secondary, fixed: true, highlight: false,
  });
  board.create('text', [0.15, 8.5, "f'' = 0 \u2192 WP"], {
    fontSize: 11, color: COLORS.tertiary, fixed: true, highlight: false,
  });

  // Legend
  board.create('text', [2.0, 9, 'f'], { fontSize: 13, color: COLORS.primary, fixed: true, highlight: false });
  board.create('text', [2.5, 9, "f'"], { fontSize: 13, color: COLORS.secondary, fixed: true, highlight: false });
  board.create('text', [3.0, 9, "f''"], { fontSize: 13, color: COLORS.tertiary, fixed: true, highlight: false });

  return board;
}

// ---------- Section data ----------

const SECTIONS: Section[] = [
  {
    heading: 'Monotonie',
    rules: [
      {
        title: 'Streng monoton wachsend',
        items: ["f'(x) > 0 f\u00fcr alle x im Intervall"],
      },
      {
        title: 'Streng monoton fallend',
        items: ["f'(x) < 0 f\u00fcr alle x im Intervall"],
      },
    ],
    graph: buildMonotonieGraph,
  },
  {
    heading: 'Lokale Extremstellen',
    rules: [
      {
        title: 'Notwendige Bedingung',
        items: ["f'(x\u2080) = 0"],
      },
      {
        title: 'Lokales Maximum (hinreichend)',
        items: [
          "f'(x\u2080) = 0 und f''(x\u2080) < 0",
          "oder: f'(x\u2080) = 0 und Vorzeichenwechsel von f' von + nach \u2212",
        ],
      },
      {
        title: 'Lokales Minimum (hinreichend)',
        items: [
          "f'(x\u2080) = 0 und f''(x\u2080) > 0",
          "oder: f'(x\u2080) = 0 und Vorzeichenwechsel von f' von \u2212 nach +",
        ],
      },
      {
        title: 'Sattelpunkt (kein Extremum)',
        items: [
          "f'(x\u2080) = 0, aber kein Vorzeichenwechsel von f'",
          "Beispiel: f(x) = x\u00B3 bei x = 0",
        ],
      },
    ],
    graph: buildExtremstellenGraph,
  },
  {
    heading: 'Wendestellen & Kr\u00fcmmung',
    rules: [
      {
        title: 'Notwendige Bedingung f\u00fcr Wendestelle',
        items: ["f''(x\u2080) = 0"],
      },
      {
        title: 'Hinreichende Bedingung f\u00fcr Wendestelle',
        items: [
          "f''(x\u2080) = 0 und f'''(x\u2080) \u2260 0",
          "oder: f''(x\u2080) = 0 und Vorzeichenwechsel von f''",
        ],
      },
      {
        title: 'Linkskurve (konvex)',
        items: ["f''(x) > 0 im Intervall \u2014 Graph kr\u00fcmmt sich nach oben"],
      },
      {
        title: 'Rechtskurve (konkav)',
        items: ["f''(x) < 0 im Intervall \u2014 Graph kr\u00fcmmt sich nach unten"],
      },
    ],
    graph: buildWendestellenGraph,
  },
  {
    heading: "Zusammenh\u00e4nge f \u2194 f' \u2194 f''",
    rules: [
      {
        title: "Nullstelle von f' \u2192 Extremstelle von f",
        items: ["Wo f' die x-Achse schneidet (mit VZW), hat f eine Extremstelle"],
      },
      {
        title: "Extremstelle von f' \u2192 Wendestelle von f",
        items: ["Wo f' ein Extremum hat, hat f eine Wendestelle"],
      },
      {
        title: "Nullstelle von f'' \u2192 Wendestelle von f",
        items: ["Wo f'' die x-Achse schneidet (mit VZW), hat f eine Wendestelle"],
      },
      {
        title: "f' > 0 \u2192 f steigt",
        items: ["Wo der Graph von f' oberhalb der x-Achse liegt, steigt f"],
      },
      {
        title: "f'' > 0 \u2192 f' steigt \u2192 f ist linksgekr\u00fcmmt",
        items: ["Wo f'' positiv ist, steigt f' und f kr\u00fcmmt sich nach oben"],
      },
    ],
    graph: buildZusammenhangGraph,
  },
];

// ---------- Render ----------

export function renderCheatsheet(container: HTMLElement): (() => void) | null {
  const boards: JXG.Board[] = [];

  const backBtn = document.createElement('button');
  backBtn.className = 'back-link mb-4';
  backBtn.textContent = '\u2190 Zur\u00fcck zur \u00dcbersicht';
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  const h1 = document.createElement('h1');
  h1.className = 'text-2xl font-bold mb-6';
  h1.textContent = 'Das Wichtigste';

  const hint = document.createElement('p');
  hint.className = 'text-sm p-3 mb-6 rounded-lg border';
  hint.style.color = 'var(--color-accent-dark)';
  hint.style.backgroundColor = 'var(--color-accent-light)';
  hint.style.borderColor = 'var(--color-accent)';
  hint.textContent = 'Hier findest du alle wichtigen Regeln kompakt zusammengefasst \u2014 ideal zum Wiederholen vor der KA.';

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

    // Interactive graph for this section
    if (section.graph) {
      const graphCard = document.createElement('div');
      graphCard.className = 'card mb-3';
      graphCard.style.padding = '0.5rem';
      const board = section.graph(graphCard);
      boards.push(board);
      sectionEl.appendChild(graphCard);
    }

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

  return () => {
    boards.forEach(destroyBoard);
  };
}
