require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Vamos a usar una variable para almacenar la instancia de GoogleGenAI
let genAI = null;

// Función para inicializar la API de forma asíncrona
const initializeGeminiAPI = async () => {
  try {
    if (!genAI) {
      const { GoogleGenAI, Modality } = await import('@google/genai'); // MODIFIED
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return genAI;
  } catch (error) {
    console.error('Error al inicializar Gemini API:', error);
    return null;
  }
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Acceso no autorizado: Token requerido' });
  if (token !== process.env.API_TOKEN) return res.status(403).json({ success: false, error: 'Acceso prohibido: Token inválido' });
  next();
};

const SYSTEM_PROMPT_TEMPLATE = `You are an experienced curriculum developer specializing in creating comprehensive and engaging online courses. Your task is to design a course outline, focusing on providing a structured learning path for students.

Create a course outline. The outline should be in JSON format and include the following elements:

1. **Course Title:** A creative and engaging title for the entire course on {keywords}.
2. **Module Titles:** Seven distinctive and descriptive titles for the course modules. Each module should cover a specific area of {keywords}.
3. **Lesson Titles:** For each module, create a list of lesson titles. The total number of lesson titles for all modules should be between 25 and 40. Each lesson title should be concise and clearly indicate the topic covered in that lesson.

**Important:** Provide only the titles. Do not include descriptions or additional content.

The JSON output must follow this structure:
\`\`\`json
{
  "course_title": "[Course Title]",
  "modules": [
    {
      "module_title": "[Module 1 Title]",
      "lessons": [
        "[Lesson 1 Title]",
        "[Lesson 2 Title]"
      ]
    },
    {
      "module_title": "[Module 2 Title]",
      "lessons": [
        "[Lesson 1 Title]",
        "[Lesson 2 Title]"
      ]
    }
  ]
}
\`\`\`
Ensure that the total number of lesson titles across all seven modules is between 25 and 40.
The content must be in Spanish.`;

app.post('/api/gemini/generate', authenticateToken, async (req, res) => {
  try {
    const { model: modelName, keywords, generationConfig, safetySettings, tools } = req.body;

    if (!modelName) return res.status(400).json({ success: false, error: 'Se requiere especificar un modelo' });
    if (!keywords || typeof keywords !== 'string' || keywords.trim() === '') {
      return res.status(400).json({ success: false, error: 'Se requiere proporcionar "keywords" (palabras clave) como un string no vacío.' });
    }

    const genAI = await initializeGeminiAPI();
    if (!genAI) return res.status(500).json({ success: false, error: 'Error al inicializar la API de Gemini' });

    const populatedPrompt = SYSTEM_PROMPT_TEMPLATE.replace(/{keywords}/g, keywords);
    const newContents = [{ role: "user", parts: [{ text: populatedPrompt }] }];

    // Usar la estructura de requestConfig de tu código original
    // que se pasa a genAI.models.generateContent()
    const requestConfig = {
      model: modelName, // El nombre del modelo como string
      contents: newContents,
    };
    if (generationConfig) requestConfig.generationConfig = generationConfig;
    if (safetySettings) requestConfig.safetySettings = safetySettings;
    if (tools) requestConfig.tools = tools;

    // LLAMADA A LA API USANDO TU MÉTODO ORIGINAL
    // Esto asume que `genAI.models.generateContent` existe y funciona como en tu implementación original.
    const geminiSdkResponse = await genAI.models.generateContent(requestConfig);

    // A partir de aquí, asumimos que `geminiSdkResponse` podría tener una estructura
    // similar a `GenerativeModelResponse` de la documentación de `js-genai`,
    // específicamente la propiedad `response` anidada.
    // SI ESTO FALLA, necesitarás inspeccionar `geminiSdkResponse` directamente.
    // console.log('SDK Response:', JSON.stringify(geminiSdkResponse, null, 2)); // Descomenta para depurar

    const apiResponse = geminiSdkResponse.response; // Intento de acceder a la respuesta anidada.

    let tokenUsage = null;
    // Verifica si apiResponse existe y luego accede a usageMetadata
    if (apiResponse && apiResponse.usageMetadata) {
        tokenUsage = apiResponse.usageMetadata;
    } else if (geminiSdkResponse.usageMetadata) {
        // Fallback: si usageMetadata está en el nivel superior de geminiSdkResponse
        tokenUsage = geminiSdkResponse.usageMetadata;
    }


    const resultInfo = {
        modelUsed: modelName,
        tokenUsage: tokenUsage || "Información de tokens no disponible en la respuesta.",
        generationConfigUsed: generationConfig,
        safetySettingsUsed: safetySettings,
    };

    // Verifica si apiResponse existe antes de acceder a promptFeedback
    if (apiResponse && apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
      return res.status(400).json({
        success: false,
        result: resultInfo,
        error: 'Contenido bloqueado por la API de Gemini',
        details: `Razón: ${apiResponse.promptFeedback.blockReasonMessage || apiResponse.promptFeedback.blockReason}`,
        promptFeedback: apiResponse.promptFeedback
      });
    } else if (geminiSdkResponse.promptFeedback && geminiSdkResponse.promptFeedback.blockReason) {
        // Fallback: si promptFeedback está en el nivel superior
         return res.status(400).json({
            success: false,
            result: resultInfo,
            error: 'Contenido bloqueado por la API de Gemini',
            details: `Razón: ${geminiSdkResponse.promptFeedback.blockReasonMessage || geminiSdkResponse.promptFeedback.blockReason}`,
            promptFeedback: geminiSdkResponse.promptFeedback
        });
    }

    let rawTextOutput = null;
    if (apiResponse && apiResponse.candidates && apiResponse.candidates.length > 0 &&
        apiResponse.candidates[0].content && apiResponse.candidates[0].content.parts && apiResponse.candidates[0].content.parts.length > 0 &&
        apiResponse.candidates[0].content.parts[0].text) {
      rawTextOutput = apiResponse.candidates[0].content.parts[0].text;
    } else if (geminiSdkResponse.candidates && geminiSdkResponse.candidates.length > 0 &&  // Fallback
               geminiSdkResponse.candidates[0].content && geminiSdkResponse.candidates[0].content.parts &&
               geminiSdkResponse.candidates[0].content.parts.length > 0 && geminiSdkResponse.candidates[0].content.parts[0].text) {
      rawTextOutput = geminiSdkResponse.candidates[0].content.parts[0].text;
    } else if (typeof geminiSdkResponse.text === 'string') { // Fallback a tu extracción original
        rawTextOutput = geminiSdkResponse.text;
    }


    if (rawTextOutput === null || rawTextOutput.trim() === "") {
      // Si rawTextOutput sigue siendo null después de los intentos, o está vacío
      // y no hubo un error de bloqueo anterior.
      let message = "La API de Gemini devolvió una respuesta vacía o en formato inesperado.";
      if (rawTextOutput === null) {
          message = "No se pudo extraer texto de la respuesta de Gemini. Estructura inesperada."
          console.error("Estructura de respuesta de Gemini inesperada:", JSON.stringify(geminiSdkResponse, null, 2));
          return res.status(500).json({
            success: false,
            result: resultInfo,
            error: message,
            details: "Revisa los logs del servidor para la estructura de la respuesta."
          });
      }
      return res.status(200).json({
        success: true,
        result: resultInfo,
        data: {},
        message: message
      });
    }

    let textToParse = rawTextOutput;
    const jsonCodeBlockRegex = /```json\s*\n([\s\S]*?)\n\s*```/;
    const match = textToParse.match(jsonCodeBlockRegex);
    if (match && match[1]) textToParse = match[1].trim();

    let jsonData;
    try {
      jsonData = JSON.parse(textToParse);
      return res.json({
        success: true,
        result: resultInfo,
        data: jsonData
      });
    } catch (jsonError) {
      return res.json({
        success: true,
        result: resultInfo,
        data: {
            raw_text: rawTextOutput,
            parse_error: "El contenido devuelto por Gemini no es un JSON válido o no está en el formato esperado."
        },
        message: "El contenido devuelto por Gemini no pudo ser interpretado como JSON estructurado."
      });
    }

  } catch (error) {
    console.error('Error al generar contenido:', error);
    console.error('Stack trace:', error.stack); // Imprimir stack trace para más detalles
    const errorResultInfo = {
        modelUsed: req.body.model,
        tokenUsage: "No disponible debido a error en la generación.",
        generationConfigUsed: req.body.generationConfig,
        safetySettingsUsed: req.body.safetySettings,
    };

    // Intentar dar una respuesta más específica si es un error de la API de Google
    // (esto es una suposición, la estructura real del error puede variar)
    if (error.name && error.name.includes('Google')) { // Ejemplo: 'GoogleGenerativeAIError'
        return res.status(500).json({
            success: false,
            result: errorResultInfo,
            error: `Error de la API de Gemini: ${error.name}`,
            details: error.message,
            error_object: error // Enviar el objeto de error completo puede ayudar a depurar
        });
    }
    
    return res.status(500).json({
      success: false,
      result: errorResultInfo,
      error: 'Error al procesar la solicitud',
      details: error.message
    });
  }
});

app.post('/api/gemini/generate-image', authenticateToken, async (req, res) => {
  try {
    const { prompt, model: modelNameFromRequest, generationConfig: userGenerationConfig, safetySettings } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, error: 'Se requiere proporcionar "prompt" como un string no vacío.' });
    }

    const modelName = modelNameFromRequest || 'gemini-2.0-flash-preview-image-generation'; // Default model

    const genAI = await initializeGeminiAPI();
    if (!genAI) return res.status(500).json({ success: false, error: 'Error al inicializar la API de Gemini' });

    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    // Ensure responseModalities is set for image generation
    const generationConfig = {
      ...(userGenerationConfig || {}), // Spread existing user config or empty object
      responseModalities: [Modality.TEXT, Modality.IMAGE] // MODIFIED
    };
    
    const requestConfig = {
      model: modelName,
      contents: contents,
      generationConfig: generationConfig,
    };
    if (safetySettings) requestConfig.safetySettings = safetySettings;

    const geminiSdkResponse = await genAI.models.generateContent(requestConfig);
    const apiResponse = geminiSdkResponse.response;

    let tokenUsage = null;
    if (apiResponse && apiResponse.usageMetadata) {
        tokenUsage = apiResponse.usageMetadata;
    } else if (geminiSdkResponse.usageMetadata) {
        tokenUsage = geminiSdkResponse.usageMetadata;
    }

    const resultInfo = {
        modelUsed: modelName,
        tokenUsage: tokenUsage || "Información de tokens no disponible en la respuesta.",
        generationConfigUsed: generationConfig, // Use the merged/created one
        safetySettingsUsed: safetySettings,
    };

    if (apiResponse && apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
      return res.status(400).json({
        success: false,
        result: resultInfo,
        error: 'Contenido bloqueado por la API de Gemini',
        details: `Razón: ${apiResponse.promptFeedback.blockReasonMessage || apiResponse.promptFeedback.blockReason}`,
        promptFeedback: apiResponse.promptFeedback
      });
    } else if (geminiSdkResponse.promptFeedback && geminiSdkResponse.promptFeedback.blockReason) {
         return res.status(400).json({
            success: false,
            result: resultInfo,
            error: 'Contenido bloqueado por la API de Gemini',
            details: `Razón: ${geminiSdkResponse.promptFeedback.blockReasonMessage || geminiSdkResponse.promptFeedback.blockReason}`,
            promptFeedback: geminiSdkResponse.promptFeedback
        });
    }

    let imageBase64 = null;
    let mimeType = null;

    if (apiResponse && apiResponse.candidates && apiResponse.candidates.length > 0 &&
        apiResponse.candidates[0].content && apiResponse.candidates[0].content.parts) {
      for (const part of apiResponse.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType;
          break; // Assuming one image for now
        }
        // Optional: Log text parts if needed
        // if (part.text) {
        //   console.log("Text part received:", part.text);
        // }
      }
    } else if (geminiSdkResponse.candidates && geminiSdkResponse.candidates.length > 0 && // Fallback
               geminiSdkResponse.candidates[0].content && geminiSdkResponse.candidates[0].content.parts) {
       for (const part of geminiSdkResponse.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType;
          break; // Assuming one image for now
        }
      }
    }


    if (!imageBase64) {
      console.error("No se encontró imagen en la respuesta de Gemini:", JSON.stringify(geminiSdkResponse, null, 2));
      return res.status(500).json({
        success: false,
        result: resultInfo,
        error: 'No se encontró imagen en la respuesta de la API de Gemini.',
        details: "La estructura de la respuesta no contenía datos de imagen esperados."
      });
    }

    return res.json({
      success: true,
      data: {
        imageBase64: imageBase64,
        mimeType: mimeType,
        modelUsed: modelName
      },
      result: resultInfo // Including full resultInfo for consistency
    });

  } catch (error) {
    console.error('Error al generar imagen:', error);
    console.error('Stack trace:', error.stack);
    const errorResultInfo = {
        modelUsed: req.body.model || 'gemini-2.0-flash-preview-image-generation', // Attempt to get model
        tokenUsage: "No disponible debido a error en la generación.",
        generationConfigUsed: req.body.generationConfig, // User provided
        safetySettingsUsed: req.body.safetySettings,
    };

    if (error.name && error.name.includes('Google')) {
        return res.status(500).json({
            success: false,
            result: errorResultInfo,
            error: `Error de la API de Gemini: ${error.name}`,
            details: error.message,
            error_object: error
        });
    }
    
    return res.status(500).json({
      success: false,
      result: errorResultInfo,
      error: 'Error al procesar la solicitud de generación de imagen',
      details: error.message
    });
  }
});


// Rutas /api/gemini/models y /api/health (sin cambios significativos)
app.get('/api/gemini/models', authenticateToken, async (req, res) => {
  try {
    // Added image generation models to the list
    return res.json({
      success: true,
      data: { models: [
        'gemini-1.5-pro-latest', 
        'gemini-1.5-flash-latest', 
        'gemini-pro',
        'gemini-2.0-flash-preview-image-generation' // Example image model
      ] }
    });
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    return res.status(500).json({ success: false, error: 'Error al procesar la solicitud', details: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'online', message: 'API Gemini Proxy funcionando correctamente' }});
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});