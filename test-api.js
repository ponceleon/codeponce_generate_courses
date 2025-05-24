// Script de prueba para la API Gemini
require('dotenv').config();
// Importación adecuada para Node.js v18 o superior
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TOKEN = process.env.API_TOKEN || 'your_secret_api_token';
const API_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    // 1. Verificar el estado de la API
    console.log('Probando endpoint de estado...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Respuesta:', healthData);
    console.log('-----------------------------------');
    
    // 2. Obtener modelos disponibles
    console.log('Probando endpoint de modelos...');
    const modelsResponse = await fetch(`${API_URL}/api/gemini/models`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    const modelsData = await modelsResponse.json();
    console.log('Respuesta:', modelsData);
    console.log('-----------------------------------');
    
    // 3. Generar contenido
    console.log('Probando generación de contenido...');
    const generateResponse = await fetch(`${API_URL}/api/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        contents: [
          {
            parts: [
              {
                text: 'Explica cómo funciona la IA en pocas palabras'
              }
            ]
          }
        ]
      })
    });
    
    const generateData = await generateResponse.json();
    console.log('Respuesta:', generateData);
    console.log('-----------------------------------');
    
  } catch (error) {
    console.error('Error al probar la API:', error);
  }
}

testAPI(); 