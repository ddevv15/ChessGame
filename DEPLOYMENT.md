# 🚀 Deployment Guide for React Chess Game

This guide will help you deploy your React Chess Game to GitHub Pages.

## Prerequisites

1. **GitHub Repository**: Your project should be in a GitHub repository
2. **Git Setup**: Make sure your local repository is connected to GitHub
3. **Node.js**: Ensure you have Node.js installed

## Quick Deployment Steps

### 1. Update Homepage URL

First, update the `homepage` field in `package.json` with your actual GitHub username and repository name:

```json
{
  "homepage": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME"
}
```

**Example:**

```json
{
  "homepage": "https://johndoe.github.io/chessgame"
}
```

### 2. Deploy to GitHub Pages

Run the deployment command:

```bash
npm run deploy
```

This command will:

- Build your React app (`npm run build`)
- Deploy the build folder to the `gh-pages` branch
- Push the changes to GitHub

### 3. Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch and **/ (root)** folder
6. Click **Save**

### 4. Access Your Deployed App

Your app will be available at: `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME`

It may take a few minutes for the deployment to be live.

## Available Scripts

- `npm run deploy` - Builds and deploys to GitHub Pages
- `npm run predeploy` - Only builds the app (runs automatically before deploy)
- `npm run build` - Creates production build
- `npm start` - Runs development server
- `npm test` - Runs test suite

## Troubleshooting

### Common Issues

1. **404 Error**: Make sure the homepage URL in package.json matches your repository URL
2. **Build Fails**: Run `npm run build` first to check for build errors
3. **Changes Not Showing**: GitHub Pages can take a few minutes to update

### Manual Deployment Check

If automatic deployment doesn't work, you can check:

```bash
# Check if gh-pages branch exists
git branch -r

# Check deployment status
npm run deploy -- --help
```

### Re-deployment

To deploy updates:

```bash
# Make your changes, commit them
git add .
git commit -m "Update chess game"
git push origin main

# Deploy the updates
npm run deploy
```

## 🎯 Success!

Once deployed, your React Chess Game will be live and accessible to anyone with the URL. You can share it with friends, add it to your portfolio, or continue developing new features!

## Next Steps

- **Custom Domain**: You can configure a custom domain in GitHub Pages settings
- **CI/CD**: Set up GitHub Actions for automatic deployment on push
- **Analytics**: Add Google Analytics to track usage
- **Performance**: Optimize build size and loading times

Happy coding and chess playing! ♟️
