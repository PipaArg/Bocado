import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// El ENCARGADO cobra un turno en efectivo. Si el back lo rechaza, el error se LANZA.
export const cobrarEfectivo = async (turnoId) => {
    const respuesta = await axios.post(baseURL + `/api/turnos/${turnoId}/pago-efectivo`)
    return respuesta.data
}
