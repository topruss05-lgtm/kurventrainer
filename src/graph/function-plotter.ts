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
  board: JXG.Board,
  fn: (x: number) => number,
  style?: PlotStyle,
  styleIndex: number = 0,
  xRange?: [number, number],
): JXG.GeometryElement {
  const s = style ?? DEFAULT_STYLES[styleIndex % DEFAULT_STYLES.length];
  const graphArgs: unknown[] = xRange ? [fn, xRange[0], xRange[1]] : [fn];

  return board.create('functiongraph', graphArgs, {
    strokeColor: s.color ?? COLORS.primary,
    strokeWidth: s.strokeWidth ?? 2.5,
    dash: s.dash ?? 0,
    highlight: false,
    hasInfobox: false,
  });
}

export function highlightPoint(
  board: JXG.Board,
  x: number,
  y: number,
  color: string = COLORS.primary,
  label?: string,
): JXG.GeometryElement {
  return board.create('point', [x, y], {
    fixed: true,
    size: 5,
    fillColor: color,
    strokeColor: color,
    name: label ?? '',
    label: label ? { fontSize: 14, offset: [10, 10] } : { visible: false },
    highlight: false,
    showInfobox: false,
  });
}

export { COLORS };
