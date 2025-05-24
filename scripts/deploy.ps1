param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development"
)

# Script de deployment automático con generación de documentación para Windows
# Uso: .\scripts\deploy.ps1 -Environment production

Write-Host "🚀 Iniciando deployment para ambiente: $Environment" -ForegroundColor Green
$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Cyan

# Función para logging con colores
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "White" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

# Función para manejo de errores
function Exit-WithError {
    param([string]$Message)
    Write-Log "❌ Error: $Message" "ERROR"
    exit 1
}

try {
    # Validar ambiente
    $validEnvironments = @("development", "staging", "production")
    if ($Environment -notin $validEnvironments) {
        Exit-WithError "Ambiente no válido: $Environment. Use: $($validEnvironments -join ', ')"
    }

    # Configurar variables de entorno según el ambiente
    switch ($Environment) {
        "production" {
            $env:NODE_ENV = "production"
            $env:BASE_URL = if ($env:PRODUCTION_URL) { $env:PRODUCTION_URL } else { "https://api.example.com" }
            Write-Log "🌐 Configurando para producción" "INFO"
        }
        "staging" {
            $env:NODE_ENV = "staging" 
            $env:BASE_URL = if ($env:STAGING_URL) { $env:STAGING_URL } else { "https://staging-api.example.com" }
            Write-Log "🎭 Configurando para staging" "INFO"
        }
        "development" {
            $env:NODE_ENV = "development"
            $env:BASE_URL = if ($env:DEV_URL) { $env:DEV_URL } else { "http://localhost:3000" }
            Write-Log "🛠️ Configurando para desarrollo" "INFO"
        }
    }

    # Verificar archivos necesarios
    if (-not (Test-Path "package.json")) {
        Exit-WithError "package.json no encontrado"
    }
    if (-not (Test-Path "index.js")) {
        Exit-WithError "index.js no encontrado"
    }
    Write-Log "✅ Validación inicial completada" "SUCCESS"

    # Instalar dependencias
    Write-Log "📦 Instalando dependencias..." "INFO"
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falló la instalación de dependencias"
    }

    # Ejecutar tests (si existen)
    $testScript = (Get-Content "package.json" | ConvertFrom-Json).scripts.test
    if ($testScript -and $testScript -ne 'echo "Error: no test specified" && exit 1') {
        Write-Log "🧪 Ejecutando tests..." "INFO"
        npm test
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Los tests fallaron"
        }
    } else {
        Write-Log "⚠️ No se encontraron tests definidos" "WARNING"
    }

    # Generar documentación automáticamente
    Write-Log "📚 Generando documentación automáticamente..." "INFO"
    npm run docs:build
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falló la generación de documentación"
    }

    # Verificar que la documentación se generó correctamente
    $docsFiles = @("docs/api-spec.json", "docs/README.md", "docs/index.html", "docs/deployment-info.json")
    $missingFiles = @()
    
    foreach ($file in $docsFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Exit-WithError "Los siguientes archivos de documentación no se generaron: $($missingFiles -join ', ')"
    }
    
    Write-Log "✅ Documentación generada exitosamente:" "SUCCESS"
    Write-Log "   - OpenAPI: docs/api-spec.json" "INFO"
    Write-Log "   - Markdown: docs/README.md" "INFO"
    Write-Log "   - HTML: docs/index.html" "INFO"
    Write-Log "   - Deployment info: docs/deployment-info.json" "INFO"

    # Deployment específico según la plataforma disponible
    Write-Log "🚀 Ejecutando deployment..." "INFO"

    # Verificar qué herramientas están disponibles
    $pm2Available = Get-Command pm2 -ErrorAction SilentlyContinue
    $dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
    
    if ($pm2Available) {
        Write-Log "📈 Usando PM2 para deployment..." "INFO"
        
        # Detener aplicación si está corriendo
        pm2 stop api-gemini 2>$null
        
        # Iniciar aplicación
        pm2 start index.js --name api-gemini --env $Environment
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Falló el inicio con PM2"
        }
        
        # Guardar configuración PM2
        pm2 save
        
    } elseif ($dockerAvailable -and (Test-Path "Dockerfile")) {
        Write-Log "🐳 Usando Docker para deployment..." "INFO"
        
        # Construir imagen
        docker build -t api-gemini:$Environment .
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Falló la construcción de Docker"
        }
        
        # Detener y remover container anterior
        docker stop api-gemini-$Environment 2>$null
        docker rm api-gemini-$Environment 2>$null
        
        # Iniciar nuevo container
        docker run -d --name api-gemini-$Environment --env-file .env -p 3000:3000 api-gemini:$Environment
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Falló el inicio del container"
        }
        
    } else {
        Write-Log "🔧 Deployment manual..." "WARNING"
        Write-Log "   Para deployment automático, instale PM2 o Docker" "INFO"
        Write-Log "   Para iniciar manualmente: npm start" "INFO"
    }

    # Esperar a que el servicio esté listo
    Write-Log "⏳ Esperando a que el servicio esté listo..." "INFO"
    Start-Sleep -Seconds 5

    # Verificación post-deployment
    Write-Log "🔍 Verificando deployment..." "INFO"

    # Health check
    try {
        $healthResponse = Invoke-RestMethod -Uri "$env:BASE_URL/api/health" -Method Get -TimeoutSec 10
        if ($healthResponse.success) {
            Write-Log "✅ Health check exitoso" "SUCCESS"
        } else {
            Exit-WithError "Health check falló - Respuesta inválida"
        }
    } catch {
        Exit-WithError "Health check falló - El servicio no está respondiendo: $($_.Exception.Message)"
    }

    # Verificar documentación
    try {
        $docsResponse = Invoke-RestMethod -Uri "$env:BASE_URL/doc.json" -Method Get -TimeoutSec 10
        if ($docsResponse) {
            Write-Log "✅ Documentación API funcionando" "SUCCESS"
        } else {
            Exit-WithError "La documentación API no está disponible"
        }
    } catch {
        Exit-WithError "La documentación API no está disponible: $($_.Exception.Message)"
    }

    # Notificación de éxito (si está configurada)
    if ($env:SLACK_WEBHOOK_URL) {
        Write-Log "📢 Enviando notificación..." "INFO"
        try {
            $payload = @{
                text = "🚀 Deployment exitoso`n• Ambiente: $Environment`n• Timestamp: $timestamp`n• Documentación: $env:BASE_URL/doc"
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $env:SLACK_WEBHOOK_URL -Method Post -Body $payload -ContentType "application/json"
            Write-Log "✅ Notificación enviada" "SUCCESS"
        } catch {
            Write-Log "⚠️ No se pudo enviar notificación: $($_.Exception.Message)" "WARNING"
        }
    }

    # Resumen final
    Write-Host ""
    Write-Log "🎉 ¡Deployment completado exitosamente!" "SUCCESS"
    Write-Log "🌐 API disponible en: $env:BASE_URL" "INFO"
    Write-Log "📚 Documentación disponible en:" "INFO"
    Write-Log "   - Swagger UI: $env:BASE_URL/doc" "INFO"
    Write-Log "   - JSON: $env:BASE_URL/doc.json" "INFO"
    Write-Log "   - Markdown: $env:BASE_URL/doc.md" "INFO"
    Write-Log "   - HTML estático: docs/index.html" "INFO"
    Write-Host ""
    Write-Log "📋 Información de deployment guardada en: docs/deployment-info.json" "INFO"
    Write-Log "⏰ Deployment completado en: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')" "INFO"

} catch {
    Exit-WithError "Error inesperado: $($_.Exception.Message)"
} 