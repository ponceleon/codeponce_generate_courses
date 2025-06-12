#!/usr/bin/env node


const fs = require('fs');
const path = require('path');

// Importar configuraciones
const swaggerSpec = require('../swagger.config');

// Función para generar documentación en markdown
function generateMarkdownDoc() {
  const timestamp = new Date().toISOString();
  const version = require('../package.json').version;
  
  return `# API Gemini Proxy - Documentación

**Versión:** ${version}  
**Generado automáticamente el:** ${timestamp}  
**Ambiente:** ${process.env.NODE_ENV || 'development'}

## Descripción
API intermedia para Gemini API protegida por token para generar cursos automáticamente.

## URL Base
\`${process.env.BASE_URL || 'http://localhost:3000'}\`

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
curl -X GET "${process.env.BASE_URL || 'http://localhost:3000'}/api/health"
\`\`\`

### Obtener Modelos
\`\`\`bash
curl -X GET "${process.env.BASE_URL || 'http://localhost:3000'}/api/gemini/models" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"
\`\`\`

### Generar Curso
\`\`\`bash
curl -X POST "${process.env.BASE_URL || 'http://localhost:3000'}/api/gemini/generate" \\
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

*Documentación generada automáticamente en deployment el ${timestamp}*
`;
}

// Función para generar HTML estático
function generateHTMLDoc() {
  const timestamp = new Date().toISOString();
  const version = require('../package.json').version;
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Gemini Proxy - Documentación v${version}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .endpoint { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
        .get { background-color: #28a745; }
        .post { background-color: #007bff; }
        .put { background-color: #ffc107; color: black; }
        .delete { background-color: #dc3545; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 API Gemini Proxy - Documentación</h1>
        <p><strong>Versión:</strong> ${version}</p>
        <p><strong>Generado automáticamente:</strong> <span class="timestamp">${timestamp}</span></p>
        <p><strong>Ambiente:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <p><strong>URL Base:</strong> <code>${process.env.BASE_URL || 'http://localhost:3000'}</code></p>
    </div>
    
    <h2>📚 Endpoints Disponibles</h2>
    
    <div class="endpoint">
        <h3><span class="method get">GET</span> /api/health</h3>
        <p><strong>Descripción:</strong> Verificar el estado de la API</p>
        <p><strong>Autenticación:</strong> No requerida</p>
        <h4>Ejemplo de respuesta:</h4>
        <pre><code>{
  "success": true,
  "data": {
    "status": "online",
    "message": "API Gemini Proxy funcionando correctamente"
  }
}</code></pre>
    </div>
    
    <div class="endpoint">
        <h3><span class="method get">GET</span> /api/gemini/models</h3>
        <p><strong>Descripción:</strong> Obtener modelos disponibles de Gemini</p>
        <p><strong>Autenticación:</strong> Bearer Token requerido</p>
        <h4>Ejemplo de respuesta:</h4>
        <pre><code>{
  "success": true,
  "data": {
    "models": ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-pro"]
  }
}</code></pre>
    </div>
    
    <div class="endpoint">
        <h3><span class="method post">POST</span> /api/gemini/generate</h3>
        <p><strong>Descripción:</strong> Generar estructura de curso</p>
        <p><strong>Autenticación:</strong> Bearer Token requerido</p>
        <h4>Ejemplo de cuerpo de solicitud:</h4>
        <pre><code>{
  "model": "gemini-1.5-pro-latest",
  "keywords": "JavaScript y desarrollo web",
  "generationConfig": {
    "maxOutputTokens": 2048,
    "temperature": 0.7
  }
}</code></pre>
    </div>
    
    <hr>
    <p class="timestamp">Documentación generada automáticamente en deployment el ${timestamp}</p>
</body>
</html>`;
}

// Función principal
async function main() {
  try {
    console.log('🚀 Generando documentación estática...');
    
    // Crear directorio docs si no existe
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generar archivos de documentación
    const files = [
      {
        name: 'api-spec.json',
        content: JSON.stringify(swaggerSpec, null, 2),
        description: 'Especificación OpenAPI 3.0'
      },
      {
        name: 'README.md',
        content: generateMarkdownDoc(),
        description: 'Documentación en Markdown'
      },
      {
        name: 'index.html',
        content: generateHTMLDoc(),
        description: 'Documentación HTML estática'
      },
      {
        name: 'deployment-info.json',
        content: JSON.stringify({
          timestamp: new Date().toISOString(),
          version: require('../package.json').version,
          environment: process.env.NODE_ENV || 'development',
          baseUrl: process.env.BASE_URL || 'http://localhost:3000',
          commit: process.env.GITHUB_SHA || 'local',
          branch: process.env.GITHUB_REF || 'local'
        }, null, 2),
        description: 'Información de deployment'
      }
    ];
    
    // Escribir archivos
    for (const file of files) {
      const filePath = path.join(docsDir, file.name);
      fs.writeFileSync(filePath, file.content, 'utf8');
      console.log(`✅ ${file.description}: ${filePath}`);
    }
    
    // Generar resumen
    console.log(`
📋 Resumen de documentación generada:
- Especificación OpenAPI: docs/api-spec.json
- Documentación Markdown: docs/README.md  
- Documentación HTML: docs/index.html
- Info de deployment: docs/deployment-info.json

🌐 URLs disponibles:
- Swagger UI: /doc
- JSON API: /doc.json
- Markdown: /doc.md
- HTML estático: docs/index.html

✨ Documentación lista para deployment!
`);
    
  } catch (error) {
    console.error('❌ Error generando documentación:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { generateMarkdownDoc, generateHTMLDoc, main }; 