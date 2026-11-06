import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const loginUsuarios= async () => {
    try {
        const respuesta = await axios.post(baseURL+'/api/usuarios/login')
        return respuesta.data
    } catch (error) {
        return error
    }

}