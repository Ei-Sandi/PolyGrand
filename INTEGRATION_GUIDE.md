# PolyGrand - Integrated Development Guide

This document explains how to run the integrated PolyGrand application with frontend, backend, and contracts.

## Project Structure

```
PolyGrand/
├── frontend/          # React + Vite frontend (Port 3000)
├── backend/           # FastAPI backend (Port 8000)
├── contracts/         # Algorand smart contracts
├── package.json       # Root package.json with workspaces
├── start.sh           # Unix/Linux/Mac start script
└── start.bat          # Windows start script
```

## Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.12
- **npm** >= 9.0.0

## Quick Start

### Option 1: Using Start Script (Recommended)

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

### Option 2: Using npm

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev
```

## Available Scripts

### Root Level Scripts

- `npm run dev` - Start both frontend and backend concurrently
- `npm run dev:frontend` - Start only the frontend (Port 3000)
- `npm run dev:backend` - Start only the backend (Port 8000)
- `npm run build` - Build the frontend for production
- `npm run install:all` - Install all dependencies (root, frontend, backend)
- `npm run clean` - Remove all node_modules and build artifacts
- `npm start` - Alias for `npm run dev`

### Frontend Scripts (in `/frontend`)

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Scripts (in `/backend`)

```bash
cd backend
python -m uvicorn app:app --reload  # Start development server
```

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## API Proxy Configuration

The frontend is configured to proxy API requests to the backend:

- Requests to `/api/*` → `http://localhost:8000/api/*`
- WebSocket requests to `/ws/*` → `ws://localhost:8000/ws/*`

This is configured in `frontend/vite.config.ts`.

## Development Workflow

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **The terminal will show:**
   - Backend server starting on http://localhost:8000
   - Frontend dev server starting on http://localhost:3000

3. **Make changes:**
   - Frontend changes auto-reload (Hot Module Replacement)
   - Backend changes auto-reload (uvicorn --reload)

4. **Stop the application:**
   - Press `Ctrl+C` to stop both services

## Python Virtual Environment

The start scripts automatically handle the Python virtual environment:

1. Creates `.venv` if it doesn't exist
2. Activates the virtual environment
3. Installs dependencies from `backend/requirements.txt`

To manually manage the Python environment:

```bash
# Create virtual environment
python3 -m venv .venv

# Activate (Linux/Mac)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

## Smart Contracts

To compile and deploy smart contracts:

```bash
cd contracts
python compile.py    # Compile contracts
python deploy.py     # Deploy to Algorand
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 8000 are already in use:

**Frontend (change from 3000):**
Edit `frontend/vite.config.ts` and change the port number.

**Backend (change from 8000):**
Edit the `dev:backend` script in root `package.json`.

### Dependencies Not Installing

```bash
# Clean and reinstall everything
npm run clean
npm run install:all
```

### Python Dependencies Issues

```bash
# Deactivate and recreate virtual environment
deactivate
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

## Production Build

To build the frontend for production:

```bash
npm run build
```

The built files will be in `frontend/dist/`.

To preview the production build:

```bash
cd frontend
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Algorand Configuration
ALGOD_TOKEN=your_algod_token
ALGOD_SERVER=http://localhost:4001
INDEXER_TOKEN=your_indexer_token
INDEXER_SERVER=http://localhost:8980

# Backend Configuration
BACKEND_PORT=8000
DEBUG=True

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite 7
- TailwindCSS
- React Router
- Zustand (state management)
- React Query
- Algorand SDK

### Backend
- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic
- AlgoKit Utils
- WebSockets

### Smart Contracts
- PyTeal
- Algorand SDK

## Additional Resources

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Project Overview](./PROJECT_OVERVIEW.md)
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
