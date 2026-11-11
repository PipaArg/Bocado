
import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const crearPlato = async (datosPlato) => {
    try {
        const respuesta = await axios.post(
            baseURL + "/api/platos/crearPlato",
            datosPlato
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al crear plato:", error);
        throw error;
    }
};
