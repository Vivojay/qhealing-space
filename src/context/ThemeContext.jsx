import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [wave, setWave] = useState(null);

  const toggleTheme = useCallback((e) => {
    if (wave) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const oldColor = isDark ? '#0c0a09' : '#fafaf9';

    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove('light-mode');
      } else {
        document.documentElement.classList.add('light-mode');
      }
      return next;
    });

    setWave({ x, y, color: oldColor });
  }, [isDark, wave]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
      <AnimatePresence>
        {wave && (
          <motion.div
            key="theme-wave"
            className="fixed inset-0 pointer-events-none"
            style={{ backgroundColor: wave.color, zIndex: 9998 }}
            initial={{ clipPath: `circle(200vmax at ${wave.x}px ${wave.y}px)` }}
            animate={{ clipPath: `circle(0px at ${wave.x}px ${wave.y}px)` }}
            transition={{ duration: 0.95, ease: [0.86, 0, 0.07, 1] }}
            onAnimationComplete={() => setWave(null)}
          />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
