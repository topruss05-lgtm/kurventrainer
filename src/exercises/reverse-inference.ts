import type { ReverseInferenceExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';
import { addTapHandler, addCurveTracker } from '../graph/interactions.js';


export function renderReverseInference(
  container: HTMLElement,
  exercise: ReverseInferenceExercise,
  onComplete: () => void,
): (() => void) | null {
  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-2';
  prompt.textContent = exercise.prompt;

  const givenLabel = document.createElement('p');
  givenLabel.className = 'text-sm mb-4 inline-block px-2 py-0.5 rounded-md';
  givenLabel.style.color = 'var(--color-ink-secondary)';
  givenLabel.style.backgroundColor = 'var(--color-surface-inset)';
  givenLabel.textContent = `Gezeigt wird der Graph von ${exercise.givenGraph}`;

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-4';

  // Plot the given derivative graph
  const fn = exercise.givenGraph === "f'"
    ? exercise.derivatives?.first?.fn ?? exercise.function.fn
    : exercise.derivatives?.second?.fn ?? exercise.function.fn;

  const board = createBoard(graphContainer, { boundingBox: calcBoundingBox([fn]) });
  plotFunction(board, fn);
  const removeTracker = addCurveTracker(board, fn);

  const selectedInfo = document.createElement('p');
  selectedInfo.className = 'text-sm mt-2';
  selectedInfo.style.color = 'var(--color-ink-muted)';
  selectedInfo.textContent = `${exercise.targets.length} Stelle(n) gesucht. Tippe auf den Graph.`;

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary mt-3 w-full py-2.5 hidden';
  submitBtn.textContent = 'Antwort prüfen';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  const selectedPoints: Array<{ x: number; y: number }> = [];
  const pointMarkers: JXG.GeometryElement[] = [];
  let answered = false;

  // Snap targets are the x-values from exercise targets, evaluated on the given function
  const snapTargets = exercise.targets.map(t => {
    return { x: t.x, y: fn(t.x) };
  });

  const removeTap = addTapHandler(board, snapTargets, (result) => {
    if (answered) return;

    const x = Math.round(result.boardX * 2) / 2;
    const y = fn(x);
    if (!Number.isFinite(y)) return;

    const already = selectedPoints.some(p => Math.abs(p.x - x) < 0.1);
    if (already) return;

    if (selectedPoints.length >= exercise.targets.length) {
      selectedPoints.shift();
      const old = pointMarkers.shift();
      if (old) board.removeObject(old);
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

    // Show all correct targets with reasons
    for (const t of exercise.targets) {
      const snap = snapTargets.find(s => s.x === t.x)!;
      highlightPoint(board, snap.x, snap.y, COLORS.tertiary, t.type);
    }

    feedbackDiv.classList.remove('hidden');
    if (allCorrect) {
      feedbackDiv.className = 'feedback-correct animate-fade-in';
    } else {
      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
    }

    // Build detailed feedback
    const feedbackText = document.createElement('div');
    const summary = document.createElement('p');
    summary.className = 'font-medium mb-2';
    summary.textContent = allCorrect ? 'Richtig!' : 'Nicht ganz richtig.';
    feedbackText.appendChild(summary);

    const explanation = document.createElement('p');
    explanation.className = 'mb-2';
    explanation.textContent = exercise.feedbackExplanation;
    feedbackText.appendChild(explanation);

    const targetList = document.createElement('ul');
    targetList.className = 'text-sm space-y-1 mt-2';
    for (const t of exercise.targets) {
      const li = document.createElement('li');
      li.textContent = `\u2022 x = ${t.x}: ${t.type} \u2014 ${t.reason}`;
      targetList.appendChild(li);
    }
    feedbackText.appendChild(targetList);

    feedbackDiv.appendChild(feedbackText);
    submitBtn.classList.add('hidden');
    onComplete();
  });

  container.append(prompt, givenLabel, graphContainer, selectedInfo, submitBtn, feedbackDiv);

  return () => {
    removeTracker();
    removeTap();
    destroyBoard(board);
  };
}
