# ⚡ Quick Publish Guide - 5 Minutes to Production

Get your ChromaDB Admin package published to NPM, PyPI, and Docker Hub in 5 minutes!

---

## 🚀 TL;DR - Super Quick Start

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Use automated scripts
.\publish-all.ps1

# OR run individually:
.\publish-npm.ps1     # Publish to NPM
.\publish-pypi.ps1    # Publish to PyPI
.\publish-docker.ps1  # Publish to Docker Hub
```

---

## ✅ Before You Start (2 minutes)

### 1. Create Accounts (if you haven't already)

- **NPM:** https://www.npmjs.com/signup
- **PyPI:** https://pypi.org/account/register/
- **Docker Hub:** https://hub.docker.com/signup

### 2. Get API Tokens/Keys

**NPM Login:**
```bash
npm login
# Enter: username, password, email
```

**PyPI Token:**
1. Go to: https://pypi.org/manage/account/token/
2. Click "Add API token"
3. Copy the token (starts with `pypi-...`)

**Docker Hub Login:**
```bash
docker login
# Enter: username, password
```

---

## 📦 Option 1: Automated Publishing (Recommended)

### Run the Master Script

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui
.\publish-all.ps1
```

This will show you a menu:
```
1. Publish to NPM only
2. Publish to PyPI only
3. Publish to Docker Hub only
4. Publish to ALL platforms ← Choose this!
5. View publishing guides
0. Exit
```

Choose **option 4** to publish everywhere!

---

## 📦 Option 2: Manual Publishing

### Publish to NPM

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Build and publish
npm install
npm run build
npm publish --access public
```

### Publish to PyPI

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui\python-package

# Build and publish
pip install build twine
python -m build
python -m twine upload dist/*
```

### Publish to Docker Hub

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Build and push
docker build -t neetpalsingh/chromadb-admin:latest .
docker push neetpalsingh/chromadb-admin:latest
```

---

## 🎯 After Publishing

### Add Badges to README

```markdown
[![NPM Version](https://img.shields.io/npm/v/chromadb-admin.svg)](https://www.npmjs.com/package/chromadb-admin)
[![PyPI Version](https://img.shields.io/pypi/v/chromadb-admin.svg)](https://pypi.org/project/chromadb-admin/)
[![Docker Pulls](https://img.shields.io/docker/pulls/neetpalsingh/chromadb-admin.svg)](https://hub.docker.com/r/neetpalsingh/chromadb-admin)
```

### Test Your Packages

```bash
# Test NPM
npm install -g chromadb-admin
chromadb-admin --help

# Test PyPI
pip install chromadb-admin
chromadb-admin --help

# Test Docker
docker pull neetpalsingh/chromadb-admin
docker run -p 3434:3434 neetpalsingh/chromadb-admin
```

### Update GitHub

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui
git add README.md
git commit -m "Add package badges and installation instructions"
git push origin main
```

---

## 🔄 Publishing Updates

When you make changes and want to publish a new version:

### 1. Update Version Numbers

**package.json:**
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

**setup.py & pyproject.toml:**
```python
version="1.0.1"  # Update manually
```

### 2. Rebuild and Republish

```powershell
# NPM
npm run build
npm publish

# PyPI
cd python-package
python -m build
python -m twine upload dist/*

# Docker
docker build -t neetpalsingh/chromadb-admin:1.0.1 .
docker push neetpalsingh/chromadb-admin:1.0.1
docker tag neetpalsingh/chromadb-admin:1.0.1 neetpalsingh/chromadb-admin:latest
docker push neetpalsingh/chromadb-admin:latest
```

---

## 🆘 Troubleshooting

### NPM: "Package name already exists"

Change package name in `package.json`:
```json
"name": "@neetpalsingh/chromadb-admin"
```

### PyPI: "File already exists"

Update version in `setup.py` and `pyproject.toml`

### Docker: "Authentication required"

```bash
docker login
# Re-enter credentials
```

### General: "Permission denied"

Make sure you're logged in:
```bash
npm whoami        # Check NPM login
docker info       # Check Docker login
```

For PyPI, check your token in `~/.pypirc`

---

## 📊 Verify Publications

After publishing, check these URLs:

- **NPM:** https://www.npmjs.com/package/chromadb-admin
- **PyPI:** https://pypi.org/project/chromadb-admin/
- **Docker:** https://hub.docker.com/r/neetpalsingh/chromadb-admin

---

## 🎉 That's It!

Your package is now available to millions of developers worldwide!

**Installation methods:**

```bash
# NPM
npm install -g chromadb-admin

# Python
pip install chromadb-admin

# Docker
docker run -p 3434:3434 neetpalsingh/chromadb-admin
```

---

## 📚 More Documentation

- **Detailed Guide:** `STEP_BY_STEP_PUBLISHING.md`
- **Full Documentation:** `PUBLISHING_GUIDE.md`
- **Pre-publish Checklist:** `PRE_PUBLISH_CHECKLIST.md`
- **Port Configuration:** `PORT_CONFIGURATION.md`

---

## 🚀 Share Your Package

After publishing, share it:

- **Twitter:** "Just published ChromaDB Admin - A comprehensive admin dashboard for ChromaDB! 🚀"
- **Reddit:** r/programming, r/Python, r/javascript
- **LinkedIn:** Professional announcement
- **Dev.to:** Write an article about your project

**Good luck! 🎊**
