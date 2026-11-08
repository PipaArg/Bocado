import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const actualizarMesa = async (id, datosActualizados) => {
    try {
        const respuesta = await axios.put(baseURL + `api/mesas/actualizarMesa/${id}`, datosActualizados);
        return respuesta.data;
    } catch (error) {
        console.error("Error al actualizar la mesa:", error);
        throw error;
    }
};