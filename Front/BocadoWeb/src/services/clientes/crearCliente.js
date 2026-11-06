import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearCliente= async () => {
    try {
        const respuesta = await axios.post(baseURL+'/api/clientes/crearCliente')
        return respuesta.data
    } catch (error) {
        return error
    }

}