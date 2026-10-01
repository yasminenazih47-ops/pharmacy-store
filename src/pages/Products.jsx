import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import ProductCard from '../components/ProductCard.jsx';

const PER = 12;

export default function Products() {
  const { t, pick } = usePrefs();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const cat = params.get('cat') || '';
  const [all, setAll] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('name');
  const [stockOnly, setStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/categories')])
      .then(([p, c]) => { setAll(p); setCats(c); })
      .finally(() => setLoading(false));
  }, []);

  const setParam = (k, v) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    setParams(n);
    setPage(1);
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = all.filter((p) =>
      (!cat || String(p.category) === cat) &&
      (!stockOnly || p.stock > 0) &&
      (!s || [p.name, p.nameAr, p.active].some((x) => x.toLowerCase().includes(s))));
    if (sort === 'low') r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === 'high') r = [...r].sort((a, b) => b.price - a.price);
    else r = [...r].sort((a, b) => pick(a, 'name').localeCompare(pick(b, 'name')));
    return r;
  }, [all, q, cat, stockOnly, sort, pick]);

  const pages = Math.max(1, Math.ceil(list.length / PER));
  const shown = list.slice((page - 1) * PER, page * PER);

  return (
    <>
      <div className="row g-2 mb-3">
        <div className="col-md-5"><input className="form-control" value={q} onChange={(e) => setParam('q', e.target.value)} placeholder={t('search_ph')} /></div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={cat} onChange={(e) => setParam('cat', e.target.value)}>
            <option value="">{t('all')}</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {pick(c, 'name')}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('sort')}>
            <option value="name">{t('sort_name')}</option>
            <option value="low">{t('sort_low')}</option>
            <option value="high">{t('sort_high')}</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-center">
          <div className="form-check">
            <input id="so" type="checkbox" className="form-check-input" checked={stockOnly} onChange={(e) => { setStockOnly(e.target.checked); setPage(1); }} />
            <label htmlFor="so" className="form-check-label">{t('only_stock')}</label>
          </div>
        </div>
      </div>
      <p className="text-secondary">{list.length} {t('found')}</p>
      {loading ? <div className="spinner-border text-success" role="status" /> : shown.length === 0 ? <p>{t('no_results')}</p> : (
        <div className="row g-3">
          {shown.map((p) => <div className="col-6 col-md-4 col-lg-3" key={p.id}><ProductCard p={p} /></div>)}
        </div>
      )}
      {pages > 1 && (
        <nav className="mt-4"><ul className="pagination flex-wrap justify-content-center">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <li key={n} className={'page-item' + (n === page ? ' active' : '')}>
              <button className="page-link" onClick={() => { setPage(n); window.scrollTo(0, 0); }}>{n}</button>
            </li>
          ))}
        </ul></nav>
      )}
    </>
  );
}
