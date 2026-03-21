import type { Exercise, ModuleId, ExerciseType, CompetencyLevel } from '../types/exercise.js';
import { getAllLevelConfigs } from '../generators/levels.js';
import { monotoneExercises } from './exercises-monotonie.js';
import { extremstellenExercises } from './exercises-extremstellen.js';
import { wendestellenExercises } from './exercises-wendestellen.js';
import { zusammenhangExercises } from './exercises-zusammenhang.js';
// Old quiz exercises removed — replaced by standalone Klausur-Quiz (src/quiz/)
import { stepExtremstellenExercises } from './exercises-step-extremstellen.js';
import { stepWendestellenExercises } from './exercises-step-wendestellen.js';
import { sachkontextExercises } from './exercises-sachkontext.js';
import { kurvendiskussionExercises } from './exercises-kurvendiskussion.js';
import { contradictionExercises } from './exercises-contradiction.js';
import { transformationExercises } from './exercises-transformation.js';
import { remainingExercises } from './exercises-remaining.js';

const ALL_EXERCISES: Exercise[] = [
  ...monotoneExercises,
  ...extremstellenExercises,
  ...wendestellenExercises,
  ...zusammenhangExercises,
  ...stepExtremstellenExercises,
  ...stepWendestellenExercises,
  ...sachkontextExercises,
  ...kurvendiskussionExercises,
  ...contradictionExercises,
  ...transformationExercises,
  ...remainingExercises,
];

export function getExercises(
  moduleId: ModuleId,
  type: ExerciseType,
  competency: CompetencyLevel,
): Exercise[] {
  const exact = ALL_EXERCISES.filter(
    e => e.module === moduleId && e.type === type && e.competency === competency,
  );
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
  // Also include types from level configs (generator-based, no fixed data)
  for (const lc of getAllLevelConfigs()) {
    if (lc.moduleId === moduleId) {
      types.add(lc.exerciseType);
    }
  }
  return [...types];
}

export function getAvailableCompetencyLevels(moduleId: ModuleId, type: ExerciseType): CompetencyLevel[] {
  const levels = new Set<CompetencyLevel>();
  for (const e of ALL_EXERCISES) {
    if (e.module === moduleId && e.type === type) {
      levels.add(e.competency);
    }
  }
  const ORDER: CompetencyLevel[] = ['K1', 'K2', 'K3', 'K4', 'K5'];
  return ORDER.filter(l => levels.has(l));
}

export function getExerciseById(id: string): Exercise | undefined {
  return ALL_EXERCISES.find(e => e.id === id);
}

export function getExercisesByModule(moduleId: ModuleId): Exercise[] {
  return ALL_EXERCISES.filter(e => e.module === moduleId);
}

export function getExerciseCountByType(moduleId: ModuleId, type: ExerciseType): number {
  return ALL_EXERCISES.filter(e => e.module === moduleId && e.type === type).length;
}

export function getAllQuizIds(): string[] {
  return ALL_EXERCISES
    .filter(e => e.type === 'criteria-quiz')
    .map(e => e.id);
}
