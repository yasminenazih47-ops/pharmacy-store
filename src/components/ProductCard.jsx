import { Link } from 'react-router-dom';
import { usePrefs } from '../context/Prefs.jsx';
import { useCart } from '../context/Cart.jsx';

export const Img = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" onError={(e) => { e.currentTarget.src = '/img/default.svg'; }} />
);

export default function ProductCard({ p }) {
  const { t, pick } = usePrefs();
  const { add } = useCart();
  return (
    <div className="card h-100 product-card">
      <Link to={`/products/${p.id}`}><Img src={p.image} alt={pick(p, 'name')} className="card-img-top" /></Link>
      <div className="card-body d-flex flex-column">
        <div className="mb-1">
          {p.rx && <span className="badge text-bg-warning me-1">{t('rx_badge')}</span>}
          {p.stock === 0 && <span className="badge text-bg-secondary">{t('out_of_stock')}</span>}
        </div>
        <Link to={`/products/${p.id}`} className="card-title h6 text-body text-decoration-none">{pick(p, 'name')}</Link>
        <div className="small text-secondary mb-2">{p.active}</div>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <strong>{p.price} {t('egp')}</strong>
          <button className="btn btn-sm btn-brand" disabled={p.stock === 0} onClick={() => add(p)}>{t('add_to_cart')}</button>
        </div>
      </div>
    </div>
  );
}
