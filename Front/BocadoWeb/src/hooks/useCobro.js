import { useState } from "react";
import { cobrarEfectivo } from "../services/pagos/cobrarEfectivo.js";
import { mensajeError } from "../utils/errores.js";

/*
 * Cobro de una mesa por el ENCARGADO.
 * onCobrado: funcion que se llama cuando el cobro sale bien (para recargar el reporte).
 */
export const useCobro = (onCobrado) => {
    const [cobrando, setCobrando] = useState(null);   // turnoId que se esta cobrando
    const [error, setError] = useState("");

    const cobrar = async (pendiente, textoMonto) => {
        if (!window.confirm(`¿Cobrar ${textoMonto} en efectivo a ${pendiente.cliente}?`)) return;
        setCobrando(pendiente.turnoId);
        setError("");
        try {
            await cobrarEfectivo(pendiente.turnoId);
            onCobrado();
        } catch (err) {
            setError(mensajeError(err));
        }
        setCobrando(null);
    };

    return { cobrar, cobrando, error };
};
