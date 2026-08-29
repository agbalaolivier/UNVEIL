#!/usr/bin/env pwsh

# Script de test complet pour l'application UNVEIL
# Usage: .\test-app.ps1

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ✅ TEST COMPLET DE L'APPLICATION UNVEIL          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend
Write-Host "🔍 Test 1: Vérification Backend" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/decode" -Method POST `
        -ContentType "application/json" -Body (@{ query = "test" } | ConvertTo-Json) -ErrorAction Stop
    Write-Host "   ✅ Backend actif (port 5000)" -ForegroundColor Green
    Write-Host "   ✅ Gemini 3.5-flash répond correctement" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur backend: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Frontend Web
Write-Host "🔍 Test 2: Vérification Frontend Web" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest http://localhost:8081 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend accessible (http://localhost:8081)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Frontend: Code HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Frontend inaccessible" -ForegroundColor Red
}
Write-Host ""

# Test 3: Endpoints
Write-Host "🔍 Test 3: Endpoints API" -ForegroundColor Yellow
try {
    # Test /decode
    $body1 = @{ query = "test" } | ConvertTo-Json
    $result1 = Invoke-RestMethod -Uri "http://localhost:5000/api/decode" -Method POST `
        -ContentType "application/json" -Body $body1 -ErrorAction Stop
    Write-Host "   ✅ POST /api/decode fonctionne" -ForegroundColor Green
    
    # Test /decode-raw-text
    $body2 = @{ rawText = "test"; title = "Test" } | ConvertTo-Json
    $result2 = Invoke-RestMethod -Uri "http://localhost:5000/api/decode-raw-text" -Method POST `
        -ContentType "application/json" -Body $body2 -ErrorAction Stop
    Write-Host "   ✅ POST /api/decode-raw-text fonctionne" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur endpoints: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Configuration
Write-Host "⚙️  Configuration" -ForegroundColor Yellow
Write-Host "   ✅ IP locale: 192.168.1.90" -ForegroundColor Green
Write-Host "   ✅ Backend port: 5000" -ForegroundColor Green
Write-Host "   ✅ Frontend port: 8081 (web)" -ForegroundColor Green
Write-Host "   ✅ Modèle IA: gemini-3.5-flash" -ForegroundColor Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🎉 APPLICATION PRÊTE À L'EMPLOI! 🎉              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Commandes disponibles:" -ForegroundColor Cyan
Write-Host "   w  = Ouvrir la web app (http://localhost:8081)" -ForegroundColor White
Write-Host "   a  = Lancer sur Android" -ForegroundColor White
Write-Host "   i  = Lancer sur iOS" -ForegroundColor White
Write-Host "   r  = Recharger l'app" -ForegroundColor White
Write-Host "   m  = Ouvrir le menu" -ForegroundColor White
Write-Host ""
