# React + TypeScript + Vite

This folder contains the single-page frontend built with React, TypeScript and Vite. The app provides a simple quiz system with pages for listing quizzes, taking quizzes, and creating them.

Prerequisites
- Node.js 18+ (or the version your project uses)
- npm or yarn

Quick start (Windows, bash)

Install dependencies:

```bash
cd web
npm install
```

Run the dev server (Vite):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

What you'll find in the app

- Home page
	- A landing page with high-level info and links to quizzes and profile.

- Quiz List
	- Shows all available quizzes with metadata (title, author, number of questions).
	- From here users can start taking a quiz or open details.

- Quiz Taking
	- Presents one question at a time or all at once depending on frontend settings.
	- Records answers and shows results after submission.

- Quiz Creation
	- A form-based interface to create quizzes, add questions and options, and save them.
	- Provides a preview or success page after creation.

Folder notes
- `src/` — main source. Look for `components/` and `pages/` which contain the UI pieces used across the app.
- `public/` — static assets.
- `package.json` — scripts and dependencies for running Vite and building the app.

## Project plan (phased)

This plan breaks the work into phases to meet the course requirements and recommended quality guidelines. Each phase lists goals, acceptance criteria, and verification steps.

### Phase 1 — Baseline & structure (1–2 days)
- Goals:
	- Ensure project builds and runs locally (frontend and backend).
	- Tidy code structure: modular components, clear folders for pages, components, services, and types.
	- Add this phased plan and checklists to the README.
- Acceptance criteria:
	- `npm run dev` starts without fatal errors.
	- `dotnet build` (solution `BasicProject.sln`) runs without errors or critical warnings.
	- Project file structure is documented in the README.
- Verification:
	- Frontend: in `web/` run `npm run build` (no build errors).
	- Backend: in the repo root run `dotnet build BasicProject/BasicProject.sln` (no build errors).

### Phase 2 — Core functionality (2–5 days)
- Goals:
	- Implement database operations for at least two entity types (excluding the authentication user entity). Example: `Quiz` and `Question` (or `Attempt`). Provide full CRUD flow for one entity via frontend.
	- Repository pattern and async database access in `BasicProject/Data/Repositories`.
	- API layer that separates controllers from business logic (service layer or repository usage from controllers).
	- Frontend: API service layer (separate http request handling from UI logic), list and detail pages for entities, conditional rendering and filtering.
- Acceptance criteria:
	- At least two entities persisted in database with migrations present.
	- CRUD endpoints exist and are exercised by the frontend (create, read, update, delete where applicable).
	- Repository classes are used (not direct DbContext calls from controllers), and methods are asynchronous.
	- Client-side filtering/conditional rendering implemented for at least one page (e.g., filter quizzes by author or difficulty).
- Verification:
	- Manual: create, edit, view, and delete an entity via the UI.
	- Automated: API endpoints return expected JSON and status codes.

### Phase 3 — UX, validation, and error handling (2–4 days)
- Goals:
	- Improve user experience: basic styling (not plain text), friendly navigation, dynamic content updates (no jarring page reloads), and accessible forms.
	- Client-side validation in forms (using TypeScript types + form validation library or custom checks).
	- Server-side validation and error handling with proper HTTP responses and server logs.
	- Centralized client-side API error handling and user-friendly messages.
- Acceptance criteria:
	- Forms validate inputs on the client and show helpful messages.
	- Server validates inputs and returns appropriate 4xx errors with structured error responses.
	- Console/server logs show errors when exceptions occur (use simple logging like built-in ASP.NET Core logging).
	- Navigation is consistent and usable; key pages reachable from header or menu.
- Verification:
	- Try invalid inputs in forms and confirm both client and server validation prevent bad data.
	- Check server logs for errors when API returns error responses.

### Phase 4 — Authentication, authorization & testing (2–4 days)
- Goals:
	- Authentication integrated (existing user auth in project). Implement authorization checks where needed; role-based auth is optional but recommended for extra points.
	- Write server-side unit tests for repository/service behavior. Provide at least 8 unit tests covering positive and negative cases for CRUD of one chosen entity.
- Acceptance criteria:
	- Auth flows work end-to-end (login, restricted actions require authentication).
	- At least 8 passing unit tests covering happy and failure paths for repository/service methods.
- Verification:
	- Run tests: `dotnet test` and confirm tests pass.
	- Confirm protected endpoints return 401/403 when unauthenticated/unauthorized.

### Phase 5 — Polish and extras (1–3 days)
- Goals:
	- Improve styling and responsive layout; add small UI improvements (toasts, spinners, better forms).
	- Add client-side unit or integration tests if desired (Jest/React Testing Library).
	- Add small extras: role-based UI, export/import, pagination, or nice-to-haves.
- Acceptance criteria:
	- UI is pleasant and reasonably responsive.
	- Optional tests pass for frontend.
- Verification:
	- Visual review and manual smoke tests across major flows.

## Mapping to course grading requirements (checklist)

- User experience:
	- [ ] Basic styling and structured layout (not bare buttons/text).
	- [ ] Dynamic content where appropriate (client-side state updates).
	- [ ] Friendly navigation (header/menu, breadcrumbs where useful).

- Coding style & warnings:
	- [ ] Clean, modular code and comments where helpful.
	- [ ] No build errors/warnings for backend and frontend (`dotnet build`, `npm run build`).

- Functionality:
	- [ ] Database operations for at least 2 entities (component + CRUD).
	- [ ] Conditional rendering and client-side filtering.
	- [ ] Forms with client-side validation.
	- [ ] Server-side validation and error handling with logging.
	- [ ] Repository pattern and async DB access used.
	- [ ] API service layer on the client.
	- [ ] Unit testing (>= 8 server-side tests covering CRUD positive and negative cases).
	- [ ] Authentication & (optional) role-based authorization.

If any item is only partially implemented, document it clearly in the README under a "Known gaps" section so grading reflects limitations.

## How to verify locally (useful commands)

From the repository root (Windows, bash):

```bash
# Frontend (web)
cd web
npm install       # first time
npm run build     # verify production build (should produce dist)
npm run dev       # run dev server for manual testing

# Backend (ASP.NET Core)
cd ../BasicProject
dotnet build BasicProject.sln    # verify backend builds
dotnet test                      # run server-side unit tests (if implemented)
```

Notes:
- If `dotnet test` is not yet configured, add tests under `BasicProject.Tests` or similar and wire up a test project targeting the same solution.

## Acceptance criteria (final submission)

Before submitting, ensure the following are satisfied and documented in the README or a short delivery note:

- All mandatory requirements are implemented and clearly documented.
- At least one entity has full CRUD with tests (>= 8 unit tests for server-side CRUD behavior where meaningful).
- Both `npm run build` and `dotnet build` succeed without critical errors.
- Basic, usable, and non-confusing UX with form validation and error handling.

## Next steps (recommended implementation checklist)

1. Implement repository + service layer for `Quiz` and `Question` (async methods).
2. Create frontend API service module (centralized fetch/axios wrapper) and use it in pages.
3. Build forms with client-side validation and show validation errors from server responses.
4. Add unit tests for repository/service layer (happy and unhappy paths), reach >= 8 tests.
5. Improve styling and navigation; add small UX touches (loading spinners, toasts).

## Known assumptions

- The existing authentication system will be used for login; the user entity used for authentication does not count among the two required entities for database operations.
- The plan assumes you can run `dotnet` and `npm` locally and have a development database available (e.g., localdb or SQLite configured in `appsettings.Development.json`).

## Final notes

This README update is a roadmap to meet the assignment requirements while keeping work incremental and testable. After you approve the plan I can help implement the phases, create the server tests, and wire up the client API service and validation.
