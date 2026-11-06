import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearPlato= async () => {
    try {
        const respuesta = await axios.post(baseURL+'/api/platos/crearPlato')
        return respuesta.data
    } catch (error) {
        return error
    }

}