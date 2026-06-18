# 🐳 Docker Publishing Guide for ChromaDB Admin v1.0.4

## Prerequisites

1. **Docker installed** - https://docs.docker.com/get-docker/
2. **Docker Hub account** - https://hub.docker.com/signup
3. **Logged in to Docker Hub**

---

## Step 1: Login to Docker Hub

```powershell
docker login
```

Enter your Docker Hub username and password when prompted.

---

## Step 2: Build the Docker Image

From the `api-ui` directory:

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Build the image with multiple tags
docker build -t neetpalsingh/chromadb-admin:1.0.4 -t neetpalsingh/chromadb-admin:latest .
```

This will:
- Build a multi-stage Docker image
- Tag it as both `1.0.4` and `latest`
- Optimize the image size (production build only)

**Expected output:**
```
[+] Building 45.3s (17/17) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 1.45kB
 => [internal] load .dockerignore
 ...
 => => naming to docker.io/neetpalsingh/chromadb-admin:1.0.4
 => => naming to docker.io/neetpalsingh/chromadb-admin:latest
```

---

## Step 3: Test the Image Locally

```powershell
# Run the container
docker run -d -p 3434:3434 --name chromadb-admin-test neetpalsingh/chromadb-admin:1.0.4

# Check if it's running
docker ps

# View logs
docker logs chromadb-admin-test

# Test in browser
# Open: http://localhost:3434
```

If everything works, stop and remove the test container:

```powershell
docker stop chromadb-admin-test
docker rm chromadb-admin-test
```

---

## Step 4: Push to Docker Hub

```powershell
# Push version 1.0.4
docker push neetpalsingh/chromadb-admin:1.0.4

# Push latest tag
docker push neetpalsingh/chromadb-admin:latest
```

---

## Step 5: Verify on Docker Hub

1. Visit: https://hub.docker.com/r/neetpalsingh/chromadb-admin
2. Check that version `1.0.4` and `latest` are available
3. Update the README on Docker Hub with usage instructions

---

## Usage Instructions for Users

### Pull and Run

```bash
# Pull the image
docker pull neetpalsingh/chromadb-admin:latest

# Run with default settings
docker run -d -p 3434:3434 neetpalsingh/chromadb-admin:latest

# Run with custom ChromaDB URL
docker run -d -p 3434:3434 \
  -e CHROMADB_URL=http://chromadb:8000 \
  neetpalsingh/chromadb-admin:latest

# Run with custom port
docker run -d -p 8080:3434 \
  -e PORT=3434 \
  neetpalsingh/chromadb-admin:latest
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  chromadb-admin:
    image: neetpalsingh/chromadb-admin:latest
    ports:
      - "3434:3434"
    environment:
      - CHROMADB_URL=http://chromadb:8000
      - PORT=3434
    restart: unless-stopped
    
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chromadb-data:/chroma/chroma
    restart: unless-stopped

volumes:
  chromadb-data:
```

---

## Troubleshooting

### Build fails
```powershell
# Clear Docker cache and rebuild
docker builder prune -a
docker build --no-cache -t neetpalsingh/chromadb-admin:1.0.4 .
```

### Image too large
```powershell
# Check image size
docker images | grep chromadb-admin

# Expected size: ~150-200 MB (Alpine-based)
```

### Container won't start
```powershell
# Check logs
docker logs <container-id>

# Run interactively to debug
docker run -it --rm neetpalsingh/chromadb-admin:1.0.4 sh
```

---

## Summary

✅ Docker image built for v1.0.4  
✅ Multi-stage build (optimized size)  
✅ Includes health checks  
✅ Production-ready  
✅ Supports environment variables  

**Image URL:** `neetpalsingh/chromadb-admin:1.0.4`  
**Docker Hub:** https://hub.docker.com/r/neetpalsingh/chromadb-admin
