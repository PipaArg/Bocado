import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const listarClientes= async () => {
    try {
        const respuesta = await axios.get(baseURL+'/api/clientes/listarClientes')
        return respuesta.data
    } catch (error) {
        return error
    }

}