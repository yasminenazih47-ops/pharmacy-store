import { Link, NavLink } from 'react-router-dom';
import { usePrefs } from '../context/Prefs.jsx';
import { useAuth } from '../context/Auth.jsx';
import { useCart } from '../context/Cart.jsx';
import { LOGO } from '../config.js';

export default function Navbar() {
  const { t, lang, setLang, theme, setTheme } = usePrefs();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const cls = ({ isActive }) => 'nav-link' + (isActive ? ' active fw-bold' : '');
  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-body border-bottom">
      <div className="container">
        <Link className="navbar-brand brand" to="/">
          <img src={LOGO} alt="" height="38" className="me-2 rounded" style={{ objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          {t('brand')}
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="menu">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink end className={cls} to="/">{t('home')}</NavLink></li>
            <li className="nav-item"><NavLink className={cls} to="/products">{t('products')}</NavLink></li>
            {user && <li className="nav-item"><NavLink className={cls} to="/upload">{t('upload')}</NavLink></li>}
            <li className="nav-item"><NavLink className={cls} to="/about">{t('about')}</NavLink></li>
            <li className="nav-item"><NavLink className={cls} to="/contact">{t('contact')}</NavLink></li>
            {user?.role === 'admin' && <li className="nav-item"><NavLink className={cls} to="/dashboard">{t('dashboard')}</NavLink></li>}
          </ul>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link to="/cart" className="btn btn-outline-secondary position-relative">
              🛒 {t('cart')}
              {count > 0 && <span className="badge rounded-pill bg-danger ms-1">{count}</span>}
            </Link>
            <button className="btn btn-outline-secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{t('lang_btn')}</button>
            {user ? (
              <>
                <Link to="/profile" className="btn btn-brand">{user.name.split(' ')[0]}</Link>
                <button className="btn btn-link text-danger" onClick={logout}>{t('logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary">{t('login')}</Link>
                <Link to="/register" className="btn btn-brand">{t('register')}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
