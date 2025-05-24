const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Gemini Proxy',
    version: '1.0.0',
    description: 'API intermedia para Gemini API protegida por token para generar cursos automáticamente',
    contact: {
      name: 'Soporte API',
      email: 'support@example.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'string',
        description: 'Token de autorización requerido. Formato: Bearer [TOKEN]'
      }
    },
    schemas: {
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Descripción del error'
          },
          details: {
            type: 'string',
            example: 'Detalles adicionales del error'
          }
        }
      },
      HealthResponse: {
        allOf: [
          { $ref: '#/components/schemas/Success' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'online'
                  },
                  message: {
                    type: 'string',
                    example: 'API Gemini Proxy funcionando correctamente'
                  }
                }
              }
            }
          }
        ]
      },
      ModelsResponse: {
        allOf: [
          { $ref: '#/components/schemas/Success' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  models: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro']
                  }
                }
              }
            }
          }
        ]
      },
      GenerateRequest: {
        type: 'object',
        required: ['model', 'keywords'],
        properties: {
          model: {
            type: 'string',
            description: 'Nombre del modelo de Gemini a utilizar',
            example: 'gemini-1.5-pro-latest',
            enum: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro']
          },
          keywords: {
            type: 'string',
            description: 'Palabras clave para generar el curso',
            example: 'JavaScript y desarrollo web',
            minLength: 1
          },
          generationConfig: {
            type: 'object',
            description: 'Configuración opcional para la generación',
            properties: {
              maxOutputTokens: {
                type: 'integer',
                example: 2048,
                description: 'Número máximo de tokens en la respuesta'
              },
              temperature: {
                type: 'number',
                minimum: 0,
                maximum: 2,
                example: 0.7,
                description: 'Controla la creatividad de la respuesta (0-2)'
              },
              topP: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                example: 0.8,
                description: 'Controla la diversidad de la respuesta (0-1)'
              },
              topK: {
                type: 'integer',
                minimum: 1,
                example: 40,
                description: 'Número de tokens candidatos considerados'
              }
            }
          },
          safetySettings: {
            type: 'array',
            description: 'Configuraciones de seguridad para el contenido',
            items: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  example: 'HARM_CATEGORY_HARASSMENT'
                },
                threshold: {
                  type: 'string',
                  example: 'BLOCK_MEDIUM_AND_ABOVE'
                }
              }
            }
          },
          tools: {
            type: 'array',
            description: 'Herramientas adicionales para la generación',
            items: {
              type: 'object'
            }
          }
        }
      },
      CourseStructure: {
        type: 'object',
        properties: {
          course_title: {
            type: 'string',
            description: 'Título del curso generado',
            example: 'Curso Completo de JavaScript y Desarrollo Web'
          },
          modules: {
            type: 'array',
            description: 'Lista de módulos del curso',
            items: {
              type: 'object',
              properties: {
                module_title: {
                  type: 'string',
                  description: 'Título del módulo',
                  example: 'Fundamentos de JavaScript'
                },
                lessons: {
                  type: 'array',
                  description: 'Lista de lecciones del módulo',
                  items: {
                    type: 'string',
                    description: 'Título de la lección',
                    example: 'Variables y tipos de datos'
                  }
                }
              }
            }
          }
        }
      },
      GenerateResponse: {
        allOf: [
          { $ref: '#/components/schemas/Success' },
          {
            type: 'object',
            properties: {
              result: {
                type: 'object',
                properties: {
                  modelUsed: {
                    type: 'string',
                    example: 'gemini-1.5-pro-latest'
                  },
                  tokenUsage: {
                    type: 'object',
                    properties: {
                      promptTokens: {
                        type: 'integer',
                        example: 150
                      },
                      candidatesTokens: {
                        type: 'integer',
                        example: 500
                      },
                      totalTokens: {
                        type: 'integer',
                        example: 650
                      }
                    }
                  },
                  generationConfigUsed: {
                    type: 'object',
                    description: 'Configuración utilizada en la generación'
                  },
                  safetySettingsUsed: {
                    type: 'array',
                    description: 'Configuraciones de seguridad utilizadas'
                  }
                }
              },
              data: {
                $ref: '#/components/schemas/CourseStructure'
              }
            }
          }
        ]
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./index.js', './swagger.routes.js'], // Archivos que contienen las anotaciones JSDoc
};

module.exports = swaggerJSDoc(options); 