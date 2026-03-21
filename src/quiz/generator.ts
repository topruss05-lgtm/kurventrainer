// ═══════════════════════════════════════════════════════════════════
// Klausur-Quiz Generator
//
// Wählt Fragen per Kategorie-Filter + SR-Gewichtung.
// Schüler wählt Kategorie selbst über Tabs.
// ═══════════════════════════════════════════════════════════════════

import { ALL_TEMPLATES, type QuizQuestion } from './questions.js';
import { getOrCreateCard, recordQuizAnswer, getDueCards, checkAndStartSession } from '../progress/spaced-repetition.js';

export type Category = 'kriterien' | 'verfahren' | 'graph' | 'fallen';

/** Initialize a quiz session */
export function initQuizSession(): void {
  checkAndStartSession();
}

/** Get a random question, optionally filtered by category, SR-weighted */
export function nextQuestion(lastTemplateId?: string, categoryFilter?: Category | null): QuizQuestion {
  // Filter by category if set
  const available = categoryFilter
    ? ALL_TEMPLATES.filter(t => t.category === categoryFilter)
    : ALL_TEMPLATES;
  const availableIds = available.map(t => t.id);

  // Get due IDs from SR
  const dueIds = getDueCards(availableIds);
  const candidates = dueIds.length > 0 ? dueIds : availableIds;

  // Filter out last-asked to avoid repeats
  const filtered = candidates.length > 1
    ? candidates.filter(id => id !== lastTemplateId)
    : candidates;

  // SR weighting: Box 1 = 4x, Box 2 = 2x, Box 3 = 1x
  const weighted: string[] = [];
  for (const id of filtered) {
    const card = getOrCreateCard(id);
    const weight = card.box === 1 ? 4 : card.box === 2 ? 2 : 1;
    for (let i = 0; i < weight; i++) {
      weighted.push(id);
    }
  }

  const chosenId = weighted[Math.floor(Math.random() * weighted.length)] ?? available[0].id;
  const template = ALL_TEMPLATES.find(t => t.id === chosenId) ?? ALL_TEMPLATES[0];

  return template.generate();
}

/** Record an answer for SR tracking */
export function recordAnswer(templateId: string, correct: boolean): void {
  recordQuizAnswer(templateId, correct);
}
