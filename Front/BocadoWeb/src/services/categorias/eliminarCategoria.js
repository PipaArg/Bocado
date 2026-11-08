import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const eliminarCategoria = async (id) => {
    try {
        const respuesta = await axios.delete(baseURL + `api/categorias/eliminarCategoria/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        throw error;
    }
};