import type { StepByStepExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { renderMixedContent } from '../render-latex.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';
import { PROCEDURE_LABELS } from './procedure-labels.js';

function validateNumber(input: string, correct: number, tolerance: number): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  let value: number;
  const fractionMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const denom = parseFloat(fractionMatch[2]);
    if (denom === 0) return false;
    value = parseFloat(fractionMatch[1]) / denom;
  } else {
    value = parseFloat(trimmed);
  }

  if (!Number.isFinite(value)) return false;
  return Math.abs(value - correct) <= tolerance;
}

export function renderFreeMode(
  container: HTMLElement,
  exercise: StepByStepExercise,
  onComplete: () => void,
): (() => void) | null {
  let board: import('../graph/canvas-board.js').CanvasBoard | null = null;

  // ─── Header (Klausur-Layout) ───
  const header = document.createElement('div');
  header.className = 'mb-4';
  header.style.cssText = 'font-size: 1.05rem; line-height: 1.7;';

  const fnLine = document.createElement('p');
  fnLine.className = 'mb-1';
  renderMixedContent(fnLine, `Gegeben ist die Funktion f mit \\(${exercise.function.latex}\\).`);
  header.appendChild(fnLine);

  const taskLabel = exercise.task ?? PROCEDURE_LABELS[exercise.procedure] ?? 'Löse die Aufgabe.';
  const taskEl = document.createElement('p');
  renderMixedContent(taskEl, taskLabel);
  header.appendChild(taskEl);

  container.appendChild(header);

  // ─── Answer area ───
  const answerSection = document.createElement('div');
  answerSection.className = 'mb-4';
  container.appendChild(answerSection);

  const highlights = exercise.verificationGraph?.highlights ?? [];

  if (highlights.length > 0) {
    renderCoordinateInput(answerSection, highlights, exercise, onComplete, () => {
      showSolution(container, exercise);
      showVerificationGraph(container, exercise, (b) => { board = b; });
    });
  } else {
    // Fallback: Lösung direkt über step-by-step Lösungsweg zeigen
    renderHintButton(answerSection, exercise, onComplete);
  }

  return () => {
    if (board) destroyBoard(board);
  };
}

function renderCoordinateInput(
  container: HTMLElement,
  highlights: Array<{ x: number; y: number; label: string }>,
  exercise: StepByStepExercise,
  onComplete: () => void,
  onCorrect: () => void,
): void {
  const prompt = document.createElement('p');
  prompt.className = 'font-medium mb-3 text-sm';
  prompt.textContent = `Gib ${highlights.length === 1 ? 'den gesuchten Punkt' : `die ${highlights.length} gesuchten Punkte`} als Koordinaten ein:`;
  container.appendChild(prompt);

  const inputRows: Array<{ xInput: HTMLInputElement; yInput: HTMLInputElement }> = [];

  for (let i = 0; i < highlights.length; i++) {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;';

    const openParen = document.createElement('span');
    openParen.className = 'font-medium';
    openParen.textContent = '(';

    const xInput = document.createElement('input');
    xInput.type = 'text';
    xInput.inputMode = 'decimal';
    xInput.placeholder = 'x';
    xInput.className = 'p-2 rounded-lg border min-h-[40px]';
    xInput.style.cssText = 'width: 5rem; border-color: var(--color-border); background: var(--color-surface-inset);';

    const sep = document.createElement('span');
    sep.className = 'font-medium';
    sep.textContent = '|';

    const yInput = document.createElement('input');
    yInput.type = 'text';
    yInput.inputMode = 'decimal';
    yInput.placeholder = 'y';
    yInput.className = 'p-2 rounded-lg border min-h-[40px]';
    yInput.style.cssText = 'width: 5rem; border-color: var(--color-border); background: var(--color-surface-inset);';

    const closeParen = document.createElement('span');
    closeParen.className = 'font-medium';
    closeParen.textContent = ')';

    row.append(openParen, xInput, sep, yInput, closeParen);
    container.appendChild(row);
    inputRows.push({ xInput, yInput });
  }

  const feedbackArea = document.createElement('div');
  container.appendChild(feedbackArea);

  const checkBtn = document.createElement('button');
  checkBtn.className = 'btn-primary w-full py-3 rounded-xl mt-3 min-h-[44px]';
  checkBtn.textContent = 'Prüfen';
  container.appendChild(checkBtn);

  checkBtn.addEventListener('click', () => {
    const tolerance = 0.1;

    // Collect all entered coordinate pairs
    const entered = inputRows.map(({ xInput, yInput }) => ({
      x: xInput.value.trim(),
      y: yInput.value.trim(),
    }));

    if (entered.some(e => !e.x || !e.y)) {
      return; // Not all fields filled
    }

    // Match each entered pair against highlights (order-independent)
    const used = new Set<number>();
    let allCorrect = true;

    for (let i = 0; i < entered.length; i++) {
      const matchIdx = highlights.findIndex((hl, idx) =>
        !used.has(idx)
        && validateNumber(entered[i].x, hl.x, tolerance)
        && validateNumber(entered[i].y, hl.y, tolerance),
      );

      if (matchIdx !== -1) {
        used.add(matchIdx);
        inputRows[i].xInput.style.borderColor = 'var(--color-success)';
        inputRows[i].yInput.style.borderColor = 'var(--color-success)';
      } else {
        allCorrect = false;
        inputRows[i].xInput.style.borderColor = 'var(--color-error)';
        inputRows[i].yInput.style.borderColor = 'var(--color-error)';
      }
    }

    feedbackArea.textContent = '';

    if (allCorrect) {
      const fb = document.createElement('div');
      fb.className = 'feedback-correct animate-fade-in mt-3';
      const strong = document.createElement('strong');
      strong.textContent = 'Richtig!';
      fb.appendChild(strong);
      feedbackArea.appendChild(fb);

      checkBtn.disabled = true;
      inputRows.forEach(({ xInput, yInput }) => {
        xInput.disabled = true;
        yInput.disabled = true;
      });

      recordResult(exercise.module, exercise.id, true);
      onCorrect();
      onComplete();
    } else {
      const fb = document.createElement('div');
      fb.className = 'feedback-incorrect animate-fade-in mt-3';
      fb.textContent = 'Noch nicht ganz richtig. \u00dcberpr\u00fcfe die rot markierten Werte.';
      failCount++;
      if (failCount >= 1) hintBtn.style.display = 'block';
      feedbackArea.appendChild(fb);

      setTimeout(() => {
        inputRows.forEach(({ xInput, yInput }) => {
          xInput.style.borderColor = 'var(--color-border)';
          yInput.style.borderColor = 'var(--color-border)';
        });
        feedbackArea.textContent = '';
      }, 2000);
    }
  });

  // Hinweis-Button: erscheint erst nach Fehlversuch
  let failCount = 0;
  const hintBtn = document.createElement('button');
  hintBtn.style.cssText = `
    display: none; width: 100%; margin-top: 0.75rem; padding: 0.625rem;
    background: none; border: 1px solid var(--color-border); border-radius: 0.75rem;
    font-size: 0.85rem; color: var(--color-ink-muted); cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  `;
  hintBtn.textContent = 'Hinweis: L\u00f6sungsweg anzeigen';
  hintBtn.addEventListener('click', () => {
    hintBtn.style.display = 'none';
    showSolution(container.parentElement!, exercise);
  });
  container.appendChild(hintBtn);
}

// ─── Hinweis-Button statt "Lösung anzeigen" ───

function renderHintButton(
  container: HTMLElement,
  exercise: StepByStepExercise,
  onComplete: () => void,
): void {
  const info = document.createElement('p');
  info.className = 'text-sm mb-3';
  info.style.color = 'var(--color-ink-muted)';
  info.textContent = 'Rechne die Aufgabe auf Papier und pr\u00fcfe dein Ergebnis.';
  container.appendChild(info);

  const doneBtn = document.createElement('button');
  doneBtn.className = 'btn-primary w-full py-3 rounded-xl min-h-[44px]';
  doneBtn.textContent = 'Fertig \u2014 L\u00f6sungsweg anzeigen';
  doneBtn.addEventListener('click', () => {
    doneBtn.style.display = 'none';
    info.style.display = 'none';
    showSolution(container.parentElement!, exercise);
    recordResult(exercise.module, exercise.id, true);
    onComplete();
  });
  container.appendChild(doneBtn);
}

function showSolution(
  container: HTMLElement,
  exercise: StepByStepExercise,
): void {
  const section = document.createElement('div');
  section.className = 'mt-4 animate-fade-in';

  const title = document.createElement('p');
  title.className = 'font-medium mb-3 text-sm';
  title.style.color = 'var(--color-ink-muted)';
  title.textContent = 'Musterlösung';
  section.appendChild(title);

  for (const step of exercise.steps) {
    const stepEl = document.createElement('div');
    stepEl.className = 'mb-2 rounded-lg border overflow-hidden';
    stepEl.style.borderColor = 'var(--color-border)';

    const row = document.createElement('div');
    row.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.625rem 0.875rem;
    `;

    const left = document.createElement('span');
    left.className = 'text-sm';
    left.style.color = 'var(--color-ink-secondary)';
    left.textContent = step.instruction;

    const right = document.createElement('span');
    right.className = 'text-sm font-semibold';
    right.style.color = 'var(--color-success)';

    // Format the answer display
    const answer = step.correctAnswer;
    if (Array.isArray(answer)) {
      right.textContent = answer.map(v => String(v)).join('; ');
    } else {
      right.textContent = String(answer);
    }

    row.append(left, right);
    stepEl.appendChild(row);

    // Explanation
    const explanation = document.createElement('div');
    explanation.className = 'px-3 pb-2 text-sm';
    explanation.style.color = 'var(--color-ink-muted)';
    explanation.textContent = step.explanation;
    stepEl.appendChild(explanation);

    section.appendChild(stepEl);
  }

  container.appendChild(section);
}

function showVerificationGraph(
  container: HTMLElement,
  exercise: StepByStepExercise,
  onBoard: (board: import('../graph/canvas-board.js').CanvasBoard) => void,
): void {
  if (!exercise.verificationGraph) return;

  const graphSection = document.createElement('div');
  graphSection.className = 'mt-4 animate-fade-in';

  const graphLabel = document.createElement('p');
  graphLabel.className = 'text-sm font-medium mb-2';
  graphLabel.style.color = 'var(--color-ink-muted)';
  graphLabel.textContent = 'Graph zur Kontrolle:';
  graphSection.appendChild(graphLabel);

  const graphContainer = document.createElement('div');
  graphContainer.className = 'mb-3';
  graphSection.appendChild(graphContainer);

  container.appendChild(graphSection);

  const bb = calcBoundingBox([exercise.function.fn]);
  const board = createBoard(graphContainer, { boundingBox: bb });
  const xRange: [number, number] = [Math.ceil(bb[0]), Math.floor(bb[2])];
  plotFunction(board, exercise.function.fn, undefined, 0, xRange);

  for (const hl of exercise.verificationGraph.highlights) {
    highlightPoint(
      board,
      hl.x,
      hl.y,
      hl.color ?? COLORS.secondary,
      hl.label,
    );
  }

  onBoard(board);
}
