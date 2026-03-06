# ─────────────────────────────────────────────────────────────────────────────
#  Deploy: Build local → transfere via SSH → limpa VPS → sobe container
#
#  Uso (PowerShell, na raiz do projeto):
#    .\infra\scripts\deploy-local-build.ps1
#
#  Requisitos: Docker Desktop rodando, OpenSSH client instalado (Win10+)
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# ── Configuração ─────────────────────────────────────────────────────────────
$SSH_KEY    = "CHAVE_SSH_LOCAL"
$SSH_HOST   = "ubuntu@SEU_IP_VPS"
$IMAGE_NAME = "lat-long-backend"
$IMAGE_TAG  = "latest"
$REMOTE_DIR = "/opt/lat-long-caminhoneiro"
$COMPOSE    = "$REMOTE_DIR/docker-compose.deploy.yml"
# ─────────────────────────────────────────────────────────────────────────────

function Write-Step($n, $msg) {
    Write-Host ""
    Write-Host "── $n ──────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host "   $msg" -ForegroundColor White
}

function Assert-Ok($label) {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nERRO em: $label (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
}

# Garante que estamos na raiz do projeto
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot
Write-Host "Diretório do projeto: $projectRoot" -ForegroundColor DarkGray

# ── 1. Build da imagem Docker localmente ─────────────────────────────────────
Write-Step "1/4" "Build da imagem Docker (local)"

docker build `
    --tag "${IMAGE_NAME}:${IMAGE_TAG}" `
    --file ".\backend\Dockerfile" `
    ".\backend"

Assert-Ok "docker build"
Write-Host "  Imagem buildada: ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor Green

# ── 2. Transferir imagem via SSH pipe (sem arquivo temporário) ────────────────
Write-Step "2/4" "Transferindo imagem para o VPS via SSH pipe (pode demorar na 1a vez...)"

# docker save gera o tar no stdout; ssh recebe no stdin e carrega com docker load
# O pipe binário funciona direto entre processos nativos no PowerShell
& cmd /c "docker save ${IMAGE_NAME}:${IMAGE_TAG} | ssh -i `"$SSH_KEY`" -o StrictHostKeyChecking=no -o ConnectTimeout=30 $SSH_HOST `"docker load`""

Assert-Ok "docker save | ssh docker load"
Write-Host "  Imagem transferida e carregada no VPS" -ForegroundColor Green

# ── 3. Enviar docker-compose.deploy.yml ──────────────────────────────────────
Write-Step "3/4" "Enviando docker-compose.deploy.yml"

& scp -i $SSH_KEY -o StrictHostKeyChecking=no `
    ".\docker-compose.deploy.yml" `
    "${SSH_HOST}:${REMOTE_DIR}/docker-compose.deploy.yml"

Assert-Ok "scp docker-compose.deploy.yml"
Write-Host "  Compose file enviado" -ForegroundColor Green

# ── 4. Deploy no VPS ──────────────────────────────────────────────────────────
Write-Step "4/4" "Deploy no VPS: limpa imagens antigas e sobe container"

$remoteScript = @"
set -e
echo '-> Parando containers em execucao...'
docker compose -f $COMPOSE down --remove-orphans 2>/dev/null || true

echo '-> Removendo imagens antigas (dangling)...'
docker image prune -f 2>/dev/null || true

echo '-> Subindo novo container...'
docker compose -f $COMPOSE up -d

echo ''
echo '==========================================='
echo 'Deploy concluido!'
echo '==========================================='
echo ''
echo 'Containers rodando:'
docker compose -f $COMPOSE ps
echo ''
echo 'Logs do backend (ultimas 30 linhas):'
docker compose -f $COMPOSE logs --tail=30
"@

# Converte para Unix line endings antes de enviar ao bash remoto
$unixScript = $remoteScript -replace "`r`n", "`n"

$unixScript | & ssh -i $SSH_KEY `
    -o StrictHostKeyChecking=no `
    -o ConnectTimeout=15 `
    $SSH_HOST "bash"

Assert-Ok "deploy remoto"

Write-Host ""
Write-Host "Deploy finalizado com sucesso!" -ForegroundColor Green
Write-Host "Acesse: http://SEU_IP_VPS" -ForegroundColor Cyan
