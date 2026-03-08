# =============================================================================
#  Deploy: build local -> push SSH -> limpa VPS -> sobe container
#  Uso: .\deploy.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Lê das variáveis de ambiente; caso não definidas, use o arquivo deploy.env ou edite aqui
$SSH_KEY  = if ($env:DEPLOY_SSH_KEY)  { $env:DEPLOY_SSH_KEY }  else { "CAMINHO/PARA/SUA/CHAVE_SSH.key" }
$SSH_HOST = if ($env:DEPLOY_SSH_HOST) { $env:DEPLOY_SSH_HOST } else { "ubuntu@SEU_IP_VPS" }
if ($SSH_KEY -eq "CAMINHO/PARA/SUA/CHAVE_SSH.key" -or $SSH_HOST -eq "ubuntu@SEU_IP_VPS") {
    Write-Host "ERRO: Configure DEPLOY_SSH_KEY e DEPLOY_SSH_HOST (env vars ou edite o script)." -ForegroundColor Red
    Write-Host "  Exemplo: copie deploy.env.example para deploy.env e ajuste os valores." -ForegroundColor Yellow
    exit 1
}
$IMAGE_NAME = "lat-long-backend"
$IMAGE_TAG = "latest"
$REMOTE_DIR = "/opt/lat-long-caminhoneiro"
$COMPOSE = "$REMOTE_DIR/docker-compose.deploy.yml"
$SSH_OPTS = "-i `"$SSH_KEY`" -o StrictHostKeyChecking=no -o ConnectTimeout=20"

$totalStart = Get-Date

function Write-Step($n, $msg) {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor DarkCyan
    Write-Host "  PASSO $n  |  $msg" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor DarkCyan
}

function Write-Ok($msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Write-Info($msg) {
    Write-Host "  --> $msg" -ForegroundColor DarkGray
}

function Die($label) {
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  [ERRO] $label falhou (exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "  Deploy abortado." -ForegroundColor Red
        exit 1
    }
}

function Elapsed($start) {
    $s = [math]::Round(((Get-Date) - $start).TotalSeconds, 1)
    return "(${s}s)"
}

Write-Host ""
Write-Host "  LAT-LONG DEPLOY  |  VPS: $SSH_HOST" -ForegroundColor Yellow
Write-Host "  Iniciando em: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGray

# =============================================================================
# PASSO 1 — Build local da imagem Docker
# =============================================================================
Write-Step "1/4" "Build da imagem Docker (local)"
$t = Get-Date

docker build `
    --tag "${IMAGE_NAME}:${IMAGE_TAG}" `
    --file ".\backend\Dockerfile" `
    ".\backend"
Die "docker build"

Write-Ok "Imagem buildada: ${IMAGE_NAME}:${IMAGE_TAG} $(Elapsed $t)"

# =============================================================================
# PASSO 2 — Garantir que o diretorio remoto existe
# =============================================================================
Write-Step "2/4" "Preparando diretorio remoto na VPS"
$t = Get-Date

Write-Info "Criando $REMOTE_DIR (se nao existir)..."
& cmd /c "ssh $SSH_OPTS $SSH_HOST `"sudo mkdir -p $REMOTE_DIR && sudo chown ubuntu:ubuntu $REMOTE_DIR`""
Die "criacao do diretorio remoto"

Write-Ok "Diretorio remoto pronto $(Elapsed $t)"

# =============================================================================
# PASSO 3 — Transferir imagem via SSH pipe + enviar compose file
# =============================================================================
Write-Step "3/4" "Enviando imagem para a VPS via SSH pipe"
$t = Get-Date

$imageSize = docker image inspect "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Size}}" 2>$null
if ($imageSize) {
    $sizeMB = [math]::Round([long]$imageSize / 1MB, 0)
    Write-Info "Tamanho da imagem: ~${sizeMB} MB (comprimida sera menor)"
}
Write-Info "Transferindo... aguarde."

& cmd /c "docker save ${IMAGE_NAME}:${IMAGE_TAG} | ssh $SSH_OPTS $SSH_HOST `"docker load`""
Die "docker save | ssh docker load"

Write-Ok "Imagem carregada na VPS $(Elapsed $t)"

Write-Info "Enviando docker-compose.deploy.yml..."
& scp -i $SSH_KEY -o StrictHostKeyChecking=no `
    ".\docker-compose.deploy.yml" `
    "${SSH_HOST}:${REMOTE_DIR}/docker-compose.deploy.yml"
Die "scp docker-compose.deploy.yml"

Write-Info "Criando diretorio backend e enviando .env..."
& ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=20 $SSH_HOST "mkdir -p $REMOTE_DIR/backend"
Die "criacao do diretorio backend remoto"

& scp -i $SSH_KEY -o StrictHostKeyChecking=no `
    ".\backend\.env" `
    "${SSH_HOST}:${REMOTE_DIR}/backend/.env"
Die "scp backend/.env"

Write-Ok "Arquivos enviados"

# =============================================================================
# PASSO 4 — Deploy remoto: para, limpa, sobe, mostra status
# =============================================================================
Write-Step "4/5" "Deploy na VPS: para container, limpa imagens, sobe novo"
$t = Get-Date

$remote = @"
set -e

echo "--> Parando containers em execucao..."
docker compose -f $COMPOSE down --remove-orphans 2>/dev/null || true

echo "--> Removendo imagens nao utilizadas..."
docker image prune -f

echo "--> Subindo novo container..."
docker compose -f $COMPOSE up -d

echo ""
echo "---------------------------------------------"
echo " STATUS DOS CONTAINERS"
echo "---------------------------------------------"
docker compose -f $COMPOSE ps

echo ""
echo "---------------------------------------------"
echo " LOGS DO BACKEND (ultimas 30 linhas)"
echo "---------------------------------------------"
sleep 2
docker compose -f $COMPOSE logs --tail=30

echo ""
echo "============================================="
echo "  DEPLOY CONCLUIDO COM SUCESSO!"
echo "============================================="
"@

$remote -replace "`r`n", "`n" | & ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=15 $SSH_HOST "bash"
Die "deploy remoto"

# =============================================================================
# PASSO 5 — Build e deploy do web (dashboard)
# =============================================================================
Write-Step "5/5" "Build e deploy do dashboard web"
$t = Get-Date

Write-Info "Buildando web com URL da VPS..."
Push-Location ".\web"
$vpsIp = $SSH_HOST.Split('@')[1]
$env:VITE_API_URL = "http://$vpsIp"
npm install --legacy-peer-deps --silent
npx vite build --logLevel warn
Die "vite build"
Pop-Location

Write-Ok "Build concluido $(Elapsed $t)"
$t = Get-Date

Write-Info "Criando diretorio remoto para o web..."
& ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=20 $SSH_HOST "sudo mkdir -p /var/www/lat-long-web && sudo chown ubuntu:ubuntu /var/www/lat-long-web"
Die "criacao diretorio web remoto"

Write-Info "Enviando arquivos estaticos..."
& scp -i $SSH_KEY -o StrictHostKeyChecking=no -r ".\web\dist\*" "${SSH_HOST}:/var/www/lat-long-web/"
Die "scp web dist"

Write-Ok "Web deployado $(Elapsed $t)"

# Atualiza config do Nginx para servir o web
$nginxConf = Get-Content ".\infra\nginx\lat-long.conf" -Raw
if ($nginxConf -notmatch "root /var/www") {
    Write-Info "Atualizando config do Nginx para servir o web..."
    & scp -i $SSH_KEY -o StrictHostKeyChecking=no `
        ".\infra\nginx\lat-long.conf" `
        "${SSH_HOST}:/tmp/lat-long.conf"
    & ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_HOST "sudo cp /tmp/lat-long.conf /etc/nginx/sites-available/lat-long && sudo nginx -t && sudo systemctl reload nginx"
    Die "reload nginx"
}

# =============================================================================
# Resumo final
# =============================================================================
$total = [math]::Round(((Get-Date) - $totalStart).TotalSeconds, 0)
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  DEPLOY FINALIZADO em ${total}s" -ForegroundColor Green
$vpsDisplay = $SSH_HOST.Split('@')[1]
Write-Host "  Backend: http://$vpsDisplay/health" -ForegroundColor Green
Write-Host "  Dashboard: http://$vpsDisplay/" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
