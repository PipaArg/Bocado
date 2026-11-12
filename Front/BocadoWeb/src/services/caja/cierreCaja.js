import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// Servicios del CIERRE DE CAJA. Si el back rechaza el pedido, el error se LANZA.

// Historial de cierres de un dia (lista vacia si no se cerro)
export const obtenerHistorialCaja = async (fecha) => {
    const respuesta = await axios.get(baseURL + '/api/caja/cierres', { params: { fecha } })
    return respuesta.data
}

// Cierra la caja, o la corrige si ese dia ya estaba cerrada
// datos: { fecha, efectivoContado, observaciones, motivoCorreccion, cerradoPor }
export const cerrarCaja = async (datos) => {
    const respuesta = await axios.post(baseURL + '/api/caja/cierres', datos)
    return respuesta.data
}
