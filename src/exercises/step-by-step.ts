import type { StepByStepExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, highlightPoint, COLORS } from '../graph/function-plotter.js';
import { renderExerciseLatex, setMathOrText, renderMixedContent } from '../render-latex.js';
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

function compareNumberSets(
  inputs: string[],
  correct: number[],
  tolerance: number,
): boolean {
  const parsed = inputs
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      const frac = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
      if (frac) {
        const d = parseFloat(frac[2]);
        return d === 0 ? NaN : parseFloat(frac[1]) / d;
      }
      return parseFloat(s);
    });

  if (parsed.some(v => !Number.isFinite(v))) return false;
  if (parsed.length !== correct.length) return false;

  const used = new Set<number>();
  for (const p of parsed) {
    const idx = correct.findIndex(
      (c, i) => !used.has(i) && Math.abs(p - c) <= tolerance,
    );
    if (idx === -1) return false;
    used.add(idx);
  }
  return true;
}

export function renderStepByStep(
  container: HTMLElement,
  exercise: StepByStepExercise,
  onComplete: () => void,
): (() => void) | null {
  let board: import('../graph/canvas-board.js').CanvasBoard | null = null;
  let currentStepIndex = 0;

  const header = document.createElement('div');
  header.className = 'mb-4';

  const fnDisplay = document.createElement('h3');
  fnDisplay.className = 'text-xl font-semibold mb-3';
  fnDisplay.style.fontFamily = 'var(--font-display)';
  renderExerciseLatex(fnDisplay, exercise.function.latex);
  header.appendChild(fnDisplay);

  const taskLabel = PROCEDURE_LABELS[exercise.procedure];
  if (taskLabel) {
    const taskEl = document.createElement('p');
    taskEl.style.cssText = 'color: var(--color-ink-secondary); font-size: 0.95rem;';
    taskEl.textContent = taskLabel;
    header.appendChild(taskEl);
  }

  const stepsContainer = document.createElement('div');

  container.append(header, stepsContainer);

  const stepElements: HTMLElement[] = [];

  function revealStep(index: number): void {
    if (index >= exercise.steps.length) {
      finishExercise();
      return;
    }

    const step = exercise.steps[index];
    const stepEl = document.createElement('div');
    stepEl.className = 'mb-3 rounded-xl border overflow-hidden animate-fade-in';
    stepEl.style.borderColor = 'var(--color-border)';

    const stepHeader = document.createElement('div');
    stepHeader.className = 'px-4 py-2 text-sm font-medium';
    stepHeader.style.backgroundColor = 'var(--color-surface-inset)';
    stepHeader.style.color = 'var(--color-ink-muted)';
    stepHeader.textContent = `Schritt ${index + 1} von ${exercise.steps.length}`;

    const body = document.createElement('div');
    body.className = 'p-4';

    const instruction = document.createElement('p');
    instruction.className = 'font-medium mb-3';
    renderMixedContent(instruction, step.instruction);
    body.appendChild(instruction);

    const inputArea = document.createElement('div');
    inputArea.className = 'mb-3';

    const feedbackArea = document.createElement('div');

    const hintArea = document.createElement('div');
    hintArea.className = 'hidden text-sm mt-2 p-3 rounded-lg';
    hintArea.style.backgroundColor = 'var(--color-surface-inset)';
    hintArea.style.color = 'var(--color-ink-muted)';

    switch (step.inputType) {
      case 'multiple-choice': {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '1fr 1fr';
        grid.style.gap = '8px';

        const options = step.options ?? [];
        options.forEach((option, optIdx) => {
          const btn = document.createElement('button');
          btn.className =
            'p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[44px]';
          btn.style.borderColor = 'var(--color-border)';
          setMathOrText(btn, option);

          btn.addEventListener('click', () => {
            if (btn.dataset.locked === 'true') return;

            // Support both index-based and string-based correctAnswer
            const ca = step.correctAnswer;
            const correct = typeof ca === 'number'
              ? ca === optIdx
              : String(ca) === option;

            const allBtns = grid.querySelectorAll('button');
            allBtns.forEach(b => {
              (b as HTMLElement).dataset.locked = 'true';
              (b as HTMLElement).style.cursor = 'default';
            });

            if (correct) {
              btn.style.borderColor = 'var(--color-success)';
              btn.style.backgroundColor = 'var(--color-success-bg)';
              showCorrectFeedback(feedbackArea, step.explanation);
              collapseAndAdvance(stepEl, body, step, option, index);
            } else {
              btn.style.borderColor = 'var(--color-error)';
              btn.style.backgroundColor = 'var(--color-error-bg)';
              showIncorrectFeedback(feedbackArea);
              hintArea.classList.remove('hidden');
              hintArea.textContent = step.hint;

              setTimeout(() => {
                allBtns.forEach(b => {
                  const el = b as HTMLElement;
                  el.dataset.locked = '';
                  el.style.cursor = 'pointer';
                  el.style.borderColor = 'var(--color-border)';
                  el.style.backgroundColor = '';
                });
                feedbackArea.textContent = '';
              }, 1200);
            }
          });

          grid.appendChild(btn);
        });

        inputArea.appendChild(grid);
        break;
      }

      case 'number': {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';

        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'decimal';
        input.className = 'flex-1 p-3 rounded-xl border min-h-[44px]';
        input.style.borderColor = 'var(--color-border)';
        input.style.backgroundColor = 'var(--color-surface-inset)';
        input.placeholder = 'Antwort eingeben';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-primary px-4 py-3 rounded-xl min-h-[44px]';
        submitBtn.textContent = 'OK';

        row.append(input, submitBtn);
        inputArea.appendChild(row);

        const tolerance = step.tolerance ?? 0.01;

        const handleSubmit = () => {
          if (!input.value.trim()) return;

          const correct = validateNumber(
            input.value,
            step.correctAnswer as number,
            tolerance,
          );

          if (correct) {
            input.style.borderColor = 'var(--color-success)';
            input.disabled = true;
            submitBtn.disabled = true;
            showCorrectFeedback(feedbackArea, step.explanation);
            collapseAndAdvance(stepEl, body, step, input.value.trim(), index);
          } else {
            input.style.borderColor = 'var(--color-error)';
            showIncorrectFeedback(feedbackArea);
            hintArea.classList.remove('hidden');
            hintArea.textContent = step.hint;

            setTimeout(() => {
              input.value = '';
              input.style.borderColor = 'var(--color-border)';
              feedbackArea.textContent = '';
              input.focus();
            }, 1200);
          }
        };

        submitBtn.addEventListener('click', handleSubmit);
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') handleSubmit();
        });

        break;
      }

      case 'number-set': {
        const wrapper = document.createElement('div');
        const inputsContainer = document.createElement('div');
        inputsContainer.style.display = 'flex';
        inputsContainer.style.flexDirection = 'column';
        inputsContainer.style.gap = '8px';

        function addInput(): HTMLInputElement {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.gap = '8px';
          row.style.alignItems = 'center';

          const inp = document.createElement('input');
          inp.type = 'text';
          inp.inputMode = 'decimal';
          inp.className = 'flex-1 p-3 rounded-xl border min-h-[44px]';
          inp.style.borderColor = 'var(--color-border)';
          inp.style.backgroundColor = 'var(--color-surface-inset)';
          inp.placeholder = 'Lösung';

          const removeBtn = document.createElement('button');
          removeBtn.className = 'px-3 py-2 rounded-lg text-sm cursor-pointer min-h-[44px]';
          removeBtn.style.color = 'var(--color-error)';
          removeBtn.style.border = '1px solid var(--color-border)';
          removeBtn.textContent = '\u2212';
          removeBtn.addEventListener('click', () => {
            if (inputsContainer.children.length > 1) {
              inputsContainer.removeChild(row);
            }
          });

          row.append(inp, removeBtn);
          inputsContainer.appendChild(row);
          return inp;
        }

        addInput();

        const addBtn = document.createElement('button');
        addBtn.className = 'text-sm mt-1 px-3 py-2 rounded-lg cursor-pointer';
        addBtn.style.color = 'var(--color-primary)';
        addBtn.textContent = '+ Lösung hinzufügen';
        addBtn.addEventListener('click', () => addInput());

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-primary w-full py-3 rounded-xl mt-2 min-h-[44px]';
        submitBtn.textContent = 'Prüfen';

        wrapper.append(inputsContainer, addBtn, submitBtn);
        inputArea.appendChild(wrapper);

        const tolerance = step.tolerance ?? 0.01;
        const correctArr = step.correctAnswer as number[];

        submitBtn.addEventListener('click', () => {
          const inputs = inputsContainer.querySelectorAll('input');
          const values = Array.from(inputs).map(inp => (inp as HTMLInputElement).value);

          if (values.every(v => !v.trim())) return;

          const correct = compareNumberSets(values, correctArr, tolerance);

          if (correct) {
            inputs.forEach(inp => {
              (inp as HTMLElement).style.borderColor = 'var(--color-success)';
              (inp as HTMLInputElement).disabled = true;
            });
            submitBtn.disabled = true;
            addBtn.style.display = 'none';
            showCorrectFeedback(feedbackArea, step.explanation);
            const display = values.filter(v => v.trim()).join('; ');
            collapseAndAdvance(stepEl, body, step, display, index);
          } else {
            inputs.forEach(inp => {
              (inp as HTMLElement).style.borderColor = 'var(--color-error)';
            });
            showIncorrectFeedback(feedbackArea);
            hintArea.classList.remove('hidden');
            hintArea.textContent = step.hint;

            setTimeout(() => {
              inputs.forEach(inp => {
                (inp as HTMLInputElement).value = '';
                (inp as HTMLElement).style.borderColor = 'var(--color-border)';
              });
              feedbackArea.textContent = '';
            }, 1200);
          }
        });

        break;
      }

      case 'sign-choice': {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';

        const signs = ['< 0', '= 0', '> 0'] as const;
        signs.forEach(sign => {
          const btn = document.createElement('button');
          btn.className =
            'flex-1 py-3 rounded-xl border font-semibold transition-all cursor-pointer min-h-[44px]';
          btn.style.borderColor = 'var(--color-border)';
          btn.textContent = sign;

          btn.addEventListener('click', () => {
            if (btn.dataset.locked === 'true') return;

            const correct = String(step.correctAnswer) === sign;

            const allBtns = row.querySelectorAll('button');
            allBtns.forEach(b => {
              (b as HTMLElement).dataset.locked = 'true';
              (b as HTMLElement).style.cursor = 'default';
            });

            if (correct) {
              btn.style.borderColor = 'var(--color-success)';
              btn.style.backgroundColor = 'var(--color-success-bg)';
              showCorrectFeedback(feedbackArea, step.explanation);
              collapseAndAdvance(stepEl, body, step, sign, index);
            } else {
              btn.style.borderColor = 'var(--color-error)';
              btn.style.backgroundColor = 'var(--color-error-bg)';
              showIncorrectFeedback(feedbackArea);
              hintArea.classList.remove('hidden');
              hintArea.textContent = step.hint;

              setTimeout(() => {
                allBtns.forEach(b => {
                  const el = b as HTMLElement;
                  el.dataset.locked = '';
                  el.style.cursor = 'pointer';
                  el.style.borderColor = 'var(--color-border)';
                  el.style.backgroundColor = '';
                });
                feedbackArea.textContent = '';
              }, 1200);
            }
          });

          row.appendChild(btn);
        });

        inputArea.appendChild(row);
        break;
      }

      case 'coordinate': {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';

        const xLabel = document.createElement('span');
        xLabel.className = 'font-medium';
        xLabel.textContent = 'x:';

        const xInput = document.createElement('input');
        xInput.type = 'text';
        xInput.inputMode = 'decimal';
        xInput.className = 'flex-1 p-3 rounded-xl border min-h-[44px]';
        xInput.style.borderColor = 'var(--color-border)';
        xInput.style.backgroundColor = 'var(--color-surface-inset)';

        const yLabel = document.createElement('span');
        yLabel.className = 'font-medium';
        yLabel.textContent = 'y:';

        const yInput = document.createElement('input');
        yInput.type = 'text';
        yInput.inputMode = 'decimal';
        yInput.className = 'flex-1 p-3 rounded-xl border min-h-[44px]';
        yInput.style.borderColor = 'var(--color-border)';
        yInput.style.backgroundColor = 'var(--color-surface-inset)';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-primary px-4 py-3 rounded-xl min-h-[44px]';
        submitBtn.textContent = 'OK';

        row.append(xLabel, xInput, yLabel, yInput, submitBtn);
        inputArea.appendChild(row);

        const tolerance = step.tolerance ?? 0.01;
        const correctCoords = step.correctAnswer as number[];

        const handleSubmit = () => {
          if (!xInput.value.trim() || !yInput.value.trim()) return;

          const xOk = validateNumber(xInput.value, correctCoords[0], tolerance);
          const yOk = validateNumber(yInput.value, correctCoords[1], tolerance);

          if (xOk && yOk) {
            xInput.style.borderColor = 'var(--color-success)';
            yInput.style.borderColor = 'var(--color-success)';
            xInput.disabled = true;
            yInput.disabled = true;
            submitBtn.disabled = true;
            showCorrectFeedback(feedbackArea, step.explanation);
            const display = `(${xInput.value.trim()} | ${yInput.value.trim()})`;
            collapseAndAdvance(stepEl, body, step, display, index);
          } else {
            xInput.style.borderColor = xOk
              ? 'var(--color-success)'
              : 'var(--color-error)';
            yInput.style.borderColor = yOk
              ? 'var(--color-success)'
              : 'var(--color-error)';
            showIncorrectFeedback(feedbackArea);
            hintArea.classList.remove('hidden');
            hintArea.textContent = step.hint;

            setTimeout(() => {
              xInput.value = '';
              yInput.value = '';
              xInput.style.borderColor = 'var(--color-border)';
              yInput.style.borderColor = 'var(--color-border)';
              feedbackArea.textContent = '';
              xInput.focus();
            }, 1200);
          }
        };

        submitBtn.addEventListener('click', handleSubmit);
        yInput.addEventListener('keydown', e => {
          if (e.key === 'Enter') handleSubmit();
        });
        xInput.addEventListener('keydown', e => {
          if (e.key === 'Enter') yInput.focus();
        });

        break;
      }
    }

    body.append(inputArea, feedbackArea, hintArea);
    stepEl.append(stepHeader, body);
    stepsContainer.appendChild(stepEl);
    stepElements.push(stepEl);
  }

  function showCorrectFeedback(el: HTMLElement, explanation: string): void {
    el.textContent = '';
    const div = document.createElement('div');
    div.className = 'feedback-correct animate-fade-in mt-2 text-sm';
    div.textContent = 'Richtig! ' + explanation;
    el.appendChild(div);
  }

  function showIncorrectFeedback(el: HTMLElement): void {
    el.textContent = '';
    const div = document.createElement('div');
    div.className = 'feedback-incorrect animate-fade-in mt-2 text-sm';
    div.textContent = 'Leider falsch. Versuche es noch einmal.';
    el.appendChild(div);
  }

  function collapseAndAdvance(
    stepEl: HTMLElement,
    body: HTMLElement,
    step: StepByStepExercise['steps'][number],
    answerDisplay: string,
    index: number,
  ): void {
    setTimeout(() => {
      body.textContent = '';

      const summary = document.createElement('div');
      summary.className = 'px-4 py-3';
      summary.style.display = 'flex';
      summary.style.justifyContent = 'space-between';
      summary.style.alignItems = 'center';

      const left = document.createElement('span');
      left.className = 'text-sm';
      left.textContent = step.instruction;

      const right = document.createElement('span');
      right.className = 'text-sm font-semibold';
      right.style.color = 'var(--color-success)';
      setMathOrText(right, answerDisplay);

      summary.append(left, right);
      body.appendChild(summary);

      stepEl.style.opacity = '0.8';

      currentStepIndex = index + 1;
      revealStep(currentStepIndex);
    }, 800);
  }

  function finishExercise(): void {
    recordResult(exercise.module, exercise.id, true);

    if (exercise.verificationGraph) {
      const graphSection = document.createElement('div');
      graphSection.className = 'mt-4 animate-fade-in';

      const graphLabel = document.createElement('p');
      graphLabel.className = 'text-sm font-medium mb-2';
      graphLabel.style.color = 'var(--color-ink-muted)';
      graphLabel.textContent = 'Verifikation im Graph:';
      graphSection.appendChild(graphLabel);

      const graphContainer = document.createElement('div');
      graphContainer.className = 'mb-3';
      graphSection.appendChild(graphContainer);

      stepsContainer.appendChild(graphSection);

      const bb = calcBoundingBox([exercise.function.fn]);
      board = createBoard(graphContainer, { boundingBox: bb });
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
    }

    const successMsg = document.createElement('div');
    successMsg.className = 'feedback-correct animate-fade-in mt-4 text-center';
    const strong = document.createElement('strong');
    strong.textContent = 'Alle Schritte korrekt!';
    const rest = document.createTextNode(' Die Berechnung ist vollständig.');
    successMsg.append(strong, rest);
    stepsContainer.appendChild(successMsg);

    onComplete();
  }

  revealStep(0);

  return () => {
    if (board) destroyBoard(board);
  };
}
