import { navigate } from '../router.js';
import { createBoard, destroyBoard, type CanvasBoard } from '../graph/board-factory.js';
import { COLORS } from '../graph/function-plotter.js';
import { createFunctionCurve, createLine, createPoint, createIntervalBand } from '../graph/canvas-renderer.js';

// ── Style constants ─────────────────────────────────────────────────

const S = {
  label: `
    font-family: var(--font-display); font-weight: 700; font-size: 0.8rem;
    margin: 0.625rem 0 0.25rem 0.375rem;
    color: var(--color-primary-dark);
  `,
  ruleCard: `
    padding: 0.625rem 0.875rem; border-left: 3px solid rgba(13, 115, 119, 0.2);
    transition: border-color 0.15s, background-color 0.15s, opacity 0.15s;
  `,
  ruleCardH3: `
    font-family: var(--font-display); font-weight: 600;
    transition: font-weight 0.15s;
  `,
  nachweisBox: `
    background: var(--color-surface-card); border-radius: 1rem;
    border: 1px solid var(--color-border);
    padding: 0; overflow: hidden;
  `,
  nachweisHeader: `
    padding: 0.625rem 1rem; border-bottom: 1px solid var(--color-border);
    display: flex; align-items: baseline; gap: 0.5rem;
  `,
  nachweisTitle: `font-family: var(--font-display); font-weight: 700; font-size: 0.8125rem; color: var(--color-ink);`,
  nachweisSub: `font-size: 0.7rem; color: var(--color-ink-muted);`,
  nachweisCell: `
    background: var(--color-surface-card); padding: 0.625rem 0.375rem;
    display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    transition: background-color 0.15s;
  `,
  nachweisPremise: `font-size: 0.675rem; color: var(--color-ink-secondary); text-align: center; line-height: 1.45; white-space: pre-line;`,
  nachweisDivider: `width: 1.5rem; height: 1px; background: var(--color-border);`,
  nachweisConclusion: `font-family: var(--font-display); font-weight: 700; font-size: 0.75rem;`,
  nachweisHint: `font-size: 0.6rem; color: var(--color-ink-muted); font-style: italic; margin-top: 0.125rem;`,
  graphCard: `
    background: var(--color-primary-light); border-radius: 1rem;
    padding: 0.75rem 0.5rem 0.75rem;
    border: 1px solid rgba(13, 115, 119, 0.12);
  `,
  sectionHeading: `
    font-family: var(--font-display); font-weight: 800; font-size: 1.1rem;
    color: var(--color-primary); margin-bottom: 1rem;
    letter-spacing: -0.01em;
  `,
  backBtn: `
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 0.8rem; color: var(--color-ink-muted); transition: color 0.15s;
    margin-bottom: 1.5rem; display: inline-flex; align-items: center; gap: 0.375rem;
  `,
  pageTitle: `
    font-family: var(--font-display); font-weight: 800; font-size: 1.75rem;
    letter-spacing: -0.025em; color: var(--color-ink); line-height: 1.2;
  `,
  hintPill: `
    display: inline-block; font-size: 0.75rem; color: var(--color-primary-dark);
    margin-top: 0.625rem; padding: 0.375rem 0.875rem;
    background: var(--color-primary-light); border-radius: 999px;
  `,
  divider: `
    border: none; border-top: 1px solid rgba(13, 115, 119, 0.15);
    margin: 2.5rem 0;
  `,
  idleBorder: 'rgba(13, 115, 119, 0.2)',
} as const;

// ── Shared constants ────────────────────────────────────────────────

const HIGHLIGHT = '#e07a3a';
const HIGHLIGHT_BG = '#fef0e6';
const GRAY = '#c0bdb8';

// ── Unified types ───────────────────────────────────────────────────

type ZoneId = string;
type BE = import('../graph/canvas-board.js').BoardElement;

interface Seg { colored: BE; gray: BE; zone: ZoneId; xFrom: number; xTo: number }
interface Band { el: BE; zone: ZoneId; xFrom: number; xTo: number }
interface Pt { colored: BE; zone: ZoneId }
interface RuleCard { el: HTMLElement; zone: ZoneId | ZoneId[] }

interface CriticalPoint { x: number; zone: ZoneId }

// ── Shared helpers ──────────────────────────────────────────────────

function addLabel(container: HTMLElement, text: string, _color: string): void {
  const lbl = document.createElement('p');
  lbl.style.cssText = S.label;
  lbl.textContent = text;
  container.appendChild(lbl);
}

function withCleanup(board: CanvasBoard, cleanups: (() => void)[]): void {
  const orig = board.destroy.bind(board);
  board.destroy = () => { cleanups.forEach(fn => fn()); orig(); };
}

function detectZone(mx: number, criticals: CriticalPoint[], tolerance: number): ZoneId {
  for (const cp of criticals) {
    if (Math.abs(mx - cp.x) < tolerance) return cp.zone;
  }
  return 'none';
}

function isInRanges(x: number, ranges: [number, number][]): boolean {
  return ranges.some(([a, b]) => x >= a && x <= b);
}

// ── DOM helpers: rule cards ─────────────────────────────────────────

function makeRuleCard(
  title: string,
  items: string[],
  zone: ZoneId,
  cards: RuleCard[],
  onClick: (zone: ZoneId) => void,
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'card mb-2 cursor-pointer';
  el.style.cssText = S.ruleCard;

  const h3 = document.createElement('h3');
  h3.className = 'text-sm';
  h3.style.cssText = S.ruleCardH3;
  h3.textContent = title;

  const ul = document.createElement('ul');
  ul.className = 'text-xs mt-0.5';
  ul.style.color = 'var(--color-ink-secondary)';
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = `\u2022 ${item}`;
    ul.appendChild(li);
  }

  el.append(h3, ul);
  cards.push({ el, zone });
  el.addEventListener('click', () => onClick(zone));
  return el;
}

function highlightCards(cards: RuleCard[], zone: ZoneId): void {
  for (const rc of cards) {
    const z = rc.zone as ZoneId;
    if (z === zone) {
      rc.el.style.borderLeftColor = HIGHLIGHT;
      rc.el.style.backgroundColor = HIGHLIGHT_BG;
      rc.el.style.opacity = '1';
      const h3 = rc.el.querySelector('h3') as HTMLElement;
      if (h3) h3.style.fontWeight = '700';
    } else {
      rc.el.style.borderLeftColor = S.idleBorder;
      rc.el.style.backgroundColor = '';
      rc.el.style.opacity = '0.3';
      const h3 = rc.el.querySelector('h3') as HTMLElement;
      if (h3) h3.style.fontWeight = '600';
    }
  }
}

function highlightCardsMulti(cards: RuleCard[], zones: ZoneId[]): void {
  for (const rc of cards) {
    const z = rc.zone as ZoneId;
    if (zones.includes(z)) {
      rc.el.style.borderLeftColor = HIGHLIGHT;
      rc.el.style.backgroundColor = HIGHLIGHT_BG;
      rc.el.style.opacity = '1';
      const h3 = rc.el.querySelector('h3') as HTMLElement;
      if (h3) h3.style.fontWeight = '700';
    } else {
      rc.el.style.borderLeftColor = S.idleBorder;
      rc.el.style.backgroundColor = '';
      rc.el.style.opacity = '0.3';
      const h3 = rc.el.querySelector('h3') as HTMLElement;
      if (h3) h3.style.fontWeight = '600';
    }
  }
}

function clearCardHighlights(cards: RuleCard[]): void {
  for (const rc of cards) {
    rc.el.style.borderLeftColor = 'transparent';
    rc.el.style.backgroundColor = '';
    rc.el.style.opacity = '';
    const h3 = rc.el.querySelector('h3') as HTMLElement;
    if (h3) h3.style.fontWeight = '600';
  }
}

// ── DOM helpers: nachweis box ────────────────────────────────────────

interface NachweisCondition {
  premise: string;
  conclusion: string;
  zone: ZoneId;  // 'none' = inert
  hintText?: string;
}

function buildNachweisBox(
  container: HTMLElement,
  title: string,
  colCount: number,
  conditions: NachweisCondition[],
  columns: HTMLElement[],
  zones: ZoneId[],
  onCellClick: (zone: ZoneId) => void,
): void {
  const qt = document.createElement('div');
  qt.style.cssText = S.nachweisBox;

  const qtHeader = document.createElement('div');
  qtHeader.style.cssText = S.nachweisHeader;
  const qtTitle = document.createElement('h3');
  qtTitle.style.cssText = S.nachweisTitle;
  qtTitle.textContent = title;
  const qtSub = document.createElement('span');
  qtSub.style.cssText = S.nachweisSub;
  qtSub.textContent = 'Hinreichende Bedingung';
  qtHeader.append(qtTitle, qtSub);

  const qtBody = document.createElement('div');
  qtBody.style.cssText = `display: grid; grid-template-columns: repeat(${colCount}, 1fr); gap: 1px; background: var(--color-border);`;

  for (const c of conditions) {
    const isInert = c.zone === 'none';
    const cell = document.createElement('div');
    cell.style.cssText = S.nachweisCell + (isInert ? ' opacity: 0.7; cursor: default;' : ' cursor: pointer;');

    const premise = document.createElement('span');
    premise.style.cssText = S.nachweisPremise + (isInert ? ' opacity: 0.8;' : '');
    premise.textContent = c.premise;

    const divider = document.createElement('span');
    divider.style.cssText = S.nachweisDivider;

    const conclusion = document.createElement('span');
    conclusion.style.cssText = S.nachweisConclusion + ` color: ${isInert ? 'var(--color-ink-muted)' : 'var(--color-ink)'};`;
    conclusion.textContent = c.conclusion;

    cell.append(premise, divider, conclusion);

    if (isInert && c.hintText) {
      const hint = document.createElement('span');
      hint.style.cssText = S.nachweisHint;
      hint.textContent = c.hintText;
      cell.appendChild(hint);
    }

    qtBody.appendChild(cell);
    columns.push(cell);
    zones.push(c.zone);

    if (!isInert) {
      cell.addEventListener('click', () => onCellClick(c.zone));
    }
  }

  qt.append(qtHeader, qtBody);
  container.appendChild(qt);
}

function highlightNachweisColumns(columns: HTMLElement[], zones: ZoneId[], zone: ZoneId): void {
  columns.forEach((col, i) => {
    const z = zones[i];
    if (z === 'none') return;
    if (z === zone) {
      col.style.backgroundColor = HIGHLIGHT_BG;
      col.style.opacity = '1';
    } else {
      col.style.backgroundColor = 'var(--color-surface-card)';
      col.style.opacity = '0.3';
    }
  });
}

function clearNachweisColumns(columns: HTMLElement[], zones: ZoneId[]): void {
  columns.forEach((col, i) => {
    if (zones[i] === 'none') return;
    col.style.backgroundColor = 'var(--color-surface-card)';
    col.style.opacity = '';
  });
}

// ── Board element builders ──────────────────────────────────────────

function buildBoardBands(
  board: CanvasBoard,
  ranges: Array<{ xRange: [number, number]; zone: ZoneId }>,
  zoneColors: Record<string, string>,
): Band[] {
  return ranges.map(r => {
    const el = createIntervalBand(r.xRange[0], r.xRange[1], { color: zoneColors[r.zone], opacity: 0.12 });
    el.visible = false;
    board.addElement(el);
    return { el, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });
}

function buildBoardSegs(
  board: CanvasBoard,
  fn: (x: number) => number,
  ranges: Array<{ xRange: [number, number]; zone: ZoneId }>,
  color: string,
  strokeWidth: number,
): Seg[] {
  return ranges.map(r => {
    const colored = createFunctionCurve(fn, { color, strokeWidth, xRange: r.xRange });
    const gray = createFunctionCurve(fn, { color: GRAY, strokeWidth, xRange: r.xRange });
    gray.visible = false;
    board.addElement(gray);
    board.addElement(colored);
    return { colored, gray, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });
}

function buildBoardPts(
  board: CanvasBoard,
  defs: Array<{ x: number; y: number; label: string; zone: ZoneId; labelOffset?: [number, number] }>,
): Pt[] {
  return defs.map(d => {
    const opts: { color: string; size: number; label: string; labelOffset?: [number, number] } = {
      color: HIGHLIGHT, size: 5, label: d.label,
    };
    if (d.labelOffset) opts.labelOffset = d.labelOffset;
    const colored = createPoint(d.x, d.y, opts);
    colored.visible = false;
    board.addElement(colored);
    return { colored, zone: d.zone };
  });
}

// ── Graph state machine ─────────────────────────────────────────────

function makeGraphStateMachine(
  allSegs: Seg[],
  allBands: Band[],
  allPts: Pt[],
  segRanges: Array<{ xRange: [number, number]; zone: ZoneId }>,
  updateBoards: () => void,
) {
  function setGraphState(mode: 'blank' | 'zone' | 'segment' | 'point', zone?: ZoneId, segIndex?: number): void {
    if (mode === 'blank') {
      for (const s of allSegs) { s.colored.visible = true; s.gray.visible = false; }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = false;
    } else if (mode === 'segment' && segIndex !== undefined) {
      const activeZone = segRanges[segIndex].zone;
      for (const s of allSegs) {
        const match = s.zone === activeZone;
        s.colored.visible = match;
        s.gray.visible = !match;
      }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = false;
    } else if (mode === 'point' && zone) {
      for (const s of allSegs) { s.colored.visible = false; s.gray.visible = true; }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = p.zone === zone;
    } else if (mode === 'zone' && zone) {
      for (const s of allSegs) {
        s.colored.visible = s.zone === zone;
        s.gray.visible = s.zone !== zone;
      }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = false;
    }
    updateBoards();
  }

  function getSegIndex(mx: number): number | null {
    for (let i = 0; i < segRanges.length; i++) {
      const r = segRanges[i];
      if (mx >= r.xRange[0] && mx <= r.xRange[1]) return i;
    }
    return null;
  }

  return { setGraphState, getSegIndex };
}

// ── Hover event helpers ─────────────────────────────────────────────

function extractCoords(e: PointerEvent | TouchEvent): { clientX: number; clientY: number } | null {
  if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
    const t = e.touches?.[0]; if (!t) return null;
    return { clientX: t.clientX, clientY: t.clientY };
  } else if (e instanceof PointerEvent) {
    return { clientX: e.clientX, clientY: e.clientY };
  }
  return null;
}

function attachHover(
  board: CanvasBoard,
  cleanups: (() => void)[],
  onMove: (e: PointerEvent | TouchEvent) => void,
  onLeave: () => void,
): void {
  if (!window.matchMedia('(pointer: coarse)').matches) {
    board.on('move', onMove);
    board.canvas.addEventListener('mouseleave', onLeave);
    board.canvas.addEventListener('touchend', onLeave);
    cleanups.push(() => {
      board.off('move', onMove);
      board.canvas.removeEventListener('mouseleave', onLeave);
      board.canvas.removeEventListener('touchend', onLeave);
    });
  }
}

// ── Section controller ──────────────────────────────────────────────

interface SectionCtrl {
  cards: RuleCard[];
  nachweisColumns: HTMLElement[];
  nachweisZones: ZoneId[];
  activeClickZone: ZoneId | null;
  highlightZone(zone: ZoneId): void;
  clearHighlights(): void;
  clearAll(): void;
  onCardClick(zone: ZoneId): void;
  onNachweisClick(zone: ZoneId): void;
}

function makeSectionCtrl(opts: {
  intervalZones: ZoneId[];
  zoneX: Record<string, number>;
  setGraphState: (mode: 'blank' | 'zone' | 'segment' | 'point', zone?: ZoneId, segIndex?: number) => void;
  showAtX: (mx: number) => void;
  hideGraphics: () => void;
  hidePointExtras: () => void;
}): SectionCtrl {
  const cards: RuleCard[] = [];
  const nachweisColumns: HTMLElement[] = [];
  const nachweisZones: ZoneId[] = [];
  const ctrl: SectionCtrl = {
    cards,
    nachweisColumns,
    nachweisZones,
    activeClickZone: null,
    highlightZone(zone: ZoneId) {
      highlightCards(cards, zone);
      highlightNachweisColumns(nachweisColumns, nachweisZones, zone);
    },
    clearHighlights() {
      clearCardHighlights(cards);
      clearNachweisColumns(nachweisColumns, nachweisZones);
    },
    clearAll() {
      ctrl.activeClickZone = null;
      opts.hideGraphics();
      ctrl.clearHighlights();
      opts.setGraphState('blank');
    },
    onCardClick(zone: ZoneId) {
      if (ctrl.activeClickZone === zone) {
        ctrl.clearAll();
      } else {
        ctrl.activeClickZone = zone;
        const isInterval = opts.intervalZones.includes(zone);
        ctrl.highlightZone(zone);
        if (isInterval) {
          opts.setGraphState('zone', zone);
          opts.hideGraphics();
        } else {
          opts.setGraphState('point', zone);
          opts.showAtX(opts.zoneX[zone]);
          opts.hidePointExtras();
        }
      }
    },
    onNachweisClick(zone: ZoneId) {
      if (ctrl.activeClickZone === zone) {
        ctrl.clearAll();
      } else {
        ctrl.activeClickZone = zone;
        ctrl.highlightZone(zone);
        opts.setGraphState('point', zone);
        opts.showAtX(opts.zoneX[zone]);
        opts.hidePointExtras();
      }
    },
  };
  return ctrl;
}

// ── Zone colors per section ─────────────────────────────────────────

const ZONE_COLORS: Record<string, string> = {
  steigend: '#2d8a4e',
  fallend:  '#c4582a',
  hp:       '#d4880f',
  tp:       '#2b6cb0',
  sp:       '#7a7067',
};

const WZONE_COLORS: Record<string, string> = {
  linkskurve:   '#2d8a4e',
  rechtskurve:  '#c4582a',
  wp:           '#7c5cbf',
};

// ── Monotonie + Extremstellen section ───────────────────────────────

function buildMonotonieExtremstellenSection(
  _container: HTMLElement,
  graphContainer: HTMLElement,
  rulesContainer: HTMLElement,
  nachweisContainer: HTMLElement,
): CanvasBoard[] {
  const f = (x: number) => 3*x**5/64 - 5*x**3/16;
  const f1 = (x: number) => 15*x**4/64 - 15*x**2/16;
  const cleanups: (() => void)[] = [];

  const criticals: CriticalPoint[] = [
    { x: -2, zone: 'hp' },
    { x: 0, zone: 'sp' },
    { x: 2, zone: 'tp' },
  ];
  const zoneX: Record<string, number> = {
    steigend: -2.6, fallend: -1, hp: -2, tp: 2, sp: 0, none: 0,
  };

  const COLOR_F = '#4a3070';
  const COLOR_F1 = '#1a6b6b';

  // ─ Board f ─
  addLabel(graphContainer, 'Graph von f  \u2014  Bewege die Maus oder klicke rechts auf eine Regel', COLOR_F);
  const boardF = createBoard(graphContainer, {
    boundingBox: [-3.5, 2.5, 3.5, -2.5],
    keepAspectRatio: true,
    height: 250,
    targetTicks: 6,
  });

  const segRanges: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-2.9, -2], zone: 'steigend' },
    { xRange: [-2, 0], zone: 'fallend' },
    { xRange: [0, 2], zone: 'fallend' },
    { xRange: [2, 2.9], zone: 'steigend' },
  ];
  const bandRanges: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-3.5, -2], zone: 'steigend' },
    { xRange: [-2, 0], zone: 'fallend' },
    { xRange: [0, 2], zone: 'fallend' },
    { xRange: [2, 3.5], zone: 'steigend' },
  ];

  const bandsF = buildBoardBands(boardF, bandRanges, ZONE_COLORS);
  const segsF = buildBoardSegs(boardF, f, segRanges, COLOR_F, 2.5);
  const ptsF = buildBoardPts(boardF, [
    { x: -2, y: 1, label: 'HP (\u22122|1)', zone: 'hp' },
    { x: 0, y: 0, label: 'SP (0|0)', zone: 'sp' },
    { x: 2, y: -1, label: 'TP (2|\u22121)', zone: 'tp' },
  ]);
  boardF.update();

  // ─ Board f' ─
  addLabel(graphContainer, "Graph von f'", COLOR_F1);
  const boardF1 = createBoard(graphContainer, {
    boundingBox: [-3.5, 5, 3.5, -2.5],
    height: 150,
    targetTicks: 5,
  });

  const segRangesF1: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-2.6, -2], zone: 'steigend' },
    { xRange: [-2, 0], zone: 'fallend' },
    { xRange: [0, 2], zone: 'fallend' },
    { xRange: [2, 2.6], zone: 'steigend' },
  ];

  const bandsF1 = buildBoardBands(boardF1, bandRanges, ZONE_COLORS);
  const segsF1 = buildBoardSegs(boardF1, f1, segRangesF1, COLOR_F1, 2);
  const ptsF1 = buildBoardPts(boardF1, [
    { x: -2, y: 0, label: "f'\u2009=\u20090, VZW +\u2192\u2212", zone: 'hp' },
    { x: 0, y: 0, label: "f'\u2009=\u20090, kein VZW", zone: 'sp' },
    { x: 2, y: 0, label: "f'\u2009=\u20090, VZW \u2212\u2192+", zone: 'tp', labelOffset: [-10, -12] },
  ]);
  boardF1.update();

  // ─ Graph state ─
  const allSegs = [...segsF, ...segsF1];
  const allBands = [...bandsF, ...bandsF1];
  const allPts = [...ptsF, ...ptsF1];
  const updateBoards = () => { boardF.update(); boardF1.update(); };
  const { setGraphState, getSegIndex } = makeGraphStateMachine(allSegs, allBands, allPts, segRanges, updateBoards);

  // ─ Interactive elements ─
  const tangentLine = createLine([0, 0], [0, 0], { color: '#1a1a2e', strokeWidth: 1.8, dash: 1 });
  tangentLine.visible = false;
  boardF.addElement(tangentLine);
  const tangentDot = createPoint(0, 0, { color: '#1a1a2e', size: 5 });
  tangentDot.visible = false;
  boardF.addElement(tangentDot);
  const derivDot = createPoint(0, 0, { color: COLORS.secondary, size: 6, label: '' });
  derivDot.visible = false;
  boardF1.addElement(derivDot);
  const derivVLine = createLine([0, -1000], [0, 1000], { color: COLORS.secondary, dash: 1, strokeWidth: 1 });
  derivVLine.visible = false;
  boardF1.addElement(derivVLine);
  const derivHLine = createLine([0, 0], [0, 0], { color: COLORS.secondary, dash: 1, strokeWidth: 1 });
  derivHLine.visible = false;
  boardF1.addElement(derivHLine);

  function showAtX(mx: number): void {
    const y = f(mx);
    const slope = f1(mx);
    if (!Number.isFinite(y) || !Number.isFinite(slope)) return;
    const bb = boardF.getBoundingBox();
    tangentLine.setEndpoints([bb[0], y + slope * (bb[0] - mx)], [bb[2], y + slope * (bb[2] - mx)]);
    tangentLine.visible = true;
    tangentDot.setPosition(mx, y);
    tangentDot.visible = true;
    const dy = f1(mx);
    derivDot.setPosition(mx, dy);
    const isZero = Math.abs(dy) < 0.05;
    derivDot.setLabel(isZero ? 'm = 0' : `m = ${dy.toFixed(1)}`);
    derivDot.visible = true;
    derivVLine.visible = false;
    derivHLine.visible = false;
    boardF.update();
    boardF1.update();
  }

  function hideGraphics(): void {
    tangentLine.visible = false;
    tangentDot.visible = false;
    derivDot.visible = false;
    derivVLine.visible = false;
    derivHLine.visible = false;
    boardF.update();
    boardF1.update();
  }

  // ─ Section controller ─
  const ctrl = makeSectionCtrl({
    intervalZones: ['steigend', 'fallend'],

    zoneX,
    setGraphState, showAtX, hideGraphics,
    hidePointExtras() { derivDot.visible = false; boardF1.update(); },
  });

  rulesContainer.appendChild(makeRuleCard('Monoton wachsend', ["f'(x) > 0 f\u00fcr alle x im Intervall"], 'steigend', ctrl.cards, ctrl.onCardClick));
  rulesContainer.appendChild(makeRuleCard('Monoton fallend', ["f'(x) < 0 f\u00fcr alle x im Intervall"], 'fallend', ctrl.cards, ctrl.onCardClick));
  rulesContainer.appendChild(makeRuleCard('Lokales Maximum (Hochpunkt)', ["f'(x\u2080) = 0 und VZW von f' von + nach \u2212"], 'hp', ctrl.cards, ctrl.onCardClick));
  rulesContainer.appendChild(makeRuleCard('Lokales Minimum (Tiefpunkt)', ["f'(x\u2080) = 0 und VZW von f' von \u2212 nach +"], 'tp', ctrl.cards, ctrl.onCardClick));
  rulesContainer.appendChild(makeRuleCard('Sattelpunkt (kein Extremum)', ["f'(x\u2080) = 0, aber kein VZW von f'"], 'sp', ctrl.cards, ctrl.onCardClick));

  // ─ Nachweis ─
  buildNachweisBox(nachweisContainer, "Nachweis mit f''", 3, [
    { premise: "f'(x\u2080) = 0\nf''(x\u2080) < 0", conclusion: 'Hochpunkt', zone: 'hp' },
    { premise: "f'(x\u2080) = 0\nf''(x\u2080) > 0", conclusion: 'Tiefpunkt', zone: 'tp' },
    { premise: "f'(x\u2080) = 0\nf''(x\u2080) = 0", conclusion: 'Keine Aussage\n(z.\u202FB. Sattelpunkt)', zone: 'sp' },
  ], ctrl.nachweisColumns, ctrl.nachweisZones, ctrl.onNachweisClick);

  // ─ Mouse hover ─
  const SNAP = 0.2;
  const steigendRanges: [number, number][] = [[-3.5, -2], [2, 3.5]];
  const fallendRanges: [number, number][] = [[-2, 0], [0, 2]];

  const onMove = (e: PointerEvent | TouchEvent) => {
    const isPointZone = ctrl.activeClickZone === 'hp' || ctrl.activeClickZone === 'tp' || ctrl.activeClickZone === 'sp';
    if (isPointZone) return;

    const coords = extractCoords(e);
    if (!coords) return;

    let [mx] = boardF.toMathCoords(coords.clientX, coords.clientY);
    const bb = boardF.getBoundingBox();
    if (mx < bb[0] + 0.5 || mx > bb[2] - 0.5) { onLeave(); return; }

    if (ctrl.activeClickZone === 'steigend' && !isInRanges(mx, steigendRanges)) { hideGraphics(); return; }
    if (ctrl.activeClickZone === 'fallend' && !isInRanges(mx, fallendRanges)) { hideGraphics(); return; }

    // Snap to critical points (only when no interval zone is selected)
    if (!ctrl.activeClickZone || (ctrl.activeClickZone !== 'steigend' && ctrl.activeClickZone !== 'fallend')) {
      for (const cp of criticals) {
        if (Math.abs(mx - cp.x) < SNAP) { mx = cp.x; break; }
      }
    }

    const isIntervalActive = ctrl.activeClickZone === 'steigend' || ctrl.activeClickZone === 'fallend';
    const snappedZone = isIntervalActive ? 'none' : detectZone(mx, criticals, SNAP);

    if (snappedZone !== 'none') {
      if (snappedZone === 'sp') {
        // SP doesn't break mf -- keep fallend segments colored, just add the SP point
        setGraphState('segment', undefined, 1);
        for (const p of allPts) p.colored.visible = p.zone === 'sp';
        boardF.update(); boardF1.update();
        showAtX(mx);
        derivDot.visible = false;
        boardF1.update();
        if (!ctrl.activeClickZone) {
          highlightCardsMulti(ctrl.cards, ['fallend', 'sp']);
          highlightNachweisColumns(ctrl.nachweisColumns, ctrl.nachweisZones, 'sp');
        }
      } else {
        setGraphState('point', snappedZone);
        showAtX(mx);
        derivDot.visible = false;
        boardF1.update();
        if (!ctrl.activeClickZone) ctrl.highlightZone(snappedZone);
      }
    } else {
      const idx = getSegIndex(mx);
      if (idx !== null) {
        setGraphState('segment', undefined, idx);
        showAtX(mx);
        if (!ctrl.activeClickZone) {
          const zone = segRanges[idx].zone;
          ctrl.highlightZone(zone);
        }
      }
    }
  };

  const onLeave = () => {
    if (ctrl.activeClickZone) {
      const isIntervalZone = ctrl.activeClickZone === 'steigend' || ctrl.activeClickZone === 'fallend';
      if (isIntervalZone) {
        hideGraphics();
        setGraphState('zone', ctrl.activeClickZone);
      }
      return;
    }
    hideGraphics();
    ctrl.clearHighlights();
    setGraphState('blank');
  };

  attachHover(boardF, cleanups, onMove, onLeave);
  withCleanup(boardF, cleanups);

  return [boardF, boardF1];
}

// ── Wendestellen + Kruemmung section ────────────────────────────────

function buildWendestellenSection(
  _container: HTMLElement,
  graphContainer: HTMLElement,
  rulesContainer: HTMLElement,
  nachweisContainer: HTMLElement,
): CanvasBoard[] {
  const f = (x: number) => x**3 - 3*x**2 + 2;
  const f1 = (x: number) => 3*x**2 - 6*x;
  const f2 = (x: number) => 6*x - 6;
  const cleanups: (() => void)[] = [];

  const wCriticals: CriticalPoint[] = [{ x: 1, zone: 'wp' }];
  const wZoneX: Record<string, number> = {
    linkskurve: 2.5, rechtskurve: -0.5, wp: 1, none: 0,
  };

  const COLOR_F = '#4a3070';
  const COLOR_F1 = '#1a6b6b';
  const COLOR_F2 = '#7c5cbf';

  // ─ Board f ─
  addLabel(graphContainer, 'Graph von f  \u2014  Bewege die Maus oder klicke rechts', COLOR_F);
  const boardF = createBoard(graphContainer, {
    boundingBox: [-1.8, 7, 3.8, -5.5],
    height: 220,
    targetTicks: 6,
  });

  const segRanges: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-1.5, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.5], zone: 'linkskurve' },
  ];
  const bandRanges: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-1.8, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.8], zone: 'linkskurve' },
  ];

  const bandsF = buildBoardBands(boardF, bandRanges, WZONE_COLORS);
  const segsF = buildBoardSegs(boardF, f, segRanges, COLOR_F, 2.5);
  const ptsF = buildBoardPts(boardF, [
    { x: 1, y: 0, label: 'WP (1|0)', zone: 'wp' },
  ]);
  boardF.update();

  // ─ Board f' ─
  addLabel(graphContainer, "Graph von f'", COLOR_F1);
  const boardF1 = createBoard(graphContainer, {
    boundingBox: [-1.8, 14, 3.8, -5],
    height: 130,
    targetTicks: 4,
  });

  const segRangesF1: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-1.5, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.5], zone: 'linkskurve' },
  ];

  const bandsF1 = buildBoardBands(boardF1, bandRanges, WZONE_COLORS);
  const segsF1 = buildBoardSegs(boardF1, f1, segRangesF1, COLOR_F1, 2);
  const ptsF1 = buildBoardPts(boardF1, [
    { x: 1, y: -3, label: "f' Extremum \u2192 WP von f", zone: 'wp' },
  ]);
  boardF1.update();

  // ─ Board f'' ─
  addLabel(graphContainer, "Graph von f''", COLOR_F2);
  const boardF2 = createBoard(graphContainer, {
    boundingBox: [-1.8, 16, 3.8, -16],
    height: 120,
    targetTicks: 4,
  });

  const segRangesF2: Array<{ xRange: [number, number]; zone: ZoneId }> = [
    { xRange: [-1.5, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.5], zone: 'linkskurve' },
  ];

  const bandsF2 = buildBoardBands(boardF2, bandRanges, WZONE_COLORS);
  const segsF2 = buildBoardSegs(boardF2, f2, segRangesF2, COLOR_F2, 2);
  const ptsF2 = buildBoardPts(boardF2, [
    { x: 1, y: 0, label: "f'' = 0, VZW", zone: 'wp' },
  ]);
  boardF2.update();

  // ─ Graph state ─
  const allSegs = [...segsF, ...segsF1, ...segsF2];
  const allBands = [...bandsF, ...bandsF1, ...bandsF2];
  const allPts = [...ptsF, ...ptsF1, ...ptsF2];
  const updateBoards = () => { boardF.update(); boardF1.update(); boardF2.update(); };
  const { setGraphState, getSegIndex } = makeGraphStateMachine(allSegs, allBands, allPts, segRanges, updateBoards);

  // ─ Interactive elements ─
  const tangentLine = createLine([0, 0], [0, 0], { color: '#1a1a2e', strokeWidth: 1.8, dash: 1 });
  tangentLine.visible = false;
  boardF.addElement(tangentLine);
  const tangentDot = createPoint(0, 0, { color: '#1a1a2e', size: 5 });
  tangentDot.visible = false;
  boardF.addElement(tangentDot);
  const f1TangentLine = createLine([0, 0], [0, 0], { color: '#1a1a2e', strokeWidth: 1.5, dash: 1 });
  f1TangentLine.visible = false;
  boardF1.addElement(f1TangentLine);
  const f1Dot = createPoint(0, 0, { color: COLORS.secondary, size: 6, label: '' });
  f1Dot.visible = false;
  boardF1.addElement(f1Dot);
  const f2Dot = createPoint(0, 0, { color: COLORS.tertiary, size: 6, label: '' });
  f2Dot.visible = false;
  boardF2.addElement(f2Dot);

  function showAtX(mx: number): void {
    const y = f(mx);
    const slope = f1(mx);
    if (!Number.isFinite(y) || !Number.isFinite(slope)) return;
    const bb = boardF.getBoundingBox();
    tangentLine.setEndpoints([bb[0], y + slope * (bb[0] - mx)], [bb[2], y + slope * (bb[2] - mx)]);
    tangentLine.visible = true;
    tangentDot.setPosition(mx, y);
    tangentDot.visible = true;
    const dy1 = f1(mx);
    const slopeF1 = f2(mx);
    const bb1 = boardF1.getBoundingBox();
    f1TangentLine.setEndpoints(
      [bb1[0], dy1 + slopeF1 * (bb1[0] - mx)],
      [bb1[2], dy1 + slopeF1 * (bb1[2] - mx)],
    );
    f1TangentLine.visible = true;
    f1Dot.setPosition(mx, dy1);
    f1Dot.setLabel(Math.abs(dy1) < 0.05 ? "f' = 0" : `f' = ${dy1.toFixed(1)}`);
    f1Dot.visible = true;
    const dy2 = f2(mx);
    f2Dot.setPosition(mx, dy2);
    f2Dot.setLabel(Math.abs(dy2) < 0.05 ? "f'' = 0" : `f'' = ${dy2.toFixed(1)}`);
    f2Dot.visible = true;
    updateBoards();
  }

  function hideGraphics(): void {
    tangentLine.visible = false;
    tangentDot.visible = false;
    f1TangentLine.visible = false;
    f1Dot.visible = false;
    f2Dot.visible = false;
    updateBoards();
  }

  // ─ Section controller ─
  const hidePointExtras = () => {
    f1TangentLine.visible = false;
    f1Dot.visible = false;
    f2Dot.visible = false;
    updateBoards();
  };
  const ctrl = makeSectionCtrl({
    intervalZones: ['linkskurve', 'rechtskurve'],

    zoneX: wZoneX,
    setGraphState, showAtX, hideGraphics,
    hidePointExtras,
  });

  rulesContainer.appendChild(makeRuleCard('Rechtskurve (konkav)', ["f' f\u00e4llt \u2192 Steigung nimmt ab", "f''(x) < 0 f\u00fcr alle x im Intervall"], 'rechtskurve', ctrl.cards, ctrl.onCardClick));
  rulesContainer.appendChild(makeRuleCard('Linkskurve (konvex)', ["f' steigt \u2192 Steigung nimmt zu", "f''(x) > 0 f\u00fcr alle x im Intervall"], 'linkskurve', ctrl.cards, ctrl.onCardClick));
  rulesContainer.appendChild(makeRuleCard('Wendepunkt (WP)', ["f' hat Extremstelle bei x\u2080", "f''(x\u2080) = 0 und VZW von f''"], 'wp', ctrl.cards, ctrl.onCardClick));

  // ─ Nachweis ─
  buildNachweisBox(nachweisContainer, "Nachweis mit f'''", 2, [
    { premise: "f''(x\u2080) = 0\nf'''(x\u2080) \u2260 0", conclusion: 'Wendepunkt', zone: 'wp' },
    { premise: "f''(x\u2080) = 0\nf'''(x\u2080) = 0", conclusion: 'Keine Aussage', zone: 'none', hintText: "\u2192 VZW von f'' pr\u00fcfen" },
  ], ctrl.nachweisColumns, ctrl.nachweisZones, ctrl.onNachweisClick);

  // ─ Mouse hover ─
  const SNAP = 0.35;
  const rechtskurveRanges: [number, number][] = [[-1.5, 1]];
  const linkskurveRanges: [number, number][] = [[1, 3.5]];

  const onMove = (e: PointerEvent | TouchEvent) => {
    if (ctrl.activeClickZone === 'wp') return;

    const coords = extractCoords(e);
    if (!coords) return;

    let [mx] = boardF.toMathCoords(coords.clientX, coords.clientY);
    const bb = boardF.getBoundingBox();
    if (mx < bb[0] + 0.3 || mx > bb[2] - 0.3) { onLeave(); return; }

    if (ctrl.activeClickZone === 'rechtskurve' && !isInRanges(mx, rechtskurveRanges)) { hideGraphics(); return; }
    if (ctrl.activeClickZone === 'linkskurve' && !isInRanges(mx, linkskurveRanges)) { hideGraphics(); return; }

    // Snap to WP
    if (!ctrl.activeClickZone || (ctrl.activeClickZone !== 'linkskurve' && ctrl.activeClickZone !== 'rechtskurve')) {
      for (const cp of wCriticals) {
        if (Math.abs(mx - cp.x) < SNAP) { mx = cp.x; break; }
      }
    }

    const isIntervalActive = ctrl.activeClickZone === 'rechtskurve' || ctrl.activeClickZone === 'linkskurve';
    const isAtWP = !isIntervalActive && Math.abs(mx - 1) < 0.01;

    if (isAtWP) {
      setGraphState('point', 'wp');
      showAtX(mx);
      hidePointExtras();
      if (!ctrl.activeClickZone) ctrl.highlightZone('wp');
    } else {
      const idx = getSegIndex(mx);
      if (idx !== null) {
        setGraphState('segment', undefined, idx);
        showAtX(mx);
        if (!ctrl.activeClickZone) {
          const zone = segRanges[idx].zone;
          ctrl.highlightZone(zone);
        }
      }
    }
  };

  const onLeave = () => {
    if (ctrl.activeClickZone) {
      const isIntervalZone = ctrl.activeClickZone === 'linkskurve' || ctrl.activeClickZone === 'rechtskurve';
      if (isIntervalZone) {
        hideGraphics();
        setGraphState('zone', ctrl.activeClickZone);
      }
      return;
    }
    hideGraphics();
    ctrl.clearHighlights();
    setGraphState('blank');
  };

  attachHover(boardF, cleanups, onMove, onLeave);
  withCleanup(boardF, cleanups);

  return [boardF, boardF1, boardF2];
}

// ── Section layout helper ───────────────────────────────────────────

function buildSectionLayout(
  container: HTMLElement,
  title: string,
  animDelay: string | null,
  buildFn: (
    container: HTMLElement,
    graphCard: HTMLElement,
    rulesDiv: HTMLElement,
    nachweisDiv: HTMLElement,
  ) => CanvasBoard[],
): CanvasBoard[] {
  const sectionEl = document.createElement('section');
  sectionEl.className = 'mb-8 animate-slide-up';
  if (animDelay) sectionEl.style.animationDelay = animDelay;

  const heading = document.createElement('h2');
  heading.style.cssText = S.sectionHeading;
  heading.textContent = title;
  sectionEl.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'grid gap-3';
  grid.style.gridTemplateColumns = '1fr';
  if (window.innerWidth >= 768) {
    grid.style.gridTemplateColumns = '1.4fr 1fr';
    grid.style.alignItems = 'start';
  }

  const graphCard = document.createElement('div');
  graphCard.style.cssText = S.graphCard;

  const rulesDiv = document.createElement('div');
  const nachweisDiv = document.createElement('div');
  nachweisDiv.className = 'mt-3';

  const boards = buildFn(container, graphCard, rulesDiv, nachweisDiv);

  grid.appendChild(graphCard);
  grid.appendChild(rulesDiv);
  sectionEl.appendChild(grid);
  sectionEl.appendChild(nachweisDiv);
  container.appendChild(sectionEl);

  return boards;
}

// ── Render ───────────────────────────────────────────────────────────

export function renderCheatsheet(container: HTMLElement): (() => void) | null {
  const boards: CanvasBoard[] = [];

  // ─ Back button ─
  const backBtn = document.createElement('button');
  backBtn.className = 'animate-fade-in';
  backBtn.style.cssText = S.backBtn;
  backBtn.textContent = '\u2190 \u00dcbersicht';
  backBtn.addEventListener('mouseenter', () => { backBtn.style.color = 'var(--color-primary)'; });
  backBtn.addEventListener('mouseleave', () => { backBtn.style.color = 'var(--color-ink-muted)'; });
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  // ─ Header ─
  const header = document.createElement('header');
  header.className = 'animate-fade-in';
  header.style.cssText = 'margin-bottom: 2rem;';

  const h1 = document.createElement('h1');
  h1.style.cssText = S.pageTitle;
  h1.textContent = 'Das Wichtigste';

  const hint = document.createElement('p');
  hint.style.cssText = S.hintPill;
  hint.textContent = 'Klicke auf eine Regel rechts oder bewege die Maus \u00fcber die Graphen.';

  header.append(h1, hint);
  container.append(backBtn, header);

  // ─ Section 1: Monotonie & Extremstellen ─
  boards.push(...buildSectionLayout(container, 'Monotonie & Extremstellen', null, buildMonotonieExtremstellenSection));

  // ─ Divider ─
  const divider = document.createElement('hr');
  divider.style.cssText = S.divider;
  container.appendChild(divider);

  // ─ Section 2: Wendestellen & Kruemmung ─
  boards.push(...buildSectionLayout(container, 'Wendestellen & Kr\u00fcmmung', '60ms', buildWendestellenSection));

  return () => { boards.forEach(destroyBoard); };
}
