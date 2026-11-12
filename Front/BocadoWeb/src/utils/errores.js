/*
 * Convierte un error de axios en un mensaje claro para el usuario.
 *
 * Uso en cualquier pantalla:
 *   import { mensajeError } from "../utils/errores.js";
 *   ...
 *   } catch (err) {
 *     setError(mensajeError(err));
 *   }
 */

// Mensajes por defecto si el back no manda uno propio
const POR_DEFECTO = {
    400: "Revisá los datos ingresados.",
    401: "Tu sesión venció. Volvé a ingresar.",
    403: "No tenés permiso para hacer esto.",
    404: "No se encontró lo que buscabas.",
    409: "Ya existe un registro con esos datos.",
    500: "Error del servidor. Intentá de nuevo en unos minutos.",
};

export function mensajeError(err) {
    // Sin respuesta: el back esta apagado o no hay conexion
    if (!err?.response) {
        return "No se pudo conectar con el servidor. Revisá que el back esté corriendo.";
    }

    const status = err.response.status;
    const data = err.response.data;

    // 1) El back mando un texto
    if (typeof data === "string" && data.trim()) {
        return data;
    }

    if (data && typeof data === "object") {
        // 2) El back mando { message: "..." } o { detail: "..." }
        if (data.message) return data.message;
        if (data.detail) return data.detail;
        if (data.mensaje) return data.mensaje;

        // 3) Errores de validacion: { nombre: "El nombre es obligatorio", ... }
        const textos = Object.values(data).filter((v) => typeof v === "string");
        if (status === 400 && textos.length) {
            return textos.join(" · ");
        }
    }

    // 4) Si no vino nada util, usamos el mensaje por defecto
    return POR_DEFECTO[status] || "Ocurrió un error inesperado (" + status + ").";
}
