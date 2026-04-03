export function createPageUrl(page) {
  const routes = {
    'Home': '/',
    'Healings': '/healings',
    'Global Practices': '/global-practices',
    'Retreats': '/retreats',
    'Hindu Rituals': '/hindu-rituals',
    'Transcendence Rituals': '/transcendence-rituals',
  };
  return routes[page] || '/';
}
