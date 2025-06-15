# API Gemini Proxy - Documentación

**Versión:** 1.0.0  
**Generado automáticamente el:** 2025-06-12T19:26:20.437Z  
**Ambiente:** development

## Descripción
API intermedia para Gemini API protegida por token para generar cursos automáticamente.

## URL Base
`http://localhost:3000`

## Autenticación
Todas las rutas (excepto `/api/health` y las de documentación) requieren autenticación mediante Bearer Token.

**Header requerido:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

## Endpoints Disponibles

### 1. Health Check
- **URL:** `GET /api/health`
- **Descripción:** Verificar el estado de la API
- **Autenticación:** No requerida
- **Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "message": "API Gemini Proxy funcionando correctamente"
  }
}
```

### 2. Obtener Modelos Disponibles
- **URL:** `GET /api/gemini/models`
- **Descripción:** Retorna la lista de modelos de Gemini disponibles
- **Autenticación:** Bearer Token requerido
- **Respuesta:**
```json
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
```

### 3. Generar Estructura de Curso
- **URL:** `POST /api/gemini/generate`
- **Descripción:** Genera automáticamente la estructura de un curso completo
- **Autenticación:** Bearer Token requerido
- **Body (JSON):**
```json
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
```

**Parámetros obligatorios:**
- `model` (string): Modelo de Gemini a utilizar
- `keywords` (string): Palabras clave para generar el curso

**Parámetros opcionales:**
- `generationConfig` (object): Configuración de generación
- `safetySettings` (array): Configuraciones de seguridad
- `tools` (array): Herramientas adicionales

**Respuesta exitosa:**
```json
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
```

## Ejemplos de cURL

### Health Check
```bash
curl -X GET "http://localhost:3000/api/health"
```

### Obtener Modelos
```bash
curl -X GET "http://localhost:3000/api/gemini/models" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Generar Curso
```bash
curl -X POST "http://localhost:3000/api/gemini/generate" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-1.5-pro-latest",
    "keywords": "JavaScript y desarrollo web",
    "generationConfig": {
      "maxOutputTokens": 2048,
      "temperature": 0.7
    }
  }'
```

## Códigos de Estado HTTP

- **200**: Operación exitosa
- **400**: Error en los parámetros de entrada
- **401**: Token no proporcionado
- **403**: Token inválido
- **500**: Error interno del servidor

## Formatos de Respuesta

Todas las respuestas siguen el formato estándar:
```json
{
  "success": boolean,
  "result": object,
  "data": object,
  "error": string,
  "details": string,
  "message": string
}
```

---

*Documentación generada automáticamente en deployment el 2025-06-12T19:26:20.437Z*
