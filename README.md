# Russia Maps React Demo

Interactive demo with **exactly 4 map implementations** of Russia regions, each using a different rendering stack and visual style:

1. **SVG map** (`src/maps/SvgMap.tsx`) - manual GeoJSON-to-path rendering.
2. **MapLibre GL map** (`src/maps/MapboxMap.tsx`) - dark style, feature-state hover, popup.
3. **Deck.gl map** (`src/maps/DeckMap.tsx`) - GPU-rendered `GeoJsonLayer`, dynamic gradients, elevation.
4. **Globe.gl map** (`src/maps/GlobeMap.tsx`) - 3D globe with atmosphere and hover-driven extrusion.

All maps use one shared GeoJSON source: `src/data/russia-regions.geojson`.

## Tech Stack

- React
- Vite
- TypeScript
- MapLibre GL JS
- Deck.gl
- Globe.gl / Three.js
- D3 (projection + color scales)

## Project Structure

```txt
src/
  components/
    Tooltip.tsx
  data/
    regions.ts
    russia-regions.geojson
  maps/
    SvgMap.tsx
    MapboxMap.tsx
    DeckMap.tsx
    GlobeMap.tsx
  types/
    regions.ts
  App.tsx
```

## Installation

```bash
npm install
```

## Run in Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## API Keys

No API keys are required.

- `MapboxMap.tsx` uses **MapLibre GL with local style + GeoJSON source** (no Mapbox token).
- Globe textures are loaded from public URLs hosted by `unpkg`.

## Notes on Data

- The regions GeoJSON is mock/demo-friendly but structured as oblast-like polygons with per-region statistics:
  - `region`
  - `population`
  - `gdp`
- You can replace `src/data/russia-regions.geojson` with a higher-fidelity administrative dataset without changing map component architecture.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
