import { useEffect, useState } from "react";
import { listarTurnosDelDia, obtenerSalon, asignarMesa, liberarMesa } from "../services/recepcion/recepcion.js";
import { mensajeError } from "../utils/errores.js";

const HOY = new Date().toLocaleDateString("en-CA");

/*
 * Estado y logica de RECEPCION: turnos del dia, salon, sentar y liberar.
 * La pagina solo dibuja lo que este hook le da.
 */
export const useRecepcion = () => {
    const [fecha, setFecha] = useState(HOY);
    const [turnos, setTurnos] = useState([]);
    const [salon, setSalon] = useState([]);
    const [elegidas, setElegidas] = useState({});   // { turnoId: mesaId }
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");

    const cargar = async () => {
        setCargando(true);
        setError("");
        try {
            const [listaTurnos, listaSalon] = await Promise.all([listarTurnosDelDia(fecha), obtenerSalon()]);
            setTurnos(listaTurnos);
            setSalon(listaSalon);
        } catch (err) {
            setError(mensajeError(err));
        }
        setCargando(false);
    };

    useEffect(() => {
        cargar();
    }, [fecha]);

    // Turnos sin mesa que todavia no llegaron
    const porLlegar = turnos.filter(
        (t) => !t.mesaId && (t.estado === "PENDIENTE" || t.estado === "CONFIRMADO")
    );

    // Mesas libres donde entra esa cantidad de personas
    const mesasPara = (comensales) => salon.filter((m) => !m.ocupada && m.capacidad >= comensales);

    // Mesa elegida en el selector (si no eligio, la primera que sirve)
    const mesaElegida = (turno) => elegidas[turno.id] || mesasPara(turno.cantidadComensales)[0]?.mesaId;

    const elegirMesa = (turnoId, mesaId) => setElegidas({ ...elegidas, [turnoId]: Number(mesaId) });

    const sentar = async (turno) => {
        const mesaId = mesaElegida(turno);
        if (!mesaId) return;
        setError("");
        setAviso("");
        try {
            const res = await asignarMesa(turno.id, mesaId);
            setAviso(`${res.cliente} → Mesa ${res.mesaNumero}`);
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        }
    };

    const liberar = async (mesa) => {
        setError("");
        setAviso("");
        try {
            await liberarMesa(mesa.turno.id);
            setAviso(`Mesa ${mesa.numero} liberada`);
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        }
    };

    return {
        fecha, setFecha, salon, porLlegar, cargando, error, aviso,
        mesasPara, mesaElegida, elegirMesa, sentar, liberar,
    };
};
