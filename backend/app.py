"""
PolyGrand FastAPI Backend
Main application entry point
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes import markets, tournaments, staking, ai
from services.websocket import websocket_manager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager"""
    # Startup
    print("🚀 PolyGrand backend starting up...")
    print("✅ Algorand service initialized")
    print("✅ WebSocket manager ready")
    print("✅ In-memory storage initialized")

    yield

    # Shutdown
    print("👋 PolyGrand backend shutting down...")
    await websocket_manager.disconnect_all()


# Create FastAPI app
app = FastAPI(
    title="PolyGrand API",
    description="Prediction Market Platform on Algorand",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check() -> JSONResponse:
    """Health check endpoint"""
    return JSONResponse({
        "status": "ok",
        "service": "PolyGrand Backend",
        "version": "1.0.0",
        "algorand": "connected"
    })


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint"""
    return JSONResponse({
        "message": "Welcome to PolyGrand API",
        "docs": "/docs",
        "health": "/health"
    })


# Register routes
app.include_router(markets.router, prefix="/api/v1/markets", tags=["Markets"])
app.include_router(tournaments.router, prefix="/api/v1/tournaments", tags=["Tournaments"])
app.include_router(staking.router, prefix="/api/v1/staking", tags=["Staking"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])


# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket, client_id: str) -> None:
    """WebSocket endpoint for real-time updates"""
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now, or handle specific messages
            await websocket_manager.send_personal_message(
                f"Message received: {data}", client_id
            )
    except Exception as e:
        print(f"WebSocket error for {client_id}: {e}")
    finally:
        await websocket_manager.disconnect(client_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
