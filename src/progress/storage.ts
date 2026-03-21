import type { ModuleId } from '../types/exercise.js';
import type { AppProgress, ModuleProgress } from '../types/progress.js';

const STORAGE_KEY = 'kurventrainer-progress';

function getProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppProgress;
  } catch {
    // Corrupted data, start fresh
  }
  return createEmpty();
}

function saveProgress(progress: AppProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function createEmpty(): AppProgress {
  return {
    modules: {
      monotonie: { completed: 0, total: 0, correct: 0 },
      extremstellen: { completed: 0, total: 0, correct: 0 },
      wendestellen: { completed: 0, total: 0, correct: 0 },
      zusammenhang: { completed: 0, total: 0, correct: 0 },
      kurvendiskussion: { completed: 0, total: 0, correct: 0 },
      sachkontext: { completed: 0, total: 0, correct: 0 },
    },
    results: [],
    spacedRepetition: [],
  };
}

export function getModuleProgress(moduleId: ModuleId): ModuleProgress {
  const progress = getProgress();
  return progress.modules[moduleId] ?? { completed: 0, total: 0, correct: 0 };
}

export function recordResult(moduleId: ModuleId, exerciseId: string, correct: boolean): void {
  const progress = getProgress();
  const mod = progress.modules[moduleId];
  mod.total++;
  if (correct) {
    mod.correct++;
    // Track per-exercise completion for progress dots
    if (!progress.completedExercises) progress.completedExercises = {};
    progress.completedExercises[exerciseId] = true;
  }
  mod.completed++;
  mod.lastAttempt = new Date().toISOString();

  progress.results.push({
    exerciseId,
    correct,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 500 results to avoid localStorage bloat
  if (progress.results.length > 500) {
    progress.results = progress.results.slice(-500);
  }

  saveProgress(progress);
}

export function getCompletedExercises(): Record<string, boolean> {
  return getProgress().completedExercises ?? {};
}

export function markExerciseCompleted(exerciseId: string): void {
  const progress = getProgress();
  if (!progress.completedExercises) progress.completedExercises = {};
  progress.completedExercises[exerciseId] = true;
  saveProgress(progress);
}

export function getCompletedCases(): Record<string, boolean> {
  return getProgress().completedCases ?? {};
}

export function markCaseCompleted(moduleId: string, exerciseType: string, caseId: string): void {
  const progress = getProgress();
  if (!progress.completedCases) progress.completedCases = {};
  progress.completedCases[`${moduleId}:${exerciseType}:${caseId}`] = true;
  saveProgress(progress);
}

export function getCaseProgress(moduleId: string, exerciseType: string, caseIds: string[]): { completed: number; total: number } {
  const cases = getProgress().completedCases ?? {};
  let completed = 0;
  for (const caseId of caseIds) {
    if (cases[`${moduleId}:${exerciseType}:${caseId}`]) completed++;
  }
  return { completed, total: caseIds.length };
}

export function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  // Also reset spaced repetition (Klausur-Quiz)
  localStorage.removeItem('kurventrainer-sr');
  localStorage.removeItem('kurventrainer-sr-sessions');
  localStorage.removeItem('kurventrainer-sr-last');
}

export function getLastSessionStart(): string | undefined {
  return getProgress().lastSessionStart;
}

export function updateSessionStart(): void {
  const progress = getProgress();
  progress.lastSessionStart = new Date().toISOString();
  saveProgress(progress);
}
