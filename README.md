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

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/ddevv15/ChessGame.git
cd ChessGame

# Install dependencies
npm ci
```

### 2. Environment Setup (IMPORTANT)

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your actual API keys
# NEVER commit .env.local to git - it's automatically ignored
```

### 3. Get API Keys

For AI functionality, you'll need a Google Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file:
   ```
   REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 4. Run Development Server

```bash
npm start
# App runs on http://localhost:3000
```

## 🔒 Security Notes

- **NEVER** commit API keys to git
- Use `.env.local` for local development (automatically ignored by git)
- The `.env` file contains only example values
- Real API keys should only be in `.env.local` or deployment environment variables

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
