export type ModuleId = 'monotonie' | 'extremstellen' | 'wendestellen' | 'zusammenhang' | 'quiz' | 'sachkontext' | 'kurvendiskussion';
export type CompetencyLevel = 'K1' | 'K2' | 'K3' | 'K4' | 'K5';
/** @deprecated Use CompetencyLevel instead */
export type Difficulty = 'einfuehrung' | 'uebung' | 'herausforderung';
export type ExerciseType =
  | 'graph-assignment'
  | 'identify-points'
  | 'true-false'
  | 'reverse-inference'
  | 'criteria-quiz'
  | 'step-by-step'
  | 'context-interpretation'
  | 'graph-sketch'
  | 'contradiction-argument'
  | 'transformation-reasoning';

export interface FunctionDef {
  latex: string;
  fn: (x: number) => number;
}

interface BaseExercise {
  id: string;
  module: ModuleId;
  competency: CompetencyLevel;
  /** @deprecated Use competency instead */
  difficulty?: Difficulty;
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

export type MonotonicityType = 'smw' | 'smf';

export interface MonotonicityInterval {
  from: number | '-\u221e';
  to: number | '+\u221e';
  type: MonotonicityType;
}

export interface IdentifyPointsExercise extends BaseExercise {
  type: 'identify-points';
  targetType: TargetType;
  prompt: string;
  targets: Array<{ x: number; y: number }>;
  intervals?: Array<{ from: number; to: number }>;
  feedbackExplanation: string;
  strictFollowUp?: {
    isStrict: boolean;
    explanation: string;
  };
  // Intervall-Klassifikation (für Monotonie)
  intervalBounds?: number[];
  includeInfinity?: boolean;
  correctIntervals?: MonotonicityInterval[];
  intervalCount?: number;
  // K2: Extremstellen-Auswahl vor Intervall-Klassifikation
  extremaOptions?: {
    xValues: number[];          // Alle angebotenen x-Werte (inkl. Distraktoren)
    correctIndices: number[];   // Indizes der korrekten Extremstellen in xValues
    prompt?: string;
  };
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
  competency: CompetencyLevel;
  /** @deprecated Use competency instead */
  difficulty?: Difficulty;
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

// ─── New Exercise Types ───

export type StepInputType = 'multiple-choice' | 'number' | 'number-set' | 'sign-choice' | 'coordinate';

export interface StepByStepExercise extends BaseExercise {
  type: 'step-by-step';
  procedure: string;
  steps: Array<{
    instruction: string;
    inputType: StepInputType;
    options?: string[];
    correctAnswer: string | number | number[];
    tolerance?: number;
    hint: string;
    explanation: string;
  }>;
  verificationGraph?: {
    highlights: Array<{ x: number; y: number; label: string; color?: string }>;
  };
}

export type ContextSubType = 'interpret' | 'formalize' | 'context-to-sketch' | 'sketch-to-context' | 'card-match';

export interface ContextInterpretationExercise extends BaseExercise {
  type: 'context-interpretation';
  subType: ContextSubType;
  contextTitle: string;
  contextDescription: string;
  contextGraph?: FunctionDef;
  question: string;
  options: string[];
  correctIndex: number | number[];
  explanation: string;
  highlightPoints?: Array<{ x: number; y: number; label: string }>;
}

export interface GraphSketchExercise extends BaseExercise {
  type: 'graph-sketch';
  conditions: string[];
  graphOptions: Array<{
    id: string;
    function: FunctionDef;
    isCorrect: boolean;
  }>;
  explanation: string;
}

export interface ContradictionArgumentExercise extends BaseExercise {
  type: 'contradiction-argument';
  shownGraph: FunctionDef;
  claimedFunctionLatex: string;
  prompt: string;
  arguments: Array<{
    text: string;
    isValid: boolean;
    explanation: string;
  }>;
  requiredCorrectCount: number;
  feedbackExplanation: string;
}

export interface TransformationReasoningExercise extends BaseExercise {
  type: 'transformation-reasoning';
  originalInfo: string;
  transformation: string;
  question: string;
  inputType: 'coordinates' | 'multiple-choice';
  correctAnswer: { x: number; y: number } | number;
  options?: string[];
  correctIndex?: number;
  explanation: string;
}

export type Exercise =
  | GraphAssignmentExercise
  | IdentifyPointsExercise
  | TrueFalseExercise
  | ReverseInferenceExercise
  | CriteriaQuizExercise
  | StepByStepExercise
  | ContextInterpretationExercise
  | GraphSketchExercise
  | ContradictionArgumentExercise
  | TransformationReasoningExercise;
