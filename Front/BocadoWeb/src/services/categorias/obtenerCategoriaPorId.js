import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const obtenerCategoria = async (id) => {
    try {
        const respuesta = await axios.get(baseURL + `api/obtenerCategoria/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al obtener la categoría:", error);
        throw error;
    }
};