# Action Item — User Profiles

Vue 3 and Node.js home assignment. The client and server run together from the repository root. Fetch, History, and profile detail actions are implemented.

## Prerequisites

- Node.js 22 LTS or newer. This project was set up on Node.js 24.15.0.
- npm 11

`better-sqlite3` requires Node.js 22 or newer. Node.js 24 is the Active LTS line used here.

## Setup

```bash
npm install
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000
- Proxied health check: http://localhost:5173/api/health

The home page calls `/api/health` through the Vite dev proxy and shows whether the backend is reachable.

## Scripts

| Command             | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `npm install`       | Install workspace dependencies              |
| `npm run dev`       | Start the client and server with hot reload |
| `npm run build`     | Build the client and server                 |
| `npm run typecheck` | Type-check both workspaces                  |
| `npm run lint`      | Run ESLint                                  |
| `npm run format`    | Format the repository with Prettier         |
| `npm test`          | Run the automated tests                     |

## Tests

```bash
npm test
```

Vitest runs the client and server suites. The tests cover:

- Profile API integration: create, read, update, delete, validation, and id conflicts. These tests persist through a temporary SQLite database and do not use the development database.
- Random User mapping and profile search.
- The profile detail confirmation that stops a second click on Save from deleting the profile.

## Layout

```text
/
├── client/          Vue 3 application
├── server/          Express application
├── DECISIONS.md
└── AI_USAGE.md
```
