import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearCategoria= async () => {
    try {
        const respuesta = await axios.post(baseURL+'/api/categorias/crearCategorias')
        return respuesta.data
    } catch (error) {
        return error
    }

}