/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar el estado de la API
 *     description: Endpoint para verificar que la API está funcionando correctamente
 *     tags:
 *       - Health
 *     security: []
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: true
 *               data:
 *                 status: "online"
 *                 message: "API Gemini Proxy funcionando correctamente"
 */

/**
 * @swagger
 * /api/gemini/models:
 *   get:
 *     summary: Obtener modelos disponibles de Gemini
 *     description: Retorna la lista de modelos de Gemini disponibles para usar en la generación de contenido
 *     tags:
 *       - Gemini
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modelos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelsResponse'
 *             example:
 *               success: true
 *               data:
 *                 models: ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-pro"]
 *       401:
 *         description: Token no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Acceso no autorizado: Token requerido"
 *       403:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Acceso prohibido: Token inválido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/gemini/generate:
 *   post:
 *     summary: Generar estructura de curso usando Gemini
 *     description: |
 *       Genera automáticamente la estructura de un curso completo basado en palabras clave.
 *       
 *       El curso generado incluye:
 *       - Un título creativo y descriptivo
 *       - 7 módulos distintos
 *       - Entre 25 y 40 lecciones distribuidas en los módulos
 *       - Todo el contenido en español
 *       
 *       ## Ejemplo de uso con cURL:
 *       ```bash
 *       curl -X POST "http://localhost:3000/api/gemini/generate" \
 *         -H "Authorization: Bearer TU_TOKEN_AQUI" \
 *         -H "Content-Type: application/json" \
 *         -d '{
 *           "model": "gemini-1.5-pro-latest",
 *           "keywords": "JavaScript y desarrollo web",
 *           "generationConfig": {
 *             "maxOutputTokens": 2048,
 *             "temperature": 0.7
 *           }
 *         }'
 *       ```
 *     tags:
 *       - Gemini
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateRequest'
 *           examples:
 *             basico:
 *               summary: Solicitud básica
 *               value:
 *                 model: "gemini-1.5-pro-latest"
 *                 keywords: "JavaScript y desarrollo web"
 *             avanzado:
 *               summary: Solicitud con configuración personalizada
 *               value:
 *                 model: "gemini-1.5-pro-latest"
 *                 keywords: "Machine Learning y Python"
 *                 generationConfig:
 *                   maxOutputTokens: 2048
 *                   temperature: 0.7
 *                   topP: 0.8
 *                   topK: 40
 *                 safetySettings:
 *                   - category: "HARM_CATEGORY_HARASSMENT"
 *                     threshold: "BLOCK_MEDIUM_AND_ABOVE"
 *     responses:
 *       200:
 *         description: Curso generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateResponse'
 *             examples:
 *               exitoso:
 *                 summary: Generación exitosa
 *                 value:
 *                   success: true
 *                   result:
 *                     modelUsed: "gemini-1.5-pro-latest"
 *                     tokenUsage:
 *                       promptTokens: 150
 *                       candidatesTokens: 500
 *                       totalTokens: 650
 *                     generationConfigUsed:
 *                       maxOutputTokens: 2048
 *                       temperature: 0.7
 *                     safetySettingsUsed: null
 *                   data:
 *                     course_title: "Curso Completo de JavaScript y Desarrollo Web"
 *                     modules:
 *                       - module_title: "Fundamentos de JavaScript"
 *                         lessons:
 *                           - "Variables y tipos de datos"
 *                           - "Operadores y expresiones"
 *                           - "Estructuras de control"
 *               con_texto_plano:
 *                 summary: Respuesta no parseada como JSON
 *                 value:
 *                   success: true
 *                   result:
 *                     modelUsed: "gemini-1.5-pro-latest"
 *                     tokenUsage: "Información de tokens no disponible en la respuesta."
 *                   data:
 *                     raw_text: "```json\n{\n  \"course_title\": \"...\"\n}\n```"
 *                     parse_error: "El contenido devuelto por Gemini no es un JSON válido o no está en el formato esperado."
 *                   message: "El contenido devuelto por Gemini no pudo ser interpretado como JSON estructurado."
 *       400:
 *         description: Error en los parámetros de entrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sin_modelo:
 *                 summary: Modelo no especificado
 *                 value:
 *                   success: false
 *                   error: "Se requiere especificar un modelo"
 *               sin_keywords:
 *                 summary: Keywords no proporcionadas
 *                 value:
 *                   success: false
 *                   error: "Se requiere proporcionar \"keywords\" (palabras clave) como un string no vacío."
 *               contenido_bloqueado:
 *                 summary: Contenido bloqueado por filtros de seguridad
 *                 value:
 *                   success: false
 *                   result:
 *                     modelUsed: "gemini-1.5-pro-latest"
 *                     tokenUsage: "No disponible debido a bloqueo de contenido."
 *                   error: "Contenido bloqueado por la API de Gemini"
 *                   details: "Razón: SAFETY"
 *                   promptFeedback:
 *                     blockReason: "SAFETY"
 *       401:
 *         description: Token no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Acceso no autorizado: Token requerido"
 *       403:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Acceso prohibido: Token inválido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               error_gemini_api:
 *                 summary: Error en la API de Gemini
 *                 value:
 *                   success: false
 *                   result:
 *                     modelUsed: "gemini-1.5-pro-latest"
 *                     tokenUsage: "No disponible debido a error en la generación."
 *                   error: "Error de la API de Gemini: GoogleGenerativeAIError"
 *                   details: "API key not valid. Please pass a valid API key."
 *               error_inicializacion:
 *                 summary: Error al inicializar Gemini
 *                 value:
 *                   success: false
 *                   error: "Error al inicializar la API de Gemini"
 *               error_general:
 *                 summary: Error general del servidor
 *                 value:
 *                   success: false
 *                   result:
 *                     modelUsed: "gemini-1.5-pro-latest"
 *                     tokenUsage: "No disponible debido a error en la generación."
 *                   error: "Error al procesar la solicitud"
 *                   details: "Connection timeout"
 */

// Este archivo solo contiene documentación, no código ejecutable
module.exports = {}; 