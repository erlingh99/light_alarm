from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .routes import api

app = FastAPI()
# Mount static files for assets
app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

# Include API routers
app.include_router(api.router)

# Catch-all route for SPA - must be last
@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    if not full_path.startswith("api/"):
        return FileResponse("../frontend/dist/index.html")
    raise HTTPException(status_code=404, detail="Not found") 