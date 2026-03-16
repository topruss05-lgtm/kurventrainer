import type { CanvasBoard, BoardElement } from './canvas-board.js';
import { createPoint, createPolygon } from './canvas-renderer.js';

export interface SnapTarget {
  x: number;
  y: number;
}

const SNAP_TOLERANCE = 0.6; // units — generous for touch

export interface TapResult {
  target: SnapTarget | null;
  boardX: number;
  boardY: number;
}

export function addTapHandler(
  board: CanvasBoard,
  targets: SnapTarget[],
  onTap: (result: TapResult) => void,
): () => void {
  let downCoords: [number, number] | null = null;

  const onDown = (e: PointerEvent | TouchEvent) => {
    const coords = extractCoords(board, e);
    if (coords) downCoords = coords;
  };

  const onUp = (e: PointerEvent | TouchEvent) => {
    const coords = extractCoords(board, e);
    if (!coords || !downCoords) return;

    const dx = Math.abs(coords[0] - downCoords[0]);
    const dy = Math.abs(coords[1] - downCoords[1]);
    if (dx > 0.5 || dy > 0.5) {
      downCoords = null;
      return;
    }
    downCoords = null;

    const [bx, by] = coords;
    const closest = findClosestTarget(bx, by, targets);

    onTap({ target: closest, boardX: bx, boardY: by });
  };

  board.on('down', onDown);
  board.on('up', onUp);

  return () => {
    board.off('down', onDown);
    board.off('up', onUp);
  };
}

function extractCoords(board: CanvasBoard, e: PointerEvent | TouchEvent): [number, number] | null {
  let clientX: number;
  let clientY: number;

  if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
    const touch = e.changedTouches?.[0] ?? e.touches?.[0];
    if (!touch) return null;
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else if (e instanceof PointerEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return null;
  }

  return board.toMathCoords(clientX, clientY);
}

function findClosestTarget(x: number, y: number, targets: SnapTarget[]): SnapTarget | null {
  let closest: SnapTarget | null = null;
  let minDist = SNAP_TOLERANCE;

  for (const t of targets) {
    const dist = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = t;
    }
  }

  return closest;
}

export function addCurveTracker(
  board: CanvasBoard,
  fn: (x: number) => number,
  color: string = '#0d7377',
): () => void {
  const PROXIMITY = 1.5;

  const tracker = createPoint(0, 0, {
    color,
    size: 4,
    label: '',
    labelOffset: [10, -12],
  });
  tracker.visible = false;
  board.addElement(tracker);

  const hide = () => {
    tracker.visible = false;
    board.update();
  };

  const onMove = (e: PointerEvent | TouchEvent) => {
    const coords = extractCoords(board, e);
    if (!coords) return;
    const [rawX, mouseY] = coords;
    const bb = board.getBoundingBox();
    if (rawX < bb[0] || rawX > bb[2]) { hide(); return; }

    const x = Math.round(rawX * 2) / 2;
    const y = fn(x);
    if (!Number.isFinite(y) || Math.abs(mouseY - y) > PROXIMITY) { hide(); return; }

    const fmt = (v: number) => Number.isInteger(v) ? v.toString() : v.toFixed(1);
    tracker.setPosition(x, y);
    tracker.setLabel(`(${fmt(x)}|${fmt(y)})`);
    tracker.visible = true;
    board.update();
  };

  board.on('move', onMove);
  board.canvas.addEventListener('mouseleave', hide);
  board.canvas.addEventListener('touchend', hide);

  return () => {
    board.off('move', onMove);
    board.canvas.removeEventListener('mouseleave', hide);
    board.canvas.removeEventListener('touchend', hide);
    board.removeElement(tracker);
  };
}

export function createIntervalSelector(
  board: CanvasBoard,
  initialFrom: number,
  initialTo: number,
  color: string = '#0d7377',
): { getInterval: () => [number, number]; destroy: () => void } {
  const bb = board.getBoundingBox();
  const xMin = Math.ceil(bb[0]);
  const xMax = Math.floor(bb[2]);
  const top = bb[1];
  const bottom = bb[3];

  // State
  let fromX = initialFrom;
  let toX = initialTo;
  let activeGlider: 'from' | 'to' | null = null;

  // Visual elements
  const gliderFrom = createPoint(fromX, 0, {
    color, size: 8, label: 'von', labelOffset: [0, 16],
  });
  const gliderTo = createPoint(toX, 0, {
    color, size: 8, label: 'bis', labelOffset: [0, 16],
  });

  const polygon = createPolygon(
    [
      () => [fromX, bottom] as [number, number],
      () => [toX, bottom] as [number, number],
      () => [toX, top] as [number, number],
      () => [fromX, top] as [number, number],
    ],
    {
      fillColor: color,
      fillOpacity: 0.15,
      borderColor: color,
      borderWidth: 1.5,
      borderDash: 2,
    },
  );

  const elements: BoardElement[] = [polygon, gliderFrom, gliderTo];
  elements.forEach(el => board.addElement(el));
  board.update();

  // Drag handling
  const GLIDER_HIT_PX = 25;

  const onDown = (e: PointerEvent | TouchEvent) => {
    const coords = extractCoords(board, e);
    if (!coords) return;
    const [mx] = coords;
    const fromSx = board.toScreenX(fromX);
    const toSx = board.toScreenX(toX);
    const pointerSx = board.toScreenX(mx);

    if (Math.abs(pointerSx - fromSx) < GLIDER_HIT_PX) {
      activeGlider = 'from';
      e.preventDefault?.();
    } else if (Math.abs(pointerSx - toSx) < GLIDER_HIT_PX) {
      activeGlider = 'to';
      e.preventDefault?.();
    }
  };

  const onMove = (e: PointerEvent | TouchEvent) => {
    if (!activeGlider) return;
    const coords = extractCoords(board, e);
    if (!coords) return;

    const snapped = Math.max(xMin, Math.min(xMax, Math.round(coords[0] * 2) / 2));
    if (activeGlider === 'from') {
      fromX = snapped;
      gliderFrom.setPosition(snapped, 0);
    } else {
      toX = snapped;
      gliderTo.setPosition(snapped, 0);
    }
    board.update();
  };

  const onUp = () => {
    activeGlider = null;
  };

  board.on('down', onDown);
  board.on('move', onMove);
  board.on('up', onUp);

  return {
    getInterval: () => fromX < toX ? [fromX, toX] : [toX, fromX],
    destroy: () => {
      board.off('down', onDown);
      board.off('move', onMove);
      board.off('up', onUp);
      elements.forEach(el => board.removeElement(el));
      board.update();
    },
  };
}
