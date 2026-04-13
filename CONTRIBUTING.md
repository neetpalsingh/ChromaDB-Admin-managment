# Contributing to ChromaDB Admin Management System (CAMS)

Thank you for your interest in contributing to CAMS! This document provides guidelines and instructions for contributing.

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search the [issue tracker](https://github.com/YOUR_USERNAME/chromadb-admin/issues) first
2. **Create a detailed report** - Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Node.js version, Browser, etc.)
   - Screenshots if applicable

### Suggesting Features

1. **Open an issue** with the `enhancement` label
2. **Describe the feature** clearly
3. **Explain the use case** and why it would be valuable
4. **Provide examples** if possible

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages** (`git commit -m 'Add amazing feature'`)
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Python >= 3.8 (for Python package)
- Docker (optional, for testing)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/chromadb-admin.git
cd chromadb-admin

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Project Structure

```
chromadb-admin/
├── src/                    # React source code
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   └── types/             # TypeScript types
├── server/                # Production server
├── python-package/        # Python package
│   └── src/
│       └── chromadb_admin/
├── bin/                   # CLI scripts
└── public/                # Static assets
```

## 📝 Coding Guidelines

### TypeScript/JavaScript

- Use TypeScript for new code
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Write type-safe code

### Python

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions focused and small

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Handle errors gracefully

### Git Commits

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, etc.)
- Keep first line under 50 characters
- Add detailed description if needed

**Examples:**
```
✅ Good: "Add dark mode toggle to dashboard"
✅ Good: "Fix CORS issue in production server"
❌ Bad: "updates"
❌ Bad: "fix bug"
```

## 🧪 Testing

### Running Tests

```bash
# Run frontend tests
npm test

# Run Python tests
cd python-package
pytest
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Ensure all tests pass before submitting PR

## 📚 Documentation

- Update README.md if needed
- Add JSDoc/docstrings for new functions
- Update .env.example if adding new variables
- Keep documentation clear and concise

## 🏗️ Building

### NPM Package

```bash
npm run build:vite
```

### Python Package

```bash
cd python-package
python -m build
```

### Docker Image

```bash
docker build -t chromadb-admin:latest .
```

## 🔍 Code Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** and merge

## 📋 Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No hardcoded credentials or secrets
- [ ] Environment variables are used for configuration
- [ ] Code is properly commented

## 🤝 Community

- Be respectful and inclusive
- Help others when possible
- Provide constructive feedback
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Questions?

- Open an issue for questions
- Tag with `question` label
- Check existing issues first

## 🎉 Recognition

Contributors will be:
- Listed in the repository
- Mentioned in release notes
- Part of the community

Thank you for contributing to ChromaDB Admin Management System! 🚀
