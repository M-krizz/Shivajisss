# Logistics Orchestration Platform

A modern logistics management platform built with Next.js and FastAPI, featuring real-time order tracking, route optimization, and provider management.

## 🏗️ Architecture

```
version2/
├── app/                    # Next.js frontend application
│   ├── app/               # App Router pages and layouts
│   ├── components/        # React components
│   ├── lib/               # Utility functions and types
│   ├── hooks/             # Custom React hooks
│   └── context/           # React context providers
├── backend/               # FastAPI backend application
│   ├── app/               # Python application code
│   └── requirements.txt   # Python dependencies
├── components/            # Shared UI components
├── docs/                  # Project documentation
└── docker-compose.yml     # Container orchestration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **Python** 3.11 or higher
- **Docker** (optional, for containerized deployment)

### Frontend Setup

```bash
# Navigate to the app directory
cd app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template and configure
cp .env.example .env
# Edit .env with your settings

# Start development server
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`
API documentation is available at `http://localhost:8000/docs`

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Services:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | (required) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | SQLite (dev) |
| `REDIS_URL` | Redis connection string | (optional) |
| `DEBUG` | Enable debug mode | `false` |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## 📚 Documentation

- [API Reference](docs/API.md)
- [Component Library](docs/COMPONENTS.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (production), SQLite (development)
- **Cache**: Redis
- **Authentication**: JWT tokens

## 📦 Scripts

### Frontend (app/)
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Backend (backend/)
```bash
uvicorn app.main:app --reload    # Development server
pytest                            # Run tests
black app/                        # Format code
mypy app/                         # Type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
