Engineering Decisions

This project is a small full-stack application built under a four-hour time constraint. I prioritized a simple architecture, clear separation of responsibilities, and a setup that can be run locally with minimal configuration.

1. Monorepo with npm Workspaces

I chose npm Workspaces to keep the Vue frontend and Node.js backend in one repository, with a single dependency installation and development command.

Tradeoff: This provides less tooling than a dedicated monorepo solution, but avoids unnecessary complexity for two small applications.

2. Express and SQLite Without an ORM

I chose Express for a lightweight API and SQLite for local persistence without requiring an external database service. Zod is included for request validation.

Tradeoff: SQLite is less suitable for a highly concurrent, distributed deployment, and writing SQL directly requires more care than using an ORM. For this assignment, the reduced setup and implementation overhead are worthwhile.

3. Vue 3 with TypeScript and Pinia

I chose Vue 3 with the Composition API, TypeScript, Vue Router, and Pinia to keep routing, application state, and UI components separate.

Tradeoff: Pinia adds a dependency, but provides a clear place to manage profile state shared between the list and detail screens.

RTL/LTR Handling

The profile details screen requires Hebrew labels alongside values such as email addresses, phone numbers, and Latin names. The intended approach is to use RTL for the Hebrew interface while explicitly isolating LTR values with appropriate dir attributes. Tailwind's logical spacing utilities help avoid direction-dependent layout rules.

Scope and Future Improvements

The implementation intentionally avoids authentication, deployment infrastructure, and a component library to stay focused on the assignment.

Potential future improvements include automated integration tests, pagination, and more robust handling of external API failures.