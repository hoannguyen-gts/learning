# Frontend Migration Specification: Vanilla JS to React + TypeScript + Tailwind v4

## 1. Project Overview
- **Objective:** Migrate an existing To-Do List application from Vanilla JS/HTML/CSS to a modern frontend stack.
- **Stack:**
  - Build tool: **Vite**
  - Framework: **React 18+**
  - Language: **TypeScript**
  - Styling: **Tailwind CSS v4** (Strictly use v4 syntax, avoid legacy v3 configs if not necessary).
- **Architecture/Routing:** Use conditional rendering (like the original app) or simple `react-router-dom` for 3 main views: Login, Signup, Todo List.

## 2. Core UI/UX & Styling Rules (Neo-brutalism)
The original CSS uses a "Neo-brutalist" design style. The AI **must** replicate this using Tailwind utility classes:
- **Borders:** Thick black borders (`border-2 border-black` or `border-[3px] border-black`).
- **Shadows:** Hard shadows instead of soft blurs (e.g., `shadow-[2px_2px_0px_#000]`).
- **Hover Effects:** Slight translation with shadow changes (e.g., `hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_#000]`).
- **Colors:**
  - Background: Light Blue/Gray (`bg-[#d5e1eb]`).
  - Primary text: Black/Slate-800 (`text-[#1e293b]`).
  - Buttons: Blue (`bg-blue-600`), Logout/Delete (`bg-red-500` hover `bg-red-600`).
  - Disabled state: `bg-slate-200 text-slate-400 cursor-not-allowed`.

## 3. TypeScript Interfaces (Data Models)
Ensure the following types are strictly used across components and API calls:

```typescript
export interface User {
  username: string;
  // add other fields if API returns them
}

export interface Todo {
  id: string | number;
  title: string;
  completed: boolean;
  created_at: string; // ISO string
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message?: string;
}
```

## 4. State Management & Authentication
- **Storage:** Use `localStorage` to store `access_token` and `currentUser`.
- **Global State:** Create an Authentication Context (`AuthContext`) or a custom hook (`useAuth`) to manage:
  - `user`: User | null
  - `isAuthenticated`: boolean
  - `login(token, user)`: function
  - `logout()`: function (clears localStorage, resets state).
- **API Wrapper (Fetch):** 
  - Create a utility function (e.g., `apiFetch` or `useFetch`) that automatically attaches the `Authorization: Bearer <token>` header to all requests.
  - **CRITICAL:** Implement a response interceptor/handler. If the API returns `401` or `403`, automatically trigger the `logout()` function, show an alert (`alert('Phiên đăng nhập hết hạn...')`), and redirect to Login.

## 5. View Requirements & Logic

### 5.1. Login View (`/login`)
- **Fields:** Username, Password.
- **API:** `POST /auth/login` (body: `{ identifier, password }`).
- **Logic:** On success, save token and user to localStorage -> redirect to Todo view. On fail, `alert` the error message.
- **UI Element:** Button to switch to Signup view.

### 5.2. Signup View (`/signup`)
- **Fields:** Username, Password, Confirm Password.
- **Validation (Before Submit):**
  - All fields are required.
  - Password and Confirm Password must match.
  - Password must be >= 3 characters.
- **API:** `POST /auth/register` (body: `{ username, password }`).
- **Logic:** On success, `alert` success message -> redirect to Login view.
- **UI Element:** Button to switch to Login view.

### 5.3. Todo View (`/todos` - Protected Route)
- **Header:** Displays "TODOS" and current logged-in username. Contains a Logout button.
- **Task Input Form:**
  - Input field for new task.
  - Submit button. **Must be disabled** if input is empty or contains only whitespaces. Button text changes to `...` while submitting.
  - **API:** `POST /todos` (body: `{ title: text }`). New task is added to the *top* of the list (unshift).
- **Task List:**
  - Fetch on mount: **API:** `GET /todos`.
  - Empty state: Show text `"Chưa có task nào. Hãy thêm task đầu tiên!"` if array is empty.
- **Task Item Component:**
  - Displays index and title.
  - Displays formatted date (Format: `DD/MM/YYYY HH:mm:ss`). Write a helper function for this.
  - Checkbox to toggle `completed` state. **API:** `PATCH /todos/:id` (body: `{ completed: boolean }`). If task is completed, apply line-through and gray out text.
  - Delete button. Prompts `confirm('Bạn có chắc muốn xoá task này?')` before executing. **API:** `DELETE /todos/:id`.

## 6. Recommended Folder Structure
```text
src/
├── assets/
├── components/
│   ├── ui/ (Button, Input shared components)
│   ├── TodoItem.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   └── useFetch.ts (handles Auth token and 401/403)
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── Todo.tsx
├── utils/
│   └── dateUtils.ts (formatDateTime logic)
├── App.tsx
├── main.tsx
└── index.css (Tailwind v4 imports)
```

## 7. Migration Steps for AI
1. **Step 1:** Initialize Tailwind v4 in `index.css` and create standard UI components (Input, Button) matching the Neo-brutalist style.
2. **Step 2:** Setup `AuthContext` and custom fetch wrapper to handle tokens and auto-logout logic.
3. **Step 3:** Implement Login and Signup pages with full validations.
4. **Step 4:** Implement Todo page, Date formatting helper, and Todo CRUD logic.
5. **Step 5:** Wire up routing (either via `react-router-dom` or state-based switching in `App.tsx`).

*Note to AI: DO NOT generate dummy data. Assume the REST API exists exactly as described in the requirements.*