const axios = require('axios');

class DirectusServices {
  constructor() {
    this.baseURL = process.env.DIRECTUS_URL;
    this.apiToken = process.env.DIRECTUS_TOKEN;
  }

  // Base principal de consulta a directus segun la coleccion
  async createLog(collection, data) {
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
  async logGeminiAPI(data) {
    return this.createLog('logs_geminiapi', data);
  }

  // Logs para la tabla logs
  async logGeneral(data) {
    return this.createLog('logs', data);
  }

}


module.exports = new DirectusServices();