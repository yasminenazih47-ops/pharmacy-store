import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import { useAuth } from '../context/Auth.jsx';
import { useCart } from '../context/Cart.jsx';
import Field from '../components/Field.jsx';
import { Img } from '../components/ProductCard.jsx';
import { isPhone } from '../validate.js';

export default function Cart() {
  const { t, pick } = usePrefs();
  const { user } = useAuth();
  const { items, setQty, remove, clear, total } = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '', rxId: '' });
  const [errors, setErrors] = useState({});
  const [rxs, setRxs] = useState([]);
  const [msg, setMsg] = useState('');
  const needRx = items.some((i) => i.rx);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: user.name, phone: user.phone || '', address: user.address || '' }));
    api.get(`/prescriptions?userId=${user.id}&status=approved`).then(setRxs).catch(() => {});
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 3) er.name = 'err_name';
    if (!isPhone(form.phone)) er.phone = 'err_phone';
    if (form.address.trim().length < 8) er.address = 'err_required';
    if (needRx && !form.rxId) er.rxId = 'err_required';
    setErrors(er);
    if (Object.keys(er).length) return;
    try {
      const fresh = await Promise.all(items.map((i) => api.get('/products/' + i.id)));
      const bad = fresh.find((p, k) => p.stock < items[k].qty);
      if (bad) return setMsg(`${t('stock_err')} ${pick(bad, 'name')}`);
      await api.post('/orders', {
        userId: user.id, customer: form.name, phone: form.phone, address: form.address, notes: form.notes,
        prescriptionId: needRx ? Number(form.rxId) : null, payment: 'cod', status: 'pending', total, createdAt: new Date().toISOString(),
        items: items.map(({ id, name, nameAr, price, qty }) => ({ id, name, nameAr, price, qty })),
      });
      await Promise.all(fresh.map((p, k) => api.patch('/products/' + p.id, { stock: p.stock - items[k].qty })));
      clear();
      nav('/profile', { state: { done: true } });
    } catch { setMsg('Server error'); }
  };

  if (!items.length) return <div className="text-center py-5"><p>{t('cart_empty')}</p><Link className="btn btn-brand" to="/products">{t('products')}</Link></div>;
  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <h1 className="h4 mb-3">{t('cart')}</h1>
        {items.map((i) => (
          <div key={i.id} className="d-flex gap-3 align-items-center border rounded p-2 mb-2">
            <Img src={i.image} alt="" className="thumb" />
            <div className="flex-grow-1">
              <div className="fw-semibold">{pick(i, 'name')} {i.rx && <span className="badge text-bg-warning">{t('rx_badge')}</span>}</div>
              <div className="small text-secondary">{i.price} {t('egp')}</div>
            </div>
            <input type="number" min="1" max={i.stock} className="form-control" style={{ width: 80 }} value={i.qty} onChange={(e) => setQty(i.id, Number(e.target.value) || 1)} aria-label={t('qty')} />
            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(i.id)}>{t('remove')}</button>
          </div>
        ))}
        <p className="h5 mt-3">{t('total')}: {total} {t('egp')}</p>
      </div>
      <div className="col-lg-5">
        <h2 className="h5 mb-3">{t('checkout')}</h2>
        {!user ? <div className="alert alert-info">{t('login_to_checkout')} <Link to="/login" state={{ from: '/cart' }}>{t('login')}</Link></div> : (
          <form onSubmit={submit} noValidate>
            <Field label="full_name" name="name" form={form} setForm={setForm} errors={errors} />
            <Field label="phone" name="phone" form={form} setForm={setForm} errors={errors} />
            <Field label="address" name="address" type="textarea" rows={2} form={form} setForm={setForm} errors={errors} />
            <Field label="notes" name="notes" form={form} setForm={setForm} errors={errors} />
            {needRx && (
              <>
                <p className="small">{t('rx_required')}</p>
                {rxs.length ? (
                  <Field label="choose_rx" name="rxId" type="select" form={form} setForm={setForm} errors={errors}>
                    <option value="">—</option>
                    {rxs.map((r) => <option key={r.id} value={r.id}>#{r.id} · {new Date(r.createdAt).toLocaleDateString()}</option>)}
                  </Field>
                ) : <div className="alert alert-warning">{t('no_rx_yet')} <Link to="/upload">{t('upload')}</Link></div>}
              </>
            )}
            <p className="text-secondary small">{t('payment')}: {t('cod')}</p>
            {msg && <div className="alert alert-danger">{msg}</div>}
            <button className="btn btn-brand w-100" disabled={needRx && !rxs.length}>{t('place_order')}</button>
          </form>
        )}
      </div>
    </div>
  );
}
