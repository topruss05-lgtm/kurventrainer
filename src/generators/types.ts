import type { Exercise, ModuleId } from '../types/exercise.js';

export interface ExerciseGenerator {
  generate(): Exercise;
}

export type GeneratorRegistry = Record<ModuleId, ExerciseGenerator[]>;
