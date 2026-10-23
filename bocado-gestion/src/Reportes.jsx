import { useEffect, useState } from "react";
import { api, EP } from "./api.js";

/* ───────── Config ───────── */
// Fecha de hoy en formato AAAA-MM-DD (el que entiende el back)
const HOY = new Date().toLocaleDateString("en-CA");

// Convierte un numero a pesos: 12500 -> "$ 12.500,00"
const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const NOMBRE_METODO = { EFECTIVO: "Efectivo", TARJETA: "Tarjeta", MERCADO_PAGO: "Mercado Pago" };
const NOMBRE_ESTADO = { PENDIENTE: "Pendientes", CONFIRMADO: "Confirmados", CANCELADO: "Cancelados" };

/* ───────── Componente ─────────
 * onSalir: funcion que recibe desde App.jsx para cerrar la sesion.
 */
export default function Reportes({ onSalir }) {
  // Estado del componente (useState)
  const [fecha, setFecha] = useState(HOY);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // useEffect: cada vez que cambia "fecha", pedimos el reporte al back
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

/* ───────── Estilos (mismo look que bocado) ───────── */
const css = `
.rep{position:relative;min-height:100vh;overflow:hidden;color:#1d1d1f;
  background:linear-gradient(160deg,#dfe9ff,#f3e6ff 55%,#ffe7ef);
  font:16px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",system-ui,sans-serif}
.rep *{box-sizing:border-box}
/* Pisamos estilos globales de index.css de gestion (centrado y titulos claros) */
.rep{text-align:left}
.rep h1,.rep h2,.rep b{color:inherit}
.rep h1{color:#1d1d1f}
.rep-kpi-azul b{color:#fff}

.rep-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.75;pointer-events:none}
.rep-blob-azul{width:380px;height:380px;top:-90px;left:-70px;background:#7db4ff}
.rep-blob-verde{width:260px;height:260px;bottom:18%;left:12%;background:#8ee8c0;opacity:.55}
.rep-blob-rosa{width:340px;height:340px;bottom:-80px;right:-40px;background:#ff9fc4}

.rep-contenido{position:relative;max-width:820px;margin:0 auto;padding:40px 16px 64px}

.rep-top{display:flex;justify-content:space-between;align-items:center;margin:0 6px 14px}
.rep-logo{font-weight:700;font-size:24px;letter-spacing:-.04em}
.rep-logo em{font-style:normal;font-weight:500;font-size:15px;color:#6e6e73;letter-spacing:0;margin-left:4px}
.rep-pill{font:inherit;color:#1d1d1f;cursor:pointer;padding:8px 16px;border-radius:999px;font-size:14px;font-weight:500;
  background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.75);backdrop-filter:blur(20px)}

.rep-panel{padding:28px 26px;border-radius:38px;background:rgba(255,255,255,.5);
  border:1px solid rgba(255,255,255,.75);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
  box-shadow:0 30px 80px -24px rgba(50,70,140,.4),inset 0 1px 0 rgba(255,255,255,.9)}

.rep-titulo{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:10px}
.rep h1{margin:0;font-size:34px;font-weight:800;letter-spacing:-.03em}
.rep input[type=date]{font:inherit;padding:12px 16px;border:none;border-radius:16px;
  background:rgba(255,255,255,.85);box-shadow:0 1px 3px rgba(0,0,0,.06);color:#1d1d1f}
.rep input[type=date]:focus{outline:3px solid #0a84ff80;outline-offset:2px}

.rep-seccion{margin:18px 4px 10px;font-size:13px;font-weight:600;color:#6e6e73;text-transform:uppercase;letter-spacing:.04em}
.rep-sub{color:#6e6e73;margin:0}
.rep-err{padding:14px 18px;border-radius:18px;background:rgba(255,59,48,.12);color:#b3261e}

.rep-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:14px}
.rep-kpi{padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.85);
  display:flex;flex-direction:column;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.rep-kpi small{color:#6e6e73;font-size:14px}
.rep-kpi b{font-size:26px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.rep-kpi-azul{background:#0a84ff;color:#fff}
.rep-kpi-azul small{color:rgba(255,255,255,.85)}

.rep-card{padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.62);margin-bottom:14px}
.rep-card h2{margin:0 0 8px;font-size:15px;font-weight:600;color:#6e6e73}
.rep table{width:100%;border-collapse:collapse}
.rep th{text-align:left;font-size:13px;color:#8e8e93;font-weight:600;padding:6px 0}
.rep td{padding:11px 0;border-top:1px solid #0000000f}
.rep .num{text-align:right;font-variant-numeric:tabular-nums}
`;
