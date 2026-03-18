import type { IdentifyPointsExercise, MonotonicityInterval } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';
import { addTapHandler, addCurveTracker, createIntervalSelector } from '../graph/interactions.js';
import { createIntervalBand } from '../graph/canvas-renderer.js';

function isIntervalExercise(exercise: IdentifyPointsExercise): boolean {
  return exercise.targetType === 'monoton-steigend' || exercise.targetType === 'monoton-fallend';
}

export function renderIdentifyPoints(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): (() => void) | null {
  if (isIntervalExercise(exercise)) {
    return renderIntervalExercise(container, exercise, onComplete);
  }
  return renderPointExercise(container, exercise, onComplete);
}

function renderPointExercise(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): (() => void) | null {
  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-4';
  prompt.textContent = exercise.prompt;

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-4';

  // Append to container first so JSXGraph can measure
  container.append(prompt, graphContainer);

  const board = createBoard(graphContainer, { boundingBox: calcBoundingBox([exercise.function.fn]) });
  const bb0 = board.getBoundingBox();
  const xRange0: [number, number] = [Math.ceil(bb0[0]), Math.floor(bb0[2])];
  plotFunction(board, exercise.function.fn, undefined, 0, xRange0);
  const removeTracker = addCurveTracker(board, exercise.function.fn);

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  const selectedPoints: Array<{ x: number; y: number }> = [];

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary mt-3 w-full py-2.5 hidden';
  submitBtn.textContent = 'Antwort prüfen';

  const selectedInfo = document.createElement('p');
  selectedInfo.className = 'text-sm mt-2';
  selectedInfo.style.color = 'var(--color-ink-muted)';
  selectedInfo.textContent = `${exercise.targets.length} Stelle(n) gesucht. Tippe auf den Graph.`;

  let answered = false;

  const pointMarkers: import('../graph/canvas-board.js').BoardElement[] = [];

  const removeTap = addTapHandler(board, exercise.targets, (result) => {
    if (answered) return;

    const x = Math.round(result.boardX * 2) / 2;
    const y = exercise.function.fn(x);
    if (!Number.isFinite(y)) return;

    // Skip if same point already selected
    const already = selectedPoints.some(p => Math.abs(p.x - x) < 0.1);
    if (already) return;

    // If max reached, remove oldest
    if (selectedPoints.length >= exercise.targets.length) {
      selectedPoints.shift();
      const old = pointMarkers.shift();
      if (old) board.removeElement(old);
    }

    selectedPoints.push({ x, y });
    const fmt = (v: number) => Number.isInteger(v) ? v.toString() : v.toFixed(1);
    pointMarkers.push(highlightPoint(board, x, y, COLORS.primary, `(${fmt(x)}|${fmt(y)})`));
    selectedInfo.textContent = `${selectedPoints.length}/${exercise.targets.length} ausgewählt`;

    if (selectedPoints.length >= exercise.targets.length) {
      submitBtn.classList.remove('hidden');
    } else {
      submitBtn.classList.add('hidden');
    }
  });

  submitBtn.addEventListener('click', () => {
    if (answered) return;
    answered = true;

    const allCorrect = exercise.targets.every(t =>
      selectedPoints.some(s => Math.abs(s.x - t.x) < 0.5),
    );

    recordResult(exercise.module, exercise.id, allCorrect);

    for (const t of exercise.targets) {
      highlightPoint(board, t.x, t.y, COLORS.tertiary, '\u2713');
    }

    feedbackDiv.classList.remove('hidden');
    if (allCorrect) {
      feedbackDiv.className = 'feedback-correct animate-fade-in';
      feedbackDiv.textContent = 'Richtig! ' + exercise.feedbackExplanation;
    } else {
      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
      feedbackDiv.textContent = 'Nicht ganz. ' + exercise.feedbackExplanation;
    }

    submitBtn.classList.add('hidden');
    onComplete();
  });

  container.append(selectedInfo, submitBtn, feedbackDiv);

  return () => {
    removeTracker();
    removeTap();
    destroyBoard(board);
  };
}

function renderIntervalExercise(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): (() => void) | null {
  if (exercise.correctIntervals && exercise.intervalBounds !== undefined) {
    if (exercise.extremaOptions) {
      return renderTwoPhaseIntervalExercise(container, exercise, onComplete);
    }
    return renderClassifyIntervalExercise(container, exercise, onComplete);
  }
  return renderSliderIntervalExercise(container, exercise, onComplete);
}

// ─── Interval classification: tap steigend/fallend per interval ───

const SMW_COLOR = '#2e7d32';
const SMF_COLOR = '#c62828';

function formatBound(val: number | string): string {
  if (val === '-\u221e') return '\u2212\u221e';
  if (val === '+\u221e') return '+\u221e';
  return String(val);
}

// ─── K2: Two-phase — pick extrema, then classify intervals ───

function renderTwoPhaseIntervalExercise(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): (() => void) | null {
  const opts = exercise.extremaOptions!;
  const correct = exercise.correctIntervals!;

  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-4';
  prompt.textContent = exercise.prompt;

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-4';

  container.append(prompt, graphContainer);

  const board = createBoard(graphContainer, { boundingBox: calcBoundingBox([exercise.function.fn]) });
  const bb = board.getBoundingBox();
  const xRange: [number, number] = [Math.ceil(bb[0]), Math.floor(bb[2])];
  plotFunction(board, exercise.function.fn, undefined, 0, xRange);

  // ─── Phase 1: Extremstellen auswählen ───
  const phase1 = document.createElement('div');
  phase1.className = 'animate-fade-in';

  const p1Label = document.createElement('p');
  p1Label.style.cssText = 'font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9rem;';
  p1Label.textContent = opts.prompt ?? 'An welchen Stellen \u00e4ndert f ihr Monotonieverhalten? W\u00e4hle alle aus.';
  phase1.appendChild(p1Label);

  const chipGrid = document.createElement('div');
  chipGrid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;';

  const selected = new Set<number>();

  opts.xValues.forEach((xVal, idx) => {
    const chip = document.createElement('button');
    chip.style.cssText = `
      padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.9rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s; min-height: 40px;
      border: 2px solid var(--color-border); background: var(--color-surface); color: var(--color-ink);
    `;
    chip.textContent = `x = ${xVal}`;

    chip.addEventListener('click', () => {
      if (chip.dataset.locked === 'true') return;
      if (selected.has(idx)) {
        selected.delete(idx);
        chip.style.borderColor = 'var(--color-border)';
        chip.style.backgroundColor = 'var(--color-surface)';
        chip.style.color = 'var(--color-ink)';
      } else {
        selected.add(idx);
        chip.style.borderColor = 'var(--color-primary)';
        chip.style.backgroundColor = 'var(--color-primary-light, #e0f2f1)';
        chip.style.color = 'var(--color-primary)';
      }
    });

    chipGrid.appendChild(chip);
  });

  const p1Submit = document.createElement('button');
  p1Submit.className = 'btn-primary w-full py-2.5';
  p1Submit.style.minHeight = '44px';
  p1Submit.textContent = 'Pr\u00fcfen';

  const p1Feedback = document.createElement('div');
  p1Feedback.className = 'hidden';

  phase1.append(chipGrid, p1Submit, p1Feedback);
  container.appendChild(phase1);

  const bandElements: import('../graph/canvas-board.js').BoardElement[] = [];

  p1Submit.addEventListener('click', () => {
    if (p1Submit.dataset.locked === 'true') return;
    p1Submit.dataset.locked = 'true';

    const correctSet = new Set(opts.correctIndices);
    const isCorrect = selected.size === correctSet.size && [...selected].every(i => correctSet.has(i));

    // Lock all chips
    chipGrid.querySelectorAll('button').forEach((b, idx) => {
      const el = b as HTMLElement;
      el.dataset.locked = 'true';
      el.style.cursor = 'default';
      if (correctSet.has(idx)) {
        el.style.borderColor = 'var(--color-success)';
        el.style.backgroundColor = 'var(--color-success-bg)';
        el.style.color = 'var(--color-success)';
      } else if (selected.has(idx)) {
        el.style.borderColor = 'var(--color-error)';
        el.style.backgroundColor = 'var(--color-error-bg)';
        el.style.color = 'var(--color-error)';
      }
    });

    // Highlight correct extrema on graph
    const correctXValues = opts.correctIndices.map(i => opts.xValues[i]);
    for (const x of correctXValues) {
      const y = exercise.function.fn(x);
      highlightPoint(board, x, y, COLORS.tertiary, `x=${x}`);
    }

    p1Submit.classList.add('hidden');

    if (!isCorrect) {
      p1Feedback.classList.remove('hidden');
      p1Feedback.className = 'feedback-incorrect animate-fade-in mb-3';
      const correctStr = correctXValues.map(x => `x = ${x}`).join(' und ');
      p1Feedback.textContent = `Nicht ganz. Das Monotonieverhalten \u00e4ndert sich bei ${correctStr}.`;
    }

    // ─── Phase 2: Classify intervals (appears after Phase 1) ───
    // Build intervals from correct extrema
    const bounds = correctXValues.sort((a, b) => a - b);
    const allPoints: (number | string)[] = [
      ...(exercise.includeInfinity ? ['-\u221e'] : []),
      ...bounds,
      ...(exercise.includeInfinity ? ['+\u221e'] : []),
    ];

    const intervalPairs: Array<{ from: number | string; to: number | string }> = [];
    for (let i = 0; i < allPoints.length - 1; i++) {
      intervalPairs.push({ from: allPoints[i], to: allPoints[i + 1] });
    }

    const phase2 = document.createElement('div');
    phase2.className = 'animate-fade-in mt-4';

    const p2Label = document.createElement('p');
    p2Label.style.cssText = 'font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9rem;';
    p2Label.textContent = 'Bestimme jetzt f\u00fcr jedes Intervall: steigend oder fallend?';
    phase2.appendChild(p2Label);

    const rowsContainer = document.createElement('div');
    rowsContainer.style.cssText = 'display: grid; gap: 0.625rem; margin-bottom: 1rem;';

    const selections: Array<{ type: 'smw' | 'smf' | null; from: number | string; to: number | string }> = [];
    let phase2Answered = false;

    function updateBands(): void {
      for (const el of bandElements) board.removeElement(el);
      bandElements.length = 0;
      for (const sel of selections) {
        if (!sel.type) continue;
        const xFrom = sel.from === '-\u221e' ? bb[0] : sel.from as number;
        const xTo = sel.to === '+\u221e' ? bb[2] : sel.to as number;
        const color = sel.type === 'smw' ? SMW_COLOR : SMF_COLOR;
        const band = createIntervalBand(xFrom, xTo, { color, opacity: 0.15 });
        board.addElement(band);
        bandElements.push(band);
      }
      board.update();
    }

    intervalPairs.forEach((pair) => {
      const state = { type: null as 'smw' | 'smf' | null, from: pair.from, to: pair.to };
      selections.push(state);

      const row = document.createElement('div');
      row.style.cssText = `
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.5rem 0.75rem; border-radius: 0.75rem;
        border: 1px solid var(--color-border); background: var(--color-surface);
      `;

      const intervalLabel = document.createElement('span');
      intervalLabel.style.cssText = `
        font-family: var(--font-display); font-weight: 600; font-size: 0.95rem;
        color: var(--color-ink); min-width: 5rem; white-space: nowrap;
      `;
      intervalLabel.textContent = `(${formatBound(pair.from)},\u2009${formatBound(pair.to)})`;

      const smwBtn = document.createElement('button');
      smwBtn.style.cssText = `
        flex: 1; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 500;
        cursor: pointer; transition: all 0.15s; min-height: 40px;
        border: 2px solid transparent; background: var(--color-surface-inset); color: var(--color-ink-muted);
      `;
      smwBtn.textContent = '\u2197 steigend';

      const smfBtn = document.createElement('button');
      smfBtn.style.cssText = smwBtn.style.cssText;
      smfBtn.textContent = '\u2198 fallend';

      function selectType(type: 'smw' | 'smf'): void {
        if (phase2Answered) return;
        state.type = type;
        if (type === 'smw') {
          smwBtn.style.borderColor = SMW_COLOR;
          smwBtn.style.backgroundColor = '#e8f5e9';
          smwBtn.style.color = SMW_COLOR;
          smfBtn.style.borderColor = 'transparent';
          smfBtn.style.backgroundColor = 'var(--color-surface-inset)';
          smfBtn.style.color = 'var(--color-ink-muted)';
        } else {
          smfBtn.style.borderColor = SMF_COLOR;
          smfBtn.style.backgroundColor = '#fce4ec';
          smfBtn.style.color = SMF_COLOR;
          smwBtn.style.borderColor = 'transparent';
          smwBtn.style.backgroundColor = 'var(--color-surface-inset)';
          smwBtn.style.color = 'var(--color-ink-muted)';
        }
        updateBands();
      }

      smwBtn.addEventListener('click', () => selectType('smw'));
      smfBtn.addEventListener('click', () => selectType('smf'));

      row.append(intervalLabel, smwBtn, smfBtn);
      rowsContainer.appendChild(row);
    });

    const p2Submit = document.createElement('button');
    p2Submit.className = 'btn-primary w-full py-2.5';
    p2Submit.style.minHeight = '44px';
    p2Submit.textContent = 'Antwort pr\u00fcfen';

    const p2Feedback = document.createElement('div');
    p2Feedback.className = 'hidden';

    let p2Attempts = 0;

    p2Submit.addEventListener('click', () => {
      if (phase2Answered) return;
      if (selections.some(s => !s.type)) return;

      const studentAnswers: MonotonicityInterval[] = selections.map(s => ({
        from: typeof s.from === 'string' ? s.from as '-\u221e' : s.from,
        to: typeof s.to === 'string' ? s.to as '+\u221e' : s.to,
        type: s.type!,
      }));

      const allCorrect = compareIntervalSets(studentAnswers, correct);
      p2Attempts++;

      p2Feedback.classList.remove('hidden');

      if (allCorrect) {
        phase2Answered = true;
        recordResult(exercise.module, exercise.id, isCorrect);

        rowsContainer.querySelectorAll('button').forEach(b => {
          (b as HTMLElement).style.cursor = 'default';
          (b as HTMLElement).style.pointerEvents = 'none';
        });

        for (const el of bandElements) board.removeElement(el);
        bandElements.length = 0;
        for (const iv of correct) {
          const xFrom = iv.from === '-\u221e' ? bb[0] : iv.from as number;
          const xTo = iv.to === '+\u221e' ? bb[2] : iv.to as number;
          const color = iv.type === 'smw' ? SMW_COLOR : SMF_COLOR;
          const band = createIntervalBand(xFrom, xTo, { color, opacity: 0.2 });
          board.addElement(band);
          bandElements.push(band);
        }
        board.update();

        p2Feedback.className = 'feedback-correct animate-fade-in';
        p2Feedback.textContent = 'Richtig! ' + exercise.feedbackExplanation;
        p2Submit.classList.add('hidden');

        if (isCorrect && exercise.strictFollowUp) {
          renderStrictFollowUp(container, exercise, onComplete);
          return;
        }
        onComplete();
      } else if (p2Attempts === 1) {
        p2Feedback.className = 'feedback-incorrect animate-fade-in';
        p2Feedback.textContent = exercise.prompt.includes('f\u2019')
          ? 'Nicht ganz. Tipp: Schau wo der Graph \u00fcber der x-Achse liegt (positiv \u2192 f steigt) und wo darunter (negativ \u2192 f f\u00e4llt).'
          : 'Nicht ganz. Tipp: Schau ob die Kurve nach rechts oben geht (steigend) oder nach rechts unten (fallend).';
      } else {
        phase2Answered = true;
        recordResult(exercise.module, exercise.id, false);

        rowsContainer.querySelectorAll('button').forEach(b => {
          (b as HTMLElement).style.cursor = 'default';
          (b as HTMLElement).style.pointerEvents = 'none';
        });

        for (const el of bandElements) board.removeElement(el);
        bandElements.length = 0;
        for (const iv of correct) {
          const xFrom = iv.from === '-\u221e' ? bb[0] : iv.from as number;
          const xTo = iv.to === '+\u221e' ? bb[2] : iv.to as number;
          const color = iv.type === 'smw' ? SMW_COLOR : SMF_COLOR;
          const band = createIntervalBand(xFrom, xTo, { color, opacity: 0.2 });
          board.addElement(band);
          bandElements.push(band);
        }
        board.update();

        p2Feedback.className = 'feedback-incorrect animate-fade-in';
        const correctStr = correct.map(iv =>
          `(${formatBound(iv.from)}, ${formatBound(iv.to)}) ${iv.type === 'smw' ? 'steigend' : 'fallend'}`,
        ).join(' | ');
        p2Feedback.textContent = `L\u00f6sung: ${correctStr}. ` + exercise.feedbackExplanation;
        p2Submit.classList.add('hidden');
        (onComplete as (correct?: boolean) => void)(false);
      }
    });

    phase2.append(rowsContainer, p2Submit, p2Feedback);
    container.appendChild(phase2);
  });

  return () => {
    for (const el of bandElements) board.removeElement(el);
    destroyBoard(board);
  };
}

// ─── K1: Classify pre-given intervals ───

function renderClassifyIntervalExercise(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): (() => void) | null {
  const correct = exercise.correctIntervals!;
  const bounds = exercise.intervalBounds ?? [];
  const allPoints: (number | string)[] = [
    ...(exercise.includeInfinity ? ['-\u221e'] : []),
    ...bounds,
    ...(exercise.includeInfinity ? ['+\u221e'] : []),
  ];

  // Build intervals from consecutive bound points
  const intervalPairs: Array<{ from: number | string; to: number | string }> = [];
  for (let i = 0; i < allPoints.length - 1; i++) {
    intervalPairs.push({ from: allPoints[i], to: allPoints[i + 1] });
  }

  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-4';
  prompt.textContent = exercise.prompt;

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-4';

  container.append(prompt, graphContainer);

  const board = createBoard(graphContainer, { boundingBox: calcBoundingBox([exercise.function.fn]) });
  const bb = board.getBoundingBox();
  const xRange: [number, number] = [Math.ceil(bb[0]), Math.floor(bb[2])];
  plotFunction(board, exercise.function.fn, undefined, 0, xRange);

  const bandElements: import('../graph/canvas-board.js').BoardElement[] = [];

  // ─── Interval rows: each shows "(a, b) → [steigend] [fallend]" ───
  const rowsContainer = document.createElement('div');
  rowsContainer.style.cssText = 'display: grid; gap: 0.625rem; margin-bottom: 1rem;';

  const selections: Array<{ type: 'smw' | 'smf' | null; from: number | string; to: number | string }> = [];
  const lockedIndices = new Set<number>();

  function updateBands(): void {
    for (const el of bandElements) board.removeElement(el);
    bandElements.length = 0;

    selections.forEach((sel, idx) => {
      const xFrom = sel.from === '-\u221e' ? bb[0] : sel.from as number;
      const xTo = sel.to === '+\u221e' ? bb[2] : sel.to as number;

      if (lockedIndices.has(idx)) {
        // Gelockt: normales Farbband + wei\u00dfes Overlay faded alles aus
        const color = sel.type === 'smw' ? SMW_COLOR : SMF_COLOR;
        const colorBand = createIntervalBand(xFrom, xTo, { color, opacity: 0.15 });
        board.addElement(colorBand);
        bandElements.push(colorBand);
        const fade = createIntervalBand(xFrom, xTo, { color: '#ffffff', opacity: 0.55 });
        board.addElement(fade);
        bandElements.push(fade);
      } else if (sel.type) {
        // Aktive Auswahl: normal farbig
        const color = sel.type === 'smw' ? SMW_COLOR : SMF_COLOR;
        const band = createIntervalBand(xFrom, xTo, { color, opacity: 0.15 });
        board.addElement(band);
        bandElements.push(band);
      }
    });
    board.update();
  }

  let answered = false;

  intervalPairs.forEach((pair) => {
    const state = { type: null as 'smw' | 'smf' | null, from: pair.from, to: pair.to };
    selections.push(state);

    const row = document.createElement('div');
    row.style.cssText = `
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 0.75rem; border-radius: 0.75rem;
      border: 1px solid var(--color-border); background: var(--color-surface);
    `;

    // Interval label: (a, b)
    const intervalLabel = document.createElement('span');
    intervalLabel.style.cssText = `
      font-family: var(--font-display); font-weight: 600; font-size: 0.95rem;
      color: var(--color-ink); min-width: 5rem; white-space: nowrap;
    `;
    intervalLabel.textContent = `(${formatBound(pair.from)},\u2009${formatBound(pair.to)})`;

    // Steigend button
    const smwBtn = document.createElement('button');
    smwBtn.style.cssText = `
      flex: 1; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s; min-height: 40px;
      border: 2px solid transparent; background: var(--color-surface-inset); color: var(--color-ink-muted);
    `;
    smwBtn.textContent = '\u2197 steigend';

    // Fallend button
    const smfBtn = document.createElement('button');
    smfBtn.style.cssText = smwBtn.style.cssText;
    smfBtn.textContent = '\u2198 fallend';

    function selectType(type: 'smw' | 'smf'): void {
      if (answered) return;
      state.type = type;
      // Visual: highlight selected, dim other
      if (type === 'smw') {
        smwBtn.style.borderColor = SMW_COLOR;
        smwBtn.style.backgroundColor = '#e8f5e9';
        smwBtn.style.color = SMW_COLOR;
        smfBtn.style.borderColor = 'transparent';
        smfBtn.style.backgroundColor = 'var(--color-surface-inset)';
        smfBtn.style.color = 'var(--color-ink-muted)';
      } else {
        smfBtn.style.borderColor = SMF_COLOR;
        smfBtn.style.backgroundColor = '#fce4ec';
        smfBtn.style.color = SMF_COLOR;
        smwBtn.style.borderColor = 'transparent';
        smwBtn.style.backgroundColor = 'var(--color-surface-inset)';
        smwBtn.style.color = 'var(--color-ink-muted)';
      }
      updateBands();
    }

    smwBtn.addEventListener('click', () => selectType('smw'));
    smfBtn.addEventListener('click', () => selectType('smf'));

    row.append(intervalLabel, smwBtn, smfBtn);
    rowsContainer.appendChild(row);
  });

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary w-full py-2.5';
  submitBtn.style.minHeight = '44px';
  submitBtn.textContent = 'Antwort pr\u00fcfen';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  let attempts = 0;

  submitBtn.addEventListener('click', () => {
    if (answered) return;
    if (selections.some(s => !s.type)) return;

    const studentAnswers: MonotonicityInterval[] = selections.map(s => ({
      from: typeof s.from === 'string' ? s.from as '-\u221e' : s.from,
      to: typeof s.to === 'string' ? s.to as '+\u221e' : s.to,
      type: s.type!,
    }));

    const isCorrect = compareIntervalSets(studentAnswers, correct);
    attempts++;

    feedbackDiv.classList.remove('hidden');

    if (isCorrect) {
      answered = true;
      recordResult(exercise.module, exercise.id, true);

      rowsContainer.querySelectorAll('button').forEach(b => {
        (b as HTMLElement).style.cursor = 'default';
        (b as HTMLElement).style.pointerEvents = 'none';
      });

      for (const el of bandElements) board.removeElement(el);
      bandElements.length = 0;
      for (const iv of correct) {
        const xFrom = iv.from === '-\u221e' ? bb[0] : iv.from as number;
        const xTo = iv.to === '+\u221e' ? bb[2] : iv.to as number;
        const color = iv.type === 'smw' ? SMW_COLOR : SMF_COLOR;
        const band = createIntervalBand(xFrom, xTo, { color, opacity: 0.2 });
        board.addElement(band);
        bandElements.push(band);
      }
      board.update();

      feedbackDiv.className = 'feedback-correct animate-fade-in';
      feedbackDiv.textContent = 'Richtig! ' + exercise.feedbackExplanation;
      submitBtn.classList.add('hidden');

      if (exercise.strictFollowUp) {
        renderStrictFollowUp(container, exercise, onComplete);
        return;
      }
      onComplete();
    } else if (attempts === 1) {
      // Erster Fehler: spezifischer Tipp für die falschen Intervalle
      const wrongIntervals = selections
        .map((sel, idx) => ({ sel, correctIv: correct[idx], idx }))
        .filter(({ sel, correctIv }) => correctIv && sel.type !== correctIv.type);

      const intervalNames = wrongIntervals.map(({ idx }) => {
        const pair = intervalPairs[idx];
        return `(${formatBound(pair.from)},\u2009${formatBound(pair.to)})`;
      });

      const isDerivGraph = exercise.prompt.includes('f\u2019');
      let tipText: string;
      if (intervalNames.length === 1) {
        tipText = isDerivGraph
          ? `Nicht ganz. Schau dir ${intervalNames[0]} nochmal an: Liegt f\u2019 dort \u00fcber oder unter der x-Achse?`
          : `Nicht ganz. Schau dir ${intervalNames[0]} nochmal an: Geht die Kurve dort nach oben oder unten?`;
      } else {
        tipText = isDerivGraph
          ? 'Nicht ganz. Tipp: Wo f\u2019 \u00fcber der x-Achse liegt \u2192 f steigt. Wo darunter \u2192 f f\u00e4llt.'
          : 'Nicht ganz. Tipp: Geht die Kurve nach rechts oben \u2192 steigend. Nach rechts unten \u2192 fallend.';
      }

      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
      feedbackDiv.textContent = tipText;

      // Richtige ausgrauen (UI + Graph), falsche rot markieren
      selections.forEach((sel, idx) => {
        const correctIv = correct[idx];
        const row = rowsContainer.children[idx] as HTMLElement;

        if (correctIv && sel.type === correctIv.type) {
          // Richtig: UI ausgrauen + im Graph als locked markieren
          row.style.opacity = '0.4';
          row.style.pointerEvents = 'none';
          row.style.borderColor = 'var(--color-success-border)';
          lockedIndices.add(idx);
        } else if (correctIv && sel.type !== correctIv.type) {
          row.style.borderColor = 'var(--color-error-border)';
        }
      });
      updateBands();

      setTimeout(() => {
        selections.forEach((sel, idx) => {
          const correctIv = correct[idx];
          const row = rowsContainer.children[idx] as HTMLElement;
          if (correctIv && sel.type !== correctIv.type) {
            row.style.borderColor = 'var(--color-border)';
            sel.type = null;
            const btns = row.querySelectorAll('button');
            btns.forEach(b => {
              const el = b as HTMLElement;
              el.style.borderColor = 'transparent';
              el.style.backgroundColor = 'var(--color-surface-inset)';
              el.style.color = 'var(--color-ink-muted)';
            });
          }
        });
        updateBands();
      }, 1500);
    } else {
      // Zweiter Fehler: L\u00f6sung zeigen
      answered = true;
      recordResult(exercise.module, exercise.id, false);

      rowsContainer.querySelectorAll('button').forEach(b => {
        (b as HTMLElement).style.cursor = 'default';
        (b as HTMLElement).style.pointerEvents = 'none';
      });

      for (const el of bandElements) board.removeElement(el);
      bandElements.length = 0;
      for (const iv of correct) {
        const xFrom = iv.from === '-\u221e' ? bb[0] : iv.from as number;
        const xTo = iv.to === '+\u221e' ? bb[2] : iv.to as number;
        const color = iv.type === 'smw' ? SMW_COLOR : SMF_COLOR;
        const band = createIntervalBand(xFrom, xTo, { color, opacity: 0.2 });
        board.addElement(band);
        bandElements.push(band);
      }
      board.update();

      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
      const correctStr = correct.map(iv =>
        `(${formatBound(iv.from)}, ${formatBound(iv.to)}) ${iv.type === 'smw' ? 'steigend' : 'fallend'}`,
      ).join(' | ');
      feedbackDiv.textContent = `L\u00f6sung: ${correctStr}. ` + exercise.feedbackExplanation;
      submitBtn.classList.add('hidden');
      (onComplete as (correct?: boolean) => void)(false);
    }
  });

  container.append(rowsContainer, submitBtn, feedbackDiv);

  return () => {
    for (const el of bandElements) board.removeElement(el);
    destroyBoard(board);
  };
}

function compareIntervalSets(student: MonotonicityInterval[], correct: MonotonicityInterval[]): boolean {
  if (student.length !== correct.length) return false;
  const used = new Set<number>();
  for (const s of student) {
    const idx = correct.findIndex((c, i) => !used.has(i) && s.from === c.from && s.to === c.to && s.type === c.type);
    if (idx === -1) return false;
    used.add(idx);
  }
  return true;
}

function renderStrictFollowUp(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): void {
  const followUp = exercise.strictFollowUp!;
  const followUpDiv = document.createElement('div');
  followUpDiv.className = 'animate-fade-in mt-4';

  const question = document.createElement('p');
  question.style.cssText = 'font-weight: 600; margin-bottom: 0.75rem;';
  const art = exercise.targetType === 'monoton-steigend' ? 'steigend' : 'fallend';
  question.textContent = `Ist f in diesem Intervall auch streng monoton ${art}?`;
  followUpDiv.appendChild(question);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; gap: 0.5rem;';

  for (const answer of ['Ja', 'Nein']) {
    const btn = document.createElement('button');
    btn.style.cssText = `
      flex: 1; padding: 0.75rem; border-radius: 0.75rem; font-weight: 500;
      font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
      min-height: 44px; border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-ink);
    `;
    btn.textContent = answer;

    btn.addEventListener('click', () => {
      if (btn.dataset.locked === 'true') return;
      const allBtns = btnRow.querySelectorAll('button');
      allBtns.forEach(b => { (b as HTMLElement).dataset.locked = 'true'; (b as HTMLElement).style.cursor = 'default'; });

      const userSaysYes = answer === 'Ja';
      const isCorrect = userSaysYes === followUp.isStrict;

      btn.style.borderColor = isCorrect ? 'var(--color-success)' : 'var(--color-error)';
      btn.style.backgroundColor = isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)';

      if (!isCorrect) {
        const correctBtn = allBtns[followUp.isStrict ? 0 : 1] as HTMLElement;
        correctBtn.style.borderColor = 'var(--color-success)';
        correctBtn.style.backgroundColor = 'var(--color-success-bg)';
      }

      const fb = document.createElement('div');
      fb.className = 'animate-fade-in mt-2';
      fb.style.cssText = `
        padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.85rem; line-height: 1.5;
        background: ${isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)'};
        color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'};
        border: 1px solid ${isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'};
      `;
      fb.textContent = (isCorrect ? 'Richtig! ' : 'Falsch. ') + followUp.explanation;
      followUpDiv.appendChild(fb);
      onComplete();
    });

    btnRow.appendChild(btn);
  }

  followUpDiv.appendChild(btnRow);
  container.appendChild(followUpDiv);
}

// ─── OLD: Slider-based interval selection (fallback) ───

function renderSliderIntervalExercise(
  container: HTMLElement,
  exercise: IdentifyPointsExercise,
  onComplete: () => void,
): (() => void) | null {
  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-4';
  prompt.textContent = exercise.prompt;

  const hint = document.createElement('p');
  hint.className = 'text-sm mb-3';
  hint.style.color = 'var(--color-ink-muted)';
  hint.textContent = 'Verschiebe die beiden Regler auf der x-Achse, um das Intervall festzulegen.';

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-4';

  container.append(prompt, hint, graphContainer);

  const board = createBoard(graphContainer, { boundingBox: calcBoundingBox([exercise.function.fn]) });
  const bb1 = board.getBoundingBox();
  const xRange1: [number, number] = [Math.ceil(bb1[0]), Math.floor(bb1[2])];
  plotFunction(board, exercise.function.fn, undefined, 0, xRange1);

  const intervals = exercise.intervals ?? [];
  const selector = createIntervalSelector(board, -1, 1);

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary mt-3 w-full py-2.5';
  submitBtn.textContent = 'Antwort pr\u00fcfen';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  let answered = false;

  submitBtn.addEventListener('click', () => {
    if (answered) return;
    answered = true;

    const [selFrom, selTo] = selector.getInterval();
    const tolerance = 0.6;
    const correct = intervals.some(iv =>
      Math.abs(selFrom - iv.from) <= tolerance && Math.abs(selTo - iv.to) <= tolerance,
    );

    recordResult(exercise.module, exercise.id, correct);

    feedbackDiv.classList.remove('hidden');
    if (correct) {
      feedbackDiv.className = 'feedback-correct animate-fade-in';
      feedbackDiv.textContent = 'Richtig! ' + exercise.feedbackExplanation;
    } else {
      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
      const correctIntervalStr = intervals.map(iv => `[${iv.from}, ${iv.to}]`).join(' oder ');
      feedbackDiv.textContent = `Nicht ganz. Richtige(s) Intervall(e): ${correctIntervalStr}. ` + exercise.feedbackExplanation;
    }

    submitBtn.classList.add('hidden');
    onComplete();
  });

  container.append(submitBtn, feedbackDiv);

  return () => {
    selector.destroy();
    destroyBoard(board);
  };
}
