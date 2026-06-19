# ChromaDB Admin - Python Package

A comprehensive admin dashboard and CLI tool for managing ChromaDB vector databases.

## 🚀 Quick Start

### Installation

```bash
pip install chromadb-admin
```

### Usage

#### CLI Usage

```bash
# Start with default settings (port 3434)
chromadb-admin

# Custom port
chromadb-admin --port 8080

# Custom ChromaDB URL
chromadb-admin --chromadb-url http://localhost:8000

# Full customization
chromadb-admin --port 5000 --host 0.0.0.0 --chromadb-url http://chroma:8000

# Enable auto-reload (development)
chromadb-admin --reload
```

#### Python API Usage

```python
from chromadb_admin import start_server

# Start with defaults
start_server()

# Custom configuration
start_server(
    chromadb_url="http://localhost:8000",
    host="0.0.0.0",
    port=3434,
    reload=False
)
```

#### Using the Client Library

```python
from chromadb_admin import ChromaDBAdminClient

# Connect to the admin API
client = ChromaDBAdminClient("http://localhost:3434")

# Get server health
health = client.health()
print(health)

# List collections
collections = client.list_collections()
print(collections)
```

## 📋 Features

- ✅ **Web Dashboard** - Modern React-based UI
- ✅ **CLI Tool** - Easy command-line interface
- ✅ **Python API** - Programmatic access
- ✅ **Collection Management** - Create, view, delete collections
- ✅ **Document Operations** - Add, query, update, delete documents
- ✅ **Query Interface** - Advanced similarity search
- ✅ **Metadata Filtering** - Filter by metadata
- ✅ **Batch Operations** - Bulk upload and export
- ✅ **Multi-tenant Support** - Manage multiple databases

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
CHROMADB_URL=http://localhost:8000
PORT=3434
HOST=0.0.0.0
```

### CLI Arguments

```bash
chromadb-admin --help

Options:
  --chromadb-url TEXT  ChromaDB server URL (default: http://localhost:8000)
  --port INTEGER       Server port (default: 3434)
  --host TEXT          Server host (default: 0.0.0.0)
  --reload             Enable auto-reload (development)
  --help               Show this message and exit
```

## 📦 Installation Methods

### From PyPI (Recommended)

```bash
pip install chromadb-admin
```

### From Source

```bash
git clone https://github.com/neetpalsingh/ChromaDB-Admin-managment.git
cd ChromaDB-Admin-managment/python-package
pip install -e .
```

## 🐳 Docker Alternative

If you prefer Docker:

```bash
docker pull neetpalsingh/chromadb-admin
docker run -p 3434:3434 neetpalsingh/chromadb-admin
```

## 📚 Documentation

- **GitHub Repository:** https://github.com/neetpalsingh/ChromaDB-Admin-managment
- **Full Documentation:** See repository README
- **Issues:** https://github.com/neetpalsingh/ChromaDB-Admin-managment/issues

## 🔗 Related Packages

- **NPM Package:** `npm install -g chromadb-admin`
- **Docker Image:** `neetpalsingh/chromadb-admin`

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Neetpal Singh**
- Email: neetpalsingh750@gmail.com
- GitHub: [@neetpalsingh](https://github.com/neetpalsingh)

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md in the repository.

## ⭐ Support

If you find this useful, please star the repository!

https://github.com/neetpalsingh/ChromaDB-Admin-managment
