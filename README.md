# API Proxy para Generación de Temarios con Gemini

Este servicio actúa como un proxy para la API de Google Gemini, especializado en la generación de temarios de cursos en formato JSON. Proporciona una capa de autenticación y una interfaz simplificada para interactuar con los modelos de Gemini.

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