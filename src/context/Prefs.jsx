import { createContext, useContext, useEffect, useState } from 'react';
import ltr from 'bootstrap/dist/css/bootstrap.min.css?url';
import rtl from 'bootstrap/dist/css/bootstrap.rtl.min.css?url';
import { dict } from '../i18n.js';

const Ctx = createContext();
export const usePrefs = () => useContext(Ctx);

export function Prefs({ children }) {
  const [lang, setLang] = useState(() => { const v = localStorage.getItem('shifa_lang'); return v in dict ? v : 'ar'; });
  const [theme, setTheme] = useState(() => { const v = localStorage.getItem('shifa_theme'); return v === 'dark' ? 'dark' : 'light'; });

  useEffect(() => {
    localStorage.setItem('shifa_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    let l = document.getElementById('bs-css');
    if (!l) {
      l = document.createElement('link');
      l.id = 'bs-css';
      l.rel = 'stylesheet';
      document.head.prepend(l);
    }
    l.href = lang === 'ar' ? rtl : ltr;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('shifa_theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const t = (k) => (dict[lang] || dict.ar)[k] ?? k;
  const pick = (o, f) => (lang === 'ar' && o[f + 'Ar']) || o[f];
  return <Ctx.Provider value={{ lang, setLang, theme, setTheme, t, pick }}>{children}</Ctx.Provider>;
}
