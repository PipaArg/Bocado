import { baseURL } from "../../constants/baseURL";
import axios from 'axios';

export const getReporteDiario = async () => {
    try {
        const respuesta = await axios.get(baseURL+'/api/reportes/dia')
        return respuesta.data
    } catch (error) {
        return error
    }

} 