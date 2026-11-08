import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const activarMesa = async (id) => {
    try {
        const respuesta = await axios.put(baseURL + `api/mesas/activarMesa/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al activar la mesa:", error);
        throw error;
    }
};