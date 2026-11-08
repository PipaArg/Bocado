import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const desactivarMesa = async (id) => {
    try {
        const respuesta = await axios.put(baseURL + `api/mesas/desactivarMesa/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al desactivar la mesa:", error);
        throw error;
    }
};