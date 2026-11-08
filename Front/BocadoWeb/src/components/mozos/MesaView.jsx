import { fmtHora as hora } from "../../lib/format.js";
import { suma, pedidoDe, cantidad, plat } from "../../lib/pedido.js";

export default function MesaView({
                                     mesa, est, resDe, abrirDatos, sentar, pagar, reabrir, liberar, setCarrito, setVista
                                 }) {
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
}