
import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const crearCategoria = async (datosCategoria) => {
    try {
        const respuesta = await axios.post(
            baseURL + "/api/categorias/crearCategoria",
            datosCategoria
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al crear categoría:", error);
        throw error;
    }
};
