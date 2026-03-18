import type { Exercise, ModuleId, ExerciseType } from '../types/exercise.js';

export interface ExerciseGenerator {
  generate(): Exercise;
}

export interface CaseDefinition {
  id: string;
  label: string;
  generate(): Exercise;
}

export interface LevelConfig {
  moduleId: ModuleId;
  exerciseType: ExerciseType;
  cases: CaseDefinition[];
}

export type GeneratorRegistry = Record<ModuleId, ExerciseGenerator[]>;
