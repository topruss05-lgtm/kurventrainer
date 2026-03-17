import type { GraphSketchExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, COLORS } from '../graph/function-plotter.js';

export function renderGraphSketch(
  container: HTMLElement,
  exercise: GraphSketchExercise,
  onComplete: () => void,
): (() => void) | null {
  const boards: import('../graph/canvas-board.js').CanvasBoard[] = [];

  const conditionsEl = document.createElement('div');
  conditionsEl.className = 'mb-4';

  const condLabel = document.createElement('p');
  condLabel.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
  condLabel.textContent = 'Welcher Graph erfüllt alle Bedingungen?';
  conditionsEl.appendChild(condLabel);

  const condList = document.createElement('ul');
  condList.style.cssText = 'list-style: disc; padding-left: 1.25rem; margin-bottom: 1rem;';
  for (const cond of exercise.conditions) {
    const li = document.createElement('li');
    li.style.cssText = 'font-size: 0.875rem; color: var(--color-ink-secondary); margin-bottom: 0.25rem;';
    li.textContent = cond;
    condList.appendChild(li);
  }
  conditionsEl.appendChild(condList);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;';

  let answered = false;

  exercise.graphOptions.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.style.cssText = `
      border: 2px solid var(--color-border); border-radius: 0.75rem;
      overflow: hidden; cursor: pointer; transition: all 0.2s;
    `;

    const graphContainer = document.createElement('div');
    graphContainer.style.cssText = 'pointer-events: none;';
    card.appendChild(graphContainer);

    const label = document.createElement('div');
    label.style.cssText = 'text-align: center; padding: 0.5rem; font-size: 0.8rem; font-weight: 500; color: var(--color-ink-muted);';
    label.textContent = `Graph ${String.fromCharCode(65 + idx)}`;
    card.appendChild(label);

    const bb = calcBoundingBox([opt.function.fn]);
    const board = createBoard(graphContainer, { boundingBox: bb, height: 160 });
    plotFunction(board, opt.function.fn, { color: COLORS.primary });
    boards.push(board);

    card.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const allCards = grid.querySelectorAll<HTMLElement>(':scope > div');
      allCards.forEach(c => { c.style.cursor = 'default'; });

      if (opt.isCorrect) {
        card.style.borderColor = 'var(--color-success)';
        card.style.boxShadow = '0 0 0 2px var(--color-success)';
        recordResult(exercise.module, exercise.id, true);
      } else {
        card.style.borderColor = 'var(--color-error)';
        card.style.boxShadow = '0 0 0 2px var(--color-error)';
        const correctCard = allCards[exercise.graphOptions.findIndex(o => o.isCorrect)];
        if (correctCard) {
          correctCard.style.borderColor = 'var(--color-success)';
          correctCard.style.boxShadow = '0 0 0 2px var(--color-success)';
        }
        recordResult(exercise.module, exercise.id, false);
      }

      const feedback = document.createElement('div');
      feedback.className = 'animate-fade-in mt-3';
      feedback.style.cssText = `
        padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.85rem; line-height: 1.5;
        background: ${opt.isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)'};
        color: ${opt.isCorrect ? 'var(--color-success)' : 'var(--color-error)'};
        border: 1px solid ${opt.isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'};
      `;
      feedback.textContent = (opt.isCorrect ? 'Richtig! ' : 'Falsch. ') + exercise.explanation;
      container.appendChild(feedback);
      onComplete();
    });

    grid.appendChild(card);
  });

  container.append(conditionsEl, grid);

  return () => { boards.forEach(b => destroyBoard(b)); };
}
