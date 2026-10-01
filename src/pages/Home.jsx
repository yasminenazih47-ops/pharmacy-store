import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { WHATSAPP } from '../config.js';

export default function Home() {
  const { t, pick } = usePrefs();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [feat, setFeat] = useState([]);
  useEffect(() => {
    api.get('/categories').then(setCats).catch(() => {});
    api.get('/products?featured=true').then(setFeat).catch(() => {});
  }, []);
  const go = (e) => { e.preventDefault(); nav('/products?q=' + encodeURIComponent(q)); };
  return (
    <>
      <section className="rx-label mb-5">
        <h1 className="display-5">{t('hero_title')}</h1>
        <p className="lead">{t('hero_sub')}</p>
        <form className="input-group input-group-lg mb-3" onSubmit={go}>
          <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_ph')} aria-label={t('search')} />
          <button className="btn btn-brand">{t('search')}</button>
        </form>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/products" className="btn btn-outline-secondary">{t('shop_now')}</Link>
          <Link to="/upload" className="btn btn-outline-secondary">{t('upload_rx')}</Link>
          <a className="btn btn-success" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">{t('wa_cta')}</a>
        </div>
      </section>

      <h2 className="h4 mb-3">{t('cats_title')}</h2>
      <div className="row g-2 mb-5">
        {cats.map((c) => (
          <div className="col-6 col-md-4 col-lg-3" key={c.id}>
            <Link className="cat-tile" to={`/products?cat=${c.id}`}><span>{c.icon}</span><span>{pick(c, 'name')}</span></Link>
          </div>
        ))}
      </div>

      <h2 className="h4 mb-3">{t('featured_title')}</h2>
      <div className="row g-3 mb-5">
        {feat.map((p) => <div className="col-6 col-md-4 col-lg-3" key={p.id}><ProductCard p={p} /></div>)}
      </div>

      <h2 className="h4 mb-3">{t('how_title')}</h2>
      <div className="row g-3">
        {[1, 2, 3].map((n) => (
          <div className="col-md-4" key={n}>
            <div className="p-3 border rounded h-100">
              <h3 className="h6">{t(`how${n}_t`)}</h3>
              <p className="mb-0 text-secondary">{t(`how${n}_d`)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
