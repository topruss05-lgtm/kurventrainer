import type { Exercise, ModuleId, ExerciseType, Difficulty } from '../types/exercise.js';
import { monotoneExercises } from './exercises-monotonie.js';
import { extremstellenExercises } from './exercises-extremstellen.js';
import { wendestellenExercises } from './exercises-wendestellen.js';
import { zusammenhangExercises } from './exercises-zusammenhang.js';
import { quizExercises } from './exercises-quiz.js';

const ALL_EXERCISES: Exercise[] = [
  ...monotoneExercises,
  ...extremstellenExercises,
  ...wendestellenExercises,
  ...zusammenhangExercises,
  ...quizExercises,
];

export function getExercises(
  moduleId: ModuleId,
  type: ExerciseType,
  difficulty: Difficulty,
): Exercise[] {
  const exact = ALL_EXERCISES.filter(
    e => e.module === moduleId && e.type === type && e.difficulty === difficulty,
  );
  // Fallback: if no exercises for this exact difficulty, return all of this type in this module
  if (exact.length === 0) {
    return ALL_EXERCISES.filter(
      e => e.module === moduleId && e.type === type,
    );
  }
  return exact;
}

export function getAvailableExerciseTypes(moduleId: ModuleId): ExerciseType[] {
  const types = new Set<ExerciseType>();
  for (const e of ALL_EXERCISES) {
    if (e.module === moduleId) {
      types.add(e.type);
    }
  }
  return [...types];
}

export function getAvailableDifficulties(moduleId: ModuleId, type: ExerciseType): Difficulty[] {
  const diffs = new Set<Difficulty>();
  for (const e of ALL_EXERCISES) {
    if (e.module === moduleId && e.type === type) {
      diffs.add(e.difficulty);
    }
  }
  const ORDER: Difficulty[] = ['einfuehrung', 'uebung', 'herausforderung'];
  return ORDER.filter(d => diffs.has(d));
}

export function getExerciseById(id: string): Exercise | undefined {
  return ALL_EXERCISES.find(e => e.id === id);
}

export function getAllQuizIds(): string[] {
  return ALL_EXERCISES
    .filter(e => e.type === 'criteria-quiz')
    .map(e => e.id);
}
