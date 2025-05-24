module.exports = {
  // Configuración de ambientes
  environments: {
    development: {
      baseUrl: process.env.DEV_URL || 'http://localhost:3000',
      nodeEnv: 'development',
      generateDocs: true,
      deployDocs: false,
      runTests: false
    },
    staging: {
      baseUrl: process.env.STAGING_URL || 'https://staging-api.example.com',
      nodeEnv: 'staging',
      generateDocs: true,
      deployDocs: true,
      runTests: true,
      notifications: true
    },
    production: {
      baseUrl: process.env.PRODUCTION_URL || 'https://api.example.com',
      nodeEnv: 'production',
      generateDocs: true,
      deployDocs: true,
      runTests: true,
      notifications: true,
      backup: true
    }
  },

  // Configuración de documentación
  documentation: {
    outputDir: './docs',
    formats: ['json', 'markdown', 'html'],
    includeExamples: true,
    includeTimestamp: true,
    includeDeploymentInfo: true
  },

  // Configuración de deployment
  deployment: {
    // Scripts que se ejecutan en cada fase
    hooks: {
      predeploy: [
        'npm ci',
        'npm run docs:build'
      ],
      deploy: [
        // Se define según la plataforma
      ],
      postdeploy: [
        'npm run health-check'
      ]
    },
    
    // Verificaciones post-deployment
    healthChecks: [
      '/api/health',
      '/doc.json',
      '/doc'
    ],
    
    // Tiempo de espera para que el servicio esté listo
    startupTimeout: 30000,
    
    // Reintentos para health checks
    maxRetries: 3
  },

  // Configuración de notificaciones
  notifications: {
    slack: {
      enabled: !!process.env.SLACK_WEBHOOK_URL,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channels: {
        development: '#dev-deployments',
        staging: '#staging-deployments',
        production: '#production-deployments'
      }
    },
    
    email: {
      enabled: false,
      // Configuración de email si es necesaria
    }
  },

  // Configuración específica por plataforma
  platforms: {
    github_actions: {
      artifactName: 'api-documentation',
      retentionDays: 30,
      publishToPages: true
    },
    
    heroku: {
      appName: process.env.HEROKU_APP_NAME,
      generateDocs: true,
      uploadDocs: true
    },
    
    vercel: {
      projectName: process.env.VERCEL_PROJECT_NAME,
      generateDocs: true,
      uploadDocs: true
    },
    
    docker: {
      imageName: 'api-gemini',
      containerName: 'api-gemini-container',
      ports: ['3000:3000']
    },
    
    pm2: {
      appName: 'api-gemini',
      instances: 1,
      autorestart: true,
      watchFiles: false
    }
  }
};

// Función para obtener configuración del ambiente actual
function getEnvironmentConfig(env = process.env.NODE_ENV || 'development') {
  const config = module.exports;
  const envConfig = config.environments[env];
  
  if (!envConfig) {
    throw new Error(`Ambiente no válido: ${env}. Ambientes disponibles: ${Object.keys(config.environments).join(', ')}`);
  }
  
  return {
    ...envConfig,
    environment: env,
    documentation: config.documentation,
    deployment: config.deployment,
    notifications: config.notifications,
    platforms: config.platforms
  };
}

module.exports.getEnvironmentConfig = getEnvironmentConfig; 