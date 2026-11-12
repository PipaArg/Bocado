import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const listarTurnos= async () => {
    try {
        const respuesta = await axios.get(baseURL+'/api/turnos/listarTurnos')
        return respuesta.data
    } catch (error) {
        return error
    }

}