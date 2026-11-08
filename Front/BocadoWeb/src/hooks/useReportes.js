import { useState, useEffect } from "react";
// Fecha de hoy en formato AAAA-MM-DD
const HOY = new Date().toLocaleDateString("en-CA");

import { getReporteDiario } from "../services/reportes/getReporteDiario.js";

export function useReportes() {
    const [fecha, setFecha] = useState(HOY);
    const [reporte, setReporte] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError("");

        getReporteDiario(fecha)
            .then((datos) => {
                if (!cancelado) setReporte(datos);
            })
            .catch((err) => {
                if (!cancelado) {
                    setReporte(null);
                    setError("No se pudo cargar el reporte (" + err.message + "). Revisá que el back esté corriendo.");
                }
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [fecha]);

    return {
        fecha,
        setFecha,
        reporte,
        cargando,
        error,
    };
}