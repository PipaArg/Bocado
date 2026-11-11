
import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const crearUsuario = async (datosUsuario) => {
    try {
        const respuesta = await axios.post(
            baseURL + "/api/usuarios/crearUsuario",
            datosUsuario
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al crear usuario:", error);
        throw error;
    }
};
