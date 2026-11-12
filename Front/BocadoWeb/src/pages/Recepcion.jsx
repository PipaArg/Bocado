import { useRecepcion } from "../hooks/useRecepcion.js";
import css from "../styles/recepcion.css?inline";

// "21:30:00" -> "21:30"  (si viene vacio, no muestra "undef")
const hora = (h) => (h ? String(h).slice(0, 5) : "--:--");

/*
 * Pantalla de RECEPCION. Solo dibuja: la logica esta en useRecepcion.
 * No muestra montos: la recepcionista no maneja plata.
 */
export default function Recepcion() {
    const r = useRecepcion();

    return (
        <div className="rcp">
            <style>{css}</style>

            <div className="rcp-top">
                <div>
                    <span className="rcp-logo">bocado <em>recepción</em></span>
                    <h1>Recepción</h1>
                </div>
                <input type="date" value={r.fecha} onChange={(e) => r.setFecha(e.target.value)} aria-label="Fecha" />
            </div>

            {r.error && <p className="rcp-error">{r.error}</p>}
            {r.aviso && <p className="rcp-aviso">{r.aviso}</p>}
            {r.cargando && <p className="rcp-sub">Cargando…</p>}

            <div className="rcp-grilla">
                <div>
                    <section className="rcp-panel">
                        <h2>Llegadas · {r.porLlegar.length}</h2>
                        {r.porLlegar.length === 0 && <p className="rcp-sub">No hay reservas pendientes para este día.</p>}
                        {r.porLlegar.map((t) => (
                            <FilaLlegada key={t.id} turno={t} opciones={r.mesasPara(t.cantidadComensales)}
                                         mesaElegida={r.mesaElegida(t)}
                                         onElegir={(mesaId) => r.elegirMesa(t.id, mesaId)}
                                         onSentar={() => r.sentar(t)} />
                        ))}
                    </section>

                    {/* NUEVO: cliente que llega sin reserva (solo el dia de hoy) */}
                    {r.esHoy && (
                        <FormSinReserva datos={r.sinReserva} onCambiar={r.cambiarSinReserva}
                                        mesas={r.mesasSinReserva} mesaElegida={r.mesaSinReserva}
                                        onSentar={r.sentarSinReserva} enviando={r.enviandoSinReserva} />
                    )}
                </div>

                <section className="rcp-panel">
                    <h2>Salón</h2>
                    {r.salon.length === 0 && <p className="rcp-sub">No hay mesas activas. Crealas en Administración.</p>}
                    <div className="rcp-mesas">
                        {r.salon.map((m) => (
                            <TarjetaMesa key={m.mesaId} mesa={m} onLiberar={() => r.liberar(m)} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

/* ---- Una reserva por llegar ---- */
function FilaLlegada({ turno, opciones, mesaElegida, onElegir, onSentar }) {
    return (
        <div className="rcp-fila">
            <div>
                <b>{hora(turno.hora)} · {turno.cliente}</b>
                <p className="rcp-sub">{turno.cantidadComensales} personas</p>
            </div>
            {opciones.length === 0 ? (
                <span className="rcp-sub">Sin mesa libre con lugar</span>
            ) : (
                <div className="rcp-acciones">
                    <select value={mesaElegida} onChange={(e) => onElegir(e.target.value)}>
                        {opciones.map((m) => (
                            <option key={m.mesaId} value={m.mesaId}>Mesa {m.numero} ({m.capacidad})</option>
                        ))}
                    </select>
                    <button className="rcp-btn" onClick={onSentar}>Sentar</button>
                </div>
            )}
        </div>
    );
}

/* ---- Cliente sin reserva ---- */
function FormSinReserva({ datos, onCambiar, mesas, mesaElegida, onSentar, enviando }) {
    return (
        <section className="rcp-panel rcp-sinreserva">
            <h2>Cliente sin reserva</h2>
            <p className="rcp-sub">Se sienta solo si hay una mesa libre donde entren.</p>

            <div className="rcp-form">
                <input placeholder="Nombre" value={datos.nombre} onChange={(e) => onCambiar("nombre", e.target.value)} />
                <input placeholder="Apellido (opcional)" value={datos.apellido} onChange={(e) => onCambiar("apellido", e.target.value)} />
                <label className="rcp-pax">
                    <span>Personas</span>
                    <input type="number" min="1" value={datos.comensales}
                           onChange={(e) => onCambiar("comensales", e.target.value)} />
                </label>
                {mesas.length === 0 ? (
                    <span className="rcp-sub">Sin mesa libre con lugar</span>
                ) : (
                    <select value={mesaElegida} onChange={(e) => onCambiar("mesaId", e.target.value)}>
                        {mesas.map((m) => (
                            <option key={m.mesaId} value={m.mesaId}>Mesa {m.numero} ({m.capacidad})</option>
                        ))}
                    </select>
                )}
            </div>

            <button className="rcp-btn rcp-ancho" onClick={onSentar} disabled={enviando || mesas.length === 0}>
                {enviando ? "Sentando…" : "Sentar"}
            </button>
        </section>
    );
}

/* ---- Una mesa del salon ---- */
function TarjetaMesa({ mesa, onLiberar }) {
    return (
        <div className="rcp-mesa">
            <b>Mesa {mesa.numero}</b>
            <small>{mesa.capacidad} lugares</small>
            {!mesa.ocupada && <span className="rcp-chip libre">Libre</span>}
            {mesa.ocupada && (
                <>
                    <span className={"rcp-chip " + (mesa.turno.pagado ? "pagada" : "ocupada")}>
                        {mesa.turno.pagado ? "Pagada" : "Ocupada"}
                    </span>
                    <small>{mesa.turno.cliente} · {mesa.turno.cantidadComensales} pers.</small>
                    {mesa.turno.pagado && (
                        <button className="rcp-btn rcp-btn-sec" onClick={onLiberar}>Liberar</button>
                    )}
                </>
            )}
        </div>
    );
}
