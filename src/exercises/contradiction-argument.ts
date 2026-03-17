import type { ContradictionArgumentExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, COLORS } from '../graph/function-plotter.js';

export function renderContradictionArgument(
  container: HTMLElement,
  exercise: ContradictionArgumentExercise,
  onComplete: () => void,
): (() => void) | null {
  const header = document.createElement('div');
  header.className = 'mb-3';

  const promptEl = document.createElement('p');
  promptEl.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
  promptEl.textContent = exercise.prompt;
  header.appendChild(promptEl);

  const fnEl = document.createElement('p');
  fnEl.style.cssText = 'font-size: 0.9rem; color: var(--color-ink-secondary); margin-bottom: 0.75rem;';
  fnEl.textContent = `Behauptung: ${exercise.claimedFunctionLatex}`;
  header.appendChild(fnEl);

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-3';

  const bb = calcBoundingBox([exercise.shownGraph.fn]);
  const board = createBoard(graphContainer, { boundingBox: bb, height: 200 });
  plotFunction(board, exercise.shownGraph.fn, { color: COLORS.primary });

  const infoEl = document.createElement('p');
  infoEl.style.cssText = 'font-size: 0.8rem; color: var(--color-ink-muted); margin-bottom: 1rem;';
  infoEl.textContent = `Wähle ${exercise.requiredCorrectCount} passende Argumente:`;

  const argList = document.createElement('div');
  argList.style.cssText = 'display: grid; gap: 0.5rem; margin-bottom: 1rem;';

  const selected = new Set<number>();

  exercise.arguments.forEach((arg, idx) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      padding: 0.75rem 1rem; border-radius: 0.75rem; text-align: left;
      font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
      min-height: 44px; border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-ink);
    `;
    btn.textContent = arg.text;

    btn.addEventListener('click', () => {
      if (btn.dataset.locked === 'true') return;

      if (selected.has(idx)) {
        selected.delete(idx);
        btn.style.borderColor = 'var(--color-border)';
        btn.style.backgroundColor = 'var(--color-surface)';
      } else {
        selected.add(idx);
        btn.style.borderColor = 'var(--color-primary)';
        btn.style.backgroundColor = 'var(--color-primary-light, #e3f2fd)';
      }
    });

    argList.appendChild(btn);
  });

  const submitBtn = document.createElement('button');
  submitBtn.style.cssText = `
    width: 100%; padding: 0.75rem; border-radius: 0.75rem;
    background: var(--color-accent); color: #fff; border: none;
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
    transition: background-color 0.2s; min-height: 44px;
  `;
  submitBtn.textContent = 'Prüfen';

  submitBtn.addEventListener('click', () => {
    if (submitBtn.dataset.locked === 'true') return;

    const selectedArgs = [...selected].map(i => exercise.arguments[i]);
    const validSelected = selectedArgs.filter(a => a.isValid);
    const invalidSelected = selectedArgs.filter(a => !a.isValid);
    const isCorrect = validSelected.length === exercise.requiredCorrectCount && invalidSelected.length === 0;

    submitBtn.dataset.locked = 'true';
    const allBtns = argList.querySelectorAll('button');
    allBtns.forEach(b => { (b as HTMLElement).dataset.locked = 'true'; });

    allBtns.forEach((btn, idx) => {
      const el = btn as HTMLElement;
      if (exercise.arguments[idx].isValid) {
        el.style.borderColor = 'var(--color-success)';
        el.style.backgroundColor = 'var(--color-success-bg)';
      } else if (selected.has(idx)) {
        el.style.borderColor = 'var(--color-error)';
        el.style.backgroundColor = 'var(--color-error-bg)';
      }
    });

    recordResult(exercise.module, exercise.id, isCorrect);

    const feedback = document.createElement('div');
    feedback.className = 'animate-fade-in mt-3';
    feedback.style.cssText = `
      padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.85rem; line-height: 1.5;
      background: ${isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)'};
      color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'};
      border: 1px solid ${isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'};
    `;
    feedback.textContent = (isCorrect ? 'Richtig! ' : 'Nicht ganz. ') + exercise.feedbackExplanation;
    container.appendChild(feedback);
    onComplete();
  });

  container.append(header, graphContainer, infoEl, argList, submitBtn);
  return () => { destroyBoard(board); };
}
