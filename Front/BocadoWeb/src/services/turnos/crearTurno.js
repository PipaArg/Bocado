import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearTurno= async () => {
    try {
        const respuesta = await axios.post(baseURL+'/api/turnos/crearTurno')
        return respuesta.data
    } catch (error) {
        return error
    }

}