# Server

Express server for Action Item — User Profiles. Saved profiles are stored in SQLite.

## Prerequisites

- Node.js 22 LTS or newer (developed on Node.js 24.15.0)
- npm 11
- Dependencies installed from the repository root with `npm install`

`better-sqlite3` stores profiles. Zod 4 validates profile requests.

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

The database file is created at `server/data/profiles.sqlite` on startup. `*.sqlite` is gitignored. Set `DATABASE_PATH` to use a different file.

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Server health check |
| GET | `/api/profiles` | List saved profiles |
| GET | `/api/profiles/:id` | Get one saved profile |
| POST | `/api/profiles` | Save a profile (`201`, or `409` if the id already exists) |
| PATCH | `/api/profiles/:id` | Update `firstName` and/or `lastName` |
| DELETE | `/api/profiles/:id` | Delete a profile (`204`) |

Profile ids are UUIDs, matching Random User `login.uuid`. A profile also stores a required `title`, name, gender, email, phone, age, birth year, address, and picture URLs. Address text and postcode may be empty. Postcode may be sent as a string or a number and is stored as text. Picture URLs must use HTTP or HTTPS.

JSON errors use `{ "error": "..." }`. Unknown profiles return `404`. Invalid profile input returns `400`. Malformed JSON returns `400`. Unexpected failures return `500`.

## Build

```bash
npm run build -w server
npm run start -w server
```

`start` runs the compiled `dist/index.js` file.
