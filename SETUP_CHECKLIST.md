# Setup Checklist - Before GitHub Push

Complete this checklist before running the GitHub repository setup script.

## ✅ Environment Configuration (Required)

- [ ] **Step 1:** Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] **Step 2:** Edit `.env` with your actual ChromaDB URL
  ```bash
  # Open .env and update these lines:
  VITE_CHROMADB_URL=http://your-chromadb-server:8000
  CHROMADB_URL=http://your-chromadb-server:8000
  ```

- [ ] **Step 3:** Install/Update dependencies (includes dotenv)
  ```bash
  npm install
  ```

- [ ] **Step 4:** Verify no errors
  ```bash
  npm run dev
  # Check that the server starts without errors
  # Press Ctrl+C to stop
  ```

## ✅ Pre-Commit Verification

- [ ] **Check 1:** `.env` file exists and has your URLs
  ```bash
  cat .env
  # Should show your configuration, not example values
  ```

- [ ] **Check 2:** `.env` is NOT in git
  ```bash
  git status
  # .env should NOT appear in the list (it's ignored)
  ```

- [ ] **Check 3:** `.env.example` IS tracked
  ```bash
  # .env.example should be ready to commit
  ```

- [ ] **Check 4:** No hardcoded URLs in code
  ```bash
  # All URLs should come from environment variables
  # Search in your IDE: "croma-db.ascentbusiness.com"
  # Should only find it in documentation/comments
  ```

## ✅ Testing (Recommended)

- [ ] **Test 1:** Development server starts
  ```bash
  npm run dev
  # Visit http://localhost:3002
  ```

- [ ] **Test 2:** Can connect to ChromaDB
  - Open the dashboard
  - Try to connect to your ChromaDB instance
  - Verify connection is successful

- [ ] **Test 3:** Build works
  ```bash
  npm run build:vite
  # Should complete without errors
  ```

## ✅ Documentation Review

- [ ] **Read** `ENV_CONFIGURATION.md` - Understand environment variables
- [ ] **Read** `MIGRATION_GUIDE.md` - Know what changed
- [ ] **Read** `README.md` - Updated with new info
- [ ] **Read** `START_HERE.md` - Ready for GitHub push

## ✅ GitHub Preparation

- [ ] **Have** GitHub account ready
- [ ] **Have** GitHub username handy
- [ ] **Optional:** Create Personal Access Token
  - Go to: https://github.com/settings/tokens
  - Generate new token (classic)
  - Select scope: `repo`
  - Copy and save the token

- [ ] **Decide** repository name (default: `api-ui`)
- [ ] **Remember** to make it PUBLIC (for contribution graph)

## ✅ Final Checks

- [ ] `.env` file configured with YOUR URLs
- [ ] `.env` is in `.gitignore` (not committed)
- [ ] `.env.example` is ready to commit
- [ ] `dotenv` package installed
- [ ] No hardcoded URLs remain in code
- [ ] Development server works
- [ ] Build completes successfully
- [ ] Documentation reviewed

## 🚀 Ready to Push to GitHub?

If all boxes are checked above, you're ready to run:

```bash
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui
.\setup-github-repo.ps1
```

Or read `START_HERE.md` for detailed instructions.

---

## 📋 Quick Reference

### What Gets Committed to GitHub:

✅ `.env.example` (template)
✅ All source code (with env variables)
✅ Documentation files
✅ `package.json` (with dotenv)
✅ Configuration files

❌ `.env` (your actual configuration)
❌ `node_modules`
❌ Build artifacts

### Environment Variables You Need:

**Minimum required:**
```env
VITE_CHROMADB_URL=http://localhost:8000
CHROMADB_URL=http://localhost:8000
```

**Full production setup:**
```env
VITE_CHROMADB_URL=https://your-chromadb.com
CHROMADB_URL=https://your-chromadb.com
VITE_APP_URL=https://your-dashboard.com
VITE_ADMIN_URL=https://your-dashboard.com
CORS_ORIGINS=https://your-dashboard.com
NODE_ENV=production
```

---

## 🐛 Common Issues

### "Module not found: dotenv"
**Solution:** Run `npm install`

### "Cannot connect to ChromaDB"
**Solution:** Check your `.env` file has correct `VITE_CHROMADB_URL`

### ".env file not working"
**Solution:** Restart the development server after editing `.env`

### "TypeScript errors with import.meta.env"
**Solution:** The file `src/vite-env.d.ts` has been created. Restart IDE.

---

## 📞 Need Help?

- **Configuration:** See `ENV_CONFIGURATION.md`
- **Migration:** See `MIGRATION_GUIDE.md`
- **GitHub Setup:** See `START_HERE.md`
- **General Info:** See `README.md`

---

## ✨ All Set?

When all checkboxes are ✅, you're ready to create your GitHub repository with 50 backdated commits!

**Good luck! 🚀**
