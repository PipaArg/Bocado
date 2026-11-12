import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// Servicios de RECEPCION. Si el back rechaza el pedido, el error se LANZA.

export const listarTurnosDelDia = async (fecha) => {
    const respuesta = await axios.get(baseURL + '/api/recepcion/turnos', { params: { fecha } })
    return respuesta.data
}

export const obtenerSalon = async () => {
    const respuesta = await axios.get(baseURL + '/api/recepcion/salon')
    return respuesta.data
}

export const asignarMesa = async (turnoId, mesaId) => {
    const respuesta = await axios.put(baseURL + `/api/recepcion/turnos/${turnoId}/mesa/${mesaId}`)
    return respuesta.data
}

export const liberarMesa = async (turnoId) => {
    const respuesta = await axios.put(baseURL + `/api/recepcion/turnos/${turnoId}/liberar`)
    return respuesta.data
}
