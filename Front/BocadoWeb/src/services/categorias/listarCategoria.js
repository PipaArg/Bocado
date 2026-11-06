import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const listarCategoria= async () => {
    try {
        const respuesta = await axios.get(baseURL+'/api/categorias/listarCategorias')
        return respuesta.data
    } catch (error) {
        return error
    }

}