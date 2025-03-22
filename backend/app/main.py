from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .routes import api

app = FastAPI()

# # CORS configuration
# origins = [
#     "http://localhost",
#     "http://localhost:8080",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Mount static files for assets
app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

# Include API routers
app.include_router(api.router)

# Catch-all route for SPA - must be last
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if not full_path.startswith("api/"):
        return FileResponse("../frontend/dist/index.html")
    raise HTTPException(status_code=404, detail="Not found") 