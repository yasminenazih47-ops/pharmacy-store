import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import Field from '../components/Field.jsx';
import { Img } from '../components/ProductCard.jsx';
import { toDataUrl } from '../validate.js';
import { statusColor } from './Profile.jsx';

const TABS = ['stats', 'products', 'orders', 'rx', 'messages'];
const tabKey = { stats: 'd_stats', products: 'd_products', orders: 'd_orders', rx: 'd_rx', messages: 'd_messages' };

export default function Dashboard() {
  const { t } = usePrefs();
  const [tab, setTab] = useState('stats');
  return (
    <>
      <ul className="nav nav-pills mb-4 flex-wrap">
        {TABS.map((k) => (
          <li className="nav-item" key={k}>
            <button className={'nav-link' + (tab === k ? ' active' : '')} style={tab === k ? { background: 'var(--brand)' } : {}} onClick={() => setTab(k)}>{t(tabKey[k])}</button>
          </li>
        ))}
      </ul>
      {tab === 'stats' && <Stats />}
      {tab === 'products' && <ProductsAdmin />}
      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'rx' && <RxAdmin />}
      {tab === 'messages' && <MessagesAdmin />}
    </>
  );
}

function Stats() {
  const { t } = usePrefs();
  const [s, setS] = useState(null);
  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/orders'), api.get('/prescriptions')]).then(([p, o, r]) => setS({
      products: p.length,
      low: p.filter((x) => x.stock < 10).length,
      pending: o.filter((x) => x.status === 'pending').length,
      revenue: o.filter((x) => x.status !== 'cancelled').reduce((a, x) => a + x.total, 0),
      rx: r.filter((x) => x.status === 'pending').length,
    }));
  }, []);
  if (!s) return <div className="spinner-border text-success" />;
  const cards = [['stat_products', s.products], ['stat_low', s.low], ['stat_pending_orders', s.pending], ['stat_revenue', s.revenue], ['stat_pending_rx', s.rx]];
  return (
    <div className="row g-3">
      {cards.map(([k, v]) => (
        <div className="col-6 col-md-4" key={k}><div className="border rounded p-3"><div className="display-6 fw-bold">{v}</div><div className="text-secondary">{t(k)}</div></div></div>
      ))}
    </div>
  );
}

const EMPTY = { name: '', nameAr: '', category: '', price: '', stock: '', rx: false, active: '', desc: '', descAr: '', image: '/img/default.svg' };

function ProductsAdmin() {
  const { t, pick } = usePrefs();
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const load = () => api.get('/products').then(setList);
  useEffect(() => { load(); api.get('/categories').then(setCats); }, []);

  const save = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'err_required';
    if (!form.nameAr.trim()) er.nameAr = 'err_required';
    if (!form.category) er.category = 'err_required';
    if (form.price === '' || Number(form.price) <= 0) er.price = 'err_num';
    if (form.stock === '' || Number(form.stock) < 0) er.stock = 'err_num';
    setErrors(er);
    if (Object.keys(er).length) return;
    const body = { ...form, category: Number(form.category), price: Number(form.price), stock: Number(form.stock) };
    if (form.id) await api.patch('/products/' + form.id, body);
    else await api.post('/products', { ...body, featured: false });
    setForm(null); load();
  };
  const del = async (id) => { if (window.confirm(t('confirm_delete'))) { await api.del('/products/' + id); load(); } };
  const onFile = async (e) => { const f = e.target.files[0]; if (f && f.size < 1.5e6) setForm({ ...form, image: await toDataUrl(f) }); };

  const s = q.toLowerCase();
  const rows = list.filter((p) => !s || p.name.toLowerCase().includes(s) || p.nameAr.includes(s));
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const catName = (id) => { const c = cats.find((x) => x.id === id); return c ? pick(c, 'name') : ''; };

  if (form) return (
    <form onSubmit={save} noValidate style={{ maxWidth: 640 }}>
      <Field label="name_en" name="name" form={form} setForm={setForm} errors={errors} />
      <Field label="name_ar" name="nameAr" form={form} setForm={setForm} errors={errors} />
      <Field label="category" name="category" type="select" form={form} setForm={setForm} errors={errors}>
        <option value="">—</option>{cats.map((c) => <option key={c.id} value={c.id}>{pick(c, 'name')}</option>)}
      </Field>
      <div className="row"><div className="col"><Field label="price" name="price" type="number" form={form} setForm={setForm} errors={errors} /></div>
        <div className="col"><Field label="stock" name="stock" type="number" form={form} setForm={setForm} errors={errors} /></div></div>
      <Field label="active_ing" name="active" form={form} setForm={setForm} errors={errors} />
      <Field label="desc_en" name="desc" type="textarea" rows={2} form={form} setForm={setForm} errors={errors} />
      <Field label="desc_ar" name="descAr" type="textarea" rows={2} form={form} setForm={setForm} errors={errors} />
      <div className="form-check mb-3">
        <input id="rx" type="checkbox" className="form-check-input" checked={form.rx} onChange={(e) => setForm({ ...form, rx: e.target.checked })} />
        <label htmlFor="rx" className="form-check-label">{t('needs_rx')}</label>
      </div>
      <div className="mb-3 d-flex gap-3 align-items-center">
        <Img src={form.image} alt="" className="thumb" />
        <input type="file" accept="image/*" className="form-control" onChange={onFile} aria-label={t('image')} />
      </div>
      <button className="btn btn-brand me-2">{t('save')}</button>
      <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>{t('cancel')}</button>
    </form>
  );
  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder={t('search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <button className="btn btn-brand text-nowrap" onClick={() => { setErrors({}); setForm(EMPTY); }}>+ {t('add_product')}</button>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th /><th>{t('name_en')}</th><th>{t('category')}</th><th>{t('price')}</th><th>{t('stock')}</th><th>{t('actions')}</th></tr></thead>
          <tbody>
            {rows.slice((page - 1) * 10, page * 10).map((p) => (
              <tr key={p.id}>
                <td><Img src={p.image} alt="" className="thumb" /></td>
                <td>{pick(p, 'name')} {p.rx && <span className="badge text-bg-warning">{t('rx_badge')}</span>}</td>
                <td>{catName(p.category)}</td><td>{p.price}</td>
                <td className={p.stock < 10 ? 'text-danger fw-bold' : ''}>{p.stock}</td>
                <td className="text-nowrap">
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setErrors({}); setForm({ ...p }); }}>{t('edit')}</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => del(p.id)}>{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-center gap-2 align-items-center">
        <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        <span>{page} / {pages}</span>
        <button className="btn btn-sm btn-outline-secondary" disabled={page === pages} onClick={() => setPage(page + 1)}>›</button>
      </div>
    </>
  );
}

function OrdersAdmin() {
  const { t, pick } = usePrefs();
  const [list, setList] = useState([]);
  const load = () => api.get('/orders?_sort=id&_order=desc').then(setList);
  useEffect(() => { load(); }, []);
  const setStatus = async (o, status) => { await api.patch('/orders/' + o.id, { status }); load(); };
  const del = async (id) => { if (window.confirm(t('confirm_delete'))) { await api.del('/orders/' + id); load(); } };
  if (!list.length) return <p className="text-secondary">{t('no_data')}</p>;
  return list.map((o) => (
    <div key={o.id} className="border rounded p-3 mb-2">
      <div className="d-flex flex-wrap justify-content-between gap-2">
        <strong>{t('order_no')} #{o.id} · {o.customer} · {o.phone}</strong>
        <div className="d-flex gap-2">
          <select className={`form-select form-select-sm border-${statusColor[o.status]}`} value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
            {Object.keys(statusColor).map((s) => <option key={s} value={s}>{t('st_' + s)}</option>)}
          </select>
          <button className="btn btn-sm btn-outline-danger" onClick={() => del(o.id)}>{t('delete')}</button>
        </div>
      </div>
      <div className="small text-secondary">{o.address} · {new Date(o.createdAt).toLocaleString()}{o.prescriptionId ? ` · Rx #${o.prescriptionId}` : ''}</div>
      <div>{o.items.map((i) => `${pick(i, 'name')} × ${i.qty}`).join('، ')}</div>
      <strong>{t('total')}: {o.total} {t('egp')}</strong>
    </div>
  ));
}

function RxAdmin() {
  const { t } = usePrefs();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(null);
  const load = () => api.get('/prescriptions?_sort=id&_order=desc').then(setList);
  useEffect(() => { load(); }, []);
  const setStatus = async (r, status) => { await api.patch('/prescriptions/' + r.id, { status }); load(); };
  const del = async (id) => { if (window.confirm(t('confirm_delete'))) { await api.del('/prescriptions/' + id); load(); } };
  if (!list.length) return <p className="text-secondary">{t('no_data')}</p>;
  return list.map((r) => (
    <div key={r.id} className="border rounded p-3 mb-2">
      <div className="d-flex flex-wrap gap-3 align-items-center">
        <img src={r.image} alt="" className="thumb" style={{ cursor: 'pointer' }} onClick={() => setOpen(open === r.id ? null : r.id)} />
        <div className="flex-grow-1">#{r.id} · {r.userName} · {new Date(r.createdAt).toLocaleString()}<div className="small text-secondary">{r.note}</div></div>
        <span className="badge text-bg-secondary">{t('st_' + r.status)}</span>
        <button className="btn btn-sm btn-success" onClick={() => setStatus(r, 'approved')}>✓</button>
        <button className="btn btn-sm btn-warning" onClick={() => setStatus(r, 'rejected')}>✕</button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => del(r.id)}>{t('delete')}</button>
      </div>
      {open === r.id && <img src={r.image} alt="" className="rx-img mt-3" />}
    </div>
  ));
}

function MessagesAdmin() {
  const { t } = usePrefs();
  const [list, setList] = useState([]);
  const load = () => api.get('/messages?_sort=id&_order=desc').then(setList);
  useEffect(() => { load(); }, []);
  const del = async (id) => { await api.del('/messages/' + id); load(); };
  if (!list.length) return <p className="text-secondary">{t('no_data')}</p>;
  return list.map((m) => (
    <div key={m.id} className="border rounded p-3 mb-2 d-flex justify-content-between gap-3">
      <div><strong>{m.name}</strong> · <a href={`mailto:${m.email}`}>{m.email}</a><div>{m.message}</div></div>
      <button className="btn btn-sm btn-outline-danger align-self-start" onClick={() => del(m.id)}>{t('delete')}</button>
    </div>
  ));
}
