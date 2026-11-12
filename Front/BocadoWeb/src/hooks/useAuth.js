import { useState, useEffect } from "react";

const leerSesion = () => { //recupera la información del usuario que está guardada en el navegador.
    try {
        return JSON.parse(sessionStorage.getItem("bocado.usuario") || "null");
    } catch {
        sessionStorage.removeItem("bocado.usuario");
        return null;
    }
};

export const useAuth = () => {
    const [usuario, setUsuario] = useState(leerSesion);

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
        window.location.hash = "#/mozos";
    };

    const esAdmin = usuario?.nivel === "ADMIN";

    return { usuario, esAdmin, cerrarSesion };
};