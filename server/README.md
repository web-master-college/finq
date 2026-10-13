# Server

Express server for Action Item — User Profiles. The only route implemented so far is a health check.

## Prerequisites

- Node.js 22 LTS or newer (developed on Node.js 24.15.0)
- npm 11
- Dependencies installed from the repository root with `npm install`

`better-sqlite3` 13 is installed for later SQLite storage. It is not opened, and no schema exists yet. Zod 4 is installed for later request validation and is not used yet.

## Run

From the repository root:

```bash
npm run dev
```

Or start only the server:

```bash
npm run dev -w server
```

The server listens on http://localhost:3000.

```bash
curl http://localhost:3000/api/health
```

```json
{ "status": "ok" }
```

Unknown routes return HTTP 404. Invalid JSON returns HTTP 400. Unexpected failures return HTTP 500.

## Build

```bash
npm run build -w server
npm run start -w server
```

`start` runs the compiled `dist/index.js` file.
