
import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const loginUsuarios = async (credenciales) => {
    try {
        const respuesta = await axios.post(
            baseURL + "/api/usuarios/login",
            credenciales
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
};
