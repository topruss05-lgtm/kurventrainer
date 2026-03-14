export type ModuleId = 'monotonie' | 'extremstellen' | 'wendestellen' | 'zusammenhang' | 'quiz';
export type Difficulty = 'einfuehrung' | 'uebung' | 'herausforderung';
export type ExerciseType = 'graph-assignment' | 'identify-points' | 'true-false' | 'reverse-inference' | 'criteria-quiz';

export interface FunctionDef {
  latex: string;
  fn: (x: number) => number;
}

interface BaseExercise {
  id: string;
  module: ModuleId;
  difficulty: Difficulty;
  function: FunctionDef;
  derivatives?: {
    first?: FunctionDef;
    second?: FunctionDef;
    third?: FunctionDef;
  };
}

export interface GraphAssignmentExercise extends BaseExercise {
  type: 'graph-assignment';
  graphs: Array<{
    id: string;
    function: FunctionDef;
    correctLabel: 'f' | "f'" | "f''";
  }>;
}

export type TargetType = 'maxima' | 'minima' | 'extrema' | 'wendestellen' | 'monoton-steigend' | 'monoton-fallend';

export interface IdentifyPointsExercise extends BaseExercise {
  type: 'identify-points';
  targetType: TargetType;
  prompt: string;
  targets: Array<{ x: number; y: number }>;
  intervals?: Array<{ from: number; to: number }>;
  feedbackExplanation: string;
}

export interface TrueFalseExercise extends BaseExercise {
  type: 'true-false';
  statement: string;
  correct: boolean;
  reasonOptions: string[];
  correctReasonIndex: number;
  feedbackExplanation: string;
  highlightX?: number;
}

export interface ReverseInferenceExercise extends BaseExercise {
  type: 'reverse-inference';
  givenGraph: "f'" | "f''";
  prompt: string;
  targets: Array<{ x: number; type: string; reason: string }>;
  feedbackExplanation: string;
}

export interface CriteriaQuizExercise {
  id: string;
  type: 'criteria-quiz';
  module: ModuleId;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  visualExample?: {
    function: FunctionDef;
    highlightX: number;
    description: string;
  };
}

export type Exercise =
  | GraphAssignmentExercise
  | IdentifyPointsExercise
  | TrueFalseExercise
  | ReverseInferenceExercise
  | CriteriaQuizExercise;
