# 🚀 Step-by-Step Publishing Guide

Complete guide to publish ChromaDB Admin to NPM, PyPI, and Docker Hub.

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- ✅ GitHub repository is public and pushed
- ✅ Node.js 16+ installed (`node --version`)
- ✅ Python 3.8+ installed (`python --version`)
- ✅ Docker installed (`docker --version`)
- ✅ Accounts created on:
  - NPM: https://www.npmjs.com/signup
  - PyPI: https://pypi.org/account/register/
  - Docker Hub: https://hub.docker.com/signup

---

## 1️⃣ PUBLISH TO NPM

### Step 1: Verify Package Configuration

Check `package.json` has correct information:

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui
code package.json  # or open in any editor
```

Verify these fields:
- `"name"`: Should be unique (check on npmjs.com)
- `"version"`: Start with "1.0.0"
- `"description"`: Clear description
- `"repository"`: Your GitHub URL
- `"author"`: Your name and email

### Step 2: Build the Project

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Install dependencies
npm install

# Build for production
npm run build
```

This creates the `build/` folder with compiled files.

### Step 3: Login to NPM

```bash
npm login
```

Enter:
- Username
- Password
- Email (must be verified)
- One-time password (if 2FA enabled)

Verify login:
```bash
npm whoami
```

### Step 4: Test Package Locally (Optional)

```bash
# Create a tarball to see what will be published
npm pack

# This creates chromadb-admin-1.0.0.tgz
# Check the contents
tar -tzf chromadb-admin-1.0.0.tgz
```

### Step 5: Publish to NPM

```bash
# Dry run (see what would be published)
npm publish --dry-run

# Publish for real!
npm publish
```

If name is taken, you can use scoped package:
```bash
npm publish --access public
```

### Step 6: Verify NPM Package

Visit: https://www.npmjs.com/package/chromadb-admin

Test installation:
```bash
# In a different folder
npm install -g chromadb-admin
chromadb-admin --help
```

---

## 2️⃣ PUBLISH TO PYPI

### Step 1: Install Build Tools

```bash
pip install --upgrade build twine
```

### Step 2: Prepare Python Package

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui\python-package

# Check setup.py is correct
cat setup.py
```

Verify:
- Package name is unique
- Version is correct (e.g., "1.0.0")
- All dependencies listed
- GitHub URL is correct

### Step 3: Build Python Package

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui\python-package

# Clean previous builds
rm -rf dist/ build/ *.egg-info

# Build the package
python -m build
```

This creates:
- `dist/chromadb_admin-1.0.0-py3-none-any.whl`
- `dist/chromadb-admin-1.0.0.tar.gz`

### Step 4: Create PyPI API Token

1. Go to: https://pypi.org/manage/account/
2. Scroll to "API tokens"
3. Click "Add API token"
4. Name: "chromadb-admin"
5. Scope: "Entire account" (or specific project)
6. Copy the token (starts with `pypi-...`)
7. **Save it safely!** You won't see it again.

### Step 5: Configure Credentials

Create `~/.pypirc` file:

```bash
# Windows
notepad %USERPROFILE%\.pypirc

# Add this content:
[pypi]
username = __token__
password = pypi-YOUR_TOKEN_HERE
```

Or use environment variable:
```bash
$env:TWINE_USERNAME = "__token__"
$env:TWINE_PASSWORD = "pypi-YOUR_TOKEN_HERE"
```

### Step 6: Upload to PyPI

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui\python-package

# Test upload to TestPyPI first (optional)
python -m twine upload --repository testpypi dist/*

# Upload to real PyPI
python -m twine upload dist/*
```

### Step 7: Verify PyPI Package

Visit: https://pypi.org/project/chromadb-admin/

Test installation:
```bash
# In a new environment
pip install chromadb-admin
chromadb-admin --help
```

---

## 3️⃣ PUBLISH TO DOCKER HUB

### Step 1: Login to Docker Hub

```bash
docker login

# Enter:
# Username: neetpalsingh (or your Docker Hub username)
# Password: your-password-or-token
```

Create access token (recommended):
1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: "chromadb-admin"
4. Copy token
5. Use token as password in `docker login`

### Step 2: Build Docker Image

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Build for your platform
docker build -t neetpalsingh/chromadb-admin:latest .

# Build for multiple platforms (recommended)
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t neetpalsingh/chromadb-admin:latest \
  -t neetpalsingh/chromadb-admin:1.0.0 \
  --push .
```

If buildx doesn't work, use simple build:
```bash
docker build -t neetpalsingh/chromadb-admin:latest .
docker build -t neetpalsingh/chromadb-admin:1.0.0 .
```

### Step 3: Tag Image (if not done in build)

```bash
# Latest tag
docker tag chromadb-admin:latest neetpalsingh/chromadb-admin:latest

# Version tag
docker tag chromadb-admin:latest neetpalsingh/chromadb-admin:1.0.0
```

### Step 4: Push to Docker Hub

```bash
# Push latest
docker push neetpalsingh/chromadb-admin:latest

# Push version
docker push neetpalsingh/chromadb-admin:1.0.0
```

### Step 5: Verify Docker Image

Visit: https://hub.docker.com/r/neetpalsingh/chromadb-admin

Test the image:
```bash
# Pull and run
docker pull neetpalsingh/chromadb-admin:latest
docker run -p 3434:3434 neetpalsingh/chromadb-admin:latest

# Visit: http://localhost:3434
```

---

## ✅ POST-PUBLISHING CHECKLIST

After publishing all three:

### Update README Badges

Add to top of `README.md`:

```markdown
[![NPM Version](https://img.shields.io/npm/v/chromadb-admin.svg)](https://www.npmjs.com/package/chromadb-admin)
[![PyPI Version](https://img.shields.io/pypi/v/chromadb-admin.svg)](https://pypi.org/project/chromadb-admin/)
[![Docker Pulls](https://img.shields.io/docker/pulls/neetpalsingh/chromadb-admin.svg)](https://hub.docker.com/r/neetpalsingh/chromadb-admin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### Update Repository

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

git add README.md
git commit -m "Add package badges and update documentation"
git push origin main
```

### Announce Your Package

- Tweet about it
- Post on Reddit (r/programming, r/Python, r/javascript)
- LinkedIn post
- Dev.to article

---

## 📝 Version Updates

When you release updates:

### NPM Update
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

### PyPI Update
```bash
# Update version in setup.py and pyproject.toml
python -m build
python -m twine upload dist/*
```

### Docker Update
```bash
docker build -t neetpalsingh/chromadb-admin:1.0.1 .
docker push neetpalsingh/chromadb-admin:1.0.1
docker tag neetpalsingh/chromadb-admin:1.0.1 neetpalsingh/chromadb-admin:latest
docker push neetpalsingh/chromadb-admin:latest
```

---

## 🎉 Success!

After completing these steps, users can install your package in three ways:

```bash
# NPM
npm install -g chromadb-admin
chromadb-admin

# Python
pip install chromadb-admin
chromadb-admin

# Docker
docker run -p 3434:3434 neetpalsingh/chromadb-admin
```

**You've created a complete open-source project!** 🚀
