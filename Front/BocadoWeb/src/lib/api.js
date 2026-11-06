// URL del backend: en Vercel se define con VITE_API_URL; en local usa localhost.
export const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

export const EP = {
  crearCategoria: "/api/categorias/crearCategoria",
  listarCategorias: "/api/categorias/listarCategorias",
  obtenerCategoria: (id) => `/api/categorias/obtenerCategoria/${id}`,
  actualizarCategoria: (id) => `/api/categorias/actualizarCategoria/${id}`,
  eliminarCategoria: (id) => `/api/categorias/eliminarCategoria/${id}`,

  crearCliente: "/api/clientes/crearCliente",
  listarClientes: "/api/clientes/listarClientes",
  obtenerCliente: (id) => `/api/clientes/obtenerCliente/${id}`,

  crearUsuario: "/api/usuarios/crearUsuario",
  loginUsuario: "/api/usuarios/login",
  listarUsuarios: "/api/usuarios/listarUsuarios",
  obtenerUsuario: (id) => `/api/usuarios/obtenerUsuario/${id}`,
  actualizarUsuario: (id) => `/api/usuarios/actualizarUsuario/${id}`,
  eliminarUsuario: (id) => `/api/usuarios/eliminarUsuario/${id}`,

  crearPlato: "/api/platos/crearPlato",
  listarPlatos: "/api/platos/listarPlatos",
  obtenerPlato: (id) => `/api/platos/obtenerPlato/${id}`,
  actualizarPlato: (id) => `/api/platos/actualizarPlato/${id}`,
  desactivarPlato: (id) => `/api/platos/desactivarPlato/${id}`,
  activarPlato: (id) => `/api/platos/activarPlato/${id}`,
  eliminarPlato: (id) => `/api/platos/eliminarPlato/${id}`,

  crearMesa: "/api/mesas/crearMesa",
  listarMesas: "/api/mesas/listarMesas",
  actualizarMesa: (id) => `/api/mesas/actualizarMesa/${id}`,
  desactivarMesa: (id) => `/api/mesas/desactivarMesa/${id}`,
  activarMesa: (id) => `/api/mesas/activarMesa/${id}`,
  eliminarMesa: (id) => `/api/mesas/eliminarMesa/${id}`,

  /*Queda para realese post MVP
  obtenerPago: (id) => `/api/pagos/obtenerPago/${id}`,
  checkoutPago: (id) => `/api/pagos/${id}/checkout`,
  reenviarRecibo: (id) => `/api/pagos/${id}/reenviar-recibo`,
  qrPago: (id) => `/api/pagos/${id}/qr`,
  webhookPago: "/api/pagos/webhook",
  */

  listarTurnos: "/api/turnos/listarTurnos",
  crearTurno: "/api/turnos/crearTurno",
  obtenerTurno: (id) => `/api/turnos/obtenerTurno/${id}`,
  actualizarTurno: (id) => `/api/turnos/actualizarTurno/${id}`,
  cambiarEstadoTurno: (id) => `/api/turnos/cambiarEstado/${id}`,
  eliminarTurno: (id) => `/api/turnos/eliminarTurno/${id}`,
  agregarPlatoATurno: (turnoId, platoId) => `/api/turnos/${turnoId}/platos/${platoId}`,
  reemplazarPlatosTurno: (turnoId) => `/api/turnos/${turnoId}/platos`,
  asociarPagoATurno: (turnoId) => `/api/turnos/${turnoId}/pago`,
  cerrarPagoTurno: (turnoId) => `/api/turnos/${turnoId}/cerrar-pago`,
  pagarTurnoEnEfectivo: (turnoId) => `/api/turnos/${turnoId}/pago-efectivo`,
  registrarCobroManual: (turnoId) => `/api/turnos/${turnoId}/pago-manual`,

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
