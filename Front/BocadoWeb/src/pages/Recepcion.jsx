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
