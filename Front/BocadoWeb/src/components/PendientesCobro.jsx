import { useCobro } from "../hooks/useCobro.js";
import css from "../styles/pendientesCobro.css?inline";

const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

/*
 * Mesas con consumo sin cobrar. El encargado las cobra desde aca.
 * Props: pendientes (del reporte) y onCobrado (para recargar el reporte).
 */
export default function PendientesCobro({ pendientes, onCobrado }) {
    const { cobrar, cobrando, error } = useCobro(onCobrado);

    return (
        <section className="rep-card">
            <style>{css}</style>
            <h2>Pendientes de cobro</h2>
            {error && <p className="rep-err">{error}</p>}

            {pendientes.length === 0 ? (
                <p className="rep-sub">No hay mesas pendientes de cobro.</p>
            ) : (
                <div className="pc-scroll">
                    <table>
                        <thead>
                        <tr><th>Turno</th><th>Hora</th><th>Cliente</th><th className="num">Total</th><th></th></tr>
                        </thead>
                        <tbody>
                        {pendientes.map((p) => (
                            <tr key={p.turnoId}>
                                <td>#{p.turnoId}</td>
                                <td>{p.hora ? String(p.hora).slice(0, 5) : "--:--"}</td>
                                <td>{p.cliente}</td>
                                <td className="num">{plata(p.total)}</td>
                                <td className="num">
                                    <button className="pc-btn" disabled={cobrando !== null}
                                            onClick={() => cobrar(p, plata(p.total))}>
                                        {cobrando === p.turnoId ? "Cobrando…" : "Cobrar efectivo"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
