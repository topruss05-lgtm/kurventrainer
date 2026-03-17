import { MODULE_CONFIGS } from '../config.js';
import { getModuleProgress } from '../progress/storage.js';
import { resetAllProgress } from '../progress/storage.js';
import { navigate } from '../router.js';

const MODULE_WATERMARKS: Record<string, string> = {
  monotonie: '~',
  extremstellen: '\u2227',
  wendestellen: '\u223F',
  zusammenhang: "f\u2032",
  quiz: '?',
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

export function renderDashboard(container: HTMLElement): (() => void) | null {
  // ─── Header ───
  const header = document.createElement('header');
  header.className = 'animate-fade-in';
  header.style.cssText = 'margin-bottom: 2.5rem;';

  const h1 = document.createElement('h1');
  h1.style.cssText = `
    font-family: var(--font-display); font-weight: 800; font-size: 2rem;
    letter-spacing: -0.025em; color: var(--color-primary); line-height: 1.2;
  `;
  h1.textContent = 'Kurvendiskussion';

  const subtitle = document.createElement('p');
  subtitle.style.cssText = `
    font-size: 0.9rem; color: var(--color-ink-muted); margin-top: 0.25rem;
    letter-spacing: 0.01em;
  `;
  subtitle.textContent = 'Extremstellen, Wendestellen & Ableitungen sicher beherrschen';

  header.append(h1, subtitle);

  // ─── Cheat Sheet hero card ───
  const cheatBtn = document.createElement('button');
  cheatBtn.className = 'animate-slide-up';
  cheatBtn.style.cssText = `
    width: 100%; text-align: left; position: relative; overflow: hidden;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    border: none; border-radius: 1rem; padding: 1.5rem 1.5rem;
    display: flex; align-items: center; gap: 1.25rem;
    cursor: pointer; margin-bottom: 2rem; animation-delay: 60ms;
    box-shadow: 0 4px 16px rgba(13, 115, 119, 0.2), 0 1px 3px rgba(13, 115, 119, 0.1);
    transition: box-shadow 0.25s, transform 0.25s;
  `;
  cheatBtn.addEventListener('mouseenter', () => {
    cheatBtn.style.boxShadow = '0 8px 24px rgba(13, 115, 119, 0.28), 0 2px 6px rgba(13, 115, 119, 0.12)';
    cheatBtn.style.transform = 'translateY(-2px)';
    cheatArrow.style.transform = 'translateX(4px)';
  });
  cheatBtn.addEventListener('mouseleave', () => {
    cheatBtn.style.boxShadow = '0 4px 16px rgba(13, 115, 119, 0.2), 0 1px 3px rgba(13, 115, 119, 0.1)';
    cheatBtn.style.transform = '';
    cheatArrow.style.transform = '';
  });
  cheatBtn.addEventListener('click', () => navigate({ page: 'cheatsheet' }));

  // Decorative curve SVG in background
  const bgDecor = document.createElement('div');
  bgDecor.style.cssText = `
    position: absolute; right: -1rem; top: -1.5rem; bottom: -1.5rem; width: 40%;
    opacity: 0.08; pointer-events: none;
  `;
  const curveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  curveSvg.setAttribute('viewBox', '0 0 200 120');
  curveSvg.setAttribute('fill', 'none');
  curveSvg.style.cssText = 'width: 100%; height: 100%;';
  const curvePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  curvePath.setAttribute('d', 'M0 80 C40 80, 50 20, 80 20 S120 100, 160 60 S190 10, 200 40');
  curvePath.setAttribute('stroke', 'white');
  curvePath.setAttribute('stroke-width', '3');
  curveSvg.appendChild(curvePath);
  bgDecor.appendChild(curveSvg);

  const cheatIcon = document.createElement('span');
  cheatIcon.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    width: 2.75rem; height: 2.75rem; border-radius: 0.75rem; flex-shrink: 0;
    background: rgba(255, 255, 255, 0.18); color: #fff;
    backdrop-filter: blur(4px);
  `;
  cheatIcon.appendChild(svgIcon([
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
    'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  ]));

  const cheatText = document.createElement('div');
  cheatText.style.cssText = 'position: relative; z-index: 1;';
  const cheatTitle = document.createElement('span');
  cheatTitle.style.cssText = `
    display: block; font-family: var(--font-display); font-weight: 700;
    font-size: 1rem; color: #fff;
  `;
  cheatTitle.textContent = 'Das Wichtigste';
  const cheatSub = document.createElement('span');
  cheatSub.style.cssText = 'display: block; font-size: 0.8rem; color: rgba(255,255,255,0.72); margin-top: 0.125rem;';
  cheatSub.textContent = 'Alle Regeln interaktiv auf einen Blick';
  cheatText.append(cheatTitle, cheatSub);

  const cheatArrow = document.createElement('span');
  cheatArrow.style.cssText = `
    margin-left: auto; color: rgba(255,255,255,0.6);
    transition: transform 0.2s; display: flex; position: relative; z-index: 1;
  `;
  cheatArrow.appendChild(svgIcon(['M9 18l6-6-6-6']));

  cheatBtn.append(bgDecor, cheatIcon, cheatText, cheatArrow);

  // ─── Section label ───
  const sectionLabel = document.createElement('p');
  sectionLabel.className = 'animate-slide-up';
  sectionLabel.style.cssText = `
    font-family: var(--font-display); font-weight: 700; font-size: 0.7rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--color-ink-muted); margin-bottom: 0.875rem; animation-delay: 120ms;
  `;
  sectionLabel.textContent = '\u00dcbungen';

  // ─── Exercise grid ───
  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; gap: 0.75rem;';

  MODULE_CONFIGS.forEach((config, index) => {
    const progress = getModuleProgress(config.id);
    const pct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;

    const card = document.createElement('button');
    card.className = 'card card-interactive animate-slide-up';
    card.style.cssText = `
      text-align: left; display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.25rem; animation-delay: ${150 + index * 60}ms;
    `;
    card.addEventListener('click', () => navigate({ page: 'module', moduleId: config.id }));

    // Step number
    const step = document.createElement('span');
    step.style.cssText = `
      display: flex; align-items: center; justify-content: center;
      width: 2rem; height: 2rem; border-radius: 0.5rem; flex-shrink: 0;
      font-family: var(--font-display); font-weight: 700; font-size: 0.8rem;
      ${pct >= 80
        ? 'background: var(--color-success-bg); color: var(--color-success); border: 1px solid var(--color-success-border);'
        : progress.total > 0
          ? 'background: var(--color-accent-light); color: var(--color-accent); border: 1px solid rgba(224,122,58,0.2);'
          : 'background: var(--color-surface-inset); color: var(--color-ink-muted); border: 1px solid var(--color-border);'
      }
    `;
    step.textContent = `${config.order}`;

    // Content column
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; min-width: 0;';

    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display: flex; align-items: baseline; gap: 0.5rem;';

    const title = document.createElement('span');
    title.style.cssText = `
      font-family: var(--font-display); font-weight: 600; font-size: 0.9rem;
      color: var(--color-ink);
    `;
    title.textContent = config.title;

    const statsBadge = document.createElement('span');
    statsBadge.style.cssText = `
      font-size: 0.675rem; color: var(--color-ink-muted); white-space: nowrap;
    `;
    statsBadge.textContent = progress.total > 0 ? `${pct}%` : '';

    titleRow.append(title, statsBadge);

    // Progress bar — slim, inline
    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'margin-top: 0.375rem;';

    const barTrack = document.createElement('div');
    barTrack.style.cssText = `
      height: 3px; background: var(--color-surface-inset); border-radius: 2px; overflow: hidden;
    `;
    const barFill = document.createElement('div');
    barFill.style.cssText = `
      height: 100%; border-radius: 2px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
      width: ${pct}%;
    `;
    barTrack.appendChild(barFill);
    barWrap.appendChild(barTrack);

    content.append(titleRow, barWrap);

    // Watermark
    const watermark = document.createElement('span');
    watermark.style.cssText = `
      font-size: 1.75rem; font-weight: 700; color: var(--color-primary);
      opacity: 0.06; pointer-events: none; user-select: none; flex-shrink: 0;
      font-family: var(--font-display); margin-left: auto; padding-left: 0.5rem;
    `;
    watermark.textContent = MODULE_WATERMARKS[config.id] ?? '';

    // Arrow
    const arrow = document.createElement('span');
    arrow.style.cssText = 'color: var(--color-ink-muted); opacity: 0.4; display: flex; flex-shrink: 0;';
    arrow.appendChild(svgIcon(['M9 18l6-6-6-6'], 16));

    card.append(step, content, watermark, arrow);
    grid.appendChild(card);
  });

  // ─── Reset ───
  const resetBtn = document.createElement('button');
  resetBtn.className = 'animate-slide-up';
  resetBtn.style.cssText = `
    width: 100%; margin-top: 1.5rem; padding: 0.75rem;
    font-size: 0.75rem; cursor: pointer; transition: color 0.15s;
    color: var(--color-ink-muted); background: none; border: none;
    animation-delay: ${150 + MODULE_CONFIGS.length * 60 + 60}ms;
  `;
  resetBtn.addEventListener('mouseenter', () => { resetBtn.style.color = 'var(--color-error)'; });
  resetBtn.addEventListener('mouseleave', () => { resetBtn.style.color = 'var(--color-ink-muted)'; });
  resetBtn.textContent = 'Fortschritt zur\u00fccksetzen';
  resetBtn.addEventListener('click', () => {
    if (confirm('Wirklich allen Fortschritt l\u00f6schen?')) {
      resetAllProgress();
      window.location.reload();
    }
  });

  container.append(header, cheatBtn, sectionLabel, grid, resetBtn);
  return null;
}
