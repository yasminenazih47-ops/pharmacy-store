import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePrefs } from '../context/Prefs.jsx';
import { useAuth } from '../context/Auth.jsx';
import Field from '../components/Field.jsx';
import { isEmail, isPhone, isStrong } from '../validate.js';

export function Login() {
  const { t } = usePrefs();
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!isEmail(form.email)) er.email = 'err_email';
    if (!form.password) er.password = 'err_required';
    setErrors(er);
    if (Object.keys(er).length) return;
    try { await login(form.email, form.password); nav(loc.state?.from || '/'); } catch { setMsg(t('err_login')); }
  };
  return (
    <div className="mx-auto" style={{ maxWidth: 420 }}>
      <h1 className="h4 mb-3">{t('login')}</h1>
      <form onSubmit={submit} noValidate>
        <Field label="email" name="email" type="email" form={form} setForm={setForm} errors={errors} />
        <Field label="password" name="password" type="password" form={form} setForm={setForm} errors={errors} />
        {msg && <div className="alert alert-danger">{msg}</div>}
        <button className="btn btn-brand w-100">{t('login')}</button>
      </form>
      <p className="mt-3">{t('no_account')} <Link to="/register">{t('register')}</Link></p>
    </div>
  );
}

export function Register() {
  const { t } = usePrefs();
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 3) er.name = 'err_name';
    if (!isEmail(form.email)) er.email = 'err_email';
    if (!isPhone(form.phone)) er.phone = 'err_phone';
    if (!isStrong(form.password)) er.password = 'err_pass';
    if (form.confirm !== form.password) er.confirm = 'err_match';
    setErrors(er);
    if (Object.keys(er).length) return;
    try {
      const { confirm, ...data } = form;
      await register({ ...data, address: '' });
      nav('/');
    } catch (x) { setMsg(x.message === 'exists' ? t('err_exists') : 'Server error'); }
  };
  return (
    <div className="mx-auto" style={{ maxWidth: 460 }}>
      <h1 className="h4 mb-3">{t('register')}</h1>
      <form onSubmit={submit} noValidate>
        <Field label="full_name" name="name" form={form} setForm={setForm} errors={errors} />
        <Field label="email" name="email" type="email" form={form} setForm={setForm} errors={errors} />
        <Field label="phone" name="phone" form={form} setForm={setForm} errors={errors} />
        <Field label="password" name="password" type="password" form={form} setForm={setForm} errors={errors} />
        <Field label="confirm_password" name="confirm" type="password" form={form} setForm={setForm} errors={errors} />
        {msg && <div className="alert alert-danger">{msg}</div>}
        <button className="btn btn-brand w-100">{t('register')}</button>
      </form>
      <p className="mt-3">{t('have_account')} <Link to="/login">{t('login')}</Link></p>
    </div>
  );
}
