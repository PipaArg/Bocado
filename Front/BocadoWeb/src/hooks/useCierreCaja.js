import { useEffect, useState } from "react";
import { obtenerHistorialCaja, cerrarCaja } from "../services/caja/cierreCaja.js";
import { useAuth } from "./useAuth.js";
import { mensajeError } from "../utils/errores.js";

const HOY = new Date().toLocaleDateString("en-CA");

/*
 * Estado y logica del CIERRE DE CAJA.
 * El componente solo dibuja; aca se cargan los datos, se valida y se envia.
 *
 * fecha:   dia elegido en el reporte
 * reporte: reporte de ese dia (para saber el efectivo esperado y los pendientes)
 */
export const useCierreCaja = (fecha, reporte) => {
    const { usuario } = useAuth();

    const [historial, setHistorial] = useState([]);
    const [corrigiendo, setCorrigiendo] = useState(false);
    const [contado, setContado] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [motivo, setMotivo] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    const limpiarFormulario = () => {
        setContado("");
        setObservaciones("");
        setMotivo("");
        setError("");
    };

    const cargarHistorial = async () => {
        try {
            setHistorial(await obtenerHistorialCaja(fecha));
        } catch (err) {
            setError(mensajeError(err));
        }
    };

    // Cada vez que cambia la fecha, empezamos de cero y traemos el historial
    useEffect(() => {
        setHistorial([]);
        setCorrigiendo(false);
        limpiarFormulario();
        cargarHistorial();
    }, [fecha]);

    // ---- Datos calculados ----
    const vigente = historial.find((c) => c.vigente);
    const efectivoEsperado = Number(reporte.recaudacionPorMetodo.EFECTIVO || 0);
    const pendientes = reporte.pendientesDeCobro.length;
    const esFuturo = fecha > HOY;
    const bloqueado = esFuturo || pendientes > 0;
    const diferencia = contado === "" ? null : Number(contado) - efectivoEsperado;

    // ---- Acciones ----
    const empezarCorreccion = () => setCorrigiendo(true);

    const cancelarCorreccion = () => {
        setCorrigiendo(false);
        limpiarFormulario();
    };

    const enviar = async () => {
        if (contado === "" || Number(contado) < 0) {
            setError("Ingresá el efectivo que contaste (0 o más).");
            return;
        }
        if (vigente && !motivo.trim()) {
            setError("Indicá el motivo de la corrección.");
            return;
        }
        setEnviando(true);
        setError("");
        try {
            await cerrarCaja({
                fecha,
                efectivoContado: Number(contado),
                observaciones,
                motivoCorreccion: vigente ? motivo : null,
                cerradoPor: usuario?.nombre || usuario?.usuario || "Encargado",
            });
            setCorrigiendo(false);
            limpiarFormulario();
            await cargarHistorial();
        } catch (err) {
            setError(mensajeError(err));
        }
        setEnviando(false);
    };

    return {
        historial, vigente, corrigiendo,
        contado, setContado, observaciones, setObservaciones, motivo, setMotivo,
        efectivoEsperado, pendientes, esFuturo, bloqueado, diferencia,
        error, enviando,
        empezarCorreccion, cancelarCorreccion, enviar,
    };
};
