import type { IdentifyPointsExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';
import { addTapHandler, addCurveTracker, createIntervalSelector } from '../graph/interactions.js';

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
  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-4';
  prompt.textContent = exercise.prompt;

  const hint = document.createElement('p');
  hint.className = 'text-sm mb-3';
  hint.style.color = 'var(--color-ink-muted)';
  hint.textContent = 'Verschiebe die beiden Regler auf der x-Achse, um das Intervall festzulegen.';

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-4';

  // Append to container first so JSXGraph can measure
  container.append(prompt, hint, graphContainer);

  const board = createBoard(graphContainer, { boundingBox: calcBoundingBox([exercise.function.fn]) });
  const bb1 = board.getBoundingBox();
  const xRange1: [number, number] = [Math.ceil(bb1[0]), Math.floor(bb1[2])];
  plotFunction(board, exercise.function.fn, undefined, 0, xRange1);

  const intervals = exercise.intervals ?? [];
  // Start gliders at a neutral position
  const selector = createIntervalSelector(board, -1, 1);

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary mt-3 w-full py-2.5';
  submitBtn.textContent = 'Antwort prüfen';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  let answered = false;

  submitBtn.addEventListener('click', () => {
    if (answered) return;
    answered = true;

    const [selFrom, selTo] = selector.getInterval();

    // Check if selected interval matches the correct interval exactly (largest possible)
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

    // Follow-up: streng monoton?
    if (correct && exercise.strictFollowUp) {
      const followUp = exercise.strictFollowUp;
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
      return; // don't call onComplete yet — wait for follow-up answer
    }

    onComplete();
  });

  container.append(submitBtn, feedbackDiv);

  return () => {
    selector.destroy();
    destroyBoard(board);
  };
}
