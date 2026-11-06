import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const listarUsuarios= async () => {
    try {
        const respuesta = await axios.get(baseURL+'/api/usuarios/listarUsuarios')
        return respuesta.data
    } catch (error) {
        return error
    }

}