import type { ModuleId, ExerciseType } from '../types/exercise.js';

export interface ExerciseSetConfig {
  type: ExerciseType;
  requiredIds: string[];
}

export const EXERCISE_SETS: Record<ModuleId, ExerciseSetConfig[]> = {
  monotonie: [
    { type: 'identify-points', requiredIds: ['mono-id-01', 'mono-id-06', 'mono-id-07', 'mono-k2-05', 'mono-k2-06'] },
    { type: 'step-by-step', requiredIds: ['mon-step-a2-01', 'mon-step-a2-02', 'mon-step-a3-01'] },
    { type: 'true-false', requiredIds: ['mono-tf-01', 'mono-tf-02', 'mono-tf-05', 'mono-tf-07'] },
    { type: 'reverse-inference', requiredIds: ['mono-rev-01', 'mono-rev-08'] },
  ],
  extremstellen: [
    { type: 'identify-points', requiredIds: ['ext-id-01', 'ext-id-04'] },
    { type: 'graph-assignment', requiredIds: ['ext-ga-01', 'ext-ga-07'] },
    { type: 'step-by-step', requiredIds: ['ext-step-c1-01', 'ext-step-c1-04', 'ext-step-c2-01', 'ext-step-c1-07'] },
    { type: 'true-false', requiredIds: ['ext-tf-02', 'ext-tf-07'] },
    { type: 'reverse-inference', requiredIds: ['ext-rev-01', 'ext-rev-08'] },
  ],
  wendestellen: [
    { type: 'identify-points', requiredIds: ['wend-id-01', 'wend-id-04'] },
    { type: 'graph-assignment', requiredIds: ['wend-ga-01', 'wend-ga-07'] },
    { type: 'step-by-step', requiredIds: ['wst-step-d3-01', 'wst-step-d3-04', 'wst-step-d5-01', 'wst-step-d5-04'] },
    { type: 'true-false', requiredIds: ['wend-tf-01', 'wend-tf-07'] },
    { type: 'reverse-inference', requiredIds: ['wend-rev-01', 'wend-rev-08'] },
  ],
  zusammenhang: [
    { type: 'graph-assignment', requiredIds: ['zus-ga-01', 'zus-ga-07'] },
    { type: 'true-false', requiredIds: ['zus-tf-01', 'zus-tf-07'] },
    { type: 'reverse-inference', requiredIds: ['zus-rev-01', 'zus-rev-07'] },
  ],
  kurvendiskussion: [
    { type: 'step-by-step', requiredIds: ['kd-step-e3-01', 'kd-step-e3-02'] },
  ],
  sachkontext: [
    { type: 'context-interpretation', requiredIds: ['sach-f1-01', 'sach-f3-01', 'sach-f7-01'] },
  ],
};

export function getExerciseSet(moduleId: ModuleId): ExerciseSetConfig[] {
  return EXERCISE_SETS[moduleId] ?? [];
}
