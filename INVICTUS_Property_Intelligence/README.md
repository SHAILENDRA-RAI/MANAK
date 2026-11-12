# INVICTUS Property Intelligence — Prototype

Competition prototype for Hero Housing Fintech Challenge PS-01.

## Scope
- Jaipur, Rajasthan
- Residential apartments only
- Browser-local demo workspace
- Transparent illustrative heuristic estimate; **not a trained ML model**
- No live transaction, DLC, GIS, satellite, geocoding or lender integrations

## Run locally
Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open the local Vite URL printed in the terminal.

## Build
```bash
npm run typecheck
npm run build
npm run preview
```

## Deploy to GitHub Pages
1. Create a public GitHub repository, e.g. `invictus-property-intelligence`.
2. Upload/push the contents of this folder to the repository root.
3. In repository Settings → Pages → Build and deployment, select **GitHub Actions**.
4. Ensure the workflow `.github/workflows/deploy.yml` is present.
5. Push to `main`; the workflow builds and deploys the static app.
6. The live URL will be `https://<your-github-username>.github.io/<repository-name>/`.

If your repository name differs from `invictus-property-intelligence`, update `base` in `vite.config.ts` to `'/<repository-name>/'` or set the workflow build environment accordingly.

## Demo features
- Overview dashboard
- New valuation form with live heuristic estimate preview
- Save cases in browser localStorage
- Valuation history and detail inspection
- Geo intelligence mockup
- Data source registry
- Model performance / validation readiness
- Audit and settings placeholders
- Responsive desktop/mobile layout

## Important
The locality rates and adjustments in `src/App.tsx` are illustrative UI-demo constants, not observed market rates. Do not use them for lending, property purchase, or claims about Jaipur market value. Replace them only after obtaining a permitted dataset and performing reproducible validation. Synthetic/demo cases must never be used for model training or performance claims.

## Backend
`backend/` contains a FastAPI starter with safe scope validation and a demo-only valuation endpoint. The static GitHub Pages app does not call it. Deploy backend separately if required; GitHub Pages cannot host Python services.
