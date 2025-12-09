# Script para hacer git push rápidamente
# Uso: .\deploy.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           🚀 DEPLOYMENT SCRIPT - RENDER                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Verificar Git
Write-Host "📁 Verificando Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git no está inicializado" -ForegroundColor Red
    Write-Host "Ejecuta: git init" -ForegroundColor Yellow
    exit 1
}

# Ver cambios
Write-Host ""
Write-Host "📊 Estado actual:" -ForegroundColor Yellow
git status --short

# Confirmar
Write-Host ""
Write-Host "¿Deseas continuar con el deployment? (S/n)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq 'n' -or $response -eq 'N') {
    Write-Host "❌ Deployment cancelado" -ForegroundColor Red
    exit 0
}

# Agregar archivos
Write-Host ""
Write-Host "📦 Agregando archivos..." -ForegroundColor Yellow
git add .

# Commit
$message = "Sistema de evaluación dinámico - deployment a Render $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "✍️  Creando commit..." -ForegroundColor Yellow
git commit -m $message

# Push
Write-Host "🚀 Subiendo a GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ PUSH COMPLETADO                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Siguientes pasos:" -ForegroundColor Cyan
Write-Host "1. Ve a: https://render.com" -ForegroundColor White
Write-Host "2. Presiona: New → Web Service" -ForegroundColor White
Write-Host "3. Conecta tu repositorio GitHub" -ForegroundColor White
Write-Host "4. Configura:" -ForegroundColor White
Write-Host "   - Name: plataforma-monitoreo" -ForegroundColor Gray
Write-Host "   - Build: pip install -r requirements.txt && python init_db.py" -ForegroundColor Gray
Write-Host "   - Start: gunicorn app:app" -ForegroundColor Gray
Write-Host "5. Espera 5-10 minutos" -ForegroundColor White
Write-Host ""
Write-Host "Tu URL será algo como: https://plataforma-monitoreo.onrender.com" -ForegroundColor Green
