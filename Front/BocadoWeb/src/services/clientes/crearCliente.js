import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

// Crea un cliente en el back.
// "datos" es el body: { nombre, apellido, email, telefono }
// Si el back rechaza el pedido, el error se LANZA (no se devuelve).
export const crearCliente = async (datos) => {
    const respuesta = await axios.post(baseURL + '/api/clientes/crearCliente', datos)
    return respuesta.data
}
