import type { TransformationReasoningExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';

export function renderTransformationReasoning(
  container: HTMLElement,
  exercise: TransformationReasoningExercise,
  onComplete: () => void,
): (() => void) | null {
  const header = document.createElement('div');
  header.className = 'mb-4';

  const origEl = document.createElement('p');
  origEl.style.cssText = 'font-size: 0.9rem; margin-bottom: 0.375rem;';
  origEl.textContent = exercise.originalInfo;
  header.appendChild(origEl);

  const transEl = document.createElement('p');
  transEl.style.cssText = 'font-weight: 600; font-size: 0.95rem; margin-bottom: 0.375rem;';
  transEl.textContent = exercise.transformation;
  header.appendChild(transEl);

  const questionEl = document.createElement('p');
  questionEl.style.cssText = 'font-weight: 600; margin-bottom: 1rem;';
  questionEl.textContent = exercise.question;

  container.append(header, questionEl);

  if (exercise.inputType === 'multiple-choice' && exercise.options && exercise.correctIndex !== undefined) {
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;';

    exercise.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 0.75rem; border-radius: 0.75rem; text-align: center;
        font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
        min-height: 44px; border: 1px solid var(--color-border);
        background: var(--color-surface); color: var(--color-ink);
      `;
      btn.textContent = option;

      btn.addEventListener('click', () => {
        if (btn.dataset.locked === 'true') return;
        const allBtns = grid.querySelectorAll('button');
        allBtns.forEach(b => { (b as HTMLElement).dataset.locked = 'true'; (b as HTMLElement).style.cursor = 'default'; });

        const isCorrect = idx === exercise.correctIndex;
        if (isCorrect) {
          btn.style.borderColor = 'var(--color-success)';
          btn.style.backgroundColor = 'var(--color-success-bg)';
        } else {
          btn.style.borderColor = 'var(--color-error)';
          btn.style.backgroundColor = 'var(--color-error-bg)';
          const correctBtn = allBtns[exercise.correctIndex!] as HTMLElement;
          correctBtn.style.borderColor = 'var(--color-success)';
          correctBtn.style.backgroundColor = 'var(--color-success-bg)';
        }

        recordResult(exercise.module, exercise.id, isCorrect);
        showFeedback(isCorrect);
      });

      grid.appendChild(btn);
    });
    container.appendChild(grid);

  } else if (exercise.inputType === 'coordinates') {
    const correct = exercise.correctAnswer as { x: number; y: number };
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';

    const xLabel = document.createElement('span');
    xLabel.className = 'font-medium';
    xLabel.textContent = 'x:';
    const xInput = document.createElement('input');
    xInput.type = 'text';
    xInput.inputMode = 'decimal';
    xInput.className = 'flex-1 p-3 rounded-xl border min-h-[44px]';
    xInput.style.cssText = 'border-color: var(--color-border); background: var(--color-surface-inset);';

    const yLabel = document.createElement('span');
    yLabel.className = 'font-medium';
    yLabel.textContent = 'y:';
    const yInput = document.createElement('input');
    yInput.type = 'text';
    yInput.inputMode = 'decimal';
    yInput.className = 'flex-1 p-3 rounded-xl border min-h-[44px]';
    yInput.style.cssText = 'border-color: var(--color-border); background: var(--color-surface-inset);';

    const submitBtn = document.createElement('button');
    submitBtn.style.cssText = `
      padding: 0.75rem 1.25rem; border-radius: 0.75rem;
      background: var(--color-accent); color: #fff; border: none;
      font-weight: 500; cursor: pointer; min-height: 44px;
    `;
    submitBtn.textContent = 'OK';

    row.append(xLabel, xInput, yLabel, yInput, submitBtn);
    container.appendChild(row);

    const handleSubmit = () => {
      const xVal = parseFloat(xInput.value.trim());
      const yVal = parseFloat(yInput.value.trim());
      if (isNaN(xVal) || isNaN(yVal)) return;

      xInput.disabled = true;
      yInput.disabled = true;
      submitBtn.disabled = true;

      const tolerance = 0.01;
      const isCorrect = Math.abs(xVal - correct.x) <= tolerance && Math.abs(yVal - correct.y) <= tolerance;

      xInput.style.borderColor = Math.abs(xVal - correct.x) <= tolerance ? 'var(--color-success)' : 'var(--color-error)';
      yInput.style.borderColor = Math.abs(yVal - correct.y) <= tolerance ? 'var(--color-success)' : 'var(--color-error)';

      recordResult(exercise.module, exercise.id, isCorrect);
      showFeedback(isCorrect);
    };

    submitBtn.addEventListener('click', handleSubmit);
    yInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
  }

  function showFeedback(isCorrect: boolean): void {
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
  }

  return null;
}
