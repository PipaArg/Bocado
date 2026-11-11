
import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const crearTurno = async (datosTurno) => {
    try {
        const respuesta = await axios.post(
            baseURL + "/api/turnos/crearTurno",
            datosTurno
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al crear turno:", error);
        throw error;
    }
};
