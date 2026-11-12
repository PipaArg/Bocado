import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// Crea un turno en el back.
// "datos" es el body: { fecha, hora, cantidadComensales, clienteId, nota }
// Si el back rechaza el pedido, el error se LANZA (no se devuelve),
// asi la pantalla lo muestra y no agrega un turno falso a la lista.
export const crearTurno = async (datos) => {
    const respuesta = await axios.post(baseURL + '/api/turnos/crearTurno', datos)
    return respuesta.data
}
