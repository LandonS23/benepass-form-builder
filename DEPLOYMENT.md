# Deployment Guide

This guide covers how to deploy the Form Builder application to GitHub Pages.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 9+
- Git
- GitHub account

## Building for Production

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Preview production build locally
npm run preview
```

The production build will be created in the `dist/` directory.

## GitHub Pages Deployment

This project is configured for GitHub Pages hosting with automatic deployment via GitHub Actions.

### Automatic Deployment (GitHub Actions)

**Setup (one-time)**:

1. Push your code to a GitHub repository
2. Go to your repository Settings → Pages
3. Under "Build and deployment", select:
   - **Source**: GitHub Actions
4. Push to `main` branch to trigger deployment

The included `.github/workflows/deploy.yml` will automatically:

- Build the project on every push to `main`
- Deploy to GitHub Pages
- Your site will be live at: `https://[username].github.io/form-builder/`

**Configuration**:

The `vite.config.ts` is already configured with:

```typescript
base: "/form-builder/"; // Matches your repository name
```

If your repository name is different, update the `base` path in `vite.config.ts`.

### Manual Deployment

```bash
# Build and deploy manually
npm run deploy
```

This uses the `gh-pages` package to deploy the `dist` folder to the `gh-pages` branch.

**First-time setup for manual deployment**:

1. Ensure you have push access to the repository
2. The `gh-pages` branch will be created automatically
3. Enable GitHub Pages in repository settings (Source: `gh-pages` branch)

### Troubleshooting

**Issue**: Site shows 404 or blank page

- **Fix**: Check that `base` in `vite.config.ts` matches your repository name
- **Fix**: Ensure GitHub Pages is enabled in repository settings
- **Fix**: Wait 2-3 minutes for deployment to complete

**Issue**: CSS/JS files not loading

- **Fix**: Verify the `base` path is correct (should match repo name)
- **Fix**: Check browser console for 404 errors

**Issue**: Workflow fails

- **Fix**: Check Actions tab for error details
- **Fix**: Ensure Node.js version in workflow matches your local version
- **Fix**: Try running `npm ci && npm run build` locally to verify build works

---

## Post-Deployment Checklist

- [ ] Test form creation, editing, reordering
- [ ] Test Save/Load/Reset functionality
- [ ] Test Import/Export JSON
- [ ] Test form rendering and validation
- [ ] Test form submission (success and failure states)
- [ ] Test conditional field visibility
- [ ] Verify localStorage persistence across page refreshes
- [ ] Test on mobile devices
- [ ] Check browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Verify all field types work correctly
- [ ] Test drag-and-drop functionality
- [ ] Check console for errors
- [ ] Verify analytics are tracking (if implemented)
- [ ] Test with screen reader for accessibility

---

For questions or issues, refer to the main [README.md](./README.md) or create an issue in the repository.
