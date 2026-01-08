# 🚀 Deployment Guide

## Multi-Modal Logistics Platform - Deployment Documentation

This guide covers deploying the platform to various environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Build](#production-build)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 10 GB | 20+ GB |
| OS | Windows 10/Ubuntu 20.04 | Ubuntu 22.04 |

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | Frontend runtime |
| Python | 3.10+ | Backend runtime |
| pnpm | 8+ | Package manager |
| Git | 2.30+ | Version control |

---

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd "version 2"
```

### 2. Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8001
```

### 3. Frontend Setup

```powershell
# From project root
cd "version 2"

# Install dependencies
pnpm install

# Create environment file
@"
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
NEXT_PUBLIC_WS_BASE=ws://127.0.0.1:8001
"@ | Out-File -FilePath .env.local -Encoding UTF8

# Run development server
pnpm dev
```

### 4. Verify Installation

- Frontend: http://localhost:3000
- Backend: http://localhost:8001/docs
- Health Check: http://localhost:8001/health

---

## Production Build

### Frontend Production Build

```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start

# Or serve with custom port
PORT=3000 pnpm start
```

**Build Output:**
```
├── .next/
│   ├── static/      # Static assets (CSS, JS)
│   ├── server/      # Server components
│   └── cache/       # Build cache
```

### Backend Production Server

```bash
# Production with multiple workers
uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8001 \
    --workers 4 \
    --log-level info

# With Gunicorn (recommended for production)
pip install gunicorn
gunicorn app.main:app \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:8001
```

---

## Docker Deployment

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Frontend Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_WS_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_WS_BASE=$NEXT_PUBLIC_WS_BASE

RUN pnpm build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - PYTHONUNBUFFERED=1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_BASE=http://backend:8001
        - NEXT_PUBLIC_WS_BASE=ws://backend:8001
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Future: Add database
  # postgres:
  #   image: postgres:15-alpine
  #   environment:
  #     POSTGRES_DB: logistics
  #     POSTGRES_USER: admin
  #     POSTGRES_PASSWORD: secret
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:
```

### Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

---

## Cloud Deployment

### Vercel (Frontend)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_API_BASE`: Your backend URL
     - `NEXT_PUBLIC_WS_BASE`: Your WebSocket URL

3. **vercel.json Configuration**
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "pnpm build",
     "installCommand": "pnpm install"
   }
   ```

### Railway (Backend)

1. **Create Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   ```

2. **Configure Deployment**
   ```bash
   # Deploy backend directory
   cd backend
   railway up
   ```

3. **Environment Variables**
   - Set in Railway Dashboard or via CLI:
   ```bash
   railway variables set PORT=8001
   ```

4. **railway.json Configuration**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
       "healthcheckPath": "/health"
     }
   }
   ```

### AWS EC2

1. **Launch Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (minimum)
   - Security Group: Allow ports 22, 80, 443, 3000, 8001

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python
   sudo apt install -y python3.11 python3.11-venv python3-pip
   
   # Install pnpm
   npm install -g pnpm
   
   # Install Nginx
   sudo apt install -y nginx
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd "version 2"
   
   # Setup backend
   cd backend
   python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   
   # Setup frontend
   cd ..
   pnpm install
   pnpm build
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/logistics
   
   upstream backend {
       server 127.0.0.1:8001;
   }
   
   upstream frontend {
       server 127.0.0.1:3000;
   }
   
   server {
       listen 80;
       server_name your-domain.com;
   
       # Frontend
       location / {
           proxy_pass http://frontend;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   
       # Backend API
       location /api/ {
           rewrite ^/api/(.*) /$1 break;
           proxy_pass http://backend;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   
       # WebSocket
       location /ws {
           proxy_pass http://backend;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_read_timeout 86400;
       }
   }
   ```

5. **Systemd Services**

   **Backend Service:**
   ```ini
   # /etc/systemd/system/logistics-backend.service
   [Unit]
   Description=Logistics Backend API
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/version-2/backend
   Environment="PATH=/home/ubuntu/version-2/backend/.venv/bin"
   ExecStart=/home/ubuntu/version-2/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

   **Frontend Service:**
   ```ini
   # /etc/systemd/system/logistics-frontend.service
   [Unit]
   Description=Logistics Frontend
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/version-2
   ExecStart=/usr/bin/node /home/ubuntu/version-2/.next/standalone/server.js
   Environment=PORT=3000
   Environment=NODE_ENV=production
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

6. **Enable Services**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable logistics-backend logistics-frontend
   sudo systemctl start logistics-backend logistics-frontend
   sudo systemctl enable nginx
   sudo systemctl restart nginx
   ```

---

## Environment Configuration

### Development (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
NEXT_PUBLIC_WS_BASE=ws://127.0.0.1:8001

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_dev_key

# Debug
NEXT_PUBLIC_DEBUG=true
```

### Production (.env.production)

```env
# API Configuration
NEXT_PUBLIC_API_BASE=https://api.your-domain.com
NEXT_PUBLIC_WS_BASE=wss://api.your-domain.com

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_prod_key

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Backend Environment

```env
# Server
HOST=0.0.0.0
PORT=8001
WORKERS=4
LOG_LEVEL=info

# CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Future: Database
# DATABASE_URL=postgresql://user:pass@host:5432/logistics
# REDIS_URL=redis://localhost:6379

# Future: Auth
# JWT_SECRET=your-secret-key
# JWT_ALGORITHM=HS256
```

---

## Monitoring & Logging

### Application Logging

**Backend (Python):**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

**Frontend (Next.js):**
```typescript
// Use console for development, structured logging for production
if (process.env.NODE_ENV === 'production') {
  // Send to logging service
}
```

### Health Checks

```bash
# Backend health
curl http://localhost:8001/health

# Frontend (add custom endpoint)
curl http://localhost:3000/api/health
```

### Recommended Monitoring Tools

| Tool | Purpose |
|------|---------|
| **Datadog** | Full-stack monitoring |
| **Sentry** | Error tracking |
| **Prometheus + Grafana** | Metrics & dashboards |
| **ELK Stack** | Log aggregation |

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :8001   # Linux/Mac
netstat -ano | findstr :8001   # Windows

# Kill process
kill -9 <PID>   # Linux/Mac
taskkill /PID <PID> /F   # Windows
```

#### CORS Errors

Ensure backend CORS middleware is configured:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### WebSocket Connection Failed

1. Check WebSocket URL matches backend
2. Ensure proxy is configured for WebSocket upgrade
3. Check firewall allows WebSocket connections

#### Build Failures

```bash
# Clear caches
rm -rf .next node_modules
pnpm install
pnpm build

# Check Node.js version
node --version  # Should be 18+
```

#### Backend Import Errors

```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Debug Mode

**Frontend:**
```bash
DEBUG=* pnpm dev
```

**Backend:**
```bash
uvicorn app.main:app --reload --log-level debug
```

---

## Security Checklist

- [ ] Enable HTTPS in production
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable security headers (Helmet.js / FastAPI middleware)
