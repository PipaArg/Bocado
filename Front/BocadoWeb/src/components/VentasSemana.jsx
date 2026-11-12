import { useVentasSemana } from "../hooks/useVentasSemana.js";
import css from "../styles/ventasSemana.css?inline";

const plata = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// "2026-11-11" -> "11/11"
const diaMes = (f) => {
    const [, m, d] = String(f).split("-");
    return `${d}/${m}`;
};

// +12.5 -> "+12,5%"
const porcentaje = (v) => (v > 0 ? "+" : "") + v.toLocaleString("es-AR") + "%";

/*
 * Grafico de ventas de 7 dias. Solo dibuja: los datos vienen de useVentasSemana.
 * Prop: hasta (ultimo dia del grafico).
 */
export default function VentasSemana({ hasta }) {
    const { semana, elegido, setElegido, dia, maximo, error } = useVentasSemana(hasta);

    if (error) return <p className="rep-err">{error}</p>;
    if (!semana) return <p className="rep-sub">Cargando…</p>;

    return (
        <>
            <style>{css}</style>

            <section className="rep-card">
                <div className="vs-top">
                    <h2>Ventas de la semana</h2>
                    <b className="vs-total">{plata(semana.totalSemana)}</b>
                </div>
                <p className="rep-sub">{diaMes(semana.desde)} al {diaMes(semana.hasta)} · tocá una barra para ver el día</p>

                <div className="vs-barras">
                    {semana.dias.map((d, i) => (
                        <Barra key={d.fecha} dia={d} alto={(Number(d.recaudacion) / maximo) * 100}
                               activa={i === elegido} onClick={() => setElegido(i)} />
                    ))}
                </div>

                <DetalleDia dia={dia} />
            </section>

            <RankingPlatos platos={semana.rankingPlatos} />
        </>
    );
}

/* ---- Una barra del grafico ---- */
function Barra({ dia, alto, activa, onClick }) {
    return (
        <button className={"vs-col" + (activa ? " vs-activa" : "")} onClick={onClick}
                aria-label={`${dia.nombreDia} ${plata(dia.recaudacion)}`}>
            <span className="vs-barra" style={{ height: `${alto}%` }} />
            <small>{dia.nombreDia.slice(0, 3)}</small>
        </button>
    );
}

/* ---- Tarjeta negra del dia elegido ---- */
function DetalleDia({ dia }) {
    return (
        <div className="vs-tarjeta">
            <div className="vs-top">
                <b>{dia.nombreDia} {diaMes(dia.fecha)}</b>
                {dia.variacion !== null && (
                    <span className={"vs-var " + (dia.variacion >= 0 ? "vs-sube" : "vs-baja")}>
                        {porcentaje(dia.variacion)}
                    </span>
                )}
            </div>
            <p className="vs-monto">{plata(dia.recaudacion)}</p>
            <p className="vs-gris">
                {dia.cantidadPagos} pago(s)
                {dia.variacion !== null ? " · vs. el " + dia.nombreDia.toLowerCase() + " anterior" : ""}
            </p>

            {dia.platoTop ? (
                <div className="vs-top-plato">
                    <span className="vs-numero">#1</span>
                    <div>
                        <b>{dia.platoTop.nombre}</b>
                        <p className="vs-gris">{dia.platoTop.cantidad} vendidos · {plata(dia.platoTop.total)}</p>
                    </div>
                </div>
            ) : (
                <p className="vs-gris">Sin ventas este día.</p>
            )}
        </div>
    );
}

/* ---- Ranking de la semana ---- */
function RankingPlatos({ platos }) {
    return (
        <section className="rep-card">
            <h2>Platos más vendidos de la semana</h2>
            {platos.length === 0 ? (
                <p className="rep-sub">Todavía no hay ventas en estos 7 días.</p>
            ) : (
                <table>
                    <thead>
                    <tr><th>#</th><th>Plato</th><th className="num">Unidades</th><th className="num">Total</th></tr>
                    </thead>
                    <tbody>
                    {platos.slice(0, 5).map((p, i) => (
                        <tr key={p.platoId}>
                            <td>{i + 1}</td>
                            <td>{p.nombre}</td>
                            <td className="num">{p.cantidad}</td>
                            <td className="num">{plata(p.total)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
