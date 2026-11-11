import { useState } from "react";
import useOnline from "../hooks/useOnline.js";
import useMenu from "../hooks/useMenu.js";
import useTurnos from "../hooks/useTurnos.js";
import { nid } from "../lib/id.js";
import { loginUsuarios } from "../services/usuarios/loginUsuarios";
import { listarMesas } from "../services/mesas/listarMesas";

export function useMozos() {
    const [mozo, setMozo] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [mesasCargando, setMesasCargando] = useState(false);
    const [mesasError, setMesasError] = useState("");

    const { turnos: reservas, setTurnos: setReservas, cargando: turnosCargando, error: turnosError, recargar: recargarTurnos } = useTurnos();
    const { menu, cargando: menuCargando, error: menuError, recargar: recargarMenu } = useMenu();
    const offline = !useOnline();

    const [vista, setVista] = useState("login"); // login | mesas | mesa | menu | items
    const [tab, setTab] = useState("mesas"); // mesas | reservas
    const [mesaId, setMesaId] = useState(null);
    const [cat, setCat] = useState(null);
    const [sheet, setSheet] = useState(null); // perfil | datos | abrir | nota
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [err, setErr] = useState("");

    // Estados para modales / datos de mesa
    const [dq, setDq] = useState("");
    const [dev, setDev] = useState("");
    const [dh, setDh] = useState("");
    const [carrito, setCarrito] = useState([]);
    const [notaId, setNotaId] = useState(null);
    const [dn, setDn] = useState("");

    const mias = mesas.filter((m) => m.mozoId === mozo?.id);
    const mesa = mesas.find((m) => m.id === mesaId);
    const resDe = (m) => reservas.find((r) => r.mesaId === m.id && r.estado === "PENDIENTE");
    const est = (m) => (m.estado === "LIBRE" && resDe(m) ? "RESERVADA" : m.estado);
    const misReservas = reservas.slice().sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
    const pendientes = misReservas.filter((r) => r.estado === "PENDIENTE").length;

    const upd = (id, fn) => setMesas((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

    const abrirNota = (id) => {
        setNotaId(id);
        setDn(carrito.find((p) => p.id === id)?.nota ?? "");
        setSheet("nota");
    };

    const guardarNota = () => {
        setCarrito((c) => c.map((p) => (p.id === notaId ? { ...p, nota: dn.trim() } : p)));
        setSheet(null);
    };

    const cargarMesas = async (usuarioAutenticado) => {
        setMesasCargando(true);
        setMesasError("");
        try {
            const lista = await listarMesas();
            setMesas(lista
                .filter((m) => m.activa && m.mozoId === usuarioAutenticado.id)
                .map((m) => ({
                    id: m.id,
                    mozoId: m.mozoId,
                    num: m.numero,
                    cap: m.capacidad,
                    estado: "LIBRE",
                    hist: [],
                    desde: null,
                    quien: "",
                    evento: "",
                })));
        } catch (error) {
            setMesasError(error.message);
        } finally {
            setMesasCargando(false);
        }
    };

    const login = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            const usuarioAutenticado = await loginUsuarios({ usuario: usuario.trim(), clave });
            sessionStorage.setItem("bocado.usuario", JSON.stringify(usuarioAutenticado));
            window.dispatchEvent(new Event("bocado-sesion"));
            setMozo(usuarioAutenticado);
            setTab("mesas");
            setVista("mesas");
            await cargarMesas(usuarioAutenticado);
            if (usuarioAutenticado.nivel === "ADMIN") {
                window.location.hash = "#/admin";
            }
        } catch (error) {
            setErr(error.response?.data?.mensaje || (error.response ? "No se pudo iniciar sesión" : "No se pudo conectar con el servidor"));
        }
    };

    const salir = () => {
        sessionStorage.removeItem("bocado.usuario");
        window.dispatchEvent(new Event("bocado-sesion"));
        setSheet(null); setMozo(null); setUsuario(""); setTab("mesas"); setVista("login");
    };

    const abrirDatos = (modo) => {
        const d = mesa.desde ? new Date(mesa.desde) : new Date();
        setDq(mesa.quien === "Sin reserva" ? "" : mesa.quien);
        setDev(mesa.evento);
        setDh(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
        setSheet(modo);
    };

    const guardarDatos = () => {
        const d = new Date();
        const [h, mi] = (dh || "00:00").split(":").map(Number);
        d.setHours(h, mi, 0, 0);
        const ts = d.getTime();
        upd(mesaId, (m) => ({
            ...m, quien: dq.trim() || "Sin reserva", evento: dev, desde: ts,
            estado: m.estado === "LIBRE" ? "OCUPADA" : m.estado,
            hist: m.estado === "LIBRE" ? [{ id: nid(), ts, tipo: "ocupada", items: [] }] : m.hist.map((x) => (x.tipo === "ocupada" ? { ...x, ts } : x)),
        }));
        setSheet(null);
    };

    const sentar = () => {
        const r = resDe(mesa);
        const ts = Date.now();
        upd(mesaId, (m) => ({ ...m, estado: "OCUPADA", desde: ts, quien: r.nombre, evento: r.evento, hist: [{ id: nid(), ts, tipo: "ocupada", items: [] }] }));
        setReservas((rs) => rs.map((x) => (x.id === r.id ? { ...x, estado: "SENTADA" } : x)));
    };

    const marca = (tipo, estado) => upd(mesaId, (m) => ({ ...m, estado, hist: [...m.hist, { id: nid(), ts: Date.now(), tipo, items: [] }] }));

    const pagar = () => marca("pagar", "A_PAGAR");
    const reabrir = () => marca("reabrir", "OCUPADA");

    const liberar = () => {
        upd(mesaId, (m) => ({ ...m, estado: "LIBRE", hist: [], desde: null, quien: "", evento: "" }));
        setVista("mesas");
    };

    const sumar = (plato) => {
        if (!plato.activo) return;
        const id = String(plato.id);
        setCarrito((c) => (c.some((p) => p.id === id)
            ? c.map((p) => (p.id === id ? { ...p, cant: p.cant + 1 } : p))
            : [...c, { id, nombre: plato.nombre, categoriaId: plato.categoriaId, cant: 1 }]));
    };

    const restar = (id) => setCarrito((c) => c.map((p) => (p.id === id ? { ...p, cant: p.cant - 1 } : p)).filter((p) => p.cant > 0));

    const confirmar = () => {
        if (!mesaId) {
            setErr("TODO: conectar la API de pedidos de mesa.");
            return;
        }
        upd(mesaId, (m) => ({ ...m, hist: [...m.hist, { id: nid(), ts: Date.now(), tipo: "pedido", items: carrito }] }));
        setCarrito([]); setVista("mesa");
    };

    const cancelarPedido = () => { setCarrito([]); setVista(mesaId ? "mesa" : "menu"); };

    const irMesa = (id) => { setMesaId(id); setVista("mesa"); };

    const volver = () => {
        if (vista === "menu") setCarrito([]);
        setVista((v) => (v === "items" ? "menu" : v === "menu" ? (mesaId ? "mesa" : "login") : v === "mesas" && !mozo ? "login" : "mesas"));
    };

    return {
        mozo, mesas, mesasCargando, mesasError, cargarMesas,
        reservas, turnosCargando, turnosError, recargarTurnos,
        menu, menuCargando, menuError, recargarMenu,
        offline, vista, setVista, tab, setTab, mesaId, cat, setCat,
        sheet, setSheet, usuario, setUsuario, clave, setClave, err,
        dq, setDq, dev, setDev, dh, setDh, carrito, setCarrito,
        notaId, dn, setDn, mias, mesa, resDe, est, misReservas, pendientes,
        login, salir, abrirDatos, guardarDatos, sentar, pagar, reabrir, liberar,
        sumar, restar, confirmar, cancelarPedido, irMesa, volver,
        abrirNota, guardarNota
    };
}