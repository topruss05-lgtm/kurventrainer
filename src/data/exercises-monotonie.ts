import type { Exercise } from '../types/exercise.js';

// Alle Monotonie-Aufgaben werden jetzt von Generatoren erzeugt:
// - Intervalle markieren: gen-monotonie-intervals.ts
// - Rechenweg: gen-step-monotonie.ts
// - Aussagen bewerten: gen-tf-monotonie.ts
// - Rückschluss-Trainer: gen-reverse-inference.ts

export const monotoneExercises: Exercise[] = [];
