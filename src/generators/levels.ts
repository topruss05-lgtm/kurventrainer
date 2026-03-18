import type { ModuleId, ExerciseType } from '../types/exercise.js';
import type { CaseDefinition } from './types.js';
import { MONOTONIE_INTERVAL_CASES } from './gen-monotonie-intervals.js';

export interface LevelConfig {
  moduleId: ModuleId;
  exerciseType: ExerciseType;
  cases: CaseDefinition[];
}

const LEVELS: LevelConfig[] = [
  {
    moduleId: 'monotonie',
    exerciseType: 'identify-points',
    cases: MONOTONIE_INTERVAL_CASES,
  },
];

export function getLevelConfig(moduleId: ModuleId, exerciseType: ExerciseType): LevelConfig | undefined {
  return LEVELS.find(l => l.moduleId === moduleId && l.exerciseType === exerciseType);
}

export function getAllLevelConfigs(): LevelConfig[] {
  return LEVELS;
}
