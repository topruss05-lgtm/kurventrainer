import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Render a LaTeX string into a target element.
 * Handles both display-mode (block) and inline math.
 */
export function renderLatex(
  el: HTMLElement,
  latex: string,
  displayMode = false,
): void {
  try {
    katex.render(latex, el, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    el.textContent = latex;
  }
}

/**
 * Create a <span> with rendered inline LaTeX.
 */
export function latexSpan(latex: string): HTMLSpanElement {
  const span = document.createElement('span');
  renderLatex(span, latex);
  return span;
}

/**
 * Convert the caret notation used in exercise data (e.g. "f'(x) = 3x^2 - 3")
 * to proper LaTeX ("f'(x) = 3x^{2} - 3").
 * Handles multi-digit exponents and keeps existing {} groups intact.
 */
export function toLatex(raw: string): string {
  // Wrap bare exponents: x^2 → x^{2}, x^12 → x^{12}
  // but leave x^{...} alone
  return raw.replace(/\^(?!\{)(\d+)/g, '^{$1}');
}

/**
 * Render an exercise-data latex string (caret notation) into an element.
 */
export function renderExerciseLatex(
  el: HTMLElement,
  raw: string,
  displayMode = false,
): void {
  renderLatex(el, toLatex(raw), displayMode);
}

/**
 * Create a <span> with rendered exercise-data LaTeX.
 */
export function exerciseLatexSpan(raw: string): HTMLSpanElement {
  const span = document.createElement('span');
  renderExerciseLatex(span, raw);
  return span;
}

/**
 * Check if a string looks like a math expression that should be rendered with LaTeX.
 */
function looksLikeMath(s: string): boolean {
  return /[=^]|f\(|f'\(|f''\(|x[²³⁴]/.test(s);
}

/**
 * Set the content of an element, rendering as LaTeX if it looks like math,
 * otherwise as plain text.
 */
export function setMathOrText(el: HTMLElement, raw: string): void {
  if (looksLikeMath(raw)) {
    renderExerciseLatex(el, raw);
  } else {
    el.textContent = raw;
  }
}

/**
 * Render mixed text + inline LaTeX.
 * Splits on \(...\) delimiters and renders LaTeX parts with KaTeX.
 */
export function renderMixedContent(el: HTMLElement, raw: string): void {
  el.textContent = '';
  const parts = raw.split(/(\\\(.*?\\\))/g);
  for (const part of parts) {
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      const latex = part.slice(2, -2);
      const span = document.createElement('span');
      renderLatex(span, toLatex(latex));
      el.appendChild(span);
    } else if (part) {
      el.appendChild(document.createTextNode(part));
    }
  }
}
