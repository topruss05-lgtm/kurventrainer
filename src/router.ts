export type Route =
  | { page: 'dashboard' }
  | { page: 'module'; moduleId: string }
  | { page: 'exercise'; moduleId: string; type: string; difficulty: string }
  | { page: 'cheatsheet' };

type RouteHandler = (route: Route) => void;

let currentHandler: RouteHandler | null = null;

export function parseHash(hash: string): Route {
  const parts = hash.replace('#', '').split('/').filter(Boolean);

  if (parts[0] === 'module' && parts[1]) {
    if (parts[2] === 'exercise' && parts[3] && parts[4]) {
      return { page: 'exercise', moduleId: parts[1], type: parts[3], difficulty: parts[4] };
    }
    return { page: 'module', moduleId: parts[1] };
  }

  if (parts[0] === 'cheatsheet') {
    return { page: 'cheatsheet' };
  }

  return { page: 'dashboard' };
}

export function navigate(route: Route): void {
  let hash = '#';
  switch (route.page) {
    case 'dashboard':
      hash = '#/';
      break;
    case 'module':
      hash = `#/module/${route.moduleId}`;
      break;
    case 'exercise':
      hash = `#/module/${route.moduleId}/exercise/${route.type}/${route.difficulty}`;
      break;
    case 'cheatsheet':
      hash = '#/cheatsheet';
      break;
  }
  window.location.hash = hash;
}

export function initRouter(handler: RouteHandler): void {
  currentHandler = handler;

  const onHashChange = () => {
    const route = parseHash(window.location.hash);
    currentHandler?.(route);
  };

  window.addEventListener('hashchange', onHashChange);
  onHashChange();
}
