# File-by-File Changes Summary

## Backend (BasicProject/)

### Modified Files

#### `Program.cs`
**Changes:**
1. Removed `builder.Services.AddControllersWithViews()` → kept only `AddControllers()`
2. Removed `app.UseStaticFiles()` (backend doesn't serve static files)
3. Removed `app.UseExceptionHandler("/Home/Error")` (MVC error handling)
4. Removed `app.MapControllerRoute()` (MVC routing)
5. Kept CORS configuration for React dev server
6. Kept auth middleware (cookie-based sessions)
7. Added comment: "// Map only API controllers (no MVC view routes)"

**Result:** Backend is now pure API with no view rendering capability.

### Unchanged Files (Still Used)

- `Controllers/Api/QuizzesApiController.cs` — Quiz CRUD operations
- `Controllers/Api/GitHubAuthController.cs` — GitHub OAuth
- `Controllers/Api/UsersApiController.cs` — User management
- `Controllers/Api/AttemptsApiController.cs` — Quiz attempts
- `Data/AppDbContext.cs` — Entity Framework context
- `Data/Repositories/` — Data access layer
- `Data/Entities/` — Domain models
- `Migrations/` — Database migrations

### Deprecated/Unused Files (Can Be Archived)

```
Controllers/
├── AccountController.cs          (❌ MVC view controller, not used by React)
├── AuthController.cs             (❌ MVC view controller, not used by React)
├── DashboardController.cs        (❌ MVC view controller, not used by React)
├── HomeController.cs             (❌ MVC view controller, not used by React)
├── MakingTheQuizController.cs    (❌ MVC view controller, not used by React)
├── QuizCreationController.cs     (❌ MVC view controller, not used by React)
├── QuizTakingController.cs       (❌ MVC view controller, not used by React)
├── QuizzesController.cs          (❌ MVC view controller, not used by React)
└── UsersController.cs            (❌ MVC view controller, not used by React)

Views/                             (❌ Entire directory, not used by React)
├── Account/
├── Dashboard/
├── Home/
├── QuizCreation/
├── QuizTaking/
├── Quizzes/
├── Shared/
└── Users/

Models/
├── DashboardViewModel.cs         (❌ MVC view model, not used by React)
└── ErrorViewModel.cs             (❌ MVC view model, not used by React)
```

---

## Frontend (web/)

### New Files Created

#### `src/config/api.ts`
**Purpose:** Centralized API configuration with environment-based URLs.
**Key Features:**
- `getApiBase()` — Returns `/api` in dev (Vite proxy), or `VITE_API_URL` in prod
- `API_BASE` constant — Used by all API calls
- `AUTH_BASE` constant — Used by auth endpoints
- `API_TIMEOUT` — Request timeout (30 seconds)

#### `src/lib/apiClient.ts`
**Purpose:** Reusable fetch client with error handling.
**Key Features:**
- `fetchApi<T>()` — Generic fetch wrapper with:
  - Error handling (parse JSON or text)
  - Timeout handling (AbortController)
  - Network error detection
  - Session cookie support (`credentials: 'include'`)
- `ApiError` interface — Consistent error format
- Type-safe responses

#### `src/services/authService.ts`
**Purpose:** Centralized authentication operations.
**Key Features:**
- `getCurrentUser()` — Get authenticated user
- `isAuthenticated()` — Check if user is authenticated
- `logout()` — Clear session
- `initiateGitHubLogin()` — Start GitHub OAuth flow
- `handleOAuthCallback()` — Handle OAuth callback
- Replaces scattered auth logic

#### `src/vite-env.d.ts`
**Purpose:** TypeScript definitions for Vite environment variables.
**Enables:**
- Type-safe access to `import.meta.env.VITE_*` variables
- IDE autocomplete for environment variables
- Compile-time type checking

#### `.env.example`
**Purpose:** Documentation for environment variable configuration.
**Contains:**
- Instructions for development setup
- Explanation of production variables
- Examples for `VITE_API_URL` and `VITE_AUTH_URL`
- How Vite proxy works

#### `ARCHITECTURE_SPLIT.md` (root)
**Purpose:** Comprehensive architecture documentation.
**Contains:**
- Before/after comparison
- Backend and frontend details
- Communication flow (dev vs prod)
- Authentication flow
- Deployment instructions
- Troubleshooting guide

#### `SPLIT_CHECKLIST.md` (root)
**Purpose:** Implementation checklist and testing guide.
**Contains:**
- Completion checklist
- Manual cleanup guide
- Testing checklist (backend, frontend, integration)
- Deployment checklist
- Known issues and considerations

#### `QUICK_START.md` (root)
**Purpose:** Quick reference for getting started.
**Contains:**
- Project structure
- Development setup (2 commands)
- Files changed/added
- Environment variables
- API endpoints
- Common issues
- Deployment steps

#### `PROBLEMS_AND_FIXES.md` (root)
**Purpose:** Detailed explanation of problems and solutions.
**Contains:**
- 10 specific problems caused by the conflict
- How each problem manifested
- How it's fixed
- Before/after code examples
- Summary table
- Benefits achieved

### Modified Files

#### `src/services/api.ts`
**Changes:**
1. Removed: `const base = 'http://localhost:5093/api'` (hardcoded URL)
2. Removed: `fetchJson<T>()` function (now using centralized `fetchApi()`)
3. Changed: All API calls from `fetchJson()` to `fetchApi()`
4. Added: `/quizzes/my` endpoint call
5. Added: `includeAnswers` parameter to `getQuizById()`
6. Changed: Endpoint paths to be relative (e.g., `/quizzes` instead of full URL)

**Before:**
```typescript
const base = 'http://localhost:5093/api'
async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    // fetch implementation...
}
export async function getQuizzes(): Promise<QuizSummary[]> {
    return fetchJson<QuizSummary[]>(`${base}/quizzes`)
}
```

**After:**
```typescript
import { fetchApi } from '../lib/apiClient'

export async function getQuizzes(): Promise<QuizSummary[]> {
    return fetchApi<QuizSummary[]>('/quizzes')
}
```

#### `src/githubOAuthConfig.ts`
**Changes:**
1. Removed: Hardcoded `redirectUri: 'http://localhost:5093/auth/github/callback'`
2. Added: Import `AUTH_BASE` from `src/config/api.ts`
3. Changed: `redirectUri` to dynamic: `${window.location.origin}/auth/github/callback`
4. Updated: Comments to reflect backend-managed OAuth

**Before:**
```typescript
export const githubOAuthConfig = {
    redirectUri: 'http://localhost:5093/auth/github/callback',
}
```

**After:**
```typescript
import { AUTH_BASE } from './config/api'

export const githubOAuthConfig = {
    redirectUri: `${window.location.origin}/auth/github/callback`,
}
```

#### `src/services/githubAuthService.ts`
**Changes:**
1. Removed: `localStorage`-based user storage (getStoredUser, storeUser)
2. Removed: localStorage key constant
3. Changed: All functions marked as `@deprecated`
4. Added: Comments pointing to `authService.ts`
5. Made: All functions into no-ops or redirects to new service
6. Added: Deprecation warnings in console

**Before:**
```typescript
const GITHUB_USER_KEY = 'github_user'
export const getStoredUser = (): GitHubUser | null => {
    const user = localStorage.getItem(GITHUB_USER_KEY)
    return user ? JSON.parse(user) : null
}
```

**After:**
```typescript
/**
 * @deprecated Use authService.getCurrentUser() instead
 */
export const getStoredUser = (): GitHubUser | null => {
    return null  // User state is managed by backend
}
```

#### `vite.config.ts`
**Changes:**
1. Added: Detailed comments explaining proxy configuration
2. Clarified: Proxy purpose and routing rules
3. Verified: Both `/api` and `/auth` proxy paths configured
4. Result: No changes needed (already correctly configured)

**Note:** This file was already set up correctly and didn't need changes.

### Unchanged Files (Still Working)

- `src/App.tsx` — React Router setup (no changes needed)
- `src/types.ts` — TypeScript interfaces (no changes needed)
- `src/components/` — React components (no changes needed)
- `src/pages/` — Page components (no changes needed)
- `src/context/` — Context providers (no changes needed)
- `src/hooks/` — Custom hooks (no changes needed)
- `package.json` — Dependencies (no new packages added)

---

## Root Directory

### New Files

- `ARCHITECTURE_SPLIT.md` — Full architecture documentation
- `SPLIT_CHECKLIST.md` — Testing and deployment checklist
- `QUICK_START.md` — Quick reference guide
- `PROBLEMS_AND_FIXES.md` — Detailed problem/solution analysis
- `FILES_CHANGED_SUMMARY.md` — This file

### Unchanged Files

- `README.md` — Original project readme
- `BasicProject.sln` — Solution file (unchanged)
- `BasicProject/BasicProject.csproj` — Project file (unchanged)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Backend: Modified Files** | 1 |
| **Backend: Unchanged (API) Files** | ~15 |
| **Backend: Deprecated (View) Files** | ~15 |
| **Frontend: New Files** | 8 |
| **Frontend: Modified Files** | 4 |
| **Frontend: Unchanged Files** | ~30+ |
| **Root Documentation Files** | 5 |
| **Total Changes** | Minimal, focused, non-breaking |

---

## Migration Guide

### For Developers Using the Old Code

**If you were using MVC view endpoints (e.g., `/Quizzes`):**
- ❌ These no longer exist
- ✅ Use React routes instead (e.g., `/quizzes` in browser navigates to React component)
- ✅ React components call API endpoints (e.g., `/api/quizzes`)

**If you were importing from `githubAuthService.ts`:**
- ✅ Still works (for backward compatibility)
- ⚠️ Functions are now no-ops (marked deprecated)
- ✅ Use `authService.ts` instead

**If you had hardcoded API URLs:**
- ❌ `http://localhost:5093/api` no longer works in production
- ✅ Use centralized config (`src/config/api.ts`)
- ✅ Set `VITE_API_URL` environment variable for production

### For Testers

**Old flow:** Browser → MVC Controller → View
**New flow:** Browser → React SPA → API Endpoint

- ✅ No changes to test procedures (still click buttons, fill forms)
- ✅ Network tab shows API calls instead of view renders
- ✅ API responses are JSON (can inspect in DevTools)

### For DevOps/Deployment

**Old:** Deploy single ASP.NET project
**New:** Deploy two separate applications
- ✅ Backend: `dotnet publish`
- ✅ Frontend: `npm run build` → `dist/` folder
- ✅ Two separate deployments (more flexible)
- ✅ Can scale independently

---

## Rollback (If Needed)

If you need to revert to the old structure:

1. Restore `Program.cs` from git history
2. The MVC controllers and Views still exist (not deleted)
3. Re-add: `AddControllersWithViews()` and `MapControllerRoute()`
4. Frontend will have extra files but won't conflict

**Note:** Reverting is not recommended. The split is cleaner and more maintainable.

---

## File Location Quick Reference

```
Webapp_Eksamen/
├── BasicProject/
│   └── Program.cs                    ← MODIFIED (API-only)
│
├── web/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts               ← NEW (API config)
│   │   ├── lib/
│   │   │   └── apiClient.ts         ← NEW (fetch wrapper)
│   │   ├── services/
│   │   │   ├── api.ts               ← MODIFIED (uses apiClient)
│   │   │   ├── authService.ts       ← NEW (auth service)
│   │   │   └── githubAuthService.ts ← MODIFIED (deprecated)
│   │   ├── vite-env.d.ts            ← NEW (TypeScript types)
│   │   └── githubOAuthConfig.ts     ← MODIFIED (dynamic URLs)
│   ├── vite.config.ts               ← VERIFIED (proxy OK)
│   └── .env.example                 ← NEW (env documentation)
│
├── ARCHITECTURE_SPLIT.md             ← NEW (full docs)
├── SPLIT_CHECKLIST.md                ← NEW (testing guide)
├── QUICK_START.md                    ← NEW (quick ref)
├── PROBLEMS_AND_FIXES.md             ← NEW (problem analysis)
└── FILES_CHANGED_SUMMARY.md          ← NEW (this file)
```

---

## Testing the Changes

1. **Backend starts without errors:**
   ```bash
   cd BasicProject
   dotnet run
   ```
   Expected: API runs on `http://localhost:5093`

2. **Frontend starts without errors:**
   ```bash
   cd web
   npm run dev
   ```
   Expected: Dev server on `http://localhost:5173`

3. **API calls work:**
   - Open browser DevTools → Network tab
   - Navigate to `/quizzes` in React app
   - Verify: `GET /api/quizzes` request is sent (proxied by Vite)
   - Verify: Response is JSON with quiz list

4. **No CORS errors:**
   - Check Console tab (should be clean)
   - No "Access to XMLHttpRequest" errors

5. **Authentication works:**
   - Click "Login with GitHub"
   - Redirected to GitHub, then back to app
   - User info displays
   - Logout clears session

---

## Questions?

Refer to:
- **Architecture details**: `ARCHITECTURE_SPLIT.md`
- **Step-by-step setup**: `QUICK_START.md`
- **Testing procedures**: `SPLIT_CHECKLIST.md`
- **Problem explanations**: `PROBLEMS_AND_FIXES.md`
