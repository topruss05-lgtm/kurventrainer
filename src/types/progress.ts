import type { ModuleId, ExerciseType, CompetencyLevel } from './exercise.js';

export interface ModuleProgress {
  completed: number;
  total: number;
  correct: number;
  lastAttempt?: string; // ISO date
}

export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  timestamp: string;
}

export interface SpacedRepetitionCard {
  exerciseId: string;
  box: 1 | 2 | 3;
  lastReviewed?: string; // ISO date
  nextDue?: string;
}

export interface AppProgress {
  modules: Record<ModuleId, ModuleProgress>;
  results: ExerciseResult[];
  spacedRepetition: SpacedRepetitionCard[];
  lastSessionStart?: string;
  completedExercises?: Record<string, boolean>;
  completedCases?: Record<string, boolean>; // key: "moduleId:exerciseType:caseId"
}

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  description: string;
  order: number;
  exerciseTypes: ExerciseType[];
  competencyLevels: CompetencyLevel[];
}
