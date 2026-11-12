import { useCierreCaja } from "../hooks/useCierreCaja.js";
import css from "../styles/cierreCaja.css?inline";

const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// "2026-11-11T21:35:10" -> "11/11 21:35"
const fechaHora = (s) => {
    const [f, h] = String(s).split("T");
    const [, m, d] = f.split("-");
    return `${d}/${m} ${String(h).slice(0, 5)}`;
};

/*
 * Cierre de caja del dia. Solo dibuja: la logica esta en useCierreCaja.
 * Props: fecha (dia elegido) y reporte (reporte de ese dia).
 */
export default function CierreCaja({ fecha, reporte }) {
    const caja = useCierreCaja(fecha, reporte);
    const { vigente, corrigiendo, historial } = caja;

    return (
        <>
            <style>{css}</style>

            {vigente && !corrigiendo && <CajaCerrada cierre={vigente} bloqueado={caja.bloqueado} onCorregir={caja.empezarCorreccion} />}

            {(!vigente || corrigiendo) && <FormularioCaja caja={caja} />}

            {historial.length > 1 && <HistorialCaja historial={historial} />}
        </>
    );
}

/* ---- Cierre vigente (solo lectura) ---- */
function CajaCerrada({ cierre, bloqueado, onCorregir }) {
    return (
        <section className="rep-card">
            <h2>Caja cerrada</h2>
            <p className="rep-sub">Por {cierre.cerradoPor || "—"} · {fechaHora(cierre.fechaHoraCierre)}</p>
            <table>
                <tbody>
                <tr><td>Total cobrado</td><td className="num">{plata(cierre.totalSistema)}</td></tr>
                <tr><td>Efectivo esperado</td><td className="num">{plata(cierre.efectivoSistema)}</td></tr>
                <tr><td>Efectivo contado</td><td className="num">{plata(cierre.efectivoContado)}</td></tr>
                <tr>
                    <td><ChipDiferencia dif={Number(cierre.diferencia)} /></td>
                    <td className="num"><b>{plata(cierre.diferencia)}</b></td>
                </tr>
                </tbody>
            </table>
            {cierre.observaciones && <p className="rep-sub caja-nota">📝 {cierre.observaciones}</p>}
            {cierre.motivoCorreccion && <p className="rep-sub caja-nota">✎ Corrección: {cierre.motivoCorreccion}</p>}

            <button className="caja-btn caja-btn-sec" onClick={onCorregir} disabled={bloqueado}>
                Corregir cierre
            </button>
        </section>
    );
}

/* ---- Formulario: primer cierre o correccion ---- */
function FormularioCaja({ caja }) {
    const { vigente, bloqueado, esFuturo, pendientes, diferencia } = caja;

    return (
        <section className="rep-card">
            <h2>{vigente ? "Corregir cierre de caja" : "Cierre de caja"}</h2>

            <table>
                <tbody>
                <tr><td>Efectivo esperado (según el sistema)</td><td className="num"><b>{plata(caja.efectivoEsperado)}</b></td></tr>
                </tbody>
            </table>

            <label className="caja-label" htmlFor="caja-contado">Efectivo contado en caja</label>
            <input id="caja-contado" className="caja-input" type="number" min="0" step="0.01"
                   value={caja.contado} onChange={(e) => caja.setContado(e.target.value)}
                   disabled={bloqueado} placeholder="0,00" />

            {diferencia !== null && (
                <p className="caja-dif"><ChipDiferencia dif={diferencia} /> {plata(diferencia)}</p>
            )}

            {vigente && (
                <>
                    <label className="caja-label" htmlFor="caja-motivo">Motivo de la corrección (obligatorio)</label>
                    <input id="caja-motivo" className="caja-input" value={caja.motivo}
                           onChange={(e) => caja.setMotivo(e.target.value)}
                           placeholder="Ej: conté mal los billetes de $1000" />
                </>
            )}

            <label className="caja-label" htmlFor="caja-obs">Observaciones (opcional)</label>
            <textarea id="caja-obs" className="caja-input" rows="2" value={caja.observaciones}
                      onChange={(e) => caja.setObservaciones(e.target.value)}
                      disabled={bloqueado} placeholder="Ej: faltante por vuelto mal dado" />

            {esFuturo && <p className="rep-sub caja-aviso">No se puede cerrar la caja de un día futuro.</p>}
            {!esFuturo && pendientes > 0 && (
                <p className="rep-sub caja-aviso">Hay {pendientes} mesa(s) con consumo sin cobrar. Cobralas antes de cerrar.</p>
            )}
            {caja.error && <p className="rep-err">{caja.error}</p>}

            <div className="caja-acciones">
                {vigente && (
                    <button className="caja-btn caja-btn-sec" onClick={caja.cancelarCorreccion}>Cancelar</button>
                )}
                <button className="caja-btn" onClick={caja.enviar} disabled={bloqueado || caja.enviando}>
                    {caja.enviando ? "Guardando…" : vigente ? "Guardar corrección" : "Cerrar caja"}
                </button>
            </div>
        </section>
    );
}

/* ---- Historial (auditoria) ---- */
function HistorialCaja({ historial }) {
    return (
        <section className="rep-card">
            <h2>Historial de cierres · {historial.length}</h2>
            <div className="caja-scroll">
                <table>
                    <thead>
                    <tr><th>Fecha y hora</th><th>Por</th><th className="num">Contado</th><th className="num">Diferencia</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                    {historial.map((c) => (
                        <tr key={c.id}>
                            <td>{fechaHora(c.fechaHoraCierre)}</td>
                            <td>
                                {c.cerradoPor || "—"}
                                {c.motivoCorreccion && <small className="caja-motivo">{c.motivoCorreccion}</small>}
                            </td>
                            <td className="num">{plata(c.efectivoContado)}</td>
                            <td className="num">{plata(c.diferencia)}</td>
                            <td>
                                <span className={"caja-chip " + (c.vigente ? "caja-ok" : "caja-gris")}>
                                    {c.vigente ? "Vigente" : "Reemplazado"}
                                </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/* ---- Chip de color segun la diferencia ---- */
function ChipDiferencia({ dif }) {
    if (dif === 0) return <span className="caja-chip caja-ok">Caja cuadrada</span>;
    if (dif > 0) return <span className="caja-chip caja-sobra">Sobrante</span>;
    return <span className="caja-chip caja-falta">Faltante</span>;
}
