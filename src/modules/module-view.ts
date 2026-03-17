import { MODULE_CONFIGS } from '../config.js';
import { navigate } from '../router.js';
import { getAvailableExerciseTypes, getAvailableDifficulties } from '../data/exercise-loader.js';
import type { ExerciseType, Difficulty } from '../types/exercise.js';

const TYPE_LABELS: Record<ExerciseType, string> = {
  'graph-assignment': 'Graph-Zuordnung',
  'identify-points': 'Stellen identifizieren',
  'true-false': 'Aussagen bewerten',
  'reverse-inference': 'R\u00fcckschluss-Trainer',
  'criteria-quiz': 'Kriterien-Quiz',
};

const TYPE_DESCRIPTIONS: Record<ExerciseType, string> = {
  'graph-assignment': 'Ordne Graphen den passenden Funktionen zu',
  'identify-points': 'Finde bestimmte Stellen oder Intervalle im Graph',
  'true-false': 'Beurteile Aussagen und w\u00e4hle die richtige Begr\u00fcndung',
  'reverse-inference': 'Schlie\u00dfe vom Ableitungsgraph auf Eigenschaften',
  'criteria-quiz': 'Teste dein Wissen \u00fcber Bedingungen und Definitionen',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  einfuehrung: 'Einf\u00fchrung',
  uebung: '\u00dcbung',
  herausforderung: 'Herausforderung',
};

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  einfuehrung: { bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: 'var(--color-success-border)' },
  uebung: { bg: '#fef9ec', text: '#92710a', border: '#e5c44c' },
  herausforderung: { bg: 'var(--color-error-bg)', text: 'var(--color-error)', border: 'var(--color-error-border)' },
};

const TYPE_ORDER: Record<ExerciseType, number> = {
  'graph-assignment': 1,
  'identify-points': 2,
  'true-false': 3,
  'reverse-inference': 4,
  'criteria-quiz': 5,
};

export function renderModuleView(container: HTMLElement, moduleId: string): (() => void) | null {
  const config = MODULE_CONFIGS.find(m => m.id === moduleId);
  if (!config) {
    navigate({ page: 'dashboard' });
    return null;
  }

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'animate-fade-in';
  backBtn.style.cssText = `
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 0.8rem; color: var(--color-ink-muted); transition: color 0.15s;
    margin-bottom: 1.5rem; display: inline-flex; align-items: center; gap: 0.375rem;
  `;
  backBtn.textContent = '\u2190 \u00dcbersicht';
  backBtn.addEventListener('mouseenter', () => { backBtn.style.color = 'var(--color-primary)'; });
  backBtn.addEventListener('mouseleave', () => { backBtn.style.color = 'var(--color-ink-muted)'; });
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  // ─── Header ───
  const header = document.createElement('header');
  header.className = 'animate-fade-in';
  header.style.cssText = 'margin-bottom: 2rem;';

  const orderBadge = document.createElement('span');
  orderBadge.style.cssText = `
    display: inline-flex; align-items: center; justify-content: center;
    width: 1.75rem; height: 1.75rem; border-radius: 0.5rem;
    background: var(--color-primary-light); color: var(--color-primary);
    font-family: var(--font-display); font-weight: 700; font-size: 0.75rem;
    margin-bottom: 0.75rem;
  `;
  orderBadge.textContent = `${config.order}`;

  const h1 = document.createElement('h1');
  h1.style.cssText = `
    font-family: var(--font-display); font-weight: 800; font-size: 1.75rem;
    letter-spacing: -0.025em; color: var(--color-ink); line-height: 1.2;
  `;
  h1.textContent = config.title;

  const desc = document.createElement('p');
  desc.style.cssText = `
    font-size: 0.875rem; color: var(--color-ink-secondary); margin-top: 0.375rem;
  `;
  desc.textContent = config.description;

  header.append(orderBadge, h1, desc);

  // ─── Exercise type list ───
  const typeList = document.createElement('div');
  typeList.style.cssText = 'display: grid; gap: 0.75rem;';

  const availableTypes = getAvailableExerciseTypes(config.id);

  if (availableTypes.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'text-align: center; padding: 3rem 0; color: var(--color-ink-muted);';
    empty.textContent = 'F\u00fcr dieses Modul sind noch keine Aufgaben vorhanden.';
    typeList.appendChild(empty);
  }

  availableTypes.forEach((exerciseType, index) => {
    const section = document.createElement('div');
    section.className = 'card animate-slide-up';
    section.style.cssText = `
      padding: 1.25rem; animation-delay: ${index * 60}ms;
    `;

    // Type header row
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;';

    const icon = document.createElement('span');
    icon.style.cssText = `
      display: flex; align-items: center; justify-content: center;
      width: 2rem; height: 2rem; border-radius: 0.5rem; flex-shrink: 0;
      background: var(--color-surface-inset); color: var(--color-ink-muted);
      font-family: var(--font-display); font-weight: 700; font-size: 0.9rem;
    `;
    icon.textContent = `${TYPE_ORDER[exerciseType]}`;

    const typeTitle = document.createElement('h2');
    typeTitle.style.cssText = `
      font-family: var(--font-display); font-weight: 600; font-size: 0.9rem;
      color: var(--color-ink);
    `;
    typeTitle.textContent = TYPE_LABELS[exerciseType];

    headerRow.append(icon, typeTitle);

    const typeDesc = document.createElement('p');
    typeDesc.style.cssText = `
      font-size: 0.775rem; color: var(--color-ink-muted); margin-bottom: 0.875rem;
      padding-left: 2.75rem;
    `;
    typeDesc.textContent = TYPE_DESCRIPTIONS[exerciseType];

    // Difficulty buttons
    const diffGrid = document.createElement('div');
    diffGrid.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; padding-left: 2.75rem;';

    const availableDiffs = getAvailableDifficulties(config.id, exerciseType);

    for (const diff of availableDiffs) {
      const colors = DIFFICULTY_COLORS[diff];
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.8rem;
        font-weight: 500; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;
        min-height: 2.5rem; border: 1px solid ${colors.border};
        background: ${colors.bg}; color: ${colors.text};
      `;
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

    section.append(headerRow, typeDesc, diffGrid);
    typeList.appendChild(section);
  });

  container.append(backBtn, header, typeList);
  return null;
}
