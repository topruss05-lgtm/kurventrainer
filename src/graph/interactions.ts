import JXG from 'jsxgraph';

export interface SnapTarget {
  x: number;
  y: number;
}

const SNAP_TOLERANCE = 0.6; // units on x-axis — generous for touch

export interface TapResult {
  target: SnapTarget | null;
  boardX: number;
  boardY: number;
}

export function addTapHandler(
  board: JXG.Board,
  targets: SnapTarget[],
  onTap: (result: TapResult) => void,
): () => void {
  // Use JSXGraph's own event system for reliable cross-device handling
  let downCoords: [number, number] | null = null;

  const onDown = (e: Event) => {
    const coords = getCoords(board, e);
    if (coords) downCoords = coords;
  };

  const onUp = (e: Event) => {
    const coords = getCoords(board, e);
    if (!coords || !downCoords) return;

    // Only register as tap if the pointer didn't move much (not a drag/pan)
    const dx = Math.abs(coords[0] - downCoords[0]);
    const dy = Math.abs(coords[1] - downCoords[1]);
    if (dx > 0.5 || dy > 0.5) {
      downCoords = null;
      return;
    }
    downCoords = null;

    const [bx, by] = coords;
    const closest = findClosestTarget(bx, by, targets);

    onTap({
      target: closest,
      boardX: bx,
      boardY: by,
    });
  };

  // Register through JSXGraph for proper coordination with pan/zoom
  board.on('down', onDown);
  board.on('up', onUp);

  return () => {
    board.off('down', onDown);
    board.off('up', onUp);
  };
}

function getCoords(board: JXG.Board, e: Event): [number, number] | null {
  // JSXGraph's event system passes the raw event; extract position
  let clientX: number;
  let clientY: number;

  if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
    const touch = e.changedTouches?.[0] ?? e.touches?.[0];
    if (!touch) return null;
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else if (e instanceof PointerEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return null;
  }

  const rect = board.containerObj.getBoundingClientRect();
  const absX = clientX - rect.left;
  const absY = clientY - rect.top;

  const coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [absX, absY], board);
  return [coords.usrCoords[1], coords.usrCoords[2]];
}

function findClosestTarget(x: number, y: number, targets: SnapTarget[]): SnapTarget | null {
  let closest: SnapTarget | null = null;
  let minDist = SNAP_TOLERANCE;

  for (const t of targets) {
    // Use both x and y distance for better accuracy
    const dist = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = t;
    }
  }

  return closest;
}

export function addCurveTracker(
  board: JXG.Board,
  fn: (x: number) => number,
  color: string = '#0d7377',
): () => void {
  const PROXIMITY = 1.5;

  const tracker = board.create('point', [0, 0], {
    size: 4,
    fillColor: 'white',
    strokeColor: color,
    strokeWidth: 2,
    fixed: true,
    highlight: false,
    showInfobox: false,
    name: '',
    label: { fontSize: 12, offset: [10, 12] },
    visible: false,
  }) as JXG.GeometryElement;

  const hide = () => { tracker.setAttribute({ visible: false }); board.update(); };

  const onMove = (e: Event) => {
    const coords = getCoords(board, e);
    if (!coords) return;
    const [rawX, mouseY] = coords;
    const bb = board.getBoundingBox();
    if (rawX < bb[0] || rawX > bb[2]) { hide(); return; }

    const x = Math.round(rawX * 2) / 2;
    const y = fn(x);
    if (!Number.isFinite(y) || Math.abs(mouseY - y) > PROXIMITY) { hide(); return; }

    const fmt = (v: number) => Number.isInteger(v) ? v.toString() : v.toFixed(1);
    tracker.setPosition(JXG.COORDS_BY_USER, [x, y]);
    tracker.setName(`(${fmt(x)}|${fmt(y)})`);
    tracker.setAttribute({ visible: true });
    board.update();
  };

  const container = board.containerObj;
  board.on('move', onMove);
  container.addEventListener('mouseleave', hide);
  container.addEventListener('touchend', hide);

  return () => {
    board.off('move', onMove);
    container.removeEventListener('mouseleave', hide);
    container.removeEventListener('touchend', hide);
    board.removeObject(tracker);
  };
}

export function createIntervalSelector(
  board: JXG.Board,
  initialFrom: number,
  initialTo: number,
  color: string = '#0d7377',
): { getInterval: () => [number, number]; destroy: () => void } {
  // Create a hidden segment spanning exactly the board's x-range
  // so gliders can't be dragged beyond the visible area
  const boardBB = board.getBoundingBox(); // [xMin, yMax, xMax, yMin]
  const xMin = Math.ceil(boardBB[0]);
  const xMax = Math.floor(boardBB[2]);

  const rail = board.create('segment', [[xMin, 0], [xMax, 0]], {
    visible: false,
    fixed: true,
    highlight: false,
  } as Record<string, unknown>);

  const makeGlider = (initial: number, label: string) => {
    const g = board.create('glider', [initial, 0, rail], {
      size: 8,
      fillColor: color,
      strokeColor: color,
      name: label,
      label: { fontSize: 12, offset: [0, -20] },
      showInfobox: false,
    } as Record<string, unknown>) as JXG.GeometryElement & { X(): number };

    // Snap to integer, clamp to board range on every drag
    g.on('drag', () => {
      const snapped = Math.max(xMin, Math.min(xMax, Math.round(g.X())));
      (g as unknown as { setPosition(t: number, c: number[]): void })
        .setPosition(JXG.COORDS_BY_USER, [snapped, 0]);
      board.update();
    });
    return g;
  };

  const gliderFrom = makeGlider(initialFrom, 'von');
  const gliderTo   = makeGlider(initialTo,   'bis');

  // Shaded area between gliders
  const top = boardBB[1];
  const bottom = boardBB[3];

  const polygon = board.create('polygon', [
    [() => gliderFrom.X(), bottom],
    [() => gliderTo.X(), bottom],
    [() => gliderTo.X(), top],
    [() => gliderFrom.X(), top],
  ], {
    fillColor: color,
    fillOpacity: 0.15,
    borders: { strokeColor: color, strokeWidth: 1.5, dash: 2 },
    vertices: { visible: false },
    fixed: true,
    highlight: false,
  } as Record<string, unknown>);

  return {
    getInterval: () => {
      const a = gliderFrom.X();
      const b = gliderTo.X();
      return a < b ? [a, b] : [b, a];
    },
    destroy: () => {
      board.removeObject(polygon as JXG.GeometryElement);
      board.removeObject(gliderTo as JXG.GeometryElement);
      board.removeObject(gliderFrom as JXG.GeometryElement);
      board.removeObject(rail as JXG.GeometryElement);
    },
  };
}
