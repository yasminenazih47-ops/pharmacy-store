import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import { useAuth } from '../context/Auth.jsx';
import Field from '../components/Field.jsx';
import { isPhone } from '../validate.js';

export const statusColor = { pending: 'warning', preparing: 'info', delivering: 'primary', delivered: 'success', cancelled: 'secondary' };

export default function Profile() {
  const { t, pick } = usePrefs();
  const { user, update } = useAuth();
  const loc = useLocation();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get(`/orders?userId=${user.id}&_sort=id&_order=desc`).then(setOrders); }, []);

  const save = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 3) er.name = 'err_name';
    if (!isPhone(form.phone)) er.phone = 'err_phone';
    setErrors(er);
    if (Object.keys(er).length) return;
    await update(form);
    setSaved(true);
  };
  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <h1 className="h4">{t('profile_title')}</h1>
        <p className="text-secondary">{user.email}</p>
        <form onSubmit={save} noValidate>
          <Field label="full_name" name="name" form={form} setForm={setForm} errors={errors} />
          <Field label="phone" name="phone" form={form} setForm={setForm} errors={errors} />
          <Field label="address" name="address" type="textarea" rows={2} form={form} setForm={setForm} errors={errors} />
          {saved && <div className="alert alert-success">{t('saved')}</div>}
          <button className="btn btn-brand">{t('save')}</button>
        </form>
      </div>
      <div className="col-lg-8">
        <h2 className="h5">{t('my_orders')}</h2>
        {loc.state?.done && <div className="alert alert-success">{t('order_done')}</div>}
        {orders.length === 0 ? <p className="text-secondary">{t('no_orders')}</p> : orders.map((o) => (
          <div key={o.id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between">
              <strong>{t('order_no')} #{o.id}</strong>
              <span className={`badge text-bg-${statusColor[o.status]}`}>{t('st_' + o.status)}</span>
            </div>
            <div className="small text-secondary">{new Date(o.createdAt).toLocaleString()}</div>
            <ul className="mb-1 mt-2">{o.items.map((i) => <li key={i.id}>{pick(i, 'name')} × {i.qty}</li>)}</ul>
            <strong>{t('total')}: {o.total} {t('egp')}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
