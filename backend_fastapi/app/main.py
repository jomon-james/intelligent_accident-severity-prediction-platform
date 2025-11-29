"""
app/main.py
--------------------------------------
Main entry point for the FastAPI backend.
Configures the app, CORS, and registers routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router


# ✅ Create FastAPI instance
app = FastAPI(
    title="Intelligent Accident Severity Prediction API",
    description="FastAPI backend for accident severity classification",
    version="1.0.0"
)

# ✅ Configure CORS (allow frontend to connect)
origins = [
    "http://localhost:3000",  # React default
    "http://127.0.0.1:3000",
    "http://localhost:5173"   # Vite (optional)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register the routes
app.include_router(router)

# ✅ Root endpoint (for health check)
@app.get("/")
async def root():
    return {"message": "🚗 Intelligent Accident Severity Prediction API is running!"}
