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
      quiz: { completed: 0, total: 0, correct: 0 },
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
  if (correct) mod.correct++;
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

export function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getLastSessionStart(): string | undefined {
  return getProgress().lastSessionStart;
}

export function updateSessionStart(): void {
  const progress = getProgress();
  progress.lastSessionStart = new Date().toISOString();
  saveProgress(progress);
}
