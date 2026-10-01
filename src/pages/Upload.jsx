import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import { useAuth } from '../context/Auth.jsx';
import { toDataUrl } from '../validate.js';

const badge = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function Upload() {
  const { t } = usePrefs();
  const { user } = useAuth();
  const [img, setImg] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);
  const [list, setList] = useState([]);
  const load = () => api.get(`/prescriptions?userId=${user.id}&_sort=id&_order=desc`).then(setList);
  useEffect(() => { load(); }, []);

  const pick = async (e) => {
    const f = e.target.files[0];
    setMsg(null);
    if (!f) return setImg('');
    if (!f.type.startsWith('image/') || f.size > 2 * 1024 * 1024) { setImg(''); e.target.value = ''; return setMsg({ ok: false, text: t('file_err') }); }
    setImg(await toDataUrl(f));
  };
  const send = async (e) => {
    e.preventDefault();
    if (!img) return setMsg({ ok: false, text: t('file_err') });
    await api.post('/prescriptions', { userId: user.id, userName: user.name, image: img, note, status: 'pending', createdAt: new Date().toISOString() });
    setImg(''); setNote(''); setMsg({ ok: true, text: t('rx_sent') });
    e.target.reset(); load();
  };
  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <h1 className="h4">{t('upload_title')}</h1>
        <p className="text-secondary">{t('upload_sub')}</p>
        <form onSubmit={send}>
          <div className="mb-3">
            <label className="form-label" htmlFor="file">{t('choose_file')}</label>
            <input id="file" type="file" accept="image/*" className="form-control" onChange={pick} />
          </div>
          {img && <img src={img} alt={t('preview')} className="rx-img mb-3" />}
          <div className="mb-3">
            <label className="form-label" htmlFor="note">{t('note_opt')}</label>
            <textarea id="note" className="form-control" rows="2" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {msg && <div className={'alert alert-' + (msg.ok ? 'success' : 'danger')}>{msg.text}</div>}
          <button className="btn btn-brand">{t('submit_rx')}</button>
        </form>
      </div>
      <div className="col-lg-7">
        <h2 className="h5">{t('my_rx')}</h2>
        {list.length === 0 ? <p className="text-secondary">{t('no_data')}</p> : list.map((r) => (
          <div key={r.id} className="d-flex gap-3 align-items-center border rounded p-2 mb-2">
            <img src={r.image} alt="" className="thumb" />
            <div className="flex-grow-1">#{r.id} · {new Date(r.createdAt).toLocaleString()}<div className="small text-secondary">{r.note}</div></div>
            <span className={`badge text-bg-${badge[r.status]}`}>{t('st_' + r.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
