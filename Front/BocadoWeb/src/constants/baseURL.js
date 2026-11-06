// URL del backend: en Vercel se define con VITE_API_URL; en local usa localhost.
export const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");