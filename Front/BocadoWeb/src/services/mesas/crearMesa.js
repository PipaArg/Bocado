import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const crearMesa = async (datosMesa) => {
    try {
        const respuesta = await axios.post(baseURL + "/api/mesas/crearMesa", datosMesa);
        return respuesta.data;
    } catch (error) {
        console.error("Error al crear la mesa:", error);
        throw error;
    }
};