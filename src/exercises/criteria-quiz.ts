import type { CriteriaQuizExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { recordQuizAnswer } from '../progress/spaced-repetition.js';
import { createBoard, destroyBoard } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';

export function renderCriteriaQuiz(
  container: HTMLElement,
  exercise: CriteriaQuizExercise,
  onComplete: () => void,
): (() => void) | null {
  let board: JXG.Board | null = null;

  const question = document.createElement('h3');
  question.className = 'text-lg font-semibold mb-4';
  question.textContent = exercise.question;

  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'space-y-2 mb-4';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  let answered = false;

  // Shuffle options while tracking correct answer
  const indices = exercise.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map(i => exercise.options[i]);
  const shuffledCorrectIndex = indices.indexOf(exercise.correctIndex);

  shuffledOptions.forEach((option, displayIndex) => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left p-3 rounded-xl border transition-all cursor-pointer';
    btn.style.borderColor = 'var(--color-border)';
    btn.addEventListener('mouseenter', () => {
      if (!answered) {
        btn.style.borderColor = 'var(--color-primary)';
        btn.style.backgroundColor = 'var(--color-primary-light)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!answered) {
        btn.style.borderColor = 'var(--color-border)';
        btn.style.backgroundColor = '';
      }
    });
    btn.textContent = option;

    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const correct = displayIndex === shuffledCorrectIndex;
      recordResult(exercise.module, exercise.id, correct);
      recordQuizAnswer(exercise.id, correct);

      // Highlight all buttons
      const buttons = optionsDiv.querySelectorAll('button');
      buttons.forEach((b, i) => {
        const el = b as HTMLElement;
        el.style.cursor = 'default';
        el.style.backgroundColor = '';
        if (i === shuffledCorrectIndex) {
          el.style.borderColor = 'var(--color-success)';
          el.style.backgroundColor = 'var(--color-success-bg)';
          const icon = document.createElement('span');
          icon.textContent = ' \u2713';
          icon.style.color = 'var(--color-success)';
          icon.className = 'font-bold';
          el.appendChild(icon);
        } else if (i === displayIndex && !correct) {
          el.style.borderColor = 'var(--color-error)';
          el.style.backgroundColor = 'var(--color-error-bg)';
          const icon = document.createElement('span');
          icon.textContent = ' \u2717';
          icon.style.color = 'var(--color-error)';
          icon.className = 'font-bold';
          el.appendChild(icon);
        } else {
          el.style.opacity = '0.5';
        }
      });

      // Show feedback
      feedbackDiv.classList.remove('hidden');
      if (correct) {
        feedbackDiv.className = 'feedback-correct animate-fade-in';
        feedbackDiv.textContent = 'Richtig! ' + exercise.explanation;
      } else {
        feedbackDiv.className = 'feedback-incorrect animate-fade-in';
        feedbackDiv.textContent = 'Leider falsch. ' + exercise.explanation;

        // Show visual example if available
        if (exercise.visualExample) {
          const graphContainer = document.createElement('div');
          graphContainer.className = 'mt-3';

          const graphLabel = document.createElement('p');
          graphLabel.className = 'text-sm mb-2';
          graphLabel.style.color = 'var(--color-ink-secondary)';
          graphLabel.textContent = exercise.visualExample.description;
          graphContainer.appendChild(graphLabel);

          board = createBoard(graphContainer, { boundingBox: [-4, 8, 4, -8] });
          plotFunction(board, exercise.visualExample.function.fn, undefined, 0, [-4, 4]);
          const x = exercise.visualExample.highlightX;
          const y = exercise.visualExample.function.fn(x);
          highlightPoint(board, x, y, COLORS.secondary);

          feedbackDiv.appendChild(graphContainer);
        }
      }

      onComplete();
    });

    optionsDiv.appendChild(btn);
  });

  container.append(question, optionsDiv, feedbackDiv);

  return () => {
    if (board) destroyBoard(board);
  };
}
