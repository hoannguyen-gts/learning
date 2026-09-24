# Frontend Implementation Plan — ToDoList App

> **Project:** `learning` (TodoList full-stack)  
> **Stack:** Node.js / Express 5.2 + PostgreSQL 8.23 + Vanilla JS SPA (`public/`)  
> **Design Ref:** `ToDoList_frontend.png:1` (TODOS list + Login + Sign-up mocks)  
> **Last Commit:** `5eeb5fe` — `feat(auth,frontend): implement JWT auth flow and vanilla SPA frontend` (on top of `1696b7a`)  
> **Date:** 2026-09-24  
> **Status:** Implemented (vanilla SPA) + Planned migration path to modern framework  
> **Author:** hoan-gts

---

## 1. Executive Summary

The frontend is a **single-page application (SPA) without a framework**, served statically by Express (`server.js:12` — `express.static('public')`). It implements three views in one HTML file (`public/index.html:12`, `:33`, `:58`) toggled via `.hidden` (`public/style.css:186`) and `showView()` (`public/app.js:40`).

Goals:
1. Authenticate users (register / login) against `POST /auth/*` (`server.js:14`, `:45`) using JWT Bearer tokens.
2. Provide per-user isolated TODO CRUD (`GET/POST/PATCH/DELETE /todos` behind `authMiddleware.js:3`).
3. Match the visual design in `ToDoList_frontend.png:1` (black 2–3px borders, light ` #d5e1eb` background, blue primary buttons, red delete).
4. Remain zero-build (no Vite/React) for learning purposes, while documenting a clear upgrade path.

---

## 2. Current State Analysis (What’s Shipped)

### 2.1 Committed Scope (commit `5eeb5fe`)

| Area | File:Lines | What was done |
|------|-----------|---------------|
| Token parsing fix | `authMiddleware.js:13` | `split(' ')[25]` → `split(' ')[1]` — critical bug fixing auth always 403 |
| Auth API | `server.js:14-80` | `/auth/register` (trim, uniqueness, bcrypt 10, 201) and `/auth/login` (identifier, bcrypt.compare, `jwt.sign` 1h) |
| Protected todos | `server.js:82-142` | All `/todos` routes wrapped with `authMiddleware`, scoped by `req.user.id`, try/catch 500 |
| User repo | `userRepository.js:4-35` | `findByUsername` (rename fix), `findById`, `create` (VALUES fix), `delete`; returns `rows[0]` |
| Todo repo | `todoRepository.js:47-55` | `delete(id, userId)` adds `AND user_id = $2` |
| Views | `public/index.html:12-78` | 3 `<main>` sections, view switching buttons, forms with `required`, user display + logout |
| SPA logic | `public/app.js:1-397` | Full rewrite: DOM refs, localStorage state, `fetchWithAuth`, view router, auth handlers, CRUD |
| Styles | `public/style.css:232-298` | `.auth-container`, `.auth-card`, `.todo-header` flex, `.user-info-section`, `.logout-btn` |

### 2.2 Branch Divergence Note

- `master` is at `bb25194` (no auth). Feature history lives on detached chain `7863c56 → 7f54fab → 54b6adb → 1696b7a → 5eeb5fe`.
- **Action required:** `git checkout master; git merge 5eeb5fe --no-ff` or `git branch -f master 5eeb5fe` to unify. Plan file assumes merge.

---

## 3. Design Reference Breakdown (`ToDoList_frontend.png:1`)

Three mocks are stacked vertically:

1. **TODOS view (top):** Header `TODOS` left + `User: NQHoan` + red `Log out` right, thin border bottom; input row `Enter your task...` + disabled gray `Submit`; list item `1. Lau nhà / 10/09/2026 15:55:38` left, checkbox + red `Xóa` right; white card on `#d5e1eb` page.
2. **Login view (middle):** Centered card `ToDoList App` title, `Username:` / `Password:` rows with placeholders, blue `Login` large button bottom, `Sign up` blue small top-right.
3. **Signup view (bottom):** Same card + `Confirm Password:` third row, blue `Sign up` bottom, `Log in` top-right.

All use 2px black borders, bold labels, centered card max ~700px, 3px outer border.

---

## 4. Architecture Overview

```
Browser (public/index.html:1)
  ├─ #login-view (.auth-container)  ─┐
  ├─ #signup-view (.hidden)           ├─ showView() toggle (public/app.js:40)
  └─ #todo-view (.hidden)            ─┘
         │
         ├─ localStorage { access_token, currentUser } (public/app.js:32,148)
         ├─ fetchWithAuth() → adds Authorization: Bearer (public/app.js:77)
         └─ Express static + JSON API (server.js)
```

**No framework, no bundler.** One JS bundle (`public/app.js:1`) handles routing, state, API, rendering. CSS is single file with CSS vars (`public/style.css:2-11`).

**Chosen for learning:** minimal tooling, direct DOM APIs, explicit auth flow.

---

## 5. Tech Stack & File Map

| Layer | Choice | File | Lines |
|-------|--------|------|-------|
| Markup | HTML5 semantic | `public/index.html` | `public/index.html:1-82` |
| Logic | Vanilla JS (ES2020) | `public/app.js` | `public/app.js:1-397` |
| Style | Vanilla CSS, CSS vars, flexbox | `public/style.css` | `public/style.css:1-299` |
| Serving | Express static | `server.js:12` | `server.js:12` |
| Auth storage | localStorage (token + user JSON) | `public/app.js:32-38`, `102-105` | — |
| Date util | `formatDateTime()` dd/mm/yyyy hh:mm:ss | `public/app.js:63-71` | — |

No dependencies on frontend (`package.json:14-21` are backend only).

---

## 6. View / Component Specification

### 6.1 Routing Primitive

`showView(viewName)` (`public/app.js:40-60`) hides all mains via `.hidden` then unhides target. On `todo` it sets `usernameText` and calls `loadTasks()`. `init()` IIFE (`public/app.js:390-397`) picks initial view via `isAuthenticated()` (`public/app.js:36`).

No URL router; navigation is button-click only (`goToSignupBtn`/`goToLoginBtn` at `public/app.js:121-122`). History API is future work.

### 6.2 Login View (`public/index.html:12-30`)

- Elements: `login-form`, `login-username`, `login-password`, `go-to-signup-btn` (`public/app.js:10-22`)
- Handler: `handleLogin(e)` (`public/app.js:126-157`) → `POST /auth/login` `{identifier, password}` → store `access_token` + `currentUser` → `showView('todo')`. Validates non-empty; alerts Vietnamese messages.
- Styles: `.auth-container` (`public/style.css:232-240`: 700px centered, 3px black), `.auth-card`, `.auth-header-actions` flex-end, `.nav-switch-btn` blue `#0088cc` (`public/style.css:248`), `.form-group` flex row (`public/style.css:264`), `.auth-primary-btn` large blue `#0099e6` (`public/style.css:283`).

### 6.3 Signup View (`public/index.html:33-55`)

- Elements: `signup-form`, `signup-username`, `signup-password`, `signup-confirm-password`, `go-to-login-btn`
- Handler: `handleSignup(e)` (`public/app.js:159-196`) → validates required + `password === confirmPassword` + `length >=3` → `POST /auth/register` `{username, password}` → alert success → `showView('login')`.
- Same styles as login; extra row for confirm.

### 6.4 Todo View (`public/index.html:58-78`)

- Header: `.todo-header` flex space-between (`public/style.css:191-198`), `h1 TODOS`, `.user-info-section` + `logoutBtn` red (`public/style.css:214`). Username injected at `public/app.js:57`.
- Input: `#todo-form` flex gap 15px (`public/style.css:52`), `#task-input` flex 1 with 2px border (`public/style.css:58`), `#submit-btn` blue until disabled (`public/style.css:67-95`). Validation: `handleInputValidation()` (`public/app.js:114-117`) disables when `trim() === ""`; `input` event wired at `public/app.js:118`.
- List: `ul#task-list` flex column gap 15px (`public/style.css:99`). Rendered by `render()` (`public/app.js:225-282`).

#### Task Item Rendering (`public/app.js:239-278`)

```js
li.task-item(.completed) > div.task-content-wrapper > span.task-text ("1. title") + span.task-time (formatDateTime)
                      + div.task-actions > input.task-checkbox + button.delete-btn
```

- Hover: `box-shadow` + `translateY(-2px)` (`public/style.css:119`), completed: `bg-light` + `line-through` (`public/style.css:155-161`), delete red `#ef4444` (`public/style.css:171`).
- Actions: `checkbox change → toggleTask(id)` (`public/app.js:265`), `deleteBtn click → deleteTask(id)` (`public/app.js:270`).
- Empty state: centered li with `Chưa có task nào...` (`public/app.js:228-234`).

---

## 7. State Management & Data Flow

```
tasks: Task[]          (public/app.js:28, in-memory)
currentUser: {id, username} | null  (public/app.js:29, synced with localStorage)
access_token: string | null (localStorage, public/app.js:32)

User types → handleInputValidation → submitBtn.disabled
Submit → addTask (public/app.js:287) → fetchWithAuth POST /todos → unshift → render()
Checkbox → toggleTask (public/app.js:327) → PATCH /todos/:id {completed} → map update → render()
Delete → deleteTask (public/app.js:361) → confirm() → DELETE → filter → render()
loadTasks (public/app.js:202) → GET /todos → replace tasks → render()
logout (public/app.js:102) → clear storage + tasks + UI → showView('login')
```

- Persistence: only auth persists (localStorage). Tasks are server-sourced on each `showView('todo')`.
- No global store; re-render is full `taskListEl.innerHTML = ''` loop (`public/app.js:226`).

---

## 8. API Integration

### 8.1 Wrapper

`fetchWithAuth(url, options)` (`public/app.js:77-100`):
- Injects `Authorization: Bearer <token>` if present.
- Sets `Content-Type: application/json` for JSON bodies.
- Clones response on 401/403 to read message, alerts + `logout()` if authenticated, throws `Unauthorized` to suppress duplicate alerts.

### 8.2 Endpoints Consumed

| Method | Path | Auth | Body | Success | Error handling |
|--------|------|------|------|---------|----------------|
| POST | `/auth/register` | No | `{username, password}` | 201 `{message, user}` → alert + go login | 400 duplicate, 500 |
| POST | `/auth/login` | No | `{identifier, password}` | 200 `{access_token, user}` → store | 401 wrong creds, 400 missing |
| GET | `/todos` | Bearer | — | 200 `Task[]` ordered `created_at DESC` | 401/403 auto-logout |
| POST | `/todos` | Bearer | `{title}` | 201 `Task` | 400 empty title, 401 |
| PATCH | `/todos/:id` | Bearer | `{completed}` | 200 `Task` | 404, 401 |
| DELETE | `/todos/:id` | Bearer | — | 200 `{message}` | 404, 401 |

`Task` shape: `{id, title, completed, created_at}` (from `todoRepository.js:8,24,38`).

All calls are `fetch` with async/await; no Axios.

---

## 9. Styling System (`public/style.css:1-299`)

- **Vars** (`:root:2-11`): `--primary-color #1e293b`, `--border-color #000`, `--bg-light #d5e1eb`, `--disabled-bg/text`, `--delete-btn-bg/hover`, `--text-completed`.
- **Reset** (`* :13-18`): margin/padding 0, box-sizing, Arial.
- **Layout**: `body` flex, `min-height 100vh`, `padding 20px` (`public/style.css:22-30`). Cards are `width 100%` + `border 3px solid` + `border-radius 8px` + `padding 30px`.
- **Buttons**: Blue `#0099e6` → hover `#0f172a` + `translate(-2px,-2px)` + `box-shadow 2px` (`public/style.css:78`). Disabled gray (`public/style.css:90`). Delete red (`public/style.css:171`). Auth primary 1.5rem (`public/style.css:283`).
- **Responsive gap:** no media queries yet — future task (see §12 Phase 2).

Match verified against `ToDoList_frontend.png:1`; black borders and shadows replicate mocks.

---

## 10. Validation & Error Handling

| Area | Rule | Code |
|------|------|------|
| Login | both fields required (trim identifier) | `public/app.js:131-134` |
| Signup | all required, confirm match, len >=3 | `public/app.js:165-176` |
| Todo submit | `trim() === ""` early return + disabled btn | `public/app.js:289-290`, `114-117` |
| Delete | `confirm('Bạn có chắc...')` | `public/app.js:362` |
| API error | `!res.ok` → `alert(data.message)` | `public/app.js:143,186,305,371` |
| Auth expiry | `fetchWithAuth` 401/403 → alert + `logout()` | `public/app.js:88-97` |
| Network | catch → `console.error` + alert network msg | `public/app.js:153,193,313,349` |
| Date | `isNaN` guard before `formatDateTime` | `public/app.js:253` |

All messages are Vietnamese where design requires; consistent.

---

## 11. Security Considerations

- **JWT:** stored in `localStorage` (XSS-sensitive). Future: consider httpOnly cookie or refresh token flow. Secret is hardcoded `super_secret_jwt_key_12345` (`server.js:65`, `authMiddleware.js:16`) — **must move to `process.env.JWT_SECRET`**.
- **Password:** bcrypt 10 rounds (`server.js:29-31`), never echoed to client.
- **AuthZ:** todos scoped by `user_id` in SQL (`todoRepository.js:10,37,50`). Prevents IDOR.
- **Trim:** username trimming prevents `" admin "` duplicates (`server.js:24,33,53`).
- **CORS/CSRF:** not yet needed (same-origin static). Add `helmet` + `cors` when deploying.
- **Input:** no XSS sanitization on render (`textContent` is safe vs `innerHTML`); title is plain text (`public/app.js:248` uses `textContent`).

---

## 12. Implementation Roadmap (Phased)

### Phase 0 — Done (Vanilla SPA) — `5eeb5fe`
- [x] 3 views, view router, auth flow, todo CRUD, styles matching mocks.

### Phase 1 — Hardening (1–2 days) — No framework change
1. **Env & config:** `dotenv` for `JWT_SECRET`, `PORT`, `DATABASE_URL`; update `db.js:4-13` to read env.
2. **UX polish:** loading states (already `Submit` → `...` at `public/app.js:294`), toast instead of `alert`, inline form errors, disable auth buttons while pending.
3. **Responsive:** add `@media (max-width: 640px)` — stack `.form-group` vertically, reduce `.auth-container` padding.
4. **Branch fix:** merge `5eeb5fe` into `master`; add `git tag v0.1.0-vanilla`.
5. **Validation:** add username regex (alphanum, 3–20), password strength indicator.
6. **Tests:** add `tests/` with `vitest` + `supertest` for `server.js` auth + todos; add Playwright smoke for login→add→toggle→delete.

### Phase 2 — Refactor to Modern Frontend (1–2 weeks) — Recommended
**Goal:** migrate `public/` to `frontend/` with Vite + React + TypeScript while preserving design.

```
frontend/
  src/
    api/client.ts          # fetchWithAuth → axios/fetch wrapper with interceptor
    hooks/useAuth.ts       # token + user context
    stores/todoStore.ts    # Zustand or Redux Toolkit
    components/
      AuthCard.tsx, FormGroup.tsx, TodoItem.tsx, TodoList.tsx, Header.tsx
    views/LoginView.tsx, SignupView.tsx, TodoView.tsx
    routes/index.tsx       # react-router-dom
    styles/tokens.css      # migrate :root vars
    utils/formatDate.ts
  vite.config.ts
  tsconfig.json
```

Steps:
1. `npm create vite@latest frontend -- --template react-ts`
2. Migrate CSS vars and component styles to CSS Modules / Tailwind (keep 2px black borders).
3. Extract `showView` → `react-router-dom` (`/login`, `/signup`, `/todos`, `PrivateRoute`).
4. Extract `fetchWithAuth` → `api/client.ts` with `401` interceptor that clears store + redirects.
5. Extract state → `AuthContext` + `TodoStore`; replace `localStorage` with `zustand/persist`.
6. Type `Task` as `interface Task {id:number; title:string; completed:boolean; created_at:string}`.
7. Replace manual `render()` with declarative JSX; add optimistic updates for toggle/delete.
8. Add `react-hook-form` + `zod` for validation (replace ad-hoc alerts).
9. Keep Express serving `frontend/dist` in production (`server.js` static path update).

**Why React:** component reuse (AuthCard), routing, state isolation, testability — vanilla `public/app.js:225` re-render will not scale.

Alternatives considered: Vue 3 (similar), Svelte (smaller) — React chosen for ecosystem + hiring.

### Phase 3 — Features & Quality (backlog)
- Pagination / virtual list when `tasks` grows.
- Filters: All / Active / Completed, search by title.
- Edit title inline (`PATCH /todos/:id {title}` — backend needs new column update).
- Due dates, priority, tags.
- Real-time via WebSocket or polling.
- i18n (vi/en toggle — currently mixed).
- Accessibility: label `for`, aria, keyboard nav, focus management on view switch.
- PWA offline support (cache todos, sync on reconnect).

---

## 13. Testing Plan

| Level | Tool | Scope |
|-------|------|-------|
| Unit (backend) | `vitest` + `supertest` | `POST /auth/register` dup, `POST /auth/login` wrong pass, `GET /todos` without token 401, per-user isolation |
| Unit (frontend) | `vitest` + `jsdom` | `handleInputValidation`, `formatDateTime`, `fetchWithAuth` header injection |
| E2E | `Playwright` | signup → login → add 3 todos → check order newest first → toggle → delete → logout → 401 guard |
| Visual | `chromatic` or screenshot vs `ToDoList_frontend.png:1` | pixel diff for card, borders, buttons |
| Manual | Browser | trim check, empty submit disabled, confirm dialog, token expiry (wait 1h or mock) |

Add `npm run test`, `npm run test:e2e` to `package.json:6`.

---

## 14. Deployment & Ops

- **Dev:** `npm start` → `node server.js` on `http://localhost:3000` (`server.js:145`). Needs local Postgres `todo_db` with `users(id, username, password_hash)` and `todos(id, title, completed, created_at, user_id)`.
- **Prod:** Build frontend (`vite build` → `dist/`), serve via Express or Nginx; use `process.env.DATABASE_URL` + `process.env.JWT_SECRET`; run migrations (add `knex` or `node-pg-migrate`).
- **Docker:** `Dockerfile` with `node:20-alpine`, `EXPOSE 3000`, `CMD ["node","server.js"]`, `docker-compose` for `postgres:15`.
- **CI:** GitHub Actions — lint, test, build, push image.

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `localStorage` token XSS | High | Use `httpOnly` cookie + CSRF, sanitize, CSP header (Phase 1) |
| Hardcoded JWT secret | High | Move to env, rotate, shorten expiry |
| No pagination | Medium | Add `LIMIT/OFFSET` + UI pagination when >50 todos |
| Full re-render on each change | Medium | Framework migration Phase 2 or diff patching |
| Mixed vi/en messages | Low | Centralize i18n strings |
| Branch divergence master vs feature | Medium | Merge immediately; protect `master` branch |
| `authMiddleware.js:25` typo risk regression | Low | Add unit test for Bearer parsing |

---

## 16. Checklists

### Ship Checklist for `5eeb5fe` → `master`
- [ ] `git checkout master && git merge 5eeb5fe --no-ff -m "merge: auth+vanilla SPA"`
- [ ] `git push origin master`
- [ ] Verify `npm start` → login → add → toggle → delete → logout → token expiry
- [ ] Screenshot vs `ToDoList_frontend.png:1` side-by-side
- [ ] Add `JWT_SECRET` to `.env.example`

### Next Sprint (Phase 1)
- [ ] Env migration (`server.js:65`, `authMiddleware.js:16`)
- [ ] Toast system
- [ ] Responsive breakpoints
- [ ] Test harness + CI

---

## 17. Appendix — File Reference

```
C:\Users\Nguye\Documents\learning\
  server.js:1-147              # Express app + auth + todos
  authMiddleware.js:1-26       # Bearer verify
  userRepository.js:1-49       # users table
  todoRepository.js:1-59       # todos table
  db.js:1-24                   # pg Pool
  public/index.html:1-82       # 3-view markup
  public/app.js:1-397          # SPA logic
  public/style.css:1-299       # design system
  ToDoList_frontend.png        # design mock
  FRONTEND_IMPLEMENTATION_PLAN.md  # this file
  package.json:1-22            # deps: express, pg, bcrypt, jsonwebtoken, dotenv
```

---

*End of plan. Update this file as Phase 1/2 progresses; keep commit refs and line numbers current.*
