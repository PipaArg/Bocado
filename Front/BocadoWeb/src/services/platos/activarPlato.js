import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const activarPlato = async (id) => {
    try {
        const respuesta = await axios.patch(baseURL + `/api/platos/activarPlato/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al activar el plato:", error);
        throw error;
    }
};
