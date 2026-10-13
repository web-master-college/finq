# Engineering Decisions

This project is a small full-stack application built under a four-hour time constraint. I prioritized a simple architecture, clear separation of responsibilities, and a setup that can be run locally with minimal configuration.

## 1. Monorepo with npm Workspaces

I chose npm Workspaces to keep the Vue frontend and Node.js backend in one repository, with a single dependency installation and development command.

Tradeoff: This provides less tooling than a dedicated monorepo solution, but avoids unnecessary complexity for two small applications.

## 2. Express and SQLite Without an ORM

I chose Express for a lightweight API and SQLite for local persistence without requiring an external database service. Zod is included for request validation.

Tradeoff: SQLite is less suitable for a highly concurrent, distributed deployment, and writing SQL directly requires more care than using an ORM. For this assignment, the reduced setup and implementation overhead are worthwhile.

## 3. Pinia for Shared Profile State

Fetched profiles and profiles loaded from the database live in one Pinia store. Fetch, History, and Profile Detail all read that store, so a save, rename, or delete is visible on the other screens without each view keeping its own copy.

Tradeoff: Pinia adds a dependency. Passing profiles through route state, or refetching them in every view, would duplicate the same data and make the detail actions harder to keep consistent.


## 4. Stable Profile Identity and Persistence-Driven Actions

I chose Random User's `login.uuid` as the stable profile identifier and SQLite primary key, allowing profiles fetched from the external API and profiles stored locally to share the same identity.

The UI determines whether to offer Save or Delete based on the profile's persistence state rather than the screen from which it was opened. This keeps the behavior consistent across Fetch and History.

**Tradeoff:** The client must handle cases where a profile already exists in SQLite but its local state is not yet synchronized. The API returns `409 Conflict`, and the client recovers by loading the existing profile instead of creating a duplicate.


## Search

Fetch and History share one search box. The query is local component state, and the list filters on each keystroke with no debounce. Matching is case- and accent-insensitive against the title plus name, and against country.

**Reasoning:** Filtering only 10 local profiles is inexpensive, so debouncing would introduce unnecessary input lag.
**Tradeoff:** The search query is intentionally not persisted and resets when navigating away from the screen.

## RTL and LTR

The profile detail screen sets `dir="rtl"` on its own section, so Hebrew labels, the form, and the action row flow right to left. The rest of the application stays LTR. In that row the first control is the rightmost one: Save or Delete, then Update to its left.

Latin values and the name inputs set `dir="ltr"` so characters stay in Latin reading order. `text-right` aligns that text under the Hebrew label. Tailwind logical spacing keeps padding consistent in both directions. Save and Delete share one slot based on database persistence. The `from` query only chooses where Back returns.

## Tailwind CSS

I styled the screens with Tailwind utilities and did not add a component library. The interface is small, and utilities avoided a second design system.

## Shortcuts

- SQLite is created with `CREATE TABLE IF NOT EXISTS` and has no migrations. A production database would version the schema.
- Invalid requests return a generic validation error. A production API would identify the invalid fields.
- One bad Random User record rejects the whole batch. A production import could drop that record and keep the rest.
- Fetched profiles live in memory for the session. A production client could keep that list across reloads.
- Delete asks with the browser's native `window.confirm`. A production screen could use its own dialog.

## Automated Tests

The required 30-minute extension is a Vitest suite: profile API tests on a temporary SQLite file, mapping and search unit tests, and component tests for saving, delete confirmation, and renaming an unsaved profile. I chose that over a browser end-to-end suite because the timebox is short, and these tests stay independent of Random User and the development database. With one more hour I would add a browser test that fetches a profile, saves it, finds it in History, and deletes it.

## Scope

The implementation leaves out authentication and deployment infrastructure. Pagination is a possible later improvement.
