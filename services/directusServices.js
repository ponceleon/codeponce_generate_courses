const { directus } = require('./directusConnect');


class DirectusServices {

    // directus = new Directus(process.env.DIRECTUS_URL, {
    // auth: {
    //     staticToken: process.env.DIRECTUS_TOKEN // Usa un token de servicio o admin
    // }
    // });

    // Metodo base para guardar logs en directus
    async logToDirectus(collection, data) {
    try {
        const result = await directus.items(collection).createOne(data);
        return result;
    } catch (error) {
        console.error(`Error guardando log en ${collection}:`, error);
        return null;
    }
    }

    // Metodos espeficicos para cada log
    async logGeminiAPI(data) {
        return logToDirectus('logs_geminiapi', data);
    }

    async logGeneral(data) {
        return logToDirectus('logs', data);
    }

}


module.exports = new DirectusServices();