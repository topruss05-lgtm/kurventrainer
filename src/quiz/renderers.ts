// ═══════════════════════════════════════════════════════════════════
// Klausur-Quiz Renderer
//
// Zwei Fragetypen:
//   MC        — Tap eine von 4 Optionen (Kriterien, Graph, Fallen)
//   Flashcard — 3D-Flip-Karte: Denken → Umdrehen → Selbsteinschätzung
// ═══════════════════════════════════════════════════════════════════

import type { QuizQuestion, McQuestion, FlashcardQuestion } from './questions.js';

const CATEGORY_LABELS: Record<QuizQuestion['category'], string> = {
  kriterien: 'Kriterien',
  verfahren: 'Verfahren',
  graph: 'Graph ablesen',
  fallen: 'Aufgepasst',
};

const CATEGORY_COLORS: Record<QuizQuestion['category'], string> = {
  kriterien: 'var(--color-primary)',
  verfahren: 'var(--color-accent)',
  graph: '#6366f1',
  fallen: 'var(--color-error)',
};

// Inject flip keyframes once
let flipStylesInjected = false;
function injectFlipStyles(): void {
  if (flipStylesInjected) return;
  flipStylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flashcardFlip {
      0%   { transform: rotateX(0deg); }
      100% { transform: rotateX(180deg); }
    }
    @keyframes assessFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

export function renderQuestion(
  container: HTMLElement,
  question: QuizQuestion,
  onAnswer: (correct: boolean) => void,
): void {
  if (question.type === 'flashcard') {
    renderFlashcard(container, question, onAnswer);
  } else {
    renderMc(container, question, onAnswer);
  }
}

// ─── MC Renderer ─────────────────────────────────────────────────

function renderMc(
  container: HTMLElement,
  question: McQuestion,
  onAnswer: (correct: boolean) => void,
): void {
  let answered = false;

  const pill = makeCategoryPill(question.category);

  const questionEl = document.createElement('h3');
  questionEl.style.cssText = `
    font-family: var(--font-display); font-weight: 700;
    font-size: 0.95rem; line-height: 1.45; color: var(--color-ink);
    margin-bottom: 1rem; white-space: pre-line;
  `;
  questionEl.textContent = question.question;

  const optionsDiv = document.createElement('div');
  optionsDiv.style.cssText = 'display: grid; gap: 0.5rem;';

  const buttons: HTMLButtonElement[] = [];

  question.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      width: 100%; text-align: left; padding: 0.75rem 1rem;
      border-radius: 0.625rem; border: 2px solid var(--color-border);
      background: var(--color-surface-card); cursor: pointer;
      font-size: 0.85rem; line-height: 1.4; color: var(--color-ink);
      transition: border-color 0.15s, background-color 0.15s;
    `;
    btn.textContent = option;
    buttons.push(btn);

    btn.addEventListener('mouseenter', () => {
      if (!answered) {
        btn.style.borderColor = 'var(--color-primary)';
        btn.style.backgroundColor = 'var(--color-primary-light)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!answered) {
        btn.style.borderColor = 'var(--color-border)';
        btn.style.backgroundColor = 'var(--color-surface-card)';
      }
    });

    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const correct = idx === question.correctIndex;

      buttons.forEach((b, i) => {
        b.style.cursor = 'default';
        if (i === question.correctIndex) {
          b.style.borderColor = 'var(--color-success)';
          b.style.backgroundColor = 'var(--color-success-bg)';
        } else if (i === idx && !correct) {
          b.style.borderColor = 'var(--color-error)';
          b.style.backgroundColor = 'rgba(239,68,68,0.08)';
        } else {
          b.style.opacity = '0.4';
        }
      });

      showFeedback(container, correct, question.explanation);
      onAnswer(correct);
    });

    optionsDiv.appendChild(btn);
  });

  container.append(pill, questionEl, optionsDiv);
}

// ─── Flashcard Renderer (3D flip) ────────────────────────────────

function renderFlashcard(
  container: HTMLElement,
  question: FlashcardQuestion,
  onAnswer: (correct: boolean) => void,
): void {
  injectFlipStyles();
  let flipped = false;
  let assessed = false;

  const catColor = CATEGORY_COLORS[question.category] ?? 'var(--color-accent)';

  // ── Perspective wrapper ──
  const scene = document.createElement('div');
  scene.style.cssText = `
    perspective: 800px;
    margin-bottom: 0.75rem;
  `;

  // ── Card body (holds front + back, does the flip) ──
  const card = document.createElement('div');
  card.style.cssText = `
    position: relative;
    width: 100%;
    min-height: 12rem;
    transform-style: preserve-3d;
    transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
    cursor: pointer;
  `;

  // ── FRONT face ──
  const front = document.createElement('div');
  front.style.cssText = `
    position: absolute; inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    background: var(--color-surface-card);
    border: 1px solid var(--color-border);
    border-radius: 0.875rem;
    padding: 1.25rem 1.25rem 1rem;
    display: flex; flex-direction: column;
    box-shadow: 0 2px 8px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04);
  `;

  // Front: category pill
  const frontPill = makeCategoryPill(question.category);
  frontPill.style.marginBottom = '0.5rem';

  // Front: question
  const frontQuestion = document.createElement('h3');
  frontQuestion.style.cssText = `
    font-family: var(--font-display); font-weight: 700;
    font-size: 0.95rem; line-height: 1.5; color: var(--color-ink);
    white-space: pre-line; flex: 1;
  `;
  frontQuestion.textContent = question.question;

  // Front: tap hint
  const tapHint = document.createElement('span');
  tapHint.style.cssText = `
    display: block; text-align: center;
    font-size: 0.7rem; color: var(--color-ink-muted);
    margin-top: 0.75rem; letter-spacing: 0.02em;
    transition: opacity 0.2s;
  `;
  tapHint.textContent = 'Antippen zum Umdrehen';

  front.append(frontPill, frontQuestion, tapHint);

  // ── BACK face ──
  const back = document.createElement('div');
  back.style.cssText = `
    position: absolute; inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: rotateX(180deg);
    background: var(--color-surface-card);
    border: 1px solid var(--color-border);
    border-radius: 0.875rem;
    padding: 1.25rem 1.25rem 1rem;
    display: flex; flex-direction: column;
    box-shadow: 0 2px 8px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04);
  `;

  // Back: small label
  const backLabel = document.createElement('span');
  backLabel.style.cssText = `
    font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: ${catColor};
    margin-bottom: 0.625rem; opacity: 0.7;
  `;
  backLabel.textContent = 'Antwort';

  // Back: answer content
  const backContent = document.createElement('div');
  backContent.style.cssText = `
    font-size: 0.85rem; line-height: 1.75; color: var(--color-ink);
    white-space: pre-line; flex: 1;
  `;
  backContent.textContent = question.reveal;

  back.append(backLabel, backContent);

  card.append(front, back);
  scene.appendChild(card);

  // Size the card to the taller face — measure after append
  function syncHeight(): void {
    card.style.minHeight = 'auto';
    front.style.position = 'relative';
    back.style.position = 'relative';
    const h = Math.max(front.offsetHeight, back.offsetHeight);
    front.style.position = 'absolute';
    back.style.position = 'absolute';
    card.style.minHeight = `${h}px`;
  }

  // ── Assessment buttons (below card, shown after flip) ──
  const assessWrap = document.createElement('div');
  assessWrap.style.cssText = `
    display: none;
  `;

  const assessLabel = document.createElement('p');
  assessLabel.style.cssText = `
    font-size: 0.75rem; color: var(--color-ink-muted); text-align: center;
    margin-bottom: 0.5rem;
  `;
  assessLabel.textContent = 'Hättest du das gewusst?';

  const assessRow = document.createElement('div');
  assessRow.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;';

  const yesBtn = makeAssessButton(true);
  const noBtn = makeAssessButton(false);

  function handleAssess(correct: boolean): void {
    if (assessed) return;
    assessed = true;
    card.style.cursor = 'default';

    // Highlight chosen, dim other
    const chosen = correct ? yesBtn : noBtn;
    const other = correct ? noBtn : yesBtn;
    chosen.style.opacity = '1';
    chosen.style.transform = 'scale(1.02)';
    other.style.opacity = '0.35';
    other.style.pointerEvents = 'none';
    chosen.style.pointerEvents = 'none';

    onAnswer(correct);
  }

  yesBtn.addEventListener('click', () => handleAssess(true));
  noBtn.addEventListener('click', () => handleAssess(false));

  assessRow.append(yesBtn, noBtn);
  assessWrap.append(assessLabel, assessRow);

  // ── Flip logic ──
  function doFlip(): void {
    if (flipped) return;
    flipped = true;
    card.style.transform = 'rotateX(180deg)';
    card.style.cursor = 'default';
    tapHint.style.opacity = '0';
    // Show assessment after flip animation completes
    setTimeout(() => {
      assessWrap.style.display = 'block';
      assessWrap.style.animation = 'assessFadeIn 0.25s ease-out forwards';
    }, 400);
  }

  card.addEventListener('click', doFlip);

  // Hover lift effect (front only)
  card.addEventListener('mouseenter', () => {
    if (!flipped) {
      card.style.boxShadow = '0 6px 20px rgba(26,26,46,0.10), 0 2px 6px rgba(26,26,46,0.06)';
      card.style.transform = 'translateY(-2px)';
    }
  });
  card.addEventListener('mouseleave', () => {
    if (!flipped) {
      card.style.boxShadow = '';
      card.style.transform = '';
    }
  });

  container.append(scene, assessWrap);

  // Measure after DOM insertion
  requestAnimationFrame(syncHeight);
}

// ─── Shared helpers ──────────────────────────────────────────────

function makeAssessButton(isPositive: boolean): HTMLButtonElement {
  const btn = document.createElement('button');
  const color = isPositive ? 'var(--color-success)' : 'var(--color-error)';
  const bg = isPositive ? 'var(--color-success-bg)' : 'var(--color-error-bg)';
  const borderColor = isPositive ? 'var(--color-success-border)' : 'var(--color-error-border)';
  btn.style.cssText = `
    padding: 0.75rem; border-radius: 0.625rem; cursor: pointer;
    font-size: 0.85rem; font-weight: 600;
    font-family: var(--font-display);
    background: ${bg}; color: ${color};
    border: 2px solid ${borderColor};
    transition: opacity 0.2s, transform 0.2s, background-color 0.15s;
  `;
  btn.textContent = isPositive ? 'Wusste ich' : 'Wusste ich nicht';

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.02)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });

  return btn;
}

function makeCategoryPill(category: QuizQuestion['category']): HTMLElement {
  const pill = document.createElement('span');
  const catColor = CATEGORY_COLORS[category];
  pill.style.cssText = `
    display: inline-block; font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: ${catColor}; background: ${catColor}11;
    padding: 0.25rem 0.625rem; border-radius: 999px;
    margin-bottom: 0.75rem; border: 1px solid ${catColor}22;
  `;
  pill.textContent = CATEGORY_LABELS[category];
  return pill;
}

function showFeedback(container: HTMLElement, correct: boolean, explanation: string): void {
  const feedback = document.createElement('div');
  feedback.className = 'animate-fade-in';
  const color = correct ? 'var(--color-success)' : 'var(--color-error)';
  const bg = correct ? 'var(--color-success-bg)' : 'rgba(239,68,68,0.06)';
  feedback.style.cssText = `
    margin-top: 1rem; padding: 0.875rem 1rem;
    border-radius: 0.625rem; border-left: 3px solid ${color};
    background: ${bg};
  `;

  const label = document.createElement('span');
  label.style.cssText = `
    display: block; font-family: var(--font-display); font-weight: 700;
    font-size: 0.8rem; color: ${color}; margin-bottom: 0.375rem;
  `;
  label.textContent = correct ? 'Richtig!' : 'Leider falsch.';

  const text = document.createElement('p');
  text.style.cssText = `
    font-size: 0.825rem; line-height: 1.55; color: var(--color-ink-secondary);
    white-space: pre-line; margin: 0;
  `;
  text.textContent = explanation;

  // Cheatsheet link (only on wrong answers)
  if (!correct) {
    const link = document.createElement('a');
    link.href = '#/cheatsheet';
    link.style.cssText = `
      display: inline-block; margin-top: 0.5rem;
      font-size: 0.75rem; color: var(--color-primary);
      text-decoration: none; font-weight: 600;
      transition: opacity 0.15s;
    `;
    link.textContent = 'Zusammenfassung anschauen \u2192';
    link.addEventListener('mouseenter', () => { link.style.opacity = '0.7'; });
    link.addEventListener('mouseleave', () => { link.style.opacity = '1'; });
    feedback.append(label, text, link);
  } else {
    feedback.append(label, text);
  }

  container.appendChild(feedback);
}
