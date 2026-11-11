
import axios from "axios";
import { baseURL } from "../../constants/baseURL";

export const actualizarPlato = async (id, datosPlato) => {
    try {
        const respuesta = await axios.put(
            baseURL + `/api/platos/actualizarPlato/${id}`,
            datosPlato
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al actualizar plato:", error);
        throw error;
    }
};
