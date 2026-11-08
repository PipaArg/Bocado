import { ESTADO } from "../../constants/mozos.js";
import { fmtHora as hora } from "../../lib/format.js";

export default function MesasView({
                                      tab, setTab, pendientes, mesasCargando, mesasError, cargarMesas, mozo, mias, est, irMesa,
                                      turnosCargando, turnosError, recargarTurnos, misReservas, resDe
                                  }) {
    const chico = (m, e) => {
        const r = resDe(m);
        return e === "LIBRE" ? `${m.cap} lugares` : e === "RESERVADA" ? `${hora(r.hora)} · ${r.nombre.split(" ")[0]}` : `desde ${hora(m.desde)}`;
    };

    return (
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
                    {mesasCargando && <p className="sub">Cargando tus mesas…</p>}
                    {mesasError && (
                        <div className="err" role="alert">
                            <p>No se pudieron cargar las mesas: {mesasError}</p>
                            <button className="sec" onClick={() => cargarMesas(mozo)}>Reintentar</button>
                        </div>
                    )}
                    {!mesasCargando && !mesasError && mias.length === 0 && <p className="sub">No tenés mesas asignadas.</p>}
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
}