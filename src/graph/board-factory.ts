import { CanvasBoard, type BoardOptions } from './canvas-board.js';

export type { BoardOptions };
export type { CanvasBoard };

const DEFAULTS: Required<BoardOptions> = {
  boundingBox: [-5, 10, 5, -10],
  showGrid: true,
  axis: true,
  height: 350,
  keepAspectRatio: false,
  targetTicks: 8,
};

export function createBoard(
  container: HTMLElement,
  options: BoardOptions = {},
): CanvasBoard {
  const opts = { ...DEFAULTS, ...options };

  const boardDiv = document.createElement('div');
  boardDiv.className = 'w-full rounded-xl overflow-hidden';
  container.appendChild(boardDiv);

  return new CanvasBoard(boardDiv, opts);
}

export function calcBoundingBox(
  fns: Array<(x: number) => number>,
  xRange: [number, number] = [-5, 5],
  padding = 0.15,
): [number, number, number, number] {
  const step = (xRange[1] - xRange[0]) / 400;
  const yValues: number[] = [];

  // Collect all y-values AND find local extrema
  const extremaY: number[] = [];

  for (const fn of fns) {
    let prev: number | null = null;
    let prevPrev: number | null = null;

    for (let x = xRange[0]; x <= xRange[1]; x += step) {
      const y = fn(x);
      if (!Number.isFinite(y)) { prev = null; prevPrev = null; continue; }

      yValues.push(y);

      // Detect local extrema (direction change in samples)
      if (prev !== null && prevPrev !== null) {
        const wasRising = prev > prevPrev;
        const nowFalling = y < prev;
        const wasFalling = prev < prevPrev;
        const nowRising = y > prev;
        if ((wasRising && nowFalling) || (wasFalling && nowRising)) {
          extremaY.push(prev);
        }
      }

      prevPrev = prev;
      prev = y;
    }
  }

  if (yValues.length === 0) {
    return [xRange[0] - 0.5, 10, xRange[1] + 0.5, -10];
  }

  let yMin: number;
  let yMax: number;

  if (extremaY.length > 0) {
    // Focus on local extrema — this is what matters for the student
    extremaY.push(0); // always include y=0 for context
    yMin = Math.min(...extremaY);
    yMax = Math.max(...extremaY);

    // Generous padding around extrema so the curve has room
    const span = Math.max(yMax - yMin, 1);
    yMin -= span * 0.4;
    yMax += span * 0.4;
  } else {
    // No extrema found — use full range (e.g. linear or strictly monotone)
    yValues.sort((a, b) => a - b);
    yMin = yValues[0];
    yMax = yValues[yValues.length - 1];

    const span = Math.max(yMax - yMin, 1);
    yMin -= span * padding;
    yMax += span * padding;
  }

  // Enforce minimum range
  if (yMin > -2) yMin = -2;
  if (yMax < 2) yMax = 2;

  return [xRange[0] - 0.5, yMax, xRange[1] + 0.5, yMin];
}

export function destroyBoard(board: CanvasBoard): void {
  board.destroy();
}
