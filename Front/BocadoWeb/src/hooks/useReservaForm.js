import { useState } from "react";
import { HOY } from "../constants/reservas.js";
import { pasado, emailOk } from "../lib/format.js";
import { crearCliente } from "../services/clientes/crearCliente";
import { crearTurno } from "../services/turnos/crearTurno";

export function useReservaForm(turnos, setTurnos, demo) {
    const [step, setStep] = useState(0);
    const [fecha, setFecha] = useState(HOY);
    const [hora, setHora] = useState("");
    const [comensales, setComensales] = useState(2);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [nota, setNota] = useState("");

    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [creado, setCreado] = useState(null);

    const telOk = !telefono.trim() || telefono.replace(/\D/g, "").length >= 8;
    const datosOk = nombre.trim().length > 1 && apellido.trim().length > 1 && emailOk(email) && telOk;

    const next = () => setStep((s) => Math.min(s + 1, 4));
    const back = () => setStep((s) => Math.max(s - 1, 0));

    const elegirDia = (d) => {
        setFecha(d);
        if (d === HOY && hora && pasado(hora)) setHora("");
    };

    const elegirHora = (h) => {
        setHora(h);
        setTimeout(next, 220);
    };

    const reset = () => {
        setStep(0); setFecha(HOY); setHora(""); setComensales(2);
        setNombre(""); setApellido(""); setEmail(""); setTelefono(""); setNota(""); setCreado(null); setError("");
    };

    const enviar = async () => {
        setSending(true);
        setError("");
        try {
            const datosCliente = { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim(), telefono: telefono.trim() || null };
            const cli = demo
                ? { id: Math.floor(Math.random() * 900 + 100), ...datosCliente }
                : await crearCliente(datosCliente);

            const body = {
                fecha, hora, cantidadComensales: comensales,
                clienteId: cli.id,
                nota: nota.trim() || null,
            };
            const res = demo
                ? { ...body, id: Math.floor(Math.random() * 900 + 100), clienteNombre: `${cli.nombre} ${cli.apellido}` }
                : await crearTurno(body);

            setCreado(res);
            setTurnos((t) => [res, ...t]);
        } catch (err) {
            setError(/fetch|network/i.test(err.message)
                ? "No se pudo conectar con el servidor. Revisá que la API esté corriendo y que CORS permita este origen."
                : err.message);
        }
        setSending(false);
    };

    return {
        step, fecha, hora, comensales, setComensales,
        nombre, setNombre, apellido, setApellido, email, setEmail, telefono, setTelefono, nota, setNota,
        sending, error, creado,
        telOk, datosOk,
        next, back, elegirDia, elegirHora, reset, enviar
    };
}