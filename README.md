# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

## Frontend Docker image & compose

This project includes a multi-stage `Dockerfile` and a `docker-compose.yml` to build and serve the production frontend with nginx.

- The Docker image builds the app (TypeScript + Vite) then copies `dist` into an nginx image.
- Environment variables used by Vite must begin with `VITE_` (example: `VITE_API_BASE_URL`). Set them at build time using `--build-arg`.

### Build & run (recommended: `docker compose`)

Use the repo-level `docker-compose.yml` (this file will be picked automatically when running the command in the project root). To be explicit, pass `-f`.

bash / WSL:
```bash
docker compose -f docker-compose.yml up --build -d
# open http://localhost:3000
```

# Web — React + TypeScript + Vite

Minimal React + TypeScript application scaffolded with Vite.

Quick summary:
- Run the app in development with Vite.
- Build a production bundle with `npm run build`.
- A multi-stage `Dockerfile` and `docker-compose.yml` are included to build and serve the production bundle via nginx.

## Quick start (development)

Install dependencies and run the dev server:

```bash
npm ci
npm run dev
# open http://localhost:5173 (Vite default)
```

## Production build (local)

```bash
npm run build
# serves static files from `dist`
```

## Docker / docker-compose (production)

This repo includes a multi-stage `Dockerfile` and a `docker-compose.yml` to produce an nginx-served production image.

Build & run using `docker compose` (recommended):

```bash
docker compose -f docker-compose.yml up --build -d
# open http://localhost:3000
```

Or build and run manually (set Vite build-time envs with `VITE_`):

```bash
docker build --build-arg VITE_API_BASE_URL=http://api-local-service-helper:4000 -t web-frontend:latest .
docker run -d -p 3000:80 --name web-frontend web-frontend:latest
# open http://localhost:3000
```

Notes:
- Vite environment variables must start with `VITE_` (for example `VITE_API_BASE_URL`). Pass them at build time with `--build-arg`.
- If the backend runs on the host and you need to reach it from the container on Windows, use `http://host.docker.internal:<port>`.

## Rancher Desktop (UI)

Deploy using the CLI (`docker compose up`) or import the `docker-compose.yml` into Rancher Desktop. The container will appear in the Containers view where you can inspect status, ports and logs.

## Troubleshooting

- If the image build fails with `tsc: not found`, ensure `typescript` is in `devDependencies`. The Dockerfile installs `git` and runs `npm ci` (including devDeps) during the build stage so TypeScript and build tools are available.
- If the frontend cannot reach the API, double-check the `VITE_API_BASE_URL` used at build time and network accessibility.

---

If you want additional README sections (contributing, tests, linting), tell me what to include and I will add them.
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
