# ♟️ React Chess Game

A sleek, modern React-based chess game with polished UI, smooth animations, and complete rule support.

---

## 🚀 Demo

👉 [Play Here](https://ddevv15.github.io/ChessGame)

---

## 🎯 Features

- ♟️ Full chess rules (castling, en passant, promotion)
- ✅ Real-time legal move validation
- ⚔️ Check / Checkmate / Stalemate detection
- 📜 Move history in algebraic notation
- 📱 Responsive design (mobile & desktop)
- ♿ Accessibility with keyboard navigation and ARIA labels
- 🎞️ Smooth animations
- 🔄 Reset & game status panel

---

## 🛠️ Tech Stack

- **Frontend:** React (Create React App)
- **Styling:** CSS Modules
- **Testing:** Jest + React Testing Library
- **Deployment:** GitHub Pages (`gh-pages`)

---

## ⚙️ Setup

```bash
# Install dependencies
npm ci

# Run dev server
npm start
# App runs on http://localhost:3000
```

## 🧪 Tests

```bash
npm test         # watch mode
npm run test:ci  # CI-friendly mode (if configured)
```

## 🏗️ Production Build

```bash
npm run build
# Optimized static files in /build
```

## 🌐 Deploy to GitHub Pages

This project is deployed with the gh-pages package.

### Add homepage to package.json

```json
{
  "homepage": "https://ddevv15.github.io/ChessGame"
}
```

### Add deploy scripts

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Deploy 🚀

```bash
npm run deploy
```

This builds the app and pushes the build/ folder to the gh-pages branch.

In GitHub → Settings → Pages → Source, select gh-pages branch.

## 🧩 Routing & Paths

GitHub Pages serves apps from /ChessGame/ (repo name).

Ensure "homepage" in package.json matches your Pages URL.

Alternatively, set "homepage": "." for relative paths to avoid 404 errors.

## 🩺 Troubleshooting

- **White screen / 404 on CSS or JS** → Check "homepage" in package.json, then redeploy.
- **Assets not found (/static/...)** → Happens if "homepage" is missing/incorrect.

## 📜 License

MIT License © 2025 Dev Shah
