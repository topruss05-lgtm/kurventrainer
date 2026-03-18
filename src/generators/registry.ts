import type { Exercise, ModuleId } from '../types/exercise.js';
import type { ExerciseGenerator } from './types.js';
import { monotonieIntervalGenerator } from './gen-monotonie-intervals.js';
import { extremstellenGenerator } from './gen-extremstellen.js';
import { wendestellenGenerator } from './gen-wendestellen.js';
import { getExercisesByModule } from '../data/exercise-loader.js';

const GENERATORS: Partial<Record<ModuleId, ExerciseGenerator[]>> = {
  monotonie: [monotonieIntervalGenerator],
  extremstellen: [extremstellenGenerator],
  wendestellen: [wendestellenGenerator],
};

export function generateRandomExercise(moduleId: ModuleId): Exercise {
  const generators = GENERATORS[moduleId];

  if (generators && generators.length > 0) {
    // 50% chance to use a generator, 50% to pick from existing pool
    if (Math.random() < 0.5) {
      const gen = generators[Math.floor(Math.random() * generators.length)];
      return gen.generate();
    }
  }

  // Fallback: pick random existing exercise from this module
  const pool = getExercisesByModule(moduleId);
  return pool[Math.floor(Math.random() * pool.length)];
}
