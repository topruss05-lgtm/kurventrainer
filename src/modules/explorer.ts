import { navigate } from '../router.js';
import { COLORS } from '../graph/function-plotter.js';
import { CanvasBoard } from '../graph/canvas-board.js';
import { createFunctionCurve, createLine, createPoint } from '../graph/canvas-renderer.js';

interface PresetFunction {
  label: string;
  f: (x: number) => number;
  f1: (x: number) => number;
  f2: (x: number) => number;
  latex: string;
  bbox: [number, number, number, number];
}

const PRESETS: PresetFunction[] = [
  {
    label: 'x\u00B3 \u2212 3x',
    latex: 'f(x) = x\u00B3 \u2212 3x',
    f: (x) => x**3 - 3*x,
    f1: (x) => 3*x**2 - 3,
    f2: (x) => 6*x,
    bbox: [-4, 8, 4, -8],
  },
  {
    label: 'x\u2074 \u2212 2x\u00B2',
    latex: 'f(x) = x\u2074 \u2212 2x\u00B2',
    f: (x) => x**4 - 2*x**2,
    f1: (x) => 4*x**3 - 4*x,
    f2: (x) => 12*x**2 - 4,
    bbox: [-3, 6, 3, -6],
  },
  {
    label: 'x\u2074 \u2212 4x\u00B3',
    latex: 'f(x) = x\u2074 \u2212 4x\u00B3 (Sattelpunkt)',
    f: (x) => x**4 - 4*x**3,
    f1: (x) => 4*x**3 - 12*x**2,
    f2: (x) => 12*x**2 - 24*x,
    bbox: [-2, 20, 5, -30],
  },
  {
    label: '\u2212x\u00B3 + 3x',
    latex: 'f(x) = \u2212x\u00B3 + 3x',
    f: (x) => -(x**3) + 3*x,
    f1: (x) => -3*x**2 + 3,
    f2: (x) => -6*x,
    bbox: [-4, 8, 4, -8],
  },
  {
    label: 'x\u00B3 \u2212 6x\u00B2 + 9x',
    latex: 'f(x) = x\u00B3 \u2212 6x\u00B2 + 9x',
    f: (x) => x**3 - 6*x**2 + 9*x,
    f1: (x) => 3*x**2 - 12*x + 9,
    f2: (x) => 6*x - 12,
    bbox: [-1, 10, 5, -6],
  },
];

const BOARD_HEIGHT = 180;
const GRAPH_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary];
const GRAPH_LABELS = ['f', "f'", "f''"];

function createInfoLine(text: string, color?: string): HTMLElement {
  const span = document.createElement('span');
  span.textContent = text;
  if (color) span.style.color = color;
  return span;
}

export function renderExplorer(container: HTMLElement): (() => void) | null {
  let boards: CanvasBoard[] = [];
  let trackerLines: ReturnType<typeof createLine>[] = [];
  let trackerPoints: ReturnType<typeof createPoint>[] = [];
  let currentPreset = 0;

  // --- Header ---
  const backBtn = document.createElement('button');
  backBtn.className = 'back-link mb-4';
  backBtn.textContent = '\u2190 Zur\u00fcck zur \u00dcbersicht';
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  const h1 = document.createElement('h1');
  h1.className = 'text-2xl font-bold mb-2';
  h1.textContent = 'Explorer: f \u2194 f\u2032 \u2194 f\u2033';

  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm mb-5';
  subtitle.style.color = 'var(--color-ink-muted)';
  subtitle.textContent = 'Bewege den Finger \u00fcber einen Graphen und beobachte den Zusammenhang.';

  // --- Preset buttons ---
  const presetBar = document.createElement('div');
  presetBar.className = 'flex flex-wrap gap-2 mb-5';

  const presetBtns: HTMLButtonElement[] = [];
  PRESETS.forEach((preset, i) => {
    const btn = document.createElement('button');
    btn.textContent = preset.label;
    btn.style.cssText = `
      padding: 0.4rem 0.9rem; border-radius: 9999px; font-size: 0.85rem;
      border: 1.5px solid var(--color-border); cursor: pointer;
      transition: all 0.15s; background: var(--color-surface-card);
    `;
    btn.addEventListener('click', () => loadPreset(i));
    presetBtns.push(btn);
    presetBar.appendChild(btn);
  });

  const fnLabel = document.createElement('p');
  fnLabel.className = 'text-sm font-medium mb-3';
  fnLabel.style.color = 'var(--color-ink-secondary)';

  // --- Board containers ---
  const boardContainers: HTMLDivElement[] = [];
  const wrappers: HTMLDivElement[] = [];

  for (let i = 0; i < 3; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card mb-3 relative';
    wrapper.style.padding = '0';
    wrapper.style.overflow = 'hidden';

    const badge = document.createElement('span');
    badge.className = 'absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 rounded';
    badge.style.cssText = `background: ${GRAPH_COLORS[i]}15; color: ${GRAPH_COLORS[i]}; pointer-events: none;`;
    badge.textContent = GRAPH_LABELS[i];

    const boardDiv = document.createElement('div');
    wrapper.append(badge, boardDiv);
    boardContainers.push(boardDiv);
    wrappers.push(wrapper);
  }

  // --- Info panel ---
  const infoPanel = document.createElement('div');
  infoPanel.className = 'card p-3 text-sm space-y-1';
  infoPanel.style.color = 'var(--color-ink-secondary)';
  infoPanel.style.minHeight = '4.5rem';
  infoPanel.appendChild(createInfoLine('Bewege den Cursor \u00fcber einen Graphen\u2026', 'var(--color-ink-muted)'));

  // --- Assemble ---
  container.append(backBtn, h1, subtitle, presetBar, fnLabel, ...wrappers, infoPanel);

  // --- Board creation ---
  function createBoards(preset: PresetFunction): void {
    boards.forEach(b => b.destroy());
    boards = []; trackerLines = []; trackerPoints = [];

    const fns = [preset.f, preset.f1, preset.f2];
    const [xMin, , xMax] = preset.bbox;

    for (let i = 0; i < 3; i++) {
      boardContainers[i].textContent = '';

      // Calculate y bounds
      let yMin = Infinity, yMax = -Infinity;
      const step = (xMax - xMin) / 200;
      for (let x = xMin; x <= xMax; x += step) {
        const y = fns[i](x);
        if (Number.isFinite(y)) {
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }
      const ySpan = Math.max(yMax - yMin, 2);
      yMin -= ySpan * 0.15;
      yMax += ySpan * 0.15;

      const board = new CanvasBoard(boardContainers[i], {
        boundingBox: [xMin - 0.5, yMax, xMax + 0.5, yMin],
        height: BOARD_HEIGHT,
      });

      board.addElement(createFunctionCurve(fns[i], { color: GRAPH_COLORS[i], strokeWidth: 2.5 }));

      // Tracker line + point (hidden)
      const tLine = createLine([0, -1000], [0, 1000], { color: '#8888a4', dash: 2 });
      tLine.visible = false;
      board.addElement(tLine);

      const tPoint = createPoint(0, 0, { color: GRAPH_COLORS[i], size: 5 });
      tPoint.visible = false;
      board.addElement(tPoint);

      boards.push(board);
      trackerLines.push(tLine);
      trackerPoints.push(tPoint);

      board.on('move', (e) => handleMove(e, i));
      board.canvas.addEventListener('mouseleave', hideTrackers);
      board.update();
    }
  }

  function handleMove(e: PointerEvent | TouchEvent, boardIndex: number): void {
    const board = boards[boardIndex];
    if (!board) return;

    let clientX: number, clientY: number;
    if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
      const t = e.touches?.[0];
      if (!t) return;
      clientX = t.clientX; clientY = t.clientY;
    } else if (e instanceof PointerEvent) {
      clientX = e.clientX; clientY = e.clientY;
    } else return;

    const [mx] = board.toMathCoords(clientX, clientY);
    if (!Number.isFinite(mx)) return;

    updateTrackers(mx);
  }

  function updateTrackers(x: number): void {
    const preset = PRESETS[currentPreset];
    const fns = [preset.f, preset.f1, preset.f2];

    for (let i = 0; i < 3; i++) {
      const y = fns[i](x);
      trackerLines[i].setEndpoints([x, -1000], [x, 1000]);
      trackerLines[i].visible = true;

      if (Number.isFinite(y)) {
        trackerPoints[i].setPosition(x, y);
        trackerPoints[i].visible = true;
      } else {
        trackerPoints[i].visible = false;
      }

      boards[i]?.update();
    }

    updateInfo(x, fns);
  }

  function hideTrackers(): void {
    for (let i = 0; i < 3; i++) {
      if (trackerLines[i]) trackerLines[i].visible = false;
      if (trackerPoints[i]) trackerPoints[i].visible = false;
      boards[i]?.update();
    }
    infoPanel.textContent = '';
    infoPanel.appendChild(createInfoLine('Bewege den Cursor \u00fcber einen Graphen\u2026', 'var(--color-ink-muted)'));
  }

  function updateInfo(x: number, fns: ((x: number) => number)[]): void {
    const f1Val = fns[1](x);
    const f2Val = fns[2](x);

    infoPanel.textContent = '';

    const xLine = document.createElement('div');
    const xBold = document.createElement('b');
    xBold.textContent = `x = ${x.toFixed(2)}`;
    xLine.appendChild(xBold);
    infoPanel.appendChild(xLine);

    const f1Line = document.createElement('div');
    if (Math.abs(f1Val) < 0.15) {
      f1Line.textContent = "f'(x) \u2248 0 \u2192 m\u00f6gliche Extremstelle!";
      f1Line.style.color = COLORS.secondary;
    } else if (f1Val > 0) {
      f1Line.textContent = `f'(x) = ${f1Val.toFixed(2)} > 0 \u2192 f steigt hier`;
      f1Line.style.color = '#2d8a4e';
    } else {
      f1Line.textContent = `f'(x) = ${f1Val.toFixed(2)} < 0 \u2192 f f\u00e4llt hier`;
      f1Line.style.color = '#c4582a';
    }
    infoPanel.appendChild(f1Line);

    const f2Line = document.createElement('div');
    if (Math.abs(f2Val) < 0.15) {
      f2Line.textContent = "f''(x) \u2248 0 \u2192 m\u00f6gliche Wendestelle!";
      f2Line.style.color = COLORS.tertiary;
    } else if (f2Val > 0) {
      f2Line.textContent = `f''(x) = ${f2Val.toFixed(2)} > 0 \u2192 f ist linksgekr\u00fcmmt`;
      f2Line.style.color = COLORS.tertiary;
    } else {
      f2Line.textContent = `f''(x) = ${f2Val.toFixed(2)} < 0 \u2192 f ist rechtsgekr\u00fcmmt`;
      f2Line.style.color = COLORS.tertiary;
    }
    infoPanel.appendChild(f2Line);
  }

  function loadPreset(index: number): void {
    currentPreset = index;
    const preset = PRESETS[index];

    presetBtns.forEach((btn, i) => {
      if (i === index) {
        btn.style.background = 'var(--color-primary)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--color-primary)';
      } else {
        btn.style.background = 'var(--color-surface-card)';
        btn.style.color = '';
        btn.style.borderColor = 'var(--color-border)';
      }
    });

    fnLabel.textContent = preset.latex;
    createBoards(preset);
  }

  loadPreset(0);

  return () => {
    boards.forEach(b => b.destroy());
  };
}
