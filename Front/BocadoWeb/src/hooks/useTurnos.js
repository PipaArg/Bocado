import { useCallback, useEffect, useState } from "react";
import { api, EP } from "../lib/api.js";

export default function useTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const data = await api(EP.listarTurnos);
        if (!Array.isArray(data)) throw new Error("La API devolvió una lista de turnos inválida");
        if (!cancelado) setTurnos(data);
      } catch (e) {
        if (!cancelado) setError(e.message || "Error");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  return { turnos, setTurnos, cargando, error, recargar };
}
