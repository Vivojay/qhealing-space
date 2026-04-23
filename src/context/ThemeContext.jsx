import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

const DARK_BG  = '#0e1014';
const LIGHT_BG = '#ECE9E2';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [wave, setWave] = useState(null);

  const toggleTheme = useCallback((e) => {
    if (wave) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    // Color of the NEW theme — expands OUTWARD from the button
    const newColor = isDark ? LIGHT_BG : DARK_BG;
    setWave({ x, y, color: newColor, willBeDark: !isDark });
  }, [isDark, wave]);

  const finishWave = () => {
    setIsDark(prev => {
      const next = wave ? wave.willBeDark : !prev;
      if (next) {
        document.documentElement.classList.remove('light-mode');
      } else {
        document.documentElement.classList.add('light-mode');
      }
      return next;
    });
    setWave(null);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
      <AnimatePresence>
        {wave && (
          <motion.div
            key="theme-wave"
            className="fixed inset-0 pointer-events-none"
            style={{ backgroundColor: wave.color, zIndex: 9998 }}
            initial={{ clipPath: `circle(0px at ${wave.x}px ${wave.y}px)` }}
            animate={{ clipPath: `circle(220vmax at ${wave.x}px ${wave.y}px)` }}
            transition={{ duration: 0.85, ease: [0.86, 0, 0.07, 1] }}
            onAnimationComplete={finishWave}
          />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
