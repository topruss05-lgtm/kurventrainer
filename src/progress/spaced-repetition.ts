import type { SpacedRepetitionCard } from '../types/progress.js';

const STORAGE_KEY = 'kurventrainer-sr';

// Session intervals: Box 1 = every session, Box 2 = every 2nd, Box 3 = every 4th
const BOX_INTERVALS: Record<1 | 2 | 3, number> = {
  1: 1,
  2: 2,
  3: 4,
};

// Minimum time between sessions (1 hour in ms)
const SESSION_GAP_MS = 60 * 60 * 1000;

function getCards(): SpacedRepetitionCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SpacedRepetitionCard[];
  } catch {
    // Corrupted
  }
  return [];
}

function saveCards(cards: SpacedRepetitionCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getOrCreateCard(exerciseId: string): SpacedRepetitionCard {
  const cards = getCards();
  let card = cards.find(c => c.exerciseId === exerciseId);
  if (!card) {
    card = { exerciseId, box: 1 };
    cards.push(card);
    saveCards(cards);
  }
  return card;
}

export function recordQuizAnswer(exerciseId: string, correct: boolean): void {
  const cards = getCards();
  let card = cards.find(c => c.exerciseId === exerciseId);

  if (!card) {
    card = { exerciseId, box: 1 };
    cards.push(card);
  }

  if (correct && card.box < 3) {
    card.box = (card.box + 1) as 1 | 2 | 3;
  } else if (!correct) {
    card.box = 1;
  }

  card.lastReviewed = new Date().toISOString();
  saveCards(cards);
}

export function getDueCards(allExerciseIds: string[]): string[] {
  const cards = getCards();
  const sessionCount = getSessionCount();

  const due: string[] = [];

  for (const id of allExerciseIds) {
    const card = cards.find(c => c.exerciseId === id);
    if (!card) {
      // New card, always due
      due.push(id);
      continue;
    }

    const interval = BOX_INTERVALS[card.box];
    if (sessionCount % interval === 0) {
      due.push(id);
    }
  }

  return due;
}

// Session tracking
const SESSION_COUNT_KEY = 'kurventrainer-sr-sessions';
const LAST_SESSION_KEY = 'kurventrainer-sr-last';

export function checkAndStartSession(): void {
  const lastStr = localStorage.getItem(LAST_SESSION_KEY);
  const now = Date.now();

  if (!lastStr || now - parseInt(lastStr, 10) > SESSION_GAP_MS) {
    const count = getSessionCount();
    localStorage.setItem(SESSION_COUNT_KEY, String(count + 1));
    localStorage.setItem(LAST_SESSION_KEY, String(now));
  }
}

function getSessionCount(): number {
  const raw = localStorage.getItem(SESSION_COUNT_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export function resetSpacedRepetition(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_COUNT_KEY);
  localStorage.removeItem(LAST_SESSION_KEY);
}
