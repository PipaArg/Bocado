import { useEffect, useState } from "react";
import Reportes from "./Reportes.jsx";


/* ───────── Datos demo ─────────
 * Todo vive en el estado de React (se pierde al recargar).
 * Cuando armes el backend, reemplazá las acciones (login, sentar, agregar, pagar…) por llamadas a tu API:
 *   POST /api/mozos/login            GET /api/mesas/mozo/{id}      GET /api/reservas/turno
 *   POST /api/mesas/{id}/platos/{platoId}      PUT /api/mesas/{id}/estado?estado=A_PAGAR
 */
const MOZOS = [
  { usuario: "carla", clave: "1234", nombre: "Carla", turno: "Noche" },
  { usuario: "nico", clave: "1234", nombre: "Nico", turno: "Noche" },
  { usuario: "admin", clave: "1234", nombre: "Encargado", turno: "-", rol: "ENCARGADO" },
];

const MENU = {
  entradas: { icon: "🥗", items: ["Provoleta con tomates", "Empanadas de carne (x3)", "Rabas", "Tabla de fiambres", "Bruschettas"] },
  pizzas: { icon: "🍕", items: ["Muzzarella", "Napolitana", "Fugazzeta", "Calabresa", "Cuatro quesos"] },
  pastas: { icon: "🍝", items: ["Ñoquis de papa", "Sorrentinos de jamón y queso", "Ravioles de verdura", "Tallarines a la bolognesa", "Lasagna"] },
  milanesas: { icon: "🥩", items: ["Milanesa napolitana", "Milanesa a caballo", "Suprema de pollo", "Milanesa con puré", "Milanesa de berenjena"] },
  hamburguesas: { icon: "🍔", items: ["Clásica", "Doble cheddar", "Bacon BBQ", "Crispy chicken", "Veggie"] },
  bebidas: { icon: "🥤", items: ["Agua sin gas", "Gaseosa 500 ml", "Cerveza artesanal", "Copa de vino", "Limonada"] },
  postres: { icon: "🍮", items: ["Flan con dulce de leche", "Brownie con helado", "Tiramisú", "Panqueque de dulce de leche", "Helado 2 bochas"] },
};

const ESTADO = {
  LIBRE: { label: "Libre", cls: "libre" },
  RESERVADA: { label: "Reservada", cls: "reservada" },
  OCUPADA: { label: "Ocupada", cls: "ocupada" },
  A_PAGAR: { label: "A pagar", cls: "apagar" },
};
const EVENTOS = ["Cumpleaños", "Aniversario", "Cena de trabajo", "Sin evento"];
// Platos que el encargado desactivó (más adelante vendrá de la API / app del manager)
const AGOTADOS = ["pizzas-3", "bebidas-2", "postres-2"];
const NOTAS = ["Sin cebolla", "Sin sal", "Bien cocido", "Punto jugoso", "Sin TACC", "Sin picante"];

const T0 = Date.now();
let _id = 0;
const nid = () => ++_id;
const plato = (cat, i, cant = 1, nota = "") => ({ id: `${cat}-${i}`, nombre: MENU[cat].items[i], cant, nota });
const ev = (min, tipo, items = []) => ({ id: nid(), ts: T0 - min * 60000, tipo, items });
// hist = acciones de la mesa en orden; cada "pedido" agrupa todos los platos de esa acción
const mk = (num, cap, mozo, estado = "LIBRE", quien = "", evento = "", hist = []) => ({
  id: num, num, cap, mozo, estado, quien, evento, hist,
  desde: hist.find((h) => h.tipo === "ocupada")?.ts ?? null,
});
const MESAS0 = [
  mk(1, 2, "carla"),
  mk(2, 4, "carla", "OCUPADA", "Ana Ruiz", "Cumpleaños", [ev(35, "ocupada"), ev(33, "pedido", [plato("pizzas", 1, 1, "Sin aceitunas"), plato("bebidas", 2, 2)]), ev(18, "pedido", [plato("postres", 1)])]),
  mk(3, 4, "carla"),
  mk(4, 6, "carla", "A_PAGAR", "Familia Costa", "Almuerzo familiar", [ev(80, "ocupada"), ev(78, "pedido", [plato("milanesas", 0, 2), plato("bebidas", 1, 3)]), ev(45, "pedido", [plato("postres", 1)]), ev(6, "pagar")]),
  mk(5, 2, "carla", "OCUPADA", "Sin reserva", "", [ev(10, "ocupada"), ev(8, "pedido", [plato("entradas", 1)])]),
  mk(6, 8, "carla"),
  mk(7, 4, "nico"),
  mk(8, 2, "nico", "OCUPADA", "Sin reserva", "", [ev(20, "ocupada"), ev(17, "pedido", [plato("hamburguesas", 1, 1, "Bien cocida")])]),
  mk(9, 4, "nico"),
  mk(10, 6, "nico"),
];
const RESERVAS0 = [
  { id: 1, mesaId: 2, hora: "20:15", nombre: "Ana Ruiz", personas: 4, evento: "Cumpleaños", nota: "", estado: "SENTADA" },
  { id: 2, mesaId: 1, hora: "21:00", nombre: "Lucía Ferrari", personas: 2, evento: "Aniversario", nota: "Mesa tranquila, lejos de la puerta", estado: "PENDIENTE" },
  { id: 3, mesaId: 3, hora: "21:30", nombre: "Martín Acosta", personas: 4, evento: "Cumpleaños", nota: "Traen torta propia", estado: "PENDIENTE" },
  { id: 4, mesaId: 6, hora: "22:00", nombre: "Sofía Benítez", personas: 8, evento: "Cena de trabajo", nota: "Una celíaca", estado: "PENDIENTE" },
  { id: 5, mesaId: 7, hora: "20:45", nombre: "Pedro Gómez", personas: 3, evento: "", nota: "", estado: "PENDIENTE" },
  { id: 6, mesaId: 9, hora: "22:15", nombre: "Julia Díaz", personas: 4, evento: "", nota: "Silla para bebé", estado: "PENDIENTE" },
];

// Acepta un timestamp (ms) o un "HH:MM"; devuelve siempre formato 24 h (21:00)
const fmtHora = (v) => {
  const d = new Date();
  if (typeof v === "string") { const [h, m] = v.split(":").map(Number); d.setHours(h, m, 0, 0); } else d.setTime(v);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
};
const suma = (items) => items.reduce((s, p) => s + p.cant, 0);
// El pedido total se calcula sumando todas las acciones del historial
const pedidoDe = (m) => {
  const mp = new Map();
  m.hist.forEach((h) => h.items.forEach((i) => { const k = i.id + "|" + (i.nota || ""); const e = mp.get(k); mp.set(k, e ? { ...e, cant: e.cant + i.cant } : { ...i }); }));
  return [...mp.values()];
};
const cantidad = (m) => suma(pedidoDe(m));
const plat = (n) => `${n} ${n === 1 ? "plato" : "platos"}`;

/* ───────── App ───────── */
export default function App() {
  const [mozo, setMozo] = useState(null);
  const [mesas, setMesas] = useState(MESAS0);
  const [reservas, setReservas] = useState(RESERVAS0);
  const [vista, setVista] = useState("login"); // login | mesas | mesa | menu | items
  const [tab, setTab] = useState("mesas"); // mesas | reservas
  const [mesaId, setMesaId] = useState(null);
  const [cat, setCat] = useState(null);
  const [sheet, setSheet] = useState(null); // perfil | datos | abrir
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");
  const [dq, setDq] = useState("");
  const [dev, setDev] = useState("");
  const [dh, setDh] = useState("");
  const [carrito, setCarrito] = useState([]); // platos de la acción en curso (sin confirmar)
  const [offline, setOffline] = useState(typeof navigator !== "undefined" && navigator.onLine === false);
  const [simOff, setSimOff] = useState(false); // modo prueba: simula que se cae la conexión
  const [cola, setCola] = useState([]); // acciones hechas sin conexión, pendientes de enviar
  const [sync, setSync] = useState(""); // "" | "sync" | "ok"
  const [notaId, setNotaId] = useState(null);
  const [dn, setDn] = useState("");
  const sinRed = offline || simOff;
  const hora = fmtHora;

  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  // Al volver la conexión se envía la cola (acá iría el flush real contra la API)
  useEffect(() => {
    if (sinRed || cola.length === 0) return;
    setSync("sync");
    const t = setTimeout(() => { setCola([]); setSync("ok"); }, 900);
    return () => clearTimeout(t);
  }, [sinRed, cola.length]);
  useEffect(() => {
    if (sync !== "ok") return;
    const t = setTimeout(() => setSync(""), 2500);
    return () => clearTimeout(t);
  }, [sync]);

  const mias = mesas.filter((m) => m.mozo === mozo?.usuario);
  const mesa = mesas.find((m) => m.id === mesaId);
  const resDe = (m) => reservas.find((r) => r.mesaId === m.id && r.estado === "PENDIENTE");
  const est = (m) => (m.estado === "LIBRE" && resDe(m) ? "RESERVADA" : m.estado);
  const misReservas = reservas.filter((r) => mias.some((m) => m.id === r.mesaId)).sort((a, b) => a.hora.localeCompare(b.hora));
  const pendientes = misReservas.filter((r) => r.estado === "PENDIENTE").length;
  const upd = (id, fn) => setMesas((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));
  // Toda acción pasa por acá: con conexión se envía a la API (TODO); sin conexión queda en la cola y se envía al volver
  const registrar = (desc) => { if (sinRed) setCola((c) => [...c, { id: nid(), desc, ts: Date.now() }]); };
  const abrirNota = (id) => { setNotaId(id); setDn(carrito.find((p) => p.id === id)?.nota ?? ""); setSheet("nota"); };
  const guardarNota = () => { setCarrito((c) => c.map((p) => (p.id === notaId ? { ...p, nota: dn.trim() } : p))); setSheet(null); };

  /* Acciones (acá iría la llamada a la API) */
  const entrar = (m) => { setMozo(m); setErr(""); setClave(""); setVista("mesas"); };
  const login = (e) => {
    e.preventDefault();
    // Se lee del formulario (no solo del estado) para que funcione con el autocompletado del celu
    const f = new FormData(e.currentTarget);
    const u = String(f.get("usuario") ?? usuario).trim().toLowerCase();
    const c = String(f.get("clave") ?? clave);
    if (!u || !c) return setErr("Escribí tu usuario y contraseña");
    const m = MOZOS.find((x) => x.usuario === u && x.clave === c);
    if (!m) return setErr("Usuario o contraseña incorrectos. Probá con carla / 1234");
    entrar(m);
  };
  const salir = () => { setSheet(null); setMozo(null); setUsuario(""); setTab("mesas"); setVista("login"); };
  const abrirDatos = (modo) => {
    const d = mesa.desde ? new Date(mesa.desde) : new Date();
    setDq(mesa.quien === "Sin reserva" ? "" : mesa.quien);
    setDev(mesa.evento);
    setDh(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setSheet(modo);
  };
  const guardarDatos = () => {
    const d = new Date();
    const [h, mi] = (dh || "00:00").split(":").map(Number);
    d.setHours(h, mi, 0, 0);
    const ts = d.getTime();
    upd(mesaId, (m) => ({
      ...m, quien: dq.trim() || "Sin reserva", evento: dev, desde: ts,
      estado: m.estado === "LIBRE" ? "OCUPADA" : m.estado,
      hist: m.estado === "LIBRE" ? [{ id: nid(), ts, tipo: "ocupada", items: [] }] : m.hist.map((x) => (x.tipo === "ocupada" ? { ...x, ts } : x)),
    }));
    registrar(mesa.estado === "LIBRE" ? `Mesa ${mesa.num} abierta` : `Datos de la mesa ${mesa.num} editados`);
    setSheet(null);
  };
  const sentar = () => {
    const r = resDe(mesa);
    const ts = Date.now();
    upd(mesaId, (m) => ({ ...m, estado: "OCUPADA", desde: ts, quien: r.nombre, evento: r.evento, hist: [{ id: nid(), ts, tipo: "ocupada", items: [] }] }));
    setReservas((rs) => rs.map((x) => (x.id === r.id ? { ...x, estado: "SENTADA" } : x)));
    registrar(`Reserva de ${r.nombre} sentada en mesa ${mesa.num}`);
  };
  const marca = (tipo, estado) => upd(mesaId, (m) => ({ ...m, estado, hist: [...m.hist, { id: nid(), ts: Date.now(), tipo, items: [] }] }));
  const pagar = () => { marca("pagar", "A_PAGAR"); registrar(`Mesa ${mesa.num} pasó a pagar`); };
  const reabrir = () => { marca("reabrir", "OCUPADA"); registrar(`Mesa ${mesa.num} volvió a ocupada`); };
  const liberar = () => { upd(mesaId, (m) => ({ ...m, estado: "LIBRE", hist: [], desde: null, quien: "", evento: "" })); registrar(`Mesa ${mesa.num} liberada`); setVista("mesas"); };

  /* Pedido: cada confirmación es UNA acción en el historial que agrupa todos los platos elegidos */
  const sumar = (id, nombre) => AGOTADOS.includes(id) ? null : setCarrito((c) => (c.some((p) => p.id === id) ? c.map((p) => (p.id === id ? { ...p, cant: p.cant + 1 } : p)) : [...c, { id, nombre, cant: 1 }]));
  const restar = (id) => setCarrito((c) => c.map((p) => (p.id === id ? { ...p, cant: p.cant - 1 } : p)).filter((p) => p.cant > 0));
  const confirmar = () => {
    upd(mesaId, (m) => ({ ...m, hist: [...m.hist, { id: nid(), ts: Date.now(), tipo: "pedido", items: carrito }] }));
    registrar(`Pedido de ${plat(suma(carrito))} en mesa ${mesa.num}`);
    setCarrito([]); setVista("mesa");
  };
  const cancelarPedido = () => { setCarrito([]); setVista("mesa"); };

  const irMesa = (id) => { setMesaId(id); setVista("mesa"); };
  const volver = () => {
    if (vista === "menu") setCarrito([]);
    setVista((v) => (v === "items" ? "menu" : v === "menu" ? "mesa" : "mesas"));
  };
  const titulo = vista === "mesas" ? `Hola, ${mozo?.nombre}` : vista === "mesa" ? `Mesa ${mesa?.num}` : vista === "menu" ? "Agregar platos" : cat;

// El encargado no usa la pantalla de mozos: ve directamente el reporte
  if (mozo?.rol === "ENCARGADO") {
    return <Reportes onSalir={salir} />;
  }

  /* ── Vistas ── */
  const loginView = () => (
      <form className="login" onSubmit={login}>
        <h1 className="big">bocado</h1>
        <p className="sub">Acceso para mozos</p>
        <div className="fields">
          <input name="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuario" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" aria-label="Usuario" />
          <input name="clave" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Contraseña" type="password" autoComplete="current-password" aria-label="Contraseña" />
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="primary">Ingresar</button>
        <button type="button" className="sec" onClick={() => entrar(MOZOS[0])}>Entrar como Carla (demo)</button>
        <p className="hint">Demo: carla / 1234 · Encargado: admin / 1234</p>
      </form>
  );

  const chico = (m, e) => {
    const r = resDe(m);
    return e === "LIBRE" ? `${m.cap} lugares` : e === "RESERVADA" ? `${hora(r.hora)} · ${r.nombre.split(" ")[0]}` : `desde ${hora(m.desde)}`;
  };

  const mesasView = () => (
      <div className="body">
        <div className="seg tabs" role="tablist">
          <button role="tab" aria-selected={tab === "mesas"} className={tab === "mesas" ? "on" : ""} onClick={() => setTab("mesas")}>Mesas</button>
          <button role="tab" aria-selected={tab === "reservas"} className={tab === "reservas" ? "on" : ""} onClick={() => setTab("reservas")}>Reservas · {pendientes}</button>
        </div>

        {tab === "mesas" ? (
            <>
              <div className="stats">
                {Object.keys(ESTADO).map((e) => (
                    <span key={e} className={"chip " + ESTADO[e].cls}>{ESTADO[e].label} {mias.filter((m) => est(m) === e).length}</span>
                ))}
              </div>
              <h2>Tus mesas</h2>
              {mias.length === 0 && <p className="sub">No tenés mesas asignadas.</p>}
              <div className="grid tres">
                {mias.map((m) => {
                  const e = est(m);
                  return (
                      <button key={m.id} className={`mesa ${ESTADO[e].cls}`} onClick={() => irMesa(m.id)}>
                        <b>{m.num}</b>
                        <span>{ESTADO[e].label}</span>
                        <small>{chico(m, e)}</small>
                      </button>
                  );
                })}
              </div>
            </>
        ) : (
            <>
              <p className="sub">Esperadas en tu turno · {pendientes} {pendientes === 1 ? "pendiente" : "pendientes"}</p>
              {misReservas.map((r) => {
                const sentada = r.estado === "SENTADA";
                return (
                    <button key={r.id} className={"res" + (sentada ? " done" : "")} onClick={() => irMesa(r.mesaId)}>
                      <b>{hora(r.hora)}</b>
                      <span className="grow">
                  {r.nombre}
                        <small>Mesa {mesas.find((m) => m.id === r.mesaId).num} · {r.personas} personas{r.evento ? ` · ${r.evento}` : ""}</small>
                        {r.nota && <small className="nota">“{r.nota}”</small>}
                </span>
                      <span className={"chip " + (sentada ? "gris" : "reservada")}>{sentada ? "Sentada" : "Esperada"}</span>
                    </button>
                );
              })}
            </>
        )}
      </div>
  );

  const mesaView = () => {
    const e = est(mesa);
    const n = cantidad(mesa);
    const r = resDe(mesa);
    const activa = e === "OCUPADA" || e === "A_PAGAR";
    const quien = e === "RESERVADA" ? r.nombre : mesa.quien;
    const evento = (e === "RESERVADA" ? r.evento : mesa.evento) || "—";
    const inicio = e === "RESERVADA" ? hora(r.hora) : mesa.desde ? hora(mesa.desde) : "—";
    return (
        <>
          <div className="body">
            <div className="info">
              <div><small>Capacidad</small><b>{mesa.cap}</b></div>
              <div><small>Platos</small><b>{n}</b></div>
            </div>

            {e === "LIBRE" ? (
                <p className="sub">Mesa libre. Abrila cuando se sienten.</p>
            ) : (
                <div className="datos">
                  <div className="row-h">
                    <h2>Datos de la mesa</h2>
                    {activa && <button className="pill" onClick={() => abrirDatos("datos")}>Editar</button>}
                  </div>
                  <dl>
                    <div><dt>Quién</dt><dd>{quien || "—"}</dd></div>
                    <div><dt>Evento</dt><dd>{evento}</dd></div>
                    <div><dt>{e === "RESERVADA" ? "Hora reservada" : "Hora de inicio"}</dt><dd>{inicio}</dd></div>
                    {e === "RESERVADA" && <div><dt>Personas</dt><dd>{r.personas}</dd></div>}
                    {e === "RESERVADA" && r.nota && <div><dt>Nota</dt><dd>{r.nota}</dd></div>}
                  </dl>
                </div>
            )}

            {e === "A_PAGAR" && <div className="bill"><small>Cuenta pedida</small><b>{plat(n)}</b></div>}
            {activa && (
                <>
                  <h2>Pedido</h2>
                  {n === 0 && <p className="sub">Todavía no hay platos en esta mesa.</p>}
                  {pedidoDe(mesa).map((p) => (
                      <div className="line" key={p.id + (p.nota || "")}>
                        <span className="grow">{p.nombre}{p.nota && <small className="nota">“{p.nota}”</small>}</span>
                        <b>×{p.cant}</b>
                      </div>
                  ))}
                  <h2>Historial</h2>
                  <ol className="hist">
                    {mesa.hist.map((h) => (
                        <li key={h.id}>
                          <time>{hora(h.ts)}</time>
                          <div>
                            <b>{{ ocupada: "Pasó a ocupada", pagar: "Pasó a pagar", reabrir: "Volvió a ocupada" }[h.tipo] ?? `Agregó ${plat(suma(h.items))}`}</b>
                            {h.tipo === "pedido" && <ul>{h.items.map((i) => <li key={i.id}>{i.cant}× {i.nombre}{i.nota ? ` — ${i.nota}` : ""}</li>)}</ul>}
                          </div>
                        </li>
                    ))}
                  </ol>
                </>
            )}
          </div>
          <div className="foot">
            {e === "LIBRE" && <button className="primary" onClick={() => abrirDatos("abrir")}>Abrir mesa</button>}
            {e === "RESERVADA" && (
                <>
                  <button className="primary" onClick={sentar}>Sentar reserva</button>
                  <button className="sec" onClick={() => abrirDatos("abrir")}>Abrir sin reserva</button>
                </>
            )}
            {e === "OCUPADA" && (
                <>
                  <button className="primary" onClick={() => { setCarrito([]); setVista("menu"); }}>Agregar platos</button>
                  <button className="sec pay" disabled={n === 0} onClick={pagar}>Pasar a pagar</button>
                </>
            )}
            {e === "A_PAGAR" && (
                <>
                  <button className="primary" onClick={liberar}>Cobrado · liberar mesa</button>
                  <button className="sec" onClick={reabrir}>Volver a ocupada</button>
                </>
            )}
          </div>
        </>
    );
  };

  const menuView = () => {
    const n = suma(carrito);
    return (
        <>
          <div className="body">
            <p className="sub">Elegí los platos y confirmá: se registran juntos como una sola acción.</p>
            <div className="grid cats">
              {Object.entries(MENU).map(([k, c]) => {
                const q = suma(carrito.filter((p) => p.id.startsWith(k + "-")));
                return (
                    <button key={k} className="cat" onClick={() => { setCat(k); setVista("items"); }}>
                      {q > 0 && <i className="cnt">{q}</i>}
                      <span className="ico">{c.icon}</span>
                      <b>{k}</b>
                      <small>{c.items.filter((_, i) => !AGOTADOS.includes(`${k}-${i}`)).length} disponibles</small>
                    </button>
                );
              })}
            </div>
          </div>
          {n > 0 && (
              <div className="foot">
                <button className="primary" onClick={confirmar}>Confirmar · {plat(n)}</button>
                <button className="sec" onClick={cancelarPedido}>Cancelar pedido</button>
              </div>
          )}
        </>
    );
  };

  const itemsView = () => {
    const n = suma(carrito);
    return (
        <>
          <div className="body">
            {MENU[cat].items.map((nombre, i) => {
              const id = `${cat}-${i}`;
              const linea = carrito.find((p) => p.id === id);
              const c = linea?.cant ?? 0;
              const ag = AGOTADOS.includes(id);
              return (
                  <div key={id} className={"item" + (c ? " on" : "") + (ag ? " off" : "")}>
                    <button className="add" disabled={ag} onClick={() => sumar(id, nombre)}>
                      {nombre}
                      {ag && <small>Agotado</small>}
                      {linea?.nota && <small className="nota">“{linea.nota}”</small>}
                    </button>
                    {c > 0 && (
                        <div className="qty">
                          <button className="note" aria-label="Agregar nota" onClick={() => abrirNota(id)}>✎</button>
                          <button aria-label="Quitar uno" onClick={() => restar(id)}>−</button>
                          <b>{c}</b>
                        </div>
                    )}
                  </div>
              );
            })}
          </div>
          <div className="foot">
            {n > 0
                ? <button className="primary" onClick={confirmar}>Confirmar · {plat(n)}</button>
                : <button className="primary" onClick={() => setVista("mesa")}>Volver a la mesa</button>}
            <button className="sec" onClick={volver}>Otra categoría</button>
          </div>
        </>
    );
  };

  return (
      <div className="bz">
        <style>{css}</style>
        <i className="blob b1" /><i className="blob b2" /><i className="blob b3" />
        <div className="shell">
          <header className="top">
            <span className="logo">bocado <em>mozos</em></span>
            {mozo && (
                <button className="avatar" onClick={() => setSheet("perfil")} aria-label="Perfil">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
                </button>
            )}
          </header>

          <section className="card">
            {vista !== "login" && (sinRed || sync) && (
                <div className={"net " + (sinRed ? "off" : sync === "ok" ? "ok" : "sync")} role="status">
                  {sinRed
                      ? `Sin conexión · ${cola.length ? `${cola.length} ${cola.length === 1 ? "cambio pendiente" : "cambios pendientes"}` : "los cambios se guardan y se envían al volver"}`
                      : sync === "ok" ? "Todo sincronizado ✓" : `Sincronizando ${cola.length} ${cola.length === 1 ? "cambio" : "cambios"}…`}
                </div>
            )}
            {vista !== "login" && (
                <div className="bar">
                  <button className="back" onClick={volver} aria-label="Volver" style={{ visibility: vista === "mesas" ? "hidden" : "visible" }}>‹</button>
                  <h1 className="title">{titulo}</h1>
                  {vista === "mesa" && <span className={"badge " + ESTADO[est(mesa)].cls}>{ESTADO[est(mesa)].label}</span>}
                </div>
            )}
            <div className="view" key={vista + (cat ?? "")}>
              {vista === "login" && loginView()}
              {vista === "mesas" && mesasView()}
              {vista === "mesa" && mesaView()}
              {vista === "menu" && menuView()}
              {vista === "items" && itemsView()}
            </div>

            {sheet === "perfil" && (
                <div className="sheet perfil">
              <span className="avatar big-av">
                <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
              </span>
                  <h2>{mozo.nombre}</h2>
                  <p className="sub">@{mozo.usuario} · Turno {mozo.turno}</p>
                  <div className="stats">
                    <span className="chip gris">{mias.length} mesas</span>
                    <span className="chip reservada">{pendientes} reservas pendientes</span>
                  </div>
                  <p className="hint">Modo prueba de conexión</p>
                  <div className="seg" role="radiogroup" aria-label="Conexión">
                    <button role="radio" aria-checked={!simOff} className={!simOff ? "on" : ""} onClick={() => setSimOff(false)}>En línea</button>
                    <button role="radio" aria-checked={simOff} className={simOff ? "on" : ""} onClick={() => setSimOff(true)}>Sin conexión</button>
                  </div>
                  <button className="primary" onClick={salir}>Cerrar sesión</button>
                  <button className="sec" onClick={() => setSheet(null)}>Cerrar</button>
                </div>
            )}

            {sheet === "nota" && (
                <div className="sheet">
                  <h2>Nota del plato</h2>
                  <p className="sub">{carrito.find((p) => p.id === notaId)?.nombre}</p>
                  <div className="fields">
                    <input value={dn} onChange={(e) => setDn(e.target.value)} placeholder="Ej: sin cebolla" maxLength={80} aria-label="Nota" />
                  </div>
                  <div className="chips-row">
                    {NOTAS.map((n) => (
                        <button key={n} className={"cb" + (dn.includes(n.toLowerCase()) || dn === n ? " on" : "")} onClick={() => setDn(dn ? (dn.toLowerCase().includes(n.toLowerCase()) ? dn : `${dn}, ${n.toLowerCase()}`) : n)}>{n}</button>
                    ))}
                  </div>
                  <button className="primary" onClick={guardarNota}>Guardar nota</button>
                  <button className="sec" onClick={() => setSheet(null)}>Cancelar</button>
                </div>
            )}

            {(sheet === "datos" || sheet === "abrir") && mesa && (
                <div className="sheet">
                  <h2>{sheet === "abrir" ? `Abrir mesa ${mesa.num}` : "Datos de la mesa"}</h2>
                  <div className="fields">
                    <input value={dq} onChange={(e) => setDq(e.target.value)} placeholder="¿A nombre de quién?" aria-label="Quién" />
                    <input value={dev} onChange={(e) => setDev(e.target.value)} placeholder="Evento (opcional)" aria-label="Evento" />
                    <label><span>Hora de inicio</span><input type="time" value={dh} onChange={(e) => setDh(e.target.value)} /></label>
                  </div>
                  <div className="chips-row">
                    {EVENTOS.map((ev) => {
                      const v = ev === "Sin evento" ? "" : ev;
                      return <button key={ev} className={"cb" + (dev === v ? " on" : "")} onClick={() => setDev(v)}>{ev}</button>;
                    })}
                  </div>
                  <button className="primary" onClick={guardarDatos}>{sheet === "abrir" ? "Abrir mesa" : "Guardar"}</button>
                  <button className="sec" onClick={() => setSheet(null)}>Cancelar</button>
                </div>
            )}
          </section>
        </div>
      </div>
  );
}

/* ───────── Estilos ───────── */
const css = `
.bz{--ink:#1d1d1f;--mute:#6e6e73;--blue:#0a84ff;--green:#34c759;--red:#ff453a;--amber:#ff9f0a;--glass:rgba(255,255,255,.5);--edge:rgba(255,255,255,.75);
  min-height:100vh;position:relative;overflow:hidden;color:var(--ink);
  font:16px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",system-ui,sans-serif;
  background:linear-gradient(160deg,#dfe9ff,#f3e6ff 55%,#ffe7ef);display:grid;place-items:center;padding:16px 12px}
.bz *{box-sizing:border-box}
.bz button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.bz :is(button,input):focus-visible{outline:3px solid #0a84ff80;outline-offset:2px}
.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.75;pointer-events:none}
.b1{width:380px;height:380px;background:#7db4ff;top:-90px;left:-70px}
.b2{width:340px;height:340px;background:#ff9fc4;bottom:-80px;right:-40px}
.b3{width:260px;height:260px;background:#8ee8c0;bottom:18%;left:12%;opacity:.55}
.shell{position:relative;width:100%;max-width:440px}
.top{display:flex;justify-content:space-between;align-items:center;margin:0 6px 12px}
.logo{font-weight:700;font-size:24px;letter-spacing:-.04em}.logo em{font-style:normal;font-weight:500;font-size:15px;color:var(--mute);letter-spacing:0;margin-left:4px}
.pill{background:var(--glass)!important;backdrop-filter:blur(20px);border:1px solid var(--edge)!important;padding:6px 14px;border-radius:999px;font-size:14px;font-weight:500}
.avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--glass)!important;backdrop-filter:blur(20px);border:1px solid var(--edge)!important}
.card{position:relative;display:flex;flex-direction:column;overflow:hidden;height:min(780px,calc(100vh - 100px));height:min(780px,calc(100dvh - 100px));min-height:520px;border-radius:38px;
  background:var(--glass);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
  border:1px solid var(--edge);box-shadow:0 30px 80px -24px rgba(50,70,140,.4),inset 0 1px 0 rgba(255,255,255,.9)}
.bar{display:flex;align-items:center;gap:10px;padding:20px 20px 4px}
.back{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.65)!important;font-size:26px;line-height:1;padding-bottom:3px;flex:none}
.title{flex:1;margin:0;font-size:26px;font-weight:700;letter-spacing:-.03em;text-transform:capitalize;line-height:1.1}
.badge{padding:5px 12px;border-radius:999px;font-size:13px;font-weight:600}
.view{flex:1;min-height:0;display:flex;flex-direction:column;animation:in .38s cubic-bezier(.32,.72,0,1)}
@keyframes in{from{transform:translateX(28px);opacity:0}}
@media(prefers-reduced-motion:reduce){.view,.sheet{animation:none}}
.body{flex:1;min-height:0;overflow-y:auto;padding:14px 20px 18px;display:flex;flex-direction:column;gap:12px}
.body h2{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:4px 0 0}
.foot{padding:10px 20px 22px;display:flex;flex-direction:column;gap:10px}
.sub{color:var(--mute);margin:0}.hint{margin:0;font-size:13px;color:var(--mute);text-align:center}
.libre{--c:var(--green);--rgb:52,199,89}.reservada{--c:var(--blue);--rgb:10,132,255}.ocupada{--c:var(--red);--rgb:255,69,58}.apagar{--c:var(--amber);--rgb:255,159,10}.gris{--c:#8e8e93}
.badge,.chip{background:color-mix(in srgb,var(--c) 26%,white);color:var(--ink)}
.stats{display:flex;gap:8px;flex-wrap:wrap}
.chip{padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600}
.row-h{display:flex;justify-content:space-between;align-items:center;gap:10px}
.row-h h2{margin:0}
.seg{display:flex;padding:3px;border-radius:12px;background:rgba(0,0,0,.07)}
.seg button{padding:6px 10px;border-radius:10px;font-size:12.5px;font-weight:500;color:var(--mute);white-space:nowrap}
.seg button.on{background:#fff;color:var(--ink);box-shadow:0 2px 6px #0002}
.seg.tabs button{flex:1;padding:9px 0;font-size:14.5px}
.grid{display:grid;gap:12px}
.mesa{aspect-ratio:1;border-radius:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  background:color-mix(in srgb,var(--c) 20%,rgba(255,255,255,.4));backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border:1px solid color-mix(in srgb,var(--c) 40%,rgba(255,255,255,.85));box-shadow:inset 0 1px 0 rgba(255,255,255,.7);transition:transform .15s}
.mesa:active{transform:scale(.96)}
.mesa b{font-size:60px;line-height:1;font-weight:700;letter-spacing:-.05em}
.mesa span{font-weight:600;font-size:15px;display:flex;align-items:center;gap:6px}
.mesa span::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c)}
.mesa small{font-size:13px;color:var(--mute);font-variant-numeric:tabular-nums}
.mesa.c3 b{font-size:42px}.mesa.c3 span{font-size:13px}.mesa.c3 small{font-size:11.5px}.mesa.c3{border-radius:22px}
.res{display:flex;align-items:center;gap:14px;text-align:left;padding:14px 16px;border-radius:20px;background:rgba(255,255,255,.65)!important;transition:transform .15s}
.res:active{transform:scale(.98)}.res.done{opacity:.55}
.res>b{font-size:22px;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.nota{font-style:italic}
.info{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.info div{background:rgba(255,255,255,.6);border-radius:18px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}
.info small{font-size:12px;color:var(--mute)}.info b{font-size:24px;letter-spacing:-.02em}
.datos{border-radius:22px;background:rgba(255,255,255,.62);padding:14px 16px}
.datos dl{margin:8px 0 0}
.datos dl div{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-top:1px solid #0000000f}
.datos dt{color:var(--mute);flex:none}.datos dd{margin:0;font-weight:600;text-align:right;overflow-wrap:anywhere}
.bill{border-radius:22px;padding:16px 18px;background:color-mix(in srgb,var(--amber) 35%,white);display:flex;flex-direction:column;gap:2px}
.bill small{font-size:13px;font-weight:600;opacity:.7}.bill b{font-size:30px;letter-spacing:-.03em;line-height:1.1}
.line,.item{display:flex;align-items:center;gap:12px;border-radius:20px;background:rgba(255,255,255,.65);padding:14px 16px}
.grow{flex:1;display:flex;flex-direction:column}.grow small{font-size:13px;color:var(--mute)}
.qty{display:flex;align-items:center;gap:10px;flex:none}
.qty button{width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.07)!important;font-size:22px;line-height:1}
.qty b{min-width:1.2ch;text-align:center;font-size:18px}
.cats{grid-template-columns:repeat(2,1fr)}
.cat{aspect-ratio:1;border-radius:26px;background:rgba(255,255,255,.65)!important;border:1px solid var(--edge)!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:transform .15s}
.cat:active{transform:scale(.96)}
.cat .ico{font-size:46px;line-height:1}.cat b{font-size:18px;text-transform:capitalize;letter-spacing:-.02em}.cat small{font-size:12.5px;color:var(--mute)}
.item{padding:0;min-height:84px;overflow:hidden}
.item.on{box-shadow:0 0 0 2px var(--blue);background:#fff}
.add{flex:1;align-self:stretch;padding:14px 16px;text-align:left;font-size:17px;font-weight:600}
.add:active{background:rgba(10,132,255,.1)}
.item .qty{padding-right:14px}
.primary,.sec{width:100%;padding:17px;border-radius:999px;font-weight:600;font-size:17px;transition:transform .15s,opacity .2s}
.primary{background:var(--ink)!important;color:#fff!important}
.sec{background:rgba(255,255,255,.7)!important;border:1px solid var(--edge)!important}
.sec.pay{background:var(--amber)!important;border-color:transparent!important}
.primary:active,.sec:active{transform:scale(.98)}
.primary:disabled,.sec:disabled{opacity:.4;cursor:not-allowed}
.login{flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:28px}
.big{margin:0;font-size:64px;line-height:1;font-weight:800;letter-spacing:-.06em}
.fields{display:flex;flex-direction:column;gap:1px;border-radius:20px;overflow:hidden;background:rgba(0,0,0,.06)}
.fields input{width:100%;border:0;background:rgba(255,255,255,.7);padding:17px 18px;font:inherit;font-size:17px;color:var(--ink)}
.fields input:focus{outline:none;background:#fff}
.fields label{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.7);padding:4px 18px 4px 0}
.fields label span{padding-left:18px;color:var(--mute)}
.fields label input{width:auto;background:none;padding:13px 0;text-align:right}
.err{margin:0;padding:10px 14px;border-radius:14px;background:rgba(255,59,48,.12);color:#b3261e;font-size:14px}
.sheet{position:absolute;inset:0;z-index:5;padding:26px 22px 24px;background:rgba(255,255,255,.8);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);overflow-y:auto;display:flex;flex-direction:column;gap:14px;animation:up .4s cubic-bezier(.32,.72,0,1)}
@keyframes up{from{transform:translateY(100%)}}
.sheet h2{font-size:28px;letter-spacing:-.03em;margin:0}
.sheet .primary{margin-top:auto}
.perfil{align-items:center;text-align:center;justify-content:center}
.perfil .primary{margin-top:14px}.perfil .stats{justify-content:center}
.big-av{width:84px;height:84px}
.chips-row{display:flex;flex-wrap:wrap;gap:8px}
.cb{padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.7)!important;border:1px solid var(--edge)!important;font-size:14px;font-weight:500}
.cb.on{background:var(--ink)!important;color:#fff!important}
.hist{list-style:none;margin:0;padding:6px 16px;border-radius:22px;background:rgba(255,255,255,.62)}
.hist>li{display:grid;grid-template-columns:56px 1fr;gap:12px;padding:12px 0;border-top:1px solid #0000000f}
.hist>li:first-child{border:0}
.hist time{font-weight:600;font-variant-numeric:tabular-nums;color:var(--mute)}
.hist ul{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:2px;font-size:14.5px;color:var(--mute)}
.cat{position:relative}
.cnt{position:absolute;top:12px;right:14px;min-width:24px;height:24px;padding:0 7px;border-radius:12px;background:var(--blue);color:#fff;font-size:14px;font-weight:600;line-height:24px;font-style:normal;text-align:center}
.mesa small{max-width:100%;padding:0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.net{margin:14px 20px 0;padding:8px 14px;border-radius:14px;font-size:13.5px;font-weight:600;text-align:center}
.net.off{background:color-mix(in srgb,var(--amber) 35%,white)}
.net.sync{background:color-mix(in srgb,var(--blue) 22%,white)}
.net.ok{background:color-mix(in srgb,var(--green) 30%,white)}
.add{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px}
.add small{font-size:13px;font-weight:500;color:var(--mute)}
.qty .note{font-size:18px}
.mesa{background-color:rgba(255,255,255,.3);background-image:linear-gradient(145deg,rgba(var(--rgb),.42),rgba(var(--rgb),.18));border:1px solid rgba(var(--rgb),.55);border-radius:22px}
.grid.tres{grid-template-columns:repeat(3,1fr)}
.mesa b{font-size:42px}.mesa span{font-size:13px}.mesa small{font-size:11.5px}
.cats{grid-template-columns:repeat(3,1fr)}
.cat{border-radius:22px}.cat .ico{font-size:34px}.cat b{font-size:13px}.cat small{font-size:11.5px}
.cnt{top:8px;right:8px}
.item.off{opacity:.5;background:rgba(0,0,0,.05);filter:grayscale(1)}
.item.off .add{cursor:not-allowed}
`;
