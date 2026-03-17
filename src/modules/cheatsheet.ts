import { navigate } from '../router.js';
import { createBoard, destroyBoard, type CanvasBoard } from '../graph/board-factory.js';
import { COLORS } from '../graph/function-plotter.js';
import { createFunctionCurve, createLine, createPoint, createIntervalBand } from '../graph/canvas-renderer.js';

// ── Helpers ──────────────────────────────────────────────────────────


// ── Unified color scheme per zone ────────────────────────────────────
const ZONE_COLORS: Record<string, string> = {
  steigend: '#2d8a4e', // Waldgrün
  fallend:  '#c4582a', // Ziegelrot
  hp:       '#d4880f', // Bernstein
  tp:       '#2b6cb0', // Tiefblau
  sp:       '#7a7067', // Schiefergrau
};
// Single highlight color for active state (accent orange from design system)
const HIGHLIGHT = '#e07a3a';
const HIGHLIGHT_BG = '#fef0e6';

function addLabel(container: HTMLElement, text: string, color: string): void {
  const lbl = document.createElement('p');
  lbl.className = 'text-xs font-bold mt-2 mb-1 px-1';
  lbl.style.color = color;
  lbl.textContent = text;
  container.appendChild(lbl);
}



function withCleanup(board: CanvasBoard, cleanups: (() => void)[]): void {
  const orig = board.destroy.bind(board);
  board.destroy = () => { cleanups.forEach(fn => fn()); orig(); };
}

// ── Zone detection for context-sensitive rules ───────────────────────

type Zone = 'steigend' | 'fallend' | 'hp' | 'tp' | 'sp' | 'none';

interface CriticalPoint { x: number; zone: Zone }

function detectZone(mx: number, criticals: CriticalPoint[], tolerance: number): Zone {
  // Check proximity to critical points first
  for (const cp of criticals) {
    if (Math.abs(mx - cp.x) < tolerance) return cp.zone;
  }
  // Between critical points: check derivative sign
  return 'none'; // caller determines from f' sign
}

// ── Combined Monotonie + Extremstellen builder ───────────────────────

interface RuleCard {
  el: HTMLElement;
  zone: Zone | Zone[];
}

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
  // Representative x for each zone (used when clicking rule cards)
  const zoneX: Record<Zone, number> = {
    steigend: -2.6, fallend: -1, hp: -2, tp: 2, sp: 0, none: 0,
  };

  // ─ Top board: f ─
  const COLOR_F = '#4a3070';  // Dunkelviolett
  const COLOR_F1 = '#1a6b6b'; // Dunkelcyan
  addLabel(graphContainer, 'Graph von f  \u2014  Bewege die Maus oder klicke rechts auf eine Regel', COLOR_F);
  const boardF = createBoard(graphContainer, {
    boundingBox: [-3.5, 1.8, 3.5, -1.8],
    keepAspectRatio: true,
    height: 250,
  });
  // ─ Segments, bands, points — each with index for per-segment control ─
  const GRAY = '#c0bdb8';
  type BE = import('../graph/canvas-board.js').BoardElement;

  // Segments: 4 intervals on each board, indexed 0-3
  // 0: [-2.9, -2] steigend | 1: [-2, 0] fallend | 2: [0, 2] fallend | 3: [2, 2.9] steigend
  interface Seg { colored: BE; gray: BE; zone: Zone; xFrom: number; xTo: number }
  interface Band { el: BE; zone: Zone; xFrom: number; xTo: number }
  interface Pt { colored: BE; zone: Zone }

  const segRanges: Array<{ xRange: [number, number]; zone: Zone }> = [
    { xRange: [-2.9, -2], zone: 'steigend' },
    { xRange: [-2, 0], zone: 'fallend' },
    { xRange: [0, 2], zone: 'fallend' },
    { xRange: [2, 2.9], zone: 'steigend' },
  ];
  const bandRanges: Array<{ xRange: [number, number]; zone: Zone }> = [
    { xRange: [-3.5, -2], zone: 'steigend' },
    { xRange: [-2, 0], zone: 'fallend' },
    { xRange: [0, 2], zone: 'fallend' },
    { xRange: [2, 3.5], zone: 'steigend' },
  ];

  // Build f-board elements
  const bandsF: Band[] = bandRanges.map(r => {
    const el = createIntervalBand(r.xRange[0], r.xRange[1], { color: ZONE_COLORS[r.zone], opacity: 0.12 });
    el.visible = false; // hidden by default
    boardF.addElement(el);
    return { el, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const segsF: Seg[] = segRanges.map(r => {
    const colored = createFunctionCurve(f, { color: COLOR_F, strokeWidth: 2.5, xRange: r.xRange });
    const gray = createFunctionCurve(f, { color: GRAY, strokeWidth: 2.5, xRange: r.xRange });
    gray.visible = false;
    boardF.addElement(gray);
    boardF.addElement(colored);
    return { colored, gray, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const ptsF: Pt[] = [
    { colored: createPoint(-2, 1, { color: HIGHLIGHT, size: 5, label: 'HP (\u22122|1)' }), zone: 'hp' },
    { colored: createPoint(0, 0, { color: HIGHLIGHT, size: 5, label: 'SP (0|0)' }), zone: 'sp' },
    { colored: createPoint(2, -1, { color: HIGHLIGHT, size: 5, label: 'TP (2|\u22121)' }), zone: 'tp' },
  ];
  ptsF.forEach(p => { p.colored.visible = false; boardF.addElement(p.colored); });
  boardF.update();

  // Build f'-board elements
  addLabel(graphContainer, "Graph von f'", COLOR_F1);
  const boardF1 = createBoard(graphContainer, {
    boundingBox: [-3.5, 5, 3.5, -2.5],
    height: 150,
  });

  const segRangesF1: Array<{ xRange: [number, number]; zone: Zone }> = [
    { xRange: [-2.6, -2], zone: 'steigend' },
    { xRange: [-2, 0], zone: 'fallend' },
    { xRange: [0, 2], zone: 'fallend' },
    { xRange: [2, 2.6], zone: 'steigend' },
  ];

  const bandsF1: Band[] = bandRanges.map(r => {
    const el = createIntervalBand(r.xRange[0], r.xRange[1], { color: ZONE_COLORS[r.zone], opacity: 0.12 });
    el.visible = false;
    boardF1.addElement(el);
    return { el, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const segsF1: Seg[] = segRangesF1.map(r => {
    const colored = createFunctionCurve(f1, { color: COLOR_F1, strokeWidth: 2, xRange: r.xRange });
    const gray = createFunctionCurve(f1, { color: GRAY, strokeWidth: 2, xRange: r.xRange });
    gray.visible = false;
    boardF1.addElement(gray);
    boardF1.addElement(colored);
    return { colored, gray, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const ptsF1: Pt[] = [
    { colored: createPoint(-2, 0, { color: HIGHLIGHT, size: 5, label: "f' = 0, VZW + \u2192 \u2212" }), zone: 'hp' },
    { colored: createPoint(0, 0, { color: HIGHLIGHT, size: 5, label: "f' = 0, kein VZW" }), zone: 'sp' },
    { colored: createPoint(2, 0, { color: HIGHLIGHT, size: 5, label: "f' = 0, VZW \u2212 \u2192 +" }), zone: 'tp' },
  ];
  ptsF1.forEach(p => { p.colored.visible = false; boardF1.addElement(p.colored); });
  boardF1.update();

  // ─ Graph state control ─
  const allSegs = [...segsF, ...segsF1];
  const allBands = [...bandsF, ...bandsF1];
  const allPts = [...ptsF, ...ptsF1];

  /** Highlight a specific segment by index (0-3), a point zone, or all of a zone type */
  function setGraphState(mode: 'blank' | 'zone' | 'segment' | 'point', zone?: Zone, segIndex?: number): void {
    if (mode === 'blank') {
      // Default: all colored, no bands, no points
      for (const s of allSegs) { s.colored.visible = true; s.gray.visible = false; }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = false;
    } else if (mode === 'segment' && segIndex !== undefined) {
      // Light up segment + all others with same zone (mf: both halves together)
      const activeZone = segRanges[segIndex].zone;
      for (let i = 0; i < segsF.length; i++) {
        const match = segsF[i].zone === activeZone;
        segsF[i].colored.visible = match;
        segsF[i].gray.visible = !match;
      }
      for (let i = 0; i < segsF1.length; i++) {
        const match = segsF1[i].zone === activeZone;
        segsF1[i].colored.visible = match;
        segsF1[i].gray.visible = !match;
      }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = false;
    } else if (mode === 'point' && zone) {
      // Show one point, everything else gray
      for (const s of allSegs) { s.colored.visible = false; s.gray.visible = true; }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = p.zone === zone;
    } else if (mode === 'zone' && zone) {
      // Click-mode: all segments of that zone type colored (no bands)
      for (const s of allSegs) {
        s.colored.visible = s.zone === zone;
        s.gray.visible = s.zone !== zone;
      }
      for (const b of allBands) b.el.visible = false;
      for (const p of allPts) p.colored.visible = false;
    }
    boardF.update();
    boardF1.update();
  }

  /** Find which segment index (0-3) an x value falls into, or null if at a critical point */
  function getSegIndex(mx: number): number | null {
    for (let i = 0; i < segRanges.length; i++) {
      const r = segRanges[i];
      if (mx >= r.xRange[0] && mx <= r.xRange[1]) return i;
    }
    return null;
  }

  // ─ Interactive elements (tangent, tracker) ─
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

  // ─ Show tangent + tracker at a given x ─
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

  // ─ Rule cards ─
  const ruleCards: RuleCard[] = [];
  let activeClickZone: Zone | null = null;

  function makeRuleCard(title: string, items: string[], zone: Zone): HTMLElement {
    const el = document.createElement('div');
    el.className = 'card mb-2 cursor-pointer';
    el.style.cssText = `
      padding: 0.625rem 0.875rem; border-left: 3px solid transparent;
      transition: border-color 0.15s, background-color 0.15s, opacity 0.15s;
    `;

    const h3 = document.createElement('h3');
    h3.className = 'text-sm';
    h3.style.cssText = `
      font-family: var(--font-display); font-weight: 600;
      transition: font-weight 0.15s;
    `;
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
    ruleCards.push({ el, zone });

    // Click handler: toggle selection
    el.addEventListener('click', () => {
      if (activeClickZone === zone) {
        clearAll();
      } else {
        activeClickZone = zone;
        const isIntervalZone = zone === 'steigend' || zone === 'fallend';
        highlightZone(zone);
        if (isIntervalZone) {
          setGraphState('zone', zone);
          hideGraphics();
        } else {
          setGraphState('point', zone);
          showAtX(zoneX[zone]);
          derivDot.visible = false;
          boardF1.update();
        }
      }
    });

    return el;
  }

  rulesContainer.appendChild(makeRuleCard(
    'Monoton wachsend',
    ["f'(x) > 0 f\u00fcr alle x im Intervall"],
    'steigend',
  ));
  rulesContainer.appendChild(makeRuleCard(
    'Monoton fallend',
    ["f'(x) < 0 f\u00fcr alle x im Intervall"],
    'fallend',
  ));
  rulesContainer.appendChild(makeRuleCard(
    'Lokales Maximum (Hochpunkt)',
    ["f'(x\u2080) = 0 und VZW von f' von + nach \u2212"],
    'hp',
  ));
  rulesContainer.appendChild(makeRuleCard(
    'Lokales Minimum (Tiefpunkt)',
    ["f'(x\u2080) = 0 und VZW von f' von \u2212 nach +"],
    'tp',
  ));
  rulesContainer.appendChild(makeRuleCard(
    'Sattelpunkt (kein Extremum)',
    ["f'(x\u2080) = 0, aber kein VZW von f'"],
    'sp',
  ));

  // ─ Highlight logic ─
  function highlightZone(zone: Zone): void {
    for (const rc of ruleCards) {
      const z = rc.zone as Zone;
      if (z === zone) {
        rc.el.style.borderLeftColor = HIGHLIGHT;
        rc.el.style.backgroundColor = HIGHLIGHT_BG;
        rc.el.style.opacity = '1';
        const h3 = rc.el.querySelector('h3') as HTMLElement;
        if (h3) h3.style.fontWeight = '700';
      } else {
        rc.el.style.borderLeftColor = 'transparent';
        rc.el.style.backgroundColor = '';
        rc.el.style.opacity = '0.3';
        const h3 = rc.el.querySelector('h3') as HTMLElement;
        if (h3) h3.style.fontWeight = '600';
      }
    }
    highlightNachweis(zone);
  }

  function clearHighlights(): void {
    for (const rc of ruleCards) {
      rc.el.style.borderLeftColor = 'transparent';
      rc.el.style.backgroundColor = '';
      rc.el.style.opacity = '';
      const h3 = rc.el.querySelector('h3') as HTMLElement;
      if (h3) h3.style.fontWeight = '600';
    }
    clearNachweisHighlight();
  }

  function clearAll(): void {
    activeClickZone = null;
    hideGraphics();
    clearHighlights();
    setGraphState('blank');
  }

  // ─ Nachweis box ─
  const nachweisColumns: HTMLElement[] = [];
  const nachweisZones: Zone[] = ['hp', 'tp', 'sp'];

  function buildNachweis(): void {
    const qt = document.createElement('div');
    qt.className = 'card';
    qt.style.padding = '0';
    qt.style.overflow = 'hidden';

    const qtHeader = document.createElement('div');
    qtHeader.style.cssText = `
      padding: 0.625rem 1rem; border-bottom: 1px solid var(--color-border);
      display: flex; align-items: baseline; gap: 0.5rem;
    `;
    const qtTitle = document.createElement('h3');
    qtTitle.style.cssText = `font-family: var(--font-display); font-weight: 700; font-size: 0.8125rem; color: var(--color-ink);`;
    qtTitle.textContent = "Nachweis mit f''";
    const qtSub = document.createElement('span');
    qtSub.style.cssText = 'font-size: 0.7rem; color: var(--color-ink-muted);';
    qtSub.textContent = 'Hinreichende Bedingung';
    qtHeader.append(qtTitle, qtSub);

    const qtBody = document.createElement('div');
    qtBody.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: var(--color-border);';

    const conditions: Array<{ premise: string; conclusion: string; zone: Zone }> = [
      { premise: "f'(x\u2080) = 0\nf''(x\u2080) < 0", conclusion: 'Hochpunkt', zone: 'hp' },
      { premise: "f'(x\u2080) = 0\nf''(x\u2080) > 0", conclusion: 'Tiefpunkt', zone: 'tp' },
      { premise: "f'(x\u2080) = 0\nf''(x\u2080) = 0", conclusion: 'Keine Aussage\n(z.\u202FB. Sattelpunkt)', zone: 'sp' },
    ];

    for (const c of conditions) {
      const cell = document.createElement('div');
      cell.style.cssText = `
        background: var(--color-surface-card); padding: 0.625rem 0.375rem; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
        transition: background-color 0.15s;
      `;

      const premise = document.createElement('span');
      premise.style.cssText = 'font-size: 0.675rem; color: var(--color-ink-secondary); text-align: center; line-height: 1.45; white-space: pre-line;';
      premise.textContent = c.premise;

      const divider = document.createElement('span');
      divider.style.cssText = 'width: 1.5rem; height: 1px; background: var(--color-border);';

      const conclusion = document.createElement('span');
      conclusion.style.cssText = `font-family: var(--font-display); font-weight: 700; font-size: 0.75rem; color: var(--color-ink);`;
      conclusion.textContent = c.conclusion;

      cell.append(premise, divider, conclusion);
      qtBody.appendChild(cell);
      nachweisColumns.push(cell);

      // Click: select this zone
      cell.addEventListener('click', () => {
        if (activeClickZone === c.zone) {
          clearAll();
        } else {
          activeClickZone = c.zone;
          highlightZone(c.zone);
          setGraphState('point', c.zone);
          showAtX(zoneX[c.zone]);
          derivDot.visible = false;
          boardF1.update();
        }
      });
    }

    qt.append(qtHeader, qtBody);
    nachweisContainer.appendChild(qt);
  }

  function highlightNachweis(zone: Zone): void {
    nachweisColumns.forEach((col, i) => {
      const z = nachweisZones[i];
      if (z === zone) {
        col.style.backgroundColor = HIGHLIGHT_BG;
        col.style.opacity = '1';
      } else {
        col.style.backgroundColor = 'var(--color-surface-card)';
        col.style.opacity = '0.3';
      }
    });
  }

  function clearNachweisHighlight(): void {
    nachweisColumns.forEach(col => {
      col.style.backgroundColor = 'var(--color-surface-card)';
      col.style.opacity = '';
    });
  }

  buildNachweis();

  // ─ Mouse hover on graph ─
  const SNAP = 0.2;

  // Intervals where smw/smf are active (for constraining hover)
  const steigendRanges: [number, number][] = [[-3.5, -2], [2, 3.5]];
  const fallendRanges: [number, number][] = [[-2, 0], [0, 2]];

  function isInRanges(x: number, ranges: [number, number][]): boolean {
    return ranges.some(([a, b]) => x >= a && x <= b);
  }

  const onMove = (e: PointerEvent | TouchEvent) => {
    const isPointZone = activeClickZone === 'hp' || activeClickZone === 'tp' || activeClickZone === 'sp';
    // HP/TP/SP selected: no hover at all
    if (isPointZone) return;

    let clientX: number, clientY: number;
    if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
      const t = e.touches?.[0]; if (!t) return;
      clientX = t.clientX; clientY = t.clientY;
    } else if (e instanceof PointerEvent) {
      clientX = e.clientX; clientY = e.clientY;
    } else return;

    let [mx] = boardF.toMathCoords(clientX, clientY);
    const bb = boardF.getBoundingBox();
    if (mx < bb[0] + 0.5 || mx > bb[2] - 0.5) { onLeave(); return; }

    // If smw/smf is selected, only allow hover within those intervals
    if (activeClickZone === 'steigend' && !isInRanges(mx, steigendRanges)) {
      hideGraphics(); return;
    }
    if (activeClickZone === 'fallend' && !isInRanges(mx, fallendRanges)) {
      hideGraphics(); return;
    }

    // Snap to critical points (only when no interval zone is selected)
    if (!activeClickZone || (activeClickZone !== 'steigend' && activeClickZone !== 'fallend')) {
      for (const cp of criticals) {
        if (Math.abs(mx - cp.x) < SNAP) { mx = cp.x; break; }
      }
    }

    const isIntervalActive = activeClickZone === 'steigend' || activeClickZone === 'fallend';

    // Detect what we're hovering over (skip point detection when interval is active)
    const snappedZone = isIntervalActive ? 'none' : detectZone(mx, criticals, SNAP);

    if (snappedZone !== 'none') {
      if (snappedZone === 'sp') {
        // SP doesn't break mf — keep fallend segments colored, just add the SP point
        setGraphState('segment', undefined, 1); // lights up fallend
        for (const p of allPts) p.colored.visible = p.zone === 'sp';
        boardF.update(); boardF1.update();
        showAtX(mx);
        derivDot.visible = false;
        boardF1.update();
        // Highlight both mf and SP cards
        if (!activeClickZone) {
          for (const rc of ruleCards) {
            const z = rc.zone as Zone;
            if (z === 'fallend' || z === 'sp') {
              rc.el.style.borderLeftColor = HIGHLIGHT;
              rc.el.style.backgroundColor = HIGHLIGHT_BG;
              rc.el.style.opacity = '1';
              const h3 = rc.el.querySelector('h3') as HTMLElement;
              if (h3) h3.style.fontWeight = '700';
            } else {
              rc.el.style.borderLeftColor = 'transparent';
              rc.el.style.backgroundColor = '';
              rc.el.style.opacity = '0.3';
              const h3 = rc.el.querySelector('h3') as HTMLElement;
              if (h3) h3.style.fontWeight = '600';
            }
          }
          highlightNachweis('sp' as Zone);
        }
      } else {
        setGraphState('point', snappedZone);
        showAtX(mx);
        derivDot.visible = false;
        boardF1.update();
        if (!activeClickZone) highlightZone(snappedZone);
      }
    } else {
      // In an interval: show just this one segment + tangent
      const idx = getSegIndex(mx);
      if (idx !== null) {
        setGraphState('segment', undefined, idx);
        showAtX(mx);
        if (!activeClickZone) {
          const zone = segRanges[idx].zone;
          highlightZone(zone);
        }
      }
    }
  };

  const onLeave = () => {
    if (activeClickZone) {
      const isIntervalZone = activeClickZone === 'steigend' || activeClickZone === 'fallend';
      if (isIntervalZone) {
        hideGraphics();
        setGraphState('zone', activeClickZone); // restore click state
      }
      return;
    }
    hideGraphics();
    clearHighlights();
    setGraphState('blank');
  };

  // Disable hover on mobile — only rule card clicks
  if (!window.matchMedia('(pointer: coarse)').matches) {
    boardF.on('move', onMove);
    boardF.canvas.addEventListener('mouseleave', onLeave);
    boardF.canvas.addEventListener('touchend', onLeave);
    cleanups.push(() => {
      boardF.off('move', onMove);
      boardF.canvas.removeEventListener('mouseleave', onLeave);
      boardF.canvas.removeEventListener('touchend', onLeave);
    });
  }
  withCleanup(boardF, cleanups);

  return [boardF, boardF1];
}

// ── Combined Wendestellen + Krümmung builder ────────────────────────

type WZone = 'linkskurve' | 'rechtskurve' | 'wp' | 'none';

const WZONE_COLORS: Record<string, string> = {
  linkskurve:   '#2d8a4e', // Waldgrün (f'' > 0)
  rechtskurve:  '#c4582a', // Ziegelrot (f'' < 0)
  wp:           '#7c5cbf', // Lila (Wendepunkt)
};

interface WRuleCard { el: HTMLElement; zone: WZone }

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

  const wCriticals: Array<{ x: number; zone: WZone }> = [
    { x: 1, zone: 'wp' },
  ];
  const wZoneX: Record<WZone, number> = {
    linkskurve: 2.5, rechtskurve: -0.5, wp: 1, none: 0,
  };

  // ─ Board 1: f (top) ─
  const COLOR_F = '#4a3070';
  const COLOR_F1 = '#1a6b6b';
  const COLOR_F2 = '#7c5cbf';
  addLabel(graphContainer, 'Graph von f  \u2014  Bewege die Maus oder klicke rechts', COLOR_F);
  const boardF = createBoard(graphContainer, {
    boundingBox: [-1.5, 5.5, 3.5, -4.5],
    height: 220,
  });
  const GRAY = '#c0bdb8';
  type BE = import('../graph/canvas-board.js').BoardElement;

  interface WSeg { colored: BE; gray: BE; zone: WZone; xFrom: number; xTo: number }
  interface WBand { el: BE; zone: WZone; xFrom: number; xTo: number }
  interface WPt { colored: BE; zone: WZone }

  const segRanges: Array<{ xRange: [number, number]; zone: WZone }> = [
    { xRange: [-1.2, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.2], zone: 'linkskurve' },
  ];
  const bandRanges: Array<{ xRange: [number, number]; zone: WZone }> = [
    { xRange: [-1.5, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.5], zone: 'linkskurve' },
  ];

  // Build f-board elements
  const bandsF: WBand[] = bandRanges.map(r => {
    const el = createIntervalBand(r.xRange[0], r.xRange[1], { color: WZONE_COLORS[r.zone], opacity: 0.12 });
    el.visible = false;
    boardF.addElement(el);
    return { el, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const segsF: WSeg[] = segRanges.map(r => {
    const colored = createFunctionCurve(f, { color: COLOR_F, strokeWidth: 2.5, xRange: r.xRange });
    const gray = createFunctionCurve(f, { color: GRAY, strokeWidth: 2.5, xRange: r.xRange });
    gray.visible = false;
    boardF.addElement(gray);
    boardF.addElement(colored);
    return { colored, gray, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const ptsF: WPt[] = [
    { colored: createPoint(1, 0, { color: HIGHLIGHT, size: 5, label: 'WP (1|0)' }), zone: 'wp' },
  ];
  ptsF.forEach(p => { p.colored.visible = false; boardF.addElement(p.colored); });
  boardF.update();

  // ─ Board 2: f' (middle) ─
  addLabel(graphContainer, "Graph von f'", COLOR_F1);
  const boardF1 = createBoard(graphContainer, {
    boundingBox: [-1.5, 5, 3.5, -4],
    height: 110,
  });

  const segRangesF1: Array<{ xRange: [number, number]; zone: WZone }> = [
    { xRange: [-1.2, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.2], zone: 'linkskurve' },
  ];

  const bandsF1: WBand[] = bandRanges.map(r => {
    const el = createIntervalBand(r.xRange[0], r.xRange[1], { color: WZONE_COLORS[r.zone], opacity: 0.12 });
    el.visible = false;
    boardF1.addElement(el);
    return { el, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const segsF1: WSeg[] = segRangesF1.map(r => {
    const colored = createFunctionCurve(f1, { color: COLOR_F1, strokeWidth: 2, xRange: r.xRange });
    const gray = createFunctionCurve(f1, { color: GRAY, strokeWidth: 2, xRange: r.xRange });
    gray.visible = false;
    boardF1.addElement(gray);
    boardF1.addElement(colored);
    return { colored, gray, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  // f' has a minimum at x=1 → that IS the Wendepunkt of f
  const ptsF1: WPt[] = [
    { colored: createPoint(1, -3, { color: HIGHLIGHT, size: 5, label: "f' Extremum \u2192 WP von f" }), zone: 'wp' },
  ];
  ptsF1.forEach(p => { p.colored.visible = false; boardF1.addElement(p.colored); });
  boardF1.update();

  // ─ Board 3: f'' (bottom) ─
  addLabel(graphContainer, "Graph von f''", COLOR_F2);
  const boardF2 = createBoard(graphContainer, {
    boundingBox: [-1.5, 12, 3.5, -10],
    height: 110,
  });

  const segRangesF2: Array<{ xRange: [number, number]; zone: WZone }> = [
    { xRange: [-1.2, 1], zone: 'rechtskurve' },
    { xRange: [1, 3.2], zone: 'linkskurve' },
  ];

  const bandsF2: WBand[] = bandRanges.map(r => {
    const el = createIntervalBand(r.xRange[0], r.xRange[1], { color: WZONE_COLORS[r.zone], opacity: 0.12 });
    el.visible = false;
    boardF2.addElement(el);
    return { el, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const segsF2: WSeg[] = segRangesF2.map(r => {
    const colored = createFunctionCurve(f2, { color: COLOR_F2, strokeWidth: 2, xRange: r.xRange });
    const gray = createFunctionCurve(f2, { color: GRAY, strokeWidth: 2, xRange: r.xRange });
    gray.visible = false;
    boardF2.addElement(gray);
    boardF2.addElement(colored);
    return { colored, gray, zone: r.zone, xFrom: r.xRange[0], xTo: r.xRange[1] };
  });

  const ptsF2: WPt[] = [
    { colored: createPoint(1, 0, { color: HIGHLIGHT, size: 5, label: "f'' = 0, VZW" }), zone: 'wp' },
  ];
  ptsF2.forEach(p => { p.colored.visible = false; boardF2.addElement(p.colored); });
  boardF2.update();

  // ─ Graph state control (3 boards) ─
  const allSegs = [...segsF, ...segsF1, ...segsF2];
  const allBands = [...bandsF, ...bandsF1, ...bandsF2];
  const allPts = [...ptsF, ...ptsF1, ...ptsF2];

  function updateAllBoards(): void {
    boardF.update(); boardF1.update(); boardF2.update();
  }

  function setGraphState(mode: 'blank' | 'zone' | 'segment' | 'point', zone?: WZone, segIndex?: number): void {
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
    updateAllBoards();
  }

  function getSegIndex(mx: number): number | null {
    for (let i = 0; i < segRanges.length; i++) {
      const r = segRanges[i];
      if (mx >= r.xRange[0] && mx <= r.xRange[1]) return i;
    }
    return null;
  }

  // ─ Interactive elements (tangent on f, tangent on f', dot on f'') ─
  const tangentLine = createLine([0, 0], [0, 0], { color: '#1a1a2e', strokeWidth: 1.8, dash: 1 });
  tangentLine.visible = false;
  boardF.addElement(tangentLine);
  const tangentDot = createPoint(0, 0, { color: '#1a1a2e', size: 5 });
  tangentDot.visible = false;
  boardF.addElement(tangentDot);
  // f' tangent + dot
  const f1TangentLine = createLine([0, 0], [0, 0], { color: '#1a1a2e', strokeWidth: 1.5, dash: 1 });
  f1TangentLine.visible = false;
  boardF1.addElement(f1TangentLine);
  const f1Dot = createPoint(0, 0, { color: COLORS.secondary, size: 6, label: '' });
  f1Dot.visible = false;
  boardF1.addElement(f1Dot);
  // f'' tracker dot
  const f2Dot = createPoint(0, 0, { color: COLORS.tertiary, size: 6, label: '' });
  f2Dot.visible = false;
  boardF2.addElement(f2Dot);

  function showAtX(mx: number): void {
    const y = f(mx);
    const slope = f1(mx);
    if (!Number.isFinite(y) || !Number.isFinite(slope)) return;
    // Tangent on f
    const bb = boardF.getBoundingBox();
    tangentLine.setEndpoints([bb[0], y + slope * (bb[0] - mx)], [bb[2], y + slope * (bb[2] - mx)]);
    tangentLine.visible = true;
    tangentDot.setPosition(mx, y);
    tangentDot.visible = true;
    // Tangent on f' (slope = f''(x))
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
    // f'' dot
    const dy2 = f2(mx);
    f2Dot.setPosition(mx, dy2);
    f2Dot.setLabel(Math.abs(dy2) < 0.05 ? "f'' = 0" : `f'' = ${dy2.toFixed(1)}`);
    f2Dot.visible = true;
    updateAllBoards();
  }

  function hideGraphics(): void {
    tangentLine.visible = false;
    tangentDot.visible = false;
    f1TangentLine.visible = false;
    f1Dot.visible = false;
    f2Dot.visible = false;
    updateAllBoards();
  }

  // ─ Rule cards ─
  const wRuleCards: WRuleCard[] = [];
  let activeClickZone: WZone | null = null;

  function makeWRuleCard(title: string, items: string[], zone: WZone): HTMLElement {
    const el = document.createElement('div');
    el.className = 'card mb-2 cursor-pointer';
    el.style.cssText = `
      padding: 0.625rem 0.875rem; border-left: 3px solid transparent;
      transition: border-color 0.15s, background-color 0.15s, opacity 0.15s;
    `;

    const h3 = document.createElement('h3');
    h3.className = 'text-sm';
    h3.style.cssText = `
      font-family: var(--font-display); font-weight: 600;
      transition: font-weight 0.15s;
    `;
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
    wRuleCards.push({ el, zone });

    el.addEventListener('click', () => {
      if (activeClickZone === zone) {
        clearAll();
      } else {
        activeClickZone = zone;
        const isIntervalZone = zone === 'linkskurve' || zone === 'rechtskurve';
        highlightZone(zone);
        if (isIntervalZone) {
          setGraphState('zone', zone);
          hideGraphics();
        } else {
          setGraphState('point', zone);
          showAtX(wZoneX[zone]);
          f1TangentLine.visible = false;
          f1Dot.visible = false;
          f2Dot.visible = false;
          updateAllBoards();
        }
      }
    });

    return el;
  }

  rulesContainer.appendChild(makeWRuleCard(
    'Rechtskurve (konkav)',
    ["f''(x) < 0 f\u00fcr alle x im Intervall"],
    'rechtskurve',
  ));
  rulesContainer.appendChild(makeWRuleCard(
    'Linkskurve (konvex)',
    ["f''(x) > 0 f\u00fcr alle x im Intervall"],
    'linkskurve',
  ));
  rulesContainer.appendChild(makeWRuleCard(
    'Wendepunkt (WP)',
    ["f''(x\u2080) = 0 und VZW von f''"],
    'wp',
  ));

  // ─ Highlight logic ─
  function highlightZone(zone: WZone): void {
    for (const rc of wRuleCards) {
      if (rc.zone === zone) {
        rc.el.style.borderLeftColor = HIGHLIGHT;
        rc.el.style.backgroundColor = HIGHLIGHT_BG;
        rc.el.style.opacity = '1';
        const h3 = rc.el.querySelector('h3') as HTMLElement;
        if (h3) h3.style.fontWeight = '700';
      } else {
        rc.el.style.borderLeftColor = 'transparent';
        rc.el.style.backgroundColor = '';
        rc.el.style.opacity = '0.3';
        const h3 = rc.el.querySelector('h3') as HTMLElement;
        if (h3) h3.style.fontWeight = '600';
      }
    }
    highlightWNachweis(zone);
  }

  function clearHighlights(): void {
    for (const rc of wRuleCards) {
      rc.el.style.borderLeftColor = 'transparent';
      rc.el.style.backgroundColor = '';
      rc.el.style.opacity = '';
      const h3 = rc.el.querySelector('h3') as HTMLElement;
      if (h3) h3.style.fontWeight = '600';
    }
    clearWNachweisHighlight();
  }

  function clearAll(): void {
    activeClickZone = null;
    hideGraphics();
    clearHighlights();
    setGraphState('blank');
  }

  // ─ Nachweis box ─
  const wNachweisColumns: HTMLElement[] = [];
  const wNachweisZones: (WZone | 'none')[] = ['wp', 'none'];

  function buildWNachweis(): void {
    const qt = document.createElement('div');
    qt.className = 'card';
    qt.style.padding = '0';
    qt.style.overflow = 'hidden';

    const qtHeader = document.createElement('div');
    qtHeader.style.cssText = `
      padding: 0.625rem 1rem; border-bottom: 1px solid var(--color-border);
      display: flex; align-items: baseline; gap: 0.5rem;
    `;
    const qtTitle = document.createElement('h3');
    qtTitle.style.cssText = `font-family: var(--font-display); font-weight: 700; font-size: 0.8125rem; color: var(--color-ink);`;
    qtTitle.textContent = "Nachweis mit f'''";
    const qtSub = document.createElement('span');
    qtSub.style.cssText = 'font-size: 0.7rem; color: var(--color-ink-muted);';
    qtSub.textContent = 'Hinreichende Bedingung';
    qtHeader.append(qtTitle, qtSub);

    const qtBody = document.createElement('div');
    qtBody.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--color-border);';

    const conditions: Array<{ premise: string; conclusion: string; zone: WZone | 'none' }> = [
      { premise: "f''(x\u2080) = 0\nf'''(x\u2080) \u2260 0", conclusion: 'Wendepunkt', zone: 'wp' },
      { premise: "f''(x\u2080) = 0\nf'''(x\u2080) = 0", conclusion: 'Keine Aussage', zone: 'none' },
    ];

    for (const c of conditions) {
      const cell = document.createElement('div');
      cell.style.cssText = `
        background: var(--color-surface-card); padding: 0.625rem 0.375rem; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
        transition: background-color 0.15s;
      `;

      const premise = document.createElement('span');
      premise.style.cssText = 'font-size: 0.675rem; color: var(--color-ink-secondary); text-align: center; line-height: 1.45; white-space: pre-line;';
      premise.textContent = c.premise;

      const divider = document.createElement('span');
      divider.style.cssText = 'width: 1.5rem; height: 1px; background: var(--color-border);';

      const conclusion = document.createElement('span');
      conclusion.style.cssText = `font-family: var(--font-display); font-weight: 700; font-size: 0.75rem; color: var(--color-ink);`;
      conclusion.textContent = c.conclusion;

      cell.append(premise, divider, conclusion);
      qtBody.appendChild(cell);
      wNachweisColumns.push(cell);

      cell.addEventListener('click', () => {
        if (c.zone === 'none') {
          if (activeClickZone === null) { clearAll(); return; }
          activeClickZone = null;
          hideGraphics();
          for (const s of allSegs) { s.colored.visible = false; s.gray.visible = true; }
          for (const b of allBands) b.el.visible = false;
          for (const p of allPts) p.colored.visible = false;
          updateAllBoards();
          for (const rc of wRuleCards) {
            rc.el.style.borderLeftColor = 'transparent';
            rc.el.style.backgroundColor = '';
            rc.el.style.opacity = '0.3';
          }
          highlightWNachweis('none');
          return;
        }
        if (activeClickZone === (c.zone as WZone)) {
          clearAll();
        } else {
          activeClickZone = c.zone as WZone;
          highlightZone(c.zone as WZone);
          setGraphState('point', c.zone as WZone);
          showAtX(wZoneX[c.zone as WZone]);
          f1TangentLine.visible = false;
          f1Dot.visible = false;
          f2Dot.visible = false;
          updateAllBoards();
        }
      });
    }

    qt.append(qtHeader, qtBody);
    nachweisContainer.appendChild(qt);
  }

  function highlightWNachweis(zone: WZone | 'none'): void {
    wNachweisColumns.forEach((col, i) => {
      const z = wNachweisZones[i];
      if (z === zone) {
        col.style.backgroundColor = HIGHLIGHT_BG;
        col.style.opacity = '1';
      } else {
        col.style.backgroundColor = 'var(--color-surface-card)';
        col.style.opacity = '0.3';
      }
    });
  }

  function clearWNachweisHighlight(): void {
    wNachweisColumns.forEach(col => {
      col.style.backgroundColor = 'var(--color-surface-card)';
      col.style.opacity = '';
    });
  }

  buildWNachweis();

  // ─ Mouse hover on graph ─
  const SNAP = 0.35;

  const rechtskurveRanges: [number, number][] = [[-1.5, 1]];
  const linkskurveRanges: [number, number][] = [[1, 3.5]];

  function isInRanges(x: number, ranges: [number, number][]): boolean {
    return ranges.some(([a, b]) => x >= a && x <= b);
  }

  const onMove = (e: PointerEvent | TouchEvent) => {
    if (activeClickZone === 'wp') return;

    let clientX: number, clientY: number;
    if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
      const t = e.touches?.[0]; if (!t) return;
      clientX = t.clientX; clientY = t.clientY;
    } else if (e instanceof PointerEvent) {
      clientX = e.clientX; clientY = e.clientY;
    } else return;

    let [mx] = boardF.toMathCoords(clientX, clientY);
    const bb = boardF.getBoundingBox();
    if (mx < bb[0] + 0.3 || mx > bb[2] - 0.3) { onLeave(); return; }

    if (activeClickZone === 'rechtskurve' && !isInRanges(mx, rechtskurveRanges)) {
      hideGraphics(); return;
    }
    if (activeClickZone === 'linkskurve' && !isInRanges(mx, linkskurveRanges)) {
      hideGraphics(); return;
    }

    // Snap to WP
    if (!activeClickZone || (activeClickZone !== 'linkskurve' && activeClickZone !== 'rechtskurve')) {
      for (const cp of wCriticals) {
        if (Math.abs(mx - cp.x) < SNAP) { mx = cp.x; break; }
      }
    }

    // Detect zone (skip point detection when interval is active)
    const isIntervalActive = activeClickZone === 'rechtskurve' || activeClickZone === 'linkskurve';
    const isAtWP = !isIntervalActive && Math.abs(mx - 1) < 0.01;

    if (isAtWP) {
      setGraphState('point', 'wp');
      showAtX(mx);
      f1TangentLine.visible = false;
      f1Dot.visible = false;
      f2Dot.visible = false;
      updateAllBoards();
      if (!activeClickZone) highlightZone('wp');
    } else {
      const idx = getSegIndex(mx);
      if (idx !== null) {
        setGraphState('segment', undefined, idx);
        showAtX(mx);
        if (!activeClickZone) {
          const zone = segRanges[idx].zone;
          highlightZone(zone);
        }
      }
    }
  };

  const onLeave = () => {
    if (activeClickZone) {
      const isIntervalZone = activeClickZone === 'linkskurve' || activeClickZone === 'rechtskurve';
      if (isIntervalZone) {
        hideGraphics();
        setGraphState('zone', activeClickZone);
      }
      return;
    }
    hideGraphics();
    clearHighlights();
    setGraphState('blank');
  };

  // Disable hover on mobile — only rule card clicks
  if (!window.matchMedia('(pointer: coarse)').matches) {
    boardF.on('move', onMove);
    boardF.canvas.addEventListener('mouseleave', onLeave);
    boardF.canvas.addEventListener('touchend', onLeave);
    cleanups.push(() => {
      boardF.off('move', onMove);
      boardF.canvas.removeEventListener('mouseleave', onLeave);
      boardF.canvas.removeEventListener('touchend', onLeave);
    });
  }
  withCleanup(boardF, cleanups);

  return [boardF, boardF1, boardF2];
}

// ── Render ───────────────────────────────────────────────────────────

export function renderCheatsheet(container: HTMLElement): (() => void) | null {
  const boards: CanvasBoard[] = [];

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
  hint.textContent = 'Bewege die Maus \u00fcber die Graphen \u2014 die passende Regel wird automatisch hervorgehoben.';

  container.append(backBtn, h1, hint);

  // ─── Section 1: Monotonie & Extremstellen (combined, interactive) ───
  {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'mb-8 animate-slide-up';

    const heading = document.createElement('h2');
    heading.className = 'text-lg font-semibold mb-3 pb-2 border-b';
    heading.style.color = 'var(--color-primary)';
    heading.style.borderColor = 'var(--color-border)';
    heading.textContent = 'Monotonie & Extremstellen';
    sectionEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'grid gap-3';
    grid.style.gridTemplateColumns = '1fr';
    // Side-by-side on wider screens
    if (window.innerWidth >= 768) {
      grid.style.gridTemplateColumns = '1.4fr 1fr';
      grid.style.alignItems = 'start';
    }

    const graphCard = document.createElement('div');
    graphCard.className = 'card';
    graphCard.style.padding = '0.5rem 0.5rem 0.75rem';

    const rulesDiv = document.createElement('div');
    const nachweisDiv = document.createElement('div');
    nachweisDiv.className = 'mt-3';

    boards.push(...buildMonotonieExtremstellenSection(container, graphCard, rulesDiv, nachweisDiv));

    grid.appendChild(graphCard);
    grid.appendChild(rulesDiv);
    sectionEl.appendChild(grid);
    sectionEl.appendChild(nachweisDiv);

    container.appendChild(sectionEl);
  }

  // ─── Section 2: Wendestellen & Krümmung (combined, interactive) ───
  {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'mb-8 animate-slide-up';
    sectionEl.style.animationDelay = '60ms';

    const heading = document.createElement('h2');
    heading.className = 'text-lg font-semibold mb-3 pb-2 border-b';
    heading.style.color = 'var(--color-primary)';
    heading.style.borderColor = 'var(--color-border)';
    heading.textContent = 'Wendestellen & Kr\u00fcmmung';
    sectionEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'grid gap-3';
    grid.style.gridTemplateColumns = '1fr';
    if (window.innerWidth >= 768) {
      grid.style.gridTemplateColumns = '1.4fr 1fr';
      grid.style.alignItems = 'start';
    }

    const graphCard = document.createElement('div');
    graphCard.className = 'card';
    graphCard.style.padding = '0.5rem 0.5rem 0.75rem';

    const rulesDiv = document.createElement('div');
    const nachweisDiv = document.createElement('div');
    nachweisDiv.className = 'mt-3';

    boards.push(...buildWendestellenSection(container, graphCard, rulesDiv, nachweisDiv));

    grid.appendChild(graphCard);
    grid.appendChild(rulesDiv);
    sectionEl.appendChild(grid);
    sectionEl.appendChild(nachweisDiv);

    container.appendChild(sectionEl);
  }

  return () => { boards.forEach(destroyBoard); };
}
