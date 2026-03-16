import type { GraphAssignmentExercise } from '../types/exercise.js';
import { recordResult } from '../progress/storage.js';
import { createBoard, destroyBoard, calcBoundingBox } from '../graph/board-factory.js';
import { plotFunction, COLORS } from '../graph/function-plotter.js';

const LABEL_OPTIONS: string[] = ['f', "f'", "f''"];
const LABEL_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary];

export function renderGraphAssignment(
  container: HTMLElement,
  exercise: GraphAssignmentExercise,
  onComplete: () => void,
): (() => void) | null {
  const boards: JXG.Board[] = [];

  const prompt = document.createElement('h3');
  prompt.className = 'text-lg font-semibold mb-4';
  prompt.textContent = 'Ordne die Graphen zu: Tippe auf die Beschriftung, um sie zu ändern.';

  // Shuffle graphs for display
  const shuffled = [...exercise.graphs].sort(() => Math.random() - 0.5);
  const assignments: Map<string, string> = new Map();
  const availableLabels = LABEL_OPTIONS.slice(0, exercise.graphs.length);

  // Initialize with cycling labels
  shuffled.forEach((g, i) => {
    assignments.set(g.id, availableLabels[i % availableLabels.length]);
  });

  const graphsContainer = document.createElement('div');
  graphsContainer.className = 'space-y-4 mb-4';

  const labelButtons: HTMLButtonElement[] = [];

  shuffled.forEach((graph, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'rounded-xl p-4';
    wrapper.style.backgroundColor = 'var(--color-surface-inset)';

    const labelBtn = document.createElement('button');
    labelBtn.className =
      'mb-2 px-4 py-1.5 rounded-full font-bold text-white cursor-pointer transition-colors text-sm';
    labelBtn.style.backgroundColor = LABEL_COLORS[index % LABEL_COLORS.length];
    labelBtn.textContent = assignments.get(graph.id)!;
    labelBtn.dataset.graphId = graph.id;

    labelBtn.addEventListener('click', () => {
      if (answered) return;
      const current = assignments.get(graph.id)!;
      const currentIdx = availableLabels.indexOf(current);
      const nextLabel = availableLabels[(currentIdx + 1) % availableLabels.length];
      assignments.set(graph.id, nextLabel);
      labelBtn.textContent = nextLabel;
    });

    labelButtons.push(labelBtn);

    const graphDiv = document.createElement('div');
    wrapper.append(labelBtn, graphDiv);
    graphsContainer.appendChild(wrapper);

    const board = createBoard(graphDiv, { boundingBox: calcBoundingBox(exercise.graphs.map(g => g.function.fn)) });
    const bbGA = board.getBoundingBox();
    const xRangeGA: [number, number] = [Math.ceil(bbGA[0]), Math.floor(bbGA[2])];
    plotFunction(board, graph.function.fn, { color: LABEL_COLORS[index], strokeWidth: 2.5 }, 0, xRangeGA);
    boards.push(board);
  });

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary w-full py-3';
  submitBtn.textContent = 'Zuordnung prüfen';

  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'hidden';

  let answered = false;

  submitBtn.addEventListener('click', () => {
    if (answered) return;
    answered = true;

    const allCorrect = shuffled.every(g => assignments.get(g.id) === g.correctLabel);
    recordResult(exercise.module, exercise.id, allCorrect);

    // Show correct labels
    labelButtons.forEach(btn => {
      const gId = btn.dataset.graphId!;
      const graph = exercise.graphs.find(g => g.id === gId)!;
      const assigned = assignments.get(gId)!;
      const isCorrect = assigned === graph.correctLabel;

      btn.style.cursor = 'default';
      if (isCorrect) {
        btn.textContent = `${assigned} \u2713`;
        btn.style.backgroundColor = 'var(--color-success)';
      } else {
        btn.textContent = `${assigned} \u2717 \u2192 ${graph.correctLabel}`;
        btn.style.backgroundColor = 'var(--color-error)';
      }
    });

    feedbackDiv.classList.remove('hidden');
    if (allCorrect) {
      feedbackDiv.className = 'feedback-correct animate-fade-in';
      feedbackDiv.textContent = 'Richtig zugeordnet! Beachte: Wo f\' Nullstellen hat, hat f Extremstellen. Wo f\'\' Nullstellen hat, hat f Wendestellen.';
    } else {
      feedbackDiv.className = 'feedback-incorrect animate-fade-in';
      feedbackDiv.textContent = 'Nicht ganz. Tipp: Schaue dir an, wo ein Graph Nullstellen hat \u2014 das sind die Extremstellen des \u201Edarüberliegenden\u201C Graphen. f\' = 0 \u2192 Extremstelle von f. f\'\' = 0 \u2192 Wendestelle von f.';
    }

    submitBtn.classList.add('hidden');
    onComplete();
  });

  container.append(prompt, graphsContainer, submitBtn, feedbackDiv);

  return () => {
    boards.forEach(destroyBoard);
  };
}
