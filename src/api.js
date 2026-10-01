import { API } from './config.js';
import seed from '../server/db.json';

// ---------------------------------------------------------------
// وضع الإنتاج (Netlify): مفيش سيرفر، فالداتا بتتخزن في المتصفح (localStorage)
// وضع التطوير (npm start): بيكلّم json-server العادي على localhost:3001
// ---------------------------------------------------------------
const KEY = 'pharmacy-db-v1';

function loadDB() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const fresh = JSON.parse(JSON.stringify(seed));
  try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) { /* ignore */ }
  return fresh;
}
function saveDB(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignore */ }
}

const parseVal = (v) => v;
const same = (a, b) => String(a) === String(b);

function mockReq(path, opts = {}) {
  const method = (opts.method || 'GET').toUpperCase();
  const body = opts.body ? JSON.parse(opts.body) : null;
  const [pathname, qs = ''] = path.split('?');
  const parts = pathname.split('/').filter(Boolean);
  const col = parts[0];
  const id = parts[1];
  const db = loadDB();
  if (!Array.isArray(db[col])) return Promise.reject(new Error('API 404'));
  const list = db[col];

  // GET /col/:id
  if (method === 'GET' && id !== undefined) {
    const item = list.find((x) => same(x.id, id));
    return item ? Promise.resolve({ ...item }) : Promise.reject(new Error('API 404'));
  }

  // GET /col?filters&_sort&_order&q&_page&_limit
  if (method === 'GET') {
    const params = new URLSearchParams(qs);
    let out = [...list];
    const special = ['_sort', '_order', '_page', '_limit', 'q'];
    for (const [k, v] of params.entries()) {
      if (special.includes(k)) continue;
      out = out.filter((x) => same(x[k], parseVal(v)));
    }
    const q = params.get('q');
    if (q) {
      const s = q.toLowerCase();
      out = out.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
    }
    const sort = params.get('_sort');
    if (sort) {
      const dir = params.get('_order') === 'desc' ? -1 : 1;
      out.sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0) * dir);
    }
    const page = parseInt(params.get('_page'), 10);
    const limit = parseInt(params.get('_limit'), 10);
    if (page && limit) out = out.slice((page - 1) * limit, page * limit);
    return Promise.resolve(out.map((x) => ({ ...x })));
  }

  // POST /col
  if (method === 'POST') {
    const maxId = list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0);
    const item = { ...body, id: maxId + 1 };
    list.push(item);
    saveDB(db);
    return Promise.resolve({ ...item });
  }

  // PATCH /col/:id
  if (method === 'PATCH') {
    const i = list.findIndex((x) => same(x.id, id));
    if (i < 0) return Promise.reject(new Error('API 404'));
    list[i] = { ...list[i], ...body, id: list[i].id };
    saveDB(db);
    return Promise.resolve({ ...list[i] });
  }

  // PUT /col/:id
  if (method === 'PUT') {
    const i = list.findIndex((x) => same(x.id, id));
    if (i < 0) return Promise.reject(new Error('API 404'));
    list[i] = { ...body, id: list[i].id };
    saveDB(db);
    return Promise.resolve({ ...list[i] });
  }

  // DELETE /col/:id
  if (method === 'DELETE') {
    const i = list.findIndex((x) => same(x.id, id));
    if (i < 0) return Promise.reject(new Error('API 404'));
    list.splice(i, 1);
    saveDB(db);
    return Promise.resolve(null);
  }

  return Promise.reject(new Error('API 405'));
}

async function realReq(path, opts = {}) {
  const r = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!r.ok) throw new Error('API ' + r.status);
  return r.status === 204 ? null : r.json();
}

const req = import.meta.env.PROD ? mockReq : realReq;

export const api = {
  get: (p) => req(p),
  post: (p, b) => req(p, { method: 'POST', body: JSON.stringify(b) }),
  patch: (p, b) => req(p, { method: 'PATCH', body: JSON.stringify(b) }),
  del: (p) => req(p, { method: 'DELETE' }),
};
