# ChromaDB Admin Management System (CAMS)

<div align="center">

![ChromaDB Admin](https://img.shields.io/badge/ChromaDB-Admin-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen?style=for-the-badge)
![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue?style=for-the-badge)

**A modern, full-featured web-based admin dashboard for managing ChromaDB vector databases**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

ChromaDB Admin Management System (CAMS) is an open-source web-based admin dashboard for [ChromaDB](https://www.trychroma.com/) - the AI-native open-source embedding database. CAMS provides a beautiful, intuitive interface for managing your vector databases, collections, and data operations.

### Why CAMS?

- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 🚀 **Easy to Use** - Intuitive interface for both beginners and experts
- 🐳 **Docker Ready** - One command deployment
- 📦 **Multi-Platform** - Available as NPM package, Python package, and Docker image
- 🔌 **Flexible** - Works with any ChromaDB instance (local or remote)
- 🛠️ **Feature-Rich** - Complete management of databases, collections, and vectors
- 🌐 **Open Source** - MIT licensed, community-driven

## Features

- 🔌 **Connection Management** - Connect to local or remote ChromaDB instances
- 📊 **Dashboard** - View database statistics and health metrics
- 🗄️ **Database Management** - Create, view, and manage databases and collections
- 👥 **Tenant Management** - Multi-tenant support
- 🔍 **Data Operations** - Query, insert, update, and delete vectors
- 🧪 **API Testing** - Built-in Swagger UI for API exploration
- 🌙 **Dark Mode** - Beautiful dark theme support
- ⚙️ **Configurable** - Environment-based configuration

## 🚀 Installation

CAMS can be installed in multiple ways. Choose the method that works best for you:

### 📦 Method 1: NPM Package (Recommended for Node.js projects)

#### Option A: Using npx (No Installation Required)

```bash
# Start with default settings (recommended)
npx chromadb-admin

# With custom port
npx chromadb-admin --port 5000

# With custom ChromaDB URL
npx chromadb-admin --chromadb-url http://your-chromadb:8000

# With both custom port and URL
npx chromadb-admin --port 5000 --chromadb-url http://your-chromadb:8000
```

#### Option B: Global Installation

```bash
# Install globally
npm install -g chromadb-admin

# Then run from anywhere
chromadb-admin

# With options
chromadb-admin --port 5000 --chromadb-url http://your-chromadb:8000
```

#### Option C: Project Installation

```bash
# Add to your project
npm install chromadb-admin

# Run using npx
npx chromadb-admin

# Or add to package.json scripts
# "scripts": { "admin": "chromadb-admin" }
# Then run: npm run admin
```

### 🐍 Method 2: Python Package (Recommended for Python projects)

```bash
# Install from PyPI
pip install chromadb-admin
```

**Usage:**
```python
# In your Python code
from chromadb_admin import start_server

start_server(
    chromadb_url="http://localhost:8000",
    port=3434
)
```

**Or via CLI:**
```bash
# Start from command line
chromadb-admin --chromadb-url http://localhost:8000
```

### 🐳 Method 3: Docker (Recommended for production)

```bash
# Pull the image
docker pull neetpalsingh/chromadb-admin:latest

# Run the container
docker run -d \
  -p 3434:3434 \
  -e CHROMADB_URL=http://your-chromadb:8000 \
  --name chromadb-admin \
  neetpalsingh/chromadb-admin:latest
```

**Or use docker-compose:**

```yaml
version: '3.8'
services:
  chromadb-admin:
    image: neetpalsingh/chromadb-admin:latest
    ports:
      - "3434:3434"
    environment:
      - CHROMADB_URL=http://chromadb:8000
```

```bash
docker-compose up -d
```

### 💻 Method 4: From Source (For development)

```bash
# Clone the repository
git clone https://github.com/neetpalsingh/ChromaDB-Admin-managment.git
cd ChromaDB-Admin-managment/api-ui

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your ChromaDB URL

# Start development server
npm run dev

# Or build and run production
npm run build:vite
npm run serve:production
```

## 🎯 Quick Start

1. **Start ChromaDB** (if you don't have one running):
   ```bash
   docker run -p 8000:8000 chromadb/chroma
   ```

2. **Start CAMS** (choose one method):
   ```bash
   # NPM
   npx chromadb-admin

   # Python
   chromadb-admin

   # Docker
   docker run -p 3434:3434 -e CHROMADB_URL=http://localhost:8000 neetpalsingh/chromadb-admin
   ```

3. **Open your browser**: http://localhost:3434

4. **Start managing** your ChromaDB instance! 🎉

## ⚙️ CLI Options

Both NPM and Python packages support the following command-line options:

### Commands

```bash
chromadb-admin [command] [options]
```

| Command | Description |
|---------|-------------|
| `start` | Start the production server (default) |
| `dev` | Start development server (NPM only) |
| `build` | Build for production (NPM only) |
| `help` | Show help message |
| `version` | Show version information |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | Port to run on | `3434` |
| `--host <address>` | Host address | `0.0.0.0` |
| `--chromadb-url <url>` | ChromaDB server URL | `http://localhost:8000` |

### Examples

```bash
# Start with default settings
npx chromadb-admin

# Custom port
npx chromadb-admin --port 5000

# Custom ChromaDB URL
npx chromadb-admin --chromadb-url https://my-chromadb.example.com

# Custom port and ChromaDB URL
npx chromadb-admin --port 5000 --chromadb-url http://localhost:8000

# Custom host (for Docker/remote access)
npx chromadb-admin --host 0.0.0.0 --port 3434

# Python version - same options work
chromadb-admin --port 5000 --chromadb-url http://localhost:8000

# Show help
npx chromadb-admin help

# Show version
npx chromadb-admin version
```

## Environment Configuration

All URLs and configuration are managed through environment variables - **no hardcoded URLs**!

**Required variables:**
- `VITE_CHROMADB_URL` - ChromaDB server URL (frontend)
- `CHROMADB_URL` - ChromaDB server URL (backend proxy)

**Optional variables:**
- `VITE_APP_URL` - Dashboard URL
- `PORT` - Server port (default: 3434)
- `CORS_ORIGINS` - Allowed CORS origins

See [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) for complete documentation.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build:vite` | Build for production using Vite |
| `npm run preview` | Preview production build |
| `npm run serve:production` | Run production server |
| `npm run build:serve` | Build and serve production |
| `npm run lint` | Run ESLint |

## Project Structure

```
api-ui/
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.tsx
│   │   ├── DatabaseManagement.tsx
│   │   ├── DataOperations.tsx
│   │   ├── TenantManagement.tsx
│   │   └── ...
│   ├── services/         # API services
│   │   ├── apiService.ts
│   │   └── tenantService.ts
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript types
│   └── App.tsx           # Main app component
├── server/               # Production server
│   └── productionServer.js
├── scripts/              # Deployment scripts
├── .env.example          # Environment template
└── ENV_CONFIGURATION.md  # Configuration guide
```

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI, Heroicons
- **HTTP Client:** Axios
- **API Documentation:** Swagger UI
- **Server:** Express.js (production)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the project!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ChromaDB](https://www.trychroma.com/) - The amazing vector database
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- All our [contributors](https://github.com/YOUR_USERNAME/chromadb-admin/graphs/contributors)

## 📞 Support

- 📖 [Documentation](https://github.com/YOUR_USERNAME/chromadb-admin#readme)
- 🐛 [Issue Tracker](https://github.com/YOUR_USERNAME/chromadb-admin/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/chromadb-admin/discussions)

## 🗺️ Roadmap

- [ ] Advanced query builder
- [ ] Batch operations
- [ ] Export/Import functionality
- [ ] User authentication
- [ ] Role-based access control
- [ ] Collection versioning
- [ ] Performance analytics
- [ ] API rate limiting

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/chromadb-admin?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/chromadb-admin?style=social)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/chromadb-admin)
![GitHub pull requests](https://img.shields.io/github/issues-pr/YOUR_USERNAME/chromadb-admin)

---

<div align="center">

**Made with ❤️ for the ChromaDB community**

If you find this project useful, please consider giving it a ⭐!

[Report Bug](https://github.com/YOUR_USERNAME/chromadb-admin/issues) • [Request Feature](https://github.com/YOUR_USERNAME/chromadb-admin/issues) • [Star Project](https://github.com/YOUR_USERNAME/chromadb-admin)

</div>
