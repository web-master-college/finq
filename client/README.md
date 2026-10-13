# Client

Vue 3 application for Action Item — User Profiles. Home checks the backend. Fetch loads 10 Random User profiles. History loads saved profiles from `/api/profiles`. Profile rows link to a placeholder at `/profile/:id`.

## Prerequisites

- Node.js 22 LTS or newer
- npm 11
- Dependencies installed from the repository root with `npm install`

## Run

From the repository root:

```bash
npm run dev
```

The client listens on http://localhost:5173. Requests to `/api` are proxied to http://localhost:3000, so the API does not need CORS during development.

To start only the client:

```bash
npm run dev -w client
```

The connectivity check stays unavailable until the server is running.

## Checks

```bash
npm run typecheck -w client
npm run build -w client
```
