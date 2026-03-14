import type { ModuleConfig } from './types/progress.js';

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'monotonie',
    title: 'Monotonie',
    description: 'Zusammenhang zwischen f\' und dem Steigungsverhalten von f',
    order: 1,
    exerciseTypes: ['identify-points', 'true-false', 'reverse-inference', 'criteria-quiz'],
    difficulties: ['einfuehrung', 'uebung', 'herausforderung'],
  },
  {
    id: 'extremstellen',
    title: 'Lokale Extremstellen',
    description: 'Hoch- und Tiefpunkte bestimmen: f\' = 0 und hinreichende Bedingungen',
    order: 2,
    exerciseTypes: ['graph-assignment', 'identify-points', 'true-false', 'reverse-inference', 'criteria-quiz'],
    difficulties: ['einfuehrung', 'uebung', 'herausforderung'],
  },
  {
    id: 'wendestellen',
    title: 'Wendestellen & Krümmung',
    description: 'Wendepunkte bestimmen: f\'\' = 0, Links-/Rechtskurve',
    order: 3,
    exerciseTypes: ['graph-assignment', 'identify-points', 'true-false', 'reverse-inference', 'criteria-quiz'],
    difficulties: ['einfuehrung', 'uebung', 'herausforderung'],
  },
  {
    id: 'zusammenhang',
    title: 'Zusammenhang f ↔ f\' ↔ f\'\'',
    description: 'Graphen zuordnen und Rückschlüsse ziehen',
    order: 4,
    exerciseTypes: ['graph-assignment', 'true-false', 'reverse-inference'],
    difficulties: ['einfuehrung', 'uebung', 'herausforderung'],
  },
  {
    id: 'quiz',
    title: 'Kriterien-Quiz',
    description: 'Alle Bedingungen und Definitionen sicher abrufen',
    order: 5,
    exerciseTypes: ['criteria-quiz'],
    difficulties: ['einfuehrung', 'uebung', 'herausforderung'],
  },
];
