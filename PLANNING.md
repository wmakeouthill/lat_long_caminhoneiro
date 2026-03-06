# 🚚 Lat/Long Caminhoneiro — Planejamento

## Visão Geral

Sistema de rastreamento GPS em tempo real para caminhoneiros.
O motorista abre o app Android, faz login com Google, ativa o rastreamento e o app envia a posição em background continuamente — mesmo com a tela fechada.
Um dashboard web exibe todos os caminhoneiros ativos no mapa em tempo real.

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    Oracle VPS (1 GB RAM)                         │
│                                                                   │
│  ┌──────────┐    ┌────────────────────────────────────────────┐  │
│  │  nginx   │───▶│  uvicorn  (FastAPI — 1 worker)             │  │
│  │ :80/:443 │    │  :8000                                      │  │
│  └──────────┘    │  ├── POST  /api/v1/auth/google             │  │
│       │          │  ├── POST  /api/v1/localizacoes            │  │
│       │          │  ├── GET   /api/v1/caminhoneiros           │  │
│       │          │  └── WS   /ws/rastreamento                 │  │
│       │          └────────────────┬───────────────────────────┘  │
│       │                           │                               │
│       │                    ┌──────▼──────┐                        │
│       │                    │   SQLite    │                        │
│       │                    │  (arquivo)  │                        │
│       │                    └─────────────┘                        │
│       │                                                           │
│  ┌────▼─────────────────┐                                        │
│  │  React (build estát.) │  ← dashboard web                      │
│  │  /var/www/web         │                                        │
│  └──────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
   ┌─────┴────────┐          ┌──────────┴────────┐
   │ App Android  │          │  Browser (gestor)  │
   │ (Expo RN)    │          │  dashboard web     │
   │              │          └───────────────────-┘
   │ ► Login Google
   │ ► Ativa rastreio
   │ ► Foreground Service
   │   envia GPS a cada 60s
   └─────────────-┘
```

---

## Stack Tecnológica

| Camada     | Tecnologia                              | Motivo                             |
|------------|-----------------------------------------|------------------------------------|
| Backend    | Python 3.12 + FastAPI 0.115             | async, leve, tipado                |
| ORM        | SQLAlchemy 2.x async + aiosqlite        | zero RAM extra vs Postgres         |
| Validação  | Pydantic 2.x                            | regra dos arquivos de padrões      |
| Migrations | Alembic 1.14                            | versionamento do schema            |
| Auth       | Google OAuth2 PKCE + JWT (python-jose)  | grátis, confiável, nativo Android  |
| Mobile     | Expo SDK 52 + React Native 0.76         | cross-platform, GPS background     |
| Web        | React 19 + TypeScript 5.6 + Vite 6      | build estático servido pelo nginx  |
| Server state | TanStack Query 5                      | padrão dos arquivos de regras      |
| Client state | Zustand 5                             | padrão dos arquivos de regras      |
| Mapa       | Leaflet + react-leaflet                 | 100% grátis, sem API key           |
| Infra      | Nginx + systemd + Let's Encrypt         | zero custo operacional             |
| DB         | SQLite (arquivo em disco)               | 0 MB RAM extra; suficiente aqui    |

---

## Consumo de RAM Estimado

| Serviço              | RAM Estimada |
|----------------------|-------------|
| Ubuntu minimal       | ~300 MB      |
| FastAPI (1 worker)   | ~80 MB       |
| Nginx                | ~15 MB       |
| SQLite               | ~0 MB extra  |
| **Total**            | **~395 MB**  |
| **Margem disponível**| **~625 MB**  |

---

## Estrutura do Repositório

```
lat-long-caminhoneiro/
├── PLANNING.md
├── package.json                    # npm workspaces
│
├── backend/
│   ├── pyproject.toml
│   ├── .env.example
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial.py
│   └── src/
│       └── app/
│           ├── main.py
│           ├── domain/
│           │   ├── entities/
│           │   │   ├── caminhoneiro.py       # SQLAlchemy model
│           │   │   └── localizacao.py        # SQLAlchemy model
│           │   ├── schemas/
│           │   │   ├── auth_schema.py        # DTOs de auth
│           │   │   ├── caminhoneiro_schema.py
│           │   │   └── localizacao_schema.py
│           │   ├── repositories/
│           │   │   ├── caminhoneiro_repository.py  # ABC (interface)
│           │   │   └── localizacao_repository.py   # ABC (interface)
│           │   └── exceptions/
│           │       └── __init__.py           # Exceções de domínio
│           ├── application/
│           │   └── services/
│           │       ├── auth_service.py
│           │       ├── localizacao_service.py
│           │       └── caminhoneiro_service.py
│           ├── infrastructure/
│           │   ├── config/settings.py        # Pydantic Settings
│           │   ├── database/connection.py    # engine + session
│           │   ├── repositories/             # Implementações SQLAlchemy
│           │   └── security/
│           │       ├── google_oauth.py       # Verifica ID token Google
│           │       └── jwt_handler.py        # Cria/valida JWT
│           └── interfaces/
│               └── api/v1/
│                   ├── dependencies/auth_dependency.py
│                   ├── routers/
│                   │   ├── auth_router.py
│                   │   ├── localizacoes_router.py
│                   │   ├── caminhoneiros_router.py
│                   │   └── websocket_router.py
│                   └── websocket/connection_manager.py
│
├── mobile/                         # Expo + React Native
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── app/
│   │   ├── _layout.tsx             # Root layout + task registration
│   │   ├── index.tsx               # Tela de login
│   │   └── rastreamento.tsx        # Tela de rastreamento
│   └── src/
│       ├── features/
│       │   ├── auth/
│       │   │   ├── components/TelaLogin/
│       │   │   ├── services/auth.service.ts
│       │   │   └── types/auth.types.ts
│       │   └── tracking/
│       │       ├── components/TelaRastreamento/
│       │       ├── services/tracking.service.ts
│       │       ├── tasks/localizacao-task.ts  # Background task
│       │       └── types/tracking.types.ts
│       └── shared/
│           ├── services/api.service.ts
│           ├── store/auth.store.ts
│           └── constants/app.constants.ts
│
├── web/                            # React 19 (dashboard gestor)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── features/rastreamento/
│       │   ├── components/
│       │   │   ├── MapaCaminhoneiros/
│       │   │   └── CartaoCaminhoneiro/
│       │   ├── pages/PainelRastreamento/
│       │   ├── services/rastreamento.service.ts
│       │   ├── hooks/useRastreamentoWebSocket.ts
│       │   └── types/rastreamento.types.ts
│       └── shared/
│           ├── services/api.service.ts
│           └── constants/app.constants.ts
│
└── infra/
    ├── nginx/nginx.conf
    ├── systemd/lat-long-backend.service
    └── scripts/deploy.sh
```

---

## Contrato de API

### Auth

| Método | Rota                   | Auth | Descrição                              |
|--------|------------------------|------|----------------------------------------|
| POST   | `/api/v1/auth/google`  | —    | Recebe ID token Google, retorna JWT    |
| GET    | `/api/v1/auth/me`      | JWT  | Retorna dados do caminhoneiro logado   |

**POST /api/v1/auth/google**
```json
// Request
{ "id_token": "eyJhbGci..." }

// Response 200
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "caminhoneiro": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@gmail.com",
    "foto_url": "https://..."
  }
}
```

### Localização

| Método | Rota                                 | Auth | Descrição                          |
|--------|--------------------------------------|------|------------------------------------|
| POST   | `/api/v1/localizacoes`               | JWT  | Registra posição do caminhoneiro   |
| GET    | `/api/v1/caminhoneiros`              | —    | Lista todos com última posição     |
| GET    | `/api/v1/caminhoneiros/{id}/historico` | —  | Histórico de posições              |

**POST /api/v1/localizacoes**
```json
// Request
{
  "latitude": -23.5505,
  "longitude": -46.6333,
  "precisao": 10.5,
  "velocidade": 80.0,
  "registrado_em": "2024-01-01T10:00:00Z"
}

// Response 201
{ "id": "uuid", "recebido_em": "2024-01-01T10:00:01Z" }
```

### WebSocket

| Rota               | Descrição                                      |
|--------------------|------------------------------------------------|
| `WS /ws/rastreamento` | Broadcast de novas posições ao dashboard    |

**Mensagem broadcast:**
```json
{
  "caminhoneiro_id": "uuid",
  "nome": "João Silva",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "velocidade": 80.0,
  "atualizado_em": "2024-01-01T10:00:01Z"
}
```

---

## Fluxo de Autenticação (Google OAuth PKCE)

```
Android App                     Google                    Backend
    │                               │                         │
    │── useAuthRequest (PKCE) ─────▶│                         │
    │                               │ (usuário faz login)     │
    │◀── authorization_code ────────│                         │
    │                               │                         │
    │── troca code por tokens ─────▶│                         │
    │◀── { id_token, ... } ─────────│                         │
    │                               │                         │
    │── POST /api/v1/auth/google ──────────────────────────▶ │
    │       { id_token }            │    verifica token        │
    │                               │◀── tokeninfo ───────────│
    │                               │──── { sub, email } ────▶│
    │◀── { access_token (JWT) } ──────────────────────────── │
    │                               │                         │
    │  (salva JWT no SecureStore)   │                         │
```

---

## Fluxo de Rastreamento (Background)

```
Android (Expo TaskManager)                    Backend
    │                                              │
    │  [usuário ativa rastreamento]                │
    │                                              │
    │── startLocationUpdatesAsync() ──▶           │
    │   (Foreground Service inicia)               │
    │   (notificação persistente aparece)         │
    │                                              │
    │  [a cada 60 segundos, em background]         │
    │                                              │
    ├── GET GPS position ─────────────────────────┤
    ├── POST /api/v1/localizacoes ───────────────▶│
    │       Authorization: Bearer {jwt}            │
    │       { lat, lon, precisao, velocidade }     │
    │                                              │
    │                        salva no SQLite ──────│
    │                        broadcast WS ─────────│──▶ Dashboard web
    │                                              │
```

---

## Variáveis de Ambiente (.env)

```env
# Backend
JWT_SECRET_KEY=sua-chave-secreta-aqui-min-32-chars
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=xxxxx.apps.googleusercontent.com  # opcional
DATABASE_URL=sqlite+aiosqlite:///./data/rastreamento.db
CORS_ORIGINS=["https://seudominio.com","http://localhost:5173"]

# Mobile (app.json extra)
API_URL=https://seudominio.com
GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## Guia de Deploy (Oracle VPS 1 GB)

### Pré-requisitos
```bash
# Ubuntu 22.04 minimal
sudo apt update && sudo apt install -y python3.12 python3.12-venv nginx certbot python3-certbot-nginx
```

### Backend
```bash
cd /opt/lat-long-caminhoneiro/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install poetry
poetry install --only main
mkdir -p data
cp .env.example .env  # editar .env

# Migrations
alembic upgrade head

# Teste
uvicorn src.app.main:app --host 127.0.0.1 --port 8000
```

### Systemd
```bash
sudo cp infra/systemd/lat-long-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lat-long-backend
```

### Nginx + SSL
```bash
sudo cp infra/nginx/nginx.conf /etc/nginx/sites-available/lat-long
sudo ln -s /etc/nginx/sites-available/lat-long /etc/nginx/sites-enabled/
sudo certbot --nginx -d seudominio.com
sudo systemctl reload nginx
```

### Web (build estático)
```bash
cd web
npm install
npm run build
sudo cp -r dist/* /var/www/lat-long-web/
```

### Mobile (APK)
```bash
cd mobile
npm install
npx eas build --platform android --profile preview  # APK para sideload
# ou
npx expo run:android  # para testar localmente
```

---

## Roadmap de Desenvolvimento

### Fase 1 — MVP (atual)
- [x] Planejamento e estrutura do monorepo
- [ ] Backend: auth Google + endpoints de localização + WebSocket
- [ ] Mobile: login Google + rastreamento em background
- [ ] Web: dashboard com mapa + lista de caminhoneiros
- [ ] Infra: nginx + systemd

### Fase 2 — Melhorias
- [ ] Auth no dashboard web (proteger o painel)
- [ ] Histórico de rotas no mapa (polyline)
- [ ] Alertas por tempo sem atualização (caminhoneiro parado)
- [ ] Push notifications (Firebase)

### Fase 3 — Otimizações
- [ ] Intervalo de GPS configurável por caminhoneiro
- [ ] Compressão de payload (batching de posições)
- [ ] Backup automático do SQLite

---

## Configuração Google Cloud Console

1. Acessar [console.cloud.google.com](https://console.cloud.google.com)
2. Criar projeto → Habilitar **Google Identity API**
3. Credenciais → **Criar ID do cliente OAuth 2.0**
   - Tipo: **Aplicativo da Web**
   - URIs de redirecionamento: `https://auth.expo.io/@seu-usuario/lat-long-caminhoneiro`
4. Copiar o **Client ID** para `.env` e `app.json`

> **Obs:** O número de telefone do Android não é usado — o Google SSO é mais confiável,
> funciona em 100% dos dispositivos e não requer permissões sensíveis extras.
