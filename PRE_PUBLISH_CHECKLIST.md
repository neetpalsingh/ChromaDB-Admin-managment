# Pre-Publish Checklist for CAMS

Complete this checklist before publishing your project to ensure everything is ready.

## ✅ 1. Update Personal Information

Replace all placeholders with your actual information:

### Files to Update:

- [ ] **package.json**
  - `"author": "Your Name <your.email@example.com>"`
  - `"url": "git+https://github.com/YOUR_USERNAME/chromadb-admin.git"`

- [ ] **python-package/setup.py**
  - `author='Your Name'`
  - `author_email='your.email@example.com'`
  - `url='https://github.com/YOUR_USERNAME/chromadb-admin'`

- [ ] **python-package/pyproject.toml**
  - `name = "Your Name", email = "your.email@example.com"`
  - All GitHub URLs

- [ ] **LICENSE**
  - `Copyright (c) 2026 [Your Name]`

- [ ] **README.md**
  - All instances of `YOUR_USERNAME`
  - Badge URLs
  - Links to repository

- [ ] **CONTRIBUTING.md**
  - All GitHub URLs with YOUR_USERNAME

- [ ] **bin/chromadb-admin.js**
  - GitHub URLs in help text

- [ ] **Dockerfile**
  - `LABEL maintainer="Your Name <your.email@example.com>"`

---

## ✅ 2. Environment Configuration

- [ ] **Create .env file**
  ```bash
  cp .env.example .env
  ```

- [ ] **Configure .env with your ChromaDB URL**
  ```env
  VITE_CHROMADB_URL=http://localhost:8000
  CHROMADB_URL=http://localhost:8000
  ```

- [ ] **Test environment variables work**
  ```bash
  npm run dev
  # Check that it connects to your ChromaDB
  ```

---

## ✅ 3. Build & Test

### NPM Package

- [ ] **Install dependencies**
  ```bash
  npm install
  ```

- [ ] **Build the application**
  ```bash
  npm run build:vite
  ```

- [ ] **Test production server**
  ```bash
  npm run serve:production
  # Open http://localhost:3002
  ```

- [ ] **Make bin script executable**
  ```bash
  chmod +x bin/chromadb-admin.js
  ```

- [ ] **Test CLI locally**
  ```bash
  npm pack
  npm install -g chromadb-admin-1.0.0.tgz
  chromadb-admin --version
  chromadb-admin
  ```

### Python Package

- [ ] **Navigate to python-package**
  ```bash
  cd python-package
  ```

- [ ] **Install build tools**
  ```bash
  pip install build twine
  ```

- [ ] **Build Python package**
  ```bash
  python -m build
  ```

- [ ] **Test installation**
  ```bash
  pip install dist/*.whl
  chromadb-admin --version
  ```

### Docker Image

- [ ] **Build Docker image**
  ```bash
  docker build -t chromadb-admin:test .
  ```

- [ ] **Test Docker image**
  ```bash
  docker run -p 3002:3002 -e CHROMADB_URL=http://localhost:8000 chromadb-admin:test
  # Open http://localhost:3002
  ```

---

## ✅ 4. Documentation Review

- [ ] **README.md is comprehensive**
  - Installation instructions
  - Usage examples
  - Features list
  - Screenshots/demo

- [ ] **CONTRIBUTING.md is clear**
  - How to contribute
  - Code style guidelines
  - Development setup

- [ ] **LICENSE file exists**
  - MIT License with your name

- [ ] **ENV_CONFIGURATION.md is accurate**
  - All environment variables documented
  - Examples provided

- [ ] **.env.example has all variables**
  - Well commented
  - Default values provided

---

## ✅ 5. Code Quality

- [ ] **No hardcoded URLs in code**
  - All URLs from environment variables
  - Search for any remaining hardcoded values

- [ ] **No secrets in code**
  - Check for API keys, passwords, tokens
  - .env is in .gitignore

- [ ] **Linting passes**
  ```bash
  npm run lint
  ```

- [ ] **TypeScript compiles without errors**
  ```bash
  npm run build:vite
  ```

---

## ✅ 6. Git & GitHub

- [ ] **Create GitHub repository**
  - Go to https://github.com/new
  - Name: `chromadb-admin`
  - Description: "ChromaDB Admin Management System - Web dashboard for ChromaDB"
  - Make it PUBLIC
  - Don't initialize with README

- [ ] **Run GitHub setup script**
  ```bash
  .\setup-github-repo.ps1
  ```

- [ ] **Verify commits were created**
  - Check 50 commits exist
  - Verify dates are in March-June 2026

- [ ] **Push to GitHub**
  - Follow the script prompts
  - Authenticate with Personal Access Token

- [ ] **Verify on GitHub**
  - Repository is public
  - All files are there
  - Contribution graph shows commits

---

## ✅ 7. Package Registry Accounts

- [ ] **NPM Account**
  - Sign up at https://www.npmjs.com/signup
  - Verify email
  - Enable 2FA (recommended)

- [ ] **PyPI Account**
  - Sign up at https://pypi.org/account/register/
  - Verify email
  - Create API token at https://pypi.org/manage/account/token/

- [ ] **Docker Hub Account**
  - Sign up at https://hub.docker.com/signup
  - Verify email
  - Create access token (recommended)

---

## ✅ 8. Final Checks

- [ ] **All tests pass**
- [ ] **No TODO or FIXME in production code**
- [ ] **Version numbers are consistent**
  - package.json: 1.0.0
  - setup.py: 1.0.0
  - pyproject.toml: 1.0.0
  - __init__.py: 1.0.0

- [ ] **Screenshots/GIFs added to README** (optional but recommended)
- [ ] **CHANGELOG.md created** (optional)

---

## 🚀 Ready to Publish!

If all checkboxes are ✅, you're ready to publish!

### Publishing Order:

1. **GitHub** - Already done with setup script ✅
2. **NPM** - `npm publish`
3. **PyPI** - `twine upload dist/*`
4. **Docker Hub** - `docker push`

See [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md) for detailed instructions.

---

## 📝 Post-Publish Tasks

After successful publishing:

- [ ] **Create GitHub Release**
  - Tag: v1.0.0
  - Title: "v1.0.0 - Initial Public Release"
  - Attach built files (optional)

- [ ] **Verify packages are live**
  - NPM: https://www.npmjs.com/package/chromadb-admin
  - PyPI: https://pypi.org/project/chromadb-admin/
  - Docker: https://hub.docker.com/r/YOUR_USERNAME/chromadb-admin

- [ ] **Test installation from registries**
  ```bash
  # NPM
  npm install -g chromadb-admin
  
  # PyPI
  pip install chromadb-admin
  
  # Docker
  docker pull YOUR_USERNAME/chromadb-admin
  ```

- [ ] **Share your project!**
  - Social media
  - Reddit
  - Dev.to
  - Product Hunt

---

**Good luck with your open-source project! 🎉**
