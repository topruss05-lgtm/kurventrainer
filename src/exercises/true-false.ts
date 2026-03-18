import type { TrueFalseExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';
import { renderMixedContent } from '../render-latex.js';

export function renderTrueFalse(
  container: HTMLElement,
  exercise: TrueFalseExercise,
  onComplete: () => void,
): (() => void) | null {
  // Graph wird erst nach der Antwort gezeigt (spoilert sonst die L\u00f6sung)
  let board: import('../graph/canvas-board.js').CanvasBoard | null = null;

  function showGraph(): void {
    const graphWrap = document.createElement('div');
    graphWrap.className = 'animate-fade-in mt-3 mb-2';

    const graphLabel = document.createElement('p');
    graphLabel.style.cssText = 'font-size: 0.75rem; color: var(--color-ink-muted); margin-bottom: 0.25rem;';
    const fnLatex = exercise.function.latex;
    graphLabel.textContent = fnLatex.startsWith("f'") ? "Graph von f\u2019" : fnLatex.startsWith("f''") ? "Graph von f\u2019\u2019" : 'Graph von f';
    graphWrap.appendChild(graphLabel);

    const graphContainer = document.createElement('div');
    graphWrap.appendChild(graphContainer);

    board = createBoard(graphContainer, { boundingBox: calcBoundingBox([exercise.function.fn]) });
    const bbTF = board.getBoundingBox();
    const xRangeTF: [number, number] = [Math.ceil(bbTF[0]), Math.floor(bbTF[2])];
    plotFunction(board, exercise.function.fn, undefined, 0, xRangeTF);

    if (exercise.highlightX !== undefined) {
      const y = exercise.function.fn(exercise.highlightX);
      highlightPoint(board, exercise.highlightX, y, COLORS.secondary);
    }

    // Graph vor dem Feedback einfügen
    feedbackDiv.parentElement?.insertBefore(graphWrap, feedbackDiv);
  }

  const statementEl = document.createElement('div');
  statementEl.className = 'p-4 rounded-xl border mb-4';
  statementEl.style.backgroundColor = 'var(--color-surface-inset)';
  statementEl.style.borderColor = 'var(--color-border)';

  const statementText = document.createElement('p');
  statementText.className = 'font-medium text-lg';
  renderMixedContent(statementText, exercise.statement);
  statementEl.appendChild(statementText);

  const btnRow = document.createElement('div');
  btnRow.className = 'flex gap-3 mb-4';

  const trueBtn = document.createElement('button');
  trueBtn.className = 'flex-1 py-3 border-2 rounded-lg font-semibold transition-all cursor-pointer min-h-[44px]';
  trueBtn.style.backgroundColor = 'var(--color-success-bg)';
  trueBtn.style.borderColor = 'var(--color-success-border)';
  trueBtn.style.color = 'var(--color-success)';
  trueBtn.textContent = '\u2713 Wahr';

  const falseBtn = document.createElement('button');
  falseBtn.className = 'flex-1 py-3 border-2 rounded-lg font-semibold transition-all cursor-pointer min-h-[44px]';
  falseBtn.style.backgroundColor = 'var(--color-error-bg)';
  falseBtn.style.borderColor = 'var(--color-error-border)';
  falseBtn.style.color = 'var(--color-error)';
  falseBtn.textContent = '\u2717 Falsch';

  btnRow.append(trueBtn, falseBtn);

  const reasonDiv = document.createElement('div');
  reasonDiv.className = 'hidden space-y-2 mb-4';

  const reasonLabel = document.createElement('p');
  reasonLabel.className = 'font-medium mb-2';
  reasonLabel.textContent = 'Begründung wählen:';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  let answered = false;
  let selectedTruth: boolean | null = null;

  // Shuffle reason options
  const reasonIndices = exercise.reasonOptions.map((_, i) => i);
  for (let i = reasonIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [reasonIndices[i], reasonIndices[j]] = [reasonIndices[j], reasonIndices[i]];
  }
  const shuffledReasons = reasonIndices.map(i => exercise.reasonOptions[i]);
  const shuffledCorrectReasonIndex = reasonIndices.indexOf(exercise.correctReasonIndex);

  function handleTruthChoice(choice: boolean): void {
    if (answered) return;
    selectedTruth = choice;

    // Ring highlight on selected
    if (choice) {
      trueBtn.style.boxShadow = `0 0 0 2px var(--color-success)`;
      falseBtn.style.boxShadow = 'none';
    } else {
      falseBtn.style.boxShadow = `0 0 0 2px var(--color-error)`;
      trueBtn.style.boxShadow = 'none';
    }

    // Show reason options
    reasonDiv.classList.remove('hidden');
    // Remove old buttons (keep label)
    while (reasonDiv.children.length > 1) {
      reasonDiv.removeChild(reasonDiv.lastChild!);
    }

    shuffledReasons.forEach((reason, displayIndex) => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left p-3 rounded-xl border transition-all cursor-pointer text-sm';
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
      renderMixedContent(btn, reason);
      btn.addEventListener('click', () => handleReasonChoice(displayIndex));
      reasonDiv.appendChild(btn);
    });
  }

  function handleReasonChoice(displayReasonIndex: number): void {
    if (answered) return;
    answered = true;

    const truthCorrect = selectedTruth === exercise.correct;
    const reasonCorrect = displayReasonIndex === shuffledCorrectReasonIndex;
    const allCorrect = truthCorrect && reasonCorrect;

    recordResult(exercise.module, exercise.id, allCorrect);

    // Highlight correct reason
    const reasonButtons = reasonDiv.querySelectorAll('button');
    reasonButtons.forEach((b, i) => {
      const el = b as HTMLElement;
      el.style.cursor = 'default';
      el.style.backgroundColor = '';
      if (i === shuffledCorrectReasonIndex) {
        el.style.borderColor = 'var(--color-success)';
        el.style.backgroundColor = 'var(--color-success-bg)';
      } else if (i === displayReasonIndex && !reasonCorrect) {
        el.style.borderColor = 'var(--color-error)';
        el.style.backgroundColor = 'var(--color-error-bg)';
      } else {
        el.style.opacity = '0.5';
      }
    });

    // Graph erst nach der Antwort zeigen
    showGraph();

    feedbackDiv.classList.remove('hidden');
    if (allCorrect) {
      feedbackDiv.className = 'feedback-correct animate-fade-in';
      renderMixedContent(feedbackDiv, 'Richtig! ' + exercise.feedbackExplanation);
    } else {
      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
      const parts: string[] = [];
      if (!truthCorrect) parts.push(`Die Aussage ist ${exercise.correct ? 'wahr' : 'falsch'}.`);
      if (!reasonCorrect) parts.push('Die Begr\u00fcndung war nicht korrekt.');
      renderMixedContent(feedbackDiv, parts.join(' ') + ' ' + exercise.feedbackExplanation);
    }

    onComplete();
  }

  trueBtn.addEventListener('click', () => handleTruthChoice(true));
  falseBtn.addEventListener('click', () => handleTruthChoice(false));

  reasonDiv.prepend(reasonLabel);
  container.append(statementEl, btnRow, reasonDiv, feedbackDiv);

  return () => {
    if (board) destroyBoard(board);
  };
}
