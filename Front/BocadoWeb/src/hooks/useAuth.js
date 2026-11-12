import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const leerSesion = () => {
    try {
        return JSON.parse(sessionStorage.getItem("bocado.usuario") || "null");
    } catch {
        sessionStorage.removeItem("bocado.usuario");
        return null;
    }
};

export const useAuth = () => {
    const [usuario, setUsuario] = useState(leerSesion);
    const navigate = useNavigate(); // Hook de navegación

    useEffect(() => {
        const onSesion = () => setUsuario(leerSesion());
        window.addEventListener("bocado-sesion", onSesion);
        return () => {
            window.removeEventListener("bocado-sesion", onSesion);
        };
    }, []);

    const cerrarSesion = () => {
        sessionStorage.removeItem("bocado.usuario");
        setUsuario(null);

        // Redirección programática con React Router
        navigate("/mozos", { replace: true });
    };

    const esAdmin = usuario?.nivel === "ADMIN";
    const esRecepcion = usuario?.nivel === "RECEPCIONISTA";

    return { usuario, esAdmin, esRecepcion, cerrarSesion };
};