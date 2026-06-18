# 📦 NPM Publishing Guide - v1.0.5

## ✅ What's New in v1.0.5

### 🐛 Bug Fixes
- **Fixed CLI argument parsing** - `--port`, `--host`, and `--chromadb-url` now work correctly with npx
- Arguments are no longer treated as commands

### 📚 Documentation Updates
- Added comprehensive npx usage examples in README
- Added CLI options table with all available commands and options
- Clarified installation methods (npx, global, project)

### 🔧 Technical Changes
- Improved argument parser to handle options before commands
- Better command detection logic
- Maintains backward compatibility

---

## 🚀 Publishing Steps

### 1. Verify Package Contents

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui
npm pack --dry-run
```

Expected files:
- ✅ build/ (React production build)
- ✅ server/ (Express server)
- ✅ bin/ (CLI executable)
- ✅ README.md
- ✅ LICENSE
- ✅ .env.example

### 2. Test Locally First

```powershell
# Test the CLI with arguments
node bin/chromadb-admin.js --port 5000

# Should show:
# - CHROMA ASCII banner
# - "Starting ChromaDB Admin Dashboard..."
# - "Server: http://localhost:5000"
```

### 3. Publish to NPM

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Option A: With 2FA code
npm publish --access public --otp YOUR_6_DIGIT_CODE

# Option B: With recovery code
npm publish --access public --otp YOUR_RECOVERY_CODE

# Option C: With automation token (in .npmrc)
npm publish --access public
```

### 4. Verify Published Package

After publishing:

1. **Check NPM page:**
   - Visit: https://www.npmjs.com/package/chromadb-admin
   - Verify version 1.0.5 is listed
   - Check README renders correctly

2. **Test installation:**
   ```powershell
   # Test npx (no install)
   npx chromadb-admin@1.0.5 --port 5000
   
   # Test global install
   npm install -g chromadb-admin@1.0.5
   chromadb-admin --port 5000
   ```

---

## 📝 Release Notes for NPM

Copy this for the GitHub release:

```markdown
## ChromaDB Admin v1.0.5

### 🐛 Bug Fixes
- Fixed CLI argument parsing issue where `--port`, `--host`, and `--chromadb-url` were treated as commands
- Improved command-line option handling for npx usage

### 📚 Documentation
- Added comprehensive npx usage examples
- Added CLI options reference table
- Improved installation instructions

### 🚀 Usage

**Using npx (recommended):**
```bash
npx chromadb-admin --port 5000 --chromadb-url http://localhost:8000
```

**Global installation:**
```bash
npm install -g chromadb-admin
chromadb-admin --port 5000
```

### 📦 Distribution
- NPM: https://www.npmjs.com/package/chromadb-admin
- PyPI: https://pypi.org/project/chromadb-admin/
- Docker: `docker pull neetpalsingh/chromadb-admin:latest`
```

---

## 🐳 Next: Docker Image

After NPM is published, update Docker to v1.0.5:

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Update Dockerfile version label to 1.0.5
# Then build and push:
docker build -t neetpalsingh/chromadb-admin:1.0.5 -t neetpalsingh/chromadb-admin:latest .
docker push neetpalsingh/chromadb-admin:1.0.5
docker push neetpalsingh/chromadb-admin:latest
```

---

## ✅ Checklist

- [ ] README updated with npx examples
- [ ] CLI argument parser fixed
- [ ] Version bumped to 1.0.5
- [ ] Build completed successfully
- [ ] Tested locally with `--port` option
- [ ] Published to NPM
- [ ] Verified on npmjs.com
- [ ] Update Docker (next step)
- [ ] Create GitHub release
