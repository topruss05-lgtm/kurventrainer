import { MODULE_CONFIGS } from '../config.js';
import { navigate } from '../router.js';
import { getAvailableExerciseTypes, getAvailableCompetencyLevels, getExerciseCountByType } from '../data/exercise-loader.js';
import type { ExerciseType, CompetencyLevel } from '../types/exercise.js';

const TYPE_LABELS: Record<ExerciseType, string> = {
  'identify-points': 'Stellen identifizieren',
  'graph-assignment': 'Graph-Zuordnung',
  'step-by-step': 'Schritt f\u00fcr Schritt',
  'reverse-inference': 'R\u00fcckschluss-Trainer',
  'true-false': 'Aussagen bewerten',
  'graph-sketch': 'Graph-Skizze',
  'context-interpretation': 'Sachkontext',
  'transformation-reasoning': 'Transformation',
  'contradiction-argument': 'Widerspruch finden',
  'criteria-quiz': 'Kriterien-Quiz',
};

const TYPE_DESCRIPTIONS: Record<ExerciseType, string> = {
  'identify-points': 'Finde bestimmte Stellen oder Intervalle im Graph',
  'graph-assignment': 'Ordne Graphen den passenden Funktionen zu',
  'step-by-step': 'Berechne Schritt f\u00fcr Schritt: Ableitung, Nullstellen, Nachweis',
  'reverse-inference': 'Schlie\u00dfe vom Ableitungsgraph auf Eigenschaften',
  'true-false': 'Beurteile Aussagen und w\u00e4hle die richtige Begr\u00fcndung',
  'graph-sketch': 'Finde den passenden Graph zu gegebenen Bedingungen',
  'context-interpretation': 'Interpretiere mathematische Zusammenh\u00e4nge im Alltag',
  'transformation-reasoning': 'Schlie\u00dfe von f auf verschobene/gestreckte Funktionen',
  'contradiction-argument': 'Begr\u00fcnde, warum ein Graph nicht zur Funktion passt',
  'criteria-quiz': 'Teste dein Wissen \u00fcber Bedingungen und Definitionen',
};

const MODULE_TYPE_OVERRIDES: Partial<Record<string, { label?: string; description?: string }>> = {
  'monotonie:identify-points': {
    label: 'Intervalle markieren',
    description: 'Bestimme Monotonie-Intervalle am Graph',
  },
};

const TYPE_ORDER: Record<ExerciseType, number> = {
  'identify-points': 1,
  'graph-assignment': 2,
  'step-by-step': 3,
  'reverse-inference': 4,
  'true-false': 5,
  'graph-sketch': 6,
  'context-interpretation': 7,
  'transformation-reasoning': 8,
  'contradiction-argument': 9,
  'criteria-quiz': 10,
};

function svgIcon(paths: string[], size = 20): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const d of paths) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  }
  return svg;
}

export function renderModuleView(container: HTMLElement, moduleId: string): (() => void) | null {
  const config = MODULE_CONFIGS.find(m => m.id === moduleId);
  if (!config) {
    navigate({ page: 'dashboard' });
    return null;
  }

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'back-link animate-fade-in';
  backBtn.style.cssText = 'margin-bottom: 1.5rem; display: inline-flex; align-items: center; gap: 0.375rem;';
  backBtn.textContent = '\u2190 \u00dcbersicht';
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  // ─── Header ───
  const header = document.createElement('header');
  header.className = 'animate-fade-in';
  header.style.cssText = 'margin-bottom: 1.75rem;';

  const h1 = document.createElement('h1');
  h1.style.cssText = `
    font-family: var(--font-display); font-weight: 800; font-size: 1.75rem;
    letter-spacing: -0.025em; color: var(--color-ink); line-height: 1.2;
  `;
  h1.textContent = config.title;

  const desc = document.createElement('p');
  desc.style.cssText = 'font-size: 0.85rem; color: var(--color-ink-muted); margin-top: 0.25rem;';
  desc.textContent = config.description;

  header.append(h1, desc);

  // ─── Random exercises button ───
  const randomBtn = document.createElement('button');
  randomBtn.className = 'animate-slide-up';
  randomBtn.style.cssText = `
    width: 100%; text-align: left; position: relative; overflow: hidden;
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
    border: none; border-radius: 1rem; padding: 1.125rem 1.25rem;
    display: flex; align-items: center; gap: 1rem;
    cursor: pointer; margin-bottom: 1.75rem;
    box-shadow: 0 4px 16px rgba(224, 122, 58, 0.18), 0 1px 3px rgba(224, 122, 58, 0.1);
    transition: box-shadow 0.25s, transform 0.25s;
  `;
  randomBtn.addEventListener('mouseenter', () => {
    randomBtn.style.boxShadow = '0 8px 24px rgba(224, 122, 58, 0.26), 0 2px 6px rgba(224, 122, 58, 0.12)';
    randomBtn.style.transform = 'translateY(-2px)';
  });
  randomBtn.addEventListener('mouseleave', () => {
    randomBtn.style.boxShadow = '0 4px 16px rgba(224, 122, 58, 0.18), 0 1px 3px rgba(224, 122, 58, 0.1)';
    randomBtn.style.transform = '';
  });
  randomBtn.addEventListener('click', () =>
    navigate({ page: 'exercise', moduleId: config.id, type: 'random', difficulty: 'K1' }),
  );

  const randomIcon = document.createElement('span');
  randomIcon.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; flex-shrink: 0;
    background: rgba(255, 255, 255, 0.18); color: #fff;
  `;
  randomIcon.appendChild(svgIcon([
    'M16 3h5v5', 'M4 20L21 3',
    'M21 16v5h-5', 'M15 15l6 6',
    'M4 4l5 5',
  ]));

  const randomText = document.createElement('div');
  const randomTitle = document.createElement('span');
  randomTitle.style.cssText = `
    display: block; font-family: var(--font-display); font-weight: 700;
    font-size: 0.95rem; color: #fff;
  `;
  randomTitle.textContent = 'Zuf\u00e4llige Aufgaben';
  const randomSub = document.createElement('span');
  randomSub.style.cssText = 'display: block; font-size: 0.775rem; color: rgba(255,255,255,0.7); margin-top: 0.125rem;';
  randomSub.textContent = 'Gemischte \u00dcbungen aus allen Aufgabentypen';
  randomText.append(randomTitle, randomSub);

  const randomArrow = document.createElement('span');
  randomArrow.style.cssText = `
    margin-left: auto; color: rgba(255,255,255,0.5);
    transition: transform 0.2s; display: flex;
  `;
  randomArrow.appendChild(svgIcon(['M9 18l6-6-6-6']));
  randomBtn.addEventListener('mouseenter', () => { randomArrow.style.transform = 'translateX(4px)'; });
  randomBtn.addEventListener('mouseleave', () => { randomArrow.style.transform = ''; });

  randomBtn.append(randomIcon, randomText, randomArrow);

  // ─── Section label ───
  const sectionLabel = document.createElement('p');
  sectionLabel.className = 'animate-slide-up';
  sectionLabel.style.cssText = `
    font-family: var(--font-display); font-weight: 700; font-size: 0.7rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--color-ink-muted); margin-bottom: 0.75rem;
    animation-delay: 60ms;
  `;
  sectionLabel.textContent = 'Aufgabentypen';

  // ─── Exercise type list ───
  const typeList = document.createElement('div');
  typeList.style.cssText = 'display: grid; gap: 0.5rem;';

  const availableTypes = getAvailableExerciseTypes(config.id)
    .sort((a, b) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99));

  if (availableTypes.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'text-align: center; padding: 3rem 0; color: var(--color-ink-muted); font-size: 0.85rem;';
    empty.textContent = 'F\u00fcr dieses Modul sind noch keine Aufgaben vorhanden.';
    typeList.appendChild(empty);
  }

  availableTypes.forEach((exerciseType, index) => {
    const overrideKey = `${config.id}:${exerciseType}`;
    const override = MODULE_TYPE_OVERRIDES[overrideKey];
    const label = override?.label ?? TYPE_LABELS[exerciseType] ?? exerciseType;
    const description = override?.description ?? TYPE_DESCRIPTIONS[exerciseType] ?? '';
    const count = getExerciseCountByType(config.id, exerciseType);
    const levels: CompetencyLevel[] = getAvailableCompetencyLevels(config.id, exerciseType);
    const firstLevel = levels[0] ?? 'K1';

    const row = document.createElement('button');
    row.className = 'card card-interactive animate-slide-up';
    row.style.cssText = `
      text-align: left; display: flex; align-items: center; gap: 0.875rem;
      padding: 0.875rem 1.125rem; animation-delay: ${90 + index * 50}ms;
    `;
    row.addEventListener('click', () =>
      navigate({ page: 'exercise', moduleId: config.id, type: exerciseType, difficulty: firstLevel }),
    );

    // Number badge
    const num = document.createElement('span');
    num.style.cssText = `
      display: flex; align-items: center; justify-content: center;
      width: 1.75rem; height: 1.75rem; border-radius: 0.5rem; flex-shrink: 0;
      background: var(--color-surface-inset); color: var(--color-ink-muted);
      font-family: var(--font-display); font-weight: 700; font-size: 0.75rem;
      border: 1px solid var(--color-border);
    `;
    num.textContent = `${index + 1}`;

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; min-width: 0;';

    const title = document.createElement('span');
    title.style.cssText = `
      display: block; font-family: var(--font-display); font-weight: 600;
      font-size: 0.875rem; color: var(--color-ink); line-height: 1.3;
    `;
    title.textContent = label;

    const sub = document.createElement('span');
    sub.style.cssText = 'display: block; font-size: 0.75rem; color: var(--color-ink-muted); margin-top: 0.125rem; line-height: 1.3;';
    sub.textContent = description;

    content.append(title, sub);

    // Count badge
    const countBadge = document.createElement('span');
    countBadge.style.cssText = `
      font-family: var(--font-display); font-weight: 600; font-size: 0.7rem;
      color: var(--color-ink-muted); white-space: nowrap; flex-shrink: 0;
      background: var(--color-surface-inset); padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    `;
    countBadge.textContent = `${count}`;

    // Arrow
    const arrow = document.createElement('span');
    arrow.style.cssText = 'color: var(--color-ink-muted); opacity: 0.35; display: flex; flex-shrink: 0;';
    arrow.appendChild(svgIcon(['M9 18l6-6-6-6'], 16));

    row.append(num, content, countBadge, arrow);
    typeList.appendChild(row);
  });

  container.append(backBtn, header, randomBtn, sectionLabel, typeList);
  return null;
}
