// ═══════════════════════════════════════════════════════════════════
// Klausur-Quiz View
//
// Kategorie-Pillen oben: Alle | Kriterien | Verfahren | Graph | Fallen
// Direkt-Start. Endlos-Session. Alle 10 Fragen: Zusammenfassung.
// ═══════════════════════════════════════════════════════════════════

import { navigate } from '../router.js';
import { initQuizSession, nextQuestion, recordAnswer, type Category } from './generator.js';
import { renderQuestion } from './renderers.js';
import type { QuizQuestion } from './questions.js';

const TABS: { key: Category | null; label: string; color: string }[] = [
  { key: null, label: 'Alle', color: 'var(--color-ink-secondary)' },
  { key: 'kriterien', label: 'Kriterien', color: 'var(--color-primary)' },
  { key: 'verfahren', label: 'Verfahren', color: 'var(--color-accent)' },
  { key: 'graph', label: 'Graph', color: '#6366f1' },
  { key: 'fallen', label: 'Fallen', color: 'var(--color-error)' },
];

export function renderQuizView(container: HTMLElement): (() => void) | null {
  initQuizSession();

  let currentQuestion: QuizQuestion | null = null;
  let sessionCorrect = 0;
  let sessionTotal = 0;
  let lastTemplateId: string | undefined;
  let activeCategory: Category | null = null;

  // ─── Back button ───
  const backBtn = document.createElement('button');
  backBtn.className = 'animate-fade-in';
  backBtn.style.cssText = `
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 0.8rem; color: var(--color-ink-muted); transition: color 0.15s;
    margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.375rem;
  `;
  backBtn.textContent = '\u2190 Zurück';
  backBtn.addEventListener('mouseenter', () => { backBtn.style.color = 'var(--color-primary)'; });
  backBtn.addEventListener('mouseleave', () => { backBtn.style.color = 'var(--color-ink-muted)'; });
  backBtn.addEventListener('click', () => navigate({ page: 'dashboard' }));

  // ─── Header row ───
  const headerWrap = document.createElement('div');
  headerWrap.className = 'animate-fade-in';
  headerWrap.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;';

  const title = document.createElement('h1');
  title.style.cssText = `
    font-family: var(--font-display); font-weight: 800; font-size: 1.25rem;
    letter-spacing: -0.02em; color: var(--color-ink);
  `;
  title.textContent = 'Klausur-Quiz';

  const badge = document.createElement('span');
  badge.style.cssText = `
    font-family: var(--font-display); font-weight: 700; font-size: 0.8rem;
    color: var(--color-accent); background: var(--color-accent-light);
    padding: 0.3rem 0.75rem; border-radius: 999px;
    border: 1px solid rgba(224,122,58,0.15); display: none;
  `;

  headerWrap.append(title, badge);

  // ─── Category tabs ───
  const tabBar = document.createElement('div');
  tabBar.className = 'animate-fade-in';
  tabBar.style.cssText = `
    display: flex; gap: 0.375rem; margin-bottom: 1.25rem;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 2px;
  `;

  const tabButtons: HTMLButtonElement[] = [];

  TABS.forEach((tab) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      padding: 0.375rem 0.75rem; border-radius: 999px; cursor: pointer;
      font-family: var(--font-display); font-weight: 600; font-size: 0.75rem;
      white-space: nowrap; transition: all 0.15s; flex-shrink: 0;
      border: 1.5px solid transparent; background: var(--color-surface-inset);
      color: var(--color-ink-muted);
    `;
    btn.textContent = tab.label;
    tabButtons.push(btn);

    btn.addEventListener('click', () => {
      activeCategory = tab.key;
      updateTabStyles();
      // Reset and show next question in new category
      lastTemplateId = undefined;
      showNext();
    });

    tabBar.appendChild(btn);
  });

  function updateTabStyles(): void {
    TABS.forEach((tab, i) => {
      const btn = tabButtons[i];
      const isActive = tab.key === activeCategory;
      if (isActive) {
        btn.style.background = `${tab.color}12`;
        btn.style.color = tab.color;
        btn.style.borderColor = `${tab.color}33`;
      } else {
        btn.style.background = 'var(--color-surface-inset)';
        btn.style.color = 'var(--color-ink-muted)';
        btn.style.borderColor = 'transparent';
      }
    });
  }
  updateTabStyles();

  // ─── Question card ───
  const questionCard = document.createElement('div');
  questionCard.className = 'card';

  // ─── Next button ───
  const nextBtn = document.createElement('button');
  nextBtn.style.cssText = `
    display: none; width: 100%; margin-top: 1rem; padding: 0.75rem;
    background: var(--color-accent); color: #fff; border: none; border-radius: 0.625rem;
    font-size: 0.9rem; font-weight: 600; cursor: pointer;
    transition: background-color 0.15s, box-shadow 0.15s;
    font-family: var(--font-display);
  `;
  nextBtn.textContent = 'Weiter \u2192';
  nextBtn.addEventListener('mouseenter', () => {
    nextBtn.style.backgroundColor = 'var(--color-accent-dark)';
    nextBtn.style.boxShadow = '0 2px 8px rgba(224,122,58,0.25)';
  });
  nextBtn.addEventListener('mouseleave', () => {
    nextBtn.style.backgroundColor = 'var(--color-accent)';
    nextBtn.style.boxShadow = 'none';
  });
  nextBtn.addEventListener('click', () => {
    if (sessionTotal > 0 && sessionTotal % 10 === 0) {
      showSummary();
    } else {
      showNext();
    }
  });

  container.append(backBtn, headerWrap, tabBar, questionCard, nextBtn);

  function showNext(): void {
    while (questionCard.firstChild) questionCard.removeChild(questionCard.firstChild);
    nextBtn.style.display = 'none';

    questionCard.classList.remove('animate-scale-in');
    void questionCard.offsetWidth;
    questionCard.classList.add('animate-scale-in');

    currentQuestion = nextQuestion(lastTemplateId, activeCategory);
    lastTemplateId = currentQuestion.templateId;

    renderQuestion(questionCard, currentQuestion, (correct) => {
      recordAnswer(currentQuestion!.templateId, correct);
      sessionTotal++;
      if (correct) sessionCorrect++;
      badge.textContent = `${sessionCorrect}/${sessionTotal}`;
      badge.style.display = '';
      nextBtn.style.display = 'block';
      nextBtn.focus();
    });
  }

  function showSummary(): void {
    while (questionCard.firstChild) questionCard.removeChild(questionCard.firstChild);
    nextBtn.style.display = 'none';

    const pct = Math.round((sessionCorrect / sessionTotal) * 100);
    const isGood = pct >= 70;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'text-align: center; padding: 1.5rem 0.5rem;';

    const circle = document.createElement('div');
    circle.style.cssText = `
      width: 4.5rem; height: 4.5rem; border-radius: 50%; margin: 0 auto 1rem;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-weight: 800; font-size: 1.5rem;
      ${isGood
        ? 'background: var(--color-success-bg); color: var(--color-success); border: 3px solid var(--color-success-border);'
        : 'background: var(--color-accent-light); color: var(--color-accent); border: 3px solid rgba(224,122,58,0.3);'}
    `;
    circle.textContent = `${pct}%`;

    const sTitle = document.createElement('h2');
    sTitle.style.cssText = `
      font-family: var(--font-display); font-weight: 800; font-size: 1.25rem;
      color: var(--color-ink); margin-bottom: 0.375rem;
    `;
    sTitle.textContent = isGood ? 'Stark!' : 'Dranbleiben!';

    const sText = document.createElement('p');
    sText.style.cssText = 'font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1.25rem; line-height: 1.5;';
    sText.textContent = `${sessionCorrect} von ${sessionTotal} richtig.`;

    const continueBtn = document.createElement('button');
    continueBtn.style.cssText = `
      padding: 0.75rem 2rem; background: var(--color-accent); color: #fff;
      border: none; border-radius: 0.625rem; font-size: 0.9rem;
      font-weight: 600; cursor: pointer; font-family: var(--font-display);
      transition: background-color 0.15s;
    `;
    continueBtn.textContent = 'Weiter \u2192';
    continueBtn.addEventListener('mouseenter', () => { continueBtn.style.backgroundColor = 'var(--color-accent-dark)'; });
    continueBtn.addEventListener('mouseleave', () => { continueBtn.style.backgroundColor = 'var(--color-accent)'; });
    continueBtn.addEventListener('click', showNext);

    wrap.append(circle, sTitle, sText, continueBtn);
    questionCard.appendChild(wrap);
  }

  showNext();
  return null;
}
