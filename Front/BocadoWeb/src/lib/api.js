// URL del backend: en Vercel se define con VITE_API_URL; en local usa localhost.
export const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

export const EP = {
  listarCategorias: "/api/categorias/listarCategorias",
  listarPlatos: "/api/platos/listarPlatos",
  listarTurnos: "/api/turnos/listarTurnos",
  crearTurno: "/api/turnos/crearTurno",
  crearCliente: "/api/clientes/crearCliente",
  reporteDiario: "/api/reportes/dia",
};

export const api = async (path, opts) => {
  const r = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) {
    let msg = `Error ${r.status}`;
    try {
      const j = await r.json();
      msg = j.mensaje || j.message || j.error || msg;
    } catch {
      // La respuesta puede no incluir JSON.
    }
    throw new Error(msg);
  }
  return r.status === 204 ? null : r.json();
};
