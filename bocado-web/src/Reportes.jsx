import { useEffect, useState } from "react";

/* ───────── Config ───────── */
// Misma URL del back que usa App.jsx
const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

// Fecha de hoy en formato AAAA-MM-DD (el que entiende el back)
const HOY = new Date().toLocaleDateString("en-CA");

// Convierte un numero a pesos: 12500 -> "$ 12.500,00"
const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const NOMBRE_METODO = { EFECTIVO: "Efectivo", TARJETA: "Tarjeta", MERCADO_PAGO: "Mercado Pago" };
const NOMBRE_ESTADO = { PENDIENTE: "Pendientes", CONFIRMADO: "Confirmados", CANCELADO: "Cancelados" };

/* ───────── Componente ───────── */
export default function Reportes() {
  // Estado del componente (useState)
  const [fecha, setFecha] = useState(HOY);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // useEffect: cada vez que cambia "fecha", pedimos el reporte al back
  useEffect(() => {
    setCargando(true);
    setError("");

    fetch(`${API}/api/reportes/dia?fecha=${fecha}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error " + res.status);
        return res.json();
      })
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

      {/* Manchas de color del fondo (mismo estilo que la reserva) */}
      <div className="rep-blob rep-blob-azul" />
      <div className="rep-blob rep-blob-verde" />
      <div className="rep-blob rep-blob-rosa" />

      <div className="rep-contenido">
        <header className="rep-top">
          <span className="rep-logo">bocado</span>
          <span className="rep-pill">Encargado</span>
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
              {/* Tarjetas principales */}
              <section className="rep-kpis">
                <Tarjeta titulo="Recaudación" valor={plata(reporte.recaudacionTotal)} destacada />
                <Tarjeta titulo="Pagos cobrados" valor={reporte.cantidadPagos} />
                <Tarjeta titulo="Ticket promedio" valor={plata(reporte.ticketPromedio)} />
                <Tarjeta titulo="Comensales" valor={reporte.comensales} />
              </section>

              {/* Recaudación por método de pago */}
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

              {/* Turnos por estado */}
              <section className="rep-card">
                <h2>Turnos · {reporte.cantidadTurnos}</h2>
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

/* ───────── Estilos (copiados del look de la reserva) ───────── */
const css = `
.rep{position:relative;min-height:100vh;overflow:hidden;color:#1d1d1f;
  background:linear-gradient(135deg,#dfe8ff 0%,#ece9ff 45%,#fbeaf6 100%);
  font:16px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",system-ui,sans-serif}
.rep *{box-sizing:border-box}

/* Manchas difuminadas del fondo */
.rep-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.75;pointer-events:none}
.rep-blob-azul{width:460px;height:460px;top:-140px;left:-120px;background:#8fb8ff}
.rep-blob-verde{width:360px;height:360px;bottom:40px;left:-60px;background:#bfe8d8}
.rep-blob-rosa{width:420px;height:420px;bottom:-160px;right:-120px;background:#ffb3d1}

.rep-contenido{position:relative;max-width:820px;margin:0 auto;padding:56px 20px 64px}

/* Encabezado: logo + pastilla, igual que "bocado / Turnos · 3" */
.rep-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding:0 8px}
.rep-logo{font-weight:800;font-size:28px;letter-spacing:-.04em}
.rep-pill{padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.65);
  border:1px solid rgba(255,255,255,.9);font-size:17px}

/* Panel de vidrio (como la tarjeta grande de la reserva) */
.rep-panel{padding:32px 30px;border-radius:40px;background:rgba(255,255,255,.55);
  border:1px solid rgba(255,255,255,.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  box-shadow:0 20px 60px rgba(80,80,140,.12)}

.rep-titulo{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.rep h1{margin:0;font-size:36px;font-weight:800;letter-spacing:-.03em}
.rep input[type=date]{font:inherit;padding:12px 16px;border:none;border-radius:16px;
  background:rgba(255,255,255,.85);box-shadow:0 1px 3px rgba(0,0,0,.06);color:#1d1d1f}
.rep input[type=date]:focus{outline:2px solid #0a84ff;outline-offset:2px}

.rep-sub{color:#6e6e73;margin:0}
.rep-err{padding:14px 18px;border-radius:18px;background:#ffebe9;color:#b3261e}

/* Tarjetas KPI (como los botones de dias) */
.rep-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px}
.rep-kpi{padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.85);
  display:flex;flex-direction:column;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.rep-kpi small{color:#6e6e73;font-size:14px}
.rep-kpi b{font-size:26px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
/* La principal en azul, como el dia seleccionado */
.rep-kpi-azul{background:#0a84ff;color:#fff}
.rep-kpi-azul small{color:rgba(255,255,255,.85)}

/* Bloques de tabla */
.rep-card{padding:20px 22px;border-radius:24px;background:rgba(255,255,255,.7);margin-bottom:14px}
.rep-card h2{margin:0 0 8px;font-size:15px;font-weight:600;color:#6e6e73}
.rep table{width:100%;border-collapse:collapse}
.rep th{text-align:left;font-size:13px;color:#8e8e93;font-weight:600;padding:6px 0}
.rep td{padding:11px 0;border-top:1px solid rgba(0,0,0,.06)}
.rep .num{text-align:right;font-variant-numeric:tabular-nums}
`;
