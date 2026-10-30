import { useState } from "react";
import Reportes from "./Reportes.jsx";
import Blobs from "../components/Blobs.jsx";
import useOnline from "../hooks/useOnline.js";
import useMenu from "../hooks/useMenu.js";
import useTurnos from "../hooks/useTurnos.js";
import { fmtHora } from "../lib/format.js";
import { suma, pedidoDe, cantidad, plat } from "../lib/pedido.js";
import { nid } from "../lib/id.js";
import { ESTADO, EVENTOS, NOTAS } from "../data/mozos.js";
import css from "../styles/mozos.css?inline";

const hora = fmtHora;

export default function Mozos() {
  const [mozo, setMozo] = useState(null);
  // TODO: cargar mesas desde GET /api/mesas/mozo/{id} cuando exista ese endpoint.
  const [mesas, setMesas] = useState([]);
  const { turnos: reservas, setTurnos: setReservas, cargando: turnosCargando, error: turnosError, recargar: recargarTurnos } = useTurnos();
  const { menu, cargando: menuCargando, error: menuError, recargar: recargarMenu } = useMenu();
  const offline = !useOnline();

  const [vista, setVista] = useState("login"); // login | mesas | mesa | menu | items
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [tab, setTab] = useState("mesas"); // mesas | reservas
  const [mesaId, setMesaId] = useState(null);
  const [cat, setCat] = useState(null);
  const [sheet, setSheet] = useState(null); // perfil | datos | abrir | nota
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");
  const [dq, setDq] = useState("");
  const [dev, setDev] = useState("");
  const [dh, setDh] = useState("");
  const [carrito, setCarrito] = useState([]); // platos de la acción en curso (sin confirmar)
  const [notaId, setNotaId] = useState(null);
  const [dn, setDn] = useState("");

  const mias = mesas.filter((m) => m.mozo === mozo?.usuario);
  const mesa = mesas.find((m) => m.id === mesaId);
  const resDe = (m) => reservas.find((r) => r.mesaId === m.id && r.estado === "PENDIENTE");
  const est = (m) => (m.estado === "LIBRE" && resDe(m) ? "RESERVADA" : m.estado);
  const misReservas = reservas.slice().sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  const pendientes = misReservas.filter((r) => r.estado === "PENDIENTE").length;
  const upd = (id, fn) => setMesas((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));
  const abrirNota = (id) => { setNotaId(id); setDn(carrito.find((p) => p.id === id)?.nota ?? ""); setSheet("nota"); };
  const guardarNota = () => { setCarrito((c) => c.map((p) => (p.id === notaId ? { ...p, nota: dn.trim() } : p))); setSheet(null); };

  const login = (e) => {
    e.preventDefault();
    // TODO: poner acá la llamada a POST /api/mozos/login cuando exista ese endpoint.
    setErr("Falta conectar la API de acceso de mozos.");
  };
  const salir = () => { setSheet(null); setMozo(null); setUsuario(""); setTab("mesas"); setVista("login"); setMostrarReporte(false); };
  const abrirDatos = (modo) => {
    const d = mesa.desde ? new Date(mesa.desde) : new Date();
    setDq(mesa.quien === "Sin reserva" ? "" : mesa.quien);
    setDev(mesa.evento);
    setDh(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setSheet(modo);
  };
  const guardarDatos = () => {
    // TODO: poner acá la llamada a la API para abrir o actualizar una mesa.
    const d = new Date();
    const [h, mi] = (dh || "00:00").split(":").map(Number);
    d.setHours(h, mi, 0, 0);
    const ts = d.getTime();
    upd(mesaId, (m) => ({
      ...m, quien: dq.trim() || "Sin reserva", evento: dev, desde: ts,
      estado: m.estado === "LIBRE" ? "OCUPADA" : m.estado,
      hist: m.estado === "LIBRE" ? [{ id: nid(), ts, tipo: "ocupada", items: [] }] : m.hist.map((x) => (x.tipo === "ocupada" ? { ...x, ts } : x)),
    }));
    setSheet(null);
  };
  const sentar = () => {
    // TODO: poner acá la llamada a la API para asignar una reserva a una mesa.
    const r = resDe(mesa);
    const ts = Date.now();
    upd(mesaId, (m) => ({ ...m, estado: "OCUPADA", desde: ts, quien: r.nombre, evento: r.evento, hist: [{ id: nid(), ts, tipo: "ocupada", items: [] }] }));
    setReservas((rs) => rs.map((x) => (x.id === r.id ? { ...x, estado: "SENTADA" } : x)));
  };
  const marca = (tipo, estado) => upd(mesaId, (m) => ({ ...m, estado, hist: [...m.hist, { id: nid(), ts: Date.now(), tipo, items: [] }] }));
  const pagar = () => {
    // TODO: poner acá la llamada a la API para marcar la mesa como pendiente de pago.
    marca("pagar", "A_PAGAR");
  };
  const reabrir = () => {
    // TODO: poner acá la llamada a la API para reabrir la mesa.
    marca("reabrir", "OCUPADA");
  };
  const liberar = () => {
    // TODO: poner acá la llamada a la API para liberar la mesa al cobrar.
    upd(mesaId, (m) => ({ ...m, estado: "LIBRE", hist: [], desde: null, quien: "", evento: "" }));
    setVista("mesas");
  };

  /* Pedido: cada confirmación es UNA acción en el historial que agrupa todos los platos elegidos */
  const sumar = (plato) => {
    if (!plato.activo) return;
    const id = String(plato.id);
    setCarrito((c) => (c.some((p) => p.id === id)
      ? c.map((p) => (p.id === id ? { ...p, cant: p.cant + 1 } : p))
      : [...c, { id, nombre: plato.nombre, categoriaId: plato.categoriaId, cant: 1 }]));
  };
  const restar = (id) => setCarrito((c) => c.map((p) => (p.id === id ? { ...p, cant: p.cant - 1 } : p)).filter((p) => p.cant > 0));
  const confirmar = () => {
    if (!mesaId) {
      setErr("TODO: conectar la API de pedidos de mesa.");
      return;
    }
    // TODO: poner acá la llamada a la API para guardar el pedido de la mesa.
    upd(mesaId, (m) => ({ ...m, hist: [...m.hist, { id: nid(), ts: Date.now(), tipo: "pedido", items: carrito }] }));
    setCarrito([]); setVista("mesa");
  };
  const cancelarPedido = () => { setCarrito([]); setVista(mesaId ? "mesa" : "menu"); };

  const irMesa = (id) => { setMesaId(id); setVista("mesa"); };
  const volver = () => {
    if (vista === "menu") setCarrito([]);
    setVista((v) => (v === "items" ? "menu" : v === "menu" ? (mesaId ? "mesa" : "login") : v === "mesas" && !mozo ? "login" : "mesas"));
  };
  const categoriaActual = menu.find((categoria) => String(categoria.id) === String(cat));
  const titulo = vista === "mesas" ? (mozo ? `Hola, ${mozo.nombre}` : "Turnos") : vista === "mesa" ? `Mesa ${mesa?.num}` : vista === "menu" ? "Agregar platos" : categoriaActual?.nombre ?? "Platos";

  if (mostrarReporte) {
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
        <p className="hint">TODO: conectar POST /api/mozos/login. El backend todavía no ofrece este endpoint.</p>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="primary">Ingresar</button>
        <button type="button" className="sec" onClick={() => { setTab("reservas"); setVista("mesas"); }}>Ver turnos</button>
        <button type="button" className="sec" onClick={() => setVista("menu")}>Ver menú</button>
        <button type="button" className="sec" onClick={() => setMostrarReporte(true)}>Ver reporte del día</button>
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
              {mias.length === 0 && <p className="sub">TODO: cargar las mesas desde la API de mesas asignadas al mozo.</p>}
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
              {turnosCargando && <p className="sub">Cargando turnos…</p>}
              {turnosError && (
                  <div className="err" role="alert">
                    <p>No se pudieron cargar los turnos: {turnosError}</p>
                    <button className="sec" onClick={recargarTurnos}>Reintentar</button>
                  </div>
              )}
              {!turnosCargando && !turnosError && misReservas.length === 0 && <p className="sub">Todavía no hay turnos cargados.</p>}
              {/* TODO: poner acá la asignación del turno a una mesa cuando exista la API de mesas. */}
              {misReservas.map((r) => {
                const confirmado = r.estado === "CONFIRMADO";
                return (
                    <div key={r.id} className={"res" + (confirmado ? " done" : "")}>
                      <b>{hora(r.hora)}</b>
                      <span className="grow">
                        {r.clienteNombre || "Cliente sin nombre"}
                        <small>{r.fecha} · {r.cantidadComensales} personas</small>
                      </span>
                      <span className={"chip " + (confirmado ? "gris" : "reservada")}>{r.estado}</span>
                    </div>
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
            {menuCargando && <p className="sub">Cargando categorías y platos…</p>}
            {menuError && (
                <div className="err" role="alert">
                  <p>No se pudo cargar el menú: {menuError}</p>
                  <button className="sec" onClick={recargarMenu}>Reintentar</button>
                </div>
            )}
            {!menuCargando && !menuError && menu.length === 0 && <p className="sub">Todavía no hay categorías cargadas.</p>}
            {!menuCargando && !menuError && menu.length > 0 && (
                <div className="grid cats">
                  {menu.map((categoria) => {
                    const q = suma(carrito.filter((p) => p.categoriaId === categoria.id));
                    const disponibles = categoria.items.filter((item) => item.activo).length;
                    return (
                        <button key={categoria.id} className="cat" onClick={() => { setCat(categoria.id); setVista("items"); }}>
                          {q > 0 && <i className="cnt">{q}</i>}
                          <span className="ico">{categoria.emoji || "🍽️"}</span>
                          <b>{categoria.nombre}</b>
                          <small>{disponibles} disponibles</small>
                        </button>
                    );
                  })}
                </div>
            )}
          </div>
          {n > 0 && mesaId && (
              <div className="foot">
                <button className="primary" onClick={confirmar}>Confirmar · {plat(n)}</button>
                <button className="sec" onClick={cancelarPedido}>Cancelar pedido</button>
              </div>
          )}
          {n > 0 && !mesaId && <p className="hint">TODO: conectar la API para asociar el pedido a una mesa.</p>}
        </>
    );
  };

  const itemsView = () => {
    const n = suma(carrito);
    if (!categoriaActual) {
      return (
          <div className="body">
            <p className="sub">La categoría seleccionada ya no está disponible.</p>
            <button className="primary" onClick={() => setVista("menu")}>Volver al menú</button>
          </div>
      );
    }
    return (
        <>
          <div className="body">
            {categoriaActual.items.map((plato) => {
              const id = String(plato.id);
              const linea = carrito.find((p) => p.id === id);
              const c = linea?.cant ?? 0;
              const desactivado = !plato.activo;
              return (
                  <div key={id} className={"item" + (c ? " on" : "") + (desactivado ? " off" : "")}>
                    <button className="add" disabled={desactivado} onClick={() => sumar(plato)}>
                      {plato.nombre}
                      {desactivado && <small>No disponible</small>}
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
            {n > 0 && mesaId
                ? <button className="primary" onClick={confirmar}>Confirmar · {plat(n)}</button>
                : <button className="primary" onClick={() => setVista(mesaId ? "mesa" : "menu")}>{mesaId ? "Volver a la mesa" : "Volver al menú"}</button>}
            {n > 0 && !mesaId && <p className="hint">TODO: conectar la API para guardar pedidos de mesa.</p>}
            <button className="sec" onClick={volver}>Otra categoría</button>
          </div>
        </>
    );
  };

  return (
      <div className="bz">
        <style>{css}</style>
        <Blobs />
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
            {vista !== "login" && offline && (
                <div className="net off" role="status">Sin conexión con la API.</div>
            )}
            {vista !== "login" && (
                <div className="bar">
                  <button className="back" onClick={volver} aria-label="Volver" style={{ visibility: vista === "mesas" && mozo ? "hidden" : "visible" }}>‹</button>
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
