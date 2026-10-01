import { usePrefs } from '../context/Prefs.jsx';

export default function Field({ label, name, form, setForm, errors = {}, type = 'text', rows, children }) {
  const { t } = usePrefs();
  const cls = errors[name] ? ' is-invalid' : '';
  const common = { id: name, name, value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) };
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{t(label)}</label>
      {type === 'textarea' ? <textarea rows={rows || 4} className={'form-control' + cls} {...common} />
        : type === 'select' ? <select className={'form-select' + cls} {...common}>{children}</select>
        : <input type={type} className={'form-control' + cls} {...common} />}
      <div className="invalid-feedback">{errors[name] && t(errors[name])}</div>
    </div>
  );
}
