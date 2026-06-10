# GitHub Repository Setup with Backdated Commits

This guide explains how to push the `api-ui` project to GitHub with 50+ backdated commits spread across March-June 2026, with more commits on weekends.

## Prerequisites

- Git installed on your system
- A GitHub account
- PowerShell (Windows) or ability to run PowerShell scripts

## What the Script Does

The `setup-github-repo.ps1` script will:

1. ✅ Initialize a new Git repository in the `api-ui` folder
2. ✅ Create **50 commits** with backdated timestamps
3. ✅ Distribute commits across **March, April, May, and June 2026**
4. ✅ Focus more commits on **weekends** (Saturdays and Sundays) 
5. ✅ Organize commits logically by feature/component
6. ✅ Help you create and push to a GitHub repository

## Commit Distribution

- **Total commits:** 50
- **Months:** March (23 commits), April (16 commits), May (9 commits), June (2 commits)
- **Weekend commits:** ~70% of commits are on Saturdays and Sundays
- **Date range:** March 1, 2026 - June 15, 2026

## How to Use

### Step 1: Run the Script

Open PowerShell in the `api-ui` directory and run:

```powershell
.\setup-github-repo.ps1
```

Or specify your GitHub username directly:

```powershell
.\setup-github-repo.ps1 -GithubUsername "your-github-username"
```

### Step 2: Monitor the Process

The script will:
- Show progress for each commit being created
- Display which files are being added
- Show any warnings for missing files

### Step 3: Create GitHub Repository

When prompted, follow these steps:

1. Go to https://github.com/new
2. Create a new repository named `api-ui` (or your preferred name)
3. Make sure to set it as **PUBLIC** (required for contribution graph)
4. **DO NOT** initialize with README, .gitignore, or license
5. Press Enter in the PowerShell window to continue

### Step 4: Push to GitHub

The script will:
- Add the GitHub remote
- Rename the branch to `main`
- Push all commits to GitHub

You may be prompted for authentication:
- **Using HTTPS:** You'll need a Personal Access Token (PAT)
- **Using SSH:** Make sure your SSH key is configured

## Creating a GitHub Personal Access Token (PAT)

If you're using HTTPS and don't have a token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "api-ui-repo")
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when pushing

## Verifying Your Contributions

After pushing, check your contribution graph:

1. Go to your GitHub profile: `https://github.com/your-username`
2. Scroll down to the contribution graph
3. You should see green squares for the dates in March-June 2026

**Note:** Make sure the repository is **public** for contributions to show on your profile!

## Troubleshooting

### Script Execution Policy Error

If you get an error about script execution:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### File Not Found Warnings

Some files might not exist. The script will skip them automatically.

### Authentication Failed

- Make sure you're using the correct GitHub username
- Use a Personal Access Token instead of password
- Or configure SSH keys for GitHub

### Commits Not Showing on Profile

- Verify the repository is **public**
- Check that the email in commits matches your GitHub email:
  ```powershell
  git config user.email "your-email@example.com"
  ```
- GitHub may take a few minutes to update the contribution graph

## Manual Push (Alternative)

If you prefer to push manually later:

```bash
# Add your GitHub remote
git remote add origin https://github.com/your-username/api-ui.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Commit Structure

The commits are organized by:
- Project setup and configuration
- Component development
- Service layer implementation
- Documentation
- Deployment scripts
- Refinements and updates

Each commit represents a logical unit of work with relevant files grouped together.

## Notes

- The script removes any existing `.git` folder before starting
- All commit dates are set to 2026 (March-June)
- Weekend dates are prioritized for more commits
- The main GitLab repository in the parent folder is NOT affected

## Support

If you encounter any issues:
1. Check the error message carefully
2. Verify Git is installed: `git --version`
3. Ensure you have internet connection for pushing
4. Make sure your GitHub credentials are correct

Happy coding! 🚀
