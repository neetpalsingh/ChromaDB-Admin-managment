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
        version="1.0.6"
    )

    # Store current proxy target (mutable)
    proxy_config = {"target": chromadb_url}

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Configure proxy endpoint (for dynamic proxy configuration)
    @app.post("/configure-proxy")
    async def configure_proxy(request: Request):
        """Configure the ChromaDB proxy target"""
        try:
            data = await request.json()
            chromadb_url = data.get("chromadbUrl")

            if chromadb_url:
                proxy_config["target"] = chromadb_url
                print(f"🔧 Proxy target updated to: {chromadb_url}")
                return {"success": True, "target": chromadb_url}
            else:
                return Response(
                    content='{"error": "chromadbUrl is required"}',
                    status_code=400,
                    media_type="application/json"
                )
        except Exception as e:
            return Response(
                content=f'{{"error": "{str(e)}"}}',
                status_code=400,
                media_type="application/json"
            )

    # Proxy to ChromaDB
    @app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def proxy_chromadb(path: str, request: Request):
        """Proxy requests to ChromaDB with authentication headers"""
        # Get current proxy target
        target_url = proxy_config["target"]
        url = f"{target_url}/api/{path}"

        # Get request body
        body = await request.body()

        # Prepare headers - forward all headers from client including auth headers
        headers = {}
        for key, value in request.headers.items():
            # Skip host header to avoid issues
            if key.lower() not in ['host', 'content-length']:
                headers[key] = value

        try:
            # Forward request to ChromaDB with extended timeout for large operations
            # Set timeout to 5 minutes for operations like get, query, etc.
            timeout = httpx.Timeout(
                connect=10.0,      # 10 seconds to establish connection
                read=300.0,        # 5 minutes to read response
                write=60.0,        # 1 minute to send request
                pool=10.0          # 10 seconds to get connection from pool
            )

            async with httpx.AsyncClient(verify=False, timeout=timeout) as client:  # verify=False for self-signed certs
                response = await client.request(
                    method=request.method,
                    url=url,
                    headers=headers,
                    content=body
                )

                # Return response
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers)
                )
        except httpx.ConnectError as e:
            print(f"❌ Connection error to {url}: {e}")
            return Response(
                content=f'{{"error": "Failed to connect to ChromaDB at {target_url}", "detail": "{str(e)}"}}',
                status_code=503,
                media_type="application/json"
            )
        except httpx.TimeoutException as e:
            print(f"❌ Timeout error to {url}: {e}")
            return Response(
                content=f'{{"error": "Request to ChromaDB timed out", "detail": "{str(e)}"}}',
                status_code=504,
                media_type="application/json"
            )
        except Exception as e:
            print(f"❌ Error proxying to {url}: {e}")
            return Response(
                content=f'{{"error": "Internal proxy error", "detail": "{str(e)}"}}',
                status_code=500,
                media_type="application/json"
            )
    
    # Serve static files
    try:
        static_dir = get_static_dir()

        # Mount static assets (JS, CSS, images, etc.)
        static_assets = static_dir / "static"
        if static_assets.exists():
            app.mount("/static", StaticFiles(directory=static_assets), name="static")

        # Serve index.html for all non-API routes (SPA)
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            """Serve the React SPA for all routes except /api"""
            # Don't serve SPA for API routes
            if full_path.startswith("api/"):
                return Response(status_code=404)

            # Serve static files directly if they exist
            file_path = static_dir / full_path
            if file_path.is_file():
                return FileResponse(file_path)

            # Otherwise serve index.html (SPA routing)
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
