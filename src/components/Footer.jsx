import { usePrefs } from '../context/Prefs.jsx';
import { WHATSAPP } from '../config.js';

export default function Footer() {
  const { t } = usePrefs();
  return (
    <footer className="border-top py-4 mt-5 bg-body-tertiary">
      <div className="container d-flex flex-wrap justify-content-between gap-2 small">
        <span>{t('footer_note')}</span>
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">{t('wa_cta')}</a>
        <span className="text-secondary">© {new Date().getFullYear()} {t('brand')}. {t('rights')}</span>
      </div>
    </footer>
  );
}
