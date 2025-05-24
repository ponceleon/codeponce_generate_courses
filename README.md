# API Gemini Proxy

API intermedia para Gemini API protegida por token para generar cursos automáticamente.

## 🚀 Características

- **Autenticación por token**: Protege el acceso a la API de Gemini
- **Generación automática de cursos**: Crea estructuras de cursos completas basadas en palabras clave
- **Documentación automática**: Swagger UI integrado con documentación en tiempo real
- **Múltiples formatos de documentación**: JSON, Markdown y interfaz web interactiva
- **Configuración flexible**: Parámetros personalizables para la generación de contenido

## 📋 Requisitos

- Node.js 16+
- NPM o Yarn
- API Key de Google Gemini
- Token de autenticación personalizado

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd GenerateCourses
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
GEMINI_API_KEY=tu_api_key_de_gemini
API_TOKEN=tu_token_personalizado
PORT=3000
```

## 🚀 Uso

### Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de la API

### Acceso a la documentación

La API incluye documentación automática en múltiples formatos:

#### 1. Interfaz Web Interactiva (Swagger UI)
```
GET http://localhost:3000/doc
```
- Interfaz visual completa
- Pruebas en tiempo real
- Ejemplos de código
- Esquemas de datos detallados

#### 2. Documentación JSON (OpenAPI 3.0)
```
GET http://localhost:3000/doc.json
```
- Especificación completa en formato JSON
- Compatible con herramientas de generación de código
- Importable en Postman, Insomnia, etc.

#### 3. Documentación Markdown
```
GET http://localhost:3000/doc.md
```
- Formato legible para humanos
- Incluye ejemplos de cURL
- Actualizada automáticamente

### Endpoints principales

#### Health Check
```bash
curl -X GET "http://localhost:3000/api/health"
```

#### Obtener modelos disponibles
```bash
curl -X GET "http://localhost:3000/api/gemini/models" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

#### Generar estructura de curso
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

## 🔧 Configuración avanzada

### Parámetros de generación

La API acepta los siguientes parámetros opcionales para personalizar la generación:

- `maxOutputTokens`: Número máximo de tokens (default: 2048)
- `temperature`: Creatividad de la respuesta 0-2 (default: 0.7)
- `topP`: Diversidad de la respuesta 0-1 (default: 0.8)
- `topK`: Tokens candidatos considerados (default: 40)

### Configuraciones de seguridad

Puedes configurar filtros de contenido:

```json
{
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

## 🔄 Actualización automática de documentación

La documentación se actualiza automáticamente cuando:

1. **Cambias el código**: Los comentarios JSDoc se reflejan inmediatamente
2. **Modificas esquemas**: Los tipos de datos se actualizan en tiempo real
3. **Agregas rutas**: Nuevos endpoints aparecen automáticamente

### Scripts de documentación

```bash
# Generar documentación estática
npm run docs:generate

# Servir documentación (inicia el servidor)
npm run docs:serve
```

## 📁 Estructura del proyecto

```
├── index.js              # Servidor principal
├── swagger.config.js     # Configuración de Swagger/OpenAPI
├── swagger.routes.js     # Anotaciones JSDoc de las rutas
├── package.json          # Dependencias y scripts
├── .env                  # Variables de entorno
├── docs/                 # Documentación generada
└── README.md            # Este archivo
```

## 🛡️ Seguridad

- **Autenticación requerida**: Todas las rutas (excepto `/api/health` y documentación) requieren token
- **Validación de entrada**: Parámetros validados antes del procesamiento
- **Filtros de contenido**: Configuraciones de seguridad de Gemini aplicadas
- **Rate limiting**: Considera implementar límites de velocidad en producción

## 🐛 Solución de problemas

### Error: "Token requerido"
Asegúrate de incluir el header de autorización:
```
Authorization: Bearer TU_TOKEN_AQUI
```

### Error: "API key not valid"
Verifica que tu `GEMINI_API_KEY` en `.env` sea correcta.

### La documentación no se actualiza
Reinicia el servidor después de cambios en los archivos de configuración.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `/doc`
2. Consulta los ejemplos en este README
3. Abre un issue en el repositorio

---

**¡La documentación está siempre actualizada y disponible en `/doc`!** 🎉



## Características Principales

* **Generación de Temarios de Cursos:** Endpoint dedicado para crear esquemas de cursos estructurados en módulos y lecciones.
* **Integración con Google Gemini:** Utiliza el SDK `@google/genai` para comunicarse con los modelos de IA generativa de Google.
* **Autenticación Segura:** Protege los endpoints mediante un token de API personalizado.
* **Información de Uso de Tokens:** Devuelve detalles sobre los tokens consumidos por cada solicitud al modelo Gemini.
* **Configuración Flexible:** Permite especificar el modelo de Gemini, configuraciones de generación y de seguridad.
* **Endpoints Auxiliares:** Incluye rutas para listar modelos (simulado) y verificar el estado del servicio.

## Prerrequisitos

* Node.js (v14 o superior recomendado)
* npm (o yarn)
* Una **API Key de Google Gemini**: Obtenla desde [Google AI Studio](https://aistudio.google.com/app/apikey).
* Un **Token de API personalizado**: Este es un token que tú defines para proteger el acceso a este servicio proxy.

## Instalación y Configuración

1.  **Obtener el código:**
    Guarda el código proporcionado en un archivo, por ejemplo, `server.js`.

2.  **Instalar dependencias:**
    Navega al directorio donde guardaste el archivo y ejecuta:
    ```bash
    npm install express cors dotenv @google/genai
    ```
    O si usas yarn:
    ```bash
    yarn add express cors dotenv @google/genai
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo llamado `.env` en la raíz de tu proyecto con el siguiente contenido, reemplazando los valores de ejemplo con los tuyos:

    ```env
    # Puerto en el que se ejecutará el servidor proxy
    PORT=3000

    # Tu API Key de Google Gemini
    GEMINI_API_KEY=TU_GEMINI_API_KEY_AQUI

    # Tu token de API personalizado para asegurar este servicio proxy
    API_TOKEN=TU_TOKEN_SECRETO_PARA_ESTE_PROXY
    ```

## Ejecutar el Servicio

Para iniciar el servidor, ejecuta:

```bash
node server.js



## Uso de la API (Endpoints)

Todas las solicitudes a los endpoints protegidos deben incluir un header de autenticación.

### Autenticación

Para acceder a los endpoints `/api/gemini/generate` y `/api/gemini/models`, debes incluir el siguiente header en tu solicitud:

`Authorization: Bearer TU_TOKEN_SECRETO_PARA_ESTE_PROXY`

Reemplaza `TU_TOKEN_SECRETO_PARA_ESTE_PROXY` con el valor que definiste para `API_TOKEN` en tu archivo `.env`.

---

### 1. `POST /api/gemini/generate`

Este endpoint genera un temario de curso basado en las palabras clave proporcionadas.

**Descripción:**
Envía una solicitud POST con las palabras clave y el modelo de Gemini a utilizar. El servicio utiliza un prompt de sistema predefinido (ver `SYSTEM_PROMPT_TEMPLATE` en el código) para instruir al modelo Gemini sobre cómo generar el temario en formato JSON, incluyendo un título de curso, siete módulos y un total de 25 a 40 lecciones distribuidas entre los módulos.

**Cuerpo de la Solicitud (Request Body - JSON):**

```json
{
  "model": "gemini-2.0-flash",
  "keywords": "Desarrollo Web con React y Node.js",
  "generationConfig": {
    "temperature": 0.7,
    "topK": 1,
    "topP": 1,
    "maxOutputTokens": 2048
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}