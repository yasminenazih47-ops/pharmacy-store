import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { const u = JSON.parse(localStorage.getItem('shifa_user') || 'null'); return u && u.email && u.role ? u : null; } catch { return null; } });
  const save = (u) => {
    const { password, ...safe } = u;
    localStorage.setItem('shifa_user', JSON.stringify(safe));
    setUser(safe);
  };
  const login = async (email, password) => {
    const r = await api.get(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    if (!r.length) throw new Error('invalid');
    save(r[0]);
  };
  const register = async (data) => {
    const ex = await api.get(`/users?email=${encodeURIComponent(data.email)}`);
    if (ex.length) throw new Error('exists');
    save(await api.post('/users', { ...data, role: 'user' }));
  };
  const update = async (patch) => save(await api.patch('/users/' + user.id, patch));
  const logout = () => {
    localStorage.removeItem('shifa_user');
    setUser(null);
  };
  return <Ctx.Provider value={{ user, login, register, update, logout }}>{children}</Ctx.Provider>;
}
