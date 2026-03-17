import type { ContextInterpretationExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';

export function renderContextInterpretation(
  container: HTMLElement,
  exercise: ContextInterpretationExercise,
  onComplete: () => void,
): (() => void) | null {
  const header = document.createElement('div');
  header.className = 'mb-4';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;';
  titleEl.textContent = exercise.contextTitle;
  header.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.style.cssText = 'font-size: 0.9rem; color: var(--color-ink-secondary); margin-bottom: 1rem; line-height: 1.5;';
  descEl.textContent = exercise.contextDescription;
  header.appendChild(descEl);

  if (exercise.contextGraph) {
    const graphNote = document.createElement('p');
    graphNote.style.cssText = 'font-size: 0.8rem; color: var(--color-ink-muted); margin-bottom: 0.75rem; font-style: italic;';
    graphNote.textContent = exercise.contextGraph.latex;
    header.appendChild(graphNote);
  }

  const questionEl = document.createElement('p');
  questionEl.style.cssText = 'font-weight: 600; margin-bottom: 1rem;';
  questionEl.textContent = exercise.question;

  const optionsGrid = document.createElement('div');
  optionsGrid.style.cssText = 'display: grid; gap: 0.5rem;';

  const correctIdx = typeof exercise.correctIndex === 'number' ? exercise.correctIndex : exercise.correctIndex[0];

  exercise.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      padding: 0.75rem 1rem; border-radius: 0.75rem; text-align: left;
      font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
      min-height: 44px; border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-ink);
    `;
    btn.textContent = option;

    btn.addEventListener('click', () => {
      if (btn.dataset.locked === 'true') return;

      const allBtns = optionsGrid.querySelectorAll('button');
      allBtns.forEach(b => { (b as HTMLElement).dataset.locked = 'true'; (b as HTMLElement).style.cursor = 'default'; });

      const isCorrect = idx === correctIdx;

      if (isCorrect) {
        btn.style.borderColor = 'var(--color-success)';
        btn.style.backgroundColor = 'var(--color-success-bg)';
        recordResult(exercise.module, exercise.id, true);
      } else {
        btn.style.borderColor = 'var(--color-error)';
        btn.style.backgroundColor = 'var(--color-error-bg)';
        const correctBtn = allBtns[correctIdx] as HTMLElement;
        correctBtn.style.borderColor = 'var(--color-success)';
        correctBtn.style.backgroundColor = 'var(--color-success-bg)';
        recordResult(exercise.module, exercise.id, false);
      }

      const feedback = document.createElement('div');
      feedback.className = 'animate-fade-in mt-3';
      feedback.style.cssText = `
        padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.85rem; line-height: 1.5;
        background: ${isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)'};
        color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'};
        border: 1px solid ${isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'};
      `;
      feedback.textContent = (isCorrect ? 'Richtig! ' : 'Leider falsch. ') + exercise.explanation;
      container.appendChild(feedback);

      onComplete();
    });

    optionsGrid.appendChild(btn);
  });

  container.append(header, questionEl, optionsGrid);
  return null;
}
