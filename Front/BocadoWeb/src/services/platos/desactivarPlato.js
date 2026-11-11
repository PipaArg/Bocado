import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const desactivarPlato = async (id) => {
    try {
        const respuesta = await axios.patch(baseURL + `/api/platos/desactivarPlato/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al desactivar el plato:", error);
        throw error;
    }
};
