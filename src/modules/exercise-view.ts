import { navigate } from '../router.js';
import { getExercises } from '../data/exercise-loader.js';
import { renderCriteriaQuiz } from '../exercises/criteria-quiz.js';
import { renderIdentifyPoints } from '../exercises/identify-points.js';
import { renderTrueFalse } from '../exercises/true-false.js';
import { renderGraphAssignment } from '../exercises/graph-assignment.js';
import { renderReverseInference } from '../exercises/reverse-inference.js';
import { renderStepByStep } from '../exercises/step-by-step.js';
import { renderContextInterpretation } from '../exercises/context-interpretation.js';
import { renderGraphSketch } from '../exercises/graph-sketch.js';
import { renderContradictionArgument } from '../exercises/contradiction-argument.js';
import { renderTransformationReasoning } from '../exercises/transformation-reasoning.js';
import type { Exercise, ModuleId, ExerciseType, CompetencyLevel } from '../types/exercise.js';

export function renderExerciseView(
  container: HTMLElement,
  moduleId: string,
  type: string,
  competency: string,
): (() => void) | null {
  const exercises = getExercises(
    moduleId as ModuleId,
    type as ExerciseType,
    competency as CompetencyLevel,
  );

  if (exercises.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align: center; padding: 3rem 0;';

    const text = document.createElement('p');
    text.style.cssText = 'margin-bottom: 1rem; color: var(--color-ink-secondary); font-size: 0.9rem;';
    text.textContent = 'Noch keine Aufgaben f\u00fcr diese Kombination vorhanden.';

    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      background: none; border: none; cursor: pointer; padding: 0;
      font-size: 0.8rem; color: var(--color-primary); transition: opacity 0.15s;
    `;
    backBtn.textContent = '\u2190 Zur\u00fcck zum Modul';
    backBtn.addEventListener('click', () => navigate({ page: 'module', moduleId }));

    msg.append(text, backBtn);
    container.appendChild(msg);
    return null;
  }

  let currentIndex = 0;
  let destroyExercise: (() => void) | null = null;

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'animate-fade-in';
  backBtn.style.cssText = `
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 0.8rem; color: var(--color-ink-muted); transition: color 0.15s;
    margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.375rem;
  `;
  backBtn.textContent = '\u2190 Zur\u00fcck';
  backBtn.addEventListener('mouseenter', () => { backBtn.style.color = 'var(--color-primary)'; });
  backBtn.addEventListener('mouseleave', () => { backBtn.style.color = 'var(--color-ink-muted)'; });
  backBtn.addEventListener('click', () => navigate({ page: 'module', moduleId }));

  // ─── Progress indicator ───
  const progressWrap = document.createElement('div');
  progressWrap.className = 'animate-fade-in';
  progressWrap.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;';

  const progressText = document.createElement('span');
  progressText.style.cssText = `
    font-family: var(--font-display); font-size: 0.75rem; font-weight: 600;
    color: var(--color-ink-muted); white-space: nowrap;
  `;

  const progressTrack = document.createElement('div');
  progressTrack.style.cssText = `
    flex: 1; height: 3px; background: var(--color-surface-inset); border-radius: 2px; overflow: hidden;
  `;
  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    height: 100%; border-radius: 2px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  `;
  progressTrack.appendChild(progressFill);
  progressWrap.append(progressText, progressTrack);

  // ─── Exercise card ───
  const exerciseContainer = document.createElement('div');
  exerciseContainer.className = 'card';

  // ─── Next button ───
  const nextBtn = document.createElement('button');
  nextBtn.style.cssText = `
    display: none; width: 100%; margin-top: 1rem; padding: 0.75rem;
    background: var(--color-accent); color: #fff; border: none; border-radius: 0.5rem;
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
  `;
  nextBtn.textContent = 'N\u00e4chste Aufgabe \u2192';
  nextBtn.addEventListener('mouseenter', () => {
    nextBtn.style.backgroundColor = 'var(--color-accent-dark)';
    nextBtn.style.boxShadow = '0 2px 8px rgba(224,122,58,0.25)';
  });
  nextBtn.addEventListener('mouseleave', () => {
    nextBtn.style.backgroundColor = 'var(--color-accent)';
    nextBtn.style.boxShadow = 'none';
  });
  nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= exercises.length) {
      currentIndex = 0;
    }
    renderCurrentExercise();
  });

  container.append(backBtn, progressWrap, exerciseContainer, nextBtn);

  function renderCurrentExercise(): void {
    destroyExercise?.();
    destroyExercise = null;
    while (exerciseContainer.firstChild) {
      exerciseContainer.removeChild(exerciseContainer.firstChild);
    }
    nextBtn.style.display = 'none';

    // Update progress
    progressText.textContent = `${currentIndex + 1} / ${exercises.length}`;
    progressFill.style.width = `${((currentIndex + 1) / exercises.length) * 100}%`;

    // Subtle re-entry animation
    exerciseContainer.classList.remove('animate-scale-in');
    void exerciseContainer.offsetWidth; // force reflow
    exerciseContainer.classList.add('animate-scale-in');

    const exercise = exercises[currentIndex];
    const onComplete = () => {
      nextBtn.style.display = 'block';
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
    case 'step-by-step':
      return renderStepByStep(container, exercise, onComplete);
    case 'context-interpretation':
      return renderContextInterpretation(container, exercise, onComplete);
    case 'graph-sketch':
      return renderGraphSketch(container, exercise, onComplete);
    case 'contradiction-argument':
      return renderContradictionArgument(container, exercise, onComplete);
    case 'transformation-reasoning':
      return renderTransformationReasoning(container, exercise, onComplete);
    default:
      return null;
  }
}
