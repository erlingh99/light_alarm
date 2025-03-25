from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .routes import api

app = FastAPI()
# Mount static files for assets
app.mount("/assets", StaticFiles(directory="./frontend/dist/assets"), name="assets")

# Include API routers
app.include_router(api.router)


@app.get("/favicon.ico", include_in_schema=False)
async def serveIcon():
    return FileResponse("./frontend/dist/favicon.ico")

@app.get("/site.webmanifest", include_in_schema=False)
async def serveManifest():
    return FileResponse("./frontend/dist/serve.webmanifest")

@app.get("/apple-touch-icon.png", include_in_schema=False)
async def serveAppleIcon():
    return FileResponse("./frontend/dist/apple-touch-icon.png")

@app.get("/android-chrom-192x192.ico", include_in_schema=False)
async def serveAndroidIcon():
    return FileResponse("./frontend/dist/android-chrome-192x192.png")

# Catch-all route for SPA - must be last
@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    if not full_path.startswith("api/"):
        return FileResponse("./frontend/dist/index.html")
    raise HTTPException(status_code=404, detail="Not found")
