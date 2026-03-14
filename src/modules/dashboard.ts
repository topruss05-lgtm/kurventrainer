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

export function renderDashboard(container: HTMLElement): (() => void) | null {
  const header = document.createElement('header');
  header.className = 'mb-10 animate-fade-in';

  const h1 = document.createElement('h1');
  h1.className = 'text-3xl font-extrabold tracking-tight mb-1';
  h1.style.color = 'var(--color-primary)';
  h1.textContent = 'Kurventrainer';

  const subtitle = document.createElement('p');
  subtitle.style.color = 'var(--color-ink-muted)';
  subtitle.textContent = 'Extremstellen, Wendestellen & Ableitungen sicher beherrschen';

  header.append(h1, subtitle);

  const grid = document.createElement('div');
  grid.className = 'grid gap-5 sm:grid-cols-2';

  MODULE_CONFIGS.forEach((config, index) => {
    const progress = getModuleProgress(config.id);
    const pct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;

    const card = document.createElement('button');
    card.className = 'card card-interactive text-left relative overflow-hidden animate-slide-up';
    card.style.animationDelay = `${index * 70}ms`;
    card.addEventListener('click', () => navigate({ page: 'module', moduleId: config.id }));

    // Decorative watermark
    const watermark = document.createElement('span');
    watermark.className = 'absolute top-3 right-4 text-5xl font-bold pointer-events-none select-none';
    watermark.style.color = 'var(--color-primary)';
    watermark.style.opacity = '0.07';
    watermark.style.fontFamily = 'var(--font-display)';
    watermark.textContent = MODULE_WATERMARKS[config.id] ?? '';

    const orderBadge = document.createElement('span');
    orderBadge.className = 'badge mb-2';
    orderBadge.style.backgroundColor = 'var(--color-primary-light)';
    orderBadge.style.color = 'var(--color-primary)';
    orderBadge.textContent = `${config.order}`;

    const title = document.createElement('h2');
    title.className = 'text-lg font-semibold mb-1';
    title.textContent = config.title;

    const desc = document.createElement('p');
    desc.className = 'text-sm mb-3';
    desc.style.color = 'var(--color-ink-secondary)';
    desc.textContent = config.description;

    const barTrack = document.createElement('div');
    barTrack.className = 'progress-bar-track';

    const barFill = document.createElement('div');
    barFill.className = 'progress-bar-fill';
    barFill.style.width = `${pct}%`;
    barTrack.appendChild(barFill);

    const stats = document.createElement('p');
    stats.className = 'text-xs mt-1.5';
    stats.style.color = 'var(--color-ink-muted)';
    stats.textContent = progress.total > 0
      ? `${progress.correct}/${progress.total} richtig (${pct}%)`
      : 'Noch nicht gestartet';

    card.append(watermark, orderBadge, title, desc, barTrack, stats);
    grid.appendChild(card);
  });

  // Cheat-Sheet link
  const cheatBtn = document.createElement('button');
  cheatBtn.className = 'card card-interactive w-full mt-5 text-left relative overflow-hidden animate-slide-up';
  cheatBtn.style.animationDelay = `${MODULE_CONFIGS.length * 70 + 40}ms`;
  cheatBtn.style.borderLeft = '4px solid var(--color-accent)';
  cheatBtn.style.marginTop = '2.5rem';
  cheatBtn.style.display = 'flex';
  cheatBtn.style.alignItems = 'center';
  cheatBtn.style.gap = '1rem';

  const cheatIcon = document.createElement('span');
  cheatIcon.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; flex-shrink: 0;
    background: var(--color-accent-light); color: var(--color-accent);
  `;
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('width', '20');
  iconSvg.setAttribute('height', '20');
  iconSvg.setAttribute('viewBox', '0 0 24 24');
  iconSvg.setAttribute('fill', 'none');
  iconSvg.setAttribute('stroke', 'currentColor');
  iconSvg.setAttribute('stroke-width', '2');
  iconSvg.setAttribute('stroke-linecap', 'round');
  iconSvg.setAttribute('stroke-linejoin', 'round');
  const iconPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath1.setAttribute('d', 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z');
  const iconPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath2.setAttribute('d', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z');
  iconSvg.append(iconPath1, iconPath2);
  cheatIcon.appendChild(iconSvg);

  const cheatText = document.createElement('div');
  const cheatTitle = document.createElement('span');
  cheatTitle.className = 'font-semibold';
  cheatTitle.textContent = 'Das Wichtigste';
  const cheatSub = document.createElement('span');
  cheatSub.className = 'text-sm block';
  cheatSub.style.color = 'var(--color-ink-muted)';
  cheatSub.textContent = 'Alle Regeln auf einen Blick';
  cheatText.append(cheatTitle, cheatSub);

  const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrowSvg.setAttribute('width', '20');
  arrowSvg.setAttribute('height', '20');
  arrowSvg.setAttribute('viewBox', '0 0 24 24');
  arrowSvg.setAttribute('fill', 'none');
  arrowSvg.setAttribute('stroke', 'currentColor');
  arrowSvg.setAttribute('stroke-width', '2');
  arrowSvg.setAttribute('stroke-linecap', 'round');
  arrowSvg.setAttribute('stroke-linejoin', 'round');
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrowPath.setAttribute('d', 'M9 18l6-6-6-6');
  arrowSvg.appendChild(arrowPath);

  const cheatArrow = document.createElement('span');
  cheatArrow.style.cssText = 'margin-left: auto; color: var(--color-ink-muted); transition: transform 0.2s; display: flex;';
  cheatArrow.appendChild(arrowSvg);

  cheatBtn.append(cheatIcon, cheatText, cheatArrow);
  cheatBtn.addEventListener('mouseenter', () => { cheatArrow.style.transform = 'translateX(4px)'; });
  cheatBtn.addEventListener('mouseleave', () => { cheatArrow.style.transform = ''; });
  cheatBtn.addEventListener('click', () => navigate({ page: 'cheatsheet' }));

  // Reset button
  const resetBtn = document.createElement('button');
  resetBtn.className = 'w-full mt-2 p-3 text-sm cursor-pointer transition-colors';
  resetBtn.style.color = 'var(--color-ink-muted)';
  resetBtn.addEventListener('mouseenter', () => { resetBtn.style.color = 'var(--color-error)'; });
  resetBtn.addEventListener('mouseleave', () => { resetBtn.style.color = 'var(--color-ink-muted)'; });
  resetBtn.textContent = 'Fortschritt zurücksetzen';
  resetBtn.addEventListener('click', () => {
    if (confirm('Wirklich allen Fortschritt löschen?')) {
      resetAllProgress();
      navigate({ page: 'dashboard' });
    }
  });

  container.append(header, grid, cheatBtn, resetBtn);
  return null;
}
