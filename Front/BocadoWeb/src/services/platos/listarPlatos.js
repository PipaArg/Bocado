import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const listarPlatos= async () => {
    try {
        const respuesta = await axios.get(baseURL+'/api/platos/listarPlatos')
        return respuesta.data
    } catch (error) {
        return error
    }

}