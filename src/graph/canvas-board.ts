export interface BoardOptions {
  boundingBox?: [number, number, number, number]; // [xMin, yMax, xMax, yMin]
  showGrid?: boolean;
  axis?: boolean;
  height?: number; // CSS px, default 350
  keepAspectRatio?: boolean; // if true, adjust bbox so 1 unit x = 1 unit y
}

export interface BoardElement {
  visible: boolean;
  draw(ctx: CanvasRenderingContext2D, board: CanvasBoard): void;
}

type EventName = 'down' | 'move' | 'up';

const GRID_COLOR = '#e8e6e3';
const AXIS_COLOR = '#b0ada8';
const TICK_COLOR = '#6b6966';
const FONT = '"DM Sans", sans-serif';

/** Find a "nice" step size for grid lines / tick marks */
function niceStep(range: number, targetTicks: number = 8): number {
  const raw = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let nice: number;
  if (norm < 1.5) nice = 1;
  else if (norm < 3.5) nice = 2;
  else if (norm < 7.5) nice = 5;
  else nice = 10;
  return nice * mag;
}

/** Format a tick value, avoiding floating-point artifacts */
function fmtTick(v: number): string {
  const s = v.toFixed(6);
  // strip trailing zeros but keep at least one decimal if needed
  return parseFloat(s).toString();
}

export class CanvasBoard {
  readonly canvas: HTMLCanvasElement;
  readonly container: HTMLElement;
  private ctx: CanvasRenderingContext2D;
  private elements: BoardElement[] = [];
  private bbox: [number, number, number, number]; // [xMin, yMax, xMax, yMin]
  private originalBbox: [number, number, number, number];
  private dpr: number;
  private cssW = 0;
  private cssH: number;
  private listeners = new Map<EventName, Set<(e: PointerEvent | TouchEvent) => void>>();
  private panState: { lastMidX: number; lastMidY: number } | null = null;
  private boundHandlers: { type: string; fn: (e: Event) => void }[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private keepAspectRatio: boolean = false;

  constructor(container: HTMLElement, options: BoardOptions = {}) {
    const defaults: Required<BoardOptions> = {
      boundingBox: [-5, 10, 5, -10],
      showGrid: true,
      axis: true,
      height: 350,
      keepAspectRatio: false,
    };
    const opts = { ...defaults, ...options };
    this.bbox = [...opts.boundingBox];
    this.originalBbox = [...opts.boundingBox];
    this.keepAspectRatio = opts.keepAspectRatio;
    this.container = container;
    this.dpr = window.devicePixelRatio || 1;
    this.cssH = opts.height;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = `${this.cssH}px`;
    this.canvas.style.display = 'block';
    this.canvas.style.borderRadius = '0.75rem';
    this.canvas.style.touchAction = 'pan-y';
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;

    // Init event system
    for (const name of ['down', 'move', 'up'] as EventName[]) {
      this.listeners.set(name, new Set());
    }
    this.attachEvents();

    // Use ResizeObserver to properly size canvas when it's laid out
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && w !== this.cssW) {
          this.sizeCanvas(w);
          this.update();
        }
      }
    });
    this.resizeObserver.observe(this.canvas);

    // Also try immediate sizing if already in DOM
    const w = this.canvas.clientWidth || container.clientWidth;
    if (w > 0) {
      this.sizeCanvas(w);
      this.update();
    }
  }

  /** Set canvas buffer size to match CSS layout size (HiDPI aware) */
  private sizeCanvas(cssWidth: number): void {
    this.cssW = cssWidth;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(this.cssW * this.dpr);
    this.canvas.height = Math.round(this.cssH * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 1:1 aspect ratio: recalculate from original bbox every time
    if (this.keepAspectRatio && this.cssW > 0 && this.cssH > 0) {
      const ob = this.originalBbox;
      const mathW = ob[2] - ob[0];
      const ratio = this.cssH / this.cssW;
      const neededMathH = mathW * ratio;
      const cy = (ob[1] + ob[3]) / 2;
      this.bbox = [ob[0], cy + neededMathH / 2, ob[2], cy - neededMathH / 2];
    }
  }

  // ── Coordinate conversion ────────────────────────────────────────

  get xMin(): number { return this.bbox[0]; }
  get yMax(): number { return this.bbox[1]; }
  get xMax(): number { return this.bbox[2]; }
  get yMin(): number { return this.bbox[3]; }
  private get xRange(): number { return this.bbox[2] - this.bbox[0]; }
  private get yRange(): number { return this.bbox[1] - this.bbox[3]; }

  toScreenX(mx: number): number {
    return (mx - this.bbox[0]) / this.xRange * this.cssW;
  }

  toScreenY(my: number): number {
    return (this.bbox[1] - my) / this.yRange * this.cssH;
  }

  toMathX(sx: number): number {
    return this.bbox[0] + sx / this.cssW * this.xRange;
  }

  toMathY(sy: number): number {
    return this.bbox[1] - sy / this.cssH * this.yRange;
  }

  /** Convert clientX/clientY (from event) to math coordinates */
  toMathCoords(clientX: number, clientY: number): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return [this.toMathX(sx), this.toMathY(sy)];
  }

  getBoundingBox(): [number, number, number, number] {
    return [...this.bbox];
  }

  // ── Element management ───────────────────────────────────────────

  addElement<T extends BoardElement>(el: T): T {
    this.elements.push(el);
    return el;
  }

  removeElement(el: BoardElement): void {
    const idx = this.elements.indexOf(el);
    if (idx >= 0) this.elements.splice(idx, 1);
  }

  // ── Redraw ───────────────────────────────────────────────────────

  update(): void {
    const ctx = this.ctx;
    const w = this.cssW;
    const h = this.cssH;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Grid + Axes
    this.drawGrid(ctx, w, h);
    this.drawAxes(ctx, w, h);

    // Elements
    ctx.save();
    for (const el of this.elements) {
      if (el.visible) {
        ctx.save();
        el.draw(ctx, this);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const xStep = niceStep(this.xRange);
    const yStep = niceStep(this.yRange);

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // Vertical grid lines
    let x0 = Math.ceil(this.bbox[0] / xStep) * xStep;
    for (let x = x0; x <= this.bbox[2]; x += xStep) {
      const sx = this.toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }

    // Horizontal grid lines
    let y0 = Math.ceil(this.bbox[3] / yStep) * yStep;
    for (let y = y0; y <= this.bbox[1]; y += yStep) {
      const sy = this.toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }

    ctx.stroke();
  }

  private drawAxes(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const xStep = niceStep(this.xRange);
    const yStep = niceStep(this.yRange);
    const axisX = this.toScreenX(0);
    const axisY = this.toScreenY(0);

    // Axis lines
    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // y-axis
    if (axisX >= 0 && axisX <= w) {
      ctx.moveTo(axisX, 0);
      ctx.lineTo(axisX, h);
    }
    // x-axis
    if (axisY >= 0 && axisY <= h) {
      ctx.moveTo(0, axisY);
      ctx.lineTo(w, axisY);
    }
    ctx.stroke();

    // Arrow heads
    ctx.fillStyle = AXIS_COLOR;
    if (axisX >= 0 && axisX <= w) {
      // top arrow
      ctx.beginPath();
      ctx.moveTo(axisX, 0);
      ctx.lineTo(axisX - 4, 8);
      ctx.lineTo(axisX + 4, 8);
      ctx.fill();
    }
    if (axisY >= 0 && axisY <= h) {
      // right arrow
      ctx.beginPath();
      ctx.moveTo(w, axisY);
      ctx.lineTo(w - 8, axisY - 4);
      ctx.lineTo(w - 8, axisY + 4);
      ctx.fill();
    }

    // Tick labels
    ctx.fillStyle = TICK_COLOR;
    ctx.font = `11px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // x-axis ticks
    let x0 = Math.ceil(this.bbox[0] / xStep) * xStep;
    for (let x = x0; x <= this.bbox[2]; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue; // skip 0
      const sx = this.toScreenX(x);
      const ty = Math.min(Math.max(axisY + 4, 2), h - 14);
      ctx.fillText(fmtTick(x), sx, ty);
    }

    // y-axis ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    let y0 = Math.ceil(this.bbox[3] / yStep) * yStep;
    for (let y = y0; y <= this.bbox[1]; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue; // skip 0
      const sy = this.toScreenY(y);
      const tx = Math.min(Math.max(axisX - 4, 24), w - 2);
      ctx.fillText(fmtTick(y), tx, sy);
    }
  }

  // ── Event system ─────────────────────────────────────────────────

  on(event: EventName, handler: (e: PointerEvent | TouchEvent) => void): void {
    this.listeners.get(event)?.add(handler);
  }

  off(event: EventName, handler: (e: PointerEvent | TouchEvent) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: EventName, e: PointerEvent | TouchEvent): void {
    this.listeners.get(event)?.forEach(fn => fn(e));
  }

  private attachEvents(): void {
    const el = this.canvas;

    const onPointerDown = (e: PointerEvent) => {
      this.emit('down', e);
    };
    const onPointerMove = (e: PointerEvent) => {
      this.emit('move', e);
    };
    const onPointerUp = (e: PointerEvent) => {
      this.emit('up', e);
    };

    // Two-finger pan
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        const mid = touchMidpoint(e);
        this.panState = { lastMidX: mid[0], lastMidY: mid[1] };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (this.panState && e.touches.length >= 2) {
        e.preventDefault();
        const mid = touchMidpoint(e);
        const [mx1, my1] = this.toMathCoords(this.panState.lastMidX, this.panState.lastMidY);
        const [mx2, my2] = this.toMathCoords(mid[0], mid[1]);
        const dx = mx1 - mx2;
        const dy = my1 - my2;
        this.bbox = [
          this.bbox[0] + dx, this.bbox[1] + dy,
          this.bbox[2] + dx, this.bbox[3] + dy,
        ];
        this.panState = { lastMidX: mid[0], lastMidY: mid[1] };
        this.update();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        this.panState = null;
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    this.boundHandlers = [
      { type: 'pointerdown', fn: onPointerDown as (e: Event) => void },
      { type: 'pointermove', fn: onPointerMove as (e: Event) => void },
      { type: 'pointerup', fn: onPointerUp as (e: Event) => void },
      { type: 'touchstart', fn: onTouchStart as (e: Event) => void },
      { type: 'touchmove', fn: onTouchMove as (e: Event) => void },
      { type: 'touchend', fn: onTouchEnd as (e: Event) => void },
    ];
  }

  // ── Cleanup ──────────────────────────────────────────────────────

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    for (const { type, fn } of this.boundHandlers) {
      this.canvas.removeEventListener(type, fn);
    }
    this.boundHandlers = [];
    this.elements = [];
    this.listeners.clear();
    this.canvas.remove();
  }
}

function touchMidpoint(e: TouchEvent): [number, number] {
  const t0 = e.touches[0];
  const t1 = e.touches[1];
  return [(t0.clientX + t1.clientX) / 2, (t0.clientY + t1.clientY) / 2];
}
