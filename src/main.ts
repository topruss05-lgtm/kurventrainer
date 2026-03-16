import './styles/main.css';
import { initRouter, type Route } from './router.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderModuleView } from './modules/module-view.js';
import { renderExerciseView } from './modules/exercise-view.js';
import { renderCheatsheet } from './modules/cheatsheet.js';
import { renderExplorer } from './modules/explorer.js';

const app = document.getElementById('app')!;

let destroyCurrent: (() => void) | null = null;

function renderRoute(route: Route): void {
  destroyCurrent?.();
  destroyCurrent = null;
  // Clear all child nodes safely
  while (app.firstChild) {
    app.removeChild(app.firstChild);
  }

  switch (route.page) {
    case 'dashboard':
      destroyCurrent = renderDashboard(app);
      break;
    case 'module':
      destroyCurrent = renderModuleView(app, route.moduleId);
      break;
    case 'exercise':
      destroyCurrent = renderExerciseView(app, route.moduleId, route.type, route.difficulty);
      break;
    case 'cheatsheet':
      destroyCurrent = renderCheatsheet(app);
      break;
    case 'explorer':
      destroyCurrent = renderExplorer(app);
      break;
  }
}

initRouter(renderRoute);
