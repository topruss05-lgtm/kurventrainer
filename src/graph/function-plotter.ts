import type { BoardElement } from './canvas-board.js';
import type { CanvasBoard } from './canvas-board.js';
import { createFunctionCurve, createPoint } from './canvas-renderer.js';

export interface PlotStyle {
  color?: string;
  strokeWidth?: number;
  dash?: number;
}

const COLORS = {
  primary: '#0d7377',   // teal
  secondary: '#c4582a', // terracotta
  tertiary: '#7c5cbf',  // purple
  muted: '#b8b4ac',     // warm gray
};

const DEFAULT_STYLES: PlotStyle[] = [
  { color: COLORS.primary, strokeWidth: 2.5 },
  { color: COLORS.secondary, strokeWidth: 2.5 },
  { color: COLORS.tertiary, strokeWidth: 2.5 },
];

export function plotFunction(
  board: CanvasBoard,
  fn: (x: number) => number,
  style?: PlotStyle,
  styleIndex: number = 0,
  xRange?: [number, number],
): BoardElement {
  const s = style ?? DEFAULT_STYLES[styleIndex % DEFAULT_STYLES.length];
  const el = createFunctionCurve(fn, {
    color: s.color ?? COLORS.primary,
    strokeWidth: s.strokeWidth ?? 2.5,
    dash: s.dash ?? 0,
    xRange,
  });
  board.addElement(el);
  board.update();
  return el;
}

export function highlightPoint(
  board: CanvasBoard,
  x: number,
  y: number,
  color: string = COLORS.primary,
  label?: string,
): BoardElement {
  const el = createPoint(x, y, {
    color,
    size: 5,
    label: label ?? '',
    labelOffset: [10, -12],
  });
  board.addElement(el);
  board.update();
  return el;
}

export { COLORS };
