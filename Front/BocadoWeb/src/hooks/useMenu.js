import { useCallback, useEffect, useState } from "react";
import { api, EP } from "../lib/api.js";

export default function useMenu() {
  const [menu, setMenu] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const [categorias, platos] = await Promise.all([api(EP.listarCategorias), api(EP.listarPlatos)]);
        if (!Array.isArray(categorias) || !Array.isArray(platos)) throw new Error("La API devolvió un menú inválido");
        if (!cancelado) {
          setMenu(categorias.map((c) => ({ ...c, items: platos.filter((p) => p.categoriaId === c.id) })));
        }
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  return { menu, cargando, error, recargar };
}
