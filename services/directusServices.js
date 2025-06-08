const axios = require('axios');

class DirectusServices {
  constructor() {
    this.baseURL = process.env.DIRECTUS_URL;
    this.apiToken = process.env.DIRECTUS_TOKEN;
    this.usersURL = process.env.DIRECTUS_USERS_URL
  }

    // Helper function to get user data
    async getUserData(token) {
        try {
            console.log('Fetching user data from:', `${this.usersURL}/users/me`);
            const response = await fetch(`${this.usersURL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            });
            
            // console.log('User data response status:', response.status);
            
            if (!response.ok) {
            const errorText = await response.text();
            console.error('User data error response:', errorText);
            throw new Error(`Failed to fetch user data: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            // console.log('User data received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

  // Base principal de consulta a directus segun la coleccion
  async createLog(collection, data,token) {
    try {
        const userData = await this.getUserData(token);

        const userdataRefactor= {
            id: userData.data.id,
            name: userData.data.first_name + ' ' + userData.data.last_name,
            email: userData.data.email
        }
        data.user = userdataRefactor.id
        data.userdata = userdataRefactor
        
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