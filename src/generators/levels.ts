import type { ModuleId, ExerciseType } from '../types/exercise.js';
import type { CaseDefinition } from './types.js';
import { MONOTONIE_INTERVAL_CASES } from './gen-monotonie-intervals.js';
import { MONOTONIE_STEP_CASES } from './gen-step-monotonie.js';
import { EXTREMSTELLEN_STEP_CASES } from './gen-extremstellen.js';
import { WENDESTELLEN_STEP_CASES } from './gen-wendestellen.js';
import { KURVENDISKUSSION_STEP_CASES } from './gen-step-kurvendiskussion.js';
import { EXTREMA_IDENTIFY_CASES } from './gen-identify-extrema.js';
import { WENDEPUNKTE_IDENTIFY_CASES } from './gen-identify-wendepunkte.js';
import { REVERSE_INFERENCE_CASES } from './gen-reverse-inference.js';
import { GRAPH_ASSIGNMENT_CASES } from './gen-graph-assignment.js';
import { TRUE_FALSE_CASES } from './gen-true-false.js';
import { GRAPH_SKETCH_CASES } from './gen-graph-sketch.js';
import { CONTEXT_CASES } from './gen-context.js';

export interface LevelConfig {
  moduleId: ModuleId;
  exerciseType: ExerciseType;
  cases: CaseDefinition[];
}

// Split cases by module for reverse-inference (some are monotonie, some extremstellen)
const revMonotonie = REVERSE_INFERENCE_CASES.filter(c => c.id === 'rev-linear');
const revExtremstellen = REVERSE_INFERENCE_CASES.filter(c => c.id !== 'rev-linear');

// Split true-false by module
const tfMonotonie = TRUE_FALSE_CASES.filter(c => c.id.includes('monotonie') || c.id.includes('nichtumkehrbar'));
const tfExtremstellen = TRUE_FALSE_CASES.filter(c => c.id.includes('extremum') || c.id.includes('sattelpunkt'));
const tfWendestellen = TRUE_FALSE_CASES.filter(c => c.id.includes('wendestelle') || c.id.includes('kruemmung'));

const LEVELS: LevelConfig[] = [
  // ─── Monotonie ───
  { moduleId: 'monotonie', exerciseType: 'identify-points', cases: MONOTONIE_INTERVAL_CASES },
  { moduleId: 'monotonie', exerciseType: 'step-by-step', cases: MONOTONIE_STEP_CASES },
  { moduleId: 'monotonie', exerciseType: 'true-false', cases: tfMonotonie },
  { moduleId: 'monotonie', exerciseType: 'reverse-inference', cases: revMonotonie },
  { moduleId: 'monotonie', exerciseType: 'graph-sketch', cases: GRAPH_SKETCH_CASES.filter(c => c.id === 'sketch-monotonie') },

  // ─── Extremstellen ───
  { moduleId: 'extremstellen', exerciseType: 'identify-points', cases: EXTREMA_IDENTIFY_CASES },
  { moduleId: 'extremstellen', exerciseType: 'step-by-step', cases: EXTREMSTELLEN_STEP_CASES },
  { moduleId: 'extremstellen', exerciseType: 'true-false', cases: tfExtremstellen },
  { moduleId: 'extremstellen', exerciseType: 'reverse-inference', cases: revExtremstellen },

  // ─── Wendestellen ───
  { moduleId: 'wendestellen', exerciseType: 'identify-points', cases: WENDEPUNKTE_IDENTIFY_CASES },
  { moduleId: 'wendestellen', exerciseType: 'step-by-step', cases: WENDESTELLEN_STEP_CASES },
  { moduleId: 'wendestellen', exerciseType: 'true-false', cases: tfWendestellen },

  // ─── Zusammenhang ───
  { moduleId: 'zusammenhang', exerciseType: 'graph-assignment', cases: GRAPH_ASSIGNMENT_CASES },

  // ─── Kurvendiskussion ───
  { moduleId: 'kurvendiskussion', exerciseType: 'step-by-step', cases: KURVENDISKUSSION_STEP_CASES },
  { moduleId: 'kurvendiskussion', exerciseType: 'graph-sketch', cases: GRAPH_SKETCH_CASES.filter(c => c.id !== 'sketch-monotonie') },

  // ─── Sachkontext ───
  { moduleId: 'sachkontext', exerciseType: 'context-interpretation', cases: CONTEXT_CASES },
];

export function getLevelConfig(moduleId: ModuleId, exerciseType: ExerciseType): LevelConfig | undefined {
  return LEVELS.find(l => l.moduleId === moduleId && l.exerciseType === exerciseType);
}

export function getAllLevelConfigs(): LevelConfig[] {
  return LEVELS;
}
