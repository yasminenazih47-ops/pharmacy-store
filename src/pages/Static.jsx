import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { usePrefs } from '../context/Prefs.jsx';
import Field from '../components/Field.jsx';
import { isEmail } from '../validate.js';
import { TEAM } from '../config.js';

export function About() {
  const { t } = usePrefs();
  const tools = ['React 18', 'React Router', 'Bootstrap 5', 'Vite', 'json-server', 'Context API', 'GitHub'];
  return (
    <div style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-3">{t('about_title')}</h1>
      <p>{t('about_p')}</p>
      <h2 className="h5 mt-4">{t('features_title')}</h2>
      <ul>{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <li key={n}>{t('feat' + n)}</li>)}</ul>
      <h2 className="h5 mt-4">{t('tools_title')}</h2>
      <div className="d-flex flex-wrap gap-2">{tools.map((x) => <span key={x} className="badge text-bg-light border">{x}</span>)}</div>
      <h2 className="h5 mt-4">{t('team_title')}</h2>
      <ul>{TEAM.map((name) => <li key={name}><strong>{name}</strong></li>)}</ul>
    </div>
  );
}

export function Contact() {
  const { t } = usePrefs();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 3) er.name = 'err_name';
    if (!isEmail(form.email)) er.email = 'err_email';
    if (form.message.trim().length < 10) er.message = 'err_msg';
    setErrors(er);
    setOk(false);
    if (Object.keys(er).length) return;
    await api.post('/messages', { ...form, createdAt: new Date().toISOString() });
    setForm({ name: '', email: '', message: '' });
    setOk(true);
  };
  return (
    <div className="mx-auto" style={{ maxWidth: 560 }}>
      <h1 className="h4">{t('contact_title')}</h1>
      <p className="text-secondary">{t('contact_sub')}</p>
      <form onSubmit={submit} noValidate>
        <Field label="full_name" name="name" form={form} setForm={setForm} errors={errors} />
        <Field label="email" name="email" type="email" form={form} setForm={setForm} errors={errors} />
        <Field label="message" name="message" type="textarea" form={form} setForm={setForm} errors={errors} />
        {ok && <div className="alert alert-success">{t('sent_ok')}</div>}
        <button className="btn btn-brand">{t('send')}</button>
      </form>
    </div>
  );
}

export function NotFound() {
  const { t } = usePrefs();
  return <div className="text-center py-5"><p>{t('not_found')}</p><Link to="/" className="btn btn-brand">{t('home')}</Link></div>;
}
