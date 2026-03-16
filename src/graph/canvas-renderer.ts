import type { BoardElement } from './canvas-board.js';

const FONT = '"DM Sans", sans-serif';

// ── Function curve with adaptive sampling ──────────────────────────

interface CurveOptions {
  color: string;
  strokeWidth?: number;
  dash?: number;
  opacity?: number;
  xRange?: [number, number];
}

export function createFunctionCurve(
  fn: (x: number) => number,
  options: CurveOptions,
): BoardElement {
  const sw = options.strokeWidth ?? 2.5;
  const dash = options.dash ?? 0;
  const opacity = options.opacity ?? 1;

  return {
    visible: true,
    draw(ctx, board) {
      const xMin = options.xRange?.[0] ?? board.xMin;
      const xMax = options.xRange?.[1] ?? board.xMax;
      const samples = adaptiveSample(fn, xMin, xMax);

      ctx.globalAlpha = opacity;
      ctx.strokeStyle = options.color;
      ctx.lineWidth = sw;
      if (dash > 0) ctx.setLineDash([dash * 3, dash * 2]);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      let drawing = false;
      for (const [x, y] of samples) {
        if (!Number.isFinite(y)) { drawing = false; continue; }
        const sx = board.toScreenX(x);
        const sy = board.toScreenY(y);
        if (!drawing) { ctx.moveTo(sx, sy); drawing = true; }
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    },
  };
}

// ── Point ──────────────────────────────────────────────────────────

interface PointOptions {
  color: string;
  size?: number;
  label?: string;
  labelOffset?: [number, number];
}

export interface PointElement extends BoardElement {
  x: number;
  y: number;
  label: string;
  setPosition(x: number, y: number): void;
  setLabel(text: string): void;
}

export function createPoint(
  x: number, y: number, options: PointOptions,
): PointElement {
  const size = options.size ?? 5;
  const offset = options.labelOffset ?? [10, -12];

  const el: PointElement = {
    visible: true,
    x, y,
    label: options.label ?? '',
    setPosition(nx, ny) { el.x = nx; el.y = ny; },
    setLabel(t) { el.label = t; },
    draw(ctx, board) {
      const sx = board.toScreenX(el.x);
      const sy = board.toScreenY(el.y);

      ctx.fillStyle = options.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (el.label) {
        ctx.fillStyle = options.color;
        ctx.font = `500 12px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(el.label, sx + offset[0], sy + offset[1]);
      }
    },
  };
  return el;
}

// ── Line / Segment ─────────────────────────────────────────────────

interface LineOptions {
  color: string;
  strokeWidth?: number;
  dash?: number;
  extend?: boolean; // if true, draw across full board
}

export interface LineElement extends BoardElement {
  setEndpoints(p1: [number, number], p2: [number, number]): void;
}

export function createLine(
  p1: [number, number], p2: [number, number], options: LineOptions,
): LineElement {
  let a = p1, b = p2;
  const sw = options.strokeWidth ?? 1.5;
  const dash = options.dash ?? 0;

  const el: LineElement = {
    visible: true,
    setEndpoints(np1, np2) { a = np1; b = np2; },
    draw(ctx, board) {
      ctx.strokeStyle = options.color;
      ctx.lineWidth = sw;
      if (dash > 0) ctx.setLineDash([dash * 3, dash * 2]);
      ctx.beginPath();
      ctx.moveTo(board.toScreenX(a[0]), board.toScreenY(a[1]));
      ctx.lineTo(board.toScreenX(b[0]), board.toScreenY(b[1]));
      ctx.stroke();
      ctx.setLineDash([]);
    },
  };
  return el;
}

// ── Area fill between function and x-axis ──────────────────────────

interface AreaOptions {
  color: string;
  opacity?: number;
}

export function createAreaFill(
  fn: (x: number) => number, a: number, b: number, options: AreaOptions,
): BoardElement {
  const opacity = options.opacity ?? 0.18;
  return {
    visible: true,
    draw(ctx, board) {
      const n = 100;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = options.color;
      ctx.beginPath();
      ctx.moveTo(board.toScreenX(a), board.toScreenY(0));
      for (let i = 0; i <= n; i++) {
        const x = a + (b - a) * i / n;
        const y = fn(x);
        if (Number.isFinite(y)) {
          ctx.lineTo(board.toScreenX(x), board.toScreenY(y));
        }
      }
      ctx.lineTo(board.toScreenX(b), board.toScreenY(0));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  };
}

// ── Curve (precomputed arrays) ─────────────────────────────────────

interface CurveArrayOptions {
  color: string;
  strokeWidth?: number;
  opacity?: number;
}

export function createCurve(
  xs: number[], ys: number[], options: CurveArrayOptions,
): BoardElement {
  const sw = options.strokeWidth ?? 6;
  const opacity = options.opacity ?? 0.3;
  return {
    visible: true,
    draw(ctx, board) {
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = options.color;
      ctx.lineWidth = sw;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        const sx = board.toScreenX(xs[i]);
        const sy = board.toScreenY(ys[i]);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  };
}

// ── Text label ─────────────────────────────────────────────────────

interface TextOptions {
  fontSize?: number;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  background?: string; // background pill color (e.g. 'rgba(255,255,255,0.85)')
}

export function createText(
  x: number, y: number, text: string, options: TextOptions,
): BoardElement {
  const fontSize = options.fontSize ?? 12;
  const bg = options.background;
  return {
    visible: true,
    draw(ctx, board) {
      const font = `600 ${fontSize}px ${FONT}`;
      ctx.font = font;
      ctx.textAlign = options.align ?? 'left';
      ctx.textBaseline = options.baseline ?? 'middle';
      const lines = text.split('\n');
      const sx = board.toScreenX(x);
      let sy = board.toScreenY(y);
      for (const line of lines) {
        if (bg) {
          const m = ctx.measureText(line);
          const pad = 4;
          const tw = m.width + pad * 2;
          const th = fontSize + pad * 2;
          let rx = sx - pad;
          if (options.align === 'center') rx = sx - tw / 2;
          else if (options.align === 'right') rx = sx - tw + pad;
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.roundRect(rx, sy - th / 2, tw, th, 4);
          ctx.fill();
        }
        ctx.fillStyle = options.color;
        ctx.fillText(line, sx, sy);
        sy += fontSize * 1.4;
      }
    },
  };
}

// ── Polygon ────────────────────────────────────────────────────────

type VertexSource = [number, number] | (() => [number, number]);

interface PolygonOptions {
  fillColor: string;
  fillOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: number;
}

export function createPolygon(
  vertices: VertexSource[], options: PolygonOptions,
): BoardElement {
  const fillOpacity = options.fillOpacity ?? 0.15;
  const borderWidth = options.borderWidth ?? 0;
  const borderDash = options.borderDash ?? 0;

  return {
    visible: true,
    draw(ctx, board) {
      if (vertices.length < 2) return;
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = options.fillColor;
      ctx.beginPath();
      for (let i = 0; i < vertices.length; i++) {
        const v = typeof vertices[i] === 'function'
          ? (vertices[i] as () => [number, number])()
          : vertices[i] as [number, number];
        const sx = board.toScreenX(v[0]);
        const sy = board.toScreenY(v[1]);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      if (borderWidth > 0 && options.borderColor) {
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = borderWidth;
        if (borderDash > 0) ctx.setLineDash([borderDash * 3, borderDash * 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    },
  };
}

// ── Interval band (full-height vertical stripe) ────────────────────

interface BandOptions {
  color: string;
  opacity?: number;
}

export function createIntervalBand(
  xFrom: number, xTo: number, options: BandOptions,
): BoardElement {
  const opacity = options.opacity ?? 0.1;
  return {
    visible: true,
    draw(ctx, board) {
      const sx1 = board.toScreenX(xFrom);
      const sx2 = board.toScreenX(xTo);
      const bb = board.getBoundingBox();
      const sy1 = board.toScreenY(bb[1]);
      const sy2 = board.toScreenY(bb[3]);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = options.color;
      ctx.fillRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
      ctx.globalAlpha = 1;
    },
  };
}

// ── Adaptive sampling for function curves ──────────────────────────

function adaptiveSample(
  fn: (x: number) => number,
  xMin: number, xMax: number,
  baseCount = 400, maxDepth = 3,
): [number, number][] {
  // Initial uniform samples
  const points: [number, number][] = [];
  const step = (xMax - xMin) / baseCount;
  for (let i = 0; i <= baseCount; i++) {
    const x = xMin + step * i;
    points.push([x, fn(x)]);
  }

  // Refine segments with high curvature
  return refine(fn, points, maxDepth);
}

function refine(
  fn: (x: number) => number,
  pts: [number, number][],
  depth: number,
): [number, number][] {
  if (depth <= 0 || pts.length > 1200) return pts;

  const result: [number, number][] = [pts[0]];
  let refined = false;

  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];

    // Check if midpoint deviates significantly from linear interpolation
    const mx = (x0 + x1) / 2;
    const my = fn(mx);
    const interpY = (y0 + y1) / 2;

    if (Number.isFinite(my) && Number.isFinite(y0) && Number.isFinite(y1)
        && Math.abs(my - interpY) > 0.05 * (Math.abs(y0) + Math.abs(y1) + 1)) {
      result.push([mx, my]);
      refined = true;
    }
    result.push(pts[i]);
  }

  return refined ? refine(fn, result, depth - 1) : result;
}
