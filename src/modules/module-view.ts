import { MODULE_CONFIGS } from '../config.js';
import { navigate } from '../router.js';
import { getAvailableExerciseTypes, getAvailableDifficulties } from '../data/exercise-loader.js';
import type { ExerciseType, Difficulty } from '../types/exercise.js';

const TYPE_LABELS: Record<ExerciseType, string> = {
  'graph-assignment': 'Graph-Zuordnung',
  'identify-points': 'Stellen identifizieren',
  'true-false': 'Aussagen bewerten',
  'reverse-inference': 'Rückschluss-Trainer',
  'criteria-quiz': 'Kriterien-Quiz',
};

const TYPE_DESCRIPTIONS: Record<ExerciseType, string> = {
  'graph-assignment': 'Ordne Graphen den passenden Funktionen zu',
  'identify-points': 'Finde bestimmte Stellen oder Intervalle im Graph',
  'true-false': 'Beurteile Aussagen und wähle die richtige Begründung',
  'reverse-inference': 'Schließe vom Ableitungsgraph auf Eigenschaften',
  'criteria-quiz': 'Teste dein Wissen über Bedingungen und Definitionen',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  einfuehrung: 'Einführung',
  uebung: 'Übung',
  herausforderung: 'Herausforderung',
};

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  einfuehrung: { bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: 'var(--color-success-border)' },
  uebung: { bg: '#fef9ec', text: '#92710a', border: '#e5c44c' },
  herausforderung: { bg: 'var(--color-error-bg)', text: 'var(--color-error)', border: 'var(--color-error-border)' },
};

export function renderModuleView(container: HTMLElement, moduleId: string): (() => void) | null {
  const config = MODULE_CONFIGS.find(m => m.id === moduleId);
  if (!config) {
    navigate({ page: 'dashboard' });
    return null;
  }

  const backBtn = document.createElement('button');
  backBtn.className = 'back-link mb-4';
  backBtn.textContent = '\u2190 Zurück zur Übersicht';
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  const h1 = document.createElement('h1');
  h1.className = 'text-2xl font-bold mb-1';
  h1.textContent = config.title;

  const desc = document.createElement('p');
  desc.className = 'mb-6';
  desc.style.color = 'var(--color-ink-secondary)';
  desc.textContent = config.description;

  const typeGrid = document.createElement('div');
  typeGrid.className = 'space-y-4 animate-fade-in';

  const availableTypes = getAvailableExerciseTypes(config.id);

  if (availableTypes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-center py-8';
    empty.style.color = 'var(--color-ink-muted)';
    empty.textContent = 'Für dieses Modul sind noch keine Aufgaben vorhanden.';
    typeGrid.appendChild(empty);
  }

  availableTypes.forEach((exerciseType, index) => {
    const section = document.createElement('div');
    section.className = 'card animate-slide-up';
    section.style.animationDelay = `${index * 60}ms`;

    const typeHeader = document.createElement('h2');
    typeHeader.className = 'font-semibold text-base';
    typeHeader.textContent = TYPE_LABELS[exerciseType];

    const typeDesc = document.createElement('p');
    typeDesc.className = 'text-sm mt-0.5 mb-3';
    typeDesc.style.color = 'var(--color-ink-muted)';
    typeDesc.textContent = TYPE_DESCRIPTIONS[exerciseType];

    const diffGrid = document.createElement('div');
    diffGrid.className = 'flex gap-2 flex-wrap';

    const availableDiffs = getAvailableDifficulties(config.id, exerciseType);

    for (const diff of availableDiffs) {
      const colors = DIFFICULTY_COLORS[diff];
      const btn = document.createElement('button');
      btn.className = 'px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all min-h-[44px]';
      btn.style.backgroundColor = colors.bg;
      btn.style.color = colors.text;
      btn.style.borderColor = colors.border;
      btn.textContent = DIFFICULTY_LABELS[diff];
      btn.addEventListener('mouseenter', () => {
        btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        btn.style.transform = 'translateY(-1px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = 'none';
        btn.style.transform = 'none';
      });
      btn.addEventListener('click', () =>
        navigate({ page: 'exercise', moduleId: config.id, type: exerciseType, difficulty: diff })
      );
      diffGrid.appendChild(btn);
    }

    section.append(typeHeader, typeDesc, diffGrid);
    typeGrid.appendChild(section);
  });

  container.append(backBtn, h1, desc, typeGrid);
  return null;
}
