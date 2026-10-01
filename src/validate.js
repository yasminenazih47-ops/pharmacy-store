export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isPhone = (v) => /^01[0125]\d{8}$/.test(v);
export const isStrong = (v) => v.length >= 6 && /[A-Za-z]/.test(v) && /\d/.test(v);
export const toDataUrl = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});
