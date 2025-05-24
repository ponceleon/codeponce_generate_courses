#!/bin/bash

# Script de deployment automático con generación de documentación
# Uso: ./scripts/deploy.sh [environment]
# Ejemplo: ./scripts/deploy.sh production

set -e  # Salir si algún comando falla

# Configuración
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Iniciando deployment para ambiente: $ENVIRONMENT"
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Directorio del proyecto: $PROJECT_DIR"

# Función para logging
log() {
    echo "[$TIMESTAMP] $1"
}

# Función para manejo de errores
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# Validar que estemos en el directorio correcto
cd "$PROJECT_DIR" || error_exit "No se pudo acceder al directorio del proyecto"

# Verificar que existan los archivos necesarios
[ -f "package.json" ] || error_exit "package.json no encontrado"
[ -f "index.js" ] || error_exit "index.js no encontrado"

log "✅ Validación inicial completada"

# Instalar dependencias
log "📦 Instalando dependencias..."
npm ci || error_exit "Falló la instalación de dependencias"

# Ejecutar tests (si existen)
if npm run test --silent 2>/dev/null; then
    log "🧪 Ejecutando tests..."
    npm test || error_exit "Los tests fallaron"
else
    log "⚠️  No se encontraron tests definidos"
fi

# Configurar variables de entorno según el ambiente
case $ENVIRONMENT in
    "production")
        export NODE_ENV=production
        export BASE_URL=${PRODUCTION_URL:-"https://api.example.com"}
        log "🌐 Configurando para producción"
        ;;
    "staging")
        export NODE_ENV=staging
        export BASE_URL=${STAGING_URL:-"https://staging-api.example.com"}
        log "🎭 Configurando para staging"
        ;;
    "development")
        export NODE_ENV=development
        export BASE_URL=${DEV_URL:-"http://localhost:3000"}
        log "🛠️  Configurando para desarrollo"
        ;;
    *)
        error_exit "Ambiente no válido: $ENVIRONMENT. Use: production, staging, o development"
        ;;
esac

# Generar documentación
log "📚 Generando documentación automáticamente..."
npm run docs:build || error_exit "Falló la generación de documentación"

# Verificar que la documentación se generó correctamente
if [ -f "docs/api-spec.json" ] && [ -f "docs/README.md" ] && [ -f "docs/index.html" ]; then
    log "✅ Documentación generada exitosamente"
    log "   - OpenAPI: docs/api-spec.json"
    log "   - Markdown: docs/README.md"
    log "   - HTML: docs/index.html"
    log "   - Deployment info: docs/deployment-info.json"
else
    error_exit "La documentación no se generó correctamente"
fi

# Crear backup de la versión anterior (si existe)
if [ -d "/var/www/api-backup" ]; then
    log "🗄️  Creando backup de la versión anterior..."
    sudo cp -r /var/www/api /var/www/api-backup-$(date +%Y%m%d_%H%M%S) 2>/dev/null || log "⚠️  No se pudo crear backup"
fi

# Deployment específico según la plataforma
log "🚀 Ejecutando deployment..."

# Opción 1: PM2 (proceso local)
if command -v pm2 &> /dev/null; then
    log "📈 Usando PM2 para deployment..."
    pm2 stop api-gemini || log "⚠️  Aplicación no estaba corriendo"
    pm2 start index.js --name api-gemini --env $ENVIRONMENT || error_exit "Falló el inicio con PM2"
    pm2 save || log "⚠️  No se pudo guardar configuración PM2"

# Opción 2: Docker
elif command -v docker &> /dev/null && [ -f "Dockerfile" ]; then
    log "🐳 Usando Docker para deployment..."
    docker build -t api-gemini:$ENVIRONMENT . || error_exit "Falló la construcción de Docker"
    docker stop api-gemini-$ENVIRONMENT 2>/dev/null || log "⚠️  Container no estaba corriendo"
    docker rm api-gemini-$ENVIRONMENT 2>/dev/null || log "⚠️  Container no existía"
    docker run -d --name api-gemini-$ENVIRONMENT \
        --env-file .env \
        -p 3000:3000 \
        api-gemini:$ENVIRONMENT || error_exit "Falló el inicio del container"

# Opción 3: Systemd service
elif systemctl is-active --quiet api-gemini; then
    log "⚙️  Usando systemd para deployment..."
    sudo systemctl stop api-gemini
    sudo systemctl start api-gemini || error_exit "Falló el inicio del servicio"

# Opción 4: Deployment manual
else
    log "🔧 Deployment manual..."
    log "   Copie los archivos a su servidor y ejecute: npm start"
fi

# Esperar a que el servicio esté listo
log "⏳ Esperando a que el servicio esté listo..."
sleep 5

# Verificación post-deployment
log "🔍 Verificando deployment..."

# Health check
if curl -f -s "$BASE_URL/api/health" > /dev/null; then
    log "✅ Health check exitoso"
else
    error_exit "Health check falló - El servicio no está respondiendo"
fi

# Verificar documentación
if curl -f -s "$BASE_URL/doc.json" > /dev/null; then
    log "✅ Documentación API funcionando"
else
    error_exit "La documentación API no está disponible"
fi

# Opcional: Subir documentación a hosting estático
if [ "$ENVIRONMENT" = "production" ] && [ -n "$DOCS_CDN_URL" ]; then
    log "☁️  Subiendo documentación a CDN..."
    # Ejemplo para AWS S3
    # aws s3 sync docs/ s3://your-docs-bucket/ --delete
    # Ejemplo para rsync
    # rsync -av docs/ user@server:/var/www/docs/
    log "📚 Documentación disponible en: $DOCS_CDN_URL"
fi

# Notificaciones (opcional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    log "📢 Enviando notificación..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Deployment exitoso\\n• Ambiente: $ENVIRONMENT\\n• Timestamp: $TIMESTAMP\\n• Documentación: $BASE_URL/doc\"}" \
        "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || log "⚠️  No se pudo enviar notificación"
fi

# Resumen final
log ""
log "🎉 ¡Deployment completado exitosamente!"
log "🌐 API disponible en: $BASE_URL"
log "📚 Documentación disponible en:"
log "   - Swagger UI: $BASE_URL/doc"
log "   - JSON: $BASE_URL/doc.json"
log "   - Markdown: $BASE_URL/doc.md"
log "   - HTML estático: docs/index.html"
log ""
log "📋 Información de deployment guardada en: docs/deployment-info.json"
log "⏰ Deployment completado en: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

exit 0 