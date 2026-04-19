# Publishing Guide for CAMS

This guide explains how to publish ChromaDB Admin Management System (CAMS) to NPM, PyPI, and Docker Hub.

## 📋 Prerequisites

### NPM Publishing
- NPM account (https://www.npmjs.com/signup)
- NPM authentication token or logged in via `npm login`

### PyPI Publishing
- PyPI account (https://pypi.org/account/register/)
- PyPI API token

### Docker Hub Publishing
- Docker Hub account (https://hub.docker.com/signup)
- Docker installed locally

---

## 📦 1. Publishing to NPM

### Prepare Package

1. **Update package.json**:
   ```json
   {
     "name": "chromadb-admin",
     "version": "1.0.0",
     "author": "Your Name <your.email@example.com>",
     "repository": {
       "type": "git",
       "url": "git+https://github.com/YOUR_USERNAME/chromadb-admin.git"
     }
   }
   ```

2. **Build the project**:
   ```bash
   npm run build:vite
   ```

3. **Test locally**:
   ```bash
   npm pack
   npm install -g chromadb-admin-1.0.0.tgz
   chromadb-admin --version
   ```

### Publish to NPM

```bash
# Login to NPM
npm login

# Publish (first time)
npm publish

# Publish updates
npm version patch  # or minor, or major
npm publish
```

### Verify Publication

```bash
# Check on NPM
open https://www.npmjs.com/package/chromadb-admin

# Install and test
npm install -g chromadb-admin
chromadb-admin
```

---

## 🐍 2. Publishing to PyPI

### Prepare Python Package

1. **Navigate to Python package directory**:
   ```bash
   cd python-package
   ```

2. **Update version in setup.py and pyproject.toml**:
   ```python
   version='1.0.0'
   ```

3. **Install build tools**:
   ```bash
   pip install build twine
   ```

4. **Build the package**:
   ```bash
   python -m build
   ```

   This creates files in `dist/`:
   - `chromadb_admin-1.0.0-py3-none-any.whl`
   - `chromadb_admin-1.0.0.tar.gz`

### Test Locally

```bash
# Install locally
pip install dist/chromadb_admin-1.0.0-py3-none-any.whl

# Test
chromadb-admin --version
```

### Publish to TestPyPI (Recommended first)

```bash
# Upload to TestPyPI
twine upload --repository testpypi dist/*

# Test installation from TestPyPI
pip install --index-url https://test.pypi.org/simple/ chromadb-admin
```

### Publish to PyPI

```bash
# Upload to PyPI
twine upload dist/*

# Verify
pip install chromadb-admin
chromadb-admin
```

### Setup PyPI API Token

1. Go to https://pypi.org/manage/account/token/
2. Create a new API token
3. Save it to `~/.pypirc`:
   ```ini
   [pypi]
   username = __token__
   password = pypi-xxxxxxxxxxxxxxxxxxxxx
   ```

---

## 🐳 3. Publishing to Docker Hub

### Build Docker Image

```bash
# Build for current platform
docker build -t YOUR_USERNAME/chromadb-admin:1.0.0 .
docker build -t YOUR_USERNAME/chromadb-admin:latest .

# Build for multiple platforms
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t YOUR_USERNAME/chromadb-admin:1.0.0 \
  -t YOUR_USERNAME/chromadb-admin:latest \
  --push .
```

### Test Docker Image

```bash
# Run locally
docker run -p 3434:3434 \
  -e CHROMADB_URL=http://localhost:8000 \
  YOUR_USERNAME/chromadb-admin:latest

# Test
open http://localhost:3434
```

### Publish to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push images
docker push YOUR_USERNAME/chromadb-admin:1.0.0
docker push YOUR_USERNAME/chromadb-admin:latest
```

### Verify Publication

```bash
# Check on Docker Hub
open https://hub.docker.com/r/YOUR_USERNAME/chromadb-admin

# Pull and test
docker pull YOUR_USERNAME/chromadb-admin:latest
docker run -p 3434:3434 YOUR_USERNAME/chromadb-admin:latest
```

---

## 🔄 4. Complete Release Process

### 1. Prepare Release

```bash
# Update version in all files:
# - package.json
# - python-package/setup.py
# - python-package/pyproject.toml
# - python-package/src/chromadb_admin/__init__.py

# Update CHANGELOG.md
# Update README.md if needed
```

### 2. Build Everything

```bash
# NPM package
npm run build:vite

# Python package
cd python-package
python -m build
cd ..

# Docker image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t YOUR_USERNAME/chromadb-admin:1.0.0 \
  -t YOUR_USERNAME/chromadb-admin:latest .
```

### 3. Test Everything

```bash
# Test NPM
npm pack && npm install -g chromadb-admin-1.0.0.tgz

# Test Python
pip install python-package/dist/*.whl

# Test Docker
docker run -p 3434:3434 YOUR_USERNAME/chromadb-admin:1.0.0
```

### 4. Publish

```bash
# NPM
npm publish

# PyPI
cd python-package
twine upload dist/*
cd ..

# Docker Hub
docker push YOUR_USERNAME/chromadb-admin:1.0.0
docker push YOUR_USERNAME/chromadb-admin:latest
```

### 5. Create GitHub Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Create release on GitHub
# Go to: https://github.com/YOUR_USERNAME/chromadb-admin/releases/new
# - Tag: v1.0.0
# - Title: v1.0.0 - Initial Release
# - Description: Release notes from CHANGELOG.md
```

---

## 📝 Version Management

Follow Semantic Versioning (semver):

- **Major (1.0.0)**: Breaking changes
- **Minor (1.1.0)**: New features, backwards compatible
- **Patch (1.0.1)**: Bug fixes

```bash
# NPM
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

---

## 🔍 Verification Checklist

Before publishing:

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated everywhere
- [ ] Built and tested locally
- [ ] No secrets in code
- [ ] LICENSE file present
- [ ] README.md comprehensive

---

## 🎉 Post-Release

1. **Announce on social media**
2. **Update project website**
3. **Notify users**
4. **Monitor for issues**

---

## 📞 Support

Need help publishing? Open an issue:
https://github.com/YOUR_USERNAME/chromadb-admin/issues
