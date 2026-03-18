import type { Exercise, ModuleId } from '../types/exercise.js';
import type { ExerciseGenerator } from './types.js';
import { monotonieIntervalGenerator } from './gen-monotonie-intervals.js';
import { monotonieStepGenerator } from './gen-step-monotonie.js';
import { extremstellenGenerator } from './gen-extremstellen.js';
import { wendestellenGenerator } from './gen-wendestellen.js';
import { kurvendiskussionStepGenerator } from './gen-step-kurvendiskussion.js';
import { extremaIdentifyGenerator } from './gen-identify-extrema.js';
import { wendepunkteIdentifyGenerator } from './gen-identify-wendepunkte.js';
import { reverseInferenceGenerator } from './gen-reverse-inference.js';
import { graphAssignmentGenerator } from './gen-graph-assignment.js';
import { trueFalseGenerator } from './gen-true-false.js';
import { graphSketchGenerator } from './gen-graph-sketch.js';
import { contextGenerator } from './gen-context.js';
import { getExercisesByModule } from '../data/exercise-loader.js';

const GENERATORS: Partial<Record<ModuleId, ExerciseGenerator[]>> = {
  monotonie: [monotonieIntervalGenerator, monotonieStepGenerator, trueFalseGenerator, reverseInferenceGenerator],
  extremstellen: [extremstellenGenerator, extremaIdentifyGenerator, trueFalseGenerator, reverseInferenceGenerator],
  wendestellen: [wendestellenGenerator, wendepunkteIdentifyGenerator, trueFalseGenerator],
  zusammenhang: [graphAssignmentGenerator],
  kurvendiskussion: [kurvendiskussionStepGenerator, graphSketchGenerator],
  sachkontext: [contextGenerator],
};

export function generateRandomExercise(moduleId: ModuleId): Exercise {
  const generators = GENERATORS[moduleId];

  if (generators && generators.length > 0) {
    // 60% generated, 40% from existing pool (for types without generators like criteria-quiz)
    if (Math.random() < 0.6) {
      const gen = generators[Math.floor(Math.random() * generators.length)];
      return gen.generate();
    }
  }

  // Fallback: pick random existing exercise from this module
  const pool = getExercisesByModule(moduleId);
  if (pool.length === 0 && generators && generators.length > 0) {
    return generators[0].generate();
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
