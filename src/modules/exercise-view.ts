import { navigate } from '../router.js';
import { getExercises } from '../data/exercise-loader.js';
import { renderCriteriaQuiz } from '../exercises/criteria-quiz.js';
import { renderIdentifyPoints } from '../exercises/identify-points.js';
import { renderTrueFalse } from '../exercises/true-false.js';
import { renderGraphAssignment } from '../exercises/graph-assignment.js';
import { renderReverseInference } from '../exercises/reverse-inference.js';
import type { Exercise, ModuleId, ExerciseType, Difficulty } from '../types/exercise.js';

export function renderExerciseView(
  container: HTMLElement,
  moduleId: string,
  type: string,
  difficulty: string,
): (() => void) | null {
  const exercises = getExercises(
    moduleId as ModuleId,
    type as ExerciseType,
    difficulty as Difficulty,
  );

  if (exercises.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'text-center py-12';

    const text = document.createElement('p');
    text.className = 'mb-4';
    text.style.color = 'var(--color-ink-secondary)';
    text.textContent = 'Noch keine Aufgaben für diese Kombination vorhanden.';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-link';
    backBtn.style.color = 'var(--color-primary)';
    backBtn.textContent = '\u2190 Zurück zum Modul';
    backBtn.addEventListener('click', () => navigate({ page: 'module', moduleId }));

    msg.append(text, backBtn);
    container.appendChild(msg);
    return null;
  }

  let currentIndex = 0;
  let destroyExercise: (() => void) | null = null;

  const backBtn = document.createElement('button');
  backBtn.className = 'back-link mb-4';
  backBtn.textContent = '\u2190 Zurück zum Modul';
  backBtn.addEventListener('click', () => navigate({ page: 'module', moduleId }));

  const progress = document.createElement('p');
  progress.className = 'text-sm mb-4';
  progress.style.color = 'var(--color-ink-muted)';

  const exerciseContainer = document.createElement('div');
  exerciseContainer.className = 'card';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-accent mt-4 w-full py-3 text-base hidden';
  nextBtn.textContent = 'Nächste Aufgabe \u2192';
  nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= exercises.length) {
      currentIndex = 0;
    }
    renderCurrentExercise();
  });

  container.append(backBtn, progress, exerciseContainer, nextBtn);

  function renderCurrentExercise(): void {
    destroyExercise?.();
    destroyExercise = null;
    while (exerciseContainer.firstChild) {
      exerciseContainer.removeChild(exerciseContainer.firstChild);
    }
    nextBtn.classList.add('hidden');
    progress.textContent = `Aufgabe ${currentIndex + 1} von ${exercises.length}`;

    // Subtle re-entry animation
    exerciseContainer.classList.remove('animate-scale-in');
    void exerciseContainer.offsetWidth; // force reflow
    exerciseContainer.classList.add('animate-scale-in');

    const exercise = exercises[currentIndex];
    const onComplete = () => {
      nextBtn.classList.remove('hidden');
    };

    destroyExercise = renderExerciseByType(exerciseContainer, exercise, onComplete);
  }

  renderCurrentExercise();

  return () => {
    destroyExercise?.();
  };
}

function renderExerciseByType(
  container: HTMLElement,
  exercise: Exercise,
  onComplete: () => void,
): (() => void) | null {
  switch (exercise.type) {
    case 'criteria-quiz':
      return renderCriteriaQuiz(container, exercise, onComplete);
    case 'identify-points':
      return renderIdentifyPoints(container, exercise, onComplete);
    case 'true-false':
      return renderTrueFalse(container, exercise, onComplete);
    case 'graph-assignment':
      return renderGraphAssignment(container, exercise, onComplete);
    case 'reverse-inference':
      return renderReverseInference(container, exercise, onComplete);
    default:
      return null;
  }
}
