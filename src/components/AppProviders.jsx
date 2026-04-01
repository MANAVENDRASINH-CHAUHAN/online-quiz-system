/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getLocalStorageItem, setLocalStorageItem } from "../utils/storage";

const ThemeContext = createContext(null);
const SoundContext = createContext(null);

function playTone({ frequency = 440, duration = 0.08, type = "sine", gain = 0.018 }) {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const context = new AudioCtx();
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  volume.gain.value = gain;

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.onended = () => context.close();
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getLocalStorageItem("appTheme", "dark"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    setLocalStorageItem("appTheme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function SoundProvider({ children }) {
  const value = useMemo(
    () => ({
      click: () => playTone({ frequency: 520, duration: 0.05, type: "triangle" }),
      success: () => {
        playTone({ frequency: 660, duration: 0.06, type: "sine", gain: 0.022 });
        window.setTimeout(() => {
          playTone({ frequency: 820, duration: 0.09, type: "sine", gain: 0.02 });
        }, 60);
      },
    }),
    []
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <SoundProvider>
        {children}
      </SoundProvider>
    </ThemeProvider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useUISound() {
  return useContext(SoundContext);
}
