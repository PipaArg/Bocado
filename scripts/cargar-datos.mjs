// Carga datos de ejemplo en la API de Bocado: clientes, platos y reservas con platos.
//
// Uso (con la API levantada):
//   node scripts/cargar-datos.mjs
//   node scripts/cargar-datos.mjs --url=https://tu-url.ngrok-free.app
//   node scripts/cargar-datos.mjs --email=tu@mail.com   (suma una reserva de hoy a tu nombre, para probar el recibo)
//
// Se puede correr varias veces: no duplica clientes (por email), platos (por nombre)
// ni reservas (por cliente + fecha + hora). Solo crea lo que falta.
// Requiere Node 18 o mas nuevo (usa fetch, que ya viene incluido).

const arg = process.argv.find((a) => a.startsWith("--url="));
const BASE = (arg ? arg.slice(6) : "http://localhost:8080").replace(/\/$/, "");
const emailArg = process.argv.find((a) => a.startsWith("--email="));
const EMAIL_PRUEBA = emailArg ? emailArg.slice(8).trim().toLowerCase() : "";

/* ───────── Datos de ejemplo ───────── */
const CLIENTES = [
  { nombre: "Juan", apellido: "Perez", email: "juan.perez@mail.com", telefono: "1122334455" },
  { nombre: "Ana", apellido: "Gomez", email: "ana.gomez@mail.com", telefono: "1133445566" },
  { nombre: "Lucia", apellido: "Fernandez", email: "lucia.fernandez@mail.com", telefono: "1144556677" },
  { nombre: "Martin", apellido: "Rodriguez", email: "martin.rodriguez@mail.com", telefono: "1155667788" },
  { nombre: "Sofia", apellido: "Lopez", email: "sofia.lopez@mail.com", telefono: "1166778899" },
];

const PLATOS = [
  // Plato unico (nombre, descripcion, precio): POST /api/platos/crearPlato
  { nombre: "Hamburguesa clásica", descripcion: "Carne, queso y pan de papa", precio: 8000 },
  { nombre: "Hamburguesa doble", descripcion: "Doble carne, cheddar y panceta", precio: 11500 },
  { nombre: "Hamburguesa veggie", descripcion: "Medallón de lentejas y vegetales", precio: 9000 },
  { nombre: "Pizza muzzarella", descripcion: "Muzzarella y salsa de tomate", precio: 12000 },
  { nombre: "Pizza napolitana", descripcion: "Muzzarella, tomate fresco y ajo", precio: 13500 },
  { nombre: "Pizza fugazzeta", descripcion: "Cebolla y muzzarella", precio: 14000 },
  { nombre: "Milanesa napolitana", descripcion: "Con jamón, queso y salsa", precio: 9500 },
  { nombre: "Milanesa de pollo", descripcion: "Pechuga empanada", precio: 8500 },
  { nombre: "Milanesa a caballo", descripcion: "Con dos huevos fritos", precio: 10000 },
];

// dia: 0 = hoy, 1 = mañana, 2 = pasado mañana. platos: [nombre, cantidad]
const TURNOS = [
  { cliente: 0, dia: 0, hora: "13:00", comensales: 2, platos: [["Hamburguesa clásica", 2], ["Milanesa napolitana", 1]] },
  { cliente: 1, dia: 0, hora: "21:00", comensales: 4, platos: [["Pizza muzzarella", 2], ["Pizza napolitana", 1], ["Milanesa de pollo", 1]] },
  { cliente: 2, dia: 0, hora: "21:30", comensales: 3, platos: [["Hamburguesa doble", 1], ["Hamburguesa veggie", 1], ["Pizza fugazzeta", 1]] },
  { cliente: 3, dia: 1, hora: "20:30", comensales: 2, platos: [["Milanesa a caballo", 2]] },
  { cliente: 4, dia: 1, hora: "13:30", comensales: 6, platos: [["Pizza muzzarella", 3], ["Hamburguesa clásica", 2], ["Milanesa de pollo", 1]] },
  { cliente: 0, dia: 2, hora: "22:00", comensales: 2, platos: [] }, // sin platos: el boton de cobrar queda deshabilitado
];

// Con --email se suma un cliente y una reserva de hoy con ese mail, para recibir el recibo de pago de verdad.
if (EMAIL_PRUEBA) {
  CLIENTES.push({ nombre: "Prueba", apellido: "Recibo", email: EMAIL_PRUEBA, telefono: "1100000000" });
  TURNOS.push({
    cliente: CLIENTES.length - 1, dia: 0, hora: "20:00", comensales: 2,
    platos: [["Hamburguesa clásica", 1], ["Pizza muzzarella", 1]],
  });
}

/* ───────── Helpers ───────── */
async function api(metodo, ruta, cuerpo) {
  const res = await fetch(BASE + ruta, {
    method: metodo,
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.mensaje ? `${msg}: ${j.mensaje}` : msg;
      if (j.errores) msg += " " + JSON.stringify(j.errores);
    } catch { /* sin cuerpo JSON */ }
    throw new Error(`${metodo} ${ruta} -> ${msg}`);
  }
  return res.status === 204 ? null : res.json();
}

const fechaISO = (offsetDias) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("en-CA"); // AAAA-MM-DD
};
const hhmm = (h) => String(h).slice(0, 5);
const peso = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);

/* ───────── Carga ───────── */
async function main() {
  console.log(`API: ${BASE}\n`);

  try {
    await api("GET", "/api/clientes/listarClientes");
  } catch (e) {
    console.error("No se pudo conectar con la API. ¿Está levantada?\n  " + e.message);
    process.exit(1);
  }

  // Clientes (clave: email)
  const existentes = await api("GET", "/api/clientes/listarClientes");
  const clienteIds = [];
  let nuevos = 0;
  for (const c of CLIENTES) {
    let cli = existentes.find((x) => x.email?.toLowerCase() === c.email);
    if (!cli) {
      cli = await api("POST", "/api/clientes/crearCliente", c);
      nuevos++;
    }
    clienteIds.push(cli.id);
  }
  console.log(`Clientes: ${CLIENTES.length} (${nuevos} nuevos)`);

  // Platos (clave: nombre)
  const platosExistentes = await api("GET", "/api/platos/listarPlatos");
  const platoId = {};
  nuevos = 0;
  for (const datos of PLATOS) {
    let plato = platosExistentes.find((p) => p.nombre.toLowerCase() === datos.nombre.toLowerCase());
    if (!plato) {
      plato = await api("POST", "/api/platos/crearPlato", datos);
      nuevos++;
    }
    platoId[datos.nombre] = plato.id;
  }
  console.log(`Platos: ${PLATOS.length} (${nuevos} nuevos)`);

  // Turnos (clave: cliente + fecha + hora)
  const turnosExistentes = await api("GET", "/api/turnos/listarTurnos");
  const yaExiste = (clienteId, fecha, hora) =>
    turnosExistentes.some((t) => t.clienteId === clienteId && t.fecha === fecha && hhmm(t.hora) === hora);

  let creados = 0;
  for (const t of TURNOS) {
    const clienteId = clienteIds[t.cliente];
    const fecha = fechaISO(t.dia);
    if (yaExiste(clienteId, fecha, t.hora)) continue;

    const turno = await api("POST", "/api/turnos/crearTurno", {
      fecha,
      hora: t.hora,
      cantidadComensales: t.comensales,
      clienteId,
    });
    for (const [nombre, cantidad] of t.platos) {
      for (let i = 0; i < cantidad; i++) {
        await api("POST", `/api/turnos/${turno.id}/platos/${platoId[nombre]}`);
      }
    }
    creados++;
  }
  console.log(`Reservas: ${TURNOS.length} (${creados} nuevas)\n`);

  // Resumen
  const turnos = await api("GET", "/api/turnos/listarTurnos");
  console.table(
    turnos.map((t) => ({
      id: t.id,
      cliente: t.clienteNombre,
      fecha: t.fecha,
      hora: hhmm(t.hora),
      personas: t.cantidadComensales,
      platos: t.platos?.length ?? 0,
      total: peso(Number(t.total ?? 0)),
      pago: t.pago?.estado ?? "sin cerrar",
    })),
  );
  console.log("Listo. Probá la API desde Swagger (/swagger-ui.html) o Postman.");
}

main().catch((e) => {
  console.error("\nError: " + e.message);
  process.exit(1);
});
