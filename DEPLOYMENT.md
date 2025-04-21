# Deploying the Visualizer to GitHub Pages

This document provides instructions for deploying the convolution and cross-correlation visualizer to GitHub Pages.

## Initial Setup

1. Create a `gh-pages` branch in your repository:

```bash
# Clone the repository if you haven't already
git clone https://github.com/npcarter2025/TileAlgorithms.git
cd TileAlgorithms

# Create and switch to the gh-pages branch
git checkout -b gh-pages

# Remove all files except the visualizer files (if starting from main)
# This depends on your current structure, but you might do something like:
git rm -rf --ignore-unmatch coding_practice/
git rm -rf --ignore-unmatch cross_correlation/
git rm -rf --ignore-unmatch 1d_convolution/
git rm -rf --ignore-unmatch 2d_convolution/
git rm -rf --ignore-unmatch 3d_convolution/
git rm -rf --ignore-unmatch templates/
git rm -rf --ignore-unmatch bin/
# Keep the index.html, css/, js/ directories
```

2. Ensure you have all the necessary visualizer files:
   - `index.html`
   - `css/style.css`
   - `js/visualizer.js`

3. Add a `.nojekyll` file to tell GitHub not to use Jekyll:

```bash
touch .nojekyll
git add .nojekyll
```

## Deploying Changes

1. Commit your changes:

```bash
git add .
git commit -m "Update visualizer"
```

2. Push to the `gh-pages` branch:

```bash
git push origin gh-pages
```

3. GitHub will automatically deploy your changes. Your visualizer will be available at:
   `https://npcarter2025.github.io/TileAlgorithms/`

## Testing Locally

Before pushing, you can test the visualizer locally:

1. Navigate to your project directory:

```bash
cd TileAlgorithms
```

2. Start a local server (choose one of these methods):

Using Python:
```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Using Node.js (if you have it installed):
```bash
# Install http-server if you don't have it
npm install -g http-server

# Run the server
http-server
```

3. Open your browser and navigate to:
   `http://localhost:8000` or whatever port your server is using

## Troubleshooting

- If your page isn't updating, try clearing your browser cache
- Check the GitHub repository settings to make sure GitHub Pages is set to use the `gh-pages` branch
- Verify that all paths in your HTML, CSS, and JavaScript files are correct (relative paths)
- Make sure all files are properly committed and pushed to the `gh-pages` branch

## Adding Features

When adding new features to the visualizer:

1. Create a feature branch from `gh-pages`:
```bash
git checkout gh-pages
git checkout -b feature/new-visualization-feature
```

2. Implement and test your feature

3. Merge back to `gh-pages` when ready:
```bash
git checkout gh-pages
git merge feature/new-visualization-feature
git push origin gh-pages
``` 