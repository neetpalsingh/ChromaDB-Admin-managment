"""
ChromaDB Admin Server
FastAPI server that serves the admin dashboard and proxies ChromaDB API
"""

import os
import subprocess
import sys
from pathlib import Path
from typing import Optional
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import httpx


def get_static_dir() -> Path:
    """Get the static files directory"""
    # When installed, static files are in the package directory
    package_dir = Path(__file__).parent
    static_dir = package_dir / "static"
    
    if static_dir.exists():
        return static_dir
    
    # Fallback: try to find build directory from npm package
    npm_build = Path.cwd() / "build"
    if npm_build.exists():
        return npm_build
    
    raise RuntimeError("Static files not found. Please build the frontend first.")


def create_app(chromadb_url: str = "http://localhost:8000") -> FastAPI:
    """Create FastAPI application"""
    app = FastAPI(
        title="ChromaDB Admin",
        description="Admin dashboard for ChromaDB",
        version="1.0.0"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Proxy to ChromaDB
    @app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def proxy_chromadb(path: str, request: Request):
        """Proxy requests to ChromaDB"""
        url = f"{chromadb_url}/api/{path}"
        
        # Get request body
        body = await request.body()
        
        # Forward request to ChromaDB
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=dict(request.headers),
                content=body,
                timeout=300.0
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
    
    # Serve static files
    try:
        static_dir = get_static_dir()
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
        
        @app.get("/")
        async def serve_spa():
            """Serve the React SPA"""
            index_file = static_dir / "index.html"
            if index_file.exists():
                return FileResponse(index_file)
            return HTMLResponse("<h1>ChromaDB Admin - Static files not found</h1>")
    except RuntimeError as e:
        print(f"⚠️  Warning: {e}")
        print("📝 The admin UI will not be available. API proxy is still functional.")
    
    return app


def start_server(
    chromadb_url: str = "http://localhost:8000",
    host: str = "0.0.0.0",
    port: int = 3434,
    reload: bool = False
):
    """Start the ChromaDB Admin server"""
    app = create_app(chromadb_url=chromadb_url)
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )


if __name__ == "__main__":
    start_server()
