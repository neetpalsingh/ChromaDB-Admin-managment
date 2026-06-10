# Quick Start Guide - GitHub Repo Setup

## 🚀 Fast Track (5 minutes)

### Step 1: Open PowerShell
```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui
```

### Step 2: Run the Setup Script
```powershell
.\setup-github-repo.ps1 -GithubUsername "YOUR_GITHUB_USERNAME"
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### Step 3: Follow the Prompts
- The script will create 50 commits automatically
- When asked, create a new GitHub repository at https://github.com/new
- Name it `api-ui` (or anything you prefer)
- **Make sure it's PUBLIC** (so contributions show on your profile)
- Don't initialize with README, .gitignore, or license
- Press Enter when ready

### Step 4: Done! ✅
- The script will push everything to GitHub
- Check your profile: `https://github.com/YOUR_USERNAME`
- You should see contributions for March-June 2026

---

## 📊 What You'll Get

- ✅ **50 commits** spread across 3.5 months
- ✅ **70% weekend commits** (realistic side-project pattern)
- ✅ **Logical progression** of features
- ✅ **Beautiful contribution graph** on your GitHub profile

---

## 🔍 Verify Before Pushing (Optional)

If you want to check the commits before pushing:

```powershell
.\verify-commits.ps1
```

This shows:
- Total commits and distribution
- Weekend vs weekday breakdown
- Monthly statistics
- Recent commit history

---

## 🔐 Authentication

You'll need to authenticate with GitHub. Two options:

### Option 1: HTTPS with Token (Recommended)
1. Create token at: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo`
4. Copy the token
5. Use it as password when pushing

### Option 2: SSH
If you have SSH keys configured, use:
```powershell
# After creating the repo, use SSH URL instead
git remote set-url origin git@github.com:YOUR_USERNAME/api-ui.git
git push -u origin main
```

---

## ⚠️ Important Notes

1. **Public Repository Required**
   - Your repo MUST be public for contributions to show on your profile
   - Private repos don't count toward the contribution graph

2. **Email Configuration**
   - The script uses `your-username@users.noreply.github.com`
   - To use your real email: Edit the script line 28

3. **Existing .git Folder**
   - The script removes any existing .git folder
   - Make sure you don't have uncommitted changes

4. **GitLab Repo**
   - The parent folder's GitLab repo is NOT affected
   - Only the `api-ui` subfolder gets its own Git repo

---

## 📁 Files Created

The setup script creates:
- `setup-github-repo.ps1` - Main setup script
- `verify-commits.ps1` - Verification tool
- `GITHUB_SETUP_INSTRUCTIONS.md` - Detailed instructions
- `COMMIT_SCHEDULE.md` - Commit distribution overview
- `QUICKSTART.md` - This file

---

## 🐛 Troubleshooting

### "Execution Policy" Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Authentication Failed"
- Use Personal Access Token, not password
- Make sure token has `repo` scope
- Or set up SSH keys

### "Commits Not Showing"
- Wait a few minutes for GitHub to update
- Verify repo is PUBLIC
- Check email matches your GitHub account

### "File Not Found" Warnings
- Some files might not exist - script will skip them
- This is normal and won't affect the process

---

## 🎯 Expected Result

After completion, your GitHub profile will show:
```
[Your Profile] → Contribution Activity

March 2026:  ▓▓▓▓▓░░▓▓▓░░░░░░░░
April 2026:  ░░░░▓▓░░░▓▓▓░░▓▓░░
May 2026:    ░▓▓░░░░░▓▓░░░░▓▓░░
June 2026:   ░░░░░░░░░░░░▓▓░░░░

Legend: ░ = no commits | ▓ = commits that day
```

---

## ❓ Need Help?

1. Read `GITHUB_SETUP_INSTRUCTIONS.md` for detailed info
2. Run `verify-commits.ps1` to check what was created
3. Check Git is installed: `git --version`
4. Verify internet connection

---

## 🎉 Success Checklist

- [ ] PowerShell script ran without errors
- [ ] 50 commits were created
- [ ] GitHub repository created (public)
- [ ] Code pushed successfully
- [ ] Contribution graph shows activity
- [ ] Repository visible on your GitHub profile

---

**Ready? Let's do this! 🚀**

```powershell
.\setup-github-repo.ps1
```
