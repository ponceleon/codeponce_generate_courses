require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.config');

const logs = require('./services/DirectusServices');

// Vamos a usar una variable para almacenar la instancia de GoogleGenAI
let genAI = null;

// Función para inicializar la API de forma asíncrona
const initializeGeminiAPI = async () => {
  try {
    if (!genAI) {
      const { GoogleGenAI } = await import('@google/genai');
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

// Rutas de documentación
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gemini Proxy - Documentación',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Ruta para obtener la documentación en formato JSON
app.get('/doc.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Ruta para obtener la documentación en formato markdown
app.get('/doc.md', (req, res) => {
  const markdown = generateMarkdownDoc();
  res.setHeader('Content-Type', 'text/markdown');
  res.send(markdown);
});

// Función para generar documentación en markdown
function generateMarkdownDoc() {
  const timestamp = new Date().toISOString();
  
  return `# API Gemini Proxy - Documentación

**Generado automáticamente el:** ${timestamp}

## Descripción
API intermedia para Gemini API protegida por token para generar cursos automáticamente.

## URL Base
\`http://localhost:${process.env.PORT || 3000}\`

## Autenticación
Todas las rutas (excepto \`/api/health\` y las de documentación) requieren autenticación mediante Bearer Token.

**Header requerido:**
\`\`\`
Authorization: Bearer TU_TOKEN_AQUI
\`\`\`

## Endpoints Disponibles

### 1. Health Check
- **URL:** \`GET /api/health\`
- **Descripción:** Verificar el estado de la API
- **Autenticación:** No requerida
- **Respuesta:**
\`\`\`json
{
  "success": true,
  "data": {
    "status": "online",
    "message": "API Gemini Proxy funcionando correctamente"
  }
}
\`\`\`

### 2. Obtener Modelos Disponibles
- **URL:** \`GET /api/gemini/models\`
- **Descripción:** Retorna la lista de modelos de Gemini disponibles
- **Autenticación:** Bearer Token requerido
- **Respuesta:**
\`\`\`json
{
  "success": true,
  "data": {
    "models": [
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest", 
      "gemini-pro"
    ]
  }
}
\`\`\`

### 3. Generar Estructura de Curso
- **URL:** \`POST /api/gemini/generate\`
- **Descripción:** Genera automáticamente la estructura de un curso completo
- **Autenticación:** Bearer Token requerido
- **Body (JSON):**
\`\`\`json
{
  "model": "gemini-1.5-pro-latest",
  "keywords": "JavaScript y desarrollo web",
  "generationConfig": {
    "maxOutputTokens": 2048,
    "temperature": 0.7,
    "topP": 0.8,
    "topK": 40
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
\`\`\`

**Parámetros obligatorios:**
- \`model\` (string): Modelo de Gemini a utilizar
- \`keywords\` (string): Palabras clave para generar el curso

**Parámetros opcionales:**
- \`generationConfig\` (object): Configuración de generación
- \`safetySettings\` (array): Configuraciones de seguridad
- \`tools\` (array): Herramientas adicionales

**Respuesta exitosa:**
\`\`\`json
{
  "success": true,
  "result": {
    "modelUsed": "gemini-1.5-pro-latest",
    "tokenUsage": {
      "promptTokens": 150,
      "candidatesTokens": 500,
      "totalTokens": 650
    },
    "generationConfigUsed": {...},
    "safetySettingsUsed": [...]
  },
  "data": {
    "course_title": "Curso Completo de JavaScript y Desarrollo Web",
    "modules": [
      {
        "module_title": "Fundamentos de JavaScript",
        "lessons": [
          "Variables y tipos de datos",
          "Operadores y expresiones",
          "Estructuras de control"
        ]
      }
    ]
  }
}
\`\`\`

## Ejemplos de cURL

### Health Check
\`\`\`bash
curl -X GET "http://localhost:3000/api/health"
\`\`\`

### Obtener Modelos
\`\`\`bash
curl -X GET "http://localhost:3000/api/gemini/models" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"
\`\`\`

### Generar Curso
\`\`\`bash
curl -X POST "http://localhost:3000/api/gemini/generate" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-1.5-pro-latest",
    "keywords": "JavaScript y desarrollo web",
    "generationConfig": {
      "maxOutputTokens": 2048,
      "temperature": 0.7
    }
  }'
\`\`\`

## Códigos de Estado HTTP

- **200**: Operación exitosa
- **400**: Error en los parámetros de entrada
- **401**: Token no proporcionado
- **403**: Token inválido
- **500**: Error interno del servidor

## Formatos de Respuesta

Todas las respuestas siguen el formato estándar:
\`\`\`json
{
  "success": boolean,
  "result": object,
  "data": object,
  "error": string,
  "details": string,
  "message": string
}
\`\`\`

---

*Documentación generada automáticamente por el sistema de documentación de la API*
`;
}

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

      logs.logGeminiAPI({
        modelo: modelName,

        tokens_de_entrada: tokenUsage ? tokenUsage.promptTokens : "No disponible",
        tokens_de_salida: tokenUsage ? tokenUsage.candidatesTokens : "No disponible",

        user: req.user ? req.user.username : "Desconocido",

        env: "desarrollo",
        status: 'success',

        url: req.originalUrl,

        header_sended: req.headers,
        request_json: req.body,

        header_recieved: req.headers,
        response_json: geminiSdkResponse
      })
      
      // logGeneral({
      //   action: 'generate_course',
      //   model: modelName,
      //   keywords: keywords,
      //   generationConfig: generationConfig,
      //   safetySettings: safetySettings,
      //   rawTextOutput: rawTextOutput,
      //   jsonData: jsonData,
      //   tokenUsage: tokenUsage
      // }) 

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


// Rutas /api/gemini/models y /api/health (sin cambios significativos)
app.get('/api/gemini/models', authenticateToken, async (req, res) => {
  try {
    return res.json({
      success: true,
      data: { models: [ 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro' ] }
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


app.post('/api/gemini/generate-lesson-content', authenticateToken, async (req, res) => {
  try {
    const { lessonId, context } = req.body;
    if (!lessonId || !context) {
      return res.status(400).json({ error: 'Faltan lessonId o contexto.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Configuración de API de Gemini incompleta en el servidor.' });
    }

    const lessonTitle = context.lessonData?.titulo || context.lessonData;
    const moduleTitle = context.moduleTitle;
    const courseTitle = context.currentCourse?.titulo || context.courseId;

    const prompt = `Eres un instructor experto. Genera contenido educativo completo y detallado para una lección.

**Información de la lección:**
- Título de la lección: "${lessonTitle}"
- Módulo: "${moduleTitle}"
- Curso: "${courseTitle}"

**Instrucciones:**
Crea contenido educativo en formato Markdown que incluya:
- Introducción y objetivos de la lección
- Explicaciones conceptuales claras
- Ejemplos prácticos (incluye código si es relevante)
- Puntos clave o resumen
- Ejercicios o actividades sugeridas (si aplica)

El contenido debe ser didáctico, bien estructurado y apropiado para el nivel del curso.
Usa formato Markdown con encabezados, listas, código y otros elementos de formato.`;

    const genAI = await initializeGeminiAPI();
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const generatedContent = response.text;
    if (!generatedContent) {
      throw new Error('La API de Gemini no devolvió contenido.');
    }

    return res.json({ content: generatedContent });
  } catch (error) {
    let errorMessage = 'Error al generar el contenido de la lección.';
    if (error.message) errorMessage += ` Detalles: ${error.message}`;
    if (error.message && (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('gemini'))) {
      errorMessage = 'Ocurrió un problema con el servicio de generación de contenido. Inténtalo más tarde.';
    }
    return res.status(500).json({ error: errorMessage });
  }
});