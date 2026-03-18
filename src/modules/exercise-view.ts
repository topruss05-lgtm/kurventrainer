import { navigate } from '../router.js';
import { getExercises } from '../data/exercise-loader.js';
import { renderCriteriaQuiz } from '../exercises/criteria-quiz.js';
import { renderIdentifyPoints } from '../exercises/identify-points.js';
import { renderTrueFalse } from '../exercises/true-false.js';
import { renderGraphAssignment } from '../exercises/graph-assignment.js';
import { renderReverseInference } from '../exercises/reverse-inference.js';
import { renderStepByStep } from '../exercises/step-by-step.js';
import { renderFreeMode } from '../exercises/free-mode.js';
import { renderContextInterpretation } from '../exercises/context-interpretation.js';

import { renderContradictionArgument } from '../exercises/contradiction-argument.js';
import { renderTransformationReasoning } from '../exercises/transformation-reasoning.js';
import { generateRandomExercise } from '../generators/registry.js';
import { getLevelConfig } from '../generators/levels.js';
import { getCompletedCases, markCaseCompleted } from '../progress/storage.js';
import type { Exercise, ModuleId, ExerciseType, CompetencyLevel } from '../types/exercise.js';
import type { CaseDefinition } from '../generators/types.js';

type StepByStepMode = 'guided' | 'free';

export function renderExerciseView(
  container: HTMLElement,
  moduleId: string,
  type: string,
  competency: string,
): (() => void) | null {
  // ─── Endlosmodus ───
  if (type === 'random') {
    return renderEndlessMode(container, moduleId as ModuleId);
  }

  // ─── Level-Modus (generierte Aufgaben mit Case-Queue) ───
  const levelConfig = getLevelConfig(moduleId as ModuleId, type as ExerciseType);
  if (levelConfig) {
    return renderLevelMode(container, levelConfig);
  }

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

  const isStepByStep = exercises.every(e => e.type === 'step-by-step');

  let currentIndex = 0;
  let destroyExercise: (() => void) | null = null;
  let selectedMode: StepByStepMode = 'guided';

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'animate-fade-in';
  backBtn.style.cssText = `
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 0.8rem; color: var(--color-ink-muted); transition: color 0.15s;
    margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.375rem;
  `;
  backBtn.textContent = '\u2190 Zurück';
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

  // ─── Mode picker (only for step-by-step exercises) ───
  let modePicker: HTMLElement | null = null;
  if (isStepByStep) {
    modePicker = createModePicker((mode) => {
      selectedMode = mode;
      // Update active states
      const btns = modePicker!.querySelectorAll<HTMLElement>('[data-mode]');
      btns.forEach(btn => {
        const isActive = btn.dataset.mode === mode;
        btn.style.borderColor = isActive
          ? (mode === 'guided' ? 'var(--color-primary)' : 'var(--color-accent)')
          : 'var(--color-border)';
        btn.style.backgroundColor = isActive
          ? (mode === 'guided' ? 'var(--color-primary-light)' : 'var(--color-accent-light)')
          : '';
      });
      renderCurrentExercise();
    });
  }

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
  nextBtn.textContent = 'Nächste Aufgabe \u2192';
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

  if (modePicker) {
    container.append(backBtn, progressWrap, modePicker, exerciseContainer, nextBtn);
  } else {
    container.append(backBtn, progressWrap, exerciseContainer, nextBtn);
  }

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

    destroyExercise = renderExerciseByType(exerciseContainer, exercise, onComplete, selectedMode);
  }

  renderCurrentExercise();

  return () => {
    destroyExercise?.();
  };
}

function createModePicker(onSelect: (mode: StepByStepMode) => void): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'animate-fade-in';
  wrap.style.cssText = `
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
    margin-bottom: 1rem;
  `;

  const guidedBtn = createModeCard(
    'Geführt',
    'Schritt für Schritt durch das Verfahren',
    'guided',
    'var(--color-primary)',
    'var(--color-primary-light)',
    true,
  );

  const freeBtn = createModeCard(
    'Frei rechnen',
    'Selbst rechnen und Ergebnis prüfen',
    'free',
    'var(--color-accent)',
    'var(--color-accent-light)',
    false,
  );

  guidedBtn.addEventListener('click', () => onSelect('guided'));
  freeBtn.addEventListener('click', () => onSelect('free'));

  wrap.append(guidedBtn, freeBtn);
  return wrap;
}

function createModeCard(
  title: string,
  subtitle: string,
  mode: StepByStepMode,
  accentColor: string,
  accentBg: string,
  activeByDefault: boolean,
): HTMLElement {
  const card = document.createElement('button');
  card.dataset.mode = mode;
  card.style.cssText = `
    display: flex; flex-direction: column; gap: 0.25rem;
    padding: 0.875rem 1rem;
    background: ${activeByDefault ? accentBg : 'var(--color-surface-card)'};
    border: 2px solid ${activeByDefault ? accentColor : 'var(--color-border)'};
    border-radius: 0.75rem;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
  `;

  card.addEventListener('mouseenter', () => {
    if (card.style.borderColor !== accentColor) {
      card.style.borderColor = 'var(--color-border-hover)';
      card.style.boxShadow = 'var(--shadow-card-hover)';
    }
  });
  card.addEventListener('mouseleave', () => {
    if (card.style.backgroundColor !== accentBg) {
      card.style.borderColor = 'var(--color-border)';
      card.style.boxShadow = 'none';
    }
  });

  const titleEl = document.createElement('span');
  titleEl.style.cssText = `
    font-family: var(--font-display); font-weight: 700; font-size: 0.9rem;
    color: var(--color-ink);
  `;
  titleEl.textContent = title;

  const subtitleEl = document.createElement('span');
  subtitleEl.style.cssText = 'font-size: 0.8rem; color: var(--color-ink-muted);';
  subtitleEl.textContent = subtitle;

  card.append(titleEl, subtitleEl);
  return card;
}

function renderExerciseByType(
  container: HTMLElement,
  exercise: Exercise,
  onComplete: () => void,
  mode: StepByStepMode = 'guided',
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
      // Frei-Modus mit nur 1 Step → spezielle Eingabe-UI, sonst normaler step-by-step
      return (mode === 'free' && exercise.steps.length === 1)
        ? renderFreeMode(container, exercise, onComplete)
        : renderStepByStep(container, exercise, onComplete);
    case 'context-interpretation':
      return renderContextInterpretation(container, exercise, onComplete);
    case 'contradiction-argument':
      return renderContradictionArgument(container, exercise, onComplete);
    case 'transformation-reasoning':
      return renderTransformationReasoning(container, exercise, onComplete);
    default:
      return null;
  }
}

// ─── Endlosmodus: zuf\u00e4llige generierte Aufgaben ───

function renderEndlessMode(
  container: HTMLElement,
  moduleId: ModuleId,
): (() => void) | null {
  let destroyExercise: (() => void) | null = null;
  let solvedCount = 0;

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'back-link animate-fade-in';
  backBtn.style.cssText = 'margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.375rem;';
  backBtn.textContent = '\u2190 Zur\u00fcck';
  backBtn.addEventListener('click', () => navigate({ page: 'module', moduleId }));

  // ─── Counter ───
  const counterWrap = document.createElement('div');
  counterWrap.className = 'animate-fade-in';
  counterWrap.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;';

  const counterText = document.createElement('span');
  counterText.style.cssText = `
    font-family: var(--font-display); font-size: 0.75rem; font-weight: 600;
    color: var(--color-ink-muted); white-space: nowrap;
  `;
  counterText.textContent = 'Endlosmodus \u2014 0 gel\u00f6st';

  const counterBadge = document.createElement('span');
  counterBadge.style.cssText = `
    font-family: var(--font-display); font-size: 0.7rem; font-weight: 600;
    color: var(--color-accent); background: var(--color-accent-light);
    padding: 0.2rem 0.5rem; border-radius: 9999px;
  `;
  counterBadge.textContent = '\u221e';

  counterWrap.append(counterText, counterBadge);

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
  nextBtn.addEventListener('click', () => renderNext());

  container.append(backBtn, counterWrap, exerciseContainer, nextBtn);

  function renderNext(): void {
    destroyExercise?.();
    destroyExercise = null;
    while (exerciseContainer.firstChild) {
      exerciseContainer.removeChild(exerciseContainer.firstChild);
    }
    nextBtn.style.display = 'none';

    exerciseContainer.classList.remove('animate-scale-in');
    void exerciseContainer.offsetWidth;
    exerciseContainer.classList.add('animate-scale-in');

    const exercise = generateRandomExercise(moduleId);
    const onComplete = () => {
      solvedCount++;
      counterText.textContent = `Endlosmodus \u2014 ${solvedCount} gel\u00f6st`;
      nextBtn.style.display = 'block';
    };

    destroyExercise = renderExerciseByType(exerciseContainer, exercise, onComplete);
  }

  renderNext();

  return () => {
    destroyExercise?.();
  };
}

// ─── Level-Modus: Case-Queue mit Fortschritt + Completion ───

function renderLevelMode(
  container: HTMLElement,
  config: import('../generators/levels.js').LevelConfig,
): (() => void) | null {
  let destroyExercise: (() => void) | null = null;
  const { moduleId, exerciseType, cases } = config;

  // Build queue: uncompleted cases first, then completed (for replay)
  const completedCases = getCompletedCases();
  const remaining: CaseDefinition[] = [];
  const done: CaseDefinition[] = [];
  for (const c of cases) {
    const key = `${moduleId}:${exerciseType}:${c.id}`;
    if (completedCases[key]) {
      done.push(c);
    } else {
      remaining.push(c);
    }
  }

  // Feste didaktische Reihenfolge: uncompleted Cases zuerst, dann completed
  const queue = [...remaining, ...done];
  let queueIndex = 0;
  let currentCase: CaseDefinition | null = null;
  let justCompleted = false;

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'back-link animate-fade-in';
  backBtn.style.cssText = 'margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.375rem;';
  backBtn.textContent = '\u2190 Zur\u00fcck';
  backBtn.addEventListener('click', () => navigate({ page: 'module', moduleId }));

  // ─── Progress bar ───
  const progressWrap = document.createElement('div');
  progressWrap.className = 'animate-fade-in';
  progressWrap.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;';

  const progressText = document.createElement('span');
  progressText.style.cssText = `
    font-family: var(--font-display); font-size: 0.75rem; font-weight: 600;
    color: var(--color-ink-muted); white-space: nowrap;
  `;

  const dotsRow = document.createElement('div');
  dotsRow.style.cssText = 'display: flex; align-items: center; gap: 4px; flex: 1;';

  const dots: HTMLElement[] = [];
  for (const c of cases) {
    const dot = document.createElement('span');
    const key = `${moduleId}:${exerciseType}:${c.id}`;
    const isDone = !!completedCases[key];
    dot.style.cssText = `
      flex: 1; height: 6px; border-radius: 3px; transition: background 0.3s;
      background: ${isDone ? 'var(--color-success)' : 'var(--color-surface-inset)'};
    `;
    dot.title = c.label;
    dotsRow.appendChild(dot);
    dots.push(dot);
  }

  progressWrap.append(progressText, dotsRow);

  function updateProgress(): void {
    const cc = getCompletedCases();
    let count = 0;
    cases.forEach((c, i) => {
      const key = `${moduleId}:${exerciseType}:${c.id}`;
      const isDone = !!cc[key];
      if (isDone) count++;
      dots[i].style.background = isDone ? 'var(--color-success)' : 'var(--color-surface-inset)';
    });
    progressText.textContent = `${count} / ${cases.length}`;
  }
  updateProgress();

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
  nextBtn.addEventListener('click', () => renderNextCase());

  container.append(backBtn, progressWrap, exerciseContainer, nextBtn);

  function renderNextCase(): void {
    destroyExercise?.();
    destroyExercise = null;
    while (exerciseContainer.firstChild) {
      exerciseContainer.removeChild(exerciseContainer.firstChild);
    }
    nextBtn.style.display = 'none';

    // Check if all cases completed → show completion
    const cc = getCompletedCases();
    const allDone = cases.every(c => cc[`${moduleId}:${exerciseType}:${c.id}`]);

    if (allDone && !justCompleted) {
      justCompleted = true;
      showCompletion(exerciseContainer, () => {
        // After celebration, continue with endless generated exercises
        nextBtn.textContent = 'Weiter \u00fcben \u2192';
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => renderNextCase();
      });
      return;
    }

    exerciseContainer.classList.remove('animate-scale-in');
    void exerciseContainer.offsetWidth;
    exerciseContainer.classList.add('animate-scale-in');

    // Pick next case from queue (cycle through)
    if (queueIndex >= queue.length) queueIndex = 0;
    currentCase = queue[queueIndex];
    queueIndex++;

    const exercise = currentCase.generate();
    const caseId = currentCase.id;
    const caseMode = currentCase.mode;

    const onComplete = (correct = true) => {
      if (correct) {
        markCaseCompleted(moduleId, exerciseType, caseId);
        updateProgress();
      } else {
        // Falsch → gleichen Case nochmal in die Queue (neue Zufallswerte)
        queue.splice(queueIndex, 0, currentCase!);
      }
      nextBtn.style.display = 'block';
    };

    // Free mode: nur bei 1-Step-Exercises die spezielle Eingabe-UI nutzen
    if (caseMode === 'free' && exercise.type === 'step-by-step' && exercise.steps.length === 1) {
      destroyExercise = renderFreeMode(exerciseContainer, exercise, onComplete);
    } else {
      destroyExercise = renderExerciseByType(exerciseContainer, exercise, onComplete);
    }
  }

  renderNextCase();

  return () => {
    destroyExercise?.();
  };
}

function showCompletion(container: HTMLElement, onContinue: () => void): void {
  const wrap = document.createElement('div');
  wrap.className = 'animate-scale-in';
  wrap.style.cssText = 'text-align: center; padding: 2rem 1rem;';

  const checkmark = document.createElement('div');
  checkmark.style.cssText = `
    width: 4rem; height: 4rem; border-radius: 50%; margin: 0 auto 1.25rem;
    background: var(--color-success-bg); border: 3px solid var(--color-success);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem; color: var(--color-success);
    animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  `;
  checkmark.textContent = '\u2713';

  const title = document.createElement('h2');
  title.style.cssText = `
    font-family: var(--font-display); font-weight: 800; font-size: 1.5rem;
    color: var(--color-ink); margin-bottom: 0.5rem;
  `;
  title.textContent = 'Level geschafft!';

  const sub = document.createElement('p');
  sub.style.cssText = 'font-size: 0.9rem; color: var(--color-ink-muted); margin-bottom: 1.5rem;';
  sub.textContent = 'Alle Aufgabentypen einmal korrekt gel\u00f6st. Du kannst jetzt weiter \u00fcben oder zum Modul zur\u00fcckkehren.';

  wrap.append(checkmark, title, sub);
  container.appendChild(wrap);

  setTimeout(onContinue, 800);
}
