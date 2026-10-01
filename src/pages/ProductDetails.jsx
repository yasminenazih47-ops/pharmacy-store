import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import { useCart } from '../context/Cart.jsx';
import { Img } from '../components/ProductCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { WHATSAPP } from '../config.js';

export default function ProductDetails() {
  const { id } = useParams();
  const { t, pick } = usePrefs();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [cat, setCat] = useState(null);
  const [rel, setRel] = useState([]);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setP(null); setQty(1); setErr(false);
    api.get('/products/' + id).then(async (x) => {
      setP(x);
      setCat(await api.get('/categories/' + x.category));
      const r = await api.get(`/products?category=${x.category}`);
      setRel(r.filter((y) => y.id !== x.id).slice(0, 4));
    }).catch(() => setErr(true));
    window.scrollTo(0, 0);
  }, [id]);

  if (err) return <p>{t('not_found')}</p>;
  if (!p) return <div className="spinner-border text-success" role="status" />;
  const msg = `${t('wa_hello')} ${pick(p, 'name')} x${qty}`;
  return (
    <>
      <Link to="/products" className="d-inline-block mb-3">← {t('products')}</Link>
      <div className="row g-4">
        <div className="col-md-5"><Img src={p.image} alt={pick(p, 'name')} className="img-fluid rounded border" /></div>
        <div className="col-md-7">
          <h1 className="h3">{pick(p, 'name')}</h1>
          <p className="text-secondary mb-1">{t('category')}: {cat && pick(cat, 'name')}</p>
          <p className="text-secondary">{t('active_ing')}: {p.active}</p>
          <p>{pick(p, 'desc')}</p>
          <p className="h4">{p.price} {t('egp')}</p>
          <p>{p.stock > 0 ? <span className="badge text-bg-success">{t('in_stock')}</span> : <span className="badge text-bg-secondary">{t('out_of_stock')}</span>}
            {p.rx && <span className="badge text-bg-warning ms-2">{t('rx_badge')}</span>}</p>
          {p.rx && <div className="alert alert-warning">{t('rx_note')}</div>}
          <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
            <div>
              <label className="form-label small" htmlFor="qty">{t('qty')}</label>
              <input id="qty" type="number" min="1" max={p.stock} className="form-control" style={{ width: 90 }} value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, p.stock || 1)))} />
            </div>
            <button className="btn btn-brand" disabled={p.stock === 0} onClick={() => add(p, qty)}>{t('add_to_cart')}</button>
            <a className="btn btn-success" target="_blank" rel="noreferrer" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`}>{t('order_wa')}</a>
          </div>
          <p className="small text-secondary">{t('disclaimer')}</p>
        </div>
      </div>
      {rel.length > 0 && (
        <>
          <h2 className="h5 mt-5 mb-3">{t('related')}</h2>
          <div className="row g-3">{rel.map((r) => <div className="col-6 col-md-3" key={r.id}><ProductCard p={r} /></div>)}</div>
        </>
      )}
    </>
  );
}
