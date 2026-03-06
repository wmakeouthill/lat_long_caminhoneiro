# =============================================================================
#  Build APK via EAS Cloud -> baixa para dist/
#  Uso: .\build-apk.ps1
#
#  Pre-requisitos:
#    npm install -g eas-cli
#    eas login  (conta Expo — gratuita)
#    eas init   (dentro de mobile/, na primeira vez)
# =============================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$DIST_DIR   = "$PSScriptRoot\dist"
$MOBILE_DIR = "$PSScriptRoot\mobile"

function Write-Step($n, $msg) {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor DarkCyan
    Write-Host "  PASSO $n  |  $msg" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor DarkCyan
}

function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "  --> $msg" -ForegroundColor DarkGray }
function Die($label) {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRO] $label (exit $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
}

$totalStart = Get-Date

Write-Host ""
Write-Host "  LAT-LONG  |  Build APK para Android" -ForegroundColor Yellow
Write-Host "  Iniciando em: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGray

# =============================================================================
# PASSO 1 — Verificar eas-cli
# =============================================================================
Write-Step "1/4" "Verificando eas-cli"

$easPath = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easPath) {
    Write-Info "eas-cli nao encontrado. Instalando globalmente..."
    npm install -g eas-cli
    Die "npm install -g eas-cli"
    Write-Ok "eas-cli instalado"
} else {
    Write-Ok "eas-cli encontrado: $($easPath.Source)"
}

# =============================================================================
# PASSO 2 — Login no EAS
# =============================================================================
Write-Step "2/4" "Verificando login no EAS"

Set-Location $MOBILE_DIR

$whoami = eas whoami 2>&1
if ($LASTEXITCODE -ne 0 -or $whoami -match "Not logged in") {
    Write-Host "  Voce nao esta logado no EAS. Faca o login agora:" -ForegroundColor Yellow
    eas login
    Die "eas login"
    Write-Ok "Login realizado com sucesso"
} else {
    Write-Ok "Logado como: $whoami"
}

# Verifica se o projeto esta inicializado no EAS
$appJson = Get-Content "$MOBILE_DIR\app.json" | ConvertFrom-Json
if ($appJson.expo.extra.eas.projectId -eq "seu-project-id-eas") {
    Write-Host ""
    Write-Host "  Projeto ainda nao inicializado no EAS. Rodando 'eas init'..." -ForegroundColor Yellow
    eas init
    Die "eas init"
}

Write-Ok "Projeto EAS OK"

# =============================================================================
# PASSO 3 — Build APK no EAS Cloud
# =============================================================================
Write-Step "3/4" "Buildando APK no EAS Cloud (perfil: preview)"

Write-Info "Isso pode levar 5-15 minutos na primeira vez..."

Set-Location $MOBILE_DIR
New-Item -ItemType Directory -Force -Path $DIST_DIR | Out-Null

# Roda o build e captura o JSON de saida
$buildJson = eas build --platform android --profile preview --non-interactive --json 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERRO] eas build falhou (exit $LASTEXITCODE)" -ForegroundColor Red
    Write-Host $buildJson
    exit 1
}

# =============================================================================
# PASSO 3 — Baixar APK para dist/
# =============================================================================
Write-Step "4/4" "Baixando APK para dist/"

$apkUrl = $null
try {
    $parsed = $buildJson | ConvertFrom-Json
    $apkUrl = $parsed[0].artifacts.buildUrl
} catch {}

if ($apkUrl) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmm"
    $apkFile   = "$DIST_DIR\lat-long-caminhoneiro_${timestamp}.apk"
    Write-Info "Baixando: $apkUrl"
    Invoke-WebRequest -Uri $apkUrl -OutFile $apkFile
    Write-Ok "APK salvo em: $apkFile"
} else {
    # eas build sem --json ou projeto nao inicializado ainda
    Write-Host ""
    Write-Host "  Nao foi possivel extrair a URL automaticamente." -ForegroundColor Yellow
    Write-Host "  Baixe o APK em: https://expo.dev e salve em: $DIST_DIR" -ForegroundColor Yellow
}

$total = [math]::Round(((Get-Date) - $totalStart).TotalSeconds, 0)
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  BUILD FINALIZADO" -ForegroundColor Green
Write-Host "  APK em: $DIST_DIR" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
