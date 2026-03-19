# Lineage

A map of photographic influence.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for production

```bash
npm run build
```

This creates a `dist/` folder ready to deploy to Vercel, Netlify, or any static host.

## Deploy to Vercel

1. Go to vercel.com and sign up
2. Drag the `dist/` folder onto the dashboard, or connect your GitHub repo
3. Done — you'll get a live URL in about 60 seconds

## Project structure

```
lineage/
├── index.html          ← entry point
├── vite.config.js      ← build config
├── package.json        ← dependencies
└── src/
    ├── main.jsx        ← mounts the app
    └── App.jsx         ← Lineage (the whole app)
```
