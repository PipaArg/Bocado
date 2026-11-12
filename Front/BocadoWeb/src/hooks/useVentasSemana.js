import { useEffect, useState } from "react";
import { obtenerVentasSemana } from "../services/reportes/ventasSemana.js";
import { mensajeError } from "../utils/errores.js";

/*
 * Estado de VENTAS DE LA SEMANA.
 * hasta: ultimo dia del grafico (el dia elegido en el reporte)
 */
export const useVentasSemana = (hasta) => {
    const [semana, setSemana] = useState(null);
    const [elegido, setElegido] = useState(6);   // barra seleccionada (6 = ultimo dia)
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            setError("");
            setElegido(6);
            try {
                setSemana(await obtenerVentasSemana(hasta));
            } catch (err) {
                setSemana(null);
                setError(mensajeError(err));
            }
        };
        cargar();
    }, [hasta]);

    // La barra mas alta ocupa el 100%; el resto, proporcional
    const maximo = semana ? Math.max(...semana.dias.map((d) => Number(d.recaudacion)), 1) : 1;
    const dia = semana ? semana.dias[elegido] : null;

    return { semana, elegido, setElegido, dia, maximo, error };
};
