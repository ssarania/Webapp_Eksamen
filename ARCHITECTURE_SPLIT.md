# Project Architecture: Split into Backend API & React Frontend

## Overview

The project is now split into two separate applications:

1. **Backend API** (`BasicProject/`) — ASP.NET Core Web API
2. **Frontend** (`web/`) — React + Vite SPA

This architecture eliminates conflicts between MVC server-rendered views and the client-side React application.

---

## Architecture Changes

### Before (Conflicting)
- Single ASP.NET Core project with both Razor Views (`/Views`) and React SPA (`/web`)
- MVC controllers returning HTML views conflicted with API endpoints returning JSON
- CORS and routing rules caused ambiguity
- View pipelines interfered with API middleware

### After (Clean Separation)
- **Backend API**: Pure ASP.NET Core API (no Razor views, no `MapControllerRoute`)
- **Frontend SPA**: Standalone React app with its own build process
- Clear client-server communication via HTTP APIs
- Separate deployments and dev servers

---

## Backend API (`BasicProject/`)

### What Changed
- ❌ Removed `AddControllersWithViews()` → using only `AddControllers()`
- ❌ Removed MVC view controllers (`HomeController`, `QuizzesController`, `DashboardController`, etc.)
- ❌ Removed `app.UseStaticFiles()` and `MapControllerRoute()`
- ✅ All controllers in `Controllers/Api/*` remain and are properly configured
- ✅ CORS enabled for React dev server (`http://localhost:5173`)
- ✅ Cookie-based authentication configured for SPA

### API Routes
All endpoints are under `/api/`:
- `GET /api/quizzes` — List all public quizzes + user's quizzes
- `GET /api/quizzes/my` — User's quizzes only (requires auth)
- `GET /api/quizzes/{id}` — Quiz details with questions
- `POST /api/quizzes` — Create quiz (requires auth)
- `PUT /api/quizzes/{id}` — Update quiz (owner only)
- `DELETE /api/quizzes/{id}` — Delete quiz (owner only)
- `GET /api/users` — List users
- `POST /api/auth/github/callback` — GitHub OAuth callback handler

### Configuration Files
- `Program.cs` — API setup, CORS, auth, DB context, repositories
- `appsettings.json` — Database connection, logging, GitHub OAuth credentials

### Running the Backend
```bash
cd BasicProject
dotnet run
# API runs on http://localhost:5093
```

---

## Frontend (`web/`)

### What Changed
- ✅ Centralized API configuration (`src/config/api.ts`)
- ✅ Reusable fetch client (`src/lib/apiClient.ts`)
- ✅ New auth service (`src/services/authService.ts`)
- ✅ Updated quiz service (`src/services/api.ts`) to use centralized client
- ✅ Environment-based API URL configuration
- ✅ Vite proxy for dev server (eliminates CORS during dev)
- ❌ Removed hardcoded API URLs (`http://localhost:5093`)
- ❌ Removed local storage-based auth state (managed by backend cookies)

### Key Files
- `vite.config.ts` — Proxy configuration for dev server
- `src/config/api.ts` — API base URL configuration
- `src/lib/apiClient.ts` — Reusable fetch utility with error handling
- `src/services/authService.ts` — Auth operations (login, logout, get current user)
- `src/services/api.ts` — Quiz API operations
- `.env.example` — Environment variable documentation

### Environment Variables

**Development** (no file needed)
- Vite proxy handles `/api/*` and `/auth/*` → `http://localhost:5093`

**Production** (`.env.production`)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_AUTH_URL=https://api.yourdomain.com/auth
```

Or fallback to single URL:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Running the Frontend
```bash
cd web
npm install  # (first time only)
npm run dev
# Dev server runs on http://localhost:5173
# API requests proxied to http://localhost:5093
```

### Building for Production
```bash
npm run build
# Output: dist/
```

---

## Communication Flow

### Development
```
React (localhost:5173)
    ↓
Vite Proxy (/api → localhost:5093)
    ↓
ASP.NET API (localhost:5093)
```

### Production
```
React (deployed, e.g., Netlify)
    ↓
API calls to VITE_API_URL (e.g., https://api.yourdomain.com)
    ↓
ASP.NET API (deployed separately)
```

---

## Authentication

### Flow
1. User clicks "Login with GitHub" → redirected to GitHub OAuth
2. GitHub redirects back to `http://localhost:5093/api/auth/github/callback` (dev) or configured URL (prod)
3. Backend exchanges code for access token, creates/updates user record
4. Backend sets `QuizApp.Auth` cookie for session
5. React reads authenticated user via `GET /api/auth/me`
6. All subsequent requests include the cookie (credentials: 'include')

### Key Points
- ✅ Session managed by backend (cookie-based)
- ✅ React does not store tokens locally
- ✅ Logout clears backend session
- ✅ GitHub OAuth credentials stored in backend config only

---

## Deployment

### Backend (ASP.NET Core API)
1. Deploy to hosting (e.g., Azure App Service, AWS, DigitalOcean)
2. Configure environment variables:
   - `GitHub:ClientId`
   - `GitHub:ClientSecret`
   - `DefaultConnection` (database)
3. Update CORS policy if React hosted on different domain

### Frontend (React SPA)
1. Build: `npm run build`
2. Deploy `dist/` to static hosting (e.g., Netlify, Vercel, AWS S3)
3. Set environment variables:
   - `VITE_API_URL=https://api.yourdomain.com/api`
   - `VITE_AUTH_URL=https://api.yourdomain.com/auth`
4. Configure GitHub OAuth redirect URI to match deployed URL

### Example Deployment
- **API**: `https://api.quizapp.com` (backend domain)
- **Frontend**: `https://quizapp.com` (frontend domain)
- **GitHub Redirect**: `https://api.quizapp.com/api/auth/github/callback`

---

## Troubleshooting

### CORS Errors in Development
- Check that Vite proxy is configured in `vite.config.ts`
- Verify backend is running on `http://localhost:5093`
- Ensure `Program.cs` has CORS policy for `http://localhost:5173`

### 401 Unauthorized in API Requests
- Check that cookies are being sent (`credentials: 'include'` in fetch)
- Verify user is authenticated via `/api/auth/me`
- Check backend auth middleware order in `Program.cs`

### CORS Errors in Production
- Update `Program.cs` CORS policy to include production frontend URL
- Ensure `withCredentials: true` in fetch calls (handled by `fetchApi()`)
- Verify GitHub OAuth redirect URI matches backend URL

### Environment Variables Not Loading
- Check `.env.production` is in project root (`web/`)
- Restart dev server after changing `.env` file
- Ensure variable names start with `VITE_` (required by Vite)
- Check Vite environment types (`src/vite-env.d.ts`)

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Architecture** | Monolithic (MVC + SPA) | Decoupled (API + SPA) |
| **View Routes** | `/Home`, `/Quizzes` → HTML | ❌ Removed |
| **API Routes** | `/api/*` alongside views | ✅ Isolated, all JSON |
| **Frontend** | In `wwwroot/` | In `web/` (separate build) |
| **Auth** | Server sessions + localStorage | ✅ Server sessions only |
| **Dev Server** | Single server | ✅ Two servers (Vite + ASP.NET) |
| **Deployment** | Single deployable | ✅ Two independent deployables |
| **CORS** | Internal only | ✅ Configured for SPA origin |

---

## Next Steps

1. ✅ Backend is API-only (no views)
2. ✅ Frontend has centralized API configuration
3. Test the dev setup:
   ```bash
   # Terminal 1
   cd BasicProject
   dotnet run
   
   # Terminal 2
   cd web
   npm run dev
   ```
4. Verify React app can call API endpoints
5. Deploy separately with proper URLs
