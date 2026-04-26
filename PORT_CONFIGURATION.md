# Port Configuration Guide

ChromaDB Admin Management System (CAMS) runs on **port 3434 by default**, but you can easily customize the port using multiple methods.

## 🔢 Default Port: 3434

All distribution methods (NPM, Python, Docker) use **port 3434** as the default port.

---

## 📦 NPM Package - Port Configuration

### Method 1: Command-Line Argument (Recommended)

```bash
# Start on default port 3434
chromadb-admin

# Start on custom port
chromadb-admin --port 8080

# Custom port with ChromaDB URL
chromadb-admin --port 5000 --chromadb-url http://localhost:8000
```

### Method 2: Environment Variable

```bash
# Set PORT environment variable
export PORT=8080
chromadb-admin

# Or inline
PORT=5000 chromadb-admin
```

### Method 3: .env File

Edit `.env` file:
```env
PORT=8080
VITE_PORT=8080
```

Then run:
```bash
chromadb-admin
```

---

## 🐍 Python Package - Port Configuration

### Method 1: Command-Line Argument (Recommended)

```bash
# Start on default port 3434
chromadb-admin

# Start on custom port
chromadb-admin --port 8080

# Custom port and host
chromadb-admin --port 5000 --host 0.0.0.0

# With ChromaDB URL
chromadb-admin --port 9000 --chromadb-url http://chroma:8000
```

### Method 2: Python Code

```python
from chromadb_admin import start_server

# Default port 3434
start_server()

# Custom port
start_server(port=8080)

# Full customization
start_server(
    chromadb_url="http://localhost:8000",
    host="0.0.0.0",
    port=5000
)
```

### Method 3: Environment Variable

```bash
# Set environment variable
export PORT=8080
chromadb-admin

# Or inline
PORT=5000 chromadb-admin
```

---

## 🐳 Docker - Port Configuration

### Method 1: Port Mapping (Recommended)

```bash
# Map host port 8080 to container port 3434
docker run -p 8080:3434 neetpalsingh/chromadb-admin

# Access at http://localhost:8080
```

### Method 2: Environment Variable

```bash
# Change both host and container port
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e CHROMADB_URL=http://localhost:8000 \
  neetpalsingh/chromadb-admin
```

### Method 3: Docker Compose

Edit `docker-compose.yml`:

```yaml
services:
  chromadb-admin:
    image: neetpalsingh/chromadb-admin
    ports:
      - "8080:3434"  # Host port 8080 → Container port 3434
    environment:
      - PORT=3434
      - CHROMADB_URL=http://chromadb:8000
```

Or use environment variables:

```bash
# Set HOST_PORT before running
export HOST_PORT=8080
docker-compose up
```

---

## 🎯 Quick Reference

| Method | Default Port | Custom Port Example |
|--------|-------------|---------------------|
| **NPM CLI** | 3434 | `chromadb-admin --port 8080` |
| **Python CLI** | 3434 | `chromadb-admin --port 8080` |
| **Python Code** | 3434 | `start_server(port=8080)` |
| **Docker** | 3434 | `docker run -p 8080:3434 ...` |
| **Docker Compose** | 3434 | `ports: - "8080:3434"` |

---

## 🔧 All CLI Options

### NPM/Node.js

```bash
chromadb-admin [command] [options]

Options:
  --port <number>         Port to run on (default: 3434)
  --host <address>        Host address (default: 0.0.0.0)
  --chromadb-url <url>    ChromaDB server URL
```

### Python

```bash
chromadb-admin [options]

Options:
  --port <number>         Port to run on (default: 3434)
  --host <address>        Host address (default: 0.0.0.0)
  --chromadb-url <url>    ChromaDB server URL
  --reload                Enable auto-reload (development)
```

---

## 🌐 Complete Examples

### Example 1: Run on Port 8080

```bash
# NPM
chromadb-admin --port 8080

# Python
chromadb-admin --port 8080

# Docker
docker run -p 8080:3434 neetpalsingh/chromadb-admin

# Access: http://localhost:8080
```

### Example 2: Custom Port with Remote ChromaDB

```bash
# NPM
chromadb-admin --port 5000 --chromadb-url http://192.168.1.100:8000

# Python
chromadb-admin --port 5000 --chromadb-url http://192.168.1.100:8000

# Docker
docker run -p 5000:3434 \
  -e CHROMADB_URL=http://192.168.1.100:8000 \
  neetpalsingh/chromadb-admin
```

### Example 3: Production with Custom Port

```bash
# Docker Compose
services:
  chromadb-admin:
    image: neetpalsingh/chromadb-admin
    ports:
      - "80:3434"  # Expose on port 80
    environment:
      - CHROMADB_URL=http://chromadb:8000
      - NODE_ENV=production
```

---

## ⚠️ Important Notes

1. **Container vs Host Port**
   - Container always runs on its configured PORT (default 3434)
   - Host port is mapped to container port
   - Example: `-p 8080:3434` means host:8080 → container:3434

2. **Firewall Rules**
   - Make sure the port is open in your firewall
   - For cloud deployments, update security groups

3. **Port Conflicts**
   - If port is already in use, choose a different port
   - Common error: "Address already in use"

4. **Environment Variables**
   - CLI arguments override environment variables
   - .env file is loaded automatically

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using the port (Linux/Mac)
lsof -i :3434

# Find process using the port (Windows)
netstat -ano | findstr :3434

# Kill the process or use a different port
chromadb-admin --port 3435
```

### Docker Port Mapping Issues

```bash
# Check if port is mapped correctly
docker ps

# View container logs
docker logs chromadb-admin

# Check container port
docker port chromadb-admin
```

---

## 📝 Summary

- **Default port:** 3434
- **Change via CLI:** `--port <number>`
- **Change via env:** `PORT=<number>`
- **Docker mapping:** `-p <host>:<container>`
- **All methods support custom ports**

For more information, see the main [README.md](README.md).
