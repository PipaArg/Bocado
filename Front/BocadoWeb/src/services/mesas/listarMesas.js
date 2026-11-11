import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const listarMesas = async () => {
    try {
        const respuesta = await axios.get(baseURL + "/api/mesas/listarMesas");
        return respuesta.data;
    } catch (error) {
        console.error("Error al listar las mesas:", error);
        throw error;
    }
};