import { useEffect, useState } from "react";
import { listarTurnosDelDia, obtenerSalon, asignarMesa, liberarMesa } from "../services/recepcion/recepcion.js";
import { crearCliente } from "../services/clientes/crearCliente.js";
import { crearTurno } from "../services/turnos/crearTurno.js";
import { mensajeError } from "../utils/errores.js";

const HOY = new Date().toLocaleDateString("en-CA");

// Hora actual en formato del back: "21:05:00"
const horaActual = () => new Date().toTimeString().slice(0, 5) + ":00";

/*
 * Estado y logica de RECEPCION: turnos del dia, salon, sentar, liberar
 * y clientes SIN RESERVA. La pagina solo dibuja lo que este hook le da.
 */
export const useRecepcion = () => {
    const [fecha, setFecha] = useState(HOY);
    const [turnos, setTurnos] = useState([]);
    const [salon, setSalon] = useState([]);
    const [elegidas, setElegidas] = useState({});   // { turnoId: mesaId }
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");

    // Formulario de cliente sin reserva
    const [sinReserva, setSinReserva] = useState({ nombre: "", apellido: "", comensales: 2, mesaId: "" });
    const [enviandoSinReserva, setEnviandoSinReserva] = useState(false);

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

    // ---- Cliente sin reserva ----
    const cambiarSinReserva = (campo, valor) => setSinReserva({ ...sinReserva, [campo]: valor });

    // Mesas libres para el formulario, y la elegida (o la primera que sirve)
    const mesasSinReserva = mesasPara(Number(sinReserva.comensales) || 1);
    const mesaSinReserva = sinReserva.mesaId || mesasSinReserva[0]?.mesaId || "";

    const sentarSinReserva = async () => {
        const comensales = Number(sinReserva.comensales);
        if (!sinReserva.nombre.trim() || comensales < 1) {
            setError("Completá el nombre y la cantidad de personas.");
            return;
        }
        if (!mesaSinReserva) {
            setError(`No hay mesa libre para ${comensales} personas.`);
            return;
        }
        setEnviandoSinReserva(true);
        setError("");
        setAviso("");
        try {
            // 1) Cliente. El back exige email: se genera uno interno porque no reservo online.
            const cliente = await crearCliente({
                nombre: sinReserva.nombre.trim(),
                apellido: sinReserva.apellido.trim() || "Sin reserva",
                email: `sinreserva.${Date.now()}@bocado.local`,
            });

            // 2) Turno de hoy, a la hora actual
            const turno = await crearTurno({
                fecha: HOY,
                hora: horaActual(),
                cantidadComensales: comensales,
                clienteId: cliente.id,
            });

            // 3) Sentarlo en la mesa (mismas reglas que una reserva)
            const res = await asignarMesa(turno.id, Number(mesaSinReserva));

            setAviso(`${res.cliente} → Mesa ${res.mesaNumero}`);
            setSinReserva({ nombre: "", apellido: "", comensales: 2, mesaId: "" });
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        }
        setEnviandoSinReserva(false);
    };

    return {
        fecha, setFecha, salon, porLlegar, cargando, error, aviso,
        mesasPara, mesaElegida, elegirMesa, sentar, liberar,
        esHoy: fecha === HOY,
        sinReserva, cambiarSinReserva, mesasSinReserva, mesaSinReserva,
        sentarSinReserva, enviandoSinReserva,
    };
};
