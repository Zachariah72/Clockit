import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "black" | "teal";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem("clockit-theme") as Theme | null;
    if (stored) return stored;
    
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  });

  // Sync theme with backend when user is authenticated
  const syncThemeWithBackend = async (newTheme: Theme) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token && import.meta.env.VITE_API_URL) {
        await fetch(`${import.meta.env.VITE_API_URL}/theme`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: newTheme })
        });
      }
    } catch (error) {
      console.warn('Failed to sync theme with backend:', error);
    }
  };

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove("light", "dark", "black", "teal");

    // Apply the current theme
    root.classList.add(theme);

    // Apply custom CSS variables for color themes
    if (theme === "black") {
      root.style.setProperty('--background', '#000000');
      root.style.setProperty('--foreground', '#000000');
      root.style.setProperty('--card', '#000000');
      root.style.setProperty('--card-foreground', '#000000');
      root.style.setProperty('--popover', '#000000');
      root.style.setProperty('--popover-foreground', '#000000');
      root.style.setProperty('--primary', '#000000');
      root.style.setProperty('--primary-foreground', '#000000');
      root.style.setProperty('--secondary', '#000000');
      root.style.setProperty('--secondary-foreground', '#000000');
      root.style.setProperty('--muted', '#000000');
      root.style.setProperty('--muted-foreground', '#000000');
      root.style.setProperty('--accent', '#000000');
      root.style.setProperty('--accent-foreground', '#000000');
      root.style.setProperty('--destructive', '#000000');
      root.style.setProperty('--destructive-foreground', '#000000');
      root.style.setProperty('--border', '#000000');
      root.style.setProperty('--input', '#000000');
      root.style.setProperty('--ring', '#000000');
    } else if (theme === "teal") {
      root.style.setProperty('--primary', '#3B9797');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--accent', '#3B9797');
      root.style.setProperty('--accent-foreground', '#ffffff');
      root.style.setProperty('--ring', '#3B9797');
    } else {
      // Reset custom properties for light/dark themes
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--popover');
      root.style.removeProperty('--popover-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--destructive');
      root.style.removeProperty('--destructive-foreground');
      root.style.removeProperty('--border');
      root.style.removeProperty('--input');
      root.style.removeProperty('--ring');
    }

    // Persist to localStorage
    localStorage.setItem("clockit-theme", theme);

    // Sync with backend
    syncThemeWithBackend(theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("clockit-theme");
      if (!stored) {
        setTheme(e.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeValue, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
