import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const actualizarCategoria = async (id, datosActualizados) => {
    try {
        const respuesta = await axios.put(baseURL + `/api/categorias/actualizarCategoria/${id}`, datosActualizados);
        return respuesta.data;
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        throw error;
    }
};