import { API } from './config.js';
async function req(path, opts = {}) {
  const r = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!r.ok) throw new Error('API ' + r.status);
  return r.status === 204 ? null : r.json();
}
export const api = {
  get: (p) => req(p),
  post: (p, b) => req(p, { method: 'POST', body: JSON.stringify(b) }),
  patch: (p, b) => req(p, { method: 'PATCH', body: JSON.stringify(b) }),
  del: (p) => req(p, { method: 'DELETE' }),
};
