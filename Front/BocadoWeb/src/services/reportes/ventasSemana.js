import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// Ventas de los 7 dias que terminan en "hasta" (AAAA-MM-DD)
export const obtenerVentasSemana = async (hasta) => {
    const respuesta = await axios.get(baseURL + '/api/reportes/semana', { params: { hasta } })
    return respuesta.data
}
