import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// Suma UNA unidad de un plato al turno (pedido de la mesa).
// Si el back lo rechaza, el error se LANZA.
export const agregarPlatoTurno = async (turnoId, platoId) => {
    const respuesta = await axios.post(baseURL + `/api/turnos/${turnoId}/platos/${platoId}`)
    return respuesta.data
}
