export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

export const fetchJSON = async (url, opts) => {
  const r = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || "Request failed");
  return data;
};
