import JXG from 'jsxgraph';

export interface BoardOptions {
  boundingBox?: [number, number, number, number]; // [xMin, yMax, xMax, yMin]
  showNavigation?: boolean;
  showGrid?: boolean;
  keepAspectRatio?: boolean;
}

const DEFAULTS: Required<BoardOptions> = {
  boundingBox: [-5, 10, 5, -10],
  showNavigation: false,
  showGrid: true,
  keepAspectRatio: false,
};

export function createBoard(
  container: HTMLElement,
  options: BoardOptions = {},
): JXG.Board {
  const opts = { ...DEFAULTS, ...options };

  const boardDiv = document.createElement('div');
  boardDiv.id = `jxg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  boardDiv.className = 'w-full rounded-xl overflow-hidden';
  boardDiv.style.minHeight = '300px';
  boardDiv.style.height = '350px';
  container.appendChild(boardDiv);

  const board = JXG.JSXGraph.initBoard(boardDiv, {
    boundingbox: opts.boundingBox,
    axis: true,
    showNavigation: opts.showNavigation,
    showCopyright: false,
    keepAspectRatio: opts.keepAspectRatio,
    pan: { enabled: true, needTwoFingers: true },
  } as unknown as Record<string, unknown>);

  return board;
}

export function calcBoundingBox(
  fns: Array<(x: number) => number>,
  xRange: [number, number] = [-5, 5],
  padding = 0.15,
): [number, number, number, number] {
  let yMin = Infinity;
  let yMax = -Infinity;
  const step = (xRange[1] - xRange[0]) / 200;

  for (const fn of fns) {
    for (let x = xRange[0]; x <= xRange[1]; x += step) {
      const y = fn(x);
      if (Number.isFinite(y)) {
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
  }

  if (!Number.isFinite(yMin)) { yMin = -10; yMax = 10; }

  const ySpan = Math.max(yMax - yMin, 1);
  yMin -= ySpan * padding;
  yMax += ySpan * padding;

  // Enforce minimum range so small functions don't over-zoom
  if (yMin > -10) yMin = Math.min(yMin, -2);
  if (yMax < 10) yMax = Math.max(yMax, 2);

  // Add x-padding so curve ends cleanly before the edge
  return [xRange[0] - 0.5, yMax, xRange[1] + 0.5, yMin];
}

export function destroyBoard(board: JXG.Board): void {
  JXG.JSXGraph.freeBoard(board);
}
