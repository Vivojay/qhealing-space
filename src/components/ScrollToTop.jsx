import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Auto-scrolls window (and Lenis if available) to the top when the route changes.
// Mounted inside <BrowserRouter> in main.jsx.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname]);

  return null;
}
