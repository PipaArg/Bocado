import { useEffect, useState } from "react";
import { api, EP } from "../lib/api.js";
import css from "../styles/reportes.css?inline";

/* ───────── Config ───────── */
// Fecha de hoy en formato AAAA-MM-DD (el que entiende el back)
const HOY = new Date().toLocaleDateString("en-CA");

// Convierte un numero a pesos: 12500 -> "$ 12.500,00"
const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const NOMBRE_METODO = { EFECTIVO: "Efectivo", TARJETA: "Tarjeta", MERCADO_PAGO: "Mercado Pago" };
const NOMBRE_ESTADO = { PENDIENTE: "Pendientes", CONFIRMADO: "Confirmados", CANCELADO: "Cancelados" };

/* ───────── Componente ─────────
 * onSalir: funcion que recibe desde Mozos.jsx para cerrar la sesion.
 */
export default function Reportes({ onSalir }) {
  const [fecha, setFecha] = useState(HOY);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Cada vez que cambia "fecha", pedimos el reporte al back
  useEffect(() => {
    setCargando(true);
    setError("");

    api(`${EP.reporteDiario}?fecha=${encodeURIComponent(fecha)}`)
      .then((datos) => setReporte(datos))
      .catch((err) => {
        setReporte(null);
        setError("No se pudo cargar el reporte (" + err.message + "). Revisá que el back esté corriendo.");
      })
      .finally(() => setCargando(false));
  }, [fecha]);

  return (
    <div className="rep">
      <style>{css}</style>

      {/* Manchas de color del fondo (mismo estilo que el resto de bocado) */}
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
              {/* Plata: se cuenta el dia en que se COBRO */}
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

              {/* Salon: se cuenta el dia de la RESERVA */}
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

              {/* Mesas que consumieron y no pagaron */}
              <section className="rep-card">
                <h2>Pendientes de cobro</h2>
                {reporte.pendientesDeCobro.length === 0 ? (
                  <p className="rep-sub">No hay mesas pendientes de cobro.</p>
                ) : (
                  <table>
                    <thead>
                      <tr><th>Turno</th><th>Hora</th><th>Cliente</th><th className="num">Total</th></tr>
                    </thead>
                    <tbody>
                      {reporte.pendientesDeCobro.map((p) => (
                        <tr key={p.turnoId}>
                          <td>#{p.turnoId}</td>
                          <td>{String(p.hora).slice(0, 5)}</td>
                          <td>{p.cliente}</td>
                          <td className="num">{plata(p.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* Componente chico reutilizable: recibe datos por props */
function Tarjeta({ titulo, valor, destacada }) {
  return (
    <div className={destacada ? "rep-kpi rep-kpi-azul" : "rep-kpi"}>
      <small>{titulo}</small>
      <b>{valor}</b>
    </div>
  );
}
