# API Proxy para Generación de Temarios con Gemini

Este servicio actúa como un proxy para la API de Google Gemini, especializado en la generación de temarios de cursos en formato JSON y generación de imágenes. Proporciona una capa de autenticación y una interfaz simplificada para interactuar con los modelos de Gemini.

## Características Principales

* **Generación de Temarios de Cursos:** Endpoint dedicado para crear esquemas de cursos estructurados en módulos y lecciones.
* **Generación de Imágenes:** Endpoint especializado para crear imágenes usando modelos de Gemini con guardado automático.
* **Integración con Google Gemini:** Utiliza el SDK `@google/genai` para comunicarse con los modelos de IA generativa de Google.
* **Autenticación Segura:** Protege los endpoints mediante un token de API personalizado.
* **Gestión de Archivos:** Guarda automáticamente las imágenes generadas en una carpeta local `/images/` y las sirve estáticamente.
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

    # URL base del servidor (opcional, por defecto http://localhost:PORT)
    # Necesario para generar URLs correctas de acceso a imágenes
    BASE_URL=http://localhost:3000
    ```

## Ejecutar el Servicio

Para iniciar el servidor, ejecuta:

```bash
node server.js

## Uso de la API (Endpoints)

Todas las solicitudes a los endpoints protegidos deben incluir un header de autenticación.

### Autenticación

Para acceder a los endpoints `/api/gemini/generate`, `/api/gemini/generate-image` y `/api/gemini/models`, debes incluir el siguiente header en tu solicitud:

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
```

---

### 2. `POST /api/gemini/generate-image`

Este endpoint genera imágenes utilizando los modelos de generación de imágenes de Gemini.

**Descripción:**
Envía una solicitud POST con un prompt de descripción de la imagen deseada. El servicio utilizará los modelos especializados de Gemini para generar la imagen, la guardará automáticamente en la carpeta local `/images/` y devolverá tanto la imagen en base64 como la URL de acceso público.

**Características importantes:**
- 🖼️ **Guardado automático**: Las imágenes se guardan automáticamente en `/images/` con nombres únicos basados en timestamp
- 🌐 **URLs de acceso**: Devuelve una URL completa para acceder a la imagen desde el navegador
- 📁 **Archivos estáticos**: Las imágenes son servidas como archivos estáticos en la ruta `/images/`
- 🏷️ **Metadatos**: Incluye información del modelo usado, tokens consumidos y ruta de guardado

**Cuerpo de la Solicitud (Request Body - JSON):**

```json
{
  "prompt": "Un paisaje futurista con edificios de cristal y luces neón",
  "model": "gemini-2.0-flash-preview-image-generation",
  "generationConfig": {
    "temperature": 0.8
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT", 
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

**Parámetros:**
- `prompt` (obligatorio): String con la descripción de la imagen a generar
- `model` (opcional): Modelo a usar, por defecto `gemini-2.0-flash-preview-image-generation`
- `generationConfig` (opcional): Configuración adicional para la generación
- `safetySettings` (opcional): Configuraciones de seguridad

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": {
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "mimeType": "image/png",
    "textContent": "Descripción generada por el modelo...",
    "modelUsed": "gemini-2.0-flash-preview-image-generation",
    "imageUrl": "http://localhost:3000/images/generated_1703123456789_gemini-2.0-flash-preview-image-generation.png",
    "filename": "generated_1703123456789_gemini-2.0-flash-preview-image-generation.png",
    "savedPath": "images/generated_1703123456789_gemini-2.0-flash-preview-image-generation.png"
  },
  "result": {
    "modelUsed": "gemini-2.0-flash-preview-image-generation",
    "tokenUsage": {
      "promptTokenCount": 12,
      "candidatesTokenCount": 8,
      "totalTokenCount": 20
    },
    "generationConfigUsed": {
      "responseModalities": ["TEXT", "IMAGE"],
      "temperature": 0.8
    },
    "safetySettingsUsed": [...]
  }
}
```

**Campos importantes de la respuesta:**
- `imageBase64`: La imagen generada en formato base64
- `imageUrl`: **URL completa para acceder a la imagen desde el navegador**
- `filename`: Nombre del archivo guardado
- `savedPath`: Ruta relativa donde se guardó la imagen
- `textContent`: Texto descriptivo generado junto con la imagen (si aplica)

---

### 3. `GET /images/{filename}`

**Endpoint automático para servir imágenes generadas**

Una vez que se genera una imagen, puedes acceder a ella directamente desde el navegador usando la URL devuelta en `imageUrl`.

**Ejemplo:**
```
GET http://localhost:3000/images/generated_1703123456789_gemini-2.0-flash-preview-image-generation.png
```

---

### 4. `GET /api/gemini/models`

Lista los modelos de Gemini disponibles.

**Modelos incluidos:**
- **Texto**: `gemini-2.5-flash-preview-05-20`, `gemini-2.0-flash`, `gemini-1.5-pro-latest`, etc.
- **Generación de imágenes**: `gemini-2.0-flash-preview-image-generation`
- **Generación de video**: `veo-2.0-generate-001`
- **Imagen dedicada**: `imagen-3.0-generate-002`

---

### 5. `GET /api/health`

Verifica el estado del servicio.

## Estructura de Archivos

```
proyecto/
├── index.js              # Servidor principal
├── test_image_generation.js  # Script de prueba para imágenes
├── .env                  # Variables de entorno
├── .gitignore           # Archivos ignorados por git
├── package.json         # Dependencias del proyecto
├── README.md           # Este archivo
└── images/             # 📁 Carpeta para imágenes generadas (auto-creada)
    ├── generated_*.png # Imágenes generadas automáticamente
    └── ...
```

**Nota importante:** La carpeta `/images/` se crea automáticamente al iniciar el servidor y está configurada en `.gitignore` para no subir las imágenes generadas al repositorio.

## Scripts de Prueba

### Prueba de generación de imágenes:

```bash
node test_image_generation.js
```

Este script:
- ✅ Prueba el endpoint de generación de imágenes
- 💾 Guarda automáticamente la imagen generada
- 📄 Muestra logs detallados del proceso
- 🔗 Muestra la URL de acceso a la imagen

## Notas Importantes

- **Carpeta de imágenes**: Se crea automáticamente y está excluida del control de versiones
- **URLs de acceso**: Las imágenes son accesibles públicamente una vez generadas
- **Nombres únicos**: Cada imagen tiene un nombre único basado en timestamp y modelo usado
- **Formatos soportados**: Principalmente PNG para imágenes generadas
- **Modelos especializados**: Usa modelos específicos de Gemini para generación de imágenes