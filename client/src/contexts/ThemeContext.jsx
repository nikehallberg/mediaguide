import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark-theme");
      setIsDark(true);
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark-theme");
      setIsDark(false);
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark-theme");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = document.documentElement.classList.toggle("dark-theme");
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};