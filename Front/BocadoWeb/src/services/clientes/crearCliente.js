
import { baseURL } from "../../constants/baseURL";
import axios from "axios";

export const crearCliente = async (datosCliente) => {
    try {
        const respuesta = await axios.post(
            baseURL + "/api/clientes/crearCliente",
            datosCliente
        );

        return respuesta.data;
    } catch (error) {
        console.error("Error al crear cliente:", error);
        throw error;
    }
};
