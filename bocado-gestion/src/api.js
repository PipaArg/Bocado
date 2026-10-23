const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

export const EP = {
  listarCategorias: "/api/categorias/listarCategorias",
  listarPlatos: "/api/platos/listarPlatos",
  listarTurnos: "/api/turnos/listarTurnos",
  reporteDiario: "/api/reportes/dia",
};

export async function api(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // La respuesta puede no incluir JSON.
    }
    throw new Error(body?.mensaje || body?.message || `Error ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}
