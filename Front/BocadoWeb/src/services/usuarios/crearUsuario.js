import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearUsuario= async () => {
    try {
        const respuesta = await axios.post(baseURL+'/api/usarios/crearUsuario')
        return respuesta.data
    } catch (error) {
        return error
    }

}