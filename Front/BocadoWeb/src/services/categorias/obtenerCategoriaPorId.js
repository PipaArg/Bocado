import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearCategoria= async () => {
    try {
        const respuesta = await axios.get(baseURL+'api/obtenerCategoria/{id}')
        return respuesta.data
    } catch (error) {
        return error
    }

}