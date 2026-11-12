import { useEffect, useState } from "react";
import { useReportes } from "../hooks/useReportes.js";
import CierreCaja from "../components/CierreCaja.jsx";
import VentasSemana from "../components/VentasSemana.jsx";
import PendientesCobro from "../components/PendientesCobro.jsx";
import css from "../styles/reportes.css?inline";

const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const NOMBRE_METODO = { EFECTIVO: "Efectivo", TARJETA: "Tarjeta", MERCADO_PAGO: "Mercado Pago" };
const NOMBRE_ESTADO = {
    PENDIENTE: "Pendientes", CONFIRMADO: "Confirmados", EN_CURSO: "En el salón",
    FINALIZADO: "Finalizados", CANCELADO: "Cancelados",
};

/*
 * Pagina de Reportes.
 * Cuando el encargado cobra una mesa, hay que recargar TODO (KPIs, grafico,
 * pendientes y caja). Para eso se "remonta" el contenido cambiando su key,
 * y se le pasa la fecha que estaba elegida para no perderla.
 */
export default function Reportes({ onSalir }) {
    const [recarga, setRecarga] = useState(0);
    const [fechaGuardada, setFechaGuardada] = useState(null);

    const recargar = (fecha) => {
        setFechaGuardada(fecha);
        setRecarga((r) => r + 1);
    };

    return <ContenidoReporte key={recarga} fechaInicial={fechaGuardada} onRecargar={recargar} onSalir={onSalir} />;
}

function ContenidoReporte({ fechaInicial, onRecargar, onSalir }) {
    const { fecha, setFecha, reporte, cargando, error } = useReportes();

    // Al recargar, volvemos a la fecha que estaba elegida
    useEffect(() => {
        if (fechaInicial) setFecha(fechaInicial);
    }, []);

    return (
        <div className="rep">
            <style>{css}</style>

            <div className="rep-blob rep-blob-azul" />
            <div className="rep-blob rep-blob-verde" />
            <div className="rep-blob rep-blob-rosa" />

            <div className="rep-contenido">
                <header className="rep-top">
                    <span className="rep-logo">bocado <em>encargado</em></span>
                    {onSalir && (
                        <button className="rep-pill" onClick={onSalir}>Cerrar sesión</button>
                    )}
                </header>

                <main className="rep-panel">
                    <div className="rep-titulo">
                        <h1>Reporte del día</h1>
                        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} aria-label="Fecha" />
                    </div>

                    {cargando && <p className="rep-sub">Cargando…</p>}
                    {error && <p className="rep-err">{error}</p>}

                    {reporte && !cargando && (
                        <>
                            <p className="rep-seccion">Cobrado este día</p>
                            <section className="rep-kpis">
                                <Tarjeta titulo="Recaudación" valor={plata(reporte.recaudacionTotal)} destacada />
                                <Tarjeta titulo="Pagos cobrados" valor={reporte.cantidadPagos} />
                                <Tarjeta titulo="Ticket promedio" valor={plata(reporte.ticketPromedio)} />
                            </section>

                            <section className="rep-card">
                                <h2>Por método de pago</h2>
                                <table>
                                    <tbody>
                                    {Object.entries(reporte.recaudacionPorMetodo).map(([metodo, monto]) => (
                                        <tr key={metodo}>
                                            <td>{NOMBRE_METODO[metodo] || metodo}</td>
                                            <td className="num">{plata(monto)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* NUEVO: el encargado cobra desde aca */}
                            <PendientesCobro pendientes={reporte.pendientesDeCobro} onCobrado={() => onRecargar(fecha)} />

                            <p className="rep-seccion">Últimos 7 días</p>
                            <VentasSemana hasta={fecha} />

                            <p className="rep-seccion">Reservas de este día</p>
                            <section className="rep-kpis">
                                <Tarjeta titulo="Turnos" valor={reporte.cantidadTurnos} />
                                <Tarjeta titulo="Comensales" valor={reporte.comensales} />
                            </section>

                            <section className="rep-card">
                                <h2>Turnos por estado</h2>
                                <table>
                                    <tbody>
                                    {Object.entries(reporte.turnosPorEstado).map(([estado, cantidad]) => (
                                        <tr key={estado}>
                                            <td>{NOMBRE_ESTADO[estado] || estado}</td>
                                            <td className="num">{cantidad}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </section>

                            <p className="rep-seccion">Caja</p>
                            <CierreCaja fecha={fecha} reporte={reporte} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function Tarjeta({ titulo, valor, destacada }) {
    return (
        <div className={destacada ? "rep-kpi rep-kpi-azul" : "rep-kpi"}>
            <small>{titulo}</small>
            <b>{valor}</b>
        </div>
    );
}
