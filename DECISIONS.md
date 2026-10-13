Engineering Decisions

This project is a small full-stack application built under a four-hour time constraint. I prioritized a simple architecture, clear separation of responsibilities, and a setup that can be run locally with minimal configuration.

1. Monorepo with npm Workspaces

I chose npm Workspaces to keep the Vue frontend and Node.js backend in one repository, with a single dependency installation and development command.

Tradeoff: This provides less tooling than a dedicated monorepo solution, but avoids unnecessary complexity for two small applications.

2. Express and SQLite Without an ORM

I chose Express for a lightweight API and SQLite for local persistence without requiring an external database service. Zod is included for request validation.

Tradeoff: SQLite is less suitable for a highly concurrent, distributed deployment, and writing SQL directly requires more care than using an ORM. For this assignment, the reduced setup and implementation overhead are worthwhile.

3. Pinia for Shared Profile State

Fetched profiles and profiles loaded from the database live in one Pinia store. Fetch, History, and Profile Detail all read that store, so a save, rename, or delete is visible on the other screens without each view keeping its own copy.

Tradeoff: Pinia adds a dependency. Passing profiles through route state, or refetching them in every view, would duplicate the same data and make the detail actions harder to keep consistent.

RTL/LTR Handling

The profile detail screen sets `dir="rtl"` on its own section, so Hebrew labels, the form, and the action row flow right to left. The rest of the application stays LTR. In that row the first control is the rightmost one: Save or Delete, then Update to its left.

Latin values and the name inputs set `dir="ltr"` so characters stay in Latin reading order — an email or a street number is not reversed. `text-right` then aligns that text with the right edge, directly under the Hebrew label. Tailwind logical spacing keeps padding consistent in both directions.

Save and Delete occupy the same slot, but which one appears depends on whether the profile is stored in the database, not on whether the user arrived from Fetch or History. The `from` query only chooses the screen that Back returns to.

Scope and Future Improvements

The implementation intentionally avoids authentication, deployment infrastructure, and a component library to stay focused on the assignment.

Potential future improvements include automated integration tests, pagination, and more robust handling of external API failures.