import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const actualizarUsuario = async (id, datosActualizados) => {
    try {
        const respuesta = await axios.put(baseURL + `/api/usuarios/actualizarUsuario/${id}`, datosActualizados);
        return respuesta.data;
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        throw error;
    }
};