const axios = require('axios');

class DirectusServices {
  constructor() {
    this.baseURL = process.env.DIRECTUS_URL;
    this.apiToken = process.env.DIRECTUS_LOGSADMIN_TOKEN;
  }

  // Base principal de consulta a directus segun la coleccion
  async createLog(collection, data,token) {
    try {    
        const response = await axios.post(
            `${this.baseURL}/items/${collection}`,
            data,
            {
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json'
            }
            }
        );
        return response.data;

    } catch (error) {
      console.error(`Error guardando log en ${collection}:`, error.message);
      return null;
    }
  }

  // Log para api gemini
  async logGeminiAPI(data,token) {
    return this.createLog('logs_geminiapi', data,token);
  }

  // Logs para la tabla logs
  async logGeneral(data,token) {
    return this.createLog('logs', data,token);
  }

}


module.exports = new DirectusServices();