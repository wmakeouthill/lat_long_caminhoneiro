#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Primeiro setup do Oracle VPS (roda UMA vez)
#
# Uso:
#   bash infra/scripts/setup-vps.sh ubuntu@SEU_IP_ORACLE
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SSH_TARGET="${1:?Uso: $0 ubuntu@ip}"
REPO_URL="${2:?Uso: $0 ubuntu@ip https://github.com/seu-usuario/lat-long-caminhoneiro.git}"

echo "🛠  Configurando VPS: $SSH_TARGET"

ssh -o StrictHostKeyChecking=no "$SSH_TARGET" bash << REMOTE_EOF
set -euo pipefail

echo "==> Atualizando sistema"
sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends \
  git nginx certbot python3-certbot-nginx \
  ca-certificates curl gnupg

echo "==> Instalando Docker"
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  \$(. /etc/os-release && echo \"\$VERSION_CODENAME\") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -qq
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker \$USER

echo "==> Instalando Node 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> Clonando repositório"
sudo mkdir -p /opt/lat-long-caminhoneiro
sudo chown \$USER:\$USER /opt/lat-long-caminhoneiro
git clone ${REPO_URL} /opt/lat-long-caminhoneiro

echo "==> Configurando .env do backend"
cp /opt/lat-long-caminhoneiro/backend/.env.example \
   /opt/lat-long-caminhoneiro/backend/.env
echo ""
echo "⚠️  EDITE o .env antes de continuar:"
echo "   nano /opt/lat-long-caminhoneiro/backend/.env"

echo "==> Criando diretório web"
sudo mkdir -p /var/www/lat-long-web
sudo chown \$USER:\$USER /var/www/lat-long-web

echo "==> Configurando nginx"
sudo cp /opt/lat-long-caminhoneiro/infra/nginx/nginx.conf \
        /etc/nginx/sites-available/lat-long
sudo ln -sf /etc/nginx/sites-available/lat-long \
            /etc/nginx/sites-enabled/lat-long
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅  Setup concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Edite o .env: nano /opt/lat-long-caminhoneiro/backend/.env"
echo "  2. Configure o DNS do seu domínio para apontar para este IP"
echo "  3. Rode o certbot: sudo certbot --nginx -d seudominio.com"
echo "  4. Rode o deploy: bash infra/scripts/deploy-ssh.sh $SSH_TARGET"

REMOTE_EOF
