const fs = require('fs');
require('dotenv').config();

async function testImageGeneration() {
  const API_TOKEN = process.env.API_TOKEN;
  const BASE_URL = 'http://localhost:3000';
  
  if (!API_TOKEN) {
    console.error('Error: API_TOKEN no está configurado en .env');
    return;
  }

  const requestPayload = {
    prompt: "Generate a beautiful image of a sunset over mountains with a lake in the foreground, painted in watercolor style",
    model: "gemini-2.0-flash-preview-image-generation"
  };

  try {
    console.log('🚀 Iniciando prueba de generación de imágenes...');
    console.log('📝 Prompt:', requestPayload.prompt);
    console.log('🤖 Modelo:', requestPayload.model);
    console.log('⏳ Enviando solicitud...\n');

    const response = await fetch(`${BASE_URL}/api/gemini/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(requestPayload)
    });

    const responseData = await response.json();

    console.log('📊 Estado de respuesta:', response.status);
    console.log('📋 Datos de respuesta:');
    console.log(JSON.stringify(responseData, null, 2));

    if (responseData.success && responseData.data.imageBase64) {
      // Guardar la imagen generada
      const imageBuffer = Buffer.from(responseData.data.imageBase64, 'base64');
      const filename = `generated_image_${Date.now()}.png`;
      fs.writeFileSync(filename, imageBuffer);
      
      console.log(`✅ Imagen generada exitosamente y guardada como: ${filename}`);
      console.log(`📏 Tamaño de imagen: ${Math.round(imageBuffer.length / 1024)} KB`);
      
      if (responseData.data.textContent) {
        console.log(`📝 Texto acompañante: ${responseData.data.textContent}`);
      }
      
      if (responseData.result.tokenUsage) {
        console.log(`🔢 Uso de tokens:`, responseData.result.tokenUsage);
      }
    } else {
      console.log('❌ Error en la generación de imagen');
      if (responseData.error) {
        console.log('🚨 Error:', responseData.error);
        console.log('📄 Detalles:', responseData.details);
      }
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testImageGeneration(); 